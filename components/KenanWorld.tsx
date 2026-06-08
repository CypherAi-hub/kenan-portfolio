"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Download,
  Github,
  Linkedin,
  Mail,
  Map,
  Maximize2,
  Trophy,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { certifications, experiences, profile, skillGroups } from "@/lib/data";
import { caseStudies, featuredProjects, projects, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

type EntityKind = "building" | "npc" | "object" | "collectible";
type DistrictId = "hometown" | "fofit" | "cyber" | "ai" | "career" | "museum";

type WorldEntity = {
  id: string;
  kind: EntityKind;
  district: DistrictId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  projectSlug?: string;
  collectibleLabel?: string;
  proof: string[];
  actionLabel?: string;
};

const WORLD = { width: 2360, height: 1540 };
const PLAYER = { width: 34, height: 46 };
const INTERACTION_DISTANCE = 128;

const districts = [
  {
    id: "hometown",
    title: "Hometown",
    subtitle: "Spawn Room",
    x: 40,
    y: 60,
    w: 600,
    h: 430,
    accent: "#f5f5f5",
    background: "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.025))",
  },
  {
    id: "fofit",
    title: "FoFit City",
    subtitle: "Product Campus",
    x: 700,
    y: 52,
    w: 880,
    h: 640,
    accent: "#76f4df",
    background: "linear-gradient(135deg, rgba(118,244,223,.22), rgba(255,255,255,.035))",
  },
  {
    id: "cyber",
    title: "Cyber City",
    subtitle: "SOC + Pentest Labs",
    x: 70,
    y: 570,
    w: 820,
    h: 710,
    accent: "#d9f5ff",
    background: "linear-gradient(135deg, rgba(120,190,255,.18), rgba(255,255,255,.025))",
  },
  {
    id: "ai",
    title: "AI District",
    subtitle: "Agent Labs",
    x: 930,
    y: 760,
    w: 900,
    h: 660,
    accent: "#e9e9e9",
    background: "linear-gradient(135deg, rgba(255,255,255,.15), rgba(118,244,223,.08))",
  },
  {
    id: "career",
    title: "Career City",
    subtitle: "Experience NPCs",
    x: 1650,
    y: 72,
    w: 610,
    h: 560,
    accent: "#ffffff",
    background: "linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.03))",
  },
  {
    id: "museum",
    title: "Achievement Museum",
    subtitle: "Proof Hall",
    x: 1690,
    y: 690,
    w: 590,
    h: 540,
    accent: "#f4f4f4",
    background: "linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.04))",
  },
] satisfies Array<{
  id: DistrictId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  background: string;
}>;

const entities: WorldEntity[] = [
  {
    id: "laptop",
    kind: "object",
    district: "hometown",
    title: "MacBook",
    subtitle: "Project Map",
    x: 170,
    y: 175,
    w: 86,
    h: 58,
    accent: "#ffffff",
    proof: [
      "Builder of FoFit, AgentRoom, SOC Monitor, Netwatch, AWS Image Label Generator, and multiple product experiments.",
      "Project data is pulled from the same portfolio archive recruiters can scan on the main site.",
      "Press R any time for the traditional recruiter summary.",
    ],
  },
  {
    id: "volleyball",
    kind: "object",
    district: "hometown",
    title: "Volleyball",
    subtitle: "Athlete Signal",
    x: 410,
    y: 145,
    w: 54,
    h: 54,
    accent: "#ffffff",
    proof: [
      "Maryville University student-athlete signal: discipline, reps, team standards, and performance mindset.",
      "The world frames athletics as context, not a fake technical claim.",
    ],
  },
  {
    id: "whiteboard",
    kind: "object",
    district: "hometown",
    title: "Whiteboard",
    subtitle: "Current Goals",
    x: 420,
    y: 292,
    w: 128,
    h: 74,
    accent: "#dadada",
    proof: [
      "Current mission: ship applied AI products, cybersecurity proof, cloud demos, and internship-ready case studies.",
      "Summer 2027 target: technology, cybersecurity, AI, cloud, and consulting internships.",
    ],
  },
  {
    id: "fofit-mobile",
    kind: "building",
    district: "fofit",
    title: "FoFit Mobile HQ",
    subtitle: "Main AI fitness app",
    x: 805,
    y: 155,
    w: 150,
    h: 122,
    accent: "#76f4df",
    projectSlug: "fofit",
    proof: [
      "Main mobile product proof: training, Cypher AI, workout logging, profile, nutrition, and product-system screenshots.",
      "Shows mobile app execution across React Native, Expo, TypeScript, Supabase, and OpenAI API direction.",
    ],
  },
  {
    id: "fofit-coach",
    kind: "building",
    district: "fofit",
    title: "FoFit Coach Center",
    subtitle: "Coach platform",
    x: 1030,
    y: 132,
    w: 158,
    h: 136,
    accent: "#b9fff2",
    projectSlug: "fofit-coach",
    proof: [
      "Team-facing platform direction for coaches, rosters, athlete delivery, and operational dashboard workflows.",
      "Proof target: B2B product thinking, not only consumer app polish.",
    ],
  },
  {
    id: "cypher-lab",
    kind: "building",
    district: "fofit",
    title: "Cypher AI Lab",
    subtitle: "Personalized training engine",
    x: 1280,
    y: 155,
    w: 170,
    h: 128,
    accent: "#ffffff",
    projectSlug: "fofit",
    proof: [
      "Cypher is the AI coaching layer: plan recommendations, workout context, and assistant-style product workflow.",
      "This area should keep evolving as the real AI architecture matures.",
    ],
  },
  {
    id: "marketplace",
    kind: "building",
    district: "fofit",
    title: "Marketplace",
    subtitle: "Business system",
    x: 825,
    y: 400,
    w: 154,
    h: 112,
    accent: "#d8d8d8",
    projectSlug: "fofit-website",
    proof: [
      "Represents product thinking beyond code: supplements, equipment, affiliate systems, and user purchase paths.",
      "Keep claims conservative and proof-backed as marketplace work develops.",
    ],
  },
  {
    id: "nutrition-lab",
    kind: "building",
    district: "fofit",
    title: "Nutrition Lab",
    subtitle: "Fuel workflows",
    x: 1110,
    y: 425,
    w: 142,
    h: 108,
    accent: "#bffff4",
    projectSlug: "fofit",
    proof: [
      "Shows FoFit fuel plan, meal library, photo meal estimate, and athlete nutrition workflow direction.",
      "Proof signal: product depth across training and recovery, not just a workout tracker.",
    ],
  },
  {
    id: "soc-monitor",
    kind: "building",
    district: "cyber",
    title: "SOC Monitor",
    subtitle: "Defensive console",
    x: 175,
    y: 715,
    w: 168,
    h: 126,
    accent: "#d9f5ff",
    projectSlug: "soc-monitor",
    proof: [
      "Defensive security simulation with analyst-style triage, packet investigation, MITRE context, and timeline review.",
      "Recruiter-safe: no real exploit instructions or sensitive operational data.",
    ],
  },
  {
    id: "netwatch",
    kind: "building",
    district: "cyber",
    title: "Netwatch Tower",
    subtitle: "Monitoring backend",
    x: 520,
    y: 690,
    w: 150,
    h: 180,
    accent: "#ffffff",
    projectSlug: "netwatch",
    proof: [
      "Realtime metrics, alerting, Supabase schema direction, and honest dashboard status.",
      "Current visual proof is architecture/docs-based until a finished dashboard screenshot exists.",
    ],
  },
  {
    id: "pentest-lab",
    kind: "building",
    district: "cyber",
    title: "Cyberlou Pentest Lab",
    subtitle: "Report exhibit",
    x: 310,
    y: 1010,
    w: 220,
    h: 130,
    accent: "#f5f5f5",
    projectSlug: "cyberlou-pentest-report",
    proof: [
      "A 49-page controlled-lab penetration testing report focused on evidence, severity, remediation, and communication.",
      "This is a reporting showcase, not a hacking tutorial.",
      "Public previews must remain safe and redacted.",
    ],
  },
  {
    id: "aws-generator",
    kind: "building",
    district: "cyber",
    title: "AWS Image Label Generator",
    subtitle: "Cloud ML pipeline",
    x: 640,
    y: 1018,
    w: 170,
    h: 120,
    accent: "#e8e8e8",
    projectSlug: "aws-image-label-generator",
    proof: [
      "Image upload to S3, AWS Rekognition labels, Python processing, and output visualization.",
      "Proof signal: practical cloud automation and explainable service boundaries.",
    ],
  },
  {
    id: "agentroom",
    kind: "building",
    district: "ai",
    title: "AgentRoom HQ",
    subtitle: "Mission control",
    x: 1045,
    y: 910,
    w: 190,
    h: 132,
    accent: "#ffffff",
    projectSlug: "agentroom",
    proof: [
      "Agent workflow visibility: commands, blockers, validation, screenshots, and live checkpoints.",
      "Proof signal: operational clarity for AI coding agents.",
    ],
  },
  {
    id: "omni",
    kind: "building",
    district: "ai",
    title: "Omni Labs",
    subtitle: "AI browser IDE",
    x: 1330,
    y: 900,
    w: 166,
    h: 130,
    accent: "#dcdcdc",
    projectSlug: "omni",
    proof: [
      "AI browser IDE direction for building, running, previewing, and publishing apps.",
      "Current screenshot is from the local IDE package with fallback surface notes.",
    ],
  },
  {
    id: "ruflo",
    kind: "building",
    district: "ai",
    title: "Ruflo OS",
    subtitle: "Agent operations",
    x: 1125,
    y: 1195,
    w: 150,
    h: 104,
    accent: "#cfcfcf",
    projectSlug: "ruflo-os",
    proof: [
      "Control-workspace proof from local README: LOOM agent setup, write guardrails, and content workflow.",
      "Not claimed as a finished app UI.",
    ],
  },
  {
    id: "stack-mode",
    kind: "building",
    district: "ai",
    title: "Stack Mode",
    subtitle: "Finance mobile prototype",
    x: 1525,
    y: 1170,
    w: 160,
    h: 116,
    accent: "#f2f2f2",
    projectSlug: "stack-mode",
    proof: [
      "Money-discipline mobile concept around debt payoff, savings buckets, paycheck splits, and Plaid-backed planning.",
      "Web capture is blocked by native Plaid SDK; simulator media should be added later.",
    ],
  },
  {
    id: "professor",
    kind: "npc",
    district: "career",
    title: "Professor NPC",
    subtitle: "Maryville Business Solutions",
    x: 1765,
    y: 205,
    w: 50,
    h: 68,
    accent: "#ffffff",
    proof: [
      "Student Consultant work: business-facing delivery, technical problem-solving, client communication, and risk fundamentals.",
      "Shows communication and consulting context beyond solo builds.",
    ],
  },
  {
    id: "it-manager",
    kind: "npc",
    district: "career",
    title: "IT Manager NPC",
    subtitle: "IST Management Services",
    x: 1970,
    y: 318,
    w: 50,
    h: 68,
    accent: "#d9d9d9",
    proof: [
      "Technology support work: troubleshooting, operational reliability, user assistance, and documentation habits.",
      "Useful proof for support, cloud, and consulting roles.",
    ],
  },
  {
    id: "ai-researcher",
    kind: "npc",
    district: "career",
    title: "AI Researcher NPC",
    subtitle: "Outlier AI",
    x: 2140,
    y: 220,
    w: 50,
    h: 68,
    accent: "#ffffff",
    proof: [
      "AI Training Specialist work: LLM evaluation, prompt quality, reasoning consistency, and model behavior feedback.",
      "Proof signal: AI quality sense, not just API usage.",
    ],
  },
  {
    id: "google-cert",
    kind: "building",
    district: "museum",
    title: "Google Cybersecurity Certificate",
    subtitle: "Completed",
    x: 1808,
    y: 800,
    w: 174,
    h: 108,
    accent: "#ffffff",
    proof: [
      "Google Cybersecurity Professional Certificate completed August 16, 2025.",
      "Displayed as a trophy artifact with supporting media in the portfolio.",
    ],
  },
  {
    id: "security-plus",
    kind: "building",
    district: "museum",
    title: "CompTIA Security+",
    subtitle: "In Progress",
    x: 2048,
    y: 812,
    w: 160,
    h: 104,
    accent: "#d0d0d0",
    proof: [
      "CompTIA Security+ in progress, expected September 2026.",
      "No completed-cert claim until it is actually earned.",
    ],
  },
  {
    id: "resume-terminal",
    kind: "building",
    district: "museum",
    title: "Resume Terminal",
    subtitle: "Recruiter Mode",
    x: 1930,
    y: 1055,
    w: 182,
    h: 108,
    accent: "#f5f5f5",
    proof: [
      "Opens the traditional recruiter summary: resume, projects, skills, certifications, GitHub, LinkedIn, and contact.",
      "Nobody has to play the world to understand the portfolio.",
    ],
    actionLabel: "Open Recruiter Mode",
  },
  {
    id: "shield-token",
    kind: "collectible",
    district: "cyber",
    title: "Security Shield",
    subtitle: "Proof Token",
    x: 780,
    y: 810,
    w: 38,
    h: 38,
    accent: "#ffffff",
    collectibleLabel: "Shield",
    proof: ["Unlocked proof: cybersecurity reporting and defensive workflow design."],
  },
  {
    id: "aws-token",
    kind: "collectible",
    district: "cyber",
    title: "AWS Badge",
    subtitle: "Proof Token",
    x: 125,
    y: 1130,
    w: 38,
    h: 38,
    accent: "#d9f5ff",
    collectibleLabel: "AWS",
    proof: ["Unlocked proof: cloud automation through S3, Rekognition, and Python output."],
  },
  {
    id: "fofit-token",
    kind: "collectible",
    district: "fofit",
    title: "FoFit Icon",
    subtitle: "Proof Token",
    x: 1490,
    y: 460,
    w: 38,
    h: 38,
    accent: "#76f4df",
    collectibleLabel: "FoFit",
    proof: ["Unlocked proof: main product ecosystem across app, coach, website, and media."],
  },
  {
    id: "ai-token",
    kind: "collectible",
    district: "ai",
    title: "AI Chip",
    subtitle: "Proof Token",
    x: 1730,
    y: 1035,
    w: 38,
    h: 38,
    accent: "#ffffff",
    collectibleLabel: "AI",
    proof: ["Unlocked proof: agent tools and AI product workflows."],
  },
  {
    id: "volleyball-token",
    kind: "collectible",
    district: "hometown",
    title: "Volleyball",
    subtitle: "Proof Token",
    x: 82,
    y: 376,
    w: 38,
    h: 38,
    accent: "#ffffff",
    collectibleLabel: "VB",
    proof: ["Unlocked proof: discipline, training mindset, and student-athlete identity."],
  },
  {
    id: "commit-token",
    kind: "collectible",
    district: "museum",
    title: "GitHub Commit",
    subtitle: "Proof Token",
    x: 2210,
    y: 1120,
    w: 38,
    h: 38,
    accent: "#ffffff",
    collectibleLabel: "Git",
    proof: ["Unlocked proof: consistent shipping across multiple repositories."],
  },
];

const spawn = { x: 300, y: 298 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distanceToEntity(player: { x: number; y: number }, entity: WorldEntity) {
  const playerCenter = { x: player.x + PLAYER.width / 2, y: player.y + PLAYER.height / 2 };
  const entityCenter = { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
  return Math.hypot(playerCenter.x - entityCenter.x, playerCenter.y - entityCenter.y);
}

function getProject(slug?: string): Project | undefined {
  if (!slug) return undefined;
  return projects.find((project) => project.slug === slug);
}

function PixelKenan() {
  return (
    <div className="relative h-[46px] w-[34px] drop-shadow-[0_12px_18px_rgba(0,0,0,.55)]">
      <div className="absolute top-0 left-[9px] h-4 w-4 bg-[#1b1b1b] shadow-[4px_0_0_#1b1b1b,-4px_2px_0_#1b1b1b]" />
      <div className="absolute top-[11px] left-[10px] h-3 w-4 border border-black/30 bg-[#8b5a3c]" />
      <div className="absolute top-[22px] left-[7px] h-4 w-5 bg-white shadow-[5px_0_0_#cfcfcf,-5px_0_0_#cfcfcf]" />
      <div className="absolute top-[36px] left-[8px] h-2 w-2 bg-[#202020] shadow-[12px_0_0_#202020]" />
      <div className="absolute top-[28px] left-[2px] h-2 w-2 bg-[#8b5a3c] shadow-[28px_0_0_#8b5a3c]" />
    </div>
  );
}

function PixelNpc({ accent }: { accent: string }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1 left-1/2 h-4 w-4 -translate-x-1/2 bg-[#202020]" />
      <div className="absolute top-4 left-1/2 h-3 w-5 -translate-x-1/2 border border-black/30 bg-[#8b5a3c]" />
      <div
        className="absolute top-7 left-1/2 h-7 w-7 -translate-x-1/2 border border-black/40"
        style={{ backgroundColor: accent }}
      />
      <div className="absolute bottom-1 left-[14px] h-3 w-2 bg-[#111] shadow-[12px_0_0_#111]" />
    </div>
  );
}

function BuildingSprite({ entity }: { entity: WorldEntity }) {
  const isTower = entity.id.includes("netwatch");
  const isLab = entity.title.toLowerCase().includes("lab");
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-x-2 top-0 h-7 border border-black/45"
        style={{
          background: `linear-gradient(90deg, ${entity.accent}, rgba(255,255,255,.88))`,
          clipPath: isLab ? "polygon(14% 0, 86% 0, 100% 100%, 0 100%)" : undefined,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 border border-black/50 bg-[#171717]"
        style={{ top: isTower ? 20 : 28 }}
      >
        <div className="grid h-full grid-cols-3 gap-2 p-3">
          {Array.from({ length: isTower ? 9 : 6 }).map((_, index) => (
            <span
              key={index}
              className="border border-white/12 bg-white/18"
              style={{ boxShadow: index % 3 === 0 ? `0 0 12px ${entity.accent}66` : undefined }}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-3 bottom-0 left-3 h-5 border border-black/60 bg-black" />
      <div
        className="absolute bottom-1 left-1/2 h-4 w-9 -translate-x-1/2 border border-white/10"
        style={{ backgroundColor: entity.accent }}
      />
    </div>
  );
}

function ObjectSprite({ entity }: { entity: WorldEntity }) {
  if (entity.id === "laptop") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-x-2 top-1 h-9 border border-white/20 bg-black">
          <span className="absolute top-2 left-3 h-1 w-8 bg-white/60" />
          <span className="absolute top-4 left-3 h-1 w-12 bg-white/30" />
          <span className="absolute top-6 left-3 h-1 w-6 bg-emerald-200/70" />
        </div>
        <div className="absolute right-0 bottom-2 left-0 h-3 border border-white/20 bg-white/25" />
      </div>
    );
  }
  if (entity.id === "volleyball") {
    return (
      <div className="h-full w-full rounded-full border-4 border-black bg-white shadow-[inset_8px_0_0_rgba(0,0,0,.16),inset_-8px_0_0_rgba(0,0,0,.09)]" />
    );
  }
  return (
    <div className="relative h-full w-full border-2 border-black bg-white p-2">
      <div className="h-full w-full border border-black/40 bg-black/10">
        <span className="m-2 block h-1 bg-black/45" />
        <span className="m-2 block h-1 w-2/3 bg-black/35" />
        <span className="m-2 block h-1 w-1/2 bg-emerald-200/80" />
      </div>
    </div>
  );
}

function CollectibleSprite({ entity, collected }: { entity: WorldEntity; collected: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center border-2 border-black bg-white font-mono text-[10px] font-bold text-black shadow-[0_0_18px_rgba(255,255,255,.32)]",
        collected && "opacity-25 grayscale",
      )}
      style={{ backgroundColor: entity.accent }}
    >
      {entity.collectibleLabel}
    </div>
  );
}

function EntitySprite({
  entity,
  active,
  collected,
  onInteract,
}: {
  entity: WorldEntity;
  active: boolean;
  collected: boolean;
  onInteract: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onInteract}
      aria-label={`Interact with ${entity.title}`}
      className={cn(
        "group absolute transition duration-200",
        active && "z-30 scale-105 drop-shadow-[0_0_24px_rgba(255,255,255,.22)]",
        collected && entity.kind === "collectible" && "pointer-events-none",
      )}
      style={{
        left: entity.x,
        top: entity.y,
        width: entity.w,
        height: entity.h,
        imageRendering: "pixelated",
      }}
    >
      {entity.kind === "building" && <BuildingSprite entity={entity} />}
      {entity.kind === "npc" && <PixelNpc accent={entity.accent} />}
      {entity.kind === "object" && <ObjectSprite entity={entity} />}
      {entity.kind === "collectible" && <CollectibleSprite entity={entity} collected={collected} />}
      <span className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-white shadow-lg group-hover:block md:block">
        {entity.title}
      </span>
    </button>
  );
}

function DistrictPanel({ district }: { district: (typeof districts)[number] }) {
  return (
    <section
      aria-label={`${district.title}: ${district.subtitle}`}
      className="absolute overflow-hidden border border-white/16 shadow-[inset_0_0_0_2px_rgba(0,0,0,.22),0_24px_90px_rgba(0,0,0,.34)]"
      style={{
        left: district.x,
        top: district.y,
        width: district.w,
        height: district.h,
        background: `${district.background}, repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 2px, transparent 2px 32px), repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, transparent 2px 32px)`,
        imageRendering: "pixelated",
      }}
    >
      <div className="absolute top-4 left-4 border border-white/18 bg-black/45 px-3 py-2 backdrop-blur">
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/55 uppercase">
          {district.subtitle}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-white">{district.title}</h2>
      </div>
      <div
        className="absolute right-0 bottom-0 h-28 w-28 opacity-30"
        style={{ background: `radial-gradient(circle, ${district.accent}, transparent 70%)` }}
      />
    </section>
  );
}

function ProjectMediaStrip({ project }: { project: Project }) {
  const media = project.media.slice(0, 4);
  if (media.length === 0) {
    return (
      <div className="border-border bg-bg-elevated text-fg-muted flex min-h-48 items-center justify-center rounded border text-sm">
        Media coming soon
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item) => (
        <div key={item.src} className="overflow-hidden rounded border border-white/12 bg-black">
          <div className="relative aspect-[16/10]">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 360px, 88vw"
              className="object-cover object-top grayscale transition duration-300 hover:grayscale-0"
            />
          </div>
          <div className="border-t border-white/10 px-3 py-2">
            <p className="text-fg-muted font-mono text-[10px] uppercase">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailOverlay({
  entity,
  project,
  onClose,
  onRecruiterMode,
}: {
  entity: WorldEntity;
  project?: Project;
  onClose: () => void;
  onRecruiterMode: () => void;
}) {
  const caseStudy = project?.caseStudySlug
    ? caseStudies.find((study) => study.slug === project.caseStudySlug)
    : undefined;

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/70 p-3 backdrop-blur-md md:items-center md:justify-center md:p-6">
      <article className="glass-panel max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
              {entity.subtitle}
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-5xl">{entity.title}</h2>
            {project && (
              <p className="text-fg-secondary mt-3 max-w-3xl text-sm leading-6 md:text-base">
                {project.longDescription}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close proof panel"
            className="text-fg-secondary flex size-10 shrink-0 items-center justify-center rounded border border-white/15 transition hover:border-white/40 hover:text-white"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-5">
            {project ? (
              <ProjectMediaStrip project={project} />
            ) : entity.id === "google-cert" ? (
              <ProjectMediaStrip
                project={
                  {
                    media: [
                      {
                        src: certifications[0].media ?? "",
                        alt: "Google Cybersecurity Professional Certificate proof",
                        label: "Certificate proof",
                        source: "local",
                        type: "image",
                      },
                    ],
                  } as Project
                }
              />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {entity.proof.map((line) => (
                <div key={line} className="rounded border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-fg-secondary text-sm leading-6">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            {project && (
              <div className="rounded border border-white/10 bg-black/35 p-4">
                <p className="text-fg-muted font-mono text-[10px] uppercase">Project Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-fg-secondary rounded border border-white/12 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {caseStudy && (
              <div className="rounded border border-white/10 bg-black/35 p-4">
                <p className="text-fg-muted font-mono text-[10px] uppercase">Case Study Signal</p>
                <p className="text-fg-secondary mt-2 text-sm leading-6">{caseStudy.summary}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {project?.githubUrl && (
                <a
                  href={project.githubUrl}
                  className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/20 px-3 font-mono text-xs transition hover:border-white/45 hover:text-white"
                >
                  <Github size={14} aria-hidden />
                  GitHub
                </a>
              )}
              {project?.liveUrl && (
                <a
                  href={project.liveUrl}
                  className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/20 px-3 font-mono text-xs transition hover:border-white/45 hover:text-white"
                >
                  <Maximize2 size={14} aria-hidden />
                  Live
                </a>
              )}
              {caseStudy && (
                <Link
                  href={`/case-studies/${caseStudy.slug}`}
                  className="hover:bg-accent-dim inline-flex h-10 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black transition"
                >
                  Case Study
                </Link>
              )}
              {entity.actionLabel && (
                <button
                  type="button"
                  onClick={onRecruiterMode}
                  className="hover:bg-accent-dim inline-flex h-10 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black transition"
                >
                  {entity.actionLabel}
                </button>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

function RecruiterMode({
  collectedCount,
  collectibleCount,
  onClose,
}: {
  collectedCount: number;
  collectibleCount: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-black/86 p-3 backdrop-blur-xl md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/15 px-3 font-mono text-xs transition hover:border-white/45 hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden />
            Portfolio
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Recruiter Mode"
            className="text-fg-secondary flex size-10 items-center justify-center rounded border border-white/15 transition hover:border-white/45 hover:text-white"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <section className="glass-panel rounded p-5 md:p-8">
          <p className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
            Recruiter Mode
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_.72fr]">
            <div>
              <h2 className="text-4xl font-semibold md:text-6xl">{profile.name}</h2>
              <p className="text-fg mt-3 text-xl leading-tight md:text-3xl">{profile.headline}</p>
              <p className="text-fg-secondary mt-5 max-w-3xl text-base leading-7">
                {profile.intro} Currently: {profile.currently}. Open to {profile.openTo}.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={profile.resumeUrl}
                  className="inline-flex h-11 items-center gap-2 rounded border border-white bg-white px-4 font-mono text-sm text-black"
                >
                  <Download size={16} aria-hidden />
                  Resume
                </a>
                <a
                  href={profile.github}
                  className="text-fg-secondary inline-flex h-11 items-center gap-2 rounded border border-white/20 px-4 font-mono text-sm"
                >
                  <Github size={16} aria-hidden />
                  GitHub
                </a>
                <a
                  href={profile.linkedin}
                  className="text-fg-secondary inline-flex h-11 items-center gap-2 rounded border border-white/20 px-4 font-mono text-sm"
                >
                  <Linkedin size={16} aria-hidden />
                  LinkedIn
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-fg-secondary inline-flex h-11 items-center gap-2 rounded border border-white/20 px-4 font-mono text-sm"
                >
                  <Mail size={16} aria-hidden />
                  Contact
                </a>
              </div>
            </div>
            <div className="rounded border border-white/10 bg-black/35 p-4">
              <p className="text-fg-muted font-mono text-[10px] uppercase">World Progress</p>
              <p className="mt-3 text-3xl font-semibold">
                {collectedCount} / {collectibleCount}{" "}
                <span className="text-fg-muted text-base">proof tokens</span>
              </p>
              <div className="mt-5 grid gap-2">
                {certifications.map((cert) => (
                  <div key={cert.name} className="rounded border border-white/10 p-3">
                    <p className="text-sm font-semibold">{cert.name}</p>
                    <p className="text-fg-muted mt-1 text-xs">
                      {cert.status} · {cert.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="glass-panel rounded p-5">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={16} aria-hidden />
              <h3 className="text-lg font-semibold">Featured Proof</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {featuredProjects.slice(0, 7).map((project) => (
                <a
                  key={project.slug}
                  href={project.githubUrl}
                  className="rounded border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/28"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{project.title}</p>
                      <p className="text-fg-secondary mt-1 text-sm leading-5">
                        {project.description}
                      </p>
                    </div>
                    <span className="text-fg-muted rounded border border-white/10 px-2 py-1 font-mono text-[10px]">
                      {project.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded p-5">
            <div className="flex items-center gap-2">
              <Award size={16} aria-hidden />
              <h3 className="text-lg font-semibold">Experience + Skills</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {experiences.map((experience) => (
                <div key={experience.org} className="rounded border border-white/10 p-3">
                  <p className="font-semibold">{experience.role}</p>
                  <p className="text-fg-muted text-sm">{experience.org}</p>
                  <p className="text-fg-secondary mt-2 text-sm leading-5">{experience.summary}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillGroups
                .flatMap((group) => group.skills.slice(0, 2))
                .map((skill) => (
                  <span
                    key={skill}
                    className="text-fg-secondary rounded border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[10px]"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MiniMap({
  player,
  activeEntity,
}: {
  player: { x: number; y: number };
  activeEntity?: WorldEntity;
}) {
  return (
    <div className="pointer-events-none absolute right-4 bottom-24 z-40 hidden w-52 rounded border border-white/12 bg-black/70 p-3 backdrop-blur md:block">
      <div className="mb-2 flex items-center gap-2">
        <Map size={12} aria-hidden />
        <p className="text-fg-muted font-mono text-[10px] uppercase">World Map</p>
      </div>
      <div className="relative aspect-[236/154] border border-white/10 bg-white/[0.03]">
        {districts.map((district) => (
          <span
            key={district.id}
            className="absolute border border-white/14 bg-white/10"
            style={{
              left: `${(district.x / WORLD.width) * 100}%`,
              top: `${(district.y / WORLD.height) * 100}%`,
              width: `${(district.w / WORLD.width) * 100}%`,
              height: `${(district.h / WORLD.height) * 100}%`,
            }}
          />
        ))}
        <span
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{
            left: `${(player.x / WORLD.width) * 100}%`,
            top: `${(player.y / WORLD.height) * 100}%`,
          }}
        />
      </div>
      <p className="text-fg-muted mt-2 min-h-4 truncate font-mono text-[10px]">
        {activeEntity ? `Near: ${activeEntity.title}` : "Find a building, NPC, or token"}
      </p>
    </div>
  );
}

function ControlPad({
  onDirection,
  onInteract,
}: {
  onDirection: (key: string, active: boolean) => void;
  onInteract: () => void;
}) {
  const buttonClass =
    "flex size-12 items-center justify-center rounded border border-white/15 bg-black/65 font-mono text-sm text-white backdrop-blur active:bg-white active:text-black";
  return (
    <div className="fixed right-3 bottom-3 left-3 z-50 flex items-end justify-between gap-3 md:hidden">
      <div className="grid grid-cols-3 gap-1">
        <span />
        <button
          type="button"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowUp", true)}
          onPointerUp={() => onDirection("ArrowUp", false)}
          onPointerCancel={() => onDirection("ArrowUp", false)}
        >
          ↑
        </button>
        <span />
        <button
          type="button"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowLeft", true)}
          onPointerUp={() => onDirection("ArrowLeft", false)}
          onPointerCancel={() => onDirection("ArrowLeft", false)}
        >
          ←
        </button>
        <button
          type="button"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowDown", true)}
          onPointerUp={() => onDirection("ArrowDown", false)}
          onPointerCancel={() => onDirection("ArrowDown", false)}
        >
          ↓
        </button>
        <button
          type="button"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowRight", true)}
          onPointerUp={() => onDirection("ArrowRight", false)}
          onPointerCancel={() => onDirection("ArrowRight", false)}
        >
          →
        </button>
      </div>
      <button
        type="button"
        onClick={onInteract}
        className="h-14 rounded border border-white bg-white px-5 font-mono text-sm text-black"
      >
        Interact
      </button>
    </div>
  );
}

export default function KenanWorld() {
  const [started, setStarted] = useState(false);
  const [player, setPlayer] = useState(spawn);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [focusedEntity, setFocusedEntity] = useState<WorldEntity | null>(null);
  const [collected, setCollected] = useState<string[]>([]);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const pressed = useRef<Record<string, boolean>>({});

  const collectibleCount = useMemo(
    () => entities.filter((entity) => entity.kind === "collectible").length,
    [],
  );

  const activeEntity = useMemo(() => {
    const candidates = entities
      .filter((entity) => !(entity.kind === "collectible" && collected.includes(entity.id)))
      .map((entity) => ({ entity, distance: distanceToEntity(player, entity) }))
      .sort((a, b) => a.distance - b.distance);
    const nearest = candidates[0];
    return nearest && nearest.distance < INTERACTION_DISTANCE ? nearest.entity : undefined;
  }, [player, collected]);

  const interact = useCallback(
    (entity = activeEntity) => {
      if (!entity) return;
      if (entity.kind === "collectible") {
        setCollected((current) =>
          current.includes(entity.id) ? current : [...current, entity.id],
        );
        setFocusedEntity(entity);
        return;
      }
      if (entity.id === "resume-terminal") {
        setRecruiterMode(true);
        return;
      }
      setFocusedEntity(entity);
    },
    [activeEntity],
  );

  const setDirection = useCallback((key: string, active: boolean) => {
    pressed.current[key] = active;
  }, []);

  useEffect(() => {
    function syncViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)
      ) {
        event.preventDefault();
        pressed.current[event.key] = true;
      }
      if (event.key === "Enter") {
        if (!started) {
          setStarted(true);
          return;
        }
        if (!focusedEntity && !recruiterMode) interact();
      }
      if (event.key.toLowerCase() === "e" && started && !focusedEntity && !recruiterMode) {
        interact();
      }
      if (event.key.toLowerCase() === "r" && started) {
        setRecruiterMode(true);
      }
      if (event.key === "Escape") {
        setFocusedEntity(null);
        setRecruiterMode(false);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressed.current[event.key] = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [focusedEntity, interact, recruiterMode, started]);

  useEffect(() => {
    if (!started || focusedEntity || recruiterMode) return;
    let frame = 0;
    const tick = () => {
      const keys = pressed.current;
      const dx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
      const dy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
      if (dx || dy) {
        const diagonal = dx && dy ? 0.72 : 1;
        setPlayer((current) => ({
          x: clamp(current.x + dx * 4.4 * diagonal, 20, WORLD.width - PLAYER.width - 20),
          y: clamp(current.y + dy * 4.4 * diagonal, 20, WORLD.height - PLAYER.height - 20),
        }));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [focusedEntity, recruiterMode, started]);

  const cameraX = clamp(player.x - viewport.width / 2, 0, WORLD.width - viewport.width);
  const cameraY = clamp(player.y - viewport.height / 2, 0, WORLD.height - viewport.height);

  return (
    <main className="text-fg relative h-dvh overflow-hidden bg-[#030303]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,.03),transparent_45%)]" />

      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-fg-secondary flex size-9 items-center justify-center rounded border border-white/15 transition hover:border-white/45 hover:text-white"
            >
              <ArrowLeft size={16} aria-hidden />
              <span className="sr-only">Back to portfolio</span>
            </Link>
            <div>
              <p className="text-fg-muted font-mono text-[10px] tracking-[0.2em] uppercase">
                Kenan World
              </p>
              <h1 className="text-sm font-semibold md:text-base">Explore the build path.</h1>
            </div>
          </div>
          <div className="text-fg-muted hidden items-center gap-4 font-mono text-[10px] uppercase md:flex">
            <span>Move: WASD / arrows</span>
            <span>Interact: E / Enter</span>
            <span>Recruiter: R</span>
          </div>
          <button
            type="button"
            onClick={() => setRecruiterMode(true)}
            className="inline-flex h-9 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black"
          >
            Recruiter Mode
          </button>
        </div>
      </header>

      <div className="absolute inset-0 pt-14">
        <div
          className="absolute will-change-transform"
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${-cameraX}px, ${-cameraY + 56}px)`,
            imageRendering: "pixelated",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 2px, transparent 2px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, transparent 2px 40px), linear-gradient(135deg, #070707, #0f0f0f)",
            }}
          />
          {districts.map((district) => (
            <DistrictPanel key={district.id} district={district} />
          ))}

          <div className="absolute top-[280px] left-[630px] h-[24px] w-[1160px] border-y border-white/12 bg-white/[0.045]" />
          <div className="absolute top-[690px] left-[800px] h-[24px] w-[980px] rotate-[18deg] border-y border-white/12 bg-white/[0.04]" />
          <div className="absolute top-[600px] left-[900px] h-[760px] w-[24px] border-x border-white/12 bg-white/[0.04]" />

          {entities.map((entity) => (
            <EntitySprite
              key={entity.id}
              entity={entity}
              active={activeEntity?.id === entity.id}
              collected={collected.includes(entity.id)}
              onInteract={() => interact(entity)}
            />
          ))}

          <div
            className="absolute z-40"
            style={{ left: player.x, top: player.y, width: PLAYER.width, height: PLAYER.height }}
          >
            <PixelKenan />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed top-16 left-3 z-40 max-w-[calc(100vw-1.5rem)] rounded border border-white/12 bg-black/65 p-3 backdrop-blur md:left-5">
        <p className="text-fg-muted font-mono text-[10px] uppercase">Current Objective</p>
        <p className="text-fg-secondary mt-1 max-w-md text-sm">
          Explore buildings, talk to NPCs, collect proof tokens, or press R for the recruiter view.
        </p>
      </div>

      {activeEntity && started && !focusedEntity && !recruiterMode && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded border border-white/18 bg-black/75 px-4 py-3 text-center backdrop-blur md:bottom-8">
          <p className="text-fg-muted font-mono text-[10px] uppercase">Nearby</p>
          <p className="text-sm font-semibold">{activeEntity.title}</p>
          <p className="text-fg-muted mt-1 font-mono text-[10px] uppercase">Press E / Enter</p>
        </div>
      )}

      <MiniMap player={player} activeEntity={activeEntity} />

      <div className="fixed bottom-4 left-4 z-40 hidden rounded border border-white/12 bg-black/65 p-3 backdrop-blur md:block">
        <div className="flex items-center gap-2">
          <Trophy size={14} aria-hidden />
          <p className="text-fg-muted font-mono text-[10px] uppercase">
            Proof Tokens {collected.length} / {collectibleCount}
          </p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {entities
            .filter((entity) => entity.kind === "collectible")
            .map((entity) => (
              <span
                key={entity.id}
                className={cn(
                  "size-3 border border-white/20",
                  collected.includes(entity.id) ? "bg-white" : "bg-white/10",
                )}
              />
            ))}
        </div>
      </div>

      <ControlPad onDirection={setDirection} onInteract={() => interact()} />

      {!started && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <section className="glass-panel grid max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded text-left md:grid-cols-[.82fr_1.18fr]">
            <div className="relative hidden min-h-[560px] border-r border-white/10 md:block">
              <Image
                src="/media/projects/fofit/fofit-journey-poster.webp"
                alt="FoFit journey poster used as Kenan World title-screen artwork"
                fill
                priority
                sizes="420px"
                className="object-cover object-top grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <p className="absolute bottom-5 left-5 max-w-xs font-mono text-[10px] tracking-[0.2em] text-white/62 uppercase">
                Real artifact · FoFit journey poster
              </p>
            </div>
            <div className="p-6 md:p-10">
              <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
                Hidden Portfolio Route
              </p>
              <h2 className="mt-4 text-5xl font-semibold md:text-7xl">Kenan World</h2>
              <p className="text-fg-secondary mt-5 max-w-2xl text-base leading-7 md:text-lg">
                Walk through a pixel-art operating system for Kenan Larry: FoFit City, Cyber City,
                AI District, Career City, and the Achievement Museum. Every interaction reveals real
                portfolio proof.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="hover:bg-accent-dim inline-flex h-12 items-center rounded border border-white bg-white px-5 font-mono text-sm text-black transition"
                >
                  Press Enter To Start
                </button>
                <button
                  type="button"
                  onClick={() => setRecruiterMode(true)}
                  className="text-fg-secondary inline-flex h-12 items-center rounded border border-white/20 px-5 font-mono text-sm transition hover:border-white/45 hover:text-white"
                >
                  Open Recruiter Mode
                </button>
              </div>
              <div className="text-fg-muted mt-8 grid gap-2 border-t border-white/10 pt-5 font-mono text-[10px] uppercase sm:grid-cols-3">
                <span>Move: WASD / arrows</span>
                <span>Interact: E / Enter</span>
                <span>Recruiter: R</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {focusedEntity && (
        <DetailOverlay
          entity={focusedEntity}
          project={getProject(focusedEntity.projectSlug)}
          onClose={() => setFocusedEntity(null)}
          onRecruiterMode={() => setRecruiterMode(true)}
        />
      )}

      {recruiterMode && (
        <RecruiterMode
          collectedCount={collected.length}
          collectibleCount={collectibleCount}
          onClose={() => setRecruiterMode(false)}
        />
      )}
    </main>
  );
}
