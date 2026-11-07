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
async function webhook(session, badSignature = false, type = "checkout.session.completed") {
  const body = JSON.stringify({ type, data: { object: session } });
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
  const page = async (path, as) =>
    fetch(origin + path, {
      redirect: "manual",
      headers: as ? { cookie: "kjl-session=" + as.secret } : {},
    });
  for (const [path, as, destination] of [
    ["/studio", null, "/studio/login"],
    ["/portal", null, "/portal/login"],
    ["/studio", client, "/portal"],
    ["/portal", owner, "/studio"],
    ["/portal?checkout=returned", null, "/portal/login?checkout=returned"],
  ]) {
    const r = await page(path, as);
    assert.equal(r.status, 307);
    assert.equal(r.headers.get("location"), destination);
  }
  for (const [path, as] of [
    ["/studio", owner],
    ["/portal", client],
    ["/studio/login", null],
    ["/portal/login", null],
  ]) {
    const r = await page(path, as);
    assert.equal(r.status, 200, path);
    assert(r.headers.get("x-robots-tag").includes("noindex"));
    const html = await r.text();
    if (path === "/studio/login") assert(html.includes("Welcome back, Kenan."));
    if (path === "/portal/login") assert(html.includes("Sign in to my project"));
  }
  assert.equal((await post(owner, { action: "begin", audience: "admin" })).status, 400);
  console.log(
    "Separate studio/client pages, role redirects, checkout return and private page headers verified.",
  );
  const projectRequest = async (as, body, source = origin) => {
    const r = await fetch(origin + "/api/portal/projects", {
      method: body ? "POST" : "GET",
      headers: {
        cookie: "kjl-session=" + as.secret,
        origin: source,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: await r.json() };
  };
  assert.equal((await projectRequest(client)).status, 403);
  assert.equal((await projectRequest(other, { action: "inspect", slug: "fofit" })).status, 403);
  assert.equal(
    (await projectRequest(owner, { action: "inspect", slug: "fofit" }, "https://example.org"))
      .status,
    403,
  );
  assert.equal(
    (await projectRequest(owner, { action: "inspect", slug: "https://example.org" })).status,
    404,
  );
  const catalog = await projectRequest(owner);
  assert.equal(catalog.status, 200);
  assert(catalog.data.projects.length > 20);
  console.log(
    "Owner project catalog:",
    catalog.data.projects.length,
    "projects; client access denied.",
  );
  for (const slug of ["fofit", "ultraflips", "general-services"]) {
    const r = await projectRequest(owner, { action: "inspect", slug, view: "customers" });
    assert.equal(r.status, 200);
    assert.equal(r.data.privateData.access, "read-only");
    assert(r.data.privateData.records.length <= 10);
    console.log(
      "Private project read verified:",
      slug,
      r.data.privateData.records.length,
      "bounded directory records",
    );
  }
  if (process.env.TEST_ASSISTANT_MODEL === "1") {
    for (const message of [
      "List my portfolio project names including Meridian Atlas, FoFit, UltraFlips, HireCrate and Maryville. Do not list client workspaces.",
      "Assess FoFit using its current connected evidence and saved screenshot. Give three practical improvements and clearly distinguish observations from suggestions.",
    ]) {
      const r = await assistant(owner, { action: "ask", message });
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert(r.data.reply.length > 10);
      if (message.startsWith("Assess"))
        assert(
          r.data.evidence?.some((e) => e.title.includes("FoFit")),
          "No real project tool evidence",
        );
      console.log(
        "Real model verified:",
        message.startsWith("Assess")
          ? "project assessment with actual tool evidence"
          : "full portfolio catalog",
      );
    }
  }
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
  assert.equal((await assistant(client, { action: "verify-google" })).status, 403);
  assert.equal(
    (await assistant(client, { action: "prepare-appointment", appointment: "forged" })).status,
    403,
  );
  assert.equal(
    (await assistant(client, { action: "reconcile-calendar", id: "forged" })).status,
    403,
  );
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
    assert(reply.data.proposals.length === 1, JSON.stringify(reply.data));
    const proposal = reply.data.proposals[0];
    assert.equal(proposal.input.action, "comment");
    assert.equal(proposal.input.body, "The design is ready for your review.");
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
    const saved = await (
      await fetch(origin + "/api/portal/assistant", {
        headers: { cookie: "kjl-session=" + owner.secret },
      })
    ).json();
    assert(
      saved.conversation.some((m) =>
        m.proposals?.some((p) => p.id === proposal.id && p.status === "applied"),
      ),
    );
    const clientDesk = await (
      await fetch(origin + "/api/portal/assistant", {
        headers: { cookie: "kjl-session=" + client.secret },
      })
    ).json();
    assert.equal(clientDesk.conversation, undefined);
    console.log("Live model proposal generated and applied once under concurrent replay.");
  }
  console.log(
    "Assistant owner authorization, appointment privacy and overlap prevention verified.",
  );
  // Use an actual Stripe sandbox checkout, then simulate signed provider events
  // against the deployed local route to verify delayed payment lifecycle handling.
  const started = await post(client, { action: "checkout", client: cid, project, bill: bill.id });
  assert.equal(started.status, 200, JSON.stringify(started.data));
  const openedBill = (await view()).projects[0].payments[0];
  const real = await stripe.checkout.sessions.retrieve(openedBill.sessionId);
  assert.equal(real.allowed_payment_method_types, null);
  assert(real.payment_method_types.includes("card"));
  console.log(
    "Actual Stripe sandbox checkout supports dynamic methods:",
    real.payment_method_types.join(", "),
  );
  await stripe.checkout.sessions.expire(real.id);
  const pending = { ...real, status: "complete", payment_status: "unpaid" };
  assert.equal(await webhook(pending), 200);
  assert.equal((await view()).projects[0].payments[0].processing, true);
  assert.equal((await view()).projects[0].payments[0].status, "open");
  assert.equal(await webhook(pending, false, "checkout.session.async_payment_failed"), 200);
  assert.equal(await webhook(pending, false, "checkout.session.async_payment_failed"), 200);
  assert.equal((await view()).projects[0].payments[0].attempt, 2);
  assert.equal((await view()).projects[0].payments[0].sessionId, undefined);
  console.log("Signed async failure clears processing and permits one new payment attempt.");
  const session = {
    id: "cs_test_fixture",
    mode: "payment",
    livemode: false,
    payment_status: "paid",
    amount_total: 350,
    currency: "usd",
    client_reference_id: bill.id,
    metadata: { studio: "kjl", client: cid, project, bill: bill.id, attempt: "2" },
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
  async function notices(as) {
    return (
      await (
        await fetch(origin + "/api/portal/assistant?section=notifications", {
          headers: { cookie: "kjl-session=" + as.secret },
        })
      ).json()
    ).notifications;
  }
  const mine = await notices(client),
    unrelated = await notices(other),
    ownerNotices = await notices(owner);
  assert(mine.items.some((n) => n.kind === "project"));
  assert(mine.items.some((n) => n.kind === "payment"));
  assert(!unrelated.items.some((n) => n.kind === "project" || n.kind === "payment"));
  assert(ownerNotices.items.some((n) => n.title.includes("reviewed")));
  assert.equal(
    (await assistant(client, { action: "read-notifications", client: other.record.id })).status,
    200,
  );
  assert.equal((await notices(client)).unread, 0);
  assert((await notices(owner)).unread > 0);
  console.log(
    "Saved assistant proposals, client notification privacy and account-scoped read state verified.",
  );
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
    data.messages = [];
    await put(deskPath, JSON.stringify(data), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      ifMatch: deskItem.blob.etag.replace(/^W\//, ""),
      contentType: "application/json",
    });
  }
  for (const f of fixtures) {
    const key = ns + "/notification-read-" + f.record.id + ".json";
    if (await get(key, { access: "private", useCache: false })) await del(key);
  }
}
