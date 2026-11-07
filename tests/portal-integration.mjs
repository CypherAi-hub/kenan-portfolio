// Start the application with the same isolated .env as this script, then
// node --env-file=/private/path/test.env tests/portal-integration.mjs
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { get, put, del } from "@vercel/blob";
import Stripe from "stripe";
const ns = process.env.PORTAL_NAMESPACE,
  origin = process.env.PORTAL_ORIGIN;
assert.match(ns || "", /^kjl-qa-[a-zA-Z0-9-]+$/);
assert.equal(new URL(origin).hostname, "localhost");
assert.match(process.env.STRIPE_SECRET_KEY || "", /^(sk|rk|rkcs)_test_/);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const path = ns + "/accounts.json";
function fixture(role) {
  const secret = randomBytes(32).toString("base64url"),
    id = randomUUID();
  return {
    secret,
    record: {
      id,
      name: "Integration test",
      email: id + "@example.com",
      role,
      sessions: [
        {
          hash: createHash("sha256").update(secret).digest("base64url"),
          expires: Date.now() + 600000,
        },
      ],
      recentChallenges: [],
    },
  };
}
const fixtures = [fixture("owner"), fixture("client"), fixture("client")];
const [owner, client, other] = fixtures;
async function directoryChange(fn) {
  const current = await get(path, { access: "private", useCache: false });
  const data = current ? await new Response(current.stream).json() : { accounts: [] };
  fn(data);
  await put(path, JSON.stringify(data), {
    access: "private",
    allowOverwrite: !!current,
    addRandomSuffix: false,
    ifMatch: current?.blob.etag.replace(/^W\//, ""),
    contentType: "application/json",
  });
}
async function post(as, body, source = origin) {
  const r = await fetch(origin + "/api/portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: source,
      cookie: "kjl-session=" + as.secret,
    },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}
async function webhook(session, badSignature = false) {
  const body = JSON.stringify({ type: "checkout.session.completed", data: { object: session } });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: badSignature ? "wrong" : process.env.STRIPE_WEBHOOK_SECRET,
  });
  return (
    await fetch(origin + "/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body,
    })
  ).status;
}
owner.record.email = "kenanlarry8@gmail.com";
async function assistant(as, body) {
  const r = await fetch(origin + "/api/portal/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", origin, cookie: "kjl-session=" + as.secret },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}
