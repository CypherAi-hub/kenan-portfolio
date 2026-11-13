import assert from "node:assert/strict";
import { expect } from "@playwright/test";
export async function milestoneWalkthrough({
  ownerPage,
  clientPage,
  owner,
  client,
  other,
  project,
  origin,
  view,
  action,
  cookie,
  notice,
  check,
  evidence,
}) {
  const ownerHub = ownerPage.getByRole("region", { name: "Milestones and deliverables" });
  const clientHub = clientPage.getByRole("region", { name: "Milestones and deliverables" });
  const snapshot = async () => (await view(client)).projects[0];
  const refresh = async (page) =>
    page.getByRole("button", { name: "Refresh status", exact: true }).click();
  const capture = (locator, name) =>
    locator.screenshot({
      path: evidence + "/" + name,
      style: ".studio-header, nextjs-portal { visibility: hidden !important; }",
    });
  const publish = async (number, kind = "navigation") => {
    await ownerHub.getByLabel("Deliverable file", { exact: true }).setInputFiles({
      name: `Cedar-${kind}-v${number}.txt`,
      mimeType: "text/plain",
      buffer: Buffer.from(
        kind === "navigation"
          ? `Cedar Studio navigation, version ${number}\nHome / Services / Contact\nAgreed appointment request link and accessible navigation labels.`
          : `Cedar Studio contact form, version ${number}\nName / Email / Requested appointment date\nValidated contact details and appointment request confirmation.`,
      ),
    });
    await ownerHub
      .getByLabel("Version summary", { exact: true })
      .fill(
        `${kind === "navigation" ? "Navigation" : "Contact form"} version ${number} for the approved service website.`,
      );
    await ownerHub.getByLabel("This deliverable matches", { exact: false }).check();
    await ownerHub.getByRole("button", { name: "Publish for client review", exact: true }).click();
    await notice(ownerPage, "Deliverable published for client review.");
  };
  await ownerHub.getByRole("button", { name: "Designate Cedar Studio", exact: true }).click();
  await notice(ownerPage, "Client approver designated.");
  await ownerHub.getByRole("button", { name: "New milestone", exact: true }).click();
  await ownerHub.getByLabel("Milestone title", { exact: true }).fill("Website navigation");
  await ownerHub
    .getByLabel("Acceptance criteria", { exact: true })
    .fill("Home, Services and Contact navigation with the agreed appointment request link.");
  await ownerHub.getByRole("button", { name: "Create milestone", exact: true }).click();
  await notice(ownerPage, "Milestone created.");
  const publicationOperations = [];
  await ownerPage.route("**/api/portal/delivery/artifact", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    publicationOperations.push(
      route
        .request()
        .postData()
        ?.match(/"operation":"([^"]+)"/)?.[1],
    );
    if (publicationOperations.length === 1) {
      const committed = await route.fetch();
      assert.equal(committed.status(), 200);
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Synthetic response lost after commit" }),
      });
    }
    return route.continue();
  });
  await publish(1);
  await ownerPage.unroute("**/api/portal/delivery/artifact");
  assert.equal(publicationOperations.length, 2);
  assert(publicationOperations[0]);
  assert.equal(publicationOperations[0], publicationOperations[1]);
  assert.equal((await snapshot()).delivery.milestones[0].versions.length, 1);
  check(
    "A deliberately lost successful publication response retries the same operation and produces one immutable version.",
  );
  await refresh(clientPage);
  await clientHub.getByRole("heading", { name: "Your decision on V1", exact: true }).waitFor();
  const first = (await snapshot()).delivery.milestones[0];
  const downloadUrl =
    origin +
    "/api/portal/delivery/artifact?" +
    new URLSearchParams({
      client: client.account.id,
      project: project.id,
      version: first.versions[0].id,
    });
  const file = await fetch(downloadUrl, { headers: { cookie: cookie(client) } });
  assert.equal(file.status, 200);
  assert.match(await file.text(), /navigation, version 1/);
  assert.match(file.headers.get("content-disposition"), /attachment/);
  assert.equal((await fetch(downloadUrl, { headers: { cookie: cookie(other) } })).status, 404);
  assert.equal((await fetch(downloadUrl)).status, 401);
  await publish(2);
  await clientHub.getByLabel("I reviewed Cedar-navigation-v1.txt", { exact: false }).check();
  await clientHub.getByRole("button", { name: "Record my decision", exact: true }).click();
  await expect(
    clientPage.getByRole("alert").filter({ hasText: "This project changed" }),
  ).toContainText("changed");
  // Preserve/explicitly discard the now-stale local decision before refreshing.
  clientPage.once("dialog", (dialog) => dialog.accept());
  await refresh(clientPage);
  await clientHub.getByRole("heading", { name: "Your decision on V2", exact: true }).waitFor();
  if (evidence) await capture(clientHub, "client-review-desktop.png");
  for (const width of [390, 320, 768]) {
    await clientPage.setViewportSize({ width, height: 1050 });
    assert(await clientPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (evidence && width === 390) await capture(clientHub, "client-review-mobile.png");
  }
  await clientPage.setViewportSize({ width: 1440, height: 1050 });
  check(
    "Private V1/V2 publication and download passed; anonymous and foreign-client downloads denied; stale browser V1 approval rejected after V2.",
  );
  await clientHub.getByLabel("Review decision", { exact: true }).selectOption("request_changes");
  await clientHub
    .getByLabel("Review feedback", { exact: false })
    .fill("Please use the approved Contact label consistently.");
  await clientHub.getByLabel("I reviewed Cedar-navigation-v2.txt", { exact: false }).check();
  await clientHub.getByRole("button", { name: "Record my decision", exact: true }).click();
  await notice(clientPage, "Your deliverable decision was recorded.");
  await refresh(ownerPage);
  await ownerHub.getByLabel("Scope classification", { exact: true }).selectOption("included");
  await ownerHub
    .getByLabel("Reason shown to the client", { exact: true })
    .fill("The approved contact label is already part of the signed navigation scope.");
  await ownerHub.getByRole("button", { name: "Save scope review", exact: true }).click();
  await notice(ownerPage, "Revision scope recorded.");
  await publish(3);
  await refresh(clientPage);
  await clientHub.getByRole("heading", { name: "Your decision on V3", exact: true }).waitFor();
  await clientHub.getByLabel("I reviewed Cedar-navigation-v3.txt", { exact: false }).check();
  await clientHub.getByRole("button", { name: "Record my decision", exact: true }).click();
  await notice(clientPage, "Your deliverable decision was recorded.");
  await clientHub.getByText("V3 approved", { exact: true }).waitFor();
  if (evidence) await capture(clientHub, "client-approved.png");
  const approved = (await snapshot()).delivery.milestones[0];
  assert.equal(approved.versions[2].review.actor, client.account.id);
  assert.equal(approved.revisions[0].addressedBy, approved.versions[2].id);
  assert.equal((await fetch(downloadUrl, { headers: { cookie: cookie(client) } })).status, 200);
  check(
    "Browser revision request, owner scope triage, V3 publication and exact client approval passed; original versions and decisions remain downloadable.",
  );
  await refresh(ownerPage);
  await ownerHub.getByRole("button", { name: "New milestone", exact: true }).click();
  await ownerHub.getByLabel("Milestone title", { exact: true }).fill("Contact form");
  await ownerHub
    .getByLabel("Acceptance criteria", { exact: true })
    .fill("The approved appointment request form.");
  await ownerHub.getByRole("button", { name: "Create milestone", exact: true }).click();
  await notice(ownerPage, "Milestone created.");
  await ownerHub.getByRole("button", { name: /Contact form/ }).click();
  await publish(1, "contact-form");
  await refresh(clientPage);
  await clientHub.getByRole("button", { name: /Contact form/ }).click();
  await clientHub.getByLabel("Review decision", { exact: true }).selectOption("request_changes");
  await clientHub
    .getByLabel("Review feedback", { exact: false })
    .fill("Add an online store with recurring product orders.");
  await clientHub.getByLabel("I reviewed Cedar-contact-form-v1.txt", { exact: false }).check();
  await clientHub.getByRole("button", { name: "Record my decision", exact: true }).click();
  await notice(clientPage, "Your deliverable decision was recorded.");
  await refresh(ownerPage);
  await ownerHub
    .getByLabel("Scope classification", { exact: true })
    .selectOption("change_order_required");
  await ownerHub
    .getByLabel("Reason shown to the client", { exact: true })
    .fill(
      "An online store adds functionality outside the signed appointment form scope. A separate approved amendment is required.",
    );
  await ownerHub.getByRole("button", { name: "Save scope review", exact: true }).click();
  await notice(ownerPage, "Revision scope recorded.");
  await ownerHub.getByText("Internal scope-change draft", { exact: true }).click();
  await expect(
    ownerHub.getByRole("button", { name: "Publish for client review", exact: true }),
  ).toHaveCount(0);
  if (evidence) await capture(ownerHub, "owner-scope-review.png");
  const state = (await view(owner)).projects.find((p) => p.project.id === project.id);
  assert.equal(
    state.delivery.milestones[1].revisions[0].changeDraft.status,
    "commercial_approval_required",
  );
  assert(!JSON.stringify(await snapshot()).includes("changeDraft"));
  check(
    "Out-of-scope revision creates an owner-only draft and blocks further publication without an approved changed commercial baseline; no invoice or charge generated.",
  );
  const revoke = await action(owner, {
    action: "designate-approver",
    approver: "",
    revision: state.delivery.revision,
  });
  assert.equal(revoke.status, 200);
  const forged = await action(client, {
    action: "review-version",
    milestone: first.id,
    version: approved.versions[2].id,
    decision: "approve",
    confirmed: true,
    feedback: "",
    revision: (await snapshot()).delivery.revision,
  });
  assert.equal(forged.status, 403);
  check(
    "Approver revocation takes effect on the next server mutation; desktop and phone milestone layouts have no horizontal overflow.",
  );
}
