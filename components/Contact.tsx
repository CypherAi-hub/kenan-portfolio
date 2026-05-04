"use client";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { heroSequence } from "@/lib/motion";

const HEAD = "LET'S BUILD.".split("");

export default function Contact() {
  return (
    <div className="mt-16">
      <motion.h2
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={heroSequence.container}
        className="font-semibold leading-[0.95] tracking-[-0.04em]"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        <span className="sr-only">Let&rsquo;s build.</span>
        <span aria-hidden className="flex flex-wrap">
          {HEAD.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden" style={{ lineHeight: 0.95 }}>
              <motion.span variants={heroSequence.letter} className="inline-block">
                {ch === " " ? " " : ch}
              </motion.span>
            </span>
          ))}
        </span>
      </motion.h2>
      <ul className="mt-12 grid max-w-[640px] gap-y-4 sm:grid-cols-2">
        {[
          ["EMAIL", `mailto:${profile.email}`, profile.email],
          ["GITHUB", profile.github, "github.com/CypherAi-hub"],
          ["LINKEDIN", profile.linkedin, "in/kenan-larry"],
          ["FOFIT", "https://fofit.app", "fofit.app"],
        ].map(([label, href, display]) => (
          <li key={label} className="group">
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="relative flex items-center gap-4 py-3 pl-4 transition-colors hover:text-accent"
            >
              <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-accent transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-6" />
              <span className="w-20 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                {label}
              </span>
              <span className="font-mono text-sm">{display}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
