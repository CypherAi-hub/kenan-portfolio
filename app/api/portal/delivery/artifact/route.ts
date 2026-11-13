import { identity, origin } from "@/lib/portal/auth";
import { assertOwner } from "@/lib/portal/desk";
import { PortalError, requireValue } from "@/lib/portal/store";
import {
  boundedBytes,
  downloadArtifact,
  maxArtifactBytes,
  publishArtifact,
} from "@/lib/delivery/artifacts";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const failure = (e: unknown) =>
  Response.json(
    {
      error:
        e instanceof PortalError
          ? e.message
          : "The deliverable could not be loaded or published. Keep your file and refresh before retrying.",
    },
    { status: e instanceof PortalError ? e.status : 503, headers },
  );
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Invalid request origin.", 403);
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    assertOwner(me);
    const contentType = request.headers.get("content-type") || "";
    requireValue(contentType.startsWith("multipart/form-data;"), "Expected a file upload.", 415);
    requireValue(
      Number(request.headers.get("content-length") || 0) <= maxArtifactBytes + 20000,
      "File is too large.",
      413,
    );
    const bytes = await boundedBytes(request.body, maxArtifactBytes + 20000);
    let form: FormData;
    try {
      form = await new Response(new Uint8Array(bytes), {
        headers: { "content-type": contentType },
      }).formData();
    } catch {
      throw new PortalError("Invalid file upload.");
    }
    requireValue([...form].length === 2, "Upload one file and its publication details.");
    const raw = form.get("input"),
      file = form.get("file");
    requireValue(
      typeof raw === "string" && raw.length <= 12000 && file instanceof File,
      "Publication details and one file are required.",
    );
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      throw new PortalError("Invalid publication details.");
    }
    requireValue(
      input && typeof input === "object" && !Array.isArray(input),
      "Invalid publication details.",
    );
    return Response.json(
      await publishArtifact(me, request.headers.get("cookie"), input, {
        name: file.name,
        type: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
      }),
      { headers },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function GET(request: Request) {
  try {
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    const query = new URL(request.url).searchParams;
    const { bytes, artifact } = await downloadArtifact(me, {
      client: query.get("client"),
      project: query.get("project"),
      version: query.get("version"),
    });
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(bytes.length),
        "Content-Disposition": `attachment; filename="${artifact.name}"`,
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "X-Checksum-SHA256": artifact.sha256,
      },
    });
  } catch (e) {
    return failure(e);
  }
}
