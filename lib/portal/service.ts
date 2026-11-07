import { randomUUID } from "node:crypto";
import {
  directory,
  editDirectory,
  editWorkspace,
  requireValue,
  workspace,
  PortalError,
} from "./store";
import { newInvitation, origin, publicMember } from "./auth";
import { checkout, paymentMode } from "./billing";
import { phases, type Phase, type Account, type Member, type PortalView } from "./types";

type Input = Record<string, unknown>;
function field(value: unknown, label: string, limit: number, required = true) {
  requireValue(typeof value === "string" || (!required && value == null), label + " is required.");
  const s = String(value || "").trim();
  requireValue(
    (s.length > 0 || !required) && s.length <= limit,
    "Check " + label.toLowerCase() + " (up to " + limit + " characters).",
  );
  return s;
}
function owner(me: Member) {
  requireValue(me.role === "owner", "Studio owner access is required.", 403);
}
function clientId(me: Member, target: unknown) {
  if (me.role === "client") {
    requireValue(!target || target === me.id, "Project not found.", 404);
    return me.id;
  }
  return field(target, "Client", 36);
}
export async function view(me: Account, target: string | null): Promise<PortalView> {
  const clients =
    me.role === "owner"
      ? (await directory()).accounts.filter((a) => a.role === "client").map(publicMember)
      : [];
  const activeClient =
    me.role === "owner"
      ? clients.find((c) => c.id === (target || clients[0]?.id)) || null
      : publicMember(me);
  requireValue(!target || target === activeClient?.id, "Client not found.", 404);
  return {
    me: publicMember(me),
    clients,
    activeClient,
    projects: activeClient ? (await workspace(activeClient.id)).projects : [],
    paymentMode: paymentMode(),
  };
}
export async function mutate(me: Account, input: Input, operationId?: string) {
  const action = input.action;
  if (action === "invite" || action === "renew") {
    owner(me);
    const invitation = newInvitation();
    const account = await editDirectory((d) => {
      if (action === "renew") {
        const existing = d.accounts.find((a) => a.id === input.client && a.role === "client");
        requireValue(existing, "Unknown client.", 404);
        existing.invitation = invitation.stored;
        existing.sessions = [];
        delete existing.credential;
        return publicMember(existing);
      }
      const name = field(input.name, "Name", 100),
        email = field(input.email, "Email", 254).toLowerCase();
      requireValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Enter a valid client email.");
      requireValue(
        !d.accounts.some((a) => a.email.toLowerCase() === email),
        "This client already has a workspace.",
        409,
      );
      const account: Account = {
        id: randomUUID(),
        name,
        email,
        role: "client",
        invitation: invitation.stored,
        sessions: [],
        recentChallenges: [],
      };
      d.accounts.push(account);
      return publicMember(account);
    });
    return { client: account.id, invitation: origin() + "/portal#invite=" + invitation.raw };
  }
  const id = clientId(me, input.client);
  if (me.role === "owner")
    requireValue(
      (await directory()).accounts.some((a) => a.id === id && a.role === "client"),
      "Unknown client.",
      404,
    );
  if (action === "checkout") {
    requireValue(me.role === "client", "Checkout is available in the client’s workspace.", 403);
    return checkout(
      id,
      field(input.project, "Project", 36),
      field(input.bill, "Payment", 36),
      me.email,
    );
  }
  return editWorkspace(id, (w) => {
    if (operationId) {
      if (w.operations?.includes(operationId)) return { ok: true };
      w.operations = [...(w.operations || []).slice(-999), operationId];
    }
    if (action === "project") {
      owner(me);
      const project = {
        id: randomUUID(),
        title: field(input.title, "Project name", 120),
        brief: field(input.brief, "Scope", 2400),
        phase: "Discovery" as const,
        created: new Date().toISOString(),
        updates: [],
        payments: [],
      };
      w.projects.unshift(project);
      return { project: project.id };
    }
    const project = w.projects.find((p) => p.id === input.project);
    requireValue(project, "Project not found.", 404);
    if (action === "edit") {
      owner(me);
      requireValue(input.title != null || input.brief != null, "Provide a title or scope to edit.");
      if (input.title != null) project.title = field(input.title, "Project name", 120);
      if (input.brief != null) project.brief = field(input.brief, "Scope", 2400);
      return { ok: true };
    }
    if (action === "update" || action === "comment") {
      const body = field(input.body, "Message", 4000);
      let url: string | undefined;
      if (action === "update") {
        owner(me);
        requireValue(phases.includes(input.phase as Phase), "Choose a project phase.");
        project.phase = input.phase as Phase;
        if (input.url) {
          let parsed: URL;
          try {
            parsed = new URL(field(input.url, "Preview URL", 2000));
          } catch {
            throw new PortalError("Use a valid HTTPS preview link.");
          }
          requireValue(
            parsed.protocol === "https:" && !parsed.username && !parsed.password,
            "Use an HTTPS preview link.",
          );
          url = parsed.href;
        }
      }
      project.updates.unshift({
        id: randomUUID(),
        at: new Date().toISOString(),
        author: me.name,
        authorId: me.id,
        body,
        phase: project.phase,
        url,
        review: action === "update" && input.review === true ? "requested" : undefined,
      });
      return { ok: true };
    }
    if (action === "review") {
      requireValue(me.role === "client", "Only the client can respond to a review.", 403);
      const update = project.updates.find((u) => u.id === input.update);
      requireValue(update?.review === "requested", "This review has already been answered.", 409);
      requireValue(
        input.decision === "approved" || input.decision === "changes requested",
        "Choose a response.",
      );
      update.review = input.decision;
      update.respondedAt = new Date().toISOString();
      update.response = field(input.body, "Feedback", 3000, input.decision === "changes requested");
      return { ok: true };
    }
    requireValue(action === "bill", "Unknown action.");
    owner(me);
    const dollars = field(input.amount, "Amount", 12);
    requireValue(
      /^\d{1,6}(\.\d{1,2})?$/.test(dollars),
      "Enter a USD amount with up to two decimal places.",
    );
    const cents = Math.round(Number(dollars) * 100);
    requireValue(
      cents >= 50 && cents <= 99999999,
      "Enter an amount between $0.50 and $999,999.99.",
    );
    project.payments.push({
      id: randomUUID(),
      label: field(input.label, "Payment description", 120),
      cents,
      attempt: 1,
      status: "open",
    });
    return { ok: true };
  });
}
