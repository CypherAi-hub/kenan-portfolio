import { identity, origin } from "@/lib/portal/auth";
import { readBody } from "@/lib/portal/request";
import { PortalError, requireValue } from "@/lib/portal/store";
import { deliveryAction, deliveryView } from "@/lib/delivery/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
const failure = (error: unknown) => {
  if (!(error instanceof PortalError))
    console.error(
      "Delivery service unavailable:",
      error instanceof Error ? error.constructor.name : "Unknown failure",
    );
  return json(
    {
      error:
        error instanceof PortalError
          ? error.message
          : "The delivery workspace could not be loaded or saved. Please retry.",
    },
    error instanceof PortalError ? error.status : 503,
  );
};
export async function GET(request: Request) {
  try {
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    return json(await deliveryView(me, request.headers.get("cookie")));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Invalid request origin.", 403);
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    requireValue(
      request.headers.get("content-type")?.startsWith("application/json"),
      "Expected JSON.",
      415,
    );
    let input;
    try {
      input = JSON.parse(await readBody(request, 12000));
    } catch (error) {
      if (error instanceof PortalError) throw error;
      throw new PortalError("Invalid JSON request.");
    }
    requireValue(input && typeof input === "object" && !Array.isArray(input), "Invalid request.");
    return json(await deliveryAction(me, request.headers.get("cookie"), input));
  } catch (error) {
    return failure(error);
  }
}
