import { googleStatus, connectGoogle, verifyGoogleConnection } from "@/lib/portal/google";
import { identity, origin } from "@/lib/portal/auth";
import {
  assertOwner,
  appointmentView,
  requestAppointment,
  reviewAppointment,
} from "@/lib/portal/desk";
import { askAssistant, applyProposal } from "@/lib/portal/assistant";
import { readBody } from "@/lib/portal/request";
import { PortalError, requireValue } from "@/lib/portal/store";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET() {
  try {
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    return json({
      appointments: await appointmentView(me),
      ...(me.role === "owner" ? { google: await googleStatus(me) } : {}),
    });
  } catch (error) {
    return json(
      { error: error instanceof PortalError ? error.message : "Unable to load appointments." },
      error instanceof PortalError ? error.status : 503,
    );
  }
}
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Invalid origin.", 403);
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    requireValue(
      request.headers.get("content-type")?.startsWith("application/json"),
      "Expected JSON.",
      415,
    );
    let input;
    try {
      input = JSON.parse(await readBody(request, 50000));
    } catch (e) {
      if (e instanceof PortalError) throw e;
      throw new PortalError("Invalid request.");
    }
    requireValue(input && typeof input === "object" && !Array.isArray(input), "Invalid request.");
    if (input.action === "request-appointment") return json(await requestAppointment(me, input));
    assertOwner(me);
    if (input.action === "verify-google") return json(await verifyGoogleConnection(me));
    if (input.action === "connect-google") return json(await connectGoogle(me));
    if (input.action === "review-appointment") return json(await reviewAppointment(me, input));
    if (input.action === "apply") return json(await applyProposal(me, input.id));
    requireValue(input.action === "ask", "Unknown assistant action.");
    return json(await askAssistant(me, input));
  } catch (error) {
    return json(
      { error: error instanceof PortalError ? error.message : "Unable to complete this request." },
      error instanceof PortalError ? error.status : 503,
    );
  }
}
