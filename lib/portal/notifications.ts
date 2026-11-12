import { directory, workspace, readPrivate, editPrivate } from "./store";
import { appointmentView, assertOwner, desk } from "./desk";
import { listInquiries } from "../intake/service";
import type { Account } from "./types";
export type StudioNotification = {
  id: string;
  at: string;
  title: string;
  body: string;
  kind: "project" | "payment" | "appointment" | "delivery" | "inquiry";
  client?: string;
};
const empty = () => ({ readAt: "" });
export async function readNotifications(me: Account) {
  if (me.role === "owner") assertOwner(me);
  return editPrivate("notification-read-" + me.id, empty, (d) => {
    d.readAt = new Date().toISOString();
    return { ok: true };
  });
}
export async function notifications(me: Account) {
  if (me.role === "owner") assertOwner(me);
  const clients =
    me.role === "owner" ? (await directory()).accounts.filter((a) => a.role === "client") : [me];
  const items: StudioNotification[] = [];
  for (const client of clients) {
    for (const project of (await workspace(client.id)).projects) {
      for (const update of project.updates) {
        const isMine = update.authorId ? update.authorId === me.id : update.author === me.name;
        if (!isMine)
          items.push({
            id: "update-" + update.id,
            at: update.at,
            title: project.title,
            body: update.body,
            kind: "project",
            client: client.name,
          });
        if (me.role === "owner" && update.respondedAt)
          items.push({
            id: "review-" + update.id,
            at: update.respondedAt,
            title: client.name + " reviewed " + project.title,
            body: [update.review, update.response].filter(Boolean).join(" · "),
            kind: "project",
            client: client.name,
          });
      }
      for (const payment of project.payments) {
        if (payment.paidAt)
          items.push({
            id: "paid-" + payment.id,
            at: payment.paidAt,
            title: "Payment received",
            body:
              client.name +
              " · " +
              project.title +
              " · " +
              payment.label +
              " · $" +
              (payment.cents / 100).toFixed(2),
            kind: "payment",
            client: client.name,
          });
      }
    }
  }
  for (const appointment of await appointmentView(me)) {
    const owner = me.role === "owner";
    if (owner || appointment.reviewedAt)
      items.push({
        id: "appointment-" + appointment.id + "-" + appointment.status,
        at: appointment.reviewedAt || appointment.created,
        title: owner ? "Meeting " + appointment.status : "Your meeting was " + appointment.status,
        body: [
          owner ? appointment.clientName : "",
          appointment.title,
          new Date(appointment.start).toLocaleString("en-US", {
            timeZone: "America/Chicago",
            dateStyle: "medium",
            timeStyle: "short",
          }) + " Central",
        ]
          .filter(Boolean)
          .join(" · "),
        kind: "appointment",
      });
  }
  if (me.role === "owner") {
    for (const inquiry of await listInquiries(me))
      items.push({
        id: "inquiry-" + inquiry.id,
        at: inquiry.created,
        title: "New project inquiry",
        body: inquiry.name + " · " + inquiry.kind + " — open Project inquiries & briefs to review.",
        kind: "inquiry",
      });
    for (const p of (await desk()).proposals.filter((p) => p.owner === me.id && p.delivery))
      items.push({
        id: "delivery-" + p.id + "-" + p.delivery!.status,
        at: p.delivery!.at,
        title: p.delivery!.status === "sent" ? "Delivery confirmed" : "Delivery needs attention",
        body: p.label + " · " + p.delivery!.status,
        kind: "delivery",
      });
  }
  const readAt = (await readPrivate("notification-read-" + me.id, empty)).readAt;
  items.sort((a, b) => b.at.localeCompare(a.at));
  return { items: items.slice(0, 40), unread: items.filter((i) => i.at > readAt).length };
}
