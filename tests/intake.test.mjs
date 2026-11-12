import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

const owner = { id: "owner", role: "owner", email: "kenanlarry8@gmail.com" };
const base = () => ({
  work: "A new build",
  kind: "Internal tool or dashboard",
  idea: "A facilities request portal for staff and students.",
  success: "Requests reach the right technician and progress is visible.",
  audience: ["Employees", "Customers or the public"],
  journey: "Submit a problem, assign it, update progress, and close it.",
  mustHave: "Requests, assignment and status tracking",
  name: "Discovery Fixture",
  email: "discovery@example.com",
  features: ["User accounts", "Notifications"],
});
async function harness({ failAI = false, invalidRefs = false } = {}) {
  const storage = new Map(),
    env = { OPENAI_API_KEY: "test-only", PORTAL_SIGNING_KEY: "a".repeat(40) };
  let currentUser = owner,
    calls = 0,
    lastModel;
  let failure;
  const edit = async (key, initial, apply) => {
    let fail;
    if (failure?.key === key) {
      if (failure.skip > 0) failure.skip--;
      else {
        fail = failure;
        failure = undefined;
      }
    }
    if (fail && !fail.afterCommit) throw new Error("Synthetic storage failure");
    const value = structuredClone(storage.get(key) ?? initial());
    const result = apply(value);
    storage.set(key, structuredClone(value));
    if (fail) throw new Error("Synthetic storage failure after commit");
    return structuredClone(result);
  };
  class PortalError extends Error {
    constructor(message, status = 400) {
      super(message);
      this.status = status;
    }
  }
  const requireValue = (condition, message, status) => {
    if (!condition) throw new PortalError(message, status);
  };
  const context = vm.createContext({
    process: { env },
    Buffer,
    Date,
    URL,
    Response,
    Request,
    TextDecoder,
    AbortSignal,
    console,
    fetch: async (_url, options) => {
      calls++;
      lastModel = JSON.parse(options.body);
      if (failAI) throw new Error("Provider unavailable");
      const result =
        lastModel.text.format.name === "project_followups"
          ? {
              questions: [
                {
                  question: "Who assigns each new request?",
                  reason: "Assignment affects staff permissions.",
                  sourceIds: [invalidRefs ? "invented" : "journey"],
                },
              ],
            }
          : {
              summary: "A facilities request portal with assignment and progress tracking.",
              requirements: [
                {
                  text: "Staff can assign submitted requests.",
                  sourceIds: [invalidRefs ? "invented" : "mustHave"],
                },
              ],
              assumptions: ["Assignment permissions need confirmation."],
              openQuestions: ["Who assigns requests?"],
              acceptanceCriteria: ["A submitted request can be assigned and closed."],
              technicalDirection:
                "Choose authentication after reviewing existing organization systems.",
            };
      return Response.json({
        status: "completed",
        output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }],
      });
    },
  });
  const mockValues = {
    "lib/portal/store.ts": {
      PortalError,
      requireValue,
      readPrivate: async (key, initial) => structuredClone(storage.get(key) ?? initial()),
      editPrivate: edit,
      directory: async () => structuredClone(storage.get("accounts") ?? { accounts: [] }),
      workspace: async (id) => structuredClone(storage.get("clients/" + id) ?? { projects: [] }),
      editWorkspace: async (id, apply) => edit("clients/" + id, () => ({ projects: [] }), apply),
    },
    "lib/portal/desk.ts": {
      assertOwner: (me) =>
        requireValue(
          me.role === "owner" && me.email === owner.email,
          "Owner access is required.",
          403,
        ),
    },
    "lib/portal/auth.ts": {
      identity: async () => currentUser,
      origin: () => "http://localhost:3217",
    },
    "node:crypto": Object.fromEntries(
      ["createHash", "createHmac", "timingSafeEqual", "randomUUID"].map((k) => [k, crypto[k]]),
    ),
  };
  const cache = new Map();
  async function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (mockValues[file]) {
      const exports = mockValues[file];
      const loadedModule = new vm.SyntheticModule(
        Object.keys(exports),
        function () {
          for (const [k, v] of Object.entries(exports)) this.setExport(k, v);
        },
        { context },
      );
      cache.set(file, loadedModule);
      return loadedModule;
    }
    const code = ts.transpileModule(
      await readFile(new URL("../" + file, import.meta.url), "utf8"),
      { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } },
    ).outputText;
    const loadedModule = new vm.SourceTextModule(code, { context, identifier: file });
    cache.set(file, loadedModule);
    await loadedModule.link((specifier) =>
      load(
        specifier.startsWith("node:")
          ? specifier
          : (specifier.startsWith("@/")
              ? specifier.slice(2)
              : path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))) + ".ts",
      ),
    );
    return loadedModule;
  }
  async function api(file) {
    const m = await load(file);
    if (m.status !== "evaluated") await m.evaluate();
    return m.namespace;
  }
  const service = await api("lib/intake/service.ts"),
    questions = await api("lib/intake/questions.ts"),
    ai = await api("lib/intake/ai.ts"),
    pub = await api("app/api/inquiries/route.ts"),
    admin = await api("app/api/portal/inquiries/route.ts");
  const handoff = await api("lib/intake/handoff.ts");
  function input(allowAI = false) {
    return { action: "submit", id: crypto.randomUUID(), answers: base(), allowAI, consent: true };
  }
  const req = (data, { origin = "http://localhost:3217", url = "/api/inquiries" } = {}) =>
    new Request("http://localhost:3217" + url, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  return {
    service,
    questions,
    ai,
    pub,
    admin,
    input,
    req,
    storage,
    handoff,
    failNextWrite: (key, skip = 0, afterCommit = false) => {
      failure = { key, skip, afterCommit };
    },
    setUser: (user) => {
      currentUser = user;
    },
    get calls() {
      return calls;
    },
    get lastModel() {
      return lastModel;
    },
  };
}

