import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Download,
  Gamepad2,
  Github,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { profile } from "@/lib/data";

const worldStops = [
  {
    title: "FoFit City",
    detail: "Mobile app, Coach platform, Cypher AI, Marketplace, and product media.",
  },
  {
    title: "Cyber City",
    detail: "SOC Monitor, Netwatch, AWS output, and the Cyberlou report preview.",
  },
  {
    title: "AI District",
    detail: "AgentRoom, Omni, Ruflo, Stack Mode, and workflow tooling proof.",
  },
  {
    title: "Achievement Hall",
    detail: "Certifications, resume access, proof tokens, and recruiter summary.",
  },
];

const districtPreview = [
  {
    label: "Hometown",
    detail: "origin",
    className:
      "left-[7%] top-[12%] border-[#f3d7a6]/40 bg-[#f3d7a6]/12 text-[#f3d7a6] sm:top-[15%]",
  },
  {
    label: "FoFit City",
    detail: "product",
    className:
      "left-[52%] top-[12%] border-[#76f4df]/45 bg-[#76f4df]/12 text-[#76f4df] sm:left-[36%] sm:top-[10%]",
  },
  {
    label: "Cyber City",
    detail: "security",
    className:
      "left-[7%] top-[37%] border-[#78c7ff]/40 bg-[#78c7ff]/12 text-[#78c7ff] sm:left-[14%] sm:top-[55%]",
  },
  {
    label: "AI District",
    detail: "agents",
    className:
      "left-[52%] top-[37%] border-[#bfa7ff]/40 bg-[#bfa7ff]/12 text-[#d8ccff] sm:left-[48%] sm:top-[57%]",
  },
  {
    label: "Career City",
    detail: "experience",
    className:
      "left-[7%] top-[62%] border-[#e8d7c4]/35 bg-[#e8d7c4]/10 text-[#e8d7c4] sm:left-[78%] sm:top-[17%]",
  },
  {
    label: "Proof Hall",
    detail: "resume",
    className:
      "left-[52%] top-[62%] border-[#f6d777]/40 bg-[#f6d777]/12 text-[#f6d777] sm:left-[75%] sm:top-[65%]",
  },
];

const recruiterShortcuts = [
  { label: "Featured work", href: "#featured", icon: BriefcaseBusiness },
  { label: "GitHub", href: profile.github, icon: Github },
  { label: "Resume", href: profile.resumeUrl, icon: Download },
];

