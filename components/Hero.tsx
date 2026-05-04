"use client";
import { motion } from "motion/react";
import { heroSequence } from "@/lib/motion";
import { profile } from "@/lib/data";
import GradientMesh from "@/components/effects/GradientMesh";
import GrainOverlay from "@/components/effects/GrainOverlay";
import AccentLink from "@/components/ui/AccentLink";

const NAME = profile.name.split("");

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden pt-32 pb-24">
      <GradientMesh />
      <GrainOverlay />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
        }}
      />

      <motion.div
        initial="initial"
        animate="animate"
        variants={heroSequence.container}
        className="relative"
      >
        <h1
          className="font-sans font-semibold leading-[0.95] tracking-[-0.04em]"
          style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
        >
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden className="flex flex-wrap">
            {NAME.map((ch, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden"
                style={{ lineHeight: 0.95 }}
              >
                <motion.span variants={heroSequence.letter} className="inline-block">
                  {ch === " " ? " " : ch}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.div
          variants={heroSequence.fadeUp}
          className="mt-6 flex items-center gap-2 font-mono text-sm text-fg-secondary md:text-base"
        >
          <span className="tabular">{profile.tagline}</span>
          <span
            className="inline-block h-[1em] w-[0.6ch] bg-accent align-middle"
            style={{ animation: "blink 1.1s step-end infinite" }}
          />
        </motion.div>

        <motion.div
          variants={heroSequence.fadeUp}
          className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-fg-secondary"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inset-0 rounded-full bg-accent"
              style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
            />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          available · open to internships & founding-engineering
        </motion.div>

        <motion.p
          variants={heroSequence.fadeUp}
          className="mt-10 max-w-[58ch] text-lg leading-[1.65] text-fg-secondary"
        >
          {profile.intro}
        </motion.p>

        <motion.div
          variants={heroSequence.fadeUp}
          className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
        >
          <AccentLink href="#work">selected work</AccentLink>
          <AccentLink href="#contact">get in touch</AccentLink>
          <AccentLink href={profile.github} external>
            github ↗
          </AccentLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
