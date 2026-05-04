"use client";
import { motion } from "motion/react";
import { cardReveal, viewport } from "@/lib/motion";
import type { Project } from "@/lib/data";
import StatusPill from "@/components/ui/StatusPill";
import StackPill from "@/components/ui/StackPill";
import AccentLink from "@/components/ui/AccentLink";
import FoFitVisual from "@/components/visuals/FoFitVisual";
import CypherOSVisual from "@/components/visuals/CypherOSVisual";
import UltraFlipsVisual from "@/components/visuals/UltraFlipsVisual";
import NetwatchVisual from "@/components/visuals/NetwatchVisual";
import AWSVisual from "@/components/visuals/AWSVisual";

const visuals = {
  fofit: FoFitVisual,
  cypher: CypherOSVisual,
  ultraflips: UltraFlipsVisual,
  netwatch: NetwatchVisual,
  aws: AWSVisual,
};

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Visual = visuals[project.visual];
  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={cardReveal}
      className="group relative grid grid-cols-1 gap-8 overflow-hidden rounded-xl border border-border bg-bg-elevated/40 p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-accent/40 hover:bg-bg-elevated/70 lg:grid-cols-12 lg:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 group-hover:[animation:scan_0.8s_ease-out]"
      />

      <div className="order-2 lg:order-1 lg:col-span-5">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
          <span className="text-accent transition-colors group-hover:text-accent">
            {project.index}
          </span>
          <span>—</span>
          <span>{project.category}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">{project.title}</h3>
          <StatusPill status={project.status} />
        </div>
        <p className="mt-3 leading-[1.55] text-fg-secondary">{project.blurb}</p>
        <p className="mt-4 text-sm leading-[1.6] text-fg-muted">{project.body}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <StackPill key={s}>{s}</StackPill>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {project.links.live && (
            <AccentLink href={project.links.live} external>
              live ↗
            </AccentLink>
          )}
          {project.links.github && (
            <AccentLink href={project.links.github} external>
              github ↗
            </AccentLink>
          )}
          {project.links.case && <AccentLink href={project.links.case}>case study</AccentLink>}
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-7">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-bg">
          <Visual />
        </div>
      </div>
    </motion.article>
  );
}
