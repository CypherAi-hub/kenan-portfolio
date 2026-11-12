import { createHash, randomUUID } from "node:crypto";
import { assertOwner } from "../portal/desk";
import { directory, editPrivate, editWorkspace, requireValue, workspace } from "../portal/store";
import type { Account } from "../portal/types";
import { getInquiry, indexInquiry, inquiryKey } from "./service";
import type { HandoffOptions, Inquiry, InquiryHandoff } from "./types";

function uuid(value: unknown, label: string): asserts value is string {
  requireValue(
    typeof value === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value),
    `Choose a valid ${label}.`,
  );
}
function text(value: unknown, label: string, max: number) {
  requireValue(
    typeof value === "string" && value.trim().length > 0 && value.trim().length <= max,
    `Enter ${label} (up to ${max} characters).`,
  );
  return value.trim();
}
async function client(id: unknown) {
  uuid(id, "client");
  const account = (await directory()).accounts.find((a) => a.id === id && a.role === "client");
  requireValue(account, "Client not found. Choose an existing client account.", 404);
  return account;
}
export async function handoffOptions(
  me: Account,
  clientId: string | null,
): Promise<HandoffOptions> {
  assertOwner(me);
  const clients = (await directory()).accounts
    .filter((a) => a.role === "client")
    .map(({ id, name, email }) => ({ id, name, email }));
  if (!clientId) return { clients, projects: [] };
  await client(clientId);
  return {
    clients,
    projects: (await workspace(clientId)).projects.map(({ id, title, phase }) => ({
      id,
      title,
      phase,
    })),
  };
}
function requestFields(input: Record<string, unknown>): {
  revision: number;
  clientId: string;
  mode: InquiryHandoff["mode"];
  projectId: string;
  title: string;
  summary: string;
} {
  requireValue(input.confirmed === true, "Confirm the client and the information being shared.");
  uuid(input.clientId, "client");
  requireValue(
    input.mode === "new" || input.mode === "existing",
    "Choose a new or existing project.",
  );
  requireValue(
    Number.isInteger(input.revision) && Number(input.revision) > 0,
    "Reload the inquiry before handing it off.",
  );
  if (input.mode === "existing") uuid(input.projectId, "project");
  return {
    revision: input.revision as number,
    clientId: input.clientId,
    mode: input.mode,
    projectId: input.mode === "existing" ? (input.projectId as string) : "",
    title: input.mode === "new" ? text(input.title, "a project title", 120) : "",
    summary:
      input.mode === "new" ? text(input.summary, "a client-visible discovery summary", 2400) : "",
  };
}
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function handoffInquiry(me: Account, input: Record<string, unknown>) {
  assertOwner(me);
  const before = await getInquiry(me, input.id);
  const fields = input.resume === true ? null : requestFields(input);
  requireValue(fields || before.handoff, "There is no pending handoff to resume.", 409);
  if (before.handoff && fields)
    requireValue(
      before.handoff.requestHash === digest(fields),
      "This inquiry already has a handoff destination. Reload to view or resume it.",
      409,
    );

  let candidate: InquiryHandoff | undefined;
  if (!before.handoff && fields) {
    const account = await client(fields.clientId);
    const existing =
      fields.mode === "existing"
        ? (await workspace(account.id)).projects.find((p) => p.id === fields.projectId)
        : undefined;
    requireValue(
      fields.mode === "new" || existing,
      "Project not found in this client’s workspace.",
      404,
    );
    requireValue(
      before.status === "Reviewed" &&
        before.generation.status !== "generating" &&
        before.versions.at(-1)?.markdown.trim(),
      "Save and mark the brief reviewed before handing it off.",
      409,
    );
    candidate = {
      status: "pending",
      clientId: account.id,
      clientName: account.name,
      clientEmail: account.email,
      projectId: existing?.id || randomUUID(),
      mode: fields.mode,
      title: existing?.title || fields.title,
      summary: fields.summary,
      requestedAt: new Date().toISOString(),
      requestedBy: me.id,
      sourceRevision: before.revision,
      sourceMarkdown: before.versions.at(-1)!.markdown,
      requestHash: digest(fields),
    };
  }
  // Persist one destination before any project write. Concurrent or interrupted requests resume it.
  const claimed = await editPrivate<{ inquiry?: Inquiry }, Inquiry>(
    inquiryKey(before.id),
    () => ({}),
    (record) => {
      const inquiry = record.inquiry;
      requireValue(inquiry, "Inquiry not found.", 404);
      if (inquiry.handoff) {
        requireValue(
          !fields || inquiry.handoff.requestHash === digest(fields),
          "This inquiry already has a handoff destination. Reload to view or resume it.",
          409,
        );
        return inquiry;
      }
      requireValue(
        candidate &&
          fields &&
          inquiry.revision === fields.revision &&
          inquiry.revision === before.revision &&
          inquiry.status === "Reviewed" &&
          inquiry.generation.status !== "generating",
        "This inquiry changed. Reload and review it before handing it off.",
        409,
      );
      inquiry.handoff = candidate;
      inquiry.revision++;
      return inquiry;
    },
  );
  const handoff = claimed.handoff!;
  if (handoff.status === "linked") {
    await indexInquiry(claimed);
    return claimed;
  }
  await indexInquiry(claimed);
  // Re-check identity on recovery; never move a pending handoff to a different account.
  await client(handoff.clientId);
  if (handoff.mode === "new") {
    await editWorkspace(handoff.clientId, (w) => {
      const existing = w.projects.find((p) => p.id === handoff.projectId);
      if (existing) {
        requireValue(
          existing.created === handoff.requestedAt,
          "A different project occupies this handoff destination. Contact the studio owner.",
          409,
        );
        return;
      }
      w.projects.unshift({
        id: handoff.projectId,
        title: handoff.title,
        brief: handoff.summary,
        phase: "Discovery",
        created: handoff.requestedAt,
        updates: [],
        payments: [],
      });
    });
  } else {
    requireValue(
      (await workspace(handoff.clientId)).projects.some((p) => p.id === handoff.projectId),
      "The linked project is no longer available. Restore it before resuming this handoff.",
      409,
    );
  }
  const saved = await editPrivate<{ inquiry?: Inquiry }, Inquiry>(
    inquiryKey(before.id),
    () => ({}),
    (record) => {
      const inquiry = record.inquiry;
      requireValue(
        inquiry?.handoff?.requestHash === handoff.requestHash,
        "The handoff changed. Reload before continuing.",
        409,
      );
      if (inquiry.handoff.status !== "linked") {
        inquiry.handoff.status = "linked";
        inquiry.handoff.linkedAt = new Date().toISOString();
        inquiry.revision++;
      }
      return inquiry;
    },
  );
  await indexInquiry(saved);
  return saved;
}
