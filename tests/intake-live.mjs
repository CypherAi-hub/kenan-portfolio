// Explicit opt-in provider/browser integration test. Uses only a fresh QA namespace.
// Run after npm run build with BLOB_READ_WRITE_TOKEN and optionally OPENAI_API_KEY.
// INTAKE_OPENAI_ENV_FILE may point to an existing authorized env file; no secrets are copied.
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { list, put, del } from "@vercel/blob";
import { chromium } from "@playwright/test";

assert.equal(
  process.env.RUN_INTAKE_LIVE,
  "1",
  "Explicitly enable live storage/provider verification.",
);
assert(process.env.BLOB_READ_WRITE_TOKEN, "Private test storage access is required.");
const origin = "http://localhost:3217",
  namespace = "kjl-qa-intake-" + randomUUID();
const evidence = process.env.INTAKE_EVIDENCE_DIR;
if (evidence) await mkdir(evidence, { recursive: true });
const ownerSecret = randomBytes(32).toString("base64url"),
  clientSecret = randomBytes(32).toString("base64url");
const account = (secret, role) => ({
  id: randomUUID(),
  name: "QA " + role,
  email: role === "owner" ? "kenanlarry8@gmail.com" : "qa-client@example.com",
  role,
  sessions: [
    {
      hash: createHash("sha256").update(secret).digest("base64url"),
      expires: Date.now() + 3600000,
    },
  ],
  recentChallenges: [],
});
let openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey && process.env.INTAKE_OPENAI_ENV_FILE)
  openaiKey = parseEnv(await readFile(process.env.INTAKE_OPENAI_ENV_FILE, "utf8")).OPENAI_API_KEY;
const env = {
  ...process.env,
  PORTAL_ORIGIN: origin,
  PORTAL_NAMESPACE: namespace,
  PORTAL_SIGNING_KEY: randomBytes(40).toString("hex"),
  OPENAI_API_KEY: openaiKey || "",
};
for (const key of [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PROJECT_BRIDGE_CONNECTIONS",
  "VERCEL",
])
  delete env[key];
let server, browser;
const checks = [],
  problems = [];
