"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Inbox, RefreshCw, Save } from "lucide-react";
import {
  inquiryStatuses,
  type Inquiry,
  type InquirySummary,
  type InquiryStatus,
} from "@/lib/intake/types";
import { answerText, sections } from "@/lib/intake/questions";
import InquiryHandoff from "./InquiryHandoff";
const date = (value: string) =>
  new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
async function request(path = "", body?: unknown) {
  const response = await fetch(
    "/api/portal/inquiries" + path,
    body
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load inquiries.");
  return result;
}
function manualBrief(i: Inquiry) {
  return (
    "# Project discovery brief — owner draft\n\nRequirements gathering. Not approved scope or a quote.\n\n## Objective\n\n" +
    answerText(i.answers.idea) +
    "\n\n## First release\n\n" +
    answerText(i.answers.mustHave) +
    "\n\n## Open questions\n\nReview the original answers alongside this draft.\n"
  );
}
export default function InquiryInbox() {
  const [items, setItems] = useState<InquirySummary[]>([]),
    [selected, setSelected] = useState<Inquiry | null>(null);
  const [markdown, setMarkdown] = useState(""),
    [status, setStatus] = useState<InquiryStatus>("New"),
    [filter, setFilter] = useState("All"),
    [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const requestId = useRef(0),
    detailHeading = useRef<HTMLHeadingElement>(null);
  const [handoffDirty, setHandoffDirty] = useState(false);
  const [openGeneration, setOpenGeneration] = useState(0);
  const dirty =
    !!selected &&
    (markdown !== (selected.versions.at(-1)?.markdown || manualBrief(selected)) ||
      status !== selected.status);
  const load = useCallback(async () => {
    setItems((await request()).inquiries);
  }, []);
  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);
  useEffect(() => {
    if (!dirty && !handoffDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, handoffDirty]);
  function populate(inquiry: Inquiry) {
    setSelected(inquiry);
    setMarkdown(inquiry.versions.at(-1)?.markdown || manualBrief(inquiry));
    setStatus(inquiry.status);
  }
  async function open(id: string) {
    if ((dirty || handoffDirty) && !window.confirm("Discard your unsaved inquiry changes?")) return;
    const current = ++requestId.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await request("?id=" + encodeURIComponent(id));
      if (current === requestId.current) {
        populate(result.inquiry);
        setHandoffDirty(false);
        setOpenGeneration((value) => value + 1);
        requestAnimationFrame(() => detailHeading.current?.focus());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open inquiry.");
    } finally {
      if (current === requestId.current) setBusy(false);
    }
  }
  async function act(action: "save" | "retry", nextStatus = status) {
    if (!selected) return;
    if (action === "retry" && dirty) {
      setError("Save your edits before retrying generation.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await request("", {
        action,
        id: selected.id,
        revision: selected.revision,
        status: nextStatus,
        markdown,
      });
      populate(result.inquiry);
      setNotice(
        action === "save"
          ? "Your brief and review status are saved."
          : result.inquiry.generation.status === "ready"
            ? "A new AI draft is ready for review."
            : "Original answers are saved. AI generation still needs attention.",
      );
      await load();
      window.dispatchEvent(new Event("kjl-workspace-update"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save. Your edits are still here.");
    } finally {
      setBusy(false);
    }
  }
  const filtered = items.filter(
    (i) =>
      (filter === "All" || i.status === filter) &&
      `${i.name} ${i.email} ${i.kind} ${i.idea}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="inbox">
      <Link className="text-link" href="/studio">
        <ArrowLeft size={16} /> Back to studio
      </Link>
      <div className="inbox-heading">
        <div>
          <p className="eyebrow">PRIVATE STUDIO / DISCOVERY</p>
          <h1>
            Ideas start <em>here.</em>
          </h1>
          <p>Original answers, thoughtful briefs, and a clear next step.</p>
        </div>
        <button
          className="inbox-secondary"
          disabled={busy}
          onClick={() => {
            setError("");
            void load().catch((e) => setError(e.message));
          }}
        >
          <RefreshCw size={16} /> Refresh inbox
        </button>
      </div>
      {error && (
        <p className="intake-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="inbox-notice" role="status">
          {notice}
        </p>
      )}
      <div className="inbox-layout">
        <aside className="inbox-list">
          <label>
            Search inquiries
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, project, or email"
            />
          </label>
          <label>
            Review status
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {["All", ...inquiryStatuses].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <p className="inbox-count">
            {filtered.length} {filtered.length === 1 ? "inquiry" : "inquiries"}
          </p>
          {loading ? (
            <p role="status">Loading inquiries…</p>
          ) : filtered.length === 0 ? (
            <div className="inbox-empty">
              <Inbox size={30} />
              <strong>
                {items.length ? "No matching inquiries" : "Room for your next project"}
              </strong>
              <p>
                {items.length
                  ? "Try another search or status."
                  : "Submitted project details will appear here. Share the discovery page to get started."}
              </p>
              <Link href="/start-project">Open project discovery</Link>
            </div>
          ) : (
            filtered.map((i) => (
              <button
                type="button"
                disabled={busy}
                key={i.id}
                className={"inbox-item" + (selected?.id === i.id ? " active" : "")}
                onClick={() => void open(i.id)}
              >
                <span className="inbox-item-meta">
                  {i.status} · {date(i.created)}
                </span>
                <strong>{i.name}</strong>
                <span>{i.kind}</span>
                <p>{i.idea}</p>
                <small>
                  {i.handoff === "linked"
                    ? "Connected to project"
                    : i.handoff === "pending"
                      ? "Handoff needs completion"
                      : i.generation === "ready"
                        ? "Draft ready"
                        : i.generation === "not-requested"
                          ? "Manual review"
                          : i.generation === "failed"
                            ? "AI needs attention"
                            : "Brief pending"}
                </small>
              </button>
            ))
          )}
        </aside>
        <section className="inbox-detail" aria-busy={busy}>
          {!selected ? (
            <div className="inbox-empty">
              <FileIcon />
              <h2>Select an inquiry</h2>
              <p>Review what the client actually said alongside the working brief.</p>
            </div>
          ) : (
            <>
              <div className="inbox-detail-heading">
                <p className="eyebrow">{selected.answers.kind}</p>
                <h2 ref={detailHeading} tabIndex={-1}>
                  {selected.answers.name}
                </h2>
                <a href={`mailto:${encodeURIComponent(String(selected.answers.email))}`}>
                  {selected.answers.email}
                </a>
                <p>
                  Received {date(selected.created)} · Revision {selected.revision}
                </p>
              </div>
              {selected.generation.error && (
                <p className="intake-error">{selected.generation.error}</p>
              )}
              {selected.generation.status === "generating" && (
                <p className="inbox-notice">
                  A brief is being generated. Reload the inquiry to check its status.
                </p>
              )}
              <div className="inbox-toolbar">
                <label>
                  Review status
                  <select
                    value={status}
                    disabled={busy || selected.handoff?.status === "pending"}
                    onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                  >
                    {inquiryStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="inbox-secondary"
                  disabled={busy}
                  onClick={() => void open(selected.id)}
                >
                  Reload inquiry
                </button>
              </div>
              <details className="inbox-original" open>
                <summary>Original answers & follow-ups</summary>
                <div className="inbox-source-grid">
                  {sections.map((s) => (
                    <details key={s.id}>
                      <summary>{s.title}</summary>
                      <dl>
                        {s.questions
                          .filter((q) => !q.when || q.when(selected.answers))
                          .map((q) => (
                            <div key={q.id}>
                              <dt>{q.label}</dt>
                              <dd>{answerText(selected.answers[q.id])}</dd>
                            </div>
                          ))}
                      </dl>
                    </details>
                  ))}
                  {selected.clarifications.questions.length > 0 && (
                    <details>
                      <summary>Follow-up questions</summary>
                      <dl>
                        {selected.clarifications.questions.map((q) => (
                          <div key={q.id}>
                            <dt>{q.question}</dt>
                            <dd>
                              {selected.clarifications.answers[q.id] || "Deferred for discussion"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  )}
                </div>
              </details>
              <div className="inbox-editor-heading">
                <h3>Working project brief</h3>
                <span>
                  {dirty
                    ? "Unsaved changes"
                    : selected.versions.at(-1)?.author || "Owner draft — not saved yet"}
                </span>
              </div>
              <p className="intake-hint">
                Review assumptions and open questions before marking this reviewed. Review does not
                create a client account, send a proposal, or approve a price.
              </p>
              <label className="sr-only" htmlFor="working-brief">
                Working project brief in Markdown
              </label>
              <textarea
                id="working-brief"
                className="inbox-editor"
                value={markdown}
                maxLength={80000}
                onChange={(e) => setMarkdown(e.target.value)}
                disabled={busy || selected.handoff?.status === "pending"}
                spellCheck={false}
              />
              <div className="inbox-actions">
                <button
                  className="studio-button"
                  disabled={
                    busy ||
                    !markdown.trim() ||
                    selected.generation.status === "generating" ||
                    selected.handoff?.status === "pending"
                  }
                  onClick={() => void act("save")}
                >
                  <Save size={16} /> Save brief
                </button>
                <button
                  className="inbox-secondary"
                  disabled={
                    busy ||
                    !markdown.trim() ||
                    selected.generation.status === "generating" ||
                    selected.handoff?.status === "pending"
                  }
                  onClick={() => void act("save", "Reviewed")}
                >
                  Save & mark reviewed
                </button>
                <a
                  className="inbox-secondary"
                  href={`/api/portal/inquiries?id=${selected.id}&download=1`}
                >
                  <Download size={16} /> Export saved Markdown
                </a>
              </div>
              <p className="intake-hint">
                Exports contain the last saved version. Save your changes first.
              </p>
              {selected.consent.ai &&
                !selected.handoff &&
                !selected.versions.some((v) => v.author === "Owner") && (
                  <button
                    className="intake-text-button"
                    disabled={busy}
                    onClick={() => void act("retry")}
                  >
                    {busy ? "Working…" : "Retry AI brief generation"}
                  </button>
                )}
              <InquiryHandoff
                key={selected.id + ":" + openGeneration}
                inquiry={selected}
                busy={busy}
                unsavedBrief={dirty}
                setBusy={setBusy}
                onDirty={setHandoffDirty}
                onChange={async (inquiry) => {
                  populate(inquiry);
                  await load();
                  window.dispatchEvent(new Event("kjl-workspace-update"));
                }}
              />
              <details className="inbox-history">
                <summary>Saved versions ({selected.versions.length})</summary>
                {selected.versions.map((v, i) => (
                  <details key={i}>
                    <summary>
                      Version {i + 1} · {v.author} · {date(v.at)}
                    </summary>
                    <pre>{v.markdown}</pre>
                  </details>
                ))}
              </details>
              <p className="intake-hint">
                Inquiry {selected.id}. AI processing{" "}
                {selected.consent.ai ? "authorized" : "not authorized"} by the client. Original
                answers are preserved.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
function FileIcon() {
  return <Inbox size={36} aria-hidden="true" />;
}
