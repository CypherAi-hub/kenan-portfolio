"use client";

import Image from "next/image";
import { ArrowRight, Download, Gamepad2, Github, Linkedin, Mail, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import GradientMesh from "@/components/effects/GradientMesh";
import { featuredProjects } from "@/data/projects";

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
          ? "text-bg hover:bg-accent-dim inline-flex h-11 items-center gap-2 rounded border border-white bg-white px-4 font-mono text-sm transition-colors"
          : "border-border text-fg-secondary inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
      }
    >
      {children}
    </a>
  );
}

const heroBadges = ["AI Products", "Cybersecurity", "Cloud", "Mobile", "Consulting"];

const heroStack = featuredProjects
  .filter((project) =>
    ["fofit", "fofit-coach", "agentroom", "cyberlou-pentest-report"].includes(project.slug),
  )
  .map((project) => ({
    title: project.title,
    label: project.proof ?? project.category,
    media: project.media[0],
  }));

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <GradientMesh />
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg-secondary inline-flex rounded border border-white/20 bg-white/[0.06] px-3 py-2 font-mono text-xs"
            >
              {profile.status}
            </motion.div>
            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-5xl leading-none font-semibold tracking-normal md:text-7xl"
            >
              {profile.name}
            </motion.h1>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg mt-5 max-w-3xl text-2xl leading-tight md:text-4xl"
            >
              {profile.headline}
            </motion.p>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="text-fg-secondary mt-6 max-w-2xl text-base leading-7 md:text-lg"
            >
              {profile.intro}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 flex flex-wrap gap-2"
            >
              {heroBadges.map((badge) => (
                <span
                  key={badge}
                  className="border-border bg-bg-elevated/70 text-fg-secondary rounded border px-3 py-1.5 font-mono text-[11px] uppercase"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel mt-8 max-w-xl rounded p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded border border-white/15 bg-white/10">
                  <ShieldCheck size={18} aria-hidden />
                </div>
                <div>
                  <p className="text-fg-muted font-mono text-xs uppercase">Readiness Signal</p>
                  <p className="text-fg-secondary mt-1 text-sm leading-6">
                    Security+ in progress · Google Cybersecurity Certificate · Summer 2027
                    internships
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <HeroLink href="#featured" primary>
                View Featured Work
                <ArrowRight size={16} aria-hidden />
              </HeroLink>
              <HeroLink href="/world">
                <Gamepad2 size={16} aria-hidden />
                Enter Kenan World
              </HeroLink>
              {profile.resumeUrl ? (
                <HeroLink href={profile.resumeUrl}>
                  <Download size={16} aria-hidden />
                  Download Resume
                </HeroLink>
              ) : (
                <span
                  aria-disabled="true"
                  title="Resume PDF not added yet"
                  className="border-border text-fg-muted inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
                >
                  <Download size={16} aria-hidden />
                  Download Resume
                </span>
              )}
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
              </HeroLink>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="relative min-h-[520px] lg:min-h-[610px]"
            aria-label="Rotating stack of project screenshots"
          >
            <div className="premium-noise absolute inset-0 rounded border border-white/14 bg-white/[0.035]" />
            <div className="absolute inset-x-8 bottom-10 h-24 bg-white/28 blur-[80px]" />
            <div className="bg-bg/75 text-fg-muted absolute top-6 right-8 rounded border border-white/12 px-3 py-2 font-mono text-[10px] uppercase backdrop-blur">
              Real project media
            </div>
            {heroStack.map((item, index) => {
              const isReport = item.title.includes("Report");
              const transforms = [
                "left-2 top-12 rotate-[-6deg] lg:left-4",
                "left-[25%] top-24 rotate-[2deg]",
                "right-[6%] top-16 rotate-[-2deg]",
                "right-[18%] top-56 rotate-[5deg]",
              ];
              return (
                <motion.article
                  key={item.title}
                  animate={{ y: [0, index % 2 === 0 ? -10 : 10, 0] }}
                  transition={{
                    duration: 7 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.4,
                  }}
                  style={{ zIndex: 20 + index }}
                  className={`bg-bg-elevated/95 absolute w-[50%] overflow-hidden rounded border border-white/24 shadow-2xl shadow-black/70 ${transforms[index]}`}
                >
                  <div className="flex items-center justify-between border-b border-white/14 bg-white/[0.035] px-3 py-2">
                    <span className="text-fg-secondary font-mono text-[10px] uppercase">
                      {item.label}
                    </span>
                    <span className="flex gap-1.5">
                      <span className="size-1.5 rounded-full bg-white/35" />
                      <span className="size-1.5 rounded-full bg-white/20" />
                      <span className="size-1.5 rounded-full bg-white/10" />
                    </span>
                  </div>
                  <div className={isReport ? "aspect-[4/5]" : "aspect-[4/3]"}>
                    {item.media ? (
                      <Image
                        src={item.media.src}
                        alt={item.media.alt}
                        width={760}
                        height={620}
                        sizes="(min-width: 1024px) 420px, 70vw"
                        className="h-full w-full object-cover object-top brightness-110 contrast-125 grayscale"
                      />
                    ) : (
                      <div className="bg-bg-elevated text-fg-muted flex h-full items-center justify-center text-sm">
                        Media coming soon
                      </div>
                    )}
                  </div>
                  <div className="bg-bg border-t border-white/14 px-3 py-3">
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
