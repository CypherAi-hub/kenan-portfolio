// Real private Blob + application authentication/UI; commercial evidence is synthetic.
// Creates a temporary development-only business API fixture, removed in finally.
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, unlink, rm } from "node:fs/promises";
import path from "node:path";
import { put, list, del } from "@vercel/blob";
import { chromium, expect } from "@playwright/test";
import { commercialFixture } from "./helpers/delivery-harness.mjs";

assert.equal(process.env.RUN_DELIVERY_LIVE, "1", "Explicitly enable isolated delivery QA.");
assert(process.env.BLOB_READ_WRITE_TOKEN, "Private test storage access is required.");
const repo = process.cwd(),
  origin = "http://localhost:3218",
  namespace = "kjl-qa-delivery-" + randomUUID();
const evidence = process.env.DELIVERY_EVIDENCE_DIR;
if (evidence) await mkdir(evidence, { recursive: true });
const scratch = path.resolve(repo, "..", "delivery-qa-" + randomUUID());
await mkdir(scratch);
const fixtureFile = path.join(scratch, "commercial.json");
const routePath = path.join(repo, "app/api/portal/business/route.ts");
let ownsRoute = false,
  browser,
  server;
const record = (role, name, email) => {
  const secret = randomBytes(32).toString("base64url");
  return {
    secret,
    account: {
      id: randomUUID(),
      role,
      name,
      email,
      sessions: [
        {
          hash: createHash("sha256").update(secret).digest("base64url"),
          expires: Date.now() + 3600000,
        },
      ],
      recentChallenges: [],
    },
  };
};
const owner = record("owner", "Kenan", "kenanlarry8@gmail.com"),
  client = record("client", "Cedar Studio", "cedar-qa@example.com"),
  other = record("client", "Other Client", "other-qa@example.com");
const project = {
  id: randomUUID(),
  title: "Cedar Studio website",
  brief:
    "A service website with an appointment request flow, approved content and a clear path for new customers.",
  phase: "Discovery",
  created: new Date().toISOString(),
  updates: [
    {
      id: randomUUID(),
      at: new Date().toISOString(),
      author: "Kenan",
      phase: "Discovery",
      body: "Your project plan is ready. We’ll gather the approved materials before confirming a start date.",
    },
  ],
  payments: [],
};
const otherProject = { ...project, id: randomUUID(), title: "Other client’s private project" };
const commercial = {
  [client.account.id]: commercialFixture(client.account.id, project.id),
  [other.account.id]: commercialFixture(other.account.id, otherProject.id),
};
const gate = commercial[client.account.id].gates["engagement-" + project.id];
gate.ready = false;
gate.reasons = ["Provider-confirmed initial payment"];
const checks = [],
  issues = [],
  consoleErrors = [];