await directoryChange((d) => d.accounts.push(...fixtures.map((f) => f.record)));
try {
  const cid = client.record.id;
  const p = await post(owner, {
    action: "project",
    client: cid,
    title: "Portal integration test",
    brief: "Temporary test workspace.",
  });
  assert.equal(p.status, 200, JSON.stringify(p.data));
  const project = p.data.project;
  const view = async () =>
    (
      await fetch(origin + "/api/portal", { headers: { cookie: "kjl-session=" + client.secret } })
    ).json();
  assert.equal(
    (await post(other, { action: "comment", project, client: cid, body: "Foreign write" })).status,
    404,
  );
  assert.equal(
    (await post(client, { action: "invite", name: "Test", email: "ignored@example.com" })).status,
    403,
  );
  assert.equal(
    (
      await post(
        owner,
        { action: "bill", project, client: cid, label: "Deposit", amount: "3.50" },
        "https://example.org",
      )
    ).status,
    403,
  );
  await Promise.all(
    ["First update", "Second update"].map(async (body) =>
      assert.equal(
        (
          await post(owner, {
            action: "update",
            client: cid,
            project,
            phase: "Design",
            body,
            review: true,
          })
        ).status,
        200,
      ),
    ),
  );
  let work = (await view()).projects[0];
  assert.equal(work.updates.length, 2);
  const review = {
    action: "review",
    project,
    client: cid,
    update: work.updates[0].id,
    decision: "approved",
  };
  assert.equal((await post(client, review)).status, 200);
  assert.equal((await post(client, review)).status, 409);
  assert.equal(
    (await post(owner, { action: "bill", project, client: cid, label: "Deposit", amount: "3.50" }))
      .status,
    200,
  );
  const bill = (await view()).projects[0].payments[0];
  assert.equal(
    (await post(other, { action: "checkout", client: cid, project, bill: bill.id })).status,
    404,
  );
  assert.equal(
    (await assistant(client, { action: "ask", message: "List every client" })).status,
    403,
  );
  assert.equal((await assistant(other, { action: "apply", id: "forged" })).status, 403);
  assert.equal((await assistant(client, { action: "connect-google" })).status, 403);
  assert.equal((await assistant(other, { action: "connect-google" })).status, 403);
  const start = new Date(Date.now() + 3 * 86400000).toISOString();
  assert.equal(
    (
      await assistant(client, {
        action: "request-appointment",
        start,
        title: "Integration meeting",
      })
    ).status,
    200,
  );
  assert.equal(
    (await assistant(other, { action: "request-appointment", start, title: "Overlapping meeting" }))
      .status,
    200,
  );
  const appointments = (
    await (
      await fetch(origin + "/api/portal/assistant", {
        headers: { cookie: "kjl-session=" + owner.secret },
      })
    ).json()
  ).appointments;
  const own = appointments.find((a) => a.client === cid),
    conflict = appointments.find((a) => a.client === other.record.id);
  assert.equal(
    (
      await assistant(owner, {
        action: "review-appointment",
        appointment: own.id,
        decision: "approved",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await assistant(owner, {
        action: "review-appointment",
        appointment: conflict.id,
        decision: "approved",
      })
    ).status,
    409,
  );
  const clientAppointments = (
    await (
      await fetch(origin + "/api/portal/assistant", {
        headers: { cookie: "kjl-session=" + client.secret },
      })
    ).json()
  ).appointments;
  assert(clientAppointments.every((a) => a.client === cid));
  assert.equal((await assistant(owner, { action: "apply", id: "forged" })).status, 409);
  if (process.env.TEST_ASSISTANT_MODEL === "1") {
    const reply = await assistant(owner, {
      action: "ask",
      message:
        "Prepare one portal comment for client id " +
        cid +
        " and project id " +
        project +
        ". The exact comment text should be: The design is ready for your review. Propose the comment action.",
    });
    assert.equal(reply.status, 200, JSON.stringify(reply.data));
    assert(reply.data.proposals.length === 1);
    const proposal = reply.data.proposals[0];
    assert.equal(proposal.input.action, "comment");
    const before = (await view()).projects[0].updates.length;
    const both = await Promise.all([
      assistant(owner, { action: "apply", id: proposal.id }),
      assistant(owner, { action: "apply", id: proposal.id }),
    ]);
    assert(
      both.every((r) => r.status === 200),
      JSON.stringify(both),
    );
    assert.equal((await view()).projects[0].updates.length, before + 1);
    console.log("Live model proposal generated and applied once under concurrent replay.");
  }
  console.log(
    "Assistant owner authorization, appointment privacy and overlap prevention verified.",
  );
  const session = {
    id: "cs_test_fixture",
    mode: "payment",
    livemode: false,
    payment_status: "paid",
    amount_total: 350,
    currency: "usd",
    client_reference_id: bill.id,
    metadata: { studio: "kjl", client: cid, project, bill: bill.id, attempt: "1" },
  };
  assert.equal(await webhook(session, true), 400);
  assert.equal(await webhook({ ...session, amount_total: 349 }), 500);
  assert.equal((await view()).projects[0].payments[0].status, "open");
  assert.equal(await webhook(session), 200);
  const paid = (await view()).projects[0].payments[0];
  assert.equal(paid.status, "paid");
  assert.equal(paid.test, true);
  assert.equal(await webhook(session), 200);
  assert.equal((await view()).projects[0].payments[0].paidAt, paid.paidAt);
  console.log(
    "Passed cross-client isolation, owner-only writes, origin checks, concurrent updates, one-time review, signature and amount checks, and webhook replay.",
  );
} finally {
  await directoryChange((d) => {
    d.accounts = d.accounts.filter((a) => !fixtures.some((f) => f.record.id === a.id));
  });
  await del(ns + "/clients/" + client.record.id + ".json");
  const deskPath = ns + "/owner-desk.json";
  const deskItem = await get(deskPath, { access: "private", useCache: false });
  if (deskItem) {
    const data = await new Response(deskItem.stream).json();
    data.appointments = data.appointments.filter(
      (a) => ![client.record.id, other.record.id].includes(a.client),
    );
    data.proposals = data.proposals.filter((p) => p.owner !== owner.record.id);
    await put(deskPath, JSON.stringify(data), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      ifMatch: deskItem.blob.etag.replace(/^W\//, ""),
      contentType: "application/json",
    });
  }
}
