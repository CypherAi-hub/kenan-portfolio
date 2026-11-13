import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { deliveryHarness } from "./helpers/delivery-harness.mjs";

async function setup() {
  const h = await deliveryHarness();
  await h.action(h.owner, { action: "prepare", kind: "Business website", extras: [] });
  for (const t of [...h.record.tasks]) {
    await h.action(t.assignee === "client" ? h.client : h.owner, {
      action: "submit-task",
      task: t.id,
      notes: "Verified onboarding material",
      url: "",
    });
    if (t.assignee === "client")
      await h.action(h.owner, {
        action: "review-task",
        task: t.id,
        decision: "accept",
        feedback: "",
      });
  }
  await h.action(h.owner, { action: "schedule", date: h.domain.today() });
  await h.action(h.owner, { action: "start" });
  assert.equal(
    (await h.action(h.owner, { action: "designate-approver", approver: h.client.id })).status,
    200,
  );
  assert.equal(
    (
      await h.action(h.owner, {
        action: "create-milestone",
        title: "Dashboard design",
        criteria: "Approved navigation and reporting screens.",
        due: "",
      })
    ).status,
    200,
  );
  const routes = await h.api("app/api/portal/delivery/artifact/route.ts");
  h.upload = async (
    actor,
    values = {},
    file = { name: "dashboard.txt", type: "text/plain", content: "Dashboard design V1" },
  ) => {
    h.setUser(actor);
    const input = {
      client: h.client.id,
      project: h.project.id,
      action: "publish-version",
      milestone: h.record.milestones[0].id,
      revision: h.record.revision,
      operation: randomUUID(),
      summary: "Review the agreed dashboard.",
      scopeConfirmed: true,
      ...values,
    };
    const form = new FormData();
    form.set("input", JSON.stringify(input));
    form.set("file", new File([file.content], file.name, { type: file.type }));
    const response = await routes.POST(
      new Request("http://localhost:3218/api/portal/delivery/artifact", {
        method: "POST",
        headers: { origin: "http://localhost:3218", cookie: h.cookie },
        body: form,
      }),
    );
    return { status: response.status, data: await response.json(), input };
  };
  h.download = async (
    actor,
    version = h.record.milestones[0].versions.at(-1)?.id,
    overrides = {},
  ) => {
    h.setUser(actor);
    return routes.GET(
      new Request(
        "http://localhost:3218/api/portal/delivery/artifact?" +
          new URLSearchParams({
            client: h.client.id,
            project: h.project.id,
            version,
            ...overrides,
          }),
      ),
    );
  };
  h.review = (actor, values = {}) =>
    h.action(actor, {
      action: "review-version",
      milestone: h.record.milestones[0].id,
      version: h.record.milestones[0].versions.at(-1)?.id,
      decision: "approve",
      confirmed: true,
      feedback: "",
      ...values,
    });
  return h;
}
test("private publication binds immutable bytes, scope, owner and hash; client approval records exact evidence", async () => {
  const h = await setup();
  assert.equal((await h.upload(h.owner)).status, 200);
  const v = h.record.milestones[0].versions[0];
  assert.equal(v.source.fingerprint, h.record.source.fingerprint);
  assert.equal(v.publisher, h.owner.id);
  const file = await h.download(h.client);
  assert.equal(file.status, 200);
  assert.equal(await file.text(), "Dashboard design V1");
  assert.equal(file.headers.get("x-checksum-sha256"), v.artifact.sha256);
  assert.match(file.headers.get("content-disposition"), /^attachment;/);
  assert.equal(file.headers.get("content-type"), "application/octet-stream");
  assert.equal((await h.review(h.client)).status, 200);
  const approved = h.record.milestones[0].versions[0].review;
  assert.equal(approved.version, v.id);
  assert.equal(approved.sha256, v.artifact.sha256);
  assert.equal(approved.actor, h.client.id);
  assert.equal(approved.role, "designated_client_approver");
  assert.equal(h.state.outbox.filter((e) => e.type === "review-version").length, 1);
});
test("publishing V2 invalidates an open V1 review without replacing old bytes", async () => {
  const h = await setup();
  await h.upload(h.owner);
  const v1 = h.record.milestones[0].versions[0];
  await h.upload(h.owner, {}, { name: "v2.txt", type: "text/plain", content: "Version 2" });
  assert.equal((await h.review(h.client, { version: v1.id })).status, 409);
  assert.equal(await (await h.download(h.client, v1.id)).text(), "Dashboard design V1");
  assert.equal(h.record.milestones[0].versions.length, 2);
});
test("owner, foreign client, and revoked approver cannot sign off; membership IDs supplied by caller have no authority", async () => {
  const h = await setup();
  await h.upload(h.owner);
  assert.equal((await h.review(h.owner)).status, 403);
  assert.equal((await h.review(h.other)).status, 404);
  assert.equal(
    (await h.action(h.client, { action: "designate-approver", approver: h.client.id })).status,
    403,
  );
  assert.equal(
    (await h.action(h.owner, { action: "designate-approver", approver: h.other.id })).status,
    400,
  );
  await h.action(h.owner, { action: "designate-approver", approver: "" });
  assert.equal((await h.review(h.client, { role: "owner", approver: h.client.id })).status, 403);
});
test("download checks current session and project tenant, not a guessed artifact/version key", async () => {
  const h = await setup();
  await h.upload(h.owner);
  assert.equal((await h.download(null)).status, 401);
  assert.equal((await h.download(h.other)).status, 404);
  assert.equal((await h.download(h.client, randomUUID())).status, 404);
  assert.equal((await h.download(h.client, undefined, { project: h.otherProject.id })).status, 404);
  const view = (await h.view(h.client)).data;
  assert(!JSON.stringify(view).includes("test-namespace/"));
  assert(!JSON.stringify(view).includes("never-return"));
});
test("uploads reject client actors, forged content, executable files, excessive size and JSON-only publication", async () => {
  const h = await setup();
  assert.equal((await h.upload(h.client)).status, 403);
  for (const file of [
    { name: "image.png", type: "image/png", content: "pretend png" },
    { name: "page.svg", type: "image/svg+xml", content: "<svg/>" },
    { name: "bad.pdf", type: "application/pdf", content: "%PDF-1.4 /JavaScript action" },
    { name: "html.txt", type: "text/plain", content: "<script>alert(1)</script>" },
    { name: "large.txt", type: "text/plain", content: "a".repeat(3 * 1024 * 1024 + 1) },
  ])
    assert.notEqual((await h.upload(h.owner, {}, file)).status, 200);
  assert.equal(h.blobs.size, 0);
  assert.equal(
    (
      await h.action(h.owner, {
        action: "publish-version",
        milestone: h.record.milestones[0].id,
        artifact: { sha256: "forged" },
      })
    ).status,
    400,
  );
});
test("duplicate publication and lost-response retry keep one version and immutable object", async () => {
  const h = await setup();
  h.loseNextResponse();
  const first = await h.upload(h.owner);
  assert.equal(first.status, 503);
  assert.equal((await h.upload(h.owner, first.input)).status, 200);
  assert.equal(h.record.milestones[0].versions.length, 1);
  assert.equal(h.blobs.size, 1);
  assert.equal(
    (
      await h.upload(h.owner, first.input, {
        name: "dashboard.txt",
        type: "text/plain",
        content: "Changed bytes",
      })
    ).status,
    409,
  );
  assert.equal(h.blobs.size, 1);
});
test("duplicate decision creates one revision and one outbox event; conflicting retry rejected", async () => {
  const h = await setup();
  await h.upload(h.owner);
  const result = await h.review(h.client, {
    decision: "request_changes",
    feedback: "Add a reports filter",
  });
  assert.equal(result.status, 200);
  assert.equal((await h.action(h.client, result.body)).status, 200);
  assert.equal(h.record.milestones[0].revisions.length, 1);
  assert.equal(h.state.outbox.filter((e) => e.type === "review-version").length, 1);
  assert.equal((await h.action(h.client, { ...result.body, decision: "approve" })).status, 409);
  assert.equal((await h.review(h.client)).status, 409);
});
test("revision must be scoped before republishing; additional scope creates a private draft and no billing authority", async () => {
  const h = await setup();
  await h.upload(h.owner);
  await h.review(h.client, { decision: "request_changes", feedback: "Add payments processing" });
  assert.equal((await h.upload(h.owner)).status, 409);
  const m = h.record.milestones[0],
    r = m.revisions[0];
  assert.equal(
    (
      await h.action(h.client, {
        action: "triage-revision",
        milestone: m.id,
        task: r.id,
        decision: "included",
        reason: "Free",
      })
    ).status,
    403,
  );
  await h.action(h.owner, {
    action: "triage-revision",
    milestone: m.id,
    task: r.id,
    decision: "change_order_required",
    reason: "A new payment module is outside this signed scope.",
  });
  assert.equal(
    h.record.milestones[0].revisions[0].changeDraft.status,
    "commercial_approval_required",
  );
  assert.equal((await h.upload(h.owner, { amendmentConfirmed: true })).status, 409);
  assert(!JSON.stringify((await h.view(h.client)).data).includes("changeDraft"));
  assert.equal(h.storage.get("clients/" + h.client.id).projects[0].payments.length, 0);
});
test("included revision produces a linked next version and preserves original feedback", async () => {
  const h = await setup();
  await h.upload(h.owner);
  await h.review(h.client, { decision: "request_changes", feedback: "Fix agreed heading" });
  const m = h.record.milestones[0],
    r = m.revisions[0];
  await h.action(h.owner, {
    action: "triage-revision",
    milestone: m.id,
    task: r.id,
    decision: "included",
    reason: "Heading is in the approved design.",
  });
  assert.equal((await h.upload(h.owner)).status, 200);
  const updated = h.record.milestones[0];
  assert.equal(updated.revisions[0].addressedBy, updated.versions[1].id);
  assert.equal(updated.versions[0].review.feedback, "Fix agreed heading");
});
test("changed signed scope invalidates old deliverable review even after onboarding reapproval", async () => {
  const h = await setup();
  await h.upload(h.owner);
  h.sources.get(h.client.id).workspace.proposals[0].accepted.hash = "scope-v2";
  assert.equal((await h.review(h.client)).status, 409);
  const commercial = h.commercial.commercialProject(
    h.sources.get(h.client.id),
    h.client.id,
    h.project.id,
  );
  const state = h.storage.get("delivery/clients/" + h.client.id);
  state.projects[0].source.fingerprint = commercial.fingerprint;
  assert.equal((await h.review(h.client)).status, 409);
});
test("revoked commercial readiness blocks publication and signoff while historical downloads remain available", async () => {
  const h = await setup();
  await h.upload(h.owner);
  h.sources.get(h.client.id).gates["engagement-" + h.project.id].ready = false;
  assert.equal((await h.review(h.client)).status, 409);
  assert.equal((await h.upload(h.owner)).status, 409);
  assert.equal((await h.download(h.client)).status, 200);
  const status = (await h.view(h.client)).data.projects[0].status;
  assert.equal(status.stage, "Commercial review");
  assert.equal(status.deliveryStage, "In progress");
  assert.equal(
    (await h.action(h.owner, { action: "designate-approver", approver: "" })).status,
    200,
  );
});
test("corrupt stored bytes fail integrity checks and do not return a file", async () => {
  const h = await setup();
  await h.upload(h.owner);
  const v = h.record.milestones[0].versions[0];
  h.blobs.set(v.artifact.key, Buffer.from("tampered"));
  const response = await h.download(h.client);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /integrity/i);
});
test("pending reviews coexist with in-progress delivery and completed milestones cannot be overwritten", async () => {
  const h = await setup();
  await h.upload(h.owner);
  let item = (await h.view(h.client)).data.projects[0];
  assert.equal(item.status.stage, "In progress");
  assert.equal(item.status.action.responsible, "client");
  assert.equal(item.status.action.milestone, h.record.milestones[0].id);
  await h.review(h.client);
  assert.equal((await h.upload(h.owner)).status, 409);
  assert.equal(h.record.milestones[0].versions.length, 1);
});