const check = (message) => {
  checks.push(message);
  console.log(message);
};
const cookie = (actor) => "kjl-session=" + actor.secret;
async function view(actor) {
  const response = await fetch(origin + "/api/portal/delivery", {
    headers: { cookie: cookie(actor) },
  });
  assert.equal(response.status, 200);
  return response.json();
}
async function action(actor, input, requestOrigin = origin) {
  const response = await fetch(origin + "/api/portal/delivery", {
    method: "POST",
    headers: { cookie: cookie(actor), origin: requestOrigin, "content-type": "application/json" },
    body: JSON.stringify({
      client: client.account.id,
      project: project.id,
      operation: randomUUID(),
      ...input,
    }),
  });
  return { status: response.status, data: await response.json() };
}
async function contextFor(actor, width = 1440) {
  const context = await browser.newContext({
    viewport: { width, height: 1050 },
    reducedMotion: "reduce",
  });
  await context.addCookies([
    { name: "kjl-session", value: actor.secret, url: origin, httpOnly: true, sameSite: "Lax" },
  ]);
  const page = await context.newPage();
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  return { context, page };
}
async function notice(page, message) {
  await page.getByRole("status").filter({ hasText: message }).waitFor({ timeout: 45000 });
}
async function selectTask(page, title) {
  await page
    .getByRole("navigation", { name: "Onboarding items" })
    .getByRole("button", { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })
    .click();
}
try {
  await writeFile(fixtureFile, JSON.stringify(commercial));
  await mkdir(path.dirname(routePath), { recursive: true });
  await writeFile(
    routePath,
    `// DELIVERY_QA_ONLY: synthetic commercial records; never included in a production build.
import { readFile } from "node:fs/promises";
import { identity } from "@/lib/portal/auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" || !process.env.PORTAL_NAMESPACE?.startsWith("kjl-qa-delivery-") || !process.env.DELIVERY_QA_FIXTURE_FILE) return new Response(null, {status:404});
  const me = await identity();
  if (!me) return new Response(null, {status:401});
  const client = new URL(request.url).searchParams.get("client");
  if (!(me.role === "owner" && me.email === "kenanlarry8@gmail.com") && client !== me.id) return new Response(null, {status:403});
  const fixtures = JSON.parse(await readFile(process.env.DELIVERY_QA_FIXTURE_FILE, "utf8"));
  return Response.json(fixtures[client || ""] || {}, {headers:{"Cache-Control":"private, no-store"}});
}
`,
    { flag: "wx" },
  );
  ownsRoute = true;
  const options = { access: "private", addRandomSuffix: false, contentType: "application/json" };
  await put(
    namespace + "/accounts.json",
    JSON.stringify({ accounts: [owner.account, client.account, other.account] }),
    options,
  );
  await put(
    namespace + "/clients/" + client.account.id + ".json",
    JSON.stringify({ projects: [project] }),
    options,
  );
  await put(
    namespace + "/clients/" + other.account.id + ".json",
    JSON.stringify({ projects: [otherProject] }),
    options,
  );
  const env = {
    ...process.env,
    NODE_ENV: "development",
    PORTAL_ORIGIN: origin,
    PORTAL_NAMESPACE: namespace,
    PORTAL_SIGNING_KEY: randomBytes(40).toString("hex"),
    DELIVERY_QA_FIXTURE_FILE: fixtureFile,
    CARE_BILLING_ENABLED: "false",
  };
  for (const key of Object.keys(env))
    if (/STRIPE|DOCUSIGN|OPENAI|PROJECT_BRIDGE|BUSINESS_DATABASE|BUSINESS_LOCAL|VERCEL$/.test(key))
      delete env[key];
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "-p", "3218", "-H", "127.0.0.1"],
    { env, stdio: ["ignore", "ignore", "pipe"] },
  );
  server.stderr.on("data", () => {});
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(origin + "/portal/login")).ok) break;
    } catch {}
    if (attempt === 99) throw new Error("Delivery QA server did not start.");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.equal((await fetch(origin + "/api/portal/delivery")).status, 401);
  assert.equal(
    (
      await fetch(origin + "/studio/delivery", {
        redirect: "manual",
        headers: { cookie: cookie(client) },
      })
    ).status,
    307,
  );
  assert.equal((await action(other, { action: "refresh" })).status, 404);
  assert.equal(
    (await action(owner, { action: "refresh" }, "https://attacker.invalid")).status,
    403,
  );
  assert.equal((await view(client)).projects.length, 1);
  check(
    "Actual sessions/routes: anonymous, wrong-origin and cross-client access denied; client cannot open owner delivery page.",
  );
  browser = await chromium.launch({ headless: true });
  const { page: ownerPage } = await contextFor(owner);
  await ownerPage.goto(origin + "/studio/delivery");
  await ownerPage.getByLabel("Project type", { exact: true }).selectOption("Business website");
  await ownerPage
    .getByLabel("Additional agreed requirements", { exact: false })
    .fill("Confirm the approved booking policy");
  await ownerPage.getByRole("button", { name: "Prepare checklist", exact: true }).click();
  await notice(ownerPage, "Onboarding preparation saved.");
  let record = (await view(owner)).projects.find((p) => p.project.id === project.id);
  assert.equal(record.delivery.tasks.length, 0);
  assert.equal(record.status.stage, "Commercial review");
  check(
    "Owner preparation saves against the existing project; a missing verified payment keeps onboarding closed.",
  );
  gate.ready = true;
  gate.reasons = [];
  await writeFile(fixtureFile, JSON.stringify(commercial));
  const repeats = await Promise.all(
    Array.from({ length: 3 }, () => action(client, { action: "refresh" })),
  );
  assert(
    repeats.every((r) => r.status === 200),
    JSON.stringify(repeats),
  );
  record = (await view(client)).projects[0];
  assert.equal(record.delivery.tasks.length, 7);
  assert.equal(record.events.filter((e) => e.action === "Onboarding checklist opened").length, 1);
  check(
    "Real Blob concurrency: three refreshes after synthetic commercial readiness generate exactly one seven-item checklist.",
  );
  const { page: clientPage } = await contextFor(client);
  await clientPage.goto(origin + "/portal/delivery");
  await clientPage
    .getByLabel("Notes for this item", { exact: true })
    .fill("Alex will coordinate project decisions.");
  await clientPage.getByRole("button", { name: "Save draft", exact: true }).click();
  await notice(clientPage, "Draft saved.");
  await clientPage.reload();
  await expect(clientPage.getByLabel("Notes for this item", { exact: true })).toHaveValue(
    "Alex will coordinate project decisions.",
  );
  if (evidence)
    await clientPage.screenshot({ path: evidence + "/client-desktop.png", fullPage: true });
  for (const width of [390, 320, 768]) {
    await clientPage.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => clientPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    if (evidence && width === 390)
      await clientPage.screenshot({ path: evidence + "/client-mobile.png", fullPage: true });
  }
  await clientPage.setViewportSize({ width: 1440, height: 1050 });
  await clientPage.getByRole("button", { name: "Submit for review", exact: true }).click();
  await notice(clientPage, "Submitted for Kenan’s review.");
  await ownerPage.getByRole("button", { name: "Refresh status", exact: true }).click();
  await ownerPage
    .getByLabel("Review feedback", { exact: false })
    .fill("Please confirm who approves the final design.");
  await ownerPage.getByRole("button", { name: "Request changes", exact: true }).click();
  await notice(ownerPage, "Item returned with your feedback.");
  await clientPage.getByRole("button", { name: "Refresh status", exact: true }).click();
  await clientPage.getByText("Kenan’s feedback:", { exact: false }).waitFor();
  await clientPage
    .getByLabel("Notes for this item", { exact: true })
    .fill("Alex coordinates the project and approves the final design.");
  await clientPage.getByRole("button", { name: "Submit for review", exact: true }).click();
  await notice(clientPage, "Submitted for Kenan’s review.");
  for (const task of record.delivery.tasks.filter((t) => t.assignee === "client").slice(1)) {
    await selectTask(clientPage, task.title);
    await clientPage
      .getByLabel("Notes for this item", { exact: true })
      .fill("Approved synthetic onboarding information for " + task.title + ".");
    await clientPage.getByRole("button", { name: "Submit for review", exact: true }).click();
    await notice(clientPage, "Submitted for Kenan’s review.");
  }
  check(
    "Client browser: draft survives reload; feedback, resubmission and all client submissions work at desktop and phone widths.",
  );
  await ownerPage.getByRole("button", { name: "Refresh status", exact: true }).click();
  await ownerPage.getByLabel("Review feedback", { exact: false }).waitFor();
  if (evidence)
    await ownerPage.screenshot({ path: evidence + "/owner-command-center.png", fullPage: true });
  for (const task of record.delivery.tasks.filter((t) => t.assignee === "client")) {
    await selectTask(ownerPage, task.title);
    await ownerPage.getByRole("button", { name: "Accept item", exact: true }).click();
    await notice(ownerPage, "Onboarding item accepted.");
  }
  await selectTask(ownerPage, record.delivery.tasks.find((t) => t.assignee === "owner").title);
  await ownerPage
    .getByLabel("Notes for this item", { exact: true })
    .fill("Shared materials and delegated access verified using synthetic test data.");
  await ownerPage.getByRole("button", { name: "Record verification", exact: true }).click();
  await notice(ownerPage, "Owner verification recorded.");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  await ownerPage.getByLabel("Approved start date", { exact: true }).fill(today);
  await ownerPage.getByRole("button", { name: "Approve start date", exact: true }).click();
  await notice(ownerPage, "Project start date approved.");
  await ownerPage.getByRole("button", { name: "Start development", exact: true }).click();
  await notice(ownerPage, "Development workflow started.");
  await clientPage.getByRole("button", { name: "Refresh status", exact: true }).click();
  await clientPage.getByRole("heading", { name: "Development is underway", exact: true }).waitFor();
  if (evidence)
    await clientPage.screenshot({ path: evidence + "/client-started.png", fullPage: true });
  assert.equal((await view(client)).projects[0].status.stage, "In progress");
  assert.equal(
    (await action(client, { action: "start", revision: record.delivery.revision })).status,
    409,
  );
  check(
    "Owner browser: required reviews and access verification complete; approved start date and explicit start produce the same client status.",
  );
  gate.ready = false;
  gate.reasons = ["Provider-confirmed initial payment"];
  await writeFile(fixtureFile, JSON.stringify(commercial));
  await clientPage.getByRole("button", { name: "Refresh status", exact: true }).click();
  await expect
    .poll(async () => (await view(client)).projects[0].status.stage)
    .toBe("Commercial review");
  assert.equal(
    (
      await action(owner, {
        action: "start",
        revision: (await view(client)).projects[0].delivery.revision,
      })
    ).status,
    409,
  );
  check(
    "Revoked synthetic commercial readiness blocks further progression and replaces the active-stage summary.",
  );
  assert.equal(consoleErrors.length, 0, consoleErrors.join("\n"));
  check(
    "No browser runtime errors; no Stripe, e-signature, OpenAI or outbound notification calls were configured.",
  );
} catch (error) {
  issues.push(error instanceof Error ? error.message : "Delivery QA failed.");
  process.exitCode = 1;
  if (browser && evidence)
    for (const [index, context] of browser.contexts().entries()) {
      const page = context.pages()[0];
      if (page)
        await page
          .screenshot({ path: evidence + `/failure-${index}.png`, fullPage: true })
          .catch(() => {});
    }
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill("SIGTERM");
    await new Promise((resolve) => {
      if (server.exitCode !== null) resolve();
      else {
        server.once("exit", resolve);
        setTimeout(resolve, 3000);
      }
    });
  }
  if (ownsRoute && (await readFile(routePath, "utf8")).includes("DELIVERY_QA_ONLY"))
    await unlink(routePath);
  await rm(scratch, { recursive: true, force: true });
  let cursor;
  do {
    const batch = await list({ prefix: namespace + "/", cursor });
    if (batch.blobs.length) await del(batch.blobs.map((blob) => blob.url));
    cursor = batch.hasMore ? batch.cursor : undefined;
  } while (cursor);
  check("All synthetic storage records and the temporary commercial API fixture were removed.");
  if (evidence)
    await writeFile(
      evidence + "/verification.json",
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          commercialEvidence: "Synthetic authenticated API fixture, not real provider verification",
          storage: "Real private Blob in isolated QA namespace",
          productionDeployed: false,
          checks,
          issues,
        },
        null,
        2,
      ),
    );
  for (const issue of issues) console.error(issue);
}
