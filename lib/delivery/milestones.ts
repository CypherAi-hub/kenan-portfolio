import { requireValue } from "../portal/store";
import type { Member } from "../portal/types";
import type { CommercialProject, DeliveryProject, NextAction } from "./types";

export type Artifact = { key: string; name: string; type: string; size: number; sha256: string };
export type Review = {
  actor: string;
  name: string;
  at: string;
  role: "designated_client_approver";
  decision: "approve" | "request_changes";
  feedback: string;
  version: string;
  sha256: string;
  scope: string;
};
export type DeliverableVersion = {
  id: string;
  number: number;
  artifact: Artifact;
  summary: string;
  publishedAt: string;
  publisher: string;
  source: NonNullable<DeliveryProject["source"]>;
  review?: Review;
};
export type RevisionTask = {
  id: string;
  version: string;
  feedback: string;
  at: string;
  triage: {
    decision: "included" | "more_info" | "change_order_required";
    reason: string;
    actor: string;
    at: string;
  }[];
  addressedBy?: string;
  changeDraft?: { description: string; scope: string; status: "commercial_approval_required" };
};
export type Milestone = {
  id: string;
  title: string;
  criteria: string;
  due?: string;
  createdAt: string;
  createdBy: string;
  versions: DeliverableVersion[];
  revisions: RevisionTask[];
};
export const milestoneActions = [
  "create-milestone",
  "publish-version",
  "review-version",
  "triage-revision",
];
export function milestoneAction(d: DeliveryProject): NextAction | undefined {
  for (const m of d.milestones || []) {
    const revision = m.revisions.find((r) => !r.addressedBy);
    if (revision)
      return {
        title:
          revision.triage.at(-1)?.decision === "change_order_required"
            ? "Review the scope-change draft"
            : "Review the requested revisions",
        detail: `${m.title}: ${revision.feedback}`,
        responsible: "owner",
        priority: 1,
        milestone: m.id,
        due: m.due,
      };
    const latest = m.versions.at(-1);
    if (latest && !latest.review && latest.source.fingerprint !== d.source?.fingerprint)
      return {
        title: `Update ${m.title} for the approved scope`,
        detail:
          "Publish a version against the current signed scope before requesting client approval.",
        responsible: "owner",
        priority: 1,
        milestone: m.id,
        due: m.due,
      };
    if (latest && !latest.review)
      return {
        title: d.approver
          ? `Review ${m.title} · V${latest.number}`
          : "Designate the client approver",
        detail: d.approver
          ? "Download the exact deliverable, then approve it or request revisions."
          : "Client review is paused until Kenan designates the authorized client account.",
        responsible: d.approver ? "client" : "owner",
        priority: 1,
        milestone: m.id,
        due: m.due,
      };
  }
  const pending = (d.milestones || [])
    .filter((m) => !m.versions.length)
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];
  if (pending)
    return {
      title: `Prepare ${pending.title}`,
      detail: pending.criteria,
      responsible: "owner",
      priority: 3,
      milestone: pending.id,
      due: pending.due,
    };
}
type Context = {
  clientId?: string;
  artifact?: Artifact;
  at: string;
  commercial: CommercialProject;
  text: (value: unknown, label: string, limit: number, optional?: boolean) => string;
  audit: (action: string, task?: string) => void;
};
export function mutateMilestone(
  d: DeliveryProject,
  me: Member,
  input: Record<string, unknown>,
  ctx: Context,
) {
  const { text, at, audit } = ctx,
    admin = me.role === "owner";
  requireValue(
    d.started,
    "Start the approved development workflow before publishing milestones.",
    409,
  );
  d.milestones ||= [];
  if (input.action === "create-milestone") {
    requireValue(admin, "Only Kenan can create a milestone.", 403);
    requireValue(
      d.milestones.length < 100,
      "This project needs archival review before more milestones.",
      409,
    );
    const due = text(input.due, "the due date", 10, true);
    requireValue(
      !due ||
        (/^\d{4}-\d{2}-\d{2}$/.test(due) &&
          Number.isFinite(Date.parse(due)) &&
          new Date(due).toISOString().slice(0, 10) === due),
      "Choose a valid due date.",
    );
    d.milestones.push({
      id: String(input.operation),
      title: text(input.title, "the milestone title", 180),
      criteria: text(input.criteria, "acceptance criteria", 3000),
      ...(due ? { due } : {}),
      createdAt: at,
      createdBy: me.id,
      versions: [],
      revisions: [],
    });
    audit("Delivery milestone created", String(input.operation));
    return;
  }
  const m = d.milestones.find((m) => m.id === input.milestone);
  requireValue(m, "Milestone not found.", 404);
  const latest = m.versions.at(-1);
  if (input.action === "publish-version") {
    requireValue(admin, "Only Kenan can publish deliverables.", 403);
    requireValue(ctx.artifact, "Upload the artifact through the private publication route.");
    requireValue(
      input.scopeConfirmed === true,
      "Confirm this deliverable matches the accepted scope.",
    );
    requireValue(
      d.approver === ctx.clientId,
      "Designate the current client account as approver before publication.",
      409,
    );
    requireValue(
      m.versions.length < 50,
      "This milestone needs archival review before more versions.",
      409,
    );
    requireValue(
      latest?.review?.decision !== "approve",
      "This milestone is approved. Create a separate milestone for newly authorized work.",
      409,
    );
    const unresolved = m.revisions.filter((r) => !r.addressedBy);
    for (const r of unresolved) {
      const decision = r.triage.at(-1)?.decision;
      const original = m.versions.find((v) => v.id === r.version)!;
      requireValue(
        decision === "included" ||
          (decision === "change_order_required" &&
            original.source.fingerprint !== ctx.commercial.fingerprint &&
            input.amendmentConfirmed === true),
        "Review the revision scope first. Additional scope needs a changed, verified commercial baseline and explicit confirmation.",
        409,
      );
    }
    const version: DeliverableVersion = {
      id: String(input.operation),
      number: m.versions.length + 1,
      artifact: ctx.artifact,
      summary: text(input.summary, "the version summary", 3000),
      publishedAt: at,
      publisher: me.id,
      source: { ...d.source! },
    };
    m.versions.push(version);
    for (const r of unresolved) r.addressedBy = version.id;
    audit(`Deliverable V${version.number} published for client review`, version.id);
  } else if (input.action === "review-version") {
    requireValue(
      me.role === "client" && me.id === ctx.clientId && d.approver === me.id,
      "Only the currently designated client approver can review this deliverable.",
      403,
    );
    requireValue(
      latest && latest.id === input.version && !latest.review,
      "This version is no longer reviewable. Refresh to open the latest version.",
      409,
    );
    requireValue(
      latest.source.fingerprint === ctx.commercial.fingerprint,
      "The signed scope changed. Kenan must publish a version against the current approved scope.",
      409,
    );
    requireValue(
      input.decision === "approve" || input.decision === "request_changes",
      "Choose a review decision.",
    );
    requireValue(input.confirmed === true, "Confirm you reviewed the exact deliverable version.");
    const feedback = text(input.feedback, "review feedback", 3000, input.decision === "approve");
    latest.review = {
      actor: me.id,
      name: me.name,
      at,
      role: "designated_client_approver",
      decision: input.decision,
      feedback,
      version: latest.id,
      sha256: latest.artifact.sha256,
      scope: latest.source.fingerprint,
    };
    if (input.decision === "request_changes")
      m.revisions.push({
        id: String(input.operation),
        version: latest.id,
        feedback,
        at,
        triage: [],
      });
    audit(
      input.decision === "approve"
        ? `Client approved deliverable V${latest.number}`
        : `Client requested revisions to V${latest.number}`,
      latest.id,
    );
  } else if (input.action === "triage-revision") {
    requireValue(admin, "Only Kenan can classify revision scope.", 403);
    const r = m.revisions.find((r) => r.id === input.task && !r.addressedBy);
    requireValue(r, "Open revision task not found.", 404);
    requireValue(
      ["included", "more_info", "change_order_required"].includes(String(input.decision)),
      "Choose a scope decision.",
    );
    requireValue(r.triage.length < 50, "This request needs archival review.", 409);
    const reason = text(input.reason, "the scope review reason", 2000);
    r.triage.push({
      decision: input.decision as RevisionTask["triage"][number]["decision"],
      reason,
      actor: me.id,
      at,
    });
    if (input.decision === "change_order_required")
      r.changeDraft = {
        description: r.feedback,
        scope: m.versions.find((v) => v.id === r.version)!.source.fingerprint,
        status: "commercial_approval_required",
      };
    audit(
      input.decision === "change_order_required"
        ? "Scope-change draft prepared for commercial review"
        : "Revision scope reviewed",
      r.id,
    );
  }
}
