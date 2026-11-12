import { createHash, createHmac, randomUUID } from "node:crypto";
import { readPrivate, editPrivate, requireValue, PortalError } from "../portal/store";
import { assertOwner } from "../portal/desk";
import type { Account } from "../portal/types";
import { validateAnswers } from "./questions";
import { generateBrief, verifyQuestions, sourceMarkdown } from "./ai";
import { inquiryStatuses, type Inquiry, type InquirySummary } from "./types";

function key(id: unknown) {
  requireValue(
    typeof id === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id),
    "Unknown inquiry.",
    404,
  );
  return "inquiries/items/" + id;
}
const empty = () => ({ items: [] as InquirySummary[] });
const summary = (i: Inquiry): InquirySummary => ({
  id: i.id,
  created: i.created,
  revision: i.revision,
  name: String(i.answers.name),
  email: String(i.answers.email),
  kind: String(i.answers.kind),
  idea: String(i.answers.idea).slice(0, 180),
  status: i.status,
  generation: i.generation.status,
  handoff: i.handoff?.status,
});
async function index(inquiry: Inquiry) {
  await editPrivate("inquiries/index", empty, (d) => {
    const position = d.items.findIndex((i) => i.id === inquiry.id);
    if (position >= 0) {
      if (d.items[position].revision <= inquiry.revision) d.items[position] = summary(inquiry);
    } else {
      d.items.push(summary(inquiry));
    }
  });
}
export async function publicLimit(request: Request, action: "clarify" | "submit") {
  const secret = process.env.PORTAL_SIGNING_KEY;
  requireValue(secret && secret.length >= 32, "Project discovery is temporarily unavailable.", 503);
  const day = new Date().toISOString().slice(0, 10);
  // Vercel sets this header itself; never use a caller-chosen forwarded-for chain.
  const address = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || "unknown"
    : "local";
  const bucket = createHmac("sha256", secret)
    .update(day + ":" + address.slice(0, 100))
    .digest("hex");
  await editPrivate(
    "inquiries/limits/" + day,
    () => ({ total: 0, callers: {} as Record<string, { clarify: number; submit: number }> }),
    (d) => {
      const counts = d.callers[bucket] || { clarify: 0, submit: 0 };
      requireValue(
        d.total < 300 && counts[action] < (action === "clarify" ? 6 : 10),
        "You’ve reached today’s inquiry limit. Please try tomorrow or contact Kenan by email.",
        429,
      );
      counts[action]++;
      d.callers[bucket] = counts;
      d.total++;
    },
  );
}
export async function submitInquiry(input: Record<string, unknown>, request: Request) {
  let answers;
  try {
    answers = validateAnswers(input.answers);
  } catch (e) {
    throw new PortalError(e instanceof Error ? e.message : "Check your answers.");
  }
  requireValue(
    input.consent === true && typeof input.allowAI === "boolean",
    "Please confirm permission to contact you about this project.",
  );
  const path = key(input.id);
  const clarifications = input.allowAI
    ? verifyQuestions(answers, input.followupToken, input.followupAnswers)
    : { questions: [], answers: {} };
  const digest = createHash("sha256")
    .update(JSON.stringify({ answers, clarifications, allowAI: input.allowAI }))
    .digest("hex");
  let inquiry = await item(input.id);
  if (inquiry) {
    requireValue(
      inquiry.digest === digest,
      "This inquiry was already submitted with different answers. Start a new inquiry to send a new version.",
      409,
    );
  } else {
    await publicLimit(request, "submit");
    const created = new Date().toISOString();
    const candidate: Inquiry = {
      id: input.id as string,
      created,
      revision: 1,
      digest,
      answers,
      clarifications,
      consent: { contact: true, ai: input.allowAI, at: created, version: "2026-11-12" },
      status: "New",
      generation: { status: input.allowAI ? "pending" : "not-requested" },
      versions: [],
    };
    // The Blob store mutation API mutates an object in place. Use an envelope for nullable records.
    inquiry = await editPrivate<{ inquiry?: Inquiry }, Inquiry>(
      path,
      () => ({}),
      (d) => {
        if (d.inquiry) {
          requireValue(
            d.inquiry.digest === digest,
            "This inquiry was already submitted with different answers.",
            409,
          );
          return d.inquiry;
        }
        d.inquiry = candidate;
        return candidate;
      },
    );
  }
  await index(inquiry);
  if (
    inquiry.generation.status === "pending" ||
    (inquiry.generation.status === "generating" &&
      (inquiry.generation.started || 0) < Date.now() - 90000)
  ) {
    inquiry = await runGeneration(inquiry.id);
  }
  return { id: inquiry.id, created: inquiry.created, briefStatus: inquiry.generation.status };
}
async function item(id: unknown) {
  const record = await readPrivate<{ inquiry?: Inquiry }>(key(id), () => ({}));
  return record.inquiry || null;
}
// All item reads use the same envelope as atomic writes.
export async function listInquiries(me: Account) {
  assertOwner(me);
  return (await readPrivate("inquiries/index", empty)).items.sort((a, b) =>
    b.created.localeCompare(a.created),
  );
}
export async function getInquiry(me: Account, id: unknown) {
  assertOwner(me);
  const inquiry = await item(id);
  requireValue(inquiry, "Inquiry not found.", 404);
  return inquiry;
}
async function runGeneration(id: string, retry = false) {
  const attempt = randomUUID();
  const claimed = await editPrivate<{ inquiry?: Inquiry }, boolean>(
    key(id),
    () => ({}),
    (d) => {
      const i = d.inquiry;
      requireValue(i && i.consent.ai, "AI review was not authorized for this inquiry.", 409);
      requireValue(
        !i.handoff,
        "This brief has been handed off. Make any further changes manually.",
        409,
      );
      if (i.generation.status === "generating" && (i.generation.started || 0) > Date.now() - 90000)
        return false;
      if (!retry && ["ready", "failed"].includes(i.generation.status)) return false;
      requireValue(
        i.versions.length < 30,
        "This inquiry has reached its version limit. Export it before continuing.",
        409,
      );
      i.generation = { status: "generating", started: Date.now(), attempt };
      i.revision++;
      return true;
    },
  );
  const before = (await item(id))!;
  if (!claimed) return before;
  let markdown = "",
    error = "";
  try {
    markdown = await generateBrief(before);
  } catch {
    error =
      "AI generation did not finish. Original answers are saved. Retry when the connection is available.";
  }
  const saved = await editPrivate<{ inquiry?: Inquiry }, Inquiry>(
    key(id),
    () => ({}),
    (d) => {
      const i = d.inquiry!;
      if (i.generation.attempt !== attempt) return i;
      if (markdown) i.versions.push({ at: new Date().toISOString(), author: "AI draft", markdown });
      i.generation = error ? { status: "failed", error } : { status: "ready" };
      i.revision++;
      return i;
    },
  );
  await index(saved);
  return saved;
}
export async function retryBrief(me: Account, id: unknown) {
  const inquiry = await getInquiry(me, id);
  requireValue(
    inquiry.consent.ai,
    "The client did not authorize AI processing. Review the original answers manually.",
    409,
  );
  requireValue(
    !inquiry.versions.some((v) => v.author === "Owner"),
    "This brief has owner edits. Keep reviewing the saved version.",
    409,
  );
  return runGeneration(inquiry.id, true);
}
export async function updateInquiry(me: Account, input: Record<string, unknown>) {
  assertOwner(me);
  requireValue(
    Number.isInteger(input.revision) && inquiryStatuses.includes(input.status as never),
    "Check the inquiry status.",
  );
  const markdown = input.markdown;
  requireValue(
    typeof markdown === "string" && markdown.trim().length > 0 && markdown.length <= 80000,
    "Enter a brief of up to 80,000 characters.",
  );
  const saved = await editPrivate<{ inquiry?: Inquiry }, Inquiry>(
    key(input.id),
    () => ({}),
    (d) => {
      const i = d.inquiry;
      requireValue(i, "Inquiry not found.", 404);
      requireValue(
        i.handoff?.status !== "pending",
        "Finish the pending project handoff before editing this brief.",
        409,
      );
      requireValue(
        i.revision === input.revision && i.generation.status !== "generating",
        "This inquiry changed. Refresh before saving; your unsaved text is still here.",
        409,
      );
      requireValue(
        i.versions.length < 30,
        "This inquiry has reached its version limit. Export it before continuing.",
        409,
      );
      if (i.versions.at(-1)?.markdown !== markdown)
        i.versions.push({ at: new Date().toISOString(), author: "Owner", markdown });
      i.status = input.status as Inquiry["status"];
      i.revision++;
      return i;
    },
  );
  await index(saved);
  return saved;
}
export function exportInquiry(inquiry: Inquiry) {
  return `# KJL Designs — inquiry ${inquiry.id}\n\nSubmitted: ${inquiry.created}\nReview status: ${inquiry.status}\nRevision: ${inquiry.revision}\n\n${inquiry.versions.at(-1)?.markdown || "# Source answers — no AI brief generated"}\n\n${sourceMarkdown(inquiry)}\n`;
}
// Handoff shares the same conditional-write record and derived inbox index.
export { key as inquiryKey, index as indexInquiry };
