import { requireValue } from "./store";
export async function readBody(request: Request, limit: number) {
  requireValue(
    Number(request.headers.get("content-length") || 0) <= limit,
    "Request is too large.",
    413,
  );
  const reader = request.body?.getReader();
  requireValue(reader, "Request body is required.");
  const text = new TextDecoder();
  let size = 0,
    body = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        requireValue(false, "Request is too large.", 413);
      }
      body += text.decode(chunk.value, { stream: true });
    }
    return body + text.decode();
  } finally {
    reader.releaseLock();
  }
}
