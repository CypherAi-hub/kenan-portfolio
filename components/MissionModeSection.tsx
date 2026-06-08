import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Download,
  Gamepad2,
  Github,
  MapPinned,
  ShieldCheck,
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

const recruiterShortcuts = [
  { label: "Featured work", href: "#featured", icon: BriefcaseBusiness },
  { label: "GitHub", href: profile.github, icon: Github },
  { label: "Resume", href: profile.resumeUrl, icon: Download },
];

export default function MissionModeSection() {
  return (
    <section id="world" className="section-shell py-20 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded p-5 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded border border-white/15 bg-white/10">
              <Gamepad2 size={20} aria-hidden />
            </div>
            <div>
              <p className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
                Centerpiece
              </p>
              <h2 className="text-2xl font-semibold md:text-3xl">Enter Kenan World.</h2>
            </div>
          </div>

          <p className="text-fg-secondary mt-5 max-w-2xl text-base leading-7">
            The portfolio now has a playable layer where visitors walk through the projects,
            experience, certifications, and product story. It keeps the normal site intact, but
            gives curious recruiters something memorable to explore.
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
              href="#featured"
              className="border-border text-fg-secondary inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
            >
              Stay on portfolio
            </a>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Move", value: "WASD / Arrows" },
              { label: "Interact", value: "E / Enter" },
              { label: "Recruiter", value: "R" },
            ].map((control) => (
              <div key={control.label} className="rounded border border-white/10 bg-black/35 p-3">
                <p className="text-fg-muted font-mono text-[10px] uppercase">{control.label}</p>
                <p className="text-fg-secondary mt-1 font-mono text-xs">{control.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-white/12 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
            <div className="flex items-center gap-3">
              <MapPinned size={18} aria-hidden />
              <div>
                <p className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
                  World map
                </p>
                <h3 className="font-semibold">Explore by proof area</h3>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded border border-white/10 px-3 py-2 font-mono text-[10px] text-emerald-100/80 uppercase sm:flex">
              <ShieldCheck size={14} aria-hidden />
              Safe mode
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {worldStops.map((stop, index) => (
              <Link
                key={stop.title}
                href="/world"
                className="group min-h-36 rounded border border-white/10 bg-black/35 p-4 transition-colors hover:border-white/35 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-fg-muted font-mono text-[10px] uppercase">
                    District {String(index + 1).padStart(2, "0")}
                  </p>
                  <span className="flex size-7 items-center justify-center rounded border border-white/10 text-white/60 transition-colors group-hover:border-white/30 group-hover:text-white">
                    <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
                <h4 className="mt-5 text-lg font-semibold">{stop.title}</h4>
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
                    Collectibles unlock the same story the normal portfolio tells: product,
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
    </section>
  );
}
