import type { Answers } from "./questions";
export type Followup = { id: string; question: string; reason: string; sourceIds: string[] };
export type Clarifications = { questions: Followup[]; answers: Record<string, string> };
export const inquiryStatuses = [
  "New",
  "Needs clarification",
  "Reviewed",
  "Proposal sent",
  "Archived",
] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];
export type BriefVersion = { at: string; author: "AI draft" | "Owner"; markdown: string };
export type Inquiry = {
  id: string;
  created: string;
  revision: number;
  digest: string;
  answers: Answers;
  clarifications: Clarifications;
  consent: { contact: true; ai: boolean; at: string; version: "2026-11-12" };
  status: InquiryStatus;
  generation: {
    status: "not-requested" | "pending" | "generating" | "ready" | "failed";
    started?: number;
    attempt?: string;
    error?: string;
  };
  versions: BriefVersion[];
};
export type InquirySummary = Pick<Inquiry, "id" | "created" | "status" | "revision"> & {
  name: string;
  email: string;
  kind: string;
  idea: string;
  generation: Inquiry["generation"]["status"];
};
