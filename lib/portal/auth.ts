import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { directory, editDirectory, requireValue } from "./store";
import type { Account, Member } from "./types";

export const hash = (value: string) => createHash("sha256").update(value).digest("base64url");
export const token = () => randomBytes(32).toString("base64url");
export const origin = () =>
  new URL(process.env.PORTAL_ORIGIN || "https://kjl-designs.vercel.app").origin;
const rp = () => new URL(origin()).hostname;
const cookieOptions = () => ({
  secure: origin().startsWith("https://"),
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
});
const sessionName = () => (cookieOptions().secure ? "__Host-" : "") + "kjl-session";
const challengeName = () => (cookieOptions().secure ? "__Host-" : "") + "kjl-challenge";
export const publicMember = ({ id, name, email, role }: Account): Member => ({
  id,
  name,
  email,
  role,
});
export async function identity() {
  const value = (await cookies()).get(sessionName())?.value;
  if (!value || value.length !== 43) return null;
  const digest = hash(value);
  return (
    (await directory()).accounts.find((a) =>
      a.sessions.some((s) => s.expires > Date.now() && s.hash === digest),
    ) || null
  );
}
export async function signOut() {
  const jar = await cookies();
  const value = jar.get(sessionName())?.value;
  if (value)
    await editDirectory((d) => {
      for (const a of d.accounts)
        a.sessions = a.sessions.filter((s) => s.hash !== hash(value) && s.expires > Date.now());
    });
  jar.delete(sessionName());
}
export const newInvitation = () => {
  const raw = token();
  return { raw, stored: { hash: hash(raw), expires: Date.now() + 7 * 86400000 } };
};
export function findInvite(accounts: Account[], raw: string) {
  requireValue(
    typeof raw === "string" && raw.length === 43,
    "This invitation has expired or was replaced.",
    403,
  );
  const entry = accounts.find(
    (a) => a.invitation?.hash === hash(raw) && a.invitation.expires > Date.now(),
  );
  requireValue(entry, "This invitation has expired or was replaced.", 403);
  return entry;
}
type Challenge = { mode: "register" | "login"; value: string; expires: number; invite?: string };
function sign(body: string) {
  const key = process.env.PORTAL_SIGNING_KEY;
  requireValue(key && key.length >= 32, "Sign-in is temporarily unavailable.", 503);
  return createHmac("sha256", key).update(body).digest("base64url");
}
async function issue(data: Challenge) {
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  (await cookies()).set(challengeName(), body + "." + sign(body), {
    ...cookieOptions(),
    sameSite: "strict",
    maxAge: 300,
  });
}
async function consume() {
  const jar = await cookies();
  const [body, mac] = (jar.get(challengeName())?.value || "").split(".");
  jar.delete(challengeName());
  requireValue(
    body &&
      mac &&
      /^[A-Za-z0-9_-]{43}$/.test(mac) &&
      timingSafeEqual(Buffer.from(mac), Buffer.from(sign(body))),
    "Sign-in expired. Start again.",
    403,
  );
  const c: Challenge = JSON.parse(Buffer.from(body, "base64url").toString());
  requireValue(c.expires > Date.now(), "Sign-in expired. Start again.", 403);
  return c;
}
export async function begin(raw?: string) {
  if (raw) {
    requireValue(typeof raw === "string" && raw.length === 43, "Invalid invitation.", 403);
    const a = findInvite((await directory()).accounts, raw);
    const options = await generateRegistrationOptions({
      rpName: "KJL Designs",
      rpID: rp(),
      userID: new TextEncoder().encode(a.id),
      userName: a.email,
      userDisplayName: a.name,
      attestationType: "none",
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    await issue({
      mode: "register",
      value: options.challenge,
      expires: Date.now() + 300000,
      invite: hash(raw),
    });
    return { mode: "register", options };
  }
  const options = await generateAuthenticationOptions({ rpID: rp(), userVerification: "required" });
  await issue({ mode: "login", value: options.challenge, expires: Date.now() + 300000 });
  return { mode: "login", options };
}
export async function finish(
  response: AuthenticationResponseJSON | RegistrationResponseJSON,
  raw?: string,
) {
  const challenge = await consume();
  const expected = {
    expectedChallenge: challenge.value,
    expectedOrigin: origin(),
    expectedRPID: rp(),
    requireUserVerification: true,
  };
  const accounts = (await directory()).accounts;
  const a =
    challenge.mode === "register"
      ? findInvite(accounts, raw || "")
      : accounts.find((u) => u.credential?.id === response?.id);
  requireValue(a, "Passkey could not be verified.", 403);
  let credential = a.credential;
  if (challenge.mode === "register") {
    requireValue(challenge.invite === hash(raw || ""), "Use your current invitation.", 403);
    const result = await verifyRegistrationResponse({
      ...expected,
      response: response as RegistrationResponseJSON,
    });
    requireValue(result.verified && result.registrationInfo, "Passkey could not be verified.", 403);
    const c = result.registrationInfo.credential;
    credential = {
      id: c.id,
      publicKey: Buffer.from(c.publicKey).toString("base64url"),
      counter: c.counter,
    };
  } else {
    requireValue(credential, "Passkey could not be verified.", 403);
    const result = await verifyAuthenticationResponse({
      ...expected,
      response: response as AuthenticationResponseJSON,
      credential: {
        id: credential.id,
        publicKey: Uint8Array.from(Buffer.from(credential.publicKey, "base64url")),
        counter: credential.counter,
      },
    });
    requireValue(result.verified, "Passkey could not be verified.", 403);
    credential = { ...credential, counter: result.authenticationInfo.newCounter };
  }
  const rawSession = token(),
    expiry = Date.now() + 7 * 86400000;
  await editDirectory((d) => {
    const current = d.accounts.find((u) => u.id === a.id);
    requireValue(current, "Access has been removed.", 403);
    current.recentChallenges = current.recentChallenges.filter((c) => c.expires > Date.now());
    requireValue(
      !current.recentChallenges.some((c) => c.value === challenge.value),
      "Sign-in has already been used.",
      403,
    );
    if (challenge.mode === "register") {
      findInvite([current], raw || "");
      requireValue(
        !d.accounts.some((u) => u.id !== a.id && u.credential?.id === credential.id),
        "Passkey is already in use.",
        403,
      );
      delete current.invitation;
      current.sessions = [];
    } else {
      requireValue(
        current.credential?.id === a.credential?.id &&
          current.credential?.counter === a.credential?.counter,
        "Sign-in changed. Try again.",
        403,
      );
    }
    current.credential = credential;
    current.recentChallenges.push({ value: challenge.value, expires: challenge.expires });
    current.sessions = current.sessions.filter((s) => s.expires > Date.now()).slice(-7);
    current.sessions.push({ hash: hash(rawSession), expires: expiry });
  });
  (await cookies()).set(sessionName(), rawSession, { ...cookieOptions(), maxAge: 7 * 86400 });
}
