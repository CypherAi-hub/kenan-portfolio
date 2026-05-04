"use client";
import { motion } from "motion/react";
import { writeups } from "@/lib/data";
import { writeupReveal, viewport } from "@/lib/motion";
import AccentLink from "@/components/ui/AccentLink";

export default function SecurityWriteups() {
  return (
    <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
      {writeups.map((w, i) => (
        <motion.a
          key={w.slug}
          href={w.href}
          custom={i}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={writeupReveal}
          className="group block rounded-xl border border-border bg-bg-elevated/40 p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40"
        >
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
            <span className="text-accent">{w.index}</span>
            <span>—</span>
            <span>{w.category}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-[-0.01em] transition-colors group-hover:text-accent">
            {w.title}
          </h3>
          <p className="mt-2 text-sm leading-[1.55] text-fg-secondary">{w.summary}</p>
          <div className="mt-4">
            <AccentLink href={w.href}>Read writeup</AccentLink>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
