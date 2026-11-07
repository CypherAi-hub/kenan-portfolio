import { projectLibrary } from "@/data/project-library";
import { projectDetails } from "@/data/project-details";
import { projects as sourceProjects } from "@/data/projects";
import { assertOwner } from "./desk";
import { directory, workspace, readPrivate, editPrivate, requireValue } from "./store";
import type { Account } from "./types";
const site = "https://kjl-designs.vercel.app";
const sourceGroups: Record<string, string> = {
  fofit: "fofit",
  "fofit-coach": "fofit",
  "fofit-web": "fofit",
  "fofit-website": "fofit",
  ultraflips: "ultraflips",
  "ultraflips-mobile": "ultraflips",
  "ultraflips-website": "ultraflips",
  "general-services": "general-services",
};
const fixedEndpoints: Record<string, string> = {
  fofit: "https://txybqrlvlpokaciajzty.supabase.co/functions/v1/kjl-project-read",
  ultraflips: "https://hwojnsxszxkhwjllrelt.supabase.co/functions/v1/kjl-project-read",
  "general-services":
    "https://general-services-request-desk.tomuchdrip.chatgpt.site/api/studio/project-read",
};
type Connection = { url: string; token: string };
function connections(): Record<string, Connection> {
  try {
    return JSON.parse(process.env.PROJECT_BRIDGE_CONNECTIONS || "{}");
  } catch {
    return {};
  }
}
export function projectCatalog() {
  const config = connections();
  return projectLibrary.map((p) => {
    const detail = projectDetails[p.slug],
      group = sourceGroups[p.slug];
    const connected = !!(
      group &&
      config[group]?.token &&
      config[group]?.url === fixedEndpoints[group]
    );
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      status: p.status,
      description: p.description,
      detail: p.detail,
      features: detail?.features.slice(0, 6),
      availability: detail?.availability || p.status,
      portfolioUrl: site + "/projects/" + p.slug,
      liveUrl: p.liveUrl ? new URL(p.liveUrl, site).href : null,
      repositoryUrl:
        p.sourceUrl || sourceProjects.find((r) => r.slug === p.slug)?.githubUrl || null,
      screenshot: { url: site + p.image, alt: p.imageAlt, note: p.imageNote },
      access: connected
        ? "Live private read-only connection"
        : p.slug === "kenan-portfolio"
          ? "Studio workspace"
          : p.slug === "hirecrate-staffing"
            ? "Browser-local records; backup import supported"
            : p.slug === "meridian-atlas"
              ? "Local research snapshot"
              : /archive|prototype|local|simulation|experiment/i.test(p.status)
                ? "Saved project evidence"
                : "Portfolio evidence and public site",
      privateConnected: connected,
      sourceGroup: group || null,
      privateConnectionScope: connected
        ? group === "general-services"
          ? "General Services requester accounts and request status counts"
          : group === "fofit"
            ? "Shared FoFit product database: account directory and aggregate counts; not an individual tool’s usage"
            : "Shared UltraFlips product database: account directory and aggregate counts"
        : null,
    };
  });
}
async function limitedText(r: Response, max = 140000) {
  const reader = r.body?.getReader();
  if (!reader) return "";
  let size = 0,
    text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) break;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel();
  }
  return text;
}
function plain(s: string) {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|quot);/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 350);
}
export async function publicProjectCheck(slug: string) {
  const project = projectCatalog().find((p) => p.slug === slug);
  requireValue(project, "Unknown project.", 404);
  if (!project.liveUrl)
    return {
      checkedAt: new Date().toISOString(),
      available: false,
      reason: "No published app URL; saved evidence is available.",
    };
  let url = new URL(project.liveUrl);
  const host = url.hostname.replace(/^www\./, "");
  if (url.protocol !== "https:")
    return { available: false, reason: "Only approved HTTPS project URLs can be checked." };
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, {
        redirect: "manual",
        cache: "no-store",
        headers: { "user-agent": "KJL-Designs-Project-Review/1.0" },
        signal: AbortSignal.timeout(6500),
      });
      if (r.status >= 300 && r.status < 400) {
        const location = r.headers.get("location");
        if (!location)
          return {
            status: r.status,
            available: false,
            reason: "Redirect destination unavailable.",
          };
        const next = new URL(location, url);
        if (next.protocol !== "https:" || next.hostname.replace(/^www\./, "") !== host)
          return {
            status: r.status,
            available: false,
            reason: "External redirect or sign-in gate; private content was not opened.",
            redirectHost: next.hostname,
            checkedAt: new Date().toISOString(),
          };
        url = next;
        continue;
      }
      const type = r.headers.get("content-type") || "";
      const html = type.includes("text/html") ? await limitedText(r) : "";
      return {
        checkedAt: new Date().toISOString(),
        url: url.href,
        status: r.status,
        available: r.ok,
        contentType: type,
        title: plain(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""),
        heading: plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""),
        hasMobileViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
        note: "This is a bounded public-page check, not an authenticated UI or complete functionality test.",
      };
    }
    return { available: false, reason: "Too many redirects.", checkedAt: new Date().toISOString() };
  } catch {
    return {
      available: false,
      reason: "The public page could not be reached within the check timeout.",
      checkedAt: new Date().toISOString(),
    };
  }
}
export type ProjectSnapshot = {
  source: string;
  checkedAt: string;
  dataDate?: string;
  access: string;
  metrics?: { label: string; count: number; available?: boolean }[];
  records?: Record<string, string | null>[];
  exportedAt?: string;
  importedAt?: string;
};
async function privateRead(
  me: Account,
  slug: string,
  view: "overview" | "customers",
  page: number,
) {
  assertOwner(me);
  if (slug === "kenan-portfolio") {
    const clients = (await directory()).accounts.filter((a) => a.role === "client");
    if (view === "customers")
      return {
        source: "kjl-studio",
        access: "read-only",
        checkedAt: new Date().toISOString(),
        records: clients
          .slice((page - 1) * 10, page * 10)
          .map(({ id, name, email }) => ({ id, displayName: name, email })),
        total: clients.length,
        page,
      };
    const records = await Promise.all(clients.map((c) => workspace(c.id)));
    return {
      source: "kjl-studio",
      access: "read-only",
      checkedAt: new Date().toISOString(),
      accounts: clients.length,
      metrics: [
        {
          label: "Client projects",
          count: records.reduce((n, w) => n + w.projects.length, 0),
          available: true,
        },
      ],
    };
  }
  if (slug === "hirecrate-staffing" || slug === "meridian-atlas") {
    const snapshot = await readPrivate<ProjectSnapshot | null>(
      "project-snapshot-" + slug,
      () => null,
    );
    if (!snapshot)
      return {
        available: false,
        reason:
          slug === "hirecrate-staffing"
            ? "This dashboard stores records in the source browser only. Import its exported backup to review the records here."
            : "This is a local research app. No snapshot has been synced yet.",
      };
    return view === "customers"
      ? {
          ...snapshot,
          metrics: undefined,
          records: snapshot.records?.slice((page - 1) * 10, page * 10) || [],
          page,
        }
      : { ...snapshot, records: undefined };
  }
  const group = sourceGroups[slug],
    c = connections()[group];
  if (!group || !c?.token || c.url !== fixedEndpoints[group])
    return {
      available: false,
      reason:
        "No live private backend is configured for this project. Its saved project evidence is connected.",
    };
  try {
    const r = await fetch(c.url, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: { authorization: "Bearer " + c.token, "content-type": "application/json" },
      body: JSON.stringify({ view, page }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok)
      return {
        available: false,
        reason: "The private source could not complete the read.",
        status: r.status,
      };
    const raw = await limitedText(r, 90000),
      data = JSON.parse(raw);
    requireValue(data.source === group, "Project source mismatch.", 503);
    return data;
  } catch {
    return { available: false, reason: "The private connection is temporarily unavailable." };
  }
}
export async function inspectProject(
  me: Account,
  slug: unknown,
  view: unknown = "overview",
  page: unknown = 1,
) {
  assertOwner(me);
  requireValue(typeof slug === "string", "Choose a project.");
  requireValue(view === "overview" || view === "customers", "Choose a read operation.");
  requireValue(
    typeof page === "number" && Number.isInteger(page) && page >= 1 && page <= 100,
    "Choose a valid page.",
  );
  const project = projectCatalog().find((p) => p.slug === slug);
  requireValue(project, "Unknown project.", 404);
  const [publicPage, privateData] = await Promise.all([
    view === "overview" ? publicProjectCheck(slug) : Promise.resolve(undefined),
    privateRead(me, slug, view, page),
  ]);
  return {
    project,
    publicPage,
    privateData,
    evidenceNote:
      "Saved screenshots and briefs have their own dates. Live checks and private reads have checkedAt timestamps. Never interpret seeded/test rows as active customers, sales or product acceptance.",
  };
}
export async function importHireCrate(me: Account, input: unknown) {
  assertOwner(me);
  requireValue(
    input && typeof input === "object" && !Array.isArray(input),
    "Choose a HireCrate backup.",
  );
  const b = input as Record<string, unknown>;
  requireValue(
    b.appName === "HireCrate Staffing" &&
      typeof b.exportedAt === "string" &&
      Number.isFinite(Date.parse(b.exportedAt)),
    "This is not a valid HireCrate backup.",
  );
  for (const key of ["companies", "jobs", "people", "matches"])
    requireValue(
      Array.isArray(b[key]) && (b[key] as unknown[]).length <= 1000,
      "Check the backup record limits.",
    );
  const text = (v: unknown, max = 180) => (typeof v === "string" ? v.slice(0, max) : null);
  for (const key of ["people", "companies"])
    requireValue(
      (b[key] as unknown[]).every((v) => v && typeof v === "object" && !Array.isArray(v)),
      "Check the backup contact records.",
    );
  const people = (b.people as Record<string, unknown>[]).map((p) => ({
    id: text(p.id, 80),
    type: "Person",
    displayName: text(p.name) || text(p.fullName),
    email: text(p.email, 254),
    status: text(p.status, 80),
  }));
  const companies = (b.companies as Record<string, unknown>[]).map((p) => ({
    id: text(p.id, 80),
    type: "Company",
    displayName: text(p.companyName),
    contactName: text(p.contactName),
    email: text(p.email, 254),
    status: text(p.status, 80),
  }));
  const at = new Date().toISOString();
  const value: ProjectSnapshot = {
    source: "hirecrate-staffing",
    access: "Private imported snapshot",
    checkedAt: at,
    exportedAt: b.exportedAt as string,
    importedAt: at,
    metrics: [
      { label: "Companies in backup", count: (b.companies as unknown[]).length },
      { label: "Jobs in backup", count: (b.jobs as unknown[]).length },
      { label: "People in backup", count: people.length },
      { label: "Matches in backup", count: (b.matches as unknown[]).length },
    ],
    records: [...companies, ...people],
  };
  await editPrivate(
    "project-snapshot-hirecrate-staffing",
    () => value,
    (current) => {
      Object.assign(current, value);
    },
  );
  return { ok: true, importedAt: at, records: people.length + companies.length };
}

export type CatalogProject = ReturnType<typeof projectCatalog>[number];
