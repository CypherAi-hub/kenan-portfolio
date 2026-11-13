import { createHash } from "node:crypto";
import { PortalError, requireValue } from "../portal/store";
import type { Member, Project } from "../portal/types";
import { checklist } from "./templates";
import { milestoneAction, milestoneActions, mutateMilestone, type Artifact } from "./milestones";
import {
  projectKinds,
  type CommercialProject,
  type DeliveryProject,
  type DeliveryState,
  type ProjectKind,
  type ProjectStatus,
} from "./types";

export const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const owner = (me: Member) =>
  me.role === "owner" && me.email.toLowerCase() === "kenanlarry8@gmail.com";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function field(value: unknown, label: string, limit: number, optional = false) {
  requireValue(typeof value === "string", `Enter ${label}.`);
  const text = value.trim();
  requireValue(
    (optional || text.length > 0) && text.length <= limit,
    `Check ${label} (up to ${limit} characters).`,
  );
  requireValue(
    !/(?:sk-(?:proj-|svcacct-)?[a-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:password|api[_ -]?key|access_token|secret)\s*[:=]\s*\S{6,})/i.test(
      text,
    ),
    "Keep passwords and API secrets out of onboarding. Use a provider invitation or approved secure sharing process.",
  );
  return text;
}
function link(value: unknown) {
  const text = field(value, "a reference link", 2000, true);
  if (!text) return "";
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new PortalError("Enter a complete HTTPS sharing link.");
  }
  requireValue(
    url.protocol === "https:" && !url.username && !url.password,
    "Use an HTTPS sharing link without embedded credentials.",
  );
  return url.href;
}
export function status(
  d: DeliveryProject | undefined | null,
  commercial: CommercialProject,
  audience?: "owner" | "client",
): ProjectStatus {
  const required = d?.tasks.filter((t) => t.required) || [],
    accepted = required.filter((t) => t.status === "accepted").length;
  const deliveryStage: ProjectStatus["deliveryStage"] = d?.started
    ? "In progress"
    : d?.schedule
      ? "Scheduled"
      : d?.source
        ? "Onboarding"
        : "Not started";
  const base = { accepted, required: required.length, readyToSchedule: false, deliveryStage };
  if (!d)
    return {
      ...base,
      stage: "Setup pending",
      action: {
        title: "Prepare the onboarding checklist",
        detail: "Kenan will choose the project checklist and add any agreed requirements.",
        responsible: "owner",
        priority: 2,
      },
    };
  if (!commercial.ready)
    return {
      ...base,
      stage: "Commercial review",
      action: {
        title: commercial.available
          ? "Complete the commercial prerequisites"
          : "Confirm the commercial records",
        detail: commercial.reasons.join(" · "),
        responsible: commercial.responsible,
        priority: 0,
      },
    };
  if (!d.source)
    return {
      ...base,
      stage: "Onboarding",
      action: {
        title: "Open your onboarding checklist",
        detail: "The commercial prerequisites are satisfied. Refresh to prepare your checklist.",
        responsible: "client",
        priority: 2,
      },
    };
  if (d.source.fingerprint !== commercial.fingerprint)
    return {
      ...base,
      stage: "Scope review",
      action: {
        title: "Review the changed project scope",
        detail:
          "Kenan needs to review the new accepted scope before this checklist or start date can continue.",
        responsible: "owner",
        priority: 0,
      },
    };
  const clientNext =
    audience === "client"
      ? required.find(
          (t) => t.assignee === "client" && !["submitted", "accepted"].includes(t.status),
        )
      : undefined;
  if (clientNext)
    return {
      ...base,
      stage: "Onboarding",
      action: {
        title: clientNext.title,
        detail:
          clientNext.status === "changes requested"
            ? clientNext.review?.feedback || clientNext.instructions
            : clientNext.instructions,
        responsible: "client",
        task: clientNext.id,
        priority: 3,
      },
    };
  const review = required.find((t) => t.status === "submitted");
  if (review)
    return {
      ...base,
      stage: "Onboarding",
      action: {
        title: "Review “" + review.title + "”",
        detail: "A required onboarding item is ready for Kenan’s review.",
        responsible: "owner",
        task: review.id,
        priority: 1,
      },
    };
  const next = required.find((t) => t.status !== "accepted");
  if (next)
    return {
      ...base,
      stage: "Onboarding",
      action: {
        title: next.title,
        detail:
          next.status === "changes requested"
            ? next.review?.feedback || next.instructions
            : next.instructions,
        responsible: next.assignee,
        task: next.id,
        priority: next.assignee === "owner" ? 2 : 3,
      },
    };
  if (!d.schedule)
    return {
      ...base,
      readyToSchedule: true,
      stage: "Ready to schedule",
      action: {
        title: "Approve the project start date",
        detail: "All required onboarding items are accepted. Kenan will confirm the schedule.",
        responsible: "owner",
        priority: 2,
      },
    };
  if (!d.started)
    return {
      ...base,
      readyToSchedule: true,
      stage: "Scheduled",
      action: {
        title: "Start the development workflow",
        detail: `Start date approved for ${d.schedule.date} (Central time). Kenan will confirm when work begins.`,
        responsible: "owner",
        priority: 4,
      },
    };
  return {
    ...base,
    readyToSchedule: true,
    stage: "In progress",
    action: milestoneAction(d) || {
      title: "Development is underway",
      detail: "Kenan will share the next deliverable through your project workspace.",
      responsible: "owner",
      priority: 5,
    },
  };
}
function bind(d: DeliveryProject, commercial: CommercialProject, at: string) {
  d.source = {
    fingerprint: commercial.fingerprint,
    proposal: commercial.proposal,
    revision: commercial.revision,
    engagement: commercial.engagement,
    sandbox: commercial.sandbox,
    at,
  };
}
export function command(
  state: DeliveryState,
  me: Member,
  project: Project,
  commercial: CommercialProject,
  input: Record<string, unknown>,
  context: { clientId?: string; artifact?: Artifact } = {},
) {
  const admin = owner(me),
    operation = input.operation;
  requireValue(
    typeof operation === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(operation),
    "A valid operation identifier is required.",
  );
  const digest = hash({ actor: me.id, project: project.id, input });
  const prior = state.operations.find((o) => o.id === operation);
  if (prior) {
    requireValue(
      prior.digest === digest,
      "This operation identifier was used for different changes.",
      409,
    );
    return;
  }
  let d = state.projects.find((p) => p.project === project.id);
  requireValue(
    input.action === "refresh" ||
      (Number.isInteger(input.revision) && input.revision === (d?.revision || 0)),
    "This project changed. Refresh before saving; keep your unsaved text.",
    409,
  );
  const at = new Date().toISOString();
  const audit = (action: string, task?: string) => {
    requireValue(
      state.events.length < 5000,
      "This delivery record needs archival review before more changes.",
      409,
    );
    state.events.push({
      id: operation + ":" + state.events.length,
      at,
      actor: me.id,
      name: me.name,
      action,
      project: project.id,
      ...(task ? { task } : {}),
    });
  };
  const initialize = () => {
    if (!d || d.source || !commercial.ready) return;
    d.tasks = checklist(d.kind, d.extras).map((t) => ({
      ...t,
      id: hash({ project: project.id, template: d!.template, key: t.key }).slice(0, 32),
      status: "open",
      notes: "",
      url: "",
    }));
    bind(d, commercial, at);
    d.revision++;
    audit("Onboarding checklist opened");
  };
  if (input.action === "prepare") {
    requireValue(admin, "Only Kenan can prepare onboarding.", 403);
    requireValue(
      !d?.source,
      "This checklist is already open. Review scope changes separately.",
      409,
    );
    requireValue(projectKinds.includes(input.kind as ProjectKind), "Choose the project type.");
    requireValue(
      Array.isArray(input.extras) && input.extras.length <= 8,
      "Add no more than eight agreed requirements.",
    );
    const extras = input.extras.map((x) => field(x, "an agreed requirement", 180));
    requireValue(new Set(extras).size === extras.length, "Remove duplicate requirements.");
    if (!d) {
      d = {
        project: project.id,
        revision: 0,
        kind: input.kind as ProjectKind,
        template: "2026-11-12",
        extras,
        preparedAt: at,
        preparedBy: me.id,
        tasks: [],
      };
      state.projects.push(d);
    } else {
      d.kind = input.kind as ProjectKind;
      d.extras = extras;
      d.preparedAt = at;
      d.preparedBy = me.id;
    }
    d.revision++;
    audit("Onboarding checklist prepared");
    initialize();
  } else if (input.action === "refresh") {
    initialize();
  } else if (input.action === "designate-approver") {
    requireValue(admin && d, "Only Kenan can designate a project approver.", 403);
    requireValue(
      input.approver === "" || (context.clientId && input.approver === context.clientId),
      "Select the existing client account; a contact name does not grant access.",
    );
    if (input.approver) d.approver = String(input.approver);
    else delete d.approver;
    d.revision++;
    audit(
      input.approver
        ? "Client account designated as milestone approver"
        : "Milestone approval authority revoked",
    );
  } else {
    requireValue(d?.source, "The onboarding checklist is not open yet.", 409);
    requireValue(
      commercial.ready,
      "The commercial prerequisites need attention before this project can continue.",
      409,
    );
    if (input.action === "adopt-scope") {
      requireValue(admin, "Only Kenan can review a changed scope.", 403);
      requireValue(
        input.confirmed === true && d.source.fingerprint !== commercial.fingerprint,
        "Review the new accepted scope before confirming.",
        409,
      );
      for (const t of d.tasks) {
        if (t.status === "accepted") t.status = t.notes || t.url ? "submitted" : "open";
        delete t.review;
      }
      delete d.schedule;
      delete d.started;
      bind(d, commercial, at);
      audit("Changed commercial scope adopted; onboarding review reopened");
    } else {
      requireValue(
        d.source.fingerprint === commercial.fingerprint,
        "The accepted scope changed. Kenan must review it before continuing.",
        409,
      );
      if (milestoneActions.includes(String(input.action))) {
        mutateMilestone(d, me, input, { ...context, at, commercial, text: field, audit });
        state.outbox ||= [];
        requireValue(
          state.outbox.length < 5000,
          "Delivery event outbox needs archival review.",
          409,
        );
        state.outbox.push({
          id: operation,
          project: project.id,
          type: String(input.action),
          actor: me.id,
          at,
          status: "held",
        });
      } else if (input.action === "save-task" || input.action === "submit-task") {
        const t = d.tasks.find((t) => t.id === input.task);
        requireValue(t, "Onboarding item not found.", 404);
        requireValue(
          (admin ? "owner" : "client") === t.assignee,
          "Only the responsible person can submit this item.",
          403,
        );
        requireValue(
          !["submitted", "accepted"].includes(t.status),
          "This item is already submitted. Kenan can return it for changes.",
          409,
        );
        const notes = field(input.notes, "your notes", 4000, true),
          url = link(input.url);
        requireValue(
          input.action === "save-task" || notes || url,
          "Add a note or sharing link before submitting.",
        );
        t.notes = notes;
        t.url = url;
        t.status = input.action === "save-task" ? "draft" : admin ? "accepted" : "submitted";
        if (input.action === "submit-task") {
          t.submitted = { actor: me.id, at };
          if (admin)
            t.review = {
              actor: me.id,
              at,
              feedback: "Owner verification recorded.",
              decision: "accept",
            };
        }
        audit(
          input.action === "save-task"
            ? "Onboarding draft saved"
            : admin
              ? "Owner verification completed"
              : "Onboarding item submitted",
          t.id,
        );
      } else if (input.action === "review-task") {
        requireValue(admin, "Only Kenan can review onboarding submissions.", 403);
        const t = d.tasks.find((t) => t.id === input.task);
        requireValue(t, "Onboarding item not found.", 404);
        requireValue(
          !d.started,
          "Work has already started. Scope or onboarding corrections need a separate review.",
          409,
        );
        requireValue(
          t.status === "submitted" || (t.status === "accepted" && input.decision === "return"),
          "This item is not awaiting review.",
          409,
        );
        requireValue(
          input.decision === "accept" || input.decision === "return",
          "Choose a review decision.",
        );
        const feedback = field(
          input.feedback,
          "review feedback",
          2000,
          input.decision === "accept",
        );
        t.status = input.decision === "accept" ? "accepted" : "changes requested";
        t.review = { actor: me.id, at, feedback, decision: input.decision };
        if (input.decision === "return") delete d.schedule;
        audit(
          input.decision === "accept" ? "Onboarding item accepted" : "Onboarding changes requested",
          t.id,
        );
      } else if (input.action === "schedule") {
        requireValue(admin, "Only Kenan can approve the schedule.", 403);
        requireValue(
          status(d, commercial).readyToSchedule && !d.started,
          "Complete required onboarding before approving a start date.",
          409,
        );
        const date = field(input.date, "the start date", 10);
        requireValue(
          /^\d{4}-\d{2}-\d{2}$/.test(date) &&
            Number.isFinite(Date.parse(date)) &&
            new Date(date).toISOString().slice(0, 10) === date &&
            date >= today(),
          "Choose today or a future calendar date (Central time).",
        );
        d.schedule = { date, actor: me.id, at };
        audit("Project start date approved");
      } else if (input.action === "start") {
        requireValue(admin, "Only Kenan can start development.", 403);
        requireValue(
          status(d, commercial).readyToSchedule &&
            d.schedule &&
            d.schedule.date <= today() &&
            !d.started,
          "Complete onboarding and reach the approved start date before starting.",
          409,
        );
        d.started = { actor: me.id, at };
        audit("Development workflow started");
      } else requireValue(false, "Unknown delivery action.");
    }
    d.revision++;
  }
  state.operations.push({ id: operation, digest });
  state.operations = state.operations.slice(-1000);
}
