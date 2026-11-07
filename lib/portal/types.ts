export const phases = ["Discovery", "Design", "Build", "Review", "Delivered"] as const;
export type Phase = (typeof phases)[number];
export type Member = { id: string; name: string; email: string; role: "owner" | "client" };
export type Credential = { id: string; publicKey: string; counter: number };
export type Account = Member & {
  credential?: Credential;
  invitation?: { hash: string; expires: number };
  sessions: { hash: string; expires: number }[];
  recentChallenges: { value: string; expires: number }[];
};
export type Directory = { accounts: Account[] };
export type Update = {
  id: string;
  at: string;
  author: string;
  body: string;
  phase: Phase;
  url?: string;
  review?: "requested" | "approved" | "changes requested";
  response?: string;
  respondedAt?: string;
};
export type Payment = {
  id: string;
  label: string;
  cents: number;
  status: "open" | "paid";
  sessionId?: string;
  attempt: number;
  startedAt?: number;
  paidAt?: string;
  test?: boolean;
};
export type Project = {
  id: string;
  title: string;
  brief: string;
  phase: Phase;
  created: string;
  updates: Update[];
  payments: Payment[];
};
export type Workspace = { projects: Project[] };
export type PortalView = {
  me: Member;
  clients: Member[];
  activeClient: Member | null;
  projects: Project[];
  paymentMode: "live" | "sandbox" | "offline";
};
