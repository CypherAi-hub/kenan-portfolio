"use client";
import { useState } from "react";
import { ArrowDownToLine, CheckCircle2, FileCheck2, Plus } from "lucide-react";
import type { DeliveryProjectView } from "@/lib/delivery/types";
import type { Run } from "./DeliveryHub";
import ui from "./delivery.module.css";
import s from "./milestones.module.css";

const time = (at: string) =>
  new Date(at).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
export default function Milestones({
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
  dirty: (v: boolean) => void;
  canLeave: () => boolean;
}) {
  const [selected, setSelected] = useState(""),
    [editingTriage, setEditingTriage] = useState(false);
  const d = item.delivery;
  if (!d) return null;
  const milestones = d.milestones || [],
    m =
      milestones.find((m) => m.id === selected) ||
      (selected === "new"
        ? undefined
        : milestones.find((m) => m.id === item.status.action.milestone) || milestones[0]);
  const latest = m?.versions.at(-1),
    revision = m?.revisions.find((r) => !r.addressedBy),
    decision = revision?.triage.at(-1)?.decision;
  const enabled =
    !!d.started && item.commercial.ready && item.commercial.fingerprint === d.source?.fingerprint;
  const scopeChanged = latest && latest.source.fingerprint !== d.source?.fingerprint;
  const triage = !!revision && (editingTriage || !decision || decision === "more_info");
  const blockedScope = revision && decision === "change_order_required" && !scopeChanged;
  const pick = (id: string) => {
    if (canLeave()) {
      dirty(false);
      setSelected(id);
      setEditingTriage(false);
    }
  };
  const download = (version: string) =>
    `/api/portal/delivery/artifact?${new URLSearchParams({ client: item.client.id, project: item.project.id, version })}`;
  const submit =
    (action: string, message: string) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const values = Object.fromEntries([...form].filter(([key]) => key !== "file"));
      const file = form.get("file");
      const ok = await run(
        {
          action,
          milestone: m?.id,
          task: revision?.id,
          version: latest?.id,
          ...values,
          scopeConfirmed: form.get("scopeConfirmed") === "on",
          amendmentConfirmed: form.get("amendmentConfirmed") === "on",
          confirmed: form.get("confirmed") === "on",
        },
        message,
        file instanceof File ? file : undefined,
      );
      if (ok) {
        setEditingTriage(false);
        if (action === "create-milestone") setSelected("");
      }
    };
  return (
    <section className={s.section} id="milestones" aria-label="Milestones and deliverables">
      <header className={s.header}>
        <div>
          <p className={ui.eyebrow}>DELIVERY / REVIEW / DECISION</p>
          <h3>Work you can review.</h3>
          <p>Every version stays attached to its decision.</p>
        </div>
        <FileCheck2 size={30} />
      </header>
      {admin && (
        <div className={s.authority}>
          <div>
            <strong>Client approval authority</strong>
            <p>
              {d.approver
                ? `${item.client.name} can approve from their existing client account.`
                : "No client account is designated. Publishing and signoff are paused."}
            </p>
          </div>
          <button
            className={ui.secondary}
            disabled={busy}
            onClick={() => {
              if (canLeave())
                void run(
                  { action: "designate-approver", approver: d.approver ? "" : item.client.id },
                  d.approver ? "Client approval authority revoked." : "Client approver designated.",
                );
            }}
          >
            {d.approver ? "Revoke approval authority" : `Designate ${item.client.name}`}
          </button>
        </div>
      )}
      {!enabled && (
        <p className={s.note}>
          Publishing and review require the approved development start and current commercial scope.
          Saved files and decisions remain available.
        </p>
      )}
      <nav className={s.tabs} aria-label="Delivery milestones">
        {milestones.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={busy}
            aria-pressed={
              selected !== "new" &&
              m.id ===
                (milestones.find((x) => x.id === selected)?.id ||
                  item.status.action.milestone ||
                  milestones[0]?.id)
            }
            onClick={() => pick(m.id)}
          >
            {m.title}
            <small>
              {m.versions.at(-1)?.review?.decision === "approve"
                ? "Approved"
                : m.versions.length
                  ? `V${m.versions.length}`
                  : "Not published"}
            </small>
          </button>
        ))}
        {admin && (
          <button
            type="button"
            disabled={busy || !enabled}
            aria-pressed={selected === "new"}
            onClick={() => pick("new")}
          >
            <Plus size={15} />
            New milestone
          </button>
        )}
      </nav>
      {!m ? (
        admin && enabled ? (
          <form
            key={`new:${d.revision}`}
            className={s.form}
            onChange={() => dirty(true)}
            onSubmit={submit("create-milestone", "Milestone created.")}
          >
            <h4>Define the next deliverable</h4>
            <label>
              Milestone title
              <input name="title" required maxLength={180} disabled={busy} />
            </label>
            <label>
              Acceptance criteria
              <textarea
                name="criteria"
                required
                rows={4}
                maxLength={3000}
                disabled={busy}
                placeholder="Describe the agreed work the client should review."
              />
            </label>
            <label>
              Agreed due date <span>(optional)</span>
              <input type="date" name="due" disabled={busy} />
            </label>
            <button className={ui.primary} disabled={busy}>
              Create milestone
            </button>
          </form>
        ) : (
          <p className={s.empty}>
            Published milestones will appear here when the project reaches delivery.
          </p>
        )
      ) : (
        <div className={s.detail}>
          <div className={s.title}>
            <div>
              <h4>{m.title}</h4>
              <p>{m.criteria}</p>
            </div>
            {m.due && <span>Due {m.due}</span>}
          </div>
          {latest ? (
            <div className={s.artifact}>
              <div>
                <span className={s.version}>VERSION {latest.number}</span>
                <h5>{latest.artifact.name}</h5>
                <p>{latest.summary}</p>
                <small>
                  Published {time(latest.publishedAt)} Central ·{" "}
                  {Math.ceil(latest.artifact.size / 1024)} KB
                </small>
              </div>
              <a className={ui.primary} href={download(latest.id)}>
                <ArrowDownToLine size={16} />
                Download V{latest.number}
              </a>
            </div>
          ) : (
            <p className={s.empty}>No artifact has been published for this milestone yet.</p>
          )}
          {latest?.review && (
            <div className={latest.review.decision === "approve" ? s.accepted : s.feedback}>
              <CheckCircle2 size={18} />
              <div>
                <strong>
                  {latest.review.decision === "approve"
                    ? `V${latest.number} approved`
                    : `Revisions requested for V${latest.number}`}
                </strong>
                <p>{latest.review.feedback || "Approved without additional feedback."}</p>
                <small>
                  {latest.review.name} · {time(latest.review.at)} Central
                </small>
              </div>
            </div>
          )}
          {revision && (
            <div className={s.feedback}>
              <div>
                <strong>
                  Linked revision · V{m.versions.find((v) => v.id === revision.version)?.number}
                </strong>
                <p>{revision.feedback}</p>
                <p>
                  {decision === "included"
                    ? "Kenan classified this revision as included in the approved scope."
                    : decision === "change_order_required"
                      ? "Additional scope requires commercial approval before another version can be published."
                      : "Kenan needs to review the request against the signed scope."}
                </p>
                {revision.triage.at(-1) && <p>{revision.triage.at(-1)!.reason}</p>}
                {admin && revision.changeDraft && (
                  <details>
                    <summary>Internal scope-change draft</summary>
                    <p>{revision.changeDraft.description}</p>
                    <p>
                      Commercial approval required. No price, invoice or additional work has been
                      authorized by this draft.
                    </p>
                  </details>
                )}
                {admin && decision && !triage && (
                  <button
                    type="button"
                    className={ui.secondary}
                    disabled={busy || !enabled}
                    onClick={() => {
                      if (canLeave()) {
                        dirty(false);
                        setEditingTriage(true);
                      }
                    }}
                  >
                    Review scope again
                  </button>
                )}
              </div>
            </div>
          )}
          {admin && enabled && triage ? (
            <form
              key={`triage:${m.id}:${d.revision}`}
              className={s.form}
              onChange={() => dirty(true)}
              onSubmit={submit("triage-revision", "Revision scope recorded.")}
            >
              <h4>Review revision scope</h4>
              <label>
                Scope classification
                <select
                  name="decision"
                  aria-label="Scope classification"
                  defaultValue={decision || "more_info"}
                  disabled={busy}
                >
                  <option value="more_info">Need more information</option>
                  <option value="included">Included in the signed scope</option>
                  <option value="change_order_required">Requires a change order</option>
                </select>
              </label>
              <label>
                Reason shown to the client
                <textarea name="reason" required maxLength={2000} rows={3} disabled={busy} />
              </label>
              <button className={ui.primary} disabled={busy}>
                Save scope review
              </button>
            </form>
          ) : null}
          {admin &&
            enabled &&
            !triage &&
            !blockedScope &&
            latest?.review?.decision !== "approve" && (
              <form
                key={`publish:${m.id}:${d.revision}`}
                className={s.form}
                onChange={() => dirty(true)}
                onSubmit={submit("publish-version", "Deliverable published for client review.")}
              >
                <h4>{latest ? `Publish V${latest.number + 1}` : "Publish the first version"}</h4>
                <label>
                  Deliverable file
                  <input
                    type="file"
                    name="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                    disabled={busy || !d.approver}
                  />
                </label>
                <p className={s.hint}>
                  PDF, PNG, JPEG, WebP or plain text · up to 3 MB. Files download privately and are
                  not displayed as active page content.
                </p>
                <label>
                  Version summary
                  <textarea name="summary" required maxLength={3000} rows={3} disabled={busy} />
                </label>
                <label className={s.check}>
                  <input type="checkbox" name="scopeConfirmed" required disabled={busy} />
                  This deliverable matches the current accepted scope and milestone criteria.
                </label>
                {decision === "change_order_required" && scopeChanged && (
                  <label className={s.check}>
                    <input type="checkbox" name="amendmentConfirmed" required disabled={busy} />
                    The new verified commercial baseline expressly covers this requested change.
                  </label>
                )}
                <button className={ui.primary} disabled={busy || !d.approver}>
                  Publish for client review
                </button>
              </form>
            )}
          {!admin && latest && !latest.review && (
            <>
              {scopeChanged ? (
                <p className={s.note}>
                  The signed scope changed. Kenan needs to publish a version under the current scope
                  before you review it.
                </p>
              ) : (
                <form
                  key={`review:${latest.id}:${d.revision}`}
                  className={s.form}
                  onChange={() => dirty(true)}
                  onSubmit={submit("review-version", "Your deliverable decision was recorded.")}
                >
                  <h4>Your decision on V{latest.number}</h4>
                  <label>
                    Review decision
                    <select
                      aria-label="Review decision"
                      name="decision"
                      disabled={busy || !enabled || d.approver !== item.client.id}
                    >
                      <option value="approve">Approve this version</option>
                      <option value="request_changes">Request revisions</option>
                    </select>
                  </label>
                  <label>
                    Review feedback <span>(required for revisions)</span>
                    <textarea
                      name="feedback"
                      maxLength={3000}
                      rows={3}
                      disabled={busy || !enabled || d.approver !== item.client.id}
                    />
                  </label>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      name="confirmed"
                      required
                      disabled={busy || !enabled || d.approver !== item.client.id}
                    />
                    I reviewed {latest.artifact.name}, version {latest.number}, against the
                    acceptance criteria above.
                  </label>
                  <p className={s.hint}>
                    This decision records your review of this file. Requesting a change does not
                    authorize additional charges.
                  </p>
                  <button
                    className={ui.primary}
                    disabled={busy || !enabled || d.approver !== item.client.id}
                  >
                    Record my decision
                  </button>
                </form>
              )}
            </>
          )}
          {!!m.versions.length && (
            <details className={s.history}>
              <summary>Version history & file evidence ({m.versions.length})</summary>
              {[...m.versions].reverse().map((v) => (
                <div key={v.id}>
                  <a href={download(v.id)}>
                    V{v.number} · {v.artifact.name}
                  </a>
                  <p>
                    {v.review
                      ? `${v.review.decision === "approve" ? "Approved" : "Revisions requested"} by ${v.review.name} on ${time(v.review.at)} Central`
                      : v.id === latest?.id
                        ? "Awaiting client review"
                        : "Superseded before a decision"}
                  </p>
                  <small>
                    SHA-256 <code>{v.artifact.sha256}</code>
                  </small>
                  {v.review?.feedback && <p>{v.review.feedback}</p>}
                </div>
              ))}
            </details>
          )}
        </div>
      )}
    </section>
  );
}