test("branch changes remove inactive requirements and reject unknown choices", async () => {
  const h = await harness(),
    a = base();
  a.features = ["Payments"];
  a.payments = "Monthly subscriptions";
  a.uploads = "Stale confidential file requirement";
  const active = h.questions.cleanAnswers(a);
  assert.equal(active.payments, a.payments);
  assert.equal(active.uploads, undefined);
  a.features = [];
  assert.equal(h.questions.cleanAnswers(a).payments, undefined);
  assert.throws(() => h.questions.cleanAnswers({ ...a, features: ["invented"] }), /Check/);
  assert.throws(
    () => h.questions.cleanAnswers({ ...a, audience: ["Employees", "Not sure yet"] }),
    /Choose either/,
  );
  assert.throws(() => h.questions.validateAnswers({ ...a, email: "broken" }), /email/);
});
test("submissions persist original answers, remain private, and are idempotent", async () => {
  const h = await harness(),
    body = h.input();
  const results = await Promise.all([h.pub.POST(h.req(body)), h.pub.POST(h.req(body))]);
  assert(results.every((r) => r.status === 200));
  assert.equal((await h.service.listInquiries(owner)).length, 1);
  const inquiry = await h.service.getInquiry(owner, body.id);
  assert.equal(inquiry.answers.idea, body.answers.idea);
  assert.equal(inquiry.generation.status, "not-requested");
  assert.equal(h.calls, 0);
  assert.equal(
    (await h.pub.POST(h.req({ ...body, answers: { ...body.answers, idea: "Changed" } }))).status,
    409,
  );
  await assert.rejects(h.service.getInquiry({ ...owner, role: "client" }, body.id), /Owner/);
  h.setUser(null);
  assert.equal(
    (
      await h.admin.GET(
        new Request("http://localhost:3217/api/portal/inquiries?id=" + body.id + "&download=1"),
      )
    ).status,
    401,
  );
  h.setUser({ ...owner, role: "client" });
  assert.equal(
    (await h.admin.GET(new Request("http://localhost:3217/api/portal/inquiries"))).status,
    403,
  );
  assert.equal((await h.admin.POST(h.req({ action: "retry", id: body.id }))).status, 403);
});
test("bad origin, malformed data, excessive payloads and honeypot never save inquiries", async () => {
  const h = await harness();
  assert.equal(
    (await h.pub.POST(h.req(h.input(), { origin: "https://attacker.invalid" }))).status,
    403,
  );
  assert.equal((await h.pub.POST(h.req({ ...h.input(), consent: false }))).status, 400);
  assert.equal((await h.pub.POST(h.req({ ...h.input(), website: "bot" }))).status, 400);
  assert.equal((await h.pub.POST(h.req({ ...h.input(), id: "../../accounts" }))).status, 404);
  assert.equal(
    (await h.pub.POST(h.req({ ...h.input(), answers: { idea: "x".repeat(66000) } }))).status,
    413,
  );
  assert.equal((await h.service.listInquiries(owner)).length, 0);
});
test("follow-ups are signed, expire, bind to answers and reject fabricated provenance", async () => {
  const h = await harness(),
    answers = h.questions.validateAnswers(base());
  const result = await h.ai.clarify(answers);
  assert.equal(result.questions.length, 1);
  const verified = h.ai.verifyQuestions(answers, result.token, { followup_1: "The supervisor" });
  assert.equal(verified.answers.followup_1, "The supervisor");
  assert.throws(
    () => h.ai.verifyQuestions({ ...answers, idea: "A different idea" }, result.token, {}),
    /changed/,
  );
  assert.throws(
    () => h.ai.verifyQuestions(answers, result.token.slice(0, -4) + "AAAA", {}),
    /refresh/,
  );
  const expired = Buffer.from(
    JSON.stringify({ fingerprint: h.ai.fingerprint(answers), questions: [], expires: 1 }),
  ).toString("base64url");
  const mac = crypto.createHmac("sha256", "a".repeat(40)).update(expired).digest("base64url");
  assert.throws(() => h.ai.verifyQuestions(answers, expired + "." + mac, {}), /expired/);
  const bad = await harness({ invalidRefs: true });
  await assert.rejects(bad.ai.clarify(answers), /references/);
  assert(!JSON.stringify(h.lastModel.input).includes(base().email));
  assert(!JSON.stringify(h.lastModel.input).includes(base().name));
  assert.equal(h.lastModel.store, false);
  assert.equal(h.lastModel.tools, undefined);
});
test("AI failure preserves the inquiry and does not fake a generated brief", async () => {
  const h = await harness({ failAI: true }),
    body = h.input(true);
  const response = await h.pub.POST(h.req(body));
  assert.equal(response.status, 200);
  const inquiry = await h.service.getInquiry(owner, body.id);
  assert.equal(inquiry.generation.status, "failed");
  assert.equal(inquiry.versions.length, 0);
  assert.equal(inquiry.answers.idea, body.answers.idea);
  assert.match(h.service.exportInquiry(inquiry), /no AI brief generated/);
  await h.pub.POST(h.req(body));
  assert.equal(h.calls, 1, "submission retry must not repeatedly bill for failed AI");
});
test("validated AI draft, manual versioning, stale-write prevention and saved export", async () => {
  const h = await harness(),
    body = h.input(true);
  await h.pub.POST(h.req(body));
  const inquiry = await h.service.getInquiry(owner, body.id);
  assert.equal(inquiry.generation.status, "ready");
  assert.equal(inquiry.versions[0].author, "AI draft");
  assert.match(inquiry.versions[0].markdown, /sources: mustHave/);
  assert.match(h.service.exportInquiry(inquiry), /Original answers/);
  assert.match(inquiry.versions[0].markdown, /AI-proposed scope/);
  const input = {
    id: body.id,
    revision: inquiry.revision,
    status: "Reviewed",
    markdown: "# Owner-reviewed brief\n\nDeliver a request tracking workflow.",
  };
  const saved = await h.service.updateInquiry(owner, input);
  assert.equal(saved.versions.length, 2);
  assert.equal(saved.status, "Reviewed");
  await assert.rejects(h.service.updateInquiry(owner, input), /changed/);
  await assert.rejects(h.service.retryBrief(owner, body.id), /owner edits/);
  const response = await h.admin.GET(
    new Request("http://localhost:3217/api/portal/inquiries?id=" + body.id + "&download=1"),
  );
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Owner-reviewed brief/);
  assert.match(response.headers.get("content-type"), /text\/markdown/);
});
test("one AI draft under concurrent submission retries and strict manual-only consent", async () => {
  const h = await harness(),
    body = h.input(true);
  await Promise.all([h.pub.POST(h.req(body)), h.pub.POST(h.req(body))]);
  const inquiry = await h.service.getInquiry(owner, body.id);
  assert.equal(inquiry.versions.length, 1);
  assert.equal(h.calls, 1);
  const manual = h.input(false);
  await h.pub.POST(h.req(manual));
  await assert.rejects(h.service.retryBrief(owner, manual.id), /did not authorize/);
});
test("public daily AI follow-up limits are durable across requests", async () => {
  const h = await harness();
  for (let n = 0; n < 6; n++)
    assert.equal(
      (await h.pub.POST(h.req({ action: "clarify", answers: base(), allowAI: true }))).status,
      200,
    );
  assert.equal(
    (await h.pub.POST(h.req({ action: "clarify", answers: base(), allowAI: true }))).status,
    429,
  );
  assert.equal(h.calls, 6);
});

