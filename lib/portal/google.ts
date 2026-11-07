import { createHash } from "node:crypto";
import {
  getToken,
  startAuthorization,
  UserAuthorizationRequiredError,
  NoValidTokenError,
} from "@vercel/connect";
import { assertOwner, editDesk } from "./desk";
import { directory, requireValue } from "./store";
import type { Account } from "./types";
const connector = "google/kjl-studio-google";
const scopes = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.events.owned",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
const params = (me: Account) => ({ subject: { type: "user" as const, id: me.id }, scopes });
async function token(me: Account) {
  assertOwner(me);
  return getToken(connector, params(me));
}
async function google(me: Account, url: string, init: RequestInit = {}) {
  const key = await token(me);
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
    redirect: "error",
  });
}
async function verified(me: Account) {
  const r = await google(me, "https://www.googleapis.com/oauth2/v3/userinfo");
  requireValue(r.ok, "Google could not verify the connected account. Reconnect Google.", 503);
  const profile = await r.json();
  requireValue(
    profile.email === "cypheros.ai@gmail.com" && profile.email_verified === true,
    "Connect cypheros.ai@gmail.com to use studio email and Calendar.",
    403,
  );
  return profile.email as string;
}
export async function googleStatus(me: Account) {
  assertOwner(me);
  try {
    return { connected: true, email: await verified(me) };
  } catch (e) {
    if (e instanceof UserAuthorizationRequiredError || e instanceof NoValidTokenError)
      return { connected: false };
    return {
      connected: false,
      error: "Google needs connecting or refreshing. Use Connect Google below.",
    };
  }
}
export async function verifyGoogleConnection(me: Account) {
  assertOwner(me);
  const email = await verified(me),
    key = await token(me);
  const response = await fetch(
    "https://oauth2.googleapis.com/tokeninfo?access_token=" + encodeURIComponent(key),
    { cache: "no-store", signal: AbortSignal.timeout(15000), redirect: "error" },
  );
  requireValue(
    response.ok,
    "Google could not confirm the connection permissions. Reconnect Google.",
    503,
  );
  const info = await response.json();
  const granted = new Set(String(info.scope || "").split(" "));
  requireValue(
    scopes.slice(2).every((scope) => granted.has(scope)),
    "Google is missing email or Calendar permissions. Reconnect and review the requested permissions.",
    409,
  );
  await freeBusy(me, new Date(Date.now() + 86400000).toISOString());
  return {
    ok: true,
    email,
    message: "Email sending permission and primary Calendar access verified.",
  };
}
export async function connectGoogle(me: Account) {
  assertOwner(me);
  const { url } = await startAuthorization(connector, params(me), {
    callbackUrl: "https://kjl-designs.vercel.app/portal",
    prompt: "consent",
  });
  requireValue(new URL(url).protocol === "https:", "Invalid Google authorization URL.", 503);
  return { url };
}
export async function freeBusy(me: Account, start: string) {
  const from = new Date(start),
    to = new Date(from.getTime() + 30 * 60000);
  requireValue(Number.isFinite(from.getTime()), "Choose an exact meeting time.");
  const r = await google(me, "https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      items: [{ id: "primary" }],
    }),
  });
  requireValue(r.ok, "Calendar availability is unavailable. No event was created.", 503);
  const data = await r.json(),
    primary = data.calendars?.primary;
  requireValue(
    primary && !primary.errors?.length && Array.isArray(primary.busy),
    "Calendar availability could not be confirmed.",
    503,
  );
  return primary.busy.length === 0;
}
// External delivery is reserved before calling Google. Ambiguous Gmail failures never auto-resend.
export async function applyGoogleAction(me: Account, id: string, input: Record<string, unknown>) {
  assertOwner(me);
  const sender = await verified(me);
  const client = (await directory()).accounts.find(
    (a) => a.role === "client" && a.id === input.client,
  );
  requireValue(
    client && client.email === input.to,
    "The client email changed. Prepare a new proposal.",
    409,
  );
  const title = String(input.title || "").trim(),
    body = String(input.body || "").trim();
  requireValue(
    title.length > 0 &&
      title.length <= 180 &&
      !/[\r\n]/.test(title) &&
      body.length > 0 &&
      body.length <= 10000,
    "Check the message subject and body.",
  );
  requireValue(
    !/[\r\n]/.test(client.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email),
    "Invalid client email.",
  );
  const isCalendar = input.action === "calendar",
    start = new Date(String(input.start));
  if (isCalendar) {
    requireValue(
      Number.isFinite(start.getTime()) &&
        start.getTime() > Date.now() + 60000 &&
        start.getTime() < Date.now() + 90 * 86400000,
      "Choose a future time within 90 days.",
    );
    requireValue(
      await freeBusy(me, start.toISOString()),
      "Your Google Calendar is busy at that time. Choose another time.",
      409,
    );
  }
  const reservation = await editDesk((d) => {
    const p = d.proposals.find((p) => p.id === id && p.owner === me.id);
    requireValue(p, "Proposal not found.", 404);
    if (p.status === "applied") return "done";
    requireValue(
      !p.delivery,
      "This delivery is already in progress or needs review. Check Gmail or Calendar before preparing another.",
      409,
    );
    if (isCalendar)
      requireValue(
        !d.proposals.some(
          (other) =>
            other.id !== id &&
            other.input.action === "calendar" &&
            other.delivery &&
            other.delivery.status !== "failed" &&
            Math.abs(new Date(String(other.input.start)).getTime() - start.getTime()) < 30 * 60000,
        ),
        "Another studio meeting overlaps this time.",
        409,
      );
    p.delivery = { status: "sending", at: new Date().toISOString() };
    return "send";
  });
  if (reservation === "done") return { ok: true };
  let accepted = false;
  try {
    const url = isCalendar
      ? "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all"
      : "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    const eventId = createHash("sha256").update(id).digest("hex");
    const raw = [
      `From: KJL Designs <${sender}>`,
      `To: ${client.email}`,
      `Subject: =?UTF-8?B?${Buffer.from(title).toString("base64")}?=`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      `Message-ID: <${id}@kjl-designs.vercel.app>`,
      "",
      Buffer.from(body)
        .toString("base64")
        .match(/.{1,76}/g)!
        .join("\r\n"),
    ].join("\r\n");
    const payload = isCalendar
      ? {
          id: eventId,
          summary: title,
          description: body,
          start: { dateTime: start.toISOString(), timeZone: "America/Chicago" },
          end: {
            dateTime: new Date(start.getTime() + 30 * 60000).toISOString(),
            timeZone: "America/Chicago",
          },
          attendees: [{ email: client.email }],
        }
      : { raw: Buffer.from(raw).toString("base64url") };
    const r = await google(me, url, { method: "POST", body: JSON.stringify(payload) });
    if (!r.ok) {
      await editDesk((d) => {
        const p = d.proposals.find((p) => p.id === id);
        if (p)
          p.delivery = {
            status: r.status >= 500 ? "unknown" : "failed",
            at: new Date().toISOString(),
          };
      });
      requireValue(
        false,
        "Google did not confirm delivery. Check Gmail or Calendar before trying again.",
        503,
      );
    }
    accepted = true;
    const result = await r.json();
    await editDesk((d) => {
      const p = d.proposals.find((p) => p.id === id);
      requireValue(p, "Proposal not found.");
      p.status = "applied";
      p.delivery = {
        status: "sent",
        at: new Date().toISOString(),
        reference: String(result.id || ""),
      };
    });
    return { ok: true };
  } catch (e) {
    // Preserve 'sending' on storage failure, preventing a duplicate after provider acceptance.
    if (!accepted)
      await editDesk((d) => {
        const p = d.proposals.find((p) => p.id === id);
        if (p?.delivery?.status === "sending") p.delivery.status = "unknown";
      });
    throw e;
  }
}
