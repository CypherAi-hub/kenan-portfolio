import Stripe from "stripe";
import { editWorkspace, requireValue, workspace } from "./store";
import { origin } from "./auth";
import type { Payment, Project, Workspace } from "./types";

export function paymentMode() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!process.env.STRIPE_WEBHOOK_SECRET) return "offline";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  if (/^(sk|rk|rkcs)_test_/.test(key)) return "sandbox";
  return "offline";
}
function stripe() {
  requireValue(
    paymentMode() !== "offline",
    "Card payments are being connected. Contact Kenan about this request.",
    503,
  );
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { maxNetworkRetries: 2 });
}
export function invoiceIn(
  data: Workspace,
  projectId: string,
  id: string,
): { project: Project; bill: Payment } {
  const project = data.projects.find((p) => p.id === projectId);
  const bill = project?.payments.find((p) => p.id === id);
  requireValue(project && bill, "Payment request not found.", 404);
  return { project, bill };
}
export async function recordPaid(session: Stripe.Checkout.Session) {
  const tags = session.metadata;
  if (tags?.studio !== "kjl" || session.payment_status !== "paid") return;
  requireValue(
    session.mode === "payment" && session.livemode === (paymentMode() === "live"),
    "Payment mode mismatch.",
    409,
  );
  await editWorkspace(tags.client, (w) => {
    const { bill } = invoiceIn(w, tags.project, tags.bill);
    requireValue(
      bill.cents === session.amount_total &&
        session.currency === "usd" &&
        session.client_reference_id === bill.id &&
        String(bill.attempt) === tags.attempt &&
        (!bill.sessionId || bill.sessionId === session.id),
      "Payment details do not match the request.",
      409,
    );
    if (bill.status === "paid") return;
    bill.sessionId = session.id;
    bill.paidAt = new Date().toISOString();
    bill.status = "paid";
    bill.test = !session.livemode;
  });
}
export async function checkout(client: string, projectId: string, id: string, email: string) {
  const api = stripe();
  const { project, bill } = invoiceIn(await workspace(client), projectId, id);
  requireValue(bill.status === "open", "This request has already been paid.", 409);
  if (bill.sessionId) {
    const prior = await api.checkout.sessions.retrieve(bill.sessionId);
    if (prior.payment_status === "paid") {
      await recordPaid(prior);
      return { paid: true };
    }
    if (prior.status === "open" && prior.url) return { url: prior.url };
    requireValue(prior.status === "expired", "Payment is processing. Check back shortly.", 409);
    await editWorkspace(client, (w) => {
      const current = invoiceIn(w, projectId, id).bill;
      if (current.status === "open" && current.sessionId === prior.id) {
        delete current.sessionId;
        delete current.startedAt;
        current.attempt++;
      }
    });
    return checkout(client, projectId, id, email);
  }
  await editWorkspace(client, (w) => {
    const current = invoiceIn(w, projectId, id).bill;
    requireValue(
      current.status === "open" && current.attempt === bill.attempt,
      "The request changed. Refresh and try again.",
      409,
    );
    requireValue(
      !current.startedAt || Date.now() - current.startedAt < 23 * 3600000,
      "This checkout needs reconciliation. Contact Kenan before paying.",
      409,
    );
    current.startedAt ??= Date.now();
  });
  const session = await api.checkout.sessions.create(
    {
      mode: "payment",
      allowed_payment_method_types: ["card"],
      client_reference_id: bill.id,
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: bill.cents,
            product_data: { name: bill.label, description: project.title },
          },
        },
      ],
      metadata: {
        studio: "kjl",
        client,
        project: projectId,
        bill: id,
        attempt: String(bill.attempt),
      },
      success_url: origin() + "/portal?checkout=returned",
      cancel_url: origin() + "/portal?checkout=cancelled",
    },
    { idempotencyKey: ["kjl", bill.id, bill.attempt].join("-") },
  );
  await editWorkspace(client, (w) => {
    const current = invoiceIn(w, projectId, id).bill;
    requireValue(
      current.attempt === bill.attempt && (!current.sessionId || current.sessionId === session.id),
      "Refresh this payment request.",
      409,
    );
    current.sessionId = session.id;
  });
  requireValue(session.url, "Unable to open checkout. Refresh the project.", 503);
  return { url: session.url };
}
export function verifiedEvent(raw: string, signature: string) {
  return stripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}
