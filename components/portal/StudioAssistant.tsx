"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Check, CalendarDays, Bell } from "lucide-react";
import type { Appointment, Proposal } from "@/lib/portal/desk";
type Message = { role: "user" | "assistant"; content: string; proposals?: Proposal[] };
async function api(input: Record<string, unknown>) {
  const r = await fetch("/api/portal/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Please try again.");
  return data;
}
function ProposalCard({
  proposal: p,
  busy,
  applied,
  onAction,
}: {
  proposal: Proposal;
  busy: boolean;
  applied?: boolean;
  onAction: (action: "apply" | "reconcile-calendar", id: string) => Promise<void>;
}) {
  const done = applied || p.status === "applied",
    expired = Date.now() - p.created > 3600000;
  return (
    <div className="assistant-proposal">
      <strong>{p.label}</strong>
      <dl>
        {Object.entries(p.input)
          .filter(
            ([key, value]) =>
              value &&
              ["to", "body", "phase", "title", "brief", "amount", "decision", "start"].includes(
                key,
              ),
          )
          .map(([key, value]) => (
            <div key={key}>
              <dt>{key === "to" ? "Recipient" : key}</dt>
              <dd>
                {key === "start"
                  ? new Date(String(value)).toLocaleString(undefined, {
                      dateStyle: "full",
                      timeStyle: "long",
                    }) +
                    " (" +
                    String(value) +
                    ")"
                  : String(value)}
              </dd>
            </div>
          ))}
      </dl>
      {p.delivery && (
        <p role="status">
          Delivery:{" "}
          {p.delivery.status === "sent"
            ? "Confirmed by Google"
            : p.delivery.status === "failed"
              ? "Not confirmed. Review the delivery before preparing another."
              : "Awaiting confirmation. Check delivery before preparing another."}
        </p>
      )}
      <button
        disabled={busy || done || expired || !!p.delivery}
        onClick={() => void onAction("apply", p.id)}
      >
        {done ? (
          <>
            <Check size={14} />
            Applied
          </>
        ) : expired ? (
          "Expired · prepare again"
        ) : p.input.action === "email" ? (
          "Approve and send email"
        ) : p.input.action === "calendar" ? (
          "Approve meeting and send invitation"
        ) : (
          "Apply this change"
        )}
      </button>
      {!done && p.delivery && p.input.action === "calendar" && (
        <button disabled={busy} onClick={() => void onAction("reconcile-calendar", p.id)}>
          Check Calendar delivery
        </button>
      )}
    </div>
  );
}
export function Appointments({ owner, onChange }: { owner: boolean; onChange: () => void }) {
  const [items, setItems] = useState<Appointment[]>([]),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [googleConnected, setGoogleConnected] = useState(false),
    [proposal, setProposal] = useState<Proposal | null>(null);
  async function load() {
    const r = await fetch("/api/portal/assistant?section=appointments", { cache: "no-store" });
    if (r.ok) {
      const data = await r.json();
      setItems(data.appointments);
      setGoogleConnected(!!data.google?.connected);
    }
  }
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 45000);
    window.addEventListener("kjl-workspace-update", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("kjl-workspace-update", load);
    };
  }, []);
  async function act(input: Record<string, unknown>) {
    setBusy(true);
    try {
      await api(input);
      await load();
      onChange();
      setProposal(null);
      window.dispatchEvent(new Event("kjl-workspace-update"));
      setNotice("Appointment updated.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }
  const upcoming = items.filter((a) => new Date(a.start).getTime() > Date.now());
  return (
    <details className="portal-meetings">
      <summary>
        <CalendarDays size={17} /> Appointments{" "}
        <span>{upcoming.filter((a) => a.status === "requested").length} awaiting review</span>
      </summary>
      <p className="portal-note">
        Times below display in your device’s timezone. When Google is connected, review the
        invitation before approving a meeting. Approval checks your calendar, sends the invitation,
        and updates the client workspace.
      </p>
      {notice && <p role="status">{notice}</p>}
      {proposal && (
        <ProposalCard
          proposal={proposal}
          busy={busy}
          onAction={async (action, id) => {
            await act({ action, id });
          }}
        />
      )}
      {upcoming.length === 0 && <p>No upcoming portal appointments.</p>}
      {upcoming.map((a) => (
        <div className="portal-meeting" key={a.id}>
          <div>
            <strong>{a.title}</strong>
            {owner && <p>{a.clientName}</p>}
            <p>
              {new Date(a.start).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {a.minutes} minutes
            </p>
            <span>
              {a.status}
              {a.googleEvent ? " · Google Calendar invitation confirmed" : ""}
            </span>
            {a.bookingProposal && (
              <p>
                Calendar delivery is awaiting confirmation. Check its delivery in the studio
                assistant.
              </p>
            )}
            {a.note && <p>{a.note}</p>}
          </div>
          {owner && a.status === "requested" && !a.bookingProposal && (
            <div>
              <button
                disabled={busy}
                onClick={async () => {
                  if (!googleConnected) {
                    await act({
                      action: "review-appointment",
                      appointment: a.id,
                      decision: "approved",
                    });
                    return;
                  }
                  setBusy(true);
                  setNotice("");
                  try {
                    const data = await api({ action: "prepare-appointment", appointment: a.id });
                    setProposal(data.proposals[0]);
                    window.dispatchEvent(new Event("kjl-workspace-update"));
                  } catch (e) {
                    setNotice(e instanceof Error ? e.message : "Could not prepare the invitation.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {googleConnected ? "Review approval & invitation" : "Approve in portal"}
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  act({ action: "review-appointment", appointment: a.id, decision: "declined" })
                }
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
      {!owner && (
        <form
          className="portal-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const data = new FormData(f);
            const start = new Date(String(data.get("start")));
            if (!Number.isFinite(start.getTime())) return;
            await act({
              action: "request-appointment",
              title: data.get("title"),
              note: data.get("note"),
              start: start.toISOString(),
            });
          }}
        >
          <label>
            Meeting title
            <input name="title" required maxLength={120} defaultValue="Project discussion" />
          </label>
          <label>
            Preferred time (your local timezone)
            <input name="start" type="datetime-local" required />
          </label>
          <label>
            Notes
            <textarea name="note" maxLength={1500} />
          </label>
          <button disabled={busy} className="portal-btn">
            Request a 30-minute meeting
          </button>
        </form>
      )}
    </details>
  );
}
export default function StudioAssistant({ onChange }: { onChange: () => void }) {
  const [open, setOpen] = useState(false),
    [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [google, setGoogle] = useState<{ connected: boolean; email?: string; error?: string } | null>(
      null,
    ),
    [connectionNotice, setConnectionNotice] = useState(""),
    [loading, setLoading] = useState(false),
    [applied, setApplied] = useState<string[]>([]);
  const inFlight = useRef(false);
  async function refreshConversation() {
    const r = await fetch("/api/portal/assistant", { cache: "no-store" });
    if (!r.ok) throw new Error("Could not load your saved conversation.");
    const d = await r.json();
    setGoogle(d.google || null);
    setMessages(d.conversation || []);
  }
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void refreshConversation()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    const refresh = () => {
      if (!inFlight.current) void refreshConversation().catch(() => {});
    };
    window.addEventListener("kjl-workspace-update", refresh);
    return () => window.removeEventListener("kjl-workspace-update", refresh);
  }, [open]);
  const input = useRef<HTMLTextAreaElement>(null),
    launch = useRef<HTMLButtonElement>(null),
    end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);
  function close() {
    setOpen(false);
    launch.current?.focus();
  }
  async function send(message: string) {
    if (busy || loading || !message.trim()) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setText("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    try {
      const data = await api({ action: "ask", message });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, proposals: data.proposals },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setText(message);
      await refreshConversation().catch(() => {});
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <button
        ref={launch}
        className="assistant-launch"
        aria-expanded={open}
        aria-controls="studio-assistant"
        onClick={() => setOpen(!open)}
      >
        <Bot size={20} />
        Studio assistant
      </button>
      {open && (
        <aside
          className="assistant-panel"
          id="studio-assistant"
          role="dialog"
          aria-modal="false"
          aria-label="Private studio assistant"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <header>
            <div>
              <strong>Studio assistant</strong>
              <small>
                <Bell size={12} />
                Private · Kenan’s workspace
              </small>
            </div>
            <button onClick={close} aria-label="Close assistant">
              <X size={20} />
            </button>
          </header>
          <div className="assistant-google">
            {google?.connected ? (
              <>
                <small>Google connected · {google.email}</small>
                <button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    setConnectionNotice("");
                    try {
                      const data = await api({ action: "verify-google" });
                      setConnectionNotice(data.message);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not verify Google.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Check Google connection
                </button>
              </>
            ) : (
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const data = await api({ action: "connect-google" });
                    const destination = new URL(data.url);
                    if (destination.protocol !== "https:")
                      throw new Error("Invalid connection link.");
                    window.location.assign(destination.href);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not connect Google.");
                    setBusy(false);
                  }
                }}
              >
                Connect Google for email &amp; Calendar
              </button>
            )}
          </div>
          {connectionNotice && (
            <p className="assistant-connection-notice" role="status">
              {connectionNotice}
            </p>
          )}
          <div
            className="assistant-conversation"
            data-lenis-prevent
            aria-live="polite"
            aria-busy={busy}
          >
            {messages.length === 0 && (
              <div className="assistant-intro">
                <Bot size={28} />
                <h2>What needs your attention?</h2>
                <p>
                  I can review your projects, draft follow-ups, and prepare updates or appointment
                  decisions.
                </p>
                {[
                  "Who needs a follow-up?",
                  "Summarize my active projects",
                  "Which appointments need approval?",
                ].map((q) => (
                  <button key={q} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <section className={"assistant-message " + m.role} key={i}>
                <small>{m.role === "user" ? "You" : "Assistant"}</small>
                <p>{m.content}</p>
                {m.proposals?.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    busy={busy || loading}
                    applied={applied.includes(p.id)}
                    onAction={async (action, id) => {
                      inFlight.current = true;
                      setBusy(true);
                      setError("");
                      try {
                        await api({ action, id });
                        setApplied((a) => [...a, id]);
                        await refreshConversation();
                        onChange();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Could not apply.");
                        await refreshConversation().catch(() => {});
                      } finally {
                        inFlight.current = false;
                        setBusy(false);
                      }
                    }}
                  />
                ))}
              </section>
            ))}
            {(busy || loading) && (
              <p role="status">{loading ? "Loading saved conversation…" : "Working…"}</p>
            )}
            <div ref={end} />
          </div>
          {error && (
            <p className="assistant-error" role="alert">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(text);
            }}
          >
            <label className="sr-only" htmlFor="studio-message">
              Message the studio assistant
            </label>
            <textarea
              ref={input}
              id="studio-message"
              value={text}
              maxLength={4000}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about clients, projects, or meetings…"
              rows={2}
            />
            <button
              disabled={busy || loading || !text.trim()}
              aria-label="Send message to assistant"
            >
              <Send size={18} />
            </button>
          </form>
          <footer>
            Review every recipient, message and time before approving. Google events check your
            primary Calendar; portal appointment approvals are separate.
          </footer>
        </aside>
      )}
    </>
  );
}
