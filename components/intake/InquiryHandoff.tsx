"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import type { HandoffOptions, Inquiry } from "@/lib/intake/types";

async function api(query: string, body?: unknown) {
  const response = await fetch(
    "/api/portal/inquiries" + query,
    body
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to complete the project handoff.");
  return result;
}
type Props = {
  inquiry: Inquiry;
  busy: boolean;
  unsavedBrief: boolean;
  setBusy: (busy: boolean) => void;
  onChange: (inquiry: Inquiry) => Promise<void>;
  onDirty: (dirty: boolean) => void;
};
export default function InquiryHandoff({
  inquiry,
  busy,
  unsavedBrief,
  setBusy,
  onChange,
  onDirty,
}: Props) {
  const [options, setOptions] = useState<HandoffOptions>({ clients: [], projects: [] });
  const [clientId, setClientId] = useState(""),
    [projectId, setProjectId] = useState("");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [title, setTitle] = useState(""),
    [summary, setSummary] = useState("");
  const [confirmed, setConfirmed] = useState(false),
    [loading, setLoading] = useState(false);
  const [error, setError] = useState(""),
    [reload, setReload] = useState(0);
  const handoff = inquiry.handoff;
  useEffect(() => {
    onDirty(!handoff && Boolean(clientId || title || summary));
  }, [handoff, clientId, title, summary, onDirty]);
  useEffect(() => {
    if (handoff || inquiry.status !== "Reviewed") return;
    let current = true;
    setLoading(true);
    setError("");
    api("?handoff=options" + (clientId ? "&client=" + encodeURIComponent(clientId) : ""))
      .then((value) => {
        if (current) setOptions(value);
      })
      .catch((e) => {
        if (current) setError(e.message);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [clientId, handoff, inquiry.status, reload]);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const result = await api(
        "",
        handoff
          ? { action: "handoff", id: inquiry.id, resume: true }
          : {
              action: "handoff",
              id: inquiry.id,
              revision: inquiry.revision,
              clientId,
              projectId,
              mode,
              title,
              summary,
              confirmed,
            },
      );
      onDirty(false);
      await onChange(result.inquiry);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to complete the handoff.";
      // A response can fail after the destination is reserved or the project is written.
      // Recover the actual saved state instead of offering another create action.
      try {
        const result = await api("?id=" + encodeURIComponent(inquiry.id));
        if (result.inquiry.handoff) {
          await onChange(result.inquiry);
          if (result.inquiry.handoff.status === "linked") return;
        } else if (result.inquiry.revision !== inquiry.revision) {
          setError(message + " Reload the inquiry before trying again.");
          return;
        }
      } catch {
        /* Keep the original failure and allow an explicit reload. */
      }
      setError(message + " Reload the inquiry if the saved status is unclear.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="inbox-handoff" aria-labelledby="handoff-heading">
      <p className="eyebrow">NEXT STEP</p>
      <h3 id="handoff-heading">Connect this inquiry to a project</h3>
      {handoff ? (
        <>
          <p className="inbox-handoff-status" role="status">
            {handoff.status === "linked"
              ? "Connected to client project"
              : "Handoff saved · completion needed"}
          </p>
          <dl className="inbox-handoff-receipt">
            <div>
              <dt>Client</dt>
              <dd>
                {handoff.clientName} · {handoff.clientEmail}
              </dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>{handoff.title}</dd>
            </div>
            <div>
              <dt>Reviewed source</dt>
              <dd>Inquiry revision {handoff.sourceRevision}</dd>
            </div>
          </dl>
          {handoff.status === "pending" ? (
            <>
              <p>The destination is reserved. Resume to finish connecting this same project.</p>
              <button className="studio-button" disabled={busy} onClick={() => void submit()}>
                Resume project handoff
              </button>
            </>
          ) : (
            <>
              <p>
                The saved source stays attached to this handoff. Later brief edits are separate
                revisions.
              </p>
              <Link className="inbox-secondary" href="/studio">
                Open client workspaces <ArrowUpRight size={16} />
              </Link>
            </>
          )}
          {handoff.mode === "new" && (
            <details>
              <summary>Client-visible summary shared</summary>
              <p className="inbox-handoff-summary">{handoff.summary}</p>
            </details>
          )}
          <details>
            <summary>Reviewed source captured at handoff</summary>
            <pre>{handoff.sourceMarkdown}</pre>
          </details>
        </>
      ) : inquiry.status !== "Reviewed" || unsavedBrief ? (
        <p>Save the brief and mark it reviewed to choose a client and project.</p>
      ) : (
        <>
          <p>
            Choose the client account that should own this project. A new Discovery project will
            show only the title and summary you enter below.
          </p>
          {loading && <p role="status">Loading client workspaces…</p>}
          {!loading && !options.clients.length && !error ? (
            <p>
              No client accounts yet.{" "}
              <Link href="/studio">Create a client invitation in the studio</Link>, then return
              here.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="handoff-client">Client account</label>
                <select
                  id="handoff-client"
                  value={clientId}
                  disabled={busy || loading}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setProjectId("");
                    setConfirmed(false);
                    setOptions((v) => ({ ...v, projects: [] }));
                  }}
                >
                  <option value="">Choose a client</option>
                  {options.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset disabled={busy}>
                <legend>Project destination</legend>
                <label>
                  <input
                    type="radio"
                    name="handoff-mode"
                    checked={mode === "new"}
                    onChange={() => {
                      setMode("new");
                      setConfirmed(false);
                    }}
                  />
                  Create a Discovery project
                </label>
                <label>
                  <input
                    type="radio"
                    name="handoff-mode"
                    checked={mode === "existing"}
                    onChange={() => {
                      setMode("existing");
                      setConfirmed(false);
                    }}
                  />
                  Link an existing project
                </label>
              </fieldset>
              {mode === "new" ? (
                <>
                  <label>
                    Project title
                    <input
                      value={title}
                      maxLength={120}
                      disabled={busy}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setConfirmed(false);
                      }}
                      placeholder="e.g. Service booking website"
                    />
                  </label>
                  <label>
                    Client-visible discovery summary
                    <textarea
                      value={summary}
                      maxLength={2400}
                      rows={5}
                      disabled={busy}
                      onChange={(e) => {
                        setSummary(e.target.value);
                        setConfirmed(false);
                      }}
                      placeholder="Write the project introduction you want this client to see."
                    />
                  </label>
                  <p className="intake-hint">
                    Your working brief and original answers remain private.{" "}
                    {summary.length.toLocaleString()}/2,400 characters.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="handoff-project">Existing project</label>
                    <select
                      id="handoff-project"
                      value={projectId}
                      disabled={busy || loading || !clientId}
                      onChange={(e) => {
                        setProjectId(e.target.value);
                        setConfirmed(false);
                      }}
                    >
                      <option value="">Choose a project</option>
                      {options.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} · {p.phase}
                        </option>
                      ))}
                    </select>
                  </div>
                  {clientId && !loading && options.projects.length === 0 && (
                    <p>
                      This client has no projects yet. Choose “Create a Discovery project” to
                      continue.
                    </p>
                  )}
                  <p className="intake-hint">
                    The existing project keeps its current summary, progress and payments.
                  </p>
                </>
              )}
              <label className="inbox-handoff-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  disabled={busy}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I’ve checked the client and the information being shared.
              </label>
              <button
                className="studio-button"
                disabled={
                  busy ||
                  loading ||
                  !!error ||
                  !confirmed ||
                  !clientId ||
                  (mode === "new" ? !title.trim() || !summary.trim() : !projectId)
                }
                onClick={() => void submit()}
              >
                <Link2 size={16} />
                {busy
                  ? "Connecting…"
                  : mode === "new"
                    ? "Create & connect project"
                    : "Connect existing project"}
              </button>
            </>
          )}
          <button
            className="intake-text-button"
            disabled={busy || loading}
            onClick={() => setReload((v) => v + 1)}
          >
            Reload client choices
          </button>
        </>
      )}
      {error && (
        <p className="intake-error" role="alert">
          {error}
        </p>
      )}
      <p className="intake-hint">
        This prepares the project for a proposal. Scope approval, the signed agreement and payment
        are separate steps.
      </p>
    </section>
  );
}
