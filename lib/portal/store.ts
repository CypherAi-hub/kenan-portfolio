import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import type { Directory, Workspace } from "./types";

export class PortalError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function requireValue(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new PortalError(message, status);
}
export function namespace() {
  return process.env.PORTAL_NAMESPACE || "kjl-studio-v1";
}
async function load<T>(path: string, initial: () => T) {
  const item = await get(namespace() + "/" + path + ".json", {
    access: "private",
    useCache: false,
  });
  if (!item) return { value: initial(), etag: undefined };
  if (item.statusCode !== 200) throw new Error("Workspace read failed");
  const value: T = await new Response(item.stream).json();
  // The private CDN adds W/ when Brotli encodes a response. The write API compares the origin ETag.
  return { value, etag: item.blob.etag.replace(/^W\//, "") };
}
async function change<T, R>(path: string, initial: () => T, apply: (value: T) => R) {
  for (let retry = 0; retry < 6; retry++) {
    const { value, etag } = await load(path, initial);
    const result = apply(value);
    try {
      await put(namespace() + "/" + path + ".json", JSON.stringify(value), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: !!etag,
        ifMatch: etag,
        contentType: "application/json",
      });
      return result;
    } catch (error) {
      const conflict =
        error instanceof BlobPreconditionFailedError ||
        (error instanceof Error &&
          /conditional request cannot succeed due to a conflicting operation against this resource/i.test(
            error.message,
          )) ||
        (!etag && error instanceof Error && /already exists|overwrite/i.test(error.message));
      if (!conflict) throw error;
      // Blob can reject simultaneous conditional writes while a prior write is still settling.
      // Reload and reapply against its current ETag after a short bounded backoff.
      if (retry < 5)
        await new Promise((resolve) =>
          setTimeout(resolve, 30 * (retry + 1) + Math.floor(Math.random() * 40)),
        );
    }
  }
  throw new PortalError("Someone else just updated this workspace. Please try again.", 409);
}
const emptyDirectory = (): Directory => ({ accounts: [] });
const emptyWorkspace = (): Workspace => ({ projects: [] });
export const directory = async () => (await load("accounts", emptyDirectory)).value;
export const editDirectory = <R>(apply: (value: Directory) => R) =>
  change("accounts", emptyDirectory, apply);
function workspaceKey(id: string) {
  requireValue(/^[a-f0-9-]{36}$/.test(id), "Unknown client.", 404);
  return "clients/" + id;
}
export const workspace = async (id: string) => (await load(workspaceKey(id), emptyWorkspace)).value;
export const editWorkspace = <R>(id: string, apply: (value: Workspace) => R) =>
  change(workspaceKey(id), emptyWorkspace, apply);

export const readPrivate = async <T>(key: string, initial: () => T) =>
  (await load(key, initial)).value;
export const editPrivate = <T, R>(key: string, initial: () => T, apply: (value: T) => R) =>
  change(key, initial, apply);
