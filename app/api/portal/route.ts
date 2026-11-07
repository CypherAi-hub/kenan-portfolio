import { readBody } from "@/lib/portal/request";
import { identity, begin, finish, signOut, origin } from "@/lib/portal/auth";
import { view, mutate } from "@/lib/portal/service";
import { requireValue, PortalError } from "@/lib/portal/store";
export const dynamic = "force-dynamic";
const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
function failure(error: unknown) {
  if (error instanceof PortalError) return json({ error: error.message }, error.status);
  return json(
    { error: "The workspace could not complete this request. Refresh and try again." },
    503,
  );
}
export async function GET(request: Request) {
  try {
    const me = await identity();
    requireValue(me, "Sign in to your workspace.", 401);
    return json(await view(me, new URL(request.url).searchParams.get("client")));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Request origin is invalid.", 403);
    requireValue(
      request.headers.get("content-type")?.startsWith("application/json"),
      "Expected JSON.",
      415,
    );
    const raw = await readBody(request, 65536);
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      throw new PortalError("Unreadable request.");
    }
    requireValue(
      input && typeof input === "object" && !Array.isArray(input),
      "Unreadable request.",
    );
    if (input.action === "begin")
      return json(await begin(input.invite, input.audience ?? "client"));
    if (input.action === "finish") {
      try {
        await finish(input.response, input.invite);
      } catch (e) {
        if (e instanceof PortalError) throw e;
        throw new PortalError("Passkey verification failed. Try signing in again.", 403);
      }
      return json({ ok: true });
    }
    if (input.action === "logout") {
      await signOut();
      return json({ ok: true });
    }
    const me = await identity();
    requireValue(me, "Sign in again to continue.", 401);
    return json(await mutate(me, input));
  } catch (error) {
    return failure(error);
  }
}
