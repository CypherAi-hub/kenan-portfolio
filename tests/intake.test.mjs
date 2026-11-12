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
      editPrivate: async (key, initial, apply) => {
        const value = structuredClone(storage.get(key) ?? initial());
        const result = apply(value);
        storage.set(key, structuredClone(value));
        return structuredClone(result);
      },
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
