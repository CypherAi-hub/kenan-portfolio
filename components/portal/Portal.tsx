"use client";
import { useEffect, useState, useRef, useCallback, type FormEvent } from "react";
import { matchesAudience, workspacePath, loginPath, type Audience } from "@/lib/portal/access";
import {
  ArrowUpRight,
  LogOut,
  CircleCheck,
  Copy,
  Plus,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import type { PortalView, Project } from "@/lib/portal/types";
import { phases } from "@/lib/portal/types";
import StudioAssistant, { Appointments } from "./StudioAssistant";
import NotificationCenter from "./NotificationCenter";
import ProjectConnections from "./ProjectConnections";
import Link from "next/link";
const dollars = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
type Payload = Record<string, unknown>;
async function post(body: Payload) {
  const response = await fetch("/api/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Please try again.");
  return data;
}
function message(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
function useWorkspace() {
  const [view, setView] = useState<PortalView | null>(null),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState("");
  const latestRequest = useRef(0);
  const load = useCallback(async (id?: string) => {
    const request = ++latestRequest.current;
    const response = await fetch("/api/portal" + (id ? "?client=" + encodeURIComponent(id) : ""), {
      cache: "no-store",
    });
    if (request !== latestRequest.current) return;
    if (response.status === 401) {
      setView(null);
      return;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    if (request === latestRequest.current) setView(data);
  }, []);
  useEffect(() => {
    void load()
      .catch((e) => setNotice(message(e)))
      .finally(() => setReady(true));
  }, [load]);
  const selected = view?.activeClient?.id;
  const signedIn = !!view;
  useEffect(() => {
    if (!signedIn) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void load(selected).catch(() => {});
    };
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 45000);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [load, signedIn, selected]);
  return { view, ready, notice, setNotice, load };
}
type Run = (body: Payload, success: string) => Promise<boolean>;
function Fields({
  submit,
  children,
  label,
}: {
  submit: (data: FormData) => Promise<boolean>;
  children: React.ReactNode;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = event.currentTarget;
    try {
      if (await submit(new FormData(form))) form.reset();
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="portal-form" onSubmit={send}>
      {children}
      <button className="portal-btn" disabled={busy}>
        {busy ? "Saving…" : label}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
const fieldValues = (data: FormData) => Object.fromEntries(data.entries());
function ProjectPanel({
  project,
  owner,
  run,
  mode,
}: {
  project: Project;
  owner: boolean;
  run: Run;
  mode: PortalView["paymentMode"];
}) {
  const [tab, setTab] = useState<"Progress" | "Payments">("Progress");
  const [paying, setPaying] = useState(false);
  const scoped = (values: Payload, note: string) => run({ ...values, project: project.id }, note);
  return (
    <article className="portal-panel">
      <div className="portal-project-heading">
        <span className="portal-kicker">PROJECT</span>
        <h2>{project.title}</h2>
        <p>{project.brief}</p>
      </div>
      <ol className="phase-track" aria-label="Project phases">
        {phases.map((phase, i) => (
          <li
            key={phase}
            className={i <= phases.indexOf(project.phase) ? "reached" : ""}
            aria-current={phase === project.phase ? "step" : undefined}
          >
            <span />
            {phase}
          </li>
        ))}
      </ol>
      <div className="portal-tabs" aria-label="Project sections">
        {(["Progress", "Payments"] as const).map((t) => (
          <button onClick={() => setTab(t)} aria-pressed={t === tab} key={t}>
            {t} <small>{t === "Progress" ? project.updates.length : project.payments.length}</small>
          </button>
        ))}
      </div>
      {tab === "Progress" ? (
        <>
          {owner && (
            <details className="portal-editor">
              <summary>
                Post a project update <Plus size={16} />
              </summary>
              <Fields
                label="Publish update"
                submit={(d) =>
                  scoped(
                    { action: "update", ...fieldValues(d), review: d.has("review") },
                    "Your update is visible to the client.",
                  )
                }
              >
                <label>
                  Current phase
                  <select name="phase" defaultValue={project.phase}>
                    {phases.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  What changed?
                  <textarea
                    name="body"
                    required
                    maxLength={4000}
                    placeholder="Describe what’s ready and what happens next."
                  />
                </label>
                <label>
                  Preview or deliverable link (optional)
                  <input type="url" name="url" placeholder="https://" />
                </label>
                <label className="portal-check">
                  <input name="review" type="checkbox" />
                  Ask the client to approve this update
                </label>
              </Fields>
            </details>
          )}
          <div className="portal-timeline">
            {project.updates.map((u) => (
              <section key={u.id} className="portal-update">
                <div className="portal-dot" />
                <div>
                  <p className="portal-byline">
                    {u.author} <span>· {date(u.at)}</span>
                  </p>
                  <p className="portal-body">{u.body}</p>
                  {u.url && (
                    <a href={u.url} target="_blank" rel="noreferrer">
                      Open project preview <ArrowUpRight size={15} />
                    </a>
                  )}
                  {u.review && (
                    <div className="portal-review">
                      <strong>
                        {u.review === "requested"
                          ? "Client review requested"
                          : u.review === "approved"
                            ? "Approved by client"
                            : "Changes requested"}
                      </strong>
                      {u.respondedAt && <small>{date(u.respondedAt)}</small>}
                      {u.response && <p>{u.response}</p>}
                      {!owner && u.review === "requested" && (
                        <Fields
                          label="Submit review"
                          submit={(d) =>
                            scoped(
                              { action: "review", update: u.id, ...fieldValues(d) },
                              "Your review has been recorded.",
                            )
                          }
                        >
                          <label>
                            Decision
                            <select name="decision">
                              <option value="approved">Approve this update</option>
                              <option value="changes requested">Request changes</option>
                            </select>
                          </label>
                          <label>
                            Feedback
                            <textarea name="body" maxLength={3000} />
                          </label>
                        </Fields>
                      )}
                    </div>
                  )}
                </div>
              </section>
            ))}
            <section className="portal-update">
              <div className="portal-dot" />
              <div>
                <p className="portal-byline">
                  Project opened <span>· {date(project.created)}</span>
                </p>
              </div>
            </section>
          </div>
          {!owner && (
            <Fields
              label="Send message"
              submit={(d) =>
                scoped(
                  { action: "comment", ...fieldValues(d) },
                  "Your message is on the project timeline.",
                )
              }
            >
              <label>
                Message Kenan
                <textarea
                  required
                  name="body"
                  maxLength={4000}
                  placeholder="Share feedback or ask about your project."
                />
              </label>
            </Fields>
          )}
        </>
      ) : (
        <>
          {owner && (
            <details className="portal-editor">
              <summary>
                Request a payment <Plus size={16} />
              </summary>
              <Fields
                label="Create payment request"
                submit={(d) =>
                  scoped({ action: "bill", ...fieldValues(d) }, "Payment request added.")
                }
              >
                <label>
                  Description
                  <input
                    name="label"
                    required
                    maxLength={120}
                    placeholder="Website design deposit"
                  />
                </label>
                <label>
                  Amount in US dollars
                  <input
                    type="number"
                    name="amount"
                    min=".50"
                    max="999999.99"
                    step=".01"
                    required
                    placeholder="750.00"
                  />
                </label>
              </Fields>
            </details>
          )}
          {mode === "offline" && (
            <p className="portal-note">
              Online payments are being connected.{" "}
              {owner
                ? "You can prepare requests now."
                : "Contact Kenan if you have a billing question."}
            </p>
          )}
          {mode === "sandbox" && (
            <p className="portal-note">Stripe test mode · use test payment details only.</p>
          )}
          {project.payments.length === 0 && (
            <p className="portal-empty">No payment requests for this project yet.</p>
          )}
          {project.payments.length > 0 && mode !== "offline" && (
            <p className="portal-note">
              Secure checkout offers eligible cards and wallets, including Apple Pay, Google Pay and
              Cash App Pay, plus supported crypto wallets. Checkout shows the eligible tokens and
              networks for crypto. Available options depend on your device, location and payment
              amount.
            </p>
          )}
          {project.payments.map((b) => (
            <section className="portal-invoice" key={b.id}>
              <div>
                <strong>{b.label}</strong>
                <small>
                  {b.status === "paid"
                    ? (b.test ? "Test payment" : "Paid") + " · " + date(b.paidAt!)
                    : b.processing
                      ? "Payment processing"
                      : "Awaiting payment"}
                </small>
              </div>
              <b>{dollars(b.cents)}</b>
              {b.processing && (
                <p className="portal-note">
                  Your payment is awaiting confirmation. This request updates automatically when it
                  clears.
                </p>
              )}
              {b.failure && (
                <p className="portal-note" role="status">
                  {b.failure}
                </p>
              )}
              {!owner && b.status === "open" && mode !== "offline" && (
                <button
                  className="portal-btn"
                  disabled={paying || b.processing}
                  onClick={async () => {
                    setPaying(true);
                    try {
                      await scoped({ action: "checkout", bill: b.id }, "Payment status refreshed.");
                    } finally {
                      setPaying(false);
                    }
                  }}
                >
                  {b.processing ? "Payment processing" : "Choose payment method"}{" "}
                  <ArrowUpRight size={15} />
                </button>
              )}
            </section>
          ))}
        </>
      )}
    </article>
  );
}
export default function Portal({ audience }: { audience: Audience }) {
  const { view, ready, notice, setNotice, load } = useWorkspace();
  const [share, setShare] = useState(""),
    [selected, setSelected] = useState("");
  useEffect(() => {
    const current = new URL(location.href);
    if (current.searchParams.get("checkout") === "returned")
      setNotice("You’re back from Stripe. Your payment status updates after confirmation.");
    if (current.searchParams.get("checkout") === "cancelled")
      setNotice("Checkout closed. Your payment request is still available.");
  }, [setNotice]);
  useEffect(() => {
    if (ready && !view) location.replace(loginPath(audience));
    else if (view && !matchesAudience(view.me, audience)) location.replace(workspacePath(view.me));
  }, [ready, view, audience]);
  const active = view?.activeClient,
    owner = view?.me.role === "owner";
  const run: Run = async (body, success) => {
    setNotice("");
    try {
      const data = await post({ client: active?.id, ...body });
      if (data.url) {
        location.assign(data.url);
        return true;
      }
      if (data.invitation) setShare(data.invitation);
      await load(data.client || active?.id);
      if (data.project) setSelected(data.project);
      setNotice(success);
      return true;
    } catch (e) {
      setNotice(message(e));
      return false;
    }
  };
  const project = view?.projects.find((p) => p.id === selected) || view?.projects[0];
  if (!ready)
    return (
      <div className="portal-shell portal-loading" aria-live="polite">
        Opening workspace…
      </div>
    );
  if (!view || !matchesAudience(view.me, audience))
    return (
      <div className="portal-shell portal-loading" aria-live="polite">
        Opening your workspace…
      </div>
    );
  const unpaid = view.projects.reduce(
    (a, p) => a + p.payments.filter((b) => b.status === "open").reduce((n, b) => n + b.cents, 0),
    0,
  );
  const reviews = view.projects.reduce(
    (a, p) => a + p.updates.filter((u) => u.review === "requested").length,
    0,
  );
  return (
    <div className="portal-shell portal-dash">
      {owner && (
        <StudioAssistant
          onChange={() => {
            void load(active?.id);
            window.dispatchEvent(new Event("kjl-workspace-update"));
          }}
        />
      )}
      <div className="portal-top">
        <div>
          <p className="portal-kicker">{owner ? "STUDIO DASHBOARD" : "CLIENT WORKSPACE"}</p>
          <h1>{owner ? "Project desk" : view.me.name + "’s workspace"}</h1>
        </div>
        <button
          className="portal-quiet"
          onClick={async () => {
            try {
              await post({ action: "logout" });
              setShare("");
              await load();
            } catch (e) {
              setNotice(message(e));
            }
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <NotificationCenter key={view.me.id} />
      {owner && (
        <Link className="portal-quiet" href="/studio/inquiries">
          <FolderOpen size={17} /> Project inquiries & briefs <ArrowRight size={16} />
        </Link>
      )}
      {owner && <ProjectConnections />}
      <Appointments
        owner={owner}
        onChange={() => {
          void load(active?.id);
        }}
      />
      {notice && (
        <p role="status" className="portal-notice">
          {notice}
        </p>
      )}
      <div className="portal-columns">
        <aside className="portal-sidebar">
          {owner && (
            <>
              <h2>
                Clients <span>{view.clients.length}</span>
              </h2>
              {view.clients.map((c) => (
                <button
                  className="portal-client"
                  key={c.id}
                  aria-pressed={active?.id === c.id}
                  onClick={async () => {
                    setShare("");
                    setSelected("");
                    try {
                      await load(c.id);
                    } catch (e) {
                      setNotice(message(e));
                    }
                  }}
                >
                  {c.name}
                  <small>{c.email}</small>
                </button>
              ))}
              <details className="portal-editor">
                <summary>
                  Add a client <Plus size={15} />
                </summary>
                <Fields
                  label="Create invitation"
                  submit={(d) =>
                    run(
                      { action: "invite", ...fieldValues(d) },
                      "Invitation created. Send the private link directly to your client.",
                    )
                  }
                >
                  <label>
                    Client name
                    <input name="name" autoComplete="off" required maxLength={100} />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" required maxLength={254} />
                  </label>
                </Fields>
              </details>
            </>
          )}
          {share && (
            <div className="portal-share">
              <strong>Private invitation</strong>
              <p>Valid for seven days. Share directly with this client.</p>
              <input
                readOnly
                value={share}
                aria-label="Private invitation link"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(share);
                    setNotice("Invitation copied.");
                  } catch {
                    setNotice("Select and copy the invitation link.");
                  }
                }}
              >
                <Copy size={14} /> Copy invite
              </button>
            </div>
          )}
          {active && (
            <>
              <h2>
                Projects <span>{view.projects.length}</span>
              </h2>
              {view.projects.map((p) => (
                <button
                  className="portal-client"
                  aria-pressed={p.id === project?.id}
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                >
                  {p.title}
                  <small>{p.phase}</small>
                </button>
              ))}
              {owner && (
                <>
                  <details className="portal-editor">
                    <summary>
                      Add a project <Plus size={15} />
                    </summary>
                    <Fields
                      label="Open project"
                      submit={(d) =>
                        run({ action: "project", ...fieldValues(d) }, "Project opened.")
                      }
                    >
                      <label>
                        Project name
                        <input name="title" required maxLength={120} />
                      </label>
                      <label>
                        Agreed scope
                        <textarea name="brief" required maxLength={2400} />
                      </label>
                    </Fields>
                  </details>
                  <details className="portal-editor">
                    <summary>Client access</summary>
                    <p>This replaces the client’s passkey and signs out their devices.</p>
                    <button
                      onClick={() => run({ action: "renew" }, "A replacement invitation is ready.")}
                    >
                      Replace invitation
                    </button>
                  </details>
                </>
              )}
            </>
          )}
        </aside>
        <div className="portal-main">
          {active && (
            <>
              <div className="portal-context">
                <span>{active.name}</span>
                <button
                  onClick={() =>
                    load(active.id)
                      .then(() => setNotice("Workspace refreshed."))
                      .catch((e) => setNotice(message(e)))
                  }
                >
                  Refresh
                </button>
              </div>
              <div className="portal-stats">
                <div>
                  <span>Projects</span>
                  <strong>{view.projects.length}</strong>
                </div>
                <div>
                  <span>Awaiting review</span>
                  <strong>{reviews}</strong>
                </div>
                <div>
                  <span>Outstanding</span>
                  <strong>{dollars(unpaid)}</strong>
                </div>
              </div>
            </>
          )}
          {project ? (
            <ProjectPanel
              key={project.id}
              project={project}
              owner={owner}
              run={run}
              mode={view.paymentMode}
            />
          ) : (
            <div className="portal-panel portal-blank">
              {active ? <FolderOpen size={32} /> : <CircleCheck size={32} />}
              <h2>{active ? "Ready for the first project" : "Your studio is ready"}</h2>
              <p>
                {owner
                  ? active
                    ? "Add a project to share its scope, progress, and payments."
                    : "Add your first client to create their invitation and workspace."
                  : "Kenan will post your project here once the scope is agreed."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
