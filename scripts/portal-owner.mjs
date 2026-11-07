import { get, put } from "@vercel/blob";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { writeFile, chmod } from "node:fs/promises";
const [output, flag] = process.argv.slice(2);
if (!output) throw new Error("Provide a private output file for the owner invitation.");
const path = (process.env.PORTAL_NAMESPACE || "kjl-studio-v1") + "/accounts.json";
const current = await get(path, { access: "private", useCache: false });
const directory = current ? await new Response(current.stream).json() : { accounts: [] };
let account = directory.accounts.find((a) => a.role === "owner");
if (account && flag !== "--recover-owner")
  throw new Error("Owner already exists. Use --recover-owner only to replace their passkey.");
if (!account) {
  account = {
    id: randomUUID(),
    name: "Kenan Larry",
    email: "kenanlarry8@gmail.com",
    role: "owner",
    sessions: [],
    recentChallenges: [],
  };
  directory.accounts.push(account);
}
const raw = randomBytes(32).toString("base64url");
account.invitation = {
  hash: createHash("sha256").update(raw).digest("base64url"),
  expires: Date.now() + 7 * 86400000,
};
account.sessions = [];
delete account.credential;
const url = new URL("/studio/login", process.env.PORTAL_ORIGIN || "https://kjl-designs.vercel.app");
url.hash = "invite=" + raw;
// Write the private handoff first so a disk error cannot orphan the invitation.
await writeFile(
  output,
  "<!doctype html><meta name='referrer' content='no-referrer'><title>KJL Designs · Owner setup</title><h1>KJL Designs owner access</h1><p>This one-time invitation is for Kenan only. Keep it private.</p><p><a href='" +
    url.href +
    "'>Set up my owner passkey</a></p>",
  { mode: 0o600 },
);
await chmod(output, 0o600);
await put(path, JSON.stringify(directory), {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: !!current,
  ifMatch: current?.blob.etag.replace(/^W\//, ""),
  contentType: "application/json",
});
console.log("Owner invitation saved privately. It expires in seven days.");
