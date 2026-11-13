import { createHash } from "node:crypto";
import { get, put } from "@vercel/blob";
import { assertOwner } from "../portal/desk";
import { publicMember } from "../portal/auth";
import { editPrivate, namespace, readPrivate, requireValue } from "../portal/store";
import type { Account } from "../portal/types";
import { authorizeProject } from "./service";
import { commercialProject, readCommercial } from "./commercial";
import { command } from "./domain";
import { emptyDelivery } from "./types";
import type { Artifact } from "./milestones";

export const maxArtifactBytes = 3 * 1024 * 1024;
const digest = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
export async function boundedBytes(stream: ReadableStream<Uint8Array> | null, limit: number) {
  requireValue(stream, "File content is required.");
  const reader = stream.getReader(),
    chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        requireValue(false, "File is too large. Use a file up to 3 MB.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
export function inspectArtifact(name: string, type: string, bytes: Uint8Array) {
  requireValue(
    bytes.byteLength > 0 && bytes.byteLength <= maxArtifactBytes,
    "Choose a nonempty file up to 3 MB.",
    413,
  );
  const data = Buffer.from(bytes),
    suffix = name.split(".").at(-1)?.toLowerCase();
  const valid =
    (type === "image/png" &&
      suffix === "png" &&
      data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (type === "image/jpeg" &&
      ["jpg", "jpeg"].includes(suffix || "") &&
      data[0] === 255 &&
      data[1] === 216 &&
      data[2] === 255) ||
    (type === "image/webp" &&
      suffix === "webp" &&
      data.subarray(0, 4).toString() === "RIFF" &&
      data.subarray(8, 12).toString() === "WEBP") ||
    (type === "application/pdf" &&
      suffix === "pdf" &&
      data.subarray(0, 5).toString() === "%PDF-" &&
      !/\/(?:JavaScript|JS|Launch|EmbeddedFile|RichMedia)\b/i.test(data.toString("latin1"))) ||
    (type === "text/plain" &&
      suffix === "txt" &&
      !data.includes(0) &&
      !/<(?:!doctype|html|script|svg)\b/i.test(data.toString("utf8")));
  requireValue(
    valid,
    "Use a matching PDF, PNG, JPEG, WebP or plain-text file. Active documents and other file types are not accepted.",
  );
  return {
    name: name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150),
    type,
    size: data.length,
    sha256: digest(data),
  };
}
export async function publishArtifact(
  me: Account,
  cookie: string | null,
  input: Record<string, unknown>,
  file: { name: string; type: string; bytes: Uint8Array },
) {
  assertOwner(me);
  const { client, project, key } = await authorizeProject(me, input);
  requireValue(input.action === "publish-version", "Use the publication action.");
  const details = inspectArtifact(file.name, file.type, file.bytes);
  requireValue(
    typeof input.operation === "string" && /^[a-f0-9-]{36}$/.test(input.operation),
    "Invalid operation identifier.",
  );
  const artifact: Artifact = {
    ...details,
    key: `${namespace()}/delivery/artifacts/${client.id}/${project.id}/${input.operation}-${details.sha256}`,
  };
  // Include server-computed evidence in the operation digest, never browser metadata.
  const payload = { ...input, artifact: { ...details, key: artifact.key } };
  const commercial = commercialProject(
    await readCommercial(client.id, cookie),
    client.id,
    project.id,
  );
  const context = { clientId: client.id, artifact };
  const state = await readPrivate(key, emptyDelivery);
  command(structuredClone(state), publicMember(me), project, commercial, payload, context);
  // Check for a completed retry before uploading. Never overwrite or delete a published object.
  if (!state.operations.some((o) => o.id === input.operation)) {
    try {
      await put(artifact.key, Buffer.from(file.bytes), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/octet-stream",
      });
    } catch (error) {
      // Handles an existing immutable object or an uncertain successful write.
      const existing = await get(artifact.key, { access: "private", useCache: false });
      if (!existing || existing.statusCode !== 200) throw error;
      const bytes = await boundedBytes(existing.stream, maxArtifactBytes);
      requireValue(
        bytes.length === artifact.size && digest(bytes) === artifact.sha256,
        "Stored artifact integrity check failed.",
        409,
      );
    }
  }
  await editPrivate(key, emptyDelivery, (current) =>
    command(current, publicMember(me), project, commercial, payload, context),
  );
  return { ok: true };
}
export async function downloadArtifact(me: Account, input: Record<string, unknown>) {
  const { key } = await authorizeProject(me, input);
  const state = await readPrivate(key, emptyDelivery);
  const project = state.projects.find((p) => p.project === input.project);
  const version = project?.milestones
    ?.flatMap((m) => m.versions)
    .find((v) => v.id === input.version);
  requireValue(version, "Deliverable not found.", 404);
  const file = await get(version.artifact.key, { access: "private", useCache: false });
  requireValue(file?.statusCode === 200, "Deliverable file is unavailable.", 503);
  const bytes = await boundedBytes(file.stream, maxArtifactBytes);
  requireValue(
    bytes.length === version.artifact.size && digest(bytes) === version.artifact.sha256,
    "The stored file failed its integrity check. Contact Kenan.",
    503,
  );
  return { bytes, artifact: version.artifact };
}
