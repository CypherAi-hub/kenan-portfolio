"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  Download,
  Gamepad2,
  Github,
  Linkedin,
  Mail,
  Map,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import GradientMesh from "@/components/effects/GradientMesh";

function HeroLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        primary
          ? "text-bg hover:bg-accent-dim inline-flex h-11 max-w-full items-center gap-2 rounded border border-white bg-white px-4 font-mono text-sm transition-colors"
          : "border-border text-fg-secondary inline-flex h-11 max-w-full items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
      }
    >
      {children}
    </a>
  );
}

const heroSignals = ["FoFit", "Cybersecurity", "AI tools", "Cloud", "Mobile"];

const districts = [
  { label: "Home", className: "left-[7%] top-[16%] h-[28%] w-[26%]" },
  { label: "FoFit City", className: "left-[38%] top-[10%] h-[36%] w-[40%]" },
  { label: "Cyber City", className: "left-[8%] top-[55%] h-[32%] w-[35%]" },
  { label: "AI District", className: "left-[48%] top-[56%] h-[30%] w-[28%]" },
  { label: "Career", className: "right-[5%] top-[16%] h-[28%] w-[16%]" },
  { label: "Museum", className: "right-[6%] bottom-[10%] h-[26%] w-[18%]" },
];

const proofFrames = [
  {
    title: "FoFit",
    src: "/media/projects/fofit/fofit-journey-poster.webp",
    alt: "FoFit product poster used as portfolio project media",
  },
  {
    title: "SOC",
    src: "/media/projects/soc-monitor/soc-monitor-dashboard.png",
    alt: "SOC Monitor dashboard screenshot",
  },
  {
    title: "Report",
    src: "/media/projects/cyberlou-pentest-report/pentest-report-preview.webp",
    alt: "Cyberlou penetration testing report preview",
  },
];

function WorldPreview() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="relative min-w-0 overflow-hidden"
      aria-label="Kenan World playable portfolio preview"
    >
      <div className="premium-noise relative overflow-hidden rounded border border-white/14 bg-white/[0.035] p-4 shadow-2xl shadow-black/60 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
          <div>
            <p className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
              Playable portfolio layer
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Kenan World</h2>
          </div>
          <div className="text-fg-secondary hidden items-center gap-2 rounded border border-white/12 bg-black/35 px-3 py-2 font-mono text-[10px] uppercase sm:flex">
            <Map size={14} aria-hidden />
            /world
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.46fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded border border-white/12 bg-black">
            <div className="bg-grid absolute inset-0 opacity-45" aria-hidden />
            <div
              className="absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 bg-white/[0.08]"
              aria-hidden
            />
            <div
              className="absolute top-0 bottom-0 left-1/2 w-7 -translate-x-1/2 bg-white/[0.08]"
              aria-hidden
            />

            {districts.map((district) => (
              <div
                key={district.label}
                className={`absolute rounded border border-white/18 bg-white/[0.045] p-2 ${district.className}`}
              >
                <span className="text-fg-secondary font-mono text-[9px] tracking-[0.16em] uppercase">
                  {district.label}
                </span>
              </div>
            ))}

            <div
              className="absolute top-[43%] left-[47%] flex size-9 items-center justify-center rounded border border-white/60 bg-white text-black shadow-lg shadow-white/20"
              aria-hidden
            >
              <span className="font-mono text-[10px] font-bold">KL</span>
            </div>

            <div className="absolute right-4 bottom-4 max-w-[250px] rounded border border-white/14 bg-black/75 p-3 backdrop-blur">
              <p className="text-fg-muted font-mono text-[10px] uppercase">Recruiter shortcut</p>
              <p className="text-fg-secondary mt-1 text-sm leading-5">
                Press R inside the world for the traditional resume and project summary.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {proofFrames.map((frame) => (
              <div
                key={frame.title}
                className="overflow-hidden rounded border border-white/14 bg-black/50"
              >
                <div className="flex items-center justify-between border-b border-white/12 px-3 py-2">
                  <span className="text-fg-secondary font-mono text-[10px] uppercase">
                    {frame.title}
                  </span>
                  <span className="size-1.5 rounded-full bg-white/50" />
                </div>
                <div className="aspect-[16/10]">
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    width={360}
                    height={230}
                    sizes="(min-width: 1024px) 220px, 70vw"
                    className="h-full w-full object-cover object-top brightness-110 contrast-125 grayscale"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-t border-white/12 pt-4 sm:grid-cols-3">
          {["Explore districts", "Open project rooms", "Recruiter shortcut"].map((item) => (
            <div
              key={item}
              className="text-fg-secondary rounded border border-white/10 bg-black/35 px-3 py-2 font-mono text-[10px] uppercase"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-24 pb-12 md:pt-36 md:pb-20">
      <GradientMesh />
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="min-w-0">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg-secondary inline-flex max-w-full rounded border border-white/20 bg-white/[0.06] px-3 py-2 font-mono text-xs leading-5 break-words whitespace-normal"
            >
              {profile.status}
            </motion.div>
            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-5xl leading-none font-semibold tracking-normal md:mt-6 md:text-7xl"
            >
              {profile.name}
            </motion.h1>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg mt-4 max-w-3xl text-2xl leading-tight break-words md:mt-5 md:text-4xl"
            >
              {profile.headline}
            </motion.p>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg-secondary mt-5 max-w-2xl text-base leading-7 break-words md:mt-6 md:text-lg"
            >
              {profile.intro}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap gap-2 md:mt-7"
            >
              {heroSignals.map((signal) => (
                <span
                  key={signal}
                  className="border-border bg-bg-elevated/70 text-fg-secondary rounded border px-3 py-1.5 font-mono text-[11px] uppercase"
                >
                  {signal}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel mt-6 max-w-xl rounded p-3.5 md:mt-8 md:p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded border border-white/15 bg-white/10">
                  <ShieldCheck size={18} aria-hidden />
                </div>
                <div>
                  <p className="text-fg-muted font-mono text-xs uppercase">Recruiter path</p>
                  <p className="text-fg-secondary mt-1 text-sm leading-6">
                    Scan the featured work below, or launch Kenan World for an interactive proof
                    tour through projects, cyber work, AI tools, and experience.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap gap-3 md:mt-8"
            >
              <HeroLink href="/world" primary>
                <Gamepad2 size={16} aria-hidden />
                Enter Kenan World
              </HeroLink>
              <HeroLink href="#featured">
                View Featured Work
                <ArrowDownRight size={16} aria-hidden />
              </HeroLink>
              {profile.resumeUrl ? (
                <HeroLink href={profile.resumeUrl}>
                  <Download size={16} aria-hidden />
                  Download Resume
                </HeroLink>
              ) : null}
              <HeroLink href={profile.github}>
                <Github size={16} aria-hidden />
                GitHub
              </HeroLink>
              <HeroLink href={profile.linkedin}>
                <Linkedin size={16} aria-hidden />
                LinkedIn
              </HeroLink>
              <HeroLink href={`mailto:${profile.email}`}>
                <Mail size={16} aria-hidden />
                Contact
                <ArrowRight size={16} aria-hidden />
              </HeroLink>
            </motion.div>
          </div>

          <WorldPreview />
        </div>
      </div>
    </section>
  );
}
