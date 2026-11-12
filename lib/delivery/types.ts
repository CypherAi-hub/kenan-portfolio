import type { Member, Project } from "../portal/types";

export const projectKinds = [
  "Business website",
  "Web app or dashboard",
  "Mobile application",
  "Existing software maintenance",
] as const;
export type ProjectKind = (typeof projectKinds)[number];
export type Responsibility = "client" | "owner";
export type TaskDefinition = {
  key: string;
  title: string;
  instructions: string;
  required: boolean;
  assignee: Responsibility;
};
export type TaskStatus = "open" | "draft" | "submitted" | "accepted" | "changes requested";
export type OnboardingTask = TaskDefinition & {
  id: string;
  status: TaskStatus;
  notes: string;
  url: string;
  submitted?: { actor: string; at: string };
  review?: { actor: string; at: string; feedback: string; decision: "accept" | "return" };
};
export type DeliveryEvent = {
  id: string;
  at: string;
  actor: string;
  name: string;
  action: string;
  project: string;
  task?: string;
};
export type DeliveryProject = {
  project: string;
  revision: number;
  kind: ProjectKind;
  template: "2026-11-12";
  extras: string[];
  preparedAt: string;
  preparedBy: string;
  source?: {
    fingerprint: string;
    proposal: string;
    revision: number;
    engagement: string;
    sandbox: boolean;
    at: string;
  };
  tasks: OnboardingTask[];
  schedule?: { date: string; actor: string; at: string };
  started?: { actor: string; at: string };
};
export type DeliveryState = {
  projects: DeliveryProject[];
  events: DeliveryEvent[];
  operations: { id: string; digest: string }[];
};
export const emptyDelivery = (): DeliveryState => ({ projects: [], events: [], operations: [] });
export type CommercialProject = {
  responsible: Responsibility;
  available: boolean;
  ready: boolean;
  sandbox: boolean;
  reasons: string[];
  fingerprint: string;
  engagement: string;
  proposal: string;
  revision: number;
  scope: string;
  invoices: { id: string; label: string; status: string; due?: number }[];
};
export type NextAction = {
  title: string;
  detail: string;
  responsible: Responsibility;
  task?: string;
  priority: number;
};
export type ProjectStatus = {
  stage:
    | "Setup pending"
    | "Commercial review"
    | "Scope review"
    | "Onboarding"
    | "Ready to schedule"
    | "Scheduled"
    | "In progress";
  action: NextAction;
  accepted: number;
  required: number;
  readyToSchedule: boolean;
};
export type DeliveryProjectView = {
  client: Pick<Member, "id" | "name" | "email">;
  project: Pick<Project, "id" | "title" | "phase" | "brief"> & {
    latestUpdate?: { at: string; body: string; author: string };
  };
  delivery: DeliveryProject | null;
  commercial: CommercialProject;
  status: ProjectStatus;
  events: DeliveryEvent[];
};
export type DeliveryView = { me: Member; projects: DeliveryProjectView[]; generatedAt: string };
