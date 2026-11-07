"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import type { StudioNotification } from "@/lib/portal/notifications";
export default function NotificationCenter() {
  const [data, setData] = useState<{ items: StudioNotification[]; unread: number }>({
    items: [],
    unread: 0,
  });
  const [error, setError] = useState("");
  async function load() {
    const r = await fetch("/api/portal/assistant?section=notifications", { cache: "no-store" });
    if (!r.ok) throw new Error("Notifications are temporarily unavailable.");
    setData((await r.json()).notifications);
  }
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void load().catch((e) => setError(e.message));
    };
    refresh();
    const timer = setInterval(refresh, 45000);
    window.addEventListener("kjl-workspace-update", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("kjl-workspace-update", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return (
    <details className="portal-meetings portal-notifications">
      <summary>
        <Bell size={17} />
        Notifications <span>{data.unread} unread</span>
      </summary>
      {error && <p role="status">{error}</p>}
      {data.items.length === 0 && (
        <p>
          You’re all caught up. Project activity, payments and appointment updates will appear here.
        </p>
      )}
      {data.items.map((n) => (
        <article key={n.id} className="portal-meeting">
          <div>
            <small>
              {n.kind} · {new Date(n.at).toLocaleString()}
            </small>
            <strong>{n.title}</strong>
            <p>{n.body}</p>
          </div>
        </article>
      ))}
      {data.unread > 0 && (
        <button
          className="portal-quiet"
          onClick={async () => {
            try {
              const r = await fetch("/api/portal/assistant", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ action: "read-notifications" }),
              });
              if (!r.ok) throw new Error("Could not update notifications.");
              await load();
              setError("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Try again.");
            }
          }}
        >
          Mark all as read
        </button>
      )}
    </details>
  );
}
