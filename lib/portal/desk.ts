import { randomUUID } from "node:crypto";
import { directory, editPrivate, readPrivate, requireValue } from "./store";
import type { Account } from "./types";
export type Appointment = {
  clientName?: string;
  id: string;
  client: string;
  title: string;
  start: string;
  minutes: number;
  status: "requested" | "approved" | "declined";
  note: string;
  created: string;
  reviewedAt?: string;
  googleEvent?: string;
  bookingProposal?: string;
};
export type Proposal = {
  id: string;
  owner: string;
  created: number;
  status: "pending" | "applied";
  label: string;
  delivery?: { status: "sending" | "sent" | "failed" | "unknown"; at: string; reference?: string };
  input: Record<string, unknown>;
};
type Desk = {
  appointments: Appointment[];
  proposals: Proposal[];
  usage: { day: string; count: number };
  messages?: StoredMessage[];
};
type StoredMessage = {
  id: string;
  at: string;
  role: "user" | "assistant";
  content: string;
  proposalIds?: string[];
  evidence?: { title: string; url: string; checkedAt: string; note: string }[];
};
const empty = (): Desk => ({ appointments: [], proposals: [], usage: { day: "", count: 0 } });
export const desk = () => readPrivate("owner-desk", empty);
export const editDesk = <T>(fn: (d: Desk) => T) => editPrivate("owner-desk", empty, fn);
export async function conversation(me: Account) {
  assertOwner(me);
  const data = await desk();
  return (data.messages || []).slice(-40).map((m) => ({
    ...m,
    proposals: (m.proposalIds || []).flatMap((id) => {
      const p = data.proposals.find((p) => p.id === id && p.owner === me.id);
      return p ? [p] : [];
    }),
  }));
}
export function assertOwner(me: Account) {
  requireValue(
    me.role === "owner" && me.email.toLowerCase() === "kenanlarry8@gmail.com",
    "Owner access is required.",
    403,
  );
}
export async function requestAppointment(me: Account, input: Record<string, unknown>) {
  requireValue(me.role === "client", "Use the client workspace to request a meeting.", 403);
  const start = new Date(String(input.start)),
    minutes = 30;
  requireValue(
    Number.isFinite(start.getTime()) &&
      start.getTime() > Date.now() + 86400000 &&
      start.getTime() < Date.now() + 90 * 86400000,
    "Choose a time at least 24 hours ahead and within 90 days.",
  );
  const title = String(input.title || "Project discussion").trim(),
    note = String(input.note || "").trim();
  requireValue(
    title.length > 0 && title.length <= 120 && note.length <= 1500,
    "Check the meeting title and notes.",
  );
  return editDesk((d) => {
    requireValue(
      d.appointments.filter((a) => a.client === me.id && a.status === "requested").length < 8,
      "You already have several requests awaiting a reply.",
      429,
    );
    const appointment: Appointment = {
      id: randomUUID(),
      client: me.id,
      title,
      start: start.toISOString(),
      minutes,
      status: "requested",
      note,
      created: new Date().toISOString(),
    };
    d.appointments.push(appointment);
    return { ok: true };
  });
}
export async function appointmentView(me: Account) {
  const d = await desk();
  const names =
    me.role === "owner"
      ? new Map((await directory()).accounts.map((a) => [a.id, a.name]))
      : new Map([[me.id, me.name]]);
  return d.appointments
    .filter((a) => me.role === "owner" || a.client === me.id)
    .map((a) => ({ ...a, clientName: names.get(a.client) || "Client" }))
    .sort((a, b) => a.start.localeCompare(b.start));
}
export async function reviewAppointment(me: Account, input: Record<string, unknown>) {
  assertOwner(me);
  requireValue(
    input.decision === "approved" || input.decision === "declined",
    "Choose an appointment decision.",
  );
  return editDesk((d) => {
    const a = d.appointments.find((a) => a.id === input.appointment);
    requireValue(a, "Appointment not found.", 404);
    if (a.status === input.decision) return { ok: true };
    requireValue(a.status === "requested", "This request has already been reviewed.", 409);
    requireValue(
      !a.bookingProposal,
      "A Calendar invitation is being processed. Check its delivery in the assistant before changing this request.",
      409,
    );
    requireValue(new Date(a.start).getTime() > Date.now(), "This meeting time has passed.", 409);
    if (input.decision === "approved")
      requireValue(
        !d.appointments.some(
          (b) =>
            b.status === "approved" &&
            b.id !== a.id &&
            new Date(b.start).getTime() < new Date(a.start).getTime() + a.minutes * 60000 &&
            new Date(a.start).getTime() < new Date(b.start).getTime() + b.minutes * 60000,
        ),
        "This time overlaps an approved portal appointment.",
        409,
      );
    a.status = input.decision as "approved" | "declined";
    a.reviewedAt = new Date().toISOString();
    return { ok: true };
  });
}
export async function studioContext(me: Account) {
  assertOwner(me);
  const clients = (await directory()).accounts
    .filter((a) => a.role === "client")
    .map(({ id, name, email }) => ({ id, name, email }));
  const { workspace } = await import("./store");
  const records = await Promise.all(
    clients.map(async (client) => {
      const data = await workspace(client.id);
      return {
        ...client,
        projects: data.projects
          .slice(0, 20)
          .map(({ id, title, brief, phase, updates, payments }) => ({
            id,
            title,
            brief,
            phase,
            updates: updates.slice(0, 5),
            payments: payments.map(({ id, label, cents, status, processing, failure }) => ({
              id,
              label,
              cents,
              status,
              processing: !!processing,
              failure: failure || null,
            })),
          })),
      };
    }),
  );
  return {
    clients: records,
    appointments: await appointmentView(me),
    now: new Date().toISOString(),
    recentProposals: (await desk()).proposals
      .filter((p) => p.owner === me.id)
      .slice(-8)
      .map((p) => ({
        label: p.label,
        status: p.status,
        input: p.input,
        delivery: p.delivery?.status,
      })),
    recentDeliveries: (await desk()).proposals
      .filter((p) => p.owner === me.id && p.delivery)
      .slice(-30)
      .map((p) => ({
        action: p.input.action,
        client: p.input.client,
        title: p.input.title,
        to: p.input.to,
        start: p.input.start,
        status: p.delivery!.status,
        at: p.delivery!.at,
      })),
  };
}
