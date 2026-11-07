"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import type { Project, Member } from "@/lib/portal/types";
export default function ClientNotifications({ me, projects }: { me: Member; projects: Project[] }) {
  const [seen, setSeen] = useState<number | null>(null);
  const key = "kjl-last-read-" + me.id;
  useEffect(() => {
    try {
      setSeen(Number(localStorage.getItem(key)) || 0);
    } catch {
      setSeen(0);
    }
  }, [key]);
  const unread = projects
    .flatMap((p) =>
      p.updates
        .filter((u) => u.author !== me.name && new Date(u.at).getTime() > (seen ?? Date.now()))
        .map((u) => ({ ...u, project: p.title })),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  if (!unread.length) return null;
  return (
    <details className="portal-meetings">
      <summary>
        <Bell size={17} />
        {unread.length} new project {unread.length === 1 ? "update" : "updates"}
      </summary>
      {unread.map((u) => (
        <section className="portal-meeting" key={u.id}>
          <div>
            <strong>{u.project}</strong>
            <p>{u.body}</p>
            <small>{new Date(u.at).toLocaleString()}</small>
          </div>
        </section>
      ))}
      <button
        className="portal-quiet"
        onClick={() => {
          const now = Date.now();
          setSeen(now);
          try {
            localStorage.setItem(key, String(now));
          } catch {
            /* Read state remains available in this session. */
          }
        }}
      >
        Mark updates as read
      </button>
    </details>
  );
}