async function reviewedFixture() {
  const h = await harness(),
    body = h.input();
  await h.pub.POST(h.req(body));
  const inquiry = await h.service.updateInquiry(owner, {
    id: body.id,
    revision: 1,
    status: "Reviewed",
    markdown:
      "# Internal reviewed brief\nPrivate owner notes. Proposed scope requires commercial approval.",
  });
  const client = {
    id: crypto.randomUUID(),
    role: "client",
    name: "Selected Client",
    email: "client@example.com",
    credential: { publicKey: "never-return" },
    sessions: ["never-return"],
  };
  const other = {
    ...client,
    id: crypto.randomUUID(),
    name: "Other Client",
    email: "other@example.com",
  };
  h.storage.set("accounts", { accounts: [owner, client, other] });
  const input = {
    action: "handoff",
    id: inquiry.id,
    revision: inquiry.revision,
    clientId: client.id,
    mode: "new",
    title: "Discovery project",
    summary: "Client-visible introduction only.",
    confirmed: true,
  };
  return { h, input, client, other, inquiry };
}
test("handoff reuses client identity, shares only explicit summary, and does not activate or bill", async () => {
  const { h, input, client, inquiry } = await reviewedFixture();
  const response = await h.admin.POST(h.req(input));
  assert.equal(response.status, 200);
  const saved = (await response.json()).inquiry;
  assert.equal(saved.handoff.status, "linked");
  assert.equal(saved.handoff.clientId, client.id);
  assert.equal(saved.handoff.requestedBy, owner.id);
  assert.equal(saved.handoff.sourceRevision, inquiry.revision);
  assert.equal(saved.handoff.sourceMarkdown, inquiry.versions.at(-1).markdown);
  assert(saved.handoff.linkedAt);
  const w = h.storage.get("clients/" + client.id);
  assert.equal(w.projects.length, 1);
  assert.equal(w.projects[0].phase, "Discovery");
  assert.equal(w.projects[0].brief, input.summary);
  assert.deepEqual(w.projects[0].payments, []);
  assert.deepEqual(w.projects[0].updates, []);
  assert(!JSON.stringify(w).includes("Private owner notes"));
  assert(!JSON.stringify(w).includes(inquiry.answers.email));
  assert.equal(h.calls, 0);
  assert.equal((await h.service.listInquiries(owner))[0].handoff, "linked");
  const options = await h.handoff.handoffOptions(owner, client.id);
  assert.equal(options.projects[0].id, saved.handoff.projectId);
  assert(!JSON.stringify(options).includes("never-return"));
});
test("concurrent handoff retries create one project and reject a changed destination", async () => {
  const { h, input, client, other } = await reviewedFixture();
  const results = await Promise.all(Array.from({ length: 5 }, () => h.admin.POST(h.req(input))));
  assert(results.every((r) => r.status === 200));
  assert.equal(h.storage.get("clients/" + client.id).projects.length, 1);
  const after = await h.service.getInquiry(owner, input.id);
  assert.equal(after.revision, input.revision + 2);
  const replay = await h.handoff.handoffInquiry(owner, input);
  assert.equal(replay.revision, after.revision);
  assert.equal(replay.handoff.projectId, after.handoff.projectId);
  assert.equal((await h.admin.POST(h.req({ ...input, clientId: other.id }))).status, 409);
  assert.equal((await h.admin.POST(h.req({ ...input, summary: "Different scope" }))).status, 409);
  assert.equal(h.storage.get("clients/" + other.id), undefined);
});
test("handoff rejects anonymous, client, forged owner, cross-client project, bad origin and invalid input", async () => {
  const { h, input, client, other } = await reviewedFixture();
  const otherProject = {
    id: crypto.randomUUID(),
    title: "Other project",
    brief: "private",
    phase: "Build",
    created: new Date().toISOString(),
    updates: [],
    payments: [],
  };
  h.storage.set("clients/" + other.id, { projects: [otherProject] });
  for (const user of [null, client, { ...owner, email: "attacker@example.com" }]) {
    h.setUser(user);
    assert.equal((await h.admin.POST(h.req(input))).status, user ? 403 : 401);
    assert.equal(
      (await h.admin.GET(new Request("http://localhost:3217/api/portal/inquiries?handoff=options")))
        .status,
      user ? 403 : 401,
    );
  }
  h.setUser(owner);
  assert.equal(
    (await h.admin.POST(h.req(input, { origin: "https://attacker.invalid" }))).status,
    403,
  );
  for (const changed of [
    { clientId: "../../accounts" },
    { mode: "active" },
    { confirmed: false },
    { summary: " " },
    { summary: "x".repeat(2401) },
    { title: "x".repeat(121) },
  ])
    assert.equal((await h.admin.POST(h.req({ ...input, ...changed }))).status, 400);
  assert.equal(
    (await h.admin.POST(h.req({ ...input, clientId: crypto.randomUUID() }))).status,
    404,
  );
  assert.equal(
    (await h.admin.POST(h.req({ ...input, mode: "existing", projectId: otherProject.id }))).status,
    404,
  );
  assert.equal(h.storage.get("clients/" + client.id), undefined);
  assert.equal((await h.service.getInquiry(owner, input.id)).handoff, undefined);
});
test("handoff requires a saved reviewed brief and rejects stale review revisions", async () => {
  const { h, input, client } = await reviewedFixture();
  assert.equal((await h.admin.POST(h.req({ ...input, revision: 1 }))).status, 409);
  const current = await h.service.updateInquiry(owner, {
    id: input.id,
    revision: input.revision,
    status: "New",
    markdown: "Changed draft",
  });
  assert.equal((await h.admin.POST(h.req({ ...input, revision: current.revision }))).status, 409);
  assert.equal(h.storage.get("clients/" + client.id), undefined);
  assert.equal((await h.service.getInquiry(owner, input.id)).handoff, undefined);
});
test("existing-project handoff preserves scope, progress, payment and prior operations", async () => {
  const { h, input, client } = await reviewedFixture();
  const project = {
    id: crypto.randomUUID(),
    title: "Current project",
    brief: "Agreed scope",
    phase: "Build",
    created: "2026-11-01T00:00:00Z",
    updates: [{ body: "Existing update" }],
    payments: [{ id: "test-paid", status: "paid", cents: 5000, test: true }],
  };
  const before = { projects: [project], operations: ["existing-operation"] };
  h.storage.set("clients/" + client.id, before);
  const saved = await h.handoff.handoffInquiry(owner, {
    ...input,
    mode: "existing",
    projectId: project.id,
  });
  assert.equal(saved.handoff.projectId, project.id);
  assert.equal(saved.handoff.title, project.title);
  assert.equal(saved.handoff.summary, "");
  assert.deepEqual(h.storage.get("clients/" + client.id), before);
});
test("handoff recovers every write boundary, including a lost committed response", async () => {
  for (const boundary of [
    "claim",
    "project-before",
    "project-after",
    "complete-before",
    "complete-after",
    "index",
    "complete-index",
  ]) {
    const { h, input, client } = await reviewedFixture();
    const inquiryKey = "inquiries/items/" + input.id;
    if (boundary === "claim") h.failNextWrite(inquiryKey);
    if (boundary.startsWith("project"))
      h.failNextWrite("clients/" + client.id, 0, boundary.endsWith("after"));
    if (boundary.startsWith("complete")) h.failNextWrite(inquiryKey, 1, boundary.endsWith("after"));
    if (boundary === "index") h.failNextWrite("inquiries/index");
    if (boundary === "complete-index") h.failNextWrite("inquiries/index", 1);
    assert.equal((await h.admin.POST(h.req(input))).status, 503, boundary);
    const partial = await h.service.getInquiry(owner, input.id);
    if (partial.handoff?.status === "pending") {
      await assert.rejects(
        h.service.updateInquiry(owner, {
          id: input.id,
          revision: partial.revision,
          status: "Reviewed",
          markdown: "Edit during recovery",
        }),
        /pending/,
      );
    }
    const resumed = await h.handoff.handoffInquiry(
      owner,
      partial.handoff ? { id: input.id, resume: true } : input,
    );
    assert.equal(resumed.handoff.status, "linked", boundary);
    assert.equal(h.storage.get("clients/" + client.id).projects.length, 1, boundary);
    assert.equal((await h.service.listInquiries(owner))[0].handoff, "linked", boundary);
    if (partial.handoff) assert.equal(resumed.handoff.projectId, partial.handoff.projectId);
  }
});
test("later brief edits keep the handed-off source snapshot and do not rewrite the client project", async () => {
  const { h, input, client } = await reviewedFixture();
  const linked = await h.handoff.handoffInquiry(owner, input);
  const later = await h.service.updateInquiry(owner, {
    id: input.id,
    revision: linked.revision,
    status: "Needs clarification",
    markdown: "Later private notes and open questions",
  });
  assert.equal(later.handoff.sourceMarkdown, linked.handoff.sourceMarkdown);
  assert.notEqual(later.versions.at(-1).markdown, later.handoff.sourceMarkdown);
  assert.equal(h.storage.get("clients/" + client.id).projects[0].brief, input.summary);
  const replay = await h.handoff.handoffInquiry(owner, { id: input.id, resume: true });
  assert.equal(replay.revision, later.revision);
});
