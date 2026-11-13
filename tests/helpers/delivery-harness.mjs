import vm from "node:vm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

export function commercialFixture(client, project) {
  return {
    sandbox: true,
    workspace: {
      client: { id: client },
      engagements: [
        { id: "engagement-" + project, project, proposal: "proposal-" + project, status: "ready" },
      ],
      proposals: [
        {
          id: "proposal-" + project,
          engagement: "engagement-" + project,
          status: "accepted",
          revision: 1,
          scope: "Approved service website and appointment request flow.",
          accepted: { actor: client, hash: "accepted-scope-v1" },
        },
      ],
      agreements: [
        {
          id: "agreement-" + project,
          engagement: "engagement-" + project,
          required: true,
          status: "completed",
          signingVersion: "v1",
          versions: [{ id: "v1" }],
          completion: {
            version: "v1",
            artifact: "synthetic-pdf",
            certificate: "synthetic-evidence",
            provider: "docusign",
            environment: "sandbox",
          },
        },
      ],
      invoices: [
        {
          id: "invoice-" + project,
          engagement: "engagement-" + project,
          label: "Initial payment",
          status: "paid",
          evidence: "synthetic-stripe-evidence",
        },
      ],
    },
    gates: {
      ["engagement-" + project]: {
        ready: true,
        paymentDefined: true,
        paymentRequired: true,
        reasons: [],
        exception: false,
      },
    },
  };
}
export async function deliveryHarness() {
  const member = (role, name, email) => ({
    id: crypto.randomUUID(),
    role,
    name,
    email,
    sessions: [{ hash: "never-return" }],
    recentChallenges: [],
  });
  const owner = member("owner", "Kenan", "kenanlarry8@gmail.com"),
    client = member("client", "Cedar Studio", "cedar@example.com"),
    other = member("client", "Other Client", "other@example.com");
  const project = {
    id: crypto.randomUUID(),
    title: "Cedar service website",
    brief: "A service website.",
    phase: "Discovery",
    created: new Date().toISOString(),
    updates: [],
    payments: [],
  };
  const otherProject = { ...project, id: crypto.randomUUID(), title: "Other private project" };
  const storage = new Map([
    ["accounts", { accounts: [owner, client, other] }],
    ["clients/" + client.id, { projects: [project] }],
    ["clients/" + other.id, { projects: [otherProject] }],
  ]);
  const sources = new Map([
    [client.id, commercialFixture(client.id, project.id)],
    [other.id, commercialFixture(other.id, otherProject.id)],
  ]);
  const calls = [],
    blobs = new Map();
  let current = owner,
    sourceStatus = 200,
    lostResponse = false;
  class PortalError extends Error {
    constructor(message, status = 400) {
      super(message);
      this.status = status;
    }
  }
  const requireValue = (value, message, status) => {
    if (!value) throw new PortalError(message, status);
  };
  const context = vm.createContext({
    Error,
    process: { env: {} },
    Buffer,
    Date,
    URL,
    Request,
    Response,
    AbortSignal,
    TextDecoder,
    TextEncoder,
    File,
    FormData,
    structuredClone,
    console,
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json(sources.get(new URL(url).searchParams.get("client")) || {}, {
        status: sourceStatus,
      });
    },
  });
  const mocks = {
    "node:crypto": { createHash: crypto.createHash },
    "@vercel/blob": {
      put: async (key, bytes, options) => {
        assertPrivate(options);
        if (blobs.has(key)) throw new Error("already exists");
        blobs.set(key, Buffer.from(bytes));
        return { pathname: key };
      },
      get: async (key, options) => {
        assertPrivate(options);
        return blobs.has(key)
          ? { statusCode: 200, stream: new Response(blobs.get(key)).body }
          : null;
      },
    },
    "lib/portal/store.ts": {
      PortalError,
      requireValue,
      namespace: () => "test-namespace",
      directory: async () => structuredClone(storage.get("accounts")),
      workspace: async (id) => structuredClone(storage.get("clients/" + id) || { projects: [] }),
      readPrivate: async (key, initial) => structuredClone(storage.get(key) || initial()),
      editPrivate: async (key, initial, apply) => {
        const state = structuredClone(storage.get(key) || initial());
        const result = apply(state);
        storage.set(key, structuredClone(state));
        if (lostResponse) {
          lostResponse = false;
          throw new Error("Synthetic lost committed response");
        }
        return result;
      },
    },
    "lib/portal/auth.ts": {
      identity: async () => current,
      origin: () => "http://localhost:3218",
      publicMember: ({ id, name, email, role }) => ({ id, name, email, role }),
    },
    "lib/portal/desk.ts": {
      assertOwner: (me) =>
        requireValue(
          me.role === "owner" && me.email === owner.email,
          "Owner access required.",
          403,
        ),
    },
  };
  const cache = new Map();
  async function load(file) {
    if (cache.has(file)) return cache.get(file);
    let loaded;
    if (mocks[file]) {
      const values = mocks[file];
      loaded = new vm.SyntheticModule(
        Object.keys(values),
        function () {
          for (const [name, value] of Object.entries(values)) this.setExport(name, value);
        },
        { context },
      );
      cache.set(file, loaded);
    } else {
      const code = ts.transpileModule(
        await readFile(new URL("../../" + file, import.meta.url), "utf8"),
        { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } },
      ).outputText;
      loaded = new vm.SourceTextModule(code, { context, identifier: file });
      cache.set(file, loaded);
      await loaded.link((specifier) =>
        load(
          specifier.startsWith("node:") || mocks[specifier]
            ? specifier
            : (specifier.startsWith("@/")
                ? specifier.slice(2)
                : path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))) +
                ".ts",
        ),
      );
    }
    return loaded;
  }
  async function api(file) {
    const loaded = await load(file);
    if (loaded.status !== "evaluated") await loaded.evaluate();
    return loaded.namespace;
  }
  const routes = await api("app/api/portal/delivery/route.ts"),
    domain = await api("lib/delivery/domain.ts"),
    commercial = await api("lib/delivery/commercial.ts");
  const cookie = "unrelated=private; kjl-session=" + "a".repeat(43) + "; another=private";
  const key = "delivery/clients/" + client.id;
  const request = (body, source = "http://localhost:3218") =>
    new Request("http://localhost:3218/api/portal/delivery", {
      method: "POST",
      headers: { origin: source, cookie, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  async function action(actor, input) {
    current = actor;
    const body = {
      client: client.id,
      project: project.id,
      revision: storage.get(key)?.projects[0]?.revision || 0,
      operation: crypto.randomUUID(),
      ...input,
    };
    const response = await routes.POST(request(body));
    return { status: response.status, data: await response.json(), body };
  }
  async function view(actor) {
    current = actor;
    const response = await routes.GET(
      new Request("http://localhost:3218/api/portal/delivery", { headers: { cookie } }),
    );
    return { status: response.status, data: await response.json() };
  }
  return {
    owner,
    client,
    other,
    project,
    otherProject,
    storage,
    sources,
    calls,
    routes,
    api,
    blobs,
    domain,
    commercial,
    action,
    view,
    request,
    cookie,
    setUser: (v) => {
      current = v;
    },
    setSourceStatus: (v) => {
      sourceStatus = v;
    },
    loseNextResponse: () => {
      lostResponse = true;
    },
    get record() {
      return storage.get(key)?.projects[0];
    },
    get state() {
      return storage.get(key);
    },
  };
}
function assertPrivate(options) {
  if (options.access !== "private" || options.allowOverwrite === true)
    throw new Error("Artifact must be private and immutable");
}