const record = (text) => {
  checks.push(text);
  console.log(text);
};
async function post(data, admin = false, secret = ownerSecret) {
  const response = await fetch(origin + (admin ? "/api/portal/inquiries" : "/api/inquiries"), {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      ...(admin ? { cookie: "kjl-session=" + secret } : {}),
    },
    body: JSON.stringify(data),
  });
  return { status: response.status, data: await response.json() };
}
async function getInquiry(id, secret = ownerSecret) {
  const response = await fetch(origin + "/api/portal/inquiries?id=" + id, {
    headers: { cookie: "kjl-session=" + secret },
  });
  return { status: response.status, data: await response.json() };
}
try {
  await put(
    namespace + "/accounts.json",
    JSON.stringify({ accounts: [account(ownerSecret, "owner"), account(clientSecret, "client")] }),
    { access: "private", addRandomSuffix: false, contentType: "application/json" },
  );
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3217", "-H", "127.0.0.1"],
    { env, stdio: ["ignore", "ignore", "pipe"] },
  );
  server.stderr.on("data", () => {
    /* Do not emit provider or process environment data. */
  });
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      if ((await fetch(origin + "/start-project")).ok) break;
    } catch {
      /* Wait for local server. */
    }
    if (attempt === 79) throw new Error("The local production server did not start.");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage(),
    consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.goto(origin + "/start-project");
  await page.getByRole("heading", { name: "The big picture" }).waitFor();
  if (evidence)
    await page.screenshot({ path: evidence + "/discovery-desktop.png", fullPage: true });
  await page.getByRole("radio", { name: "A new build", exact: true }).check();
  await page.getByRole("radio", { name: "Business website", exact: true }).check();
  await page.locator("#idea").fill("A clear website for our neighborhood repair business.");
  await page
    .locator("#success")
    .fill("Customers can find our services and request an appointment.");
  await page.getByRole("checkbox", { name: "Save my draft on this device" }).check();
  await page.reload();
  await page.getByRole("button", { name: "Resume draft", exact: true }).click();
  assert.equal(
    await page.locator("#idea").inputValue(),
    "A clear website for our neighborhood repair business.",
  );
  record("Browser: opt-in draft survives reload and restores answers.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: "Customers or the public", exact: true }).check();
  await page
    .locator("#journey")
    .fill("Find a service, read the details, and request an appointment.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: "Booking", exact: true }).check();
  await page.locator("#mustHave").fill("Service pages, contact details, and appointment requests.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await page.locator("#booking").count(), 1);
  assert.equal(await page.locator("#payments").count(), 0);
  await page.locator("#booking").fill("Weekday repair consultations; staff confirms availability.");
  record("Browser: project and feature selections reveal relevant questions only.");
  for (let n = 0; n < 3; n++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#name").fill("Browser QA inquiry");
  await page.locator("#email").fill("browser-qa@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Review my project" }).click();
  await page.getByRole("checkbox", { name: /I agree that KJL Designs/ }).check();
  await page.getByRole("button", { name: "Send project inquiry" }).click();
  await page.getByText("PROJECT RECEIVED", { exact: true }).waitFor({ timeout: 60000 });
  assert.equal(await page.evaluate(() => localStorage.getItem("kjl-project-discovery-v1")), null);
  record(
    "Browser → real private Blob: manual inquiry saved, receipt displayed, local draft removed.",
  );
  const browserId = await page.locator(".intake-receipt-note code").textContent();
  assert.equal((await getInquiry(browserId)).data.inquiry.answers.name, "Browser QA inquiry");
  assert.equal((await getInquiry(browserId, clientSecret)).status, 403);
  assert.equal(
    (await fetch(origin + "/api/portal/inquiries?id=" + browserId + "&download=1")).status,
    401,
  );
  record(
    "API: owner can read the inquiry; clients and unauthenticated visitors cannot read/export it.",
  );
  await context.addCookies([
    { name: "kjl-session", value: ownerSecret, url: origin, httpOnly: true, sameSite: "Lax" },
  ]);
  await page.goto(origin + "/studio/inquiries");
  await page.getByRole("button", { name: /Browser QA inquiry/ }).click();
  await page
    .locator("#working-brief")
    .fill(
      "# Reviewed QA brief\n\nBuild service pages and appointment requests. Confirm scheduling rules before development.",
    );
  await page.getByRole("button", { name: "Save & mark reviewed" }).click();
  await page.getByText("Your brief and review status are saved.").waitFor({ timeout: 30000 });
  const saved = (await getInquiry(browserId)).data.inquiry;
  assert.equal(saved.status, "Reviewed");
  assert.equal(saved.versions.at(-1).author, "Owner");
  assert.equal(
    (
      await post(
        { action: "save", id: browserId, revision: 1, status: "New", markdown: "Stale edit" },
        true,
      )
    ).status,
    409,
  );
  const download = await fetch(origin + "/api/portal/inquiries?id=" + browserId + "&download=1", {
    headers: { cookie: "kjl-session=" + ownerSecret },
  });
  assert.match(await download.text(), /Reviewed QA brief/);
  await page.evaluate(() => window.scrollTo(0, 0));
  if (evidence)
    await page.screenshot({ path: evidence + "/inquiry-inbox-desktop.png", fullPage: true });
  record(
    "Owner browser: edit, mark reviewed, versioned save, stale-write protection and Markdown export verified.",
  );
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const phone = await mobile.newPage();
  await phone.goto(origin + "/start-project");
  await phone.getByRole("radio", { name: "A new build", exact: true }).waitFor();
  assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (evidence)
    await phone.screenshot({ path: evidence + "/discovery-mobile.png", fullPage: true });
  record("Mobile browser: discovery loads at 390 px without horizontal overflow.");
  await phone.setViewportSize({ width: 320, height: 740 });
  const menuBox = await phone.getByRole("button", { name: "Open menu" }).boundingBox();
  assert(
    menuBox && menuBox.x >= 0 && menuBox.x + menuBox.width <= 320,
    "Mobile menu must fit at 320 px",
  );
  await phone.getByRole("button", { name: "Open menu" }).click();
  assert(await phone.getByRole("navigation", { name: "Mobile navigation" }).isVisible());
  record("Small mobile browser: navigation remains visible and usable at 320 px.");
  assert.equal(consoleErrors.length, 0, "Browser runtime errors: " + consoleErrors.join(", "));
  if (openaiKey) {
    const answers = {
      work: "A new build",
      kind: "Internal tool or dashboard",
      idea: "Facilities portal for a small team: people submit repair requests; technicians update progress.",
      success: "Reduce lost repair requests and show the current status.",
      audience: ["Employees"],
      journey: "Employee submits a request; supervisor assigns a technician; technician closes it.",
      mustHave: "Request submission, assignment and status updates.",
      name: "AI QA inquiry",
      email: "ai-qa@example.com",
      features: ["User accounts", "Notifications", "File uploads"],
      accounts: "Organization Microsoft sign-in, subject to IT approval.",
      notifications: "Email requester when a repair is closed.",
      uploads: "Optional photos of damaged equipment, visible to staff.",
      budget: "Not sure yet",
    };
    const followup = await post({ action: "clarify", answers, allowAI: true });
    assert.equal(
      followup.status,
      200,
      "Live follow-up generation: " + JSON.stringify(followup.data),
    );
    assert(followup.data.questions.length <= 5);
    const submission = {
      action: "submit",
      id: randomUUID(),
      answers,
      allowAI: true,
      consent: true,
      followupToken: followup.data.token,
      followupAnswers: Object.fromEntries(
        followup.data.questions.map((q) => [q.id, "Not sure yet; discuss during discovery."]),
      ),
    };
    const result = await post(submission);
    assert.equal(result.status, 200, JSON.stringify(result.data));
    assert.equal(result.data.briefStatus, "ready", "Live AI brief did not complete.");
    const inquiry = (await getInquiry(submission.id)).data.inquiry;
    assert.equal(inquiry.versions.length, 1);
    assert.match(inquiry.versions[0].markdown, /Client priorities/);
    const replay = await post(submission);
    assert.equal(replay.status, 200);
    assert.equal((await getInquiry(submission.id)).data.inquiry.versions.length, 1);
    if (evidence)
      await writeFile(
        evidence + "/sample-ai-brief.md",
        "# Synthetic QA example — not a real client\n\n" + inquiry.versions[0].markdown,
      );
    record(
      "Live OpenAI + private Blob: relevant follow-ups, source-referenced draft, saved original answers and idempotent replay verified.",
    );
  } else
    problems.push(
      "Live OpenAI was not exercised because no authorized key was available in the process.",
    );
} catch (e) {
  problems.push(e instanceof Error ? e.message : "Integration check failed.");
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server) server.kill("SIGTERM");
  let cursor;
  do {
    const page = await list({ prefix: namespace + "/", cursor });
    if (page.blobs.length) await del(page.blobs.map((b) => b.url));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  record("All synthetic records removed from the isolated QA namespace.");
  if (evidence)
    await writeFile(
      evidence + "/verification.json",
      JSON.stringify(
        { checkedAt: new Date().toISOString(), checks, problems, productionDeployed: false },
        null,
        2,
      ),
    );
  for (const problem of problems) console.error(problem);
}
