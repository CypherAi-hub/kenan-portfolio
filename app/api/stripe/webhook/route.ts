import { readBody } from "@/lib/portal/request";
import { recordPaid, recordDelayed, verifiedEvent } from "@/lib/portal/billing";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature required", { status: 400 });
  let event;
  try {
    event = verifiedEvent(await readBody(request, 1048576), signature);
  } catch {
    return new Response("Invalid signature or configuration", { status: 400 });
  }
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      if (event.data.object.payment_status === "paid") await recordPaid(event.data.object);
      else await recordDelayed(event.data.object);
    } catch {
      return new Response("Payment could not be reconciled", { status: 500 });
    }
  }
  if (event.type === "checkout.session.async_payment_failed") {
    try {
      await recordDelayed(event.data.object, true);
    } catch {
      return new Response("Payment could not be reconciled", { status: 500 });
    }
  }
  return Response.json({ received: true });
}
