import Stripe from "stripe";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { readFileSync } from "node:fs";
const origin = "https://kjl-designs.vercel.app";
const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
if (project.projectName !== "kenan-portfolio")
  throw new Error("Run this from the linked KJL Designs Vercel project.");
function configure(name, value) {
  execFileSync("vercel", ["env", "add", name, "production", "--sensitive", "--force"], {
    input: value,
    stdio: ["pipe", "ignore", "pipe"],
  });
}
async function secret() {
  let hidden = false;
  const out = new Writable({
    write(chunk, _, cb) {
      if (!hidden) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output: out, terminal: true });
  try {
    process.stdout.write("Paste your KJL Designs live Stripe key (hidden), then press Return: ");
    hidden = true;
    return (await rl.question("")).trim();
  } finally {
    hidden = false;
    rl.close();
    console.log();
  }
}
try {
  const key = await secret();
  if (!/^(sk|rk)_live_/.test(key))
    throw new Error("A live key for the new KJL Designs account is required.");
  const stripe = new Stripe(key);
  const account = await stripe.accounts.retrieve();
  if (!account.charges_enabled)
    throw new Error(
      "Finish the activation steps Stripe shows under Payments, then run this again.",
    );
  if (!account.payouts_enabled)
    console.log(
      "Stripe has enabled charges. Bank payouts are still pending in your Stripe Dashboard.",
    );
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ok = await rl.question(
    "Connect " +
      (account.business_profile?.name || account.settings?.dashboard?.display_name || account.id) +
      " (" +
      account.id +
      ") to " +
      origin +
      "? Type CONNECT: ",
  );
  rl.close();
  if (ok !== "CONNECT") throw new Error("Connection cancelled.");
  const target = origin + "/api/stripe/webhook";
  const old = (await stripe.webhookEndpoints.list({ limit: 100 })).data.filter(
    (e) => e.url === target && e.metadata?.studio === "kjl",
  );
  const endpoint = await stripe.webhookEndpoints.create({
    url: target,
    enabled_events: ["checkout.session.completed", "checkout.session.async_payment_succeeded"],
    description: "KJL Designs project payments",
    metadata: { studio: "kjl" },
  });
  if (!endpoint.secret) throw new Error("Stripe did not return a signing secret.");
  configure("STRIPE_WEBHOOK_SECRET", endpoint.secret);
  configure("STRIPE_SECRET_KEY", key);
  const rebuilt = execFileSync(
    "vercel",
    ["redeploy", origin, "--target", "production", "--scope", "cypherai-hubs-projects"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const deployment = rebuilt
    .trim()
    .match(/(?:https:\/\/)?(kenan-portfolio-[a-z0-9-]+\.vercel\.app)\b/);
  if (!deployment)
    throw new Error(
      "Find the new production deployment in Vercel before assigning the studio domain.",
    );
  execFileSync(
    "vercel",
    ["alias", "set", deployment[1], new URL(origin).hostname, "--scope", "cypherai-hubs-projects"],
    { stdio: "inherit" },
  );
  const stamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    id: "evt_kjl_connection_check",
    type: "kjl.connection.check",
    created: stamp,
    livemode: true,
    data: { object: {} },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: endpoint.secret,
    timestamp: stamp,
  });
  const response = await fetch(target, {
    method: "POST",
    headers: { "stripe-signature": signature },
    body,
  });
  if (!response.ok)
    throw new Error(
      "The live endpoint could not verify the signature. Inspect the deployment before taking payments.",
    );
  for (const prior of old) await stripe.webhookEndpoints.update(prior.id, { disabled: true });
  console.log("KJL Designs live payment connection verified.");
} catch (e) {
  // SDK and CLI errors can contain credentials or env assignments. Keep output categorical.
  if (e?.type)
    console.error(
      "Stripe could not complete setup (" +
        e.type +
        "). Check the key permissions and account status.",
    );
  else if (e?.status || e?.cmd)
    console.error(
      "Vercel could not save or deploy this configuration. Sign in to the linked project and retry.",
    );
  else console.error(e.message);
  process.exitCode = 1;
}
