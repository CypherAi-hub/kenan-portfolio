import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = ts.transpileModule(
  await readFile(new URL("../lib/portal/billing.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } },
).outputText;
async function harness() {
  const bill = { id: "bill", label: "Design deposit", cents: 350, status: "open", attempt: 1 };
  const state = { projects: [{ id: "project", title: "Website", payments: [bill] }] };
  const sessions = new Map();
  const calls = { create: [], expire: [] };
  const session = (extra = {}) => ({
    id: "session",
    mode: "payment",
    livemode: false,
    status: "complete",
    payment_status: "unpaid",
    currency: "usd",
    amount_total: 350,
    client_reference_id: "bill",
    metadata: { studio: "kjl", client: "client", project: "project", bill: "bill", attempt: "1" },
    ...extra,
  });
  let expireRace = false;
  class FakeStripe {
    constructor() {
      this.checkout = {
        sessions: {
          retrieve: async (id) => ({ ...sessions.get(id) }),
          expire: async (id) => {
            calls.expire.push(id);
            const s = sessions.get(id);
            if (expireRace) {
              s.status = "complete";
              s.payment_status = "paid";
              throw Error("Already paid");
            }
            s.status = "expired";
            return { ...s };
          },
          create: async (p, o) => {
            calls.create.push({ p, o });
            const s = session({
              id: "new-session",
              status: "open",
              url: "https://checkout.stripe.com/test",
              metadata: p.metadata,
              allowed_payment_method_types: null,
              payment_method_types: ["card", "cashapp", "link"],
            });
            sessions.set(s.id, s);
            return { ...s };
          },
        },
      };
    }
  }
  const context = vm.createContext({
    process: { env: { STRIPE_SECRET_KEY: "sk_test_mock", STRIPE_WEBHOOK_SECRET: "whsec_mock" } },
    Date,
  });
  const mocks = {
    stripe: { default: FakeStripe },
    "./auth": { origin: () => "https://kjl-designs.vercel.app" },
    "./store": {
      requireValue: (c, m) => {
        if (!c) throw Error(m);
      },
      workspace: async () => state,
      editWorkspace: async (_id, fn) => fn(state),
    },
  };
  const m = new vm.SourceTextModule(source, { context });
  await m.link(async (name) => {
    const values = mocks[name];
    assert(values, name);
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [k, v] of Object.entries(values)) this.setExport(k, v);
      },
      { context },
    );
  });
  await m.evaluate();
  return {
    api: m.namespace,
    bill,
    state,
    session,
    sessions,
    calls,
    setExpireRace: () => (expireRace = true),
  };
}
test("checkout leaves methods dynamic and preserves the invoice amount, USD and idempotency", async () => {
  const h = await harness();
  await h.api.checkout("client", "project", "bill", "client@example.com");
  const { p, o } = h.calls.create[0];
  assert.equal(p.allowed_payment_method_types, undefined);
  assert.equal(p.payment_method_types, undefined);
  assert.equal(p.line_items[0].price_data.currency, "usd");
  assert.equal(p.line_items[0].price_data.unit_amount, 350);
  assert.equal(p.metadata.bill, "bill");
  assert.equal(o.idempotencyKey, "kjl-bill-1");
});
test("an old card-only checkout is expired and replaced with one new invoice attempt", async () => {
  const h = await harness();
  h.bill.sessionId = "old";
  h.sessions.set(
    "old",
    h.session({
      id: "old",
      status: "open",
      url: "https://old.invalid",
      allowed_payment_method_types: ["card"],
    }),
  );
  await h.api.checkout("client", "project", "bill", "client@example.com");
  assert.equal(h.calls.expire.length, 1);
  assert.equal(h.bill.attempt, 2);
  assert.equal(h.calls.create[0].p.metadata.attempt, "2");
  assert.equal(h.bill.sessionId, "new-session");
});
test("a payment completed during migration is reconciled without creating another checkout", async () => {
  const h = await harness();
  h.bill.sessionId = "old";
  h.sessions.set(
    "old",
    h.session({ id: "old", status: "open", allowed_payment_method_types: ["card"] }),
  );
  h.setExpireRace();
  const r = await h.api.checkout("client", "project", "bill", "client@example.com");
  assert.equal(r.paid, true);
  assert.equal(h.bill.status, "paid");
  assert.equal(h.calls.create.length, 0);
});
test("completed but unpaid sessions remain processing until confirmed, and success clears processing", async () => {
  const h = await harness(),
    s = h.session();
  h.bill.sessionId = s.id;
  h.sessions.set(s.id, s);
  const r = await h.api.checkout("client", "project", "bill", "client@example.com");
  assert.equal(r.processing, true);
  assert.equal(h.bill.status, "open");
  assert.equal(h.bill.processing, true);
  assert.equal(h.calls.create.length, 0);
  await h.api.recordPaid({ ...s, payment_status: "paid" });
  assert.equal(h.bill.status, "paid");
  assert.equal(h.bill.processing, undefined);
  await h.api.recordDelayed(s);
  assert.equal(h.bill.status, "paid");
  assert.equal(h.bill.processing, undefined);
});
test("failed async payment unlocks exactly one new attempt; duplicate and stale events cannot reset it", async () => {
  const h = await harness(),
    s = h.session();
  await h.api.recordDelayed(s);
  await h.api.recordDelayed(s, true);
  await h.api.recordDelayed(s, true);
  await h.api.recordDelayed(s);
  assert.equal(h.bill.attempt, 2);
  assert.equal(h.bill.processing, undefined);
  assert.equal(h.bill.sessionId, undefined);
  assert(h.bill.failure);
  await h.api.checkout("client", "project", "bill", "client@example.com");
  assert.equal(h.calls.create[0].o.idempotencyKey, "kjl-bill-2");
  assert.equal(h.bill.failure, undefined);
  await h.api.recordDelayed(s, true);
  assert.equal(h.bill.sessionId, "new-session");
  assert.equal(h.bill.attempt, 2);
});
test("amount, currency, invoice identity and live-mode mismatches never mark a payment pending or paid", async () => {
  for (const change of [
    { amount_total: 400 },
    { currency: "eur" },
    { client_reference_id: "other" },
    { livemode: true },
  ]) {
    const h = await harness(),
      s = h.session(change);
    await assert.rejects(h.api.recordDelayed(s));
    assert.equal(h.bill.processing, undefined);
    await assert.rejects(h.api.recordPaid({ ...s, payment_status: "paid" }));
    assert.equal(h.bill.status, "open");
  }
});
