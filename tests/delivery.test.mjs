import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { deliveryHarness } from "./helpers/delivery-harness.mjs";

async function prepared() {
  const h = await deliveryHarness();
  assert.equal(
    (
      await h.action(h.owner, {
        action: "prepare",
        kind: "Business website",
        extras: ["Confirm the approved booking policy"],
      })
    ).status,
    200,
  );
  return h;
}
async function complete(h) {
  for (const t of [...h.record.tasks]) {
    const actor = t.assignee === "owner" ? h.owner : h.client;
    assert.equal(
      (
        await h.action(actor, {
          action: "submit-task",
          task: t.id,
          notes: "Reviewed project information.",
          url: "",
        })
      ).status,
      200,
    );
    if (actor === h.client)
      assert.equal(
        (
          await h.action(h.owner, {
            action: "review-task",
            task: t.id,
            decision: "accept",
            feedback: "Confirmed.",
          })
        ).status,
        200,
      );
  }
}
test("onboarding opens once after verified commercial readiness and reuses existing identities", async () => {
  const h = await prepared();
  assert.equal(h.record.tasks.length, 7);
  const ids = h.record.tasks.map((t) => t.id),
    revision = h.record.revision;
  await Promise.all(Array.from({ length: 5 }, () => h.action(h.owner, { action: "refresh" })));
  assert.deepEqual(
    h.record.tasks.map((t) => t.id),
    ids,
  );
  assert.equal(h.record.revision, revision);
  assert.equal(h.state.events.filter((e) => e.action === "Onboarding checklist opened").length, 1);
  assert.equal(h.record.project, h.project.id);
  assert.equal(h.record.source.sandbox, true);
  assert.equal(h.storage.get("clients/" + h.client.id).projects.length, 1);
  assert.equal(h.storage.get("clients/" + h.client.id).projects[0].payments.length, 0);
});
test("missing commercial source, false payment readiness, incomplete signatures and ambiguous mappings fail closed", async () => {
  for (const change of [
    (h) => h.setSourceStatus(503),
    (h, source) => {
      source.gates[Object.keys(source.gates)[0]].ready = false;
    },
    (h, source) => {
      source.workspace.agreements[0].completion.certificate = "";
    },
    (h, source) => {
      source.workspace.engagements.push({ ...source.workspace.engagements[0], id: "second" });
    },
    (h, source) => {
      source.workspace.client.id = h.other.id;
    },
    (h, source) => {
      source.workspace.proposals[0].status = "draft";
    },
    (h, source) => {
      source.workspace.proposals[0].accepted.actor = h.other.id;
    },
    (h, source) => {
      source.gates[Object.keys(source.gates)[0]].paymentDefined = false;
    },
    (h, source) => {
      source.workspace.agreements[0].completion.environment = "production";
    },
    (h, source) => {
      source.workspace.agreements[0].signingVersion = "outdated-version";
    },
  ]) {
    const h = await deliveryHarness(),
      source = h.sources.get(h.client.id);
    change(h, source);
    assert.equal(
      (
        await h.action(h.owner, {
          action: "prepare",
          kind: "Business website",
          extras: [],
          ready: true,
          signed: true,
          paid: true,
        })
      ).status,
      200,
    );
    assert.equal(h.record.tasks.length, 0);
    assert.equal(h.record.source, undefined);
    assert.equal((await h.action(h.owner, { action: "start", ready: true })).status, 409);
  }
});
test("late provider readiness initializes a previously prepared checklist on authenticated refresh", async () => {
  const h = await deliveryHarness();
  h.setSourceStatus(404);
  await h.action(h.owner, { action: "prepare", kind: "Mobile application", extras: [] });
  assert.equal(h.record.tasks.length, 0);
  h.setSourceStatus(200);
  assert.equal((await h.action(h.client, { action: "refresh" })).status, 200);
  assert(h.record.tasks.some((t) => t.key === "developer"));
  assert.equal(h.state.events.filter((e) => e.action === "Onboarding checklist opened").length, 1);
});
test("client drafts persist, submissions need owner review, and returned work can be resubmitted", async () => {
  const h = await prepared(),
    task = h.record.tasks[0];
  assert.equal(
    (
      await h.action(h.client, {
        action: "save-task",
        task: task.id,
        notes: "My draft contact",
        url: "",
      })
    ).status,
    200,
  );
  assert.equal(
    (await h.view(h.client)).data.projects[0].delivery.tasks[0].notes,
    "My draft contact",
  );
  assert.equal(
    (
      await h.action(h.client, {
        action: "submit-task",
        task: task.id,
        notes: "Alex is our project contact.",
        url: "https://example.com/approved",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await h.action(h.client, {
        action: "review-task",
        task: task.id,
        decision: "accept",
        feedback: "",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await h.action(h.owner, {
        action: "review-task",
        task: task.id,
        decision: "return",
        feedback: "",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await h.action(h.owner, {
        action: "review-task",
        task: task.id,
        decision: "return",
        feedback: "Please confirm who can approve the design.",
      })
    ).status,
    200,
  );
  assert.equal(h.record.tasks[0].status, "changes requested");
  assert.equal(
    (
      await h.action(h.client, {
        action: "submit-task",
        task: task.id,
        notes: "Alex will approve the design.",
        url: "",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await h.action(h.owner, {
        action: "review-task",
        task: task.id,
        decision: "accept",
        feedback: "",
      })
    ).status,
    200,
  );
  assert.equal(h.record.tasks[0].review.actor, h.owner.id);
  assert.equal(h.record.tasks[0].submitted.actor, h.client.id);
});
test("client sees a remaining client task while the owner sees a submitted item awaiting review", async () => {
  const h = await prepared(),
    task = h.record.tasks[0];
  await h.action(h.client, {
    action: "submit-task",
    task: task.id,
    notes: "Our contact details.",
    url: "",
  });
  const clientView = (await h.view(h.client)).data.projects[0],
    ownerView = (await h.view(h.owner)).data.projects.find((p) => p.project.id === h.project.id);
  assert.equal(clientView.status.action.responsible, "client");
  assert.notEqual(clientView.status.action.task, task.id);
  assert.equal(ownerView.status.action.responsible, "owner");
  assert.equal(ownerView.status.action.task, task.id);
});
test("tenant and role boundaries apply to every view and mutation", async () => {
  const h = await prepared();
  assert.equal((await h.view(null)).status, 401);
  assert.equal((await h.view({ ...h.owner, email: "forged@example.com" })).status, 403);
  const view = await h.view(h.client);
  assert.equal(view.status, 200);
  assert.equal(view.data.projects.length, 1);
  assert(!JSON.stringify(view.data).includes(h.otherProject.id));
  assert(!JSON.stringify(view.data).includes("never-return"));
  assert.equal((await h.action(h.other, { action: "refresh" })).status, 404);
  assert.equal(
    (await h.action(h.client, { action: "prepare", kind: "Business website", extras: [] })).status,
    403,
  );
  assert.equal(
    (await h.action(h.client, { action: "schedule", date: h.domain.today() })).status,
    403,
  );
  const ownerTask = h.record.tasks.find((t) => t.assignee === "owner");
  assert.equal(
    (
      await h.action(h.client, {
        action: "submit-task",
        task: ownerTask.id,
        notes: "Attempted owner verification",
        url: "",
      })
    ).status,
    403,
  );
});
test("wrong origin, oversized input, secrets and unsafe links never reach saved onboarding notes", async () => {
  const h = await prepared(),
    task = h.record.tasks[0];
  h.setUser(h.client);
  assert.equal((await h.routes.POST(h.request({}, "https://attacker.invalid"))).status, 403);
  assert.equal((await h.routes.POST(h.request({ notes: "x".repeat(13000) }))).status, 413);
  for (const input of [
    { notes: "password: supersecret123", url: "" },
    { notes: "sk-proj-" + "a".repeat(30), url: "" },
    { notes: "Reference", url: "javascript:alert(1)" },
    { notes: "Reference", url: "https://user:password@example.com" },
    { notes: "Reference", url: "https://example.com?api_key=secret1234" },
  ])
    assert.equal(
      (await h.action(h.client, { action: "save-task", task: task.id, ...input })).status,
      400,
    );
  assert.equal(h.record.tasks[0].notes, "");
});
test("replayed writes and lost committed responses preserve one audit event; changed operation payloads conflict", async () => {
  const h = await prepared(),
    task = h.record.tasks[0],
    operation = crypto.randomUUID(),
    revision = h.record.revision;
  const input = {
    action: "submit-task",
    task: task.id,
    notes: "Complete contact details.",
    url: "",
    operation,
    revision,
  };
  h.loseNextResponse();
  assert.equal((await h.action(h.client, input)).status, 503);
  assert.equal((await h.action(h.client, input)).status, 200);
  assert.equal(h.state.events.filter((e) => e.action === "Onboarding item submitted").length, 1);
  assert.equal((await h.action(h.client, { ...input, notes: "Changed" })).status, 409);
  assert.equal(
    (await h.action(h.client, { ...input, operation: crypto.randomUUID() })).status,
    409,
  );
});
test("required owner review and approved start date gate development; refunds pause further progression", async () => {
  const h = await prepared();
  assert.equal(
    (await h.action(h.owner, { action: "schedule", date: h.domain.today() })).status,
    409,
  );
  await complete(h);
  assert.equal((await h.view(h.client)).data.projects[0].status.stage, "Ready to schedule");
  assert.equal((await h.action(h.owner, { action: "start" })).status, 409);
  assert.equal((await h.action(h.owner, { action: "schedule", date: "2099-02-30" })).status, 400);
  assert.equal((await h.action(h.owner, { action: "schedule", date: "2099-12-31" })).status, 200);
  assert.equal((await h.action(h.owner, { action: "start" })).status, 409);
  assert.equal(
    (await h.action(h.owner, { action: "schedule", date: h.domain.today() })).status,
    200,
  );
  const gate = Object.values(h.sources.get(h.client.id).gates)[0];
  gate.ready = false;
  gate.reasons = ["Provider-confirmed initial payment"];
  assert.equal((await h.action(h.owner, { action: "start" })).status, 409);
  gate.ready = true;
  gate.reasons = [];
  assert.equal((await h.action(h.owner, { action: "start" })).status, 200);
  assert.equal((await h.view(h.client)).data.projects[0].status.stage, "In progress");
  gate.ready = false;
  assert.equal((await h.view(h.client)).data.projects[0].status.stage, "Commercial review");
});
test("a changed signed scope preserves answers, invalidates schedule and requires fresh owner review", async () => {
  const h = await prepared();
  await complete(h);
  await h.action(h.owner, { action: "schedule", date: h.domain.today() });
  const source = h.sources.get(h.client.id);
  source.workspace.proposals[0].revision++;
  source.workspace.proposals[0].accepted.hash = "accepted-scope-v2";
  assert.equal((await h.view(h.client)).data.projects[0].status.stage, "Scope review");
  assert.equal((await h.action(h.owner, { action: "start" })).status, 409);
  assert.equal((await h.action(h.client, { action: "adopt-scope", confirmed: true })).status, 403);
  assert.equal((await h.action(h.owner, { action: "adopt-scope", confirmed: true })).status, 200);
  assert.equal(h.record.schedule, undefined);
  assert(h.record.tasks.every((t) => t.status !== "accepted"));
  assert(h.record.tasks.every((t) => t.notes === "Reviewed project information."));
});
test("commercial adapter forwards only the session to a fixed origin and rejects unavailable transport", async () => {
  const h = await prepared();
  assert(
    h.calls.every((c) => c.url.startsWith("http://localhost:3218/api/portal/business?client=")),
  );
  assert(h.calls.every((c) => c.options.headers.cookie === "kjl-session=" + "a".repeat(43)));
  assert(h.calls.every((c) => c.options.redirect === "error" && c.options.cache === "no-store"));
  assert.equal(await h.commercial.readCommercial(h.client.id, "other-cookie=value"), null);
  h.setSourceStatus(503);
  assert.equal(await h.commercial.readCommercial(h.client.id, h.cookie), null);
});
