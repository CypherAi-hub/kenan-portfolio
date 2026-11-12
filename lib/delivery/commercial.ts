import { createHash } from "node:crypto";
import { origin } from "../portal/auth";
import { readBody } from "../portal/request";
import type { CommercialProject } from "./types";

type Json = Record<string, unknown>;
const object = (v: unknown): Json =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};
const rows = (v: unknown) => (Array.isArray(v) ? v.map(object) : []);
const string = (v: unknown) => (typeof v === "string" ? v : "");
export function unavailable(
  reason = "Commercial verification is not available yet.",
): CommercialProject {
  return {
    responsible: "owner",
    available: false,
    ready: false,
    sandbox: false,
    reasons: [reason],
    fingerprint: "",
    engagement: "",
    proposal: "",
    revision: 0,
    scope: "",
    invoices: [],
  };
}
export function commercialProject(
  data: unknown,
  clientId: string,
  projectId: string,
): CommercialProject {
  if (data == null) return unavailable();
  const root = object(data),
    w = object(root.workspace);
  if (object(w.client).id !== clientId || typeof root.sandbox !== "boolean")
    return unavailable("Commercial records could not be matched to this client.");
  const matches = rows(w.engagements).filter(
    (e) => e.project === projectId && e.status !== "completed",
  );
  if (matches.length !== 1)
    return unavailable(
      matches.length
        ? "More than one commercial engagement is linked. Kenan needs to select the correct scope."
        : "The project needs a linked commercial engagement.",
    );
  const e = matches[0],
    gate = object(object(root.gates)[string(e.id)]);
  if (
    typeof gate.ready !== "boolean" ||
    !Array.isArray(gate.reasons) ||
    typeof gate.paymentDefined !== "boolean"
  )
    return unavailable();
  const p = rows(w.proposals).find((p) => p.id === e.proposal && p.engagement === e.id);
  const agreements = rows(w.agreements).filter((a) => a.engagement === e.id && a.required === true);
  const signed =
    agreements.length > 0 &&
    agreements.every((a) => {
      const completion = object(a.completion),
        latest = rows(a.versions).at(-1);
      return (
        a.status === "completed" &&
        latest?.id === completion.version &&
        a.signingVersion === completion.version &&
        completion.provider === "docusign" &&
        completion.environment === (root.sandbox ? "sandbox" : "production") &&
        !!string(completion.artifact) &&
        !!string(completion.certificate)
      );
    });
  const accepted =
    p?.status === "accepted" &&
    object(p.accepted).actor === clientId &&
    !!string(object(p.accepted).hash) &&
    Number.isInteger(p.revision);
  const ready = gate.ready === true && gate.paymentDefined === true && accepted && signed;
  const reasons = gate.reasons.filter((r): r is string => typeof r === "string").slice(0, 12);
  if (!ready && !reasons.length)
    reasons.push("Commercial evidence needs review before onboarding can begin.");
  const references = agreements
    .map((a) => ({ id: a.id, version: object(a.completion).version }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return {
    responsible:
      p?.status === "offered" ||
      agreements.some((a) => a.status === "sent") ||
      rows(w.invoices).some((i) => i.engagement === e.id && i.status === "open")
        ? "client"
        : "owner",
    available: true,
    ready: !!ready,
    sandbox: root.sandbox,
    reasons,
    fingerprint:
      accepted && signed
        ? createHash("sha256")
            .update(
              JSON.stringify({
                clientId,
                projectId,
                engagement: e.id,
                proposal: p?.id,
                revision: p?.revision,
                acceptance: object(p?.accepted).hash,
                agreements: references,
                sandbox: root.sandbox,
              }),
            )
            .digest("hex")
        : "",
    engagement: string(e.id),
    proposal: string(p?.id),
    revision: Number(p?.revision) || 0,
    scope: string(p?.scope).slice(0, 3000),
    invoices: rows(w.invoices)
      .filter((i) => i.engagement === e.id && i.status === "open")
      .slice(0, 30)
      .map((i) => ({
        id: string(i.id),
        label: string(i.label),
        status: "open",
        due: typeof i.due === "number" ? i.due : undefined,
      })),
  };
}
export async function readCommercial(clientId: string, cookie: string | null): Promise<unknown> {
  const session = cookie?.match(
    /(?:^|;)\s*((?:__Host-)?kjl-session=[A-Za-z0-9_-]{43})(?:;|$)/,
  )?.[1];
  if (!session) return null;
  try {
    // Fixed trusted application origin and path only; never fetch a submitted sharing link.
    const url = new URL("/api/portal/business", origin());
    url.searchParams.set("client", clientId);
    const response = await fetch(url, {
      headers: { cookie: session, accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json"))
      return null;
    return JSON.parse(
      await readBody(
        new Request(url, { method: "POST", body: response.body, duplex: "half" } as RequestInit),
        2_000_000,
      ),
    );
  } catch {
    return null;
  }
}
