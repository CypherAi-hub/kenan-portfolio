"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import {
  projectKinds,
  type DeliveryProjectView,
  type DeliveryView,
  type OnboardingTask,
} from "@/lib/delivery/types";
import styles from "./delivery.module.css";

type Run = (input: Record<string, unknown>, success: string) => Promise<boolean>;
async function api(body?: unknown): Promise<DeliveryView> {
  const response = await fetch(
    "/api/portal/delivery",
    body
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to open the delivery workspace.");
  return result;
}
const date = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });

function TaskForm({
  task,
  admin,
  enabled,
  busy,
  run,
  dirty,
}: {
  task: OnboardingTask;
  admin: boolean;
  enabled: boolean;
  busy: boolean;
  run: Run;
  dirty: (value: boolean) => void;
}) {
  const [notes, setNotes] = useState(task.notes),
    [url, setUrl] = useState(task.url),
    [feedback, setFeedback] = useState("");
  const mine = task.assignee === (admin ? "owner" : "client");
  const editable = mine && !["accepted", "submitted"].includes(task.status) && enabled;
  return (
    <div className={styles.taskForm}>
      <div className={styles.taskTitle}>
        <span className={styles.eyebrow}>
          {task.required ? "REQUIRED" : "OPTIONAL"} ·{" "}
          {task.assignee === "owner" ? "KENAN" : "CLIENT"}
        </span>
        <span className={styles.tag}>{task.status}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.instructions}</p>
      {task.review?.feedback && (
        <p className={styles.feedback}>
          <strong>Kenan’s feedback:</strong> {task.review.feedback}
        </p>
      )}
      {editable ? (
        <>
          <label htmlFor="delivery-notes">Notes for this item</label>
          <textarea
            id="delivery-notes"
            rows={5}
            value={notes}
            maxLength={4000}
            disabled={busy}
            onChange={(e) => {
              setNotes(e.target.value);
              dirty(e.target.value !== task.notes || url !== task.url);
            }}
            placeholder="Share the details needed to complete this item."
          />
          <label htmlFor="delivery-link">
            HTTPS sharing link <span>(optional)</span>
          </label>
          <input
            id="delivery-link"
            type="url"
            value={url}
            maxLength={2000}
            disabled={busy}
            onChange={(e) => {
              setUrl(e.target.value);
              dirty(notes !== task.notes || e.target.value !== task.url);
            }}
            placeholder="https://…"
          />
          <p className={styles.hint}>
            Use controlled sharing links or provider invitations. Keep passwords, API keys and
            production personal data out of these fields.
          </p>
          <div className={styles.buttons}>
            <button
              className={styles.secondary}
              disabled={busy}
              onClick={() =>
                void run(
                  { action: "save-task", task: task.id, notes, url },
                  "Draft saved. You can return to this item later.",
                )
              }
            >
              Save draft
            </button>
            <button
              className={styles.primary}
              disabled={busy || (!notes.trim() && !url.trim())}
              onClick={() =>
                void run(
                  { action: "submit-task", task: task.id, notes, url },
                  admin ? "Owner verification recorded." : "Submitted for Kenan’s review.",
                )
              }
            >
              {admin ? "Record verification" : "Submit for review"}
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.response}>{task.notes || "No notes submitted yet."}</p>
          {task.url && (
            <a
              className={styles.textLink}
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open shared reference <ArrowUpRight size={16} />
            </a>
          )}
          {task.submitted && (
            <p className={styles.hint}>Submitted {date(task.submitted.at)} Central</p>
          )}
          {task.review && <p className={styles.hint}>Reviewed {date(task.review.at)} Central</p>}
        </>
      )}
      {admin && enabled && ["submitted", "accepted"].includes(task.status) && (
        <div className={styles.review}>
          <label htmlFor="delivery-feedback">
            Review feedback{" "}
            <span>
              {task.status === "accepted" ? "(required to return)" : "(required for changes)"}
            </span>
          </label>
          <textarea
            id="delivery-feedback"
            rows={3}
            value={feedback}
            maxLength={2000}
            disabled={busy}
            onChange={(e) => {
              setFeedback(e.target.value);
              dirty(Boolean(e.target.value));
            }}
          />
          <div className={styles.buttons}>
            <button
              className={styles.secondary}
              disabled={busy || !feedback.trim()}
              onClick={() =>
                void run(
                  { action: "review-task", task: task.id, decision: "return", feedback },
                  "Item returned with your feedback.",
                )
              }
            >
              Request changes
            </button>
            {task.status === "submitted" && (
              <button
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  void run(
                    { action: "review-task", task: task.id, decision: "accept", feedback },
                    "Onboarding item accepted.",
                  )
                }
              >
                <Check size={16} />
                Accept item
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function ProjectPane({
  item,
  admin,
  busy,
  run,
  dirty,
  canLeave,
}: {
  item: DeliveryProjectView;
  admin: boolean;
  busy: boolean;
  run: Run;
  dirty: (value: boolean) => void;
  canLeave: () => boolean;
}) {
  const [kind, setKind] = useState(item.delivery?.kind || projectKinds[0]),
    [extras, setExtras] = useState(item.delivery?.extras.join("\n") || "");
  const [activeTask, setActiveTask] = useState(""),
    [startDate, setStartDate] = useState(""),
    [scopeConfirmed, setScopeConfirmed] = useState(false);
  const [taskGeneration, setTaskGeneration] = useState(0);
  const d = item.delivery,
    commercial = item.commercial;
  const task =
    d?.tasks.find((t) => t.id === activeTask) ||
    d?.tasks.find((t) => t.id === item.status.action.task) ||
    d?.tasks[0];
  const mine = item.status.action.responsible === (admin ? "owner" : "client");
  const enabled =
    commercial.ready && d?.source?.fingerprint === commercial.fingerprint && !d?.started;
  const scoped: Run = (input, message) =>
    run(
      { client: item.client.id, project: item.project.id, revision: d?.revision || 0, ...input },
      message,
    );
  return (
    <article className={styles.project} aria-busy={busy}>
      <div className={styles.projectHeading}>
        <div>
          <p className={styles.eyebrow}>{item.client.name}</p>
          <h2>{item.project.title}</h2>
        </div>
        <span className={styles.stage}>{item.status.stage}</span>
      </div>
      {commercial.available && commercial.sandbox && (
        <p className={styles.sandbox}>Sandbox commercial records · test project workflow</p>
      )}
      <section className={styles.next}>
        <p className={styles.eyebrow}>
          {mine
            ? "ACTION NEEDED FROM YOU"
            : `NEXT STEP · ${item.status.action.responsible === "owner" ? "KENAN" : item.client.name.toUpperCase()}`}
        </p>
        <h3>{item.status.action.title}</h3>
        <p>{item.status.action.detail}</p>
        <div className={styles.actionFooter}>
          <span>
            <Clock3 size={15} />
            {d?.schedule ? `Approved start · ${d.schedule.date}` : "Start date awaiting approval"}
          </span>
          {item.status.required > 0 && (
            <span>
              <ListChecks size={16} />
              {item.status.accepted} of {item.status.required} required items accepted
            </span>
          )}
        </div>
      </section>
      <div className={styles.context}>
        <div>
          <p className={styles.eyebrow}>PROJECT CONTEXT</p>
          <p>{item.project.brief}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>LATEST UPDATE</p>
          {item.project.latestUpdate ? (
            <>
              <p>{item.project.latestUpdate.body}</p>
              <small>
                {item.project.latestUpdate.author} · {date(item.project.latestUpdate.at)} Central
              </small>
            </>
          ) : (
            <p>No project update has been posted yet.</p>
          )}
        </div>
      </div>
      {commercial.available && (
        <details className={styles.scope}>
          <summary>Commercial scope & prerequisites</summary>
          <p>{commercial.scope || "The proposal is still being prepared."}</p>
          <p>
            {commercial.ready
              ? "The contracts service confirms proposal acceptance, required signatures and initial payment requirements."
              : commercial.reasons.join(" · ")}
          </p>
          <Link
            className={styles.textLink}
            href={admin ? "/studio/operations" : "/portal/operations"}
          >
            Open proposals, agreements & invoices
            <ArrowUpRight size={16} />
          </Link>
        </details>
      )}
      {admin && !d?.source && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>OWNER PREPARATION</p>
          <h3>Build the onboarding checklist</h3>
          <p>
            Choose the project type and add any specific information required by the agreed scope.
            The checklist opens after commercial verification.
          </p>
          <label htmlFor="delivery-kind">Project type</label>
          <select
            id="delivery-kind"
            value={kind}
            disabled={busy}
            onChange={(e) => {
              setKind(e.target.value as typeof kind);
              dirty(true);
            }}
          >
            {projectKinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <label htmlFor="delivery-extras">
            Additional agreed requirements <span>(optional, one per line)</span>
          </label>
          <textarea
            id="delivery-extras"
            rows={3}
            maxLength={1447}
            value={extras}
            disabled={busy}
            onChange={(e) => {
              setExtras(e.target.value);
              dirty(true);
            }}
            placeholder="e.g. Share the approved booking policy"
          />
          <button
            className={styles.primary}
            disabled={busy}
            onClick={() =>
              void scoped(
                {
                  action: "prepare",
                  kind,
                  extras: extras
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),
                },
                "Onboarding preparation saved.",
              )
            }
          >
            {d ? "Update preparation" : "Prepare checklist"}
            <ArrowRight size={16} />
          </button>
        </section>
      )}
      {admin &&
        d?.source &&
        commercial.ready &&
        d.source.fingerprint !== commercial.fingerprint && (
          <section className={styles.panel}>
            <h3>Re-review the changed scope</h3>
            <p>
              Existing answers will be retained for review. Previously accepted items and the start
              date must be reviewed again.
            </p>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={scopeConfirmed}
                onChange={(e) => setScopeConfirmed(e.target.checked)}
              />
              I reviewed the current accepted scope and will recheck these onboarding items.
            </label>
            <button
              className={styles.primary}
              disabled={busy || !scopeConfirmed}
              onClick={() =>
                void scoped(
                  { action: "adopt-scope", confirmed: scopeConfirmed },
                  "New scope linked. Required onboarding review has reopened.",
                )
              }
            >
              Reopen onboarding review
            </button>
          </section>
        )}
      {!!d?.tasks.length && (
        <section className={styles.checklist}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>GETTING READY</p>
              <h3>Your onboarding checklist</h3>
            </div>
            <span>
              {item.status.accepted}/{item.status.required} accepted
            </span>
          </div>
          <div className={styles.taskLayout}>
            <nav className={styles.taskList} aria-label="Onboarding items">
              {d.tasks.map((t) => (
                <button
                  key={t.id}
                  aria-current={task?.id === t.id ? "true" : undefined}
                  disabled={busy}
                  onClick={() => {
                    if (canLeave()) {
                      dirty(false);
                      setActiveTask(t.id);
                      setTaskGeneration((value) => value + 1);
                    }
                  }}
                >
                  <span className={t.status === "accepted" ? styles.doneIcon : styles.taskIcon}>
                    {t.status === "accepted" ? <Check size={15} /> : <span />}
                  </span>
                  <span>
                    <strong>{t.title}</strong>
                    <small>
                      {t.assignee === "owner" ? "Kenan" : item.client.name} · {t.status}
                    </small>
                  </span>
                </button>
              ))}
            </nav>
            {task && (
              <TaskForm
                key={task.id + ":" + d.revision + ":" + taskGeneration}
                task={task}
                admin={admin}
                enabled={!!enabled}
                busy={busy}
                run={scoped}
                dirty={dirty}
              />
            )}
          </div>
        </section>
      )}
      {admin && item.status.readyToSchedule && !d?.started && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>OWNER SCHEDULING</p>
          <h3>Choose when work begins</h3>
          <p>All required onboarding items are accepted. Dates use America/Chicago time.</p>
          <label htmlFor="delivery-date">Approved start date</label>
          <input
            id="delivery-date"
            type="date"
            value={startDate}
            disabled={busy}
            onChange={(e) => {
              setStartDate(e.target.value);
              dirty(true);
            }}
          />
          <div className={styles.buttons}>
            <button
              className={styles.secondary}
              disabled={busy || !startDate}
              onClick={() =>
                void scoped({ action: "schedule", date: startDate }, "Project start date approved.")
              }
            >
              Approve start date
            </button>
            {d?.schedule && (
              <button
                className={styles.primary}
                disabled={busy}
                onClick={() => void scoped({ action: "start" }, "Development workflow started.")}
              >
                Start development
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      )}
      {d?.started && commercial.ready && d.source?.fingerprint === commercial.fingerprint && (
        <p className={styles.success}>
          <CheckCircle2 size={18} />
          Development started {date(d.started.at)} Central.
        </p>
      )}
      <div className={styles.links}>
        <Link className={styles.textLink} href={admin ? "/studio" : "/portal"}>
          Project messages, reviews & payments
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <details className={styles.history}>
        <summary>Recent project activity ({item.events.length})</summary>
        {item.events.length ? (
          <ol>
            {item.events.map((e) => (
              <li key={e.id}>
                <strong>{e.action}</strong>
                <span>
                  {e.name} · {date(e.at)} Central
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p>No onboarding activity yet.</p>
        )}
      </details>
    </article>
  );
}
export default function DeliveryHub() {
  const [view, setView] = useState<DeliveryView | null>(null),
    [selected, setSelected] = useState("");
  const [reloadGeneration, setReloadGeneration] = useState(0);
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = useCallback(async (initialize = true) => {
    let result = await api();
    const waiting = result.projects.filter(
      (p) => p.delivery && !p.delivery.source && p.commercial.ready,
    );
    if (initialize && waiting.length) {
      for (const item of waiting)
        await api({
          action: "refresh",
          client: item.client.id,
          project: item.project.id,
          operation: crypto.randomUUID(),
        });
      result = await api();
    }
    setView(result);
    setSelected((current) => current || result.projects[0]?.project.id || "");
  }, []);
  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const canLeave = () => !dirty || window.confirm("Discard your unsaved onboarding changes?");
  const run: Run = async (input, message) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api({ ...input, operation: crypto.randomUUID() });
      setDirty(false);
      await load(false);
      setNotice(message);
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save. Keep your unsaved text and refresh before retrying.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };
  const admin = view?.me.role === "owner";
  const sorted = [...(view?.projects || [])].sort(
    (a, b) =>
      a.status.action.priority - b.status.action.priority ||
      a.project.title.localeCompare(b.project.title),
  );
  const item = sorted.find((p) => p.project.id === selected) || sorted[0];
  return (
    <div className={styles.hub}>
      <Link className={styles.back} href={admin ? "/studio" : "/portal"}>
        <ArrowLeft size={15} />
        Back to workspace
      </Link>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            {admin
              ? "KJL STUDIO / DELIVERY COMMAND CENTER"
              : "KJL DESIGNS / YOUR PROJECT WORKSPACE"}
          </p>
          <h1>
            {admin ? (
              <>
                Keep the next step <em>moving.</em>
              </>
            ) : (
              <>
                A clear path to <em>launch.</em>
              </>
            )}
          </h1>
          <p>
            {admin
              ? "Know who needs to act. Keep each project moving with a considered next step."
              : "Your project, your next step, and everything we need to get started."}
          </p>
        </div>
        <button
          className={styles.secondary}
          disabled={busy || loading}
          onClick={async () => {
            if (!canLeave()) return;
            setBusy(true);
            setError("");
            setNotice("");
            setDirty(false);
            try {
              await load();
              setReloadGeneration((value) => value + 1);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to refresh.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <RefreshCw size={16} />
          Refresh status
        </button>
      </header>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={styles.success} role="status">
          {notice}
        </p>
      )}
      {loading ? (
        <p className={styles.empty} role="status">
          Opening your delivery workspace…
        </p>
      ) : !item ? (
        <div className={styles.empty}>
          <ListChecks size={32} />
          <h2>{error ? "Workspace unavailable" : "Your next project starts here"}</h2>
          <p>
            {error
              ? "Refresh to try again."
              : admin
                ? "Create or connect a client project from the studio to prepare onboarding."
                : "Kenan will connect your project here when it is ready."}
          </p>
        </div>
      ) : (
        <>
          {admin && (
            <div className={styles.metrics}>
              <div>
                <span>
                  {
                    sorted.filter(
                      (p) =>
                        p.status.action.responsible === "owner" && p.status.stage !== "In progress",
                    ).length
                  }
                </span>
                <p>Need your attention</p>
              </div>
              <div>
                <span>{sorted.filter((p) => p.status.action.responsible === "client").length}</span>
                <p>Awaiting client</p>
              </div>
              <div>
                <span>{sorted.filter((p) => p.status.stage === "In progress").length}</span>
                <p>In development</p>
              </div>
              <div>
                <span>{sorted.length}</span>
                <p>Connected projects</p>
              </div>
            </div>
          )}
          <div className={styles.layout}>
            <aside className={styles.queue}>
              <p className={styles.eyebrow}>{admin ? "YOUR ACTION QUEUE" : "YOUR PROJECTS"}</p>
              <nav aria-label="Delivery projects">
                {sorted.map((p) => (
                  <button
                    key={p.project.id}
                    disabled={busy}
                    aria-current={p.project.id === item.project.id ? "page" : undefined}
                    onClick={() => {
                      if (canLeave()) {
                        setDirty(false);
                        setSelected(p.project.id);
                        setError("");
                        setNotice("");
                      }
                    }}
                  >
                    <small>{p.client.name}</small>
                    <strong>{p.project.title}</strong>
                    <span>{p.status.action.title}</span>
                    <small className={styles.queueStatus}>
                      {p.status.stage} ·{" "}
                      {p.status.action.responsible === "owner" ? "Kenan" : "Client"}
                    </small>
                  </button>
                ))}
              </nav>
              <p className={styles.queueNote}>
                Stages and next steps come from saved project records. Dates appear only after
                approval.
              </p>
            </aside>
            <ProjectPane
              key={item.project.id + ":" + reloadGeneration}
              item={item}
              admin={!!admin}
              busy={busy}
              run={run}
              dirty={setDirty}
              canLeave={canLeave}
            />
          </div>
        </>
      )}
    </div>
  );
}
