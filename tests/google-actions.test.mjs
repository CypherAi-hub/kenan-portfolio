import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
const source = ts.transpileModule(
  await readFile(new URL("../lib/portal/google.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } },
).outputText;
const owner = { id: "owner", role: "owner", email: "kenanlarry8@gmail.com" };
async function harness({
  email = "cypheros.ai@gmail.com",
  busy = false,
  fail = false,
  missingScope = false,
} = {}) {
  const state = { proposals: [] },
    calls = [];
  const context = vm.createContext({
    Buffer,
    URL,
    Date,
    AbortSignal,
    process: { env: {} },
    fetch: async (url, init) => {
      if (url.includes("tokeninfo"))
        return Response.json({
          scope: missingScope
            ? "openid email"
            : "openid email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events.owned https://www.googleapis.com/auth/calendar.freebusy",
        });
      if (url.includes("userinfo")) return Response.json({ email, email_verified: true });
      if (url.includes("freeBusy"))
        return Response.json({ calendars: { primary: { busy: busy ? [{ start: "busy" }] : [] } } });
      calls.push({ url, init });
      if (fail) throw new Error("network failed");
      return Response.json({ id: "provider-receipt" });
    },
  });
  function requireValue(condition, message, status = 400) {
    if (!condition) {
      const e = new Error(message);
      e.status = status;
      throw e;
    }
  }
  const mocks = {
    "node:crypto": { createHash: crypto.createHash },
    "@vercel/connect": {
      getToken: async () => "test-token",
      startAuthorization: async () => ({ url: "https://example.com/authorize" }),
      UserAuthorizationRequiredError: class extends Error {},
      NoValidTokenError: class extends Error {},
    },
    "./desk": {
      assertOwner: (me) =>
        requireValue(me.role === "owner" && me.email === owner.email, "Owner required", 403),
      editDesk: async (fn) => fn(state),
    },
    "./store": {
      requireValue,
      directory: async () => ({
        accounts: [{ id: "client", role: "client", email: "client@example.com" }],
      }),
    },
  };
  const sandboxModule = new vm.SourceTextModule(source, { context });
  await sandboxModule.link(async (specifier) => {
    const exports = mocks[specifier];
    assert.ok(exports, specifier);
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
      },
      { context },
    );
  });
  await sandboxModule.evaluate();
  function proposal(id, action = "email") {
    const input = {
      action,
      client: "client",
      to: "client@example.com",
      title: "Project update",
      body: "Your design is ready for review.",
      start: new Date(Date.now() + 86400000).toISOString(),
    };
    state.proposals.push({ id, owner: owner.id, status: "pending", input });
    return input;
  }
  return { api: sandboxModule.namespace, state, calls, proposal };
}
test("concurrent approvals send one email and record provider receipt", async () => {
  const h = await harness(),
    input = h.proposal("one");
  const results = await Promise.allSettled([
    h.api.applyGoogleAction(owner, "one", input),
    h.api.applyGoogleAction(owner, "one", input),
  ]);
  assert.ok(results.some((x) => x.status === "fulfilled"));
  assert.equal(h.calls.length, 1);
  assert.equal(h.state.proposals[0].delivery.reference, "provider-receipt");
  await h.api.applyGoogleAction(owner, "one", input);
  assert.equal(h.calls.length, 1);
});
test("ambiguous email failure cannot resend on retry", async () => {
  const h = await harness({ fail: true }),
    input = h.proposal("two");
  await assert.rejects(h.api.applyGoogleAction(owner, "two", input), /network failed/);
  assert.equal(h.state.proposals[0].delivery.status, "unknown");
  await assert.rejects(h.api.applyGoogleAction(owner, "two", input), /needs review/);
  assert.equal(h.calls.length, 1);
});
test("wrong connected account and changed recipient fail before sending", async () => {
  const wrong = await harness({ email: "wrong@example.com" }),
    input = wrong.proposal("three");
  await assert.rejects(wrong.api.applyGoogleAction(owner, "three", input), /Connect cypheros/);
  assert.equal(wrong.calls.length, 0);
  const h = await harness(),
    changed = h.proposal("four");
  changed.to = "attacker@example.com";
  await assert.rejects(h.api.applyGoogleAction(owner, "four", changed), /email changed/);
  assert.equal(h.calls.length, 0);
});
test("busy Calendar blocks invitations; simultaneous overlapping approvals create one event", async () => {
  const h = await harness({ busy: true }),
    input = h.proposal("five", "calendar");
  await assert.rejects(h.api.applyGoogleAction(owner, "five", input), /Calendar is busy/);
  assert.equal(h.calls.length, 0);
  const clear = await harness(),
    first = clear.proposal("six", "calendar"),
    second = clear.proposal("seven", "calendar");
  second.start = first.start;
  await Promise.allSettled([
    clear.api.applyGoogleAction(owner, "six", first),
    clear.api.applyGoogleAction(owner, "seven", second),
  ]);
  assert.equal(clear.calls.length, 1);
  const payload = JSON.parse(clear.calls[0].init.body);
  assert.equal(payload.attendees[0].email, "client@example.com");
  assert.equal(Date.parse(payload.end.dateTime) - Date.parse(payload.start.dateTime), 30 * 60000);
});
test("clients cannot access external tools", async () => {
  const h = await harness(),
    client = { ...owner, role: "client" },
    input = h.proposal("eight");
  await assert.rejects(h.api.applyGoogleAction(client, "eight", input), /Owner required/);
  await assert.rejects(h.api.connectGoogle(client), /Owner required/);
  assert.equal(h.calls.length, 0);
});

test("connection check requires all permissions and working Calendar access", async () => {
  const h = await harness();
  const result = await h.api.verifyGoogleConnection(owner);
  assert.equal(result.email, "cypheros.ai@gmail.com");
  assert.equal(result.ok, true);
  assert.equal(h.calls.length, 0);
  const missing = await harness({ missingScope: true });
  await assert.rejects(missing.api.verifyGoogleConnection(owner), /missing email or Calendar/);
  await assert.rejects(
    h.api.verifyGoogleConnection({ ...owner, role: "client" }),
    /Owner required/,
  );
});
