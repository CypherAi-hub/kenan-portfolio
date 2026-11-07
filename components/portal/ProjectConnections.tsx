"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FolderOpen, ArrowUpRight, Bot } from "lucide-react";
import type { CatalogProject } from "@/lib/portal/project-access";
type Inspection = {
  project: CatalogProject;
  publicPage?: {
    status?: number;
    available?: boolean;
    title?: string;
    reason?: string;
    checkedAt?: string;
  };
  privateData: {
    access?: string;
    checkedAt?: string;
    exportedAt?: string;
    dataDate?: string;
    reason?: string;
    accounts?: number | null;
    metrics?: { label: string; count: number | null }[];
    records?: Record<string, string | null>[];
    excluded?: string;
    dataCaveat?: string;
    page?: number;
    total?: number | null;
  };
};
async function post(body: Record<string, unknown>) {
  const r = await fetch("/api/portal/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Could not read this project.");
  return data;
}
export default function ProjectConnections() {
  const [projects, setProjects] = useState<CatalogProject[]>([]),
    [query, setQuery] = useState(""),
    [report, setReport] = useState<Inspection | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    fetch("/api/portal/projects", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Project connections are unavailable.");
        setProjects((await r.json()).projects);
      })
      .catch((e) => setNotice(e.message));
  }, []);
  const visible = projects.filter((p) =>
    (p.title + " " + p.category + " " + p.description).toLowerCase().includes(query.toLowerCase()),
  );
  async function inspect(slug: string, view = "overview", page = 1) {
    setBusy(true);
    setNotice("");
    try {
      setReport(await post({ action: "inspect", slug, view, page }));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="portal-meetings project-connections">
      <summary>
        <FolderOpen size={17} />
        Your projects <span>{projects.length} project briefs connected</span>
      </summary>
      <p>
        Review your complete portfolio, saved screenshots and available private records. Each source
        shows whether it is live, local, or an imported snapshot.
      </p>
      <label className="project-connection-search">
        Find a project
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="FoFit, Meridian, Maryville…"
        />
      </label>
      {notice && <p role="status">{notice}</p>}
      {report && (
        <section className="project-inspection" aria-live="polite">
          <h2>{report.project.title}</h2>
          {report.project.privateConnectionScope && <p>{report.project.privateConnectionScope}</p>}
          {report.publicPage && (
            <p>
              Public page:{" "}
              {report.publicPage.status ? "HTTP " + report.publicPage.status : "Check unavailable"}{" "}
              {report.publicPage.title || report.publicPage.reason}
            </p>
          )}
          <p>{report.privateData.access || report.privateData.reason}</p>
          {report.privateData.checkedAt && (
            <small>Checked {new Date(report.privateData.checkedAt).toLocaleString()}</small>
          )}
          {report.privateData.exportedAt && (
            <p>Backup exported {new Date(report.privateData.exportedAt).toLocaleString()}</p>
          )}
          {report.privateData.dataDate && (
            <p>Source data dated {new Date(report.privateData.dataDate).toLocaleString()}</p>
          )}
          {report.privateData.accounts != null && (
            <p>Registered accounts: {report.privateData.accounts}</p>
          )}
          {report.privateData.metrics && (
            <dl className="project-metrics">
              {report.privateData.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.count ?? "Unavailable"}</dd>
                </div>
              ))}
            </dl>
          )}
          {report.privateData.records && (
            <>
              <p>
                Private records · page {report.privateData.page || 1} · up to 10 records per page
              </p>
              {report.privateData.records.length === 0 && <p>No records on this page.</p>}
              {report.privateData.records.map((r, i) => (
                <article className="project-customer" key={r.id || i}>
                  {Object.entries(r)
                    .filter(([key, value]) => value && key !== "id")
                    .map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}: </strong>
                        {value}
                      </p>
                    ))}
                </article>
              ))}
              <div className="project-connection-actions">
                {(report.privateData.page || 1) > 1 && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void inspect(
                        report.project.slug,
                        "customers",
                        (report.privateData.page || 1) - 1,
                      )
                    }
                  >
                    Previous page
                  </button>
                )}
                {report.privateData.records.length === 10 &&
                  (report.privateData.page || 1) < 100 && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void inspect(
                          report.project.slug,
                          "customers",
                          (report.privateData.page || 1) + 1,
                        )
                      }
                    >
                      Next page
                    </button>
                  )}
              </div>
            </>
          )}
          {(report.privateData.excluded || report.privateData.dataCaveat) && (
            <p className="portal-note">
              {report.privateData.excluded || report.privateData.dataCaveat}
            </p>
          )}
        </section>
      )}
      <div className="project-connection-list">
        {visible.map((p) => (
          <article key={p.slug} className="project-connection-card">
            <Image
              src={p.screenshot.url.replace("https://kjl-designs.vercel.app", "")}
              alt={p.screenshot.alt}
              width={104}
              height={72}
            />
            <div>
              <h3>{p.title}</h3>
              <p>
                {p.status} · {p.access}
              </p>
              <div className="project-connection-actions">
                <button disabled={busy} onClick={() => void inspect(p.slug)}>
                  Inspect project
                </button>
                {(p.privateConnected ||
                  ["kenan-portfolio", "hirecrate-staffing"].includes(p.slug)) && (
                  <button disabled={busy} onClick={() => void inspect(p.slug, "customers")}>
                    View private records
                  </button>
                )}
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("kjl-assistant-prompt", {
                        detail:
                          "Assess " +
                          p.title +
                          " using its project brief, saved screenshot and current connected evidence. Separate verified facts from suggestions.",
                      }),
                    )
                  }
                >
                  <Bot size={13} />
                  Ask assistant
                </button>
                <a href={p.portfolioUrl} target="_blank" rel="noreferrer">
                  Project details
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="project-import">
        <h3>HireCrate browser backup</h3>
        <p>
          Export backup from HireCrate’s dashboard settings, then import it here. This saves a
          private snapshot without changing HireCrate’s existing records.
        </p>
        <input
          type="file"
          accept=".json,application/json"
          aria-label="Import HireCrate backup"
          disabled={busy}
          onChange={async (e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              if (file.size > 1000000) throw new Error("Choose a backup smaller than 1 MB.");
              await post({ action: "import-hirecrate", backup: JSON.parse(await file.text()) });
              setNotice("Private HireCrate snapshot imported.");
              await inspect("hirecrate-staffing");
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Could not import the backup.");
            } finally {
              setBusy(false);
              input.value = "";
            }
          }}
        />
      </div>
    </details>
  );
}
