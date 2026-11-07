// Owner-run count-only sync. This never starts Atlas or its collectors.
import { DatabaseSync } from "node:sqlite";
import { stat } from "node:fs/promises";
import { get, put } from "@vercel/blob";
const file = process.argv[2];
if (!file || !process.env.BLOB_READ_WRITE_TOKEN)
  throw new Error("Pass the Atlas SQLite path and configure the studio private storage token.");
const db = new DatabaseSync(file, { readOnly: true });
db.exec("PRAGMA query_only=ON");
const tables = [
  ["Entities", "entities"],
  ["Archived sources", "sources"],
  ["Financial snapshots", "snapshots"],
  ["Relationships", "relationships"],
  ["Collection jobs", "jobs"],
  ["Federal awards", "federal_awards"],
  ["Disclosure runs", "disclosure_runs"],
  ["Disclosure reviews", "disclosure_reviews"],
  ["Discovery alerts", "discovery_alerts"],
  ["Watchlist rows", "watchlist"],
];
const metrics = tables.map(([label, table]) => ({
  label,
  count: Number(db.prepare('SELECT COUNT(*) AS n FROM "' + table + '"').get().n),
  available: true,
}));
db.close();
const snapshot = {
  source: "meridian-atlas",
  access: "Local read-only snapshot",
  checkedAt: new Date().toISOString(),
  dataDate: (await stat(file)).mtime.toISOString(),
  metrics,
  dataCaveat:
    "Dated local research data. No collectors were started. Private notebooks and saved conversation content are excluded.",
};
const path =
  (process.env.PORTAL_NAMESPACE || "kjl-studio-v1") + "/project-snapshot-meridian-atlas.json";
const old = await get(path, { access: "private", useCache: false });
await put(path, JSON.stringify(snapshot), {
  access: "private",
  allowOverwrite: !!old,
  ifMatch: old?.blob.etag.replace(/^W\//, ""),
  addRandomSuffix: false,
  contentType: "application/json",
});
console.log(
  "Saved dated Atlas project counts to private studio storage. Source date:",
  snapshot.dataDate,
);
