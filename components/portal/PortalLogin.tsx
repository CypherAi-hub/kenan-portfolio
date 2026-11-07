"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { ArrowRight, ArrowUpRight, Fingerprint, LockKeyhole, Check } from "lucide-react";
import BrandLogo from "@/components/studio/BrandLogo";
import type { Audience } from "@/lib/portal/access";
import { profile } from "@/lib/data";
export default function PortalLogin({ audience }: { audience: Audience }) {
  const owner = audience === "owner";
  const [invite, setInvite] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const captureInvitation = () => {
      const url = new URL(location.href);
      const raw = new URLSearchParams(url.hash.slice(1)).get("invite");
      if (raw) {
        setInvite(raw);
        history.replaceState(history.state, "", url.pathname + url.search);
      }
    };
    captureInvitation();
    window.addEventListener("hashchange", captureInvitation);
    window.addEventListener("pageshow", captureInvitation);
    return () => {
      window.removeEventListener("hashchange", captureInvitation);
      window.removeEventListener("pageshow", captureInvitation);
    };
  }, []);
  async function signIn() {
    if (busy) return;
    setBusy(true);
    setNotice("");
    const post = async (body: Record<string, unknown>) => {
      const r = await fetch("/api/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Please try again.");
      return d;
    };
    try {
      const d = await post({ action: "begin", audience, invite: invite || undefined });
      const response =
        d.mode === "register"
          ? await startRegistration({ optionsJSON: d.options })
          : await startAuthentication({ optionsJSON: d.options });
      await post({ action: "finish", response, invite: invite || undefined });
      const checkout = new URL(location.href).searchParams.get("checkout");
      location.replace(
        owner
          ? "/studio"
          : "/portal" +
              (checkout === "returned" || checkout === "cancelled" ? "?checkout=" + checkout : ""),
      );
    } catch (e) {
      setNotice(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Sign-in wasn’t completed. Try again when you’re ready."
          : e instanceof Error
            ? e.message
            : "Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <div
      className={"workspace-login " + (owner ? "workspace-login-owner" : "workspace-login-client")}
    >
      <header className="workspace-login-header">
        <Link href="/" aria-label="KJL Designs home">
          <BrandLogo />
        </Link>
        <Link href="/">
          Back to portfolio <ArrowUpRight size={16} />
        </Link>
      </header>
      <main className="workspace-login-grid" id="main">
        <section className="workspace-login-intro">
          <span className="workspace-login-eyebrow">
            {owner ? "THE PRIVATE STUDIO" : "YOUR CLIENT SPACE"}
          </span>
          <h1>
            {owner ? (
              <>
                Your studio.
                <br />
                <em>Your next move.</em>
              </>
            ) : (
              <>
                Good work.
                <br />
                <em>All in one place.</em>
              </>
            )}
          </h1>
          <p>
            {owner
              ? "Your projects, client relationships and next steps—together in your private KJL Designs workspace."
              : "A clear view of your project, from the first design to the final handoff. Welcome to your KJL Designs workspace."}
          </p>
          <ul>
            {(owner
              ? [
                  "Review every project and connected source",
                  "Prepare client follow-ups with your assistant",
                  "Manage appointments, updates and payments",
                ]
              : [
                  "See your project’s progress and latest designs",
                  "Leave feedback and request a meeting",
                  "Review payment requests securely",
                ]
            ).map((x) => (
              <li key={x}>
                <Check size={16} />
                {x}
              </li>
            ))}
          </ul>
          <span className="workspace-login-signature">KJL Designs · Built with intention.</span>
        </section>
        <section
          className="workspace-login-card"
          aria-label={owner ? "Studio owner sign in" : "Client sign in"}
        >
          <span className="workspace-login-icon">
            <Fingerprint size={30} strokeWidth={1.4} />
          </span>
          <span className="workspace-login-eyebrow">
            {owner ? "OWNER ACCESS" : "INVITATION-ONLY ACCESS"}
          </span>
          <h2>
            {invite ? "Make yourself at home." : owner ? "Welcome back, Kenan." : "Welcome back."}
          </h2>
          <p>
            {invite
              ? "Create your passkey to activate the private workspace in your invitation."
              : owner
                ? "Use your studio passkey to open your dashboard."
                : "Use the passkey you created when you accepted your project invitation."}
          </p>
          <button className="workspace-login-submit" disabled={busy} onClick={signIn}>
            {busy
              ? "Waiting for your device…"
              : invite
                ? "Activate my workspace"
                : owner
                  ? "Sign in to my studio"
                  : "Sign in to my project"}
            <ArrowRight size={18} />
          </button>
          {notice && (
            <p className="workspace-login-notice" role="status">
              {notice}
            </p>
          )}
          <small className="workspace-login-security">
            <LockKeyhole size={14} />
            Private access. Protected by your passkey.
          </small>
          <div className="workspace-login-help">
            {owner ? (
              <Link href="/portal/login">Looking for your client workspace?</Link>
            ) : (
              <>
                <p>New here? Open the private invitation Kenan sent you.</p>
                <a href={"mailto:" + profile.email}>Need help with your invitation?</a>
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="workspace-login-footer">
        <span>© {new Date().getFullYear()} KJL Designs</span>
        <Link href="/privacy">Privacy</Link>
        {!owner && <Link href="/studio/login">Studio owner</Link>}
      </footer>
    </div>
  );
}
