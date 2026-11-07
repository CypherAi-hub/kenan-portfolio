import type { Member } from "./types";
export type Audience = "owner" | "client";
export function matchesAudience(me: Member, audience: Audience) {
  return (
    me.role === audience &&
    (audience === "client" || me.email.toLowerCase() === "kenanlarry8@gmail.com")
  );
}
export const workspacePath = (me: Member) =>
  me.role === "owner" ? (matchesAudience(me, "owner") ? "/studio" : "/studio/login") : "/portal";
export const loginPath = (audience: Audience) =>
  audience === "owner" ? "/studio/login" : "/portal/login";