test("scope expansion can continue only after verified amended scope, renewed onboarding/start and explicit owner confirmation", async () => {
  const h = await setup();
  await h.upload(h.owner);
  await h.review(h.client, {
    decision: "request_changes",
    feedback: "Add the agreed additional module after a separate amendment.",
  });
  const m = h.record.milestones[0],
    task = m.revisions[0];
  await h.action(h.owner, {
    action: "triage-revision",
    milestone: m.id,
    task: task.id,
    decision: "change_order_required",
    reason: "A separate commercial amendment is required.",
  });
  const source = h.sources.get(h.client.id);
  source.workspace.proposals[0].revision = 2;
  source.workspace.proposals[0].accepted.hash = "amended-proposal-v2";
  const agreement = source.workspace.agreements[0];
  agreement.versions.push({ id: "v2" });
  agreement.signingVersion = "v2";
  agreement.completion.version = "v2";
  assert.equal((await h.action(h.owner, { action: "adopt-scope", confirmed: true })).status, 200);
  assert.equal(h.record.started, undefined);
  assert.equal((await h.upload(h.owner, { amendmentConfirmed: true })).status, 409);
  for (const task of [...h.record.tasks])
    assert.equal(
      (
        await h.action(h.owner, {
          action: "review-task",
          task: task.id,
          decision: "accept",
          feedback: "Reverified for the amended scope.",
        })
      ).status,
      200,
    );
  await h.action(h.owner, { action: "schedule", date: h.domain.today() });
  await h.action(h.owner, { action: "start" });
  assert.equal((await h.upload(h.owner)).status, 409);
  assert.equal((await h.upload(h.owner, { amendmentConfirmed: true })).status, 200);
  assert.equal(h.record.milestones[0].versions[1].source.revision, 2);
  assert.equal(h.record.milestones[0].versions[0].review.decision, "request_changes");
});

test("concurrent client signoff and owner replacement cannot both commit against one revision", async () => {
  const h = await setup();
  await h.upload(h.owner);
  const revision = h.record.revision;
  const results = await Promise.all([
    h.review(h.client, { revision }),
    h.upload(h.owner, { revision }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const versions = h.record.milestones[0].versions;
  assert(versions.length === 1 ? versions[0].review?.decision === "approve" : !versions[0].review);
});