export default function MissionModeSection() {
  return (
    <section id="world" className="section-shell py-20 md:py-24">
      <div className="overflow-hidden rounded border border-white/12 bg-[#050505] shadow-[0_36px_120px_rgba(0,0,0,.52)]">
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative border-b border-white/10 p-5 md:p-8 lg:border-r lg:border-b-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(118,244,223,.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,.07),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.028)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#76f4df]/30 bg-[#76f4df]/10 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-[#76f4df] uppercase">
                  <Sparkles size={12} aria-hidden />
                  Interactive Proof
                </span>
                <span className="text-fg-muted rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase">
                  Optional recruiter escape built in
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded border border-white/15 bg-white/10">
                  <Gamepad2 size={21} aria-hidden />
                </div>
                <div>
                  <p className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
                    Centerpiece
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                    Kenan World is the portfolio.
                  </h2>
                </div>
              </div>

              <p className="text-fg-secondary mt-6 max-w-2xl text-base leading-7 md:text-lg">
                Walk through the build path instead of reading another generic student site.
                Districts, project buildings, proof rooms, screenshots, case studies, collectibles,
                and Recruiter Mode all point back to real work.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/world"
                  className="text-bg hover:bg-accent-dim inline-flex h-11 items-center gap-2 rounded border border-white bg-white px-4 font-mono text-sm transition-colors"
                >
                  Launch Kenan World
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <a
                  href={profile.resumeUrl}
                  className="border-border text-fg-secondary inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
                >
                  <Download size={15} aria-hidden />
                  Resume
                </a>
                <a
                  href="#featured"
                  className="border-border text-fg-secondary inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
                >
                  Skip to work
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Districts", value: "6 proof zones" },
                  { label: "Controls", value: "WASD / arrows" },
                  { label: "Recruiter", value: "Press R anytime" },
                ].map((control) => (
                  <div
                    key={control.label}
                    className="rounded border border-white/10 bg-black/35 p-3"
                  >
                    <p className="text-fg-muted font-mono text-[10px] uppercase">{control.label}</p>
                    <p className="text-fg-secondary mt-1 font-mono text-xs">{control.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/12 pb-4">
              <div className="flex items-center gap-3">
                <MapPinned size={18} aria-hidden />
                <div>
                  <p className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
                    Live world preview
                  </p>
                  <h3 className="font-semibold">Explore by proof area</h3>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded border border-white/10 px-3 py-2 font-mono text-[10px] text-emerald-100/80 uppercase sm:flex">
                <ShieldCheck size={14} aria-hidden />
                Safe mode
              </div>
            </div>

            <Link
              href="/world"
              aria-label="Open Kenan World interactive map"
              className="group relative block min-h-[460px] overflow-hidden rounded border border-white/12 bg-black/45 transition hover:border-[#76f4df]/45 sm:min-h-[340px]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_24%,rgba(118,244,223,.17),transparent_28%),radial-gradient(circle_at_22%_72%,rgba(120,199,255,.14),transparent_26%),radial-gradient(circle_at_72%_68%,rgba(191,167,255,.14),transparent_26%)]" />
              <div className="absolute top-[30%] left-[18%] h-1 w-[64%] rotate-[7deg] rounded-full bg-white/10" />
              <div className="absolute top-[50%] left-[22%] h-1 w-[55%] -rotate-[14deg] rounded-full bg-white/10" />
              <div className="absolute top-[22%] right-[20%] h-[58%] w-1 rotate-[8deg] rounded-full bg-white/10" />

              {districtPreview.map((district) => (
                <div
                  key={district.label}
                  className={`absolute min-w-24 rounded border px-2.5 py-2 shadow-[0_18px_60px_rgba(0,0,0,.38)] backdrop-blur transition group-hover:-translate-y-0.5 sm:min-w-28 sm:px-3 ${district.className}`}
                >
                  <p className="font-mono text-[9px] tracking-[0.14em] uppercase">
                    {district.detail}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{district.label}</p>
                </div>
              ))}

              <div className="absolute right-4 bottom-4 left-4 rounded border border-white/10 bg-black/70 p-4 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-fg-muted font-mono text-[10px] uppercase">Current route</p>
                    <p className="mt-1 text-sm font-semibold">
                      Hometown -&gt; FoFit City -&gt; Cyber City -&gt; AI District
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded border border-white/18 px-3 py-2 font-mono text-[10px] text-white/78 uppercase">
                    Open world
                    <ArrowRight size={13} aria-hidden />
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {worldStops.map((stop, index) => (
                <Link
                  key={stop.title}
                  href="/world"
                  className="group min-h-32 rounded border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/35 hover:bg-white/[0.055]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-fg-muted font-mono text-[10px] uppercase">
                      District {String(index + 1).padStart(2, "0")}
                    </p>
                    <span className="flex size-7 items-center justify-center rounded border border-white/10 text-white/60 transition-colors group-hover:border-white/30 group-hover:text-white">
                      <ArrowRight size={14} aria-hidden />
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold">{stop.title}</h4>
                  <p className="text-fg-secondary mt-2 text-sm leading-6">{stop.detail}</p>
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="rounded border border-white/10 bg-black/35 p-4">
                <div className="flex items-center gap-3">
                  <Trophy size={18} aria-hidden />
                  <div>
                    <p className="text-fg-muted font-mono text-[10px] uppercase">Proof tokens</p>
                    <p className="text-fg-secondary mt-1 text-sm leading-6">
                      Collectibles unlock the same proof system recruiters need: product,
                      cybersecurity, cloud, AI, athletic discipline, and consistent shipping.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 md:min-w-52 md:grid-cols-1">
                {recruiterShortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <a
                      key={shortcut.label}
                      href={shortcut.href}
                      className="border-border text-fg-secondary inline-flex h-10 items-center justify-center gap-2 rounded border px-3 font-mono text-xs transition-colors hover:border-white/45 hover:text-white"
                    >
                      <Icon size={14} aria-hidden />
                      {shortcut.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
