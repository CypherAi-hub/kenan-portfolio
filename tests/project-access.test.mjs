import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import { createHash } from "node:crypto";
import { handleProjectRead } from "../integrations/supabase-reader/reader.mjs";
const owner = { role: "owner" },
  client = { role: "client" };
async function harness() {
  const stored = {};
  let reads = 0;
  const context = vm.createContext({
    process: { env: {} },
    Date,
    URL,
    Response,
    AbortSignal,
    TextDecoder,
    fetch: async () => {
      reads++;
      return Response.redirect("https://attacker.invalid", 302);
    },
  });
  const mocks = {
    "./desk": {
      assertOwner: (me) => {
        if (me.role !== "owner") throw new Error("Owner required");
      },
    },
    "./store": {
      requireValue: (c, m) => {
        if (!c) throw new Error(m);
      },
      directory: async () => ({ accounts: [] }),
      workspace: async () => ({ projects: [] }),
      readPrivate: async (k, fn) => stored[k] ?? fn(),
      editPrivate: async (k, fn, edit) => {
        stored[k] ??= fn();
        await edit(stored[k]);
      },
    },
  };
  const modules = new Map();
  async function load(file) {
    if (modules.has(file)) return modules.get(file);
    const code = ts.transpileModule(
      await readFile(new URL("../" + file, import.meta.url), "utf8"),
      { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } },
    ).outputText;
    const m = new vm.SourceTextModule(code, { context });
    modules.set(file, m);
    await m.link(async (s) => {
      if (mocks[s])
        return new vm.SyntheticModule(
          Object.keys(mocks[s]),
          function () {
            for (const [k, v] of Object.entries(mocks[s])) this.setExport(k, v);
          },
          { context },
        );
      if (s.startsWith("@/")) return load(s.slice(2) + ".ts");
      if (s.startsWith("./"))
        return load(file.slice(0, file.lastIndexOf("/") + 1) + s.slice(2) + ".ts");
      throw Error(s);
    });
    return m;
  }
  const m = await load("lib/portal/project-access.ts");
  await m.evaluate();
  return {
    api: m.namespace,
    stored,
    get reads() {
      return reads;
    },
  };
}
test("every catalog project has media and explicit access; all names are present", async () => {
  const h = await harness(),
    p = h.api.projectCatalog();
  assert(p.length > 20);
  for (const name of ["FoFit", "UltraFlips", "Meridian Atlas", "General Services"])
    assert(
      p.some((x) => x.title.includes(name)),
      name,
    );
  for (const x of p) {
    assert(x.screenshot.url.startsWith("https://kjl-designs.vercel.app/"));
    await access(new URL("../public" + new URL(x.screenshot.url).pathname, import.meta.url));
    assert(x.access);
    assert(x.portfolioUrl);
  }
});
test("owner access, fixed project choices and external redirect boundary", async () => {
  const h = await harness();
  await assert.rejects(h.api.inspectProject(client, "fofit"), /Owner/);
  await assert.rejects(h.api.inspectProject(owner, "https://attacker.invalid"), /Unknown/);
  assert.equal(h.reads, 0);
  const p = h.api.projectCatalog().find((x) => x.liveUrl);
  const report = await h.api.inspectProject(owner, p.slug);
  assert.equal(report.publicPage.available, false);
  assert.equal(h.reads, 1);
  assert.match(report.publicPage.reason, /redirect/);
});
test("HireCrate imports only permitted contact fields into a private dated snapshot", async () => {
  const h = await harness();
  await h.api.importHireCrate(owner, {
    appName: "HireCrate Staffing",
    exportedAt: "2026-11-07T12:00:00Z",
    companies: [],
    jobs: [],
    matches: [],
    people: [
      {
        id: "a",
        name: "Test",
        email: "test@example.com",
        notes: "PRIVATE NOTES",
        ssn: "NEVER COPY",
      },
    ],
  });
  const saved = h.stored["project-snapshot-hirecrate-staffing"];
  assert.equal(saved.records.length, 1);
  assert(!JSON.stringify(saved).includes("PRIVATE NOTES"));
  assert(!JSON.stringify(saved).includes("NEVER COPY"));
  const x = await h.api.inspectProject(owner, "hirecrate-staffing", "customers", 1);
  assert.equal(x.privateData.records.length, 1);
  assert.equal(x.privateData.exportedAt, "2026-11-07T12:00:00Z");
});
test("bridge rejects unauthenticated requests and arbitrary operations before any source read", async () => {
  let reads = 0;
  const env = (k) =>
    ({
      KJL_PROJECT_ACCESS_HASH: createHash("sha256").update("a".repeat(43)).digest("hex"),
      KJL_SOURCE_GROUP: "fofit",
      SUPABASE_URL: "https://source.invalid",
      SUPABASE_SERVICE_ROLE_KEY: "private-source-key",
    })[k];
  const send = async () => {
    reads++;
    return Response.json({ users: [] });
  };
  assert.equal(
    (
      await handleProjectRead(
        new Request("https://bridge.invalid", { method: "POST", body: "{}" }),
        env,
        send,
      )
    ).status,
    401,
  );
  for (const input of [
    { view: "delete" },
    { view: "customers", page: 101 },
    { view: "customers", sql: "DELETE" },
  ]) {
    const r = await handleProjectRead(
      new Request("https://bridge.invalid", {
        method: "POST",
        headers: { authorization: "Bearer " + "a".repeat(43) },
        body: JSON.stringify(input),
      }),
      env,
      send,
    );
    assert.equal(r.status, 400);
  }
  assert.equal(reads, 0);
});
test("bridge exposes ten permitted directory fields only and performs no writes", async () => {
  const token = "b".repeat(43),
    methods = [];
  const env = (k) =>
    ({
      KJL_PROJECT_ACCESS_HASH: createHash("sha256").update(token).digest("hex"),
      KJL_SOURCE_GROUP: "ultraflips",
      SUPABASE_URL: "https://source.invalid",
      SUPABASE_SERVICE_ROLE_KEY: "private-source-key",
    })[k];
  const r = await handleProjectRead(
    new Request("https://bridge.invalid", {
      method: "POST",
      headers: { authorization: "Bearer " + token },
      body: JSON.stringify({ view: "customers", page: 1 }),
    }),
    env,
    async (url, init) => {
      methods.push(init.method);
      assert.equal(new URL(url).hostname, "source.invalid");
      return Response.json({
        users: Array.from({ length: 15 }, () => ({
          id: "a",
          email: "test@example.com",
          encrypted_password: "SECRET",
          user_metadata: { full_name: "Test", health: "SECRET" },
          app_metadata: { token: "SECRET" },
        })),
      });
    },
  );
  const data = await r.json();
  assert.equal(data.records.length, 10);
  assert(!JSON.stringify(data.records).includes("SECRET"));
  assert(methods.every((x) => x === "GET" || x === "HEAD"));
});
