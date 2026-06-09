"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Download,
  Github,
  Images,
  Layers,
  Linkedin,
  Mail,
  Map as MapIcon,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { certifications, experiences, profile, skillGroups } from "@/lib/data";
import {
  caseStudies,
  featuredProjects,
  projects,
  type Project,
  type ProjectMedia,
} from "@/data/projects";
import { cn } from "@/lib/utils";

type EntityKind = "building" | "npc" | "object" | "collectible";
type DistrictId = "hometown" | "fofit" | "cyber" | "ai" | "career" | "museum";
type PropKind =
  | "tree"
  | "planter"
  | "bench"
  | "lamp"
  | "sign"
  | "terminal"
  | "trophy"
  | "server"
  | "antenna"
  | "kiosk"
  | "field"
  | "lab-light";
type Facing = "down" | "up" | "left" | "right";

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

type District = {
  id: DistrictId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  secondary: string;
  border: string;
  ground: string;
  path: string;
  glow: string;
  background: string;
};

type WorldProp = {
  id: string;
  kind: PropKind;
  district: DistrictId;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  label?: string;
};

type WorldBillboard = {
  id: string;
  entityId: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variant: "wide" | "phone" | "report" | "terminal";
};

type Achievement = {
  id: string;
  title: string;
  detail: string;
  accent: string;
  unlocked: boolean;
};

type GuidedStep = {
  id: string;
  title: string;
  detail: string;
  targetIds: string[];
  complete: boolean;
};

type DistrictTravelPoint = {
  x: number;
  y: number;
  label: string;
};

type ShowroomPreset = {
  room: string;
  visualMode: "mobile" | "dashboard" | "security" | "cloud" | "agent" | "report" | "proof";
  proofType: string;
  proofLine: string;
  workflow: string[];
  recruiterRead: string;
};

type WorldSaveState = {
  collected: string[];
  unlockedProof: string[];
  visitedDistricts: DistrictId[];
  recruiterViewed: boolean;
  player: { x: number; y: number };
};

const WORLD = { width: 2360, height: 1540 };
const PLAYER = { width: 34, height: 46 };
const INTERACTION_DISTANCE = 168;
const WORLD_SAVE_KEY = "kenan-world-progress-v1";

const districts = [
  {
    id: "hometown",
    title: "Hometown",
    subtitle: "Spawn Room",
    x: 40,
    y: 60,
    w: 600,
    h: 430,
    accent: "#f3d7a6",
    secondary: "#cda169",
    border: "rgba(243,215,166,.42)",
    ground: "#221d18",
    path: "#7b684f",
    glow: "rgba(243,215,166,.22)",
    background:
      "linear-gradient(135deg, rgba(243,215,166,.20), rgba(78,64,48,.18) 42%, rgba(255,255,255,.035))",
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
    secondary: "#38d9bb",
    border: "rgba(118,244,223,.46)",
    ground: "#07312f",
    path: "#2d9a8d",
    glow: "rgba(118,244,223,.26)",
    background:
      "linear-gradient(135deg, rgba(118,244,223,.25), rgba(18,92,84,.18) 50%, rgba(255,255,255,.035))",
  },
  {
    id: "cyber",
    title: "Cyber City",
    subtitle: "SOC + Pentest Labs",
    x: 70,
    y: 570,
    w: 820,
    h: 710,
    accent: "#78c7ff",
    secondary: "#2f6f9f",
    border: "rgba(120,199,255,.42)",
    ground: "#071625",
    path: "#23445f",
    glow: "rgba(120,199,255,.22)",
    background:
      "linear-gradient(135deg, rgba(31,89,132,.36), rgba(5,18,32,.22) 52%, rgba(255,255,255,.025))",
  },
  {
    id: "ai",
    title: "AI District",
    subtitle: "Agent Labs",
    x: 930,
    y: 760,
    w: 900,
    h: 660,
    accent: "#bfa7ff",
    secondary: "#7257d8",
    border: "rgba(191,167,255,.42)",
    ground: "#16102e",
    path: "#4f3e92",
    glow: "rgba(191,167,255,.22)",
    background:
      "linear-gradient(135deg, rgba(113,86,214,.30), rgba(23,16,48,.22) 48%, rgba(118,244,223,.06))",
  },
  {
    id: "career",
    title: "Career City",
    subtitle: "Experience NPCs",
    x: 1650,
    y: 72,
    w: 610,
    h: 560,
    accent: "#e8d7c4",
    secondary: "#9c8468",
    border: "rgba(232,215,196,.38)",
    ground: "#201f1e",
    path: "#6d645c",
    glow: "rgba(232,215,196,.18)",
    background:
      "linear-gradient(135deg, rgba(232,215,196,.18), rgba(72,68,62,.16) 45%, rgba(255,255,255,.03))",
  },
  {
    id: "museum",
    title: "Achievement Museum",
    subtitle: "Proof Hall",
    x: 1690,
    y: 690,
    w: 590,
    h: 540,
    accent: "#f6d777",
    secondary: "#d0d8e8",
    border: "rgba(246,215,119,.42)",
    ground: "#191919",
    path: "#8c7a44",
    glow: "rgba(246,215,119,.22)",
    background:
      "linear-gradient(135deg, rgba(246,215,119,.18), rgba(210,216,232,.10) 45%, rgba(255,255,255,.04))",
  },
] satisfies District[];

const districtById = new Map(districts.map((district) => [district.id, district]));

const districtTravelPoints: Record<DistrictId, DistrictTravelPoint> = {
  hometown: { x: 300, y: 298, label: "Spawn Room" },
  fofit: { x: 758, y: 318, label: "FoFit City Gate" },
  cyber: { x: 132, y: 660, label: "SOC Avenue" },
  ai: { x: 972, y: 860, label: "Agent Lab Gate" },
  career: { x: 1718, y: 190, label: "Career Plaza" },
  museum: { x: 1748, y: 742, label: "Proof Hall Steps" },
};

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
    id: "larry-investments",
    kind: "building",
    district: "career",
    title: "Larry Investments HQ",
    subtitle: "Company vision",
    x: 1848,
    y: 438,
    w: 160,
    h: 116,
    accent: "#f1e4d4",
    proof: [
      "Honest venture umbrella for FoFit and a long-term portfolio of applied software products.",
      "Current proof stays tied to real builds: fitness-tech, AI tools, cybersecurity projects, cloud automation, and business-facing software.",
      "The goal is not fake company scale; it is founder direction, product taste, and consistent shipping.",
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

const worldProps: WorldProp[] = [
  {
    id: "room-rug",
    kind: "field",
    district: "hometown",
    x: 128,
    y: 250,
    w: 220,
    h: 116,
    color: "#7b5e43",
  },
  {
    id: "room-bed",
    kind: "bench",
    district: "hometown",
    x: 78,
    y: 132,
    w: 78,
    h: 42,
    color: "#9a7b58",
    label: "rest",
  },
  {
    id: "room-plant",
    kind: "planter",
    district: "hometown",
    x: 540,
    y: 405,
    w: 52,
    h: 52,
    color: "#a7d98b",
  },
  {
    id: "hometown-lamp",
    kind: "lamp",
    district: "hometown",
    x: 545,
    y: 112,
    w: 28,
    h: 70,
    color: "#f3d7a6",
  },
  {
    id: "fofit-track",
    kind: "field",
    district: "fofit",
    x: 744,
    y: 545,
    w: 460,
    h: 58,
    color: "#26bda7",
    label: "training lane",
  },
  {
    id: "fofit-sign",
    kind: "sign",
    district: "fofit",
    x: 730,
    y: 105,
    w: 118,
    h: 48,
    color: "#76f4df",
    label: "FoFit City",
  },
  {
    id: "fofit-planter-1",
    kind: "planter",
    district: "fofit",
    x: 985,
    y: 520,
    w: 58,
    h: 58,
    color: "#9df7d6",
  },
  {
    id: "fofit-planter-2",
    kind: "planter",
    district: "fofit",
    x: 1410,
    y: 570,
    w: 58,
    h: 58,
    color: "#9df7d6",
  },
  {
    id: "fofit-kiosk",
    kind: "kiosk",
    district: "fofit",
    x: 1335,
    y: 405,
    w: 82,
    h: 70,
    color: "#baffef",
    label: "Market",
  },
  {
    id: "cyber-server-1",
    kind: "server",
    district: "cyber",
    x: 118,
    y: 635,
    w: 46,
    h: 96,
    color: "#78c7ff",
  },
  {
    id: "cyber-server-2",
    kind: "server",
    district: "cyber",
    x: 720,
    y: 625,
    w: 46,
    h: 96,
    color: "#78c7ff",
  },
  {
    id: "cyber-antenna",
    kind: "antenna",
    district: "cyber",
    x: 708,
    y: 925,
    w: 82,
    h: 96,
    color: "#9bd8ff",
  },
  {
    id: "cyber-terminal",
    kind: "terminal",
    district: "cyber",
    x: 210,
    y: 940,
    w: 76,
    h: 52,
    color: "#78c7ff",
    label: "SIEM",
  },
  {
    id: "ai-light-1",
    kind: "lab-light",
    district: "ai",
    x: 960,
    y: 840,
    w: 90,
    h: 90,
    color: "#bfa7ff",
  },
  {
    id: "ai-light-2",
    kind: "lab-light",
    district: "ai",
    x: 1710,
    y: 1260,
    w: 90,
    h: 90,
    color: "#8ee8ff",
  },
  {
    id: "ai-terminal",
    kind: "terminal",
    district: "ai",
    x: 1378,
    y: 1110,
    w: 88,
    h: 58,
    color: "#bfa7ff",
    label: "Plan -> Build",
  },
  {
    id: "career-fountain",
    kind: "trophy",
    district: "career",
    x: 1880,
    y: 130,
    w: 72,
    h: 72,
    color: "#e8d7c4",
  },
  {
    id: "career-bench-1",
    kind: "bench",
    district: "career",
    x: 1730,
    y: 420,
    w: 90,
    h: 36,
    color: "#9c8468",
  },
  {
    id: "career-bench-2",
    kind: "bench",
    district: "career",
    x: 2045,
    y: 450,
    w: 90,
    h: 36,
    color: "#9c8468",
  },
  {
    id: "museum-torch-1",
    kind: "lamp",
    district: "museum",
    x: 1730,
    y: 760,
    w: 28,
    h: 82,
    color: "#f6d777",
  },
  {
    id: "museum-torch-2",
    kind: "lamp",
    district: "museum",
    x: 2220,
    y: 760,
    w: 28,
    h: 82,
    color: "#f6d777",
  },
  {
    id: "museum-runner",
    kind: "trophy",
    district: "museum",
    x: 1888,
    y: 948,
    w: 72,
    h: 72,
    color: "#f6d777",
    label: "Proof",
  },
];

const worldBillboards: WorldBillboard[] = [
  {
    id: "fofit-mobile-proof-wall",
    entityId: "fofit-mobile",
    title: "FoFit app flow",
    subtitle: "mobile proof wall",
    x: 966,
    y: 300,
    w: 126,
    h: 188,
    variant: "phone",
  },
  {
    id: "fofit-coach-proof-wall",
    entityId: "fofit-coach",
    title: "Coach dashboard",
    subtitle: "team product surface",
    x: 1214,
    y: 318,
    w: 214,
    h: 126,
    variant: "wide",
  },
  {
    id: "soc-monitor-proof-wall",
    entityId: "soc-monitor",
    title: "SOC console",
    subtitle: "defensive workflow",
    x: 385,
    y: 650,
    w: 196,
    h: 116,
    variant: "terminal",
  },
  {
    id: "pentest-proof-wall",
    entityId: "pentest-lab",
    title: "Pentest report",
    subtitle: "safe redacted preview",
    x: 548,
    y: 1010,
    w: 150,
    h: 118,
    variant: "report",
  },
  {
    id: "aws-proof-wall",
    entityId: "aws-generator",
    title: "AWS output",
    subtitle: "rekognition labels",
    x: 706,
    y: 1164,
    w: 148,
    h: 94,
    variant: "wide",
  },
  {
    id: "agentroom-proof-wall",
    entityId: "agentroom",
    title: "Agent workflow",
    subtitle: "mission control proof",
    x: 1262,
    y: 1048,
    w: 248,
    h: 138,
    variant: "terminal",
  },
  {
    id: "portfolio-proof-wall",
    entityId: "resume-terminal",
    title: "Recruiter summary",
    subtitle: "fast scan mode",
    x: 1744,
    y: 1056,
    w: 156,
    h: 98,
    variant: "wide",
  },
  {
    id: "certificate-proof-wall",
    entityId: "google-cert",
    title: "Google Cybersecurity",
    subtitle: "certificate proof",
    x: 2004,
    y: 944,
    w: 172,
    h: 120,
    variant: "report",
  },
];

const unlockableEntityIds = entities
  .filter((entity) => entity.kind !== "collectible")
  .map((entity) => entity.id);

const entityById = new Map(entities.map((entity) => [entity.id, entity]));

function countUnlocked(ids: string[], proofSet: Set<string>) {
  return ids.filter((id) => proofSet.has(id)).length;
}

function getAchievements({
  collected,
  unlockedProof,
  visitedDistricts,
  recruiterViewed,
}: {
  collected: string[];
  unlockedProof: string[];
  visitedDistricts: DistrictId[];
  recruiterViewed: boolean;
}): Achievement[] {
  const proofSet = new Set(unlockedProof);
  const productStops = ["fofit-mobile", "fofit-coach", "cypher-lab"];
  const cyberStops = ["soc-monitor", "netwatch", "pentest-lab", "aws-generator"];
  const agentStops = ["agentroom", "omni", "ruflo", "stack-mode"];

  return [
    {
      id: "product-ecosystem",
      title: "Product Ecosystem",
      detail: "FoFit Mobile, Coach Center, and Cypher AI Lab reviewed.",
      accent: "#76f4df",
      unlocked: productStops.every((id) => proofSet.has(id)),
    },
    {
      id: "cyber-proof",
      title: "Cyber Proof",
      detail: "Two cyber, cloud, or report proof stops reviewed.",
      accent: "#78c7ff",
      unlocked: countUnlocked(cyberStops, proofSet) >= 2,
    },
    {
      id: "agent-workflow",
      title: "Agent Workflow",
      detail: "Two AI or agent workflow labs reviewed.",
      accent: "#bfa7ff",
      unlocked: countUnlocked(agentStops, proofSet) >= 2,
    },
    {
      id: "founder-signal",
      title: "Founder Signal",
      detail: "Larry Investments HQ and venture direction reviewed.",
      accent: "#f3d7a6",
      unlocked: proofSet.has("larry-investments"),
    },
    {
      id: "proof-collector",
      title: "Proof Collector",
      detail: "Three proof tokens collected around the world.",
      accent: "#ffffff",
      unlocked: collected.length >= 3,
    },
    {
      id: "world-explorer",
      title: "World Explorer",
      detail: "Three districts discovered through movement.",
      accent: "#d5d5d5",
      unlocked: visitedDistricts.length >= 3,
    },
    {
      id: "recruiter-ready",
      title: "Recruiter Ready",
      detail: "Traditional recruiter summary opened.",
      accent: "#f6d777",
      unlocked: recruiterViewed || proofSet.has("resume-terminal"),
    },
  ];
}

function getGuideSteps({
  unlockedProof,
  recruiterViewed,
}: {
  unlockedProof: string[];
  recruiterViewed: boolean;
}): GuidedStep[] {
  const proofSet = new Set(unlockedProof);

  return [
    {
      id: "wake",
      title: "Wake the build map",
      detail: "Start with the MacBook in Hometown. It explains why this world exists.",
      targetIds: ["laptop"],
      complete: proofSet.has("laptop") || proofSet.has("whiteboard"),
    },
    {
      id: "fofit",
      title: "Enter FoFit City",
      detail: "Open FoFit Mobile HQ first; it is the strongest product proof room.",
      targetIds: ["fofit-mobile"],
      complete: proofSet.has("fofit-mobile"),
    },
    {
      id: "cyber",
      title: "Open cyber proof",
      detail: "Review SOC Monitor or the Cyberlou lab to see the security story.",
      targetIds: ["soc-monitor", "pentest-lab"],
      complete: proofSet.has("soc-monitor") || proofSet.has("pentest-lab"),
    },
    {
      id: "agent",
      title: "Inspect agent tooling",
      detail: "Visit AgentRoom HQ to connect the AI workflow side of the portfolio.",
      targetIds: ["agentroom"],
      complete: proofSet.has("agentroom"),
    },
    {
      id: "career",
      title: "Meet the founder signal",
      detail: "Visit Larry Investments HQ to see the company and operating-system layer.",
      targetIds: ["larry-investments"],
      complete: proofSet.has("larry-investments"),
    },
    {
      id: "handoff",
      title: "Generate recruiter summary",
      detail: "End at the Resume Terminal or press R for the traditional summary.",
      targetIds: ["resume-terminal"],
      complete: recruiterViewed || proofSet.has("resume-terminal"),
    },
  ];
}

function getDistrictProgress({
  districtId,
  unlockedProof,
  collected,
}: {
  districtId: DistrictId;
  unlockedProof: string[];
  collected: string[];
}) {
  const districtEntities = entities.filter((entity) => entity.district === districtId);
  const proofStops = districtEntities.filter((entity) => entity.kind !== "collectible");
  const tokenStops = districtEntities.filter((entity) => entity.kind === "collectible");
  const unlockedStops = proofStops.filter((entity) => unlockedProof.includes(entity.id));
  const collectedTokens = tokenStops.filter((entity) => collected.includes(entity.id));
  const nextStop = proofStops.find((entity) => !unlockedProof.includes(entity.id));

  return {
    proofTotal: proofStops.length,
    proofUnlocked: unlockedStops.length,
    tokenTotal: tokenStops.length,
    tokenCollected: collectedTokens.length,
    nextStop,
  };
}

function uniqueKnownIds(values: string[], knownIds: Set<string>) {
  return Array.from(new Set(values.filter((value) => knownIds.has(value))));
}

function isDistrictId(value: string): value is DistrictId {
  return districts.some((district) => district.id === value);
}

function normalizeSavedWorldState(value: unknown): WorldSaveState | null {
  if (!value || typeof value !== "object") return null;

  const saved = value as Partial<WorldSaveState>;
  const collectibleIds = new Set(
    entities.filter((entity) => entity.kind === "collectible").map((entity) => entity.id),
  );
  const proofIds = new Set(unlockableEntityIds);
  const savedPlayer = saved.player;

  return {
    collected: Array.isArray(saved.collected)
      ? uniqueKnownIds(saved.collected, collectibleIds)
      : [],
    unlockedProof: Array.isArray(saved.unlockedProof)
      ? uniqueKnownIds(saved.unlockedProof, proofIds)
      : [],
    visitedDistricts: Array.isArray(saved.visitedDistricts)
      ? Array.from(new Set(saved.visitedDistricts.filter(isDistrictId)))
      : ["hometown"],
    recruiterViewed: Boolean(saved.recruiterViewed),
    player:
      savedPlayer && typeof savedPlayer.x === "number" && typeof savedPlayer.y === "number"
        ? {
            x: clamp(savedPlayer.x, 20, WORLD.width - PLAYER.width - 20),
            y: clamp(savedPlayer.y, 20, WORLD.height - PLAYER.height - 20),
          }
        : spawn,
  };
}

const showroomPresets: Record<string, ShowroomPreset> = {
  "fofit-mobile": {
    room: "Mobile Product HQ",
    visualMode: "mobile",
    proofType: "AI Product Engineering",
    proofLine:
      "The flagship product room: mobile training, Cypher support, nutrition, and athlete workflow proof.",
    workflow: ["Athlete context", "AI coach prompt", "Workout logging", "Fuel workflow"],
    recruiterRead:
      "Shows product depth, mobile execution, and the ability to move from idea to usable app surfaces.",
  },
  "fofit-coach": {
    room: "Coach Command Center",
    visualMode: "dashboard",
    proofType: "Dashboard Product UX",
    proofLine:
      "Team-facing FoFit proof: coach dashboard direction, roster thinking, and B2B product surface.",
    workflow: ["Roster view", "Athlete delivery", "Programming dashboard", "Team operations"],
    recruiterRead: "Shows FoFit is a product ecosystem, not a one-screen app concept.",
  },
  "cypher-lab": {
    room: "Cypher AI Lab",
    visualMode: "mobile",
    proofType: "AI Product Workflow",
    proofLine:
      "The AI layer room: screenshots and proof around recommendation, coaching, and assistant-style workflows.",
    workflow: ["Context intake", "Training recommendation", "User confirmation", "Workout handoff"],
    recruiterRead:
      "Shows AI is embedded in a product loop instead of being treated as a generic chat box.",
  },
  marketplace: {
    room: "FoFit Commerce Row",
    visualMode: "dashboard",
    proofType: "Business System Thinking",
    proofLine:
      "A product-business room for marketplace, affiliate, waitlist, and product-site surfaces.",
    workflow: ["Landing intent", "Product browse", "Market proof", "Conversion path"],
    recruiterRead: "Shows business-facing thinking around product distribution and user journeys.",
  },
  "nutrition-lab": {
    room: "Fuel Systems Lab",
    visualMode: "mobile",
    proofType: "Product Depth",
    proofLine:
      "Nutrition and recovery proof: fuel plan, meal library, photo meal estimate, and athlete readiness context.",
    workflow: ["Fuel target", "Meal library", "Photo estimate", "Recovery signal"],
    recruiterRead:
      "Shows the product reaches beyond workouts into a fuller athlete operating system.",
  },
  "soc-monitor": {
    room: "SOC Console",
    visualMode: "security",
    proofType: "Defensive Security UX",
    proofLine:
      "A recruiter-safe security room for triage, packet review, MITRE context, and incident timeline proof.",
    workflow: ["Alert triage", "Packet context", "MITRE mapping", "Analyst decision"],
    recruiterRead:
      "Shows cybersecurity thinking through defensive workflows and clear analyst communication.",
  },
  netwatch: {
    room: "Monitoring Tower",
    visualMode: "security",
    proofType: "Security Monitoring Architecture",
    proofLine: "Architecture and monitoring proof for metrics, alerting, and backend visibility.",
    workflow: ["Metric capture", "Alert rule", "Dashboard view", "Storage model"],
    recruiterRead:
      "Shows backend/security architecture thinking even where the UI is still evolving.",
  },
  "pentest-lab": {
    room: "Pentest Report Exhibit",
    visualMode: "report",
    proofType: "Cybersecurity Reporting",
    proofLine:
      "A safe, redacted report room focused on evidence capture, severity, remediation, and communication.",
    workflow: ["Scope", "Evidence", "Severity", "Remediation"],
    recruiterRead:
      "Shows technical communication and responsible security reporting without exposing unsafe details.",
  },
  "aws-generator": {
    room: "Cloud Pipeline Bay",
    visualMode: "cloud",
    proofType: "Cloud Automation",
    proofLine: "AWS room for S3, Rekognition, Python processing, and output-label proof.",
    workflow: ["Upload image", "S3 object", "Rekognition labels", "Python output"],
    recruiterRead: "Shows practical cloud service wiring and explainable automation boundaries.",
  },
  agentroom: {
    room: "Agent Mission Control",
    visualMode: "agent",
    proofType: "Agent Workflow Tooling",
    proofLine:
      "Agent operations room for checkpoints, blockers, validation, screenshots, and deploy-oriented workflow.",
    workflow: ["Plan", "Build", "Validate", "Screenshot", "Deploy"],
    recruiterRead:
      "Shows systems thinking around managing AI coding agents and technical proof loops.",
  },
  omni: {
    room: "AI Builder IDE",
    visualMode: "agent",
    proofType: "Developer Tooling",
    proofLine:
      "A builder-lab room for the Omni AI browser IDE direction and local project surface.",
    workflow: ["Describe app", "Run workspace", "Preview output", "Publish path"],
    recruiterRead: "Shows interest in AI-native developer tooling and productized build workflows.",
  },
  ruflo: {
    room: "Operations Console",
    visualMode: "agent",
    proofType: "Agent Operations",
    proofLine:
      "A proof room for guardrails, workflow documentation, and local agent operations direction.",
    workflow: ["Guardrails", "Workspace", "Review", "Publish"],
    recruiterRead: "Shows operational discipline around AI-assisted building.",
  },
  "stack-mode": {
    room: "Finance Prototype Studio",
    visualMode: "mobile",
    proofType: "Mobile Product Concepting",
    proofLine:
      "A finance-product prototype room for debt payoff, savings buckets, and planning workflows.",
    workflow: ["Paycheck split", "Debt plan", "Savings bucket", "Daily lock-in"],
    recruiterRead:
      "Shows range across mobile product categories while keeping prototype status honest.",
  },
  "larry-investments": {
    room: "Founder Office",
    visualMode: "proof",
    proofType: "Company Vision",
    proofLine:
      "A company-vision stop that frames FoFit and future builds without pretending they are bigger than the current proof.",
    workflow: [
      "FoFit product family",
      "AI/cyber builds",
      "Business-facing software",
      "Recruiter proof",
    ],
    recruiterRead:
      "Shows founder ambition while keeping the evidence grounded in real repositories, screenshots, and case studies.",
  },
  "google-cert": {
    room: "Certification Trophy Hall",
    visualMode: "proof",
    proofType: "Cybersecurity Learning",
    proofLine: "Certificate proof room for completed cybersecurity coursework and foundations.",
    workflow: ["Foundations", "Risk", "Networks", "Detection", "Automation"],
    recruiterRead: "Shows verified learning progress without overstating certifications.",
  },
  "security-plus": {
    room: "Security+ Study Wing",
    visualMode: "proof",
    proofType: "Certification In Progress",
    proofLine: "Study-path room for Security+ preparation and expected September 2026 timeline.",
    workflow: ["Threats", "Architecture", "Implementation", "Operations"],
    recruiterRead: "Shows the certification target honestly as in progress.",
  },
  "resume-terminal": {
    room: "Recruiter Terminal",
    visualMode: "proof",
    proofType: "Recruiter Usability",
    proofLine: "The instant summary room: resume, projects, skills, contact, GitHub, LinkedIn.",
    workflow: ["Summary", "Resume", "Projects", "Skills", "Contact"],
    recruiterRead: "Shows the world stays optional and recruiter-friendly.",
  },
};

const spawn = { x: 300, y: 298 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distanceToEntity(player: { x: number; y: number }, entity: WorldEntity) {
  const playerCenter = { x: player.x + PLAYER.width / 2, y: player.y + PLAYER.height / 2 };
  const entityCenter = { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
  return Math.hypot(playerCenter.x - entityCenter.x, playerCenter.y - entityCenter.y);
}

function getDirectionHint(player: { x: number; y: number }, entity: WorldEntity) {
  const playerCenter = { x: player.x + PLAYER.width / 2, y: player.y + PLAYER.height / 2 };
  const entityCenter = { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
  const dx = entityCenter.x - playerCenter.x;
  const dy = entityCenter.y - playerCenter.y;
  const horizontal = Math.abs(dx) > 72 ? (dx > 0 ? "east" : "west") : "";
  const vertical = Math.abs(dy) > 72 ? (dy > 0 ? "south" : "north") : "";

  if (!horizontal && !vertical) return "You are close";
  if (horizontal && vertical) return `Head ${vertical}-${horizontal}`;
  return `Head ${horizontal || vertical}`;
}

function getProject(slug?: string): Project | undefined {
  if (!slug) return undefined;
  return projects.find((project) => project.slug === slug);
}

function getShowroomPreset(entity: WorldEntity, project?: Project): ShowroomPreset {
  return (
    showroomPresets[entity.id] ??
    (project ? showroomPresets[project.slug] : undefined) ?? {
      room: entity.kind === "npc" ? "Experience Dialogue" : "Proof Stop",
      visualMode: "proof",
      proofType: project?.proof ?? entity.subtitle,
      proofLine: project?.longDescription ?? entity.proof[0] ?? entity.subtitle,
      workflow: entity.proof.slice(0, 4).map((line, index) => `Proof ${index + 1}`),
      recruiterRead:
        project?.proof ??
        "This interaction adds context to Kenan's founder, builder, cybersecurity, and career story.",
    }
  );
}

function getWorkflowStageLabel(mode: ShowroomPreset["visualMode"], index: number) {
  const labels: Record<ShowroomPreset["visualMode"], string[]> = {
    mobile: ["Context", "Intelligence", "Action", "Signal", "Handoff"],
    dashboard: ["Intake", "Operate", "Review", "Scale", "Report"],
    security: ["Detect", "Investigate", "Map", "Decide", "Report"],
    cloud: ["Input", "Storage", "Model", "Output", "Review"],
    agent: ["Plan", "Build", "Validate", "Evidence", "Ship"],
    report: ["Scope", "Evidence", "Rate", "Remediate", "Present"],
    proof: ["Signal", "Proof", "Context", "Action", "Next"],
  };

  return labels[mode][index] ?? `Stage ${index + 1}`;
}

function getArchitectureSignal(mode: ShowroomPreset["visualMode"]) {
  switch (mode) {
    case "mobile":
      return "Mobile product loop";
    case "dashboard":
      return "Operational product loop";
    case "security":
      return "Defensive analyst loop";
    case "cloud":
      return "Cloud service pipeline";
    case "agent":
      return "Agent workflow loop";
    case "report":
      return "Report evidence chain";
    default:
      return "Recruiter proof chain";
  }
}

function ProofArchitectureMap({
  preset,
  district,
  project,
}: {
  preset: ShowroomPreset;
  district: District;
  project?: Project;
}) {
  const stackPreview = project?.techStack.slice(0, 3).join(" / ") ?? district.title;
  const architectureSignal = getArchitectureSignal(preset.visualMode);

  return (
    <div className="rounded border border-white/10 bg-black/32 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={14} aria-hidden />
          <p className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
            Architecture path
          </p>
        </div>
        <span
          className="rounded-full border px-2 py-1 font-mono text-[9px] uppercase"
          style={{
            borderColor: `${district.accent}55`,
            color: district.accent,
            backgroundColor: `${district.accent}10`,
          }}
        >
          {architectureSignal}
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded border border-white/10 bg-black/40 p-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background: `radial-gradient(circle at 20% 0%, ${district.glow}, transparent 34%), linear-gradient(135deg, rgba(255,255,255,.06), transparent 42%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="relative grid gap-2 sm:grid-cols-2">
          {preset.workflow.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className={cn(
                "group relative overflow-hidden rounded border border-white/10 bg-black/48 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/24",
                index % 2 === 1 && "sm:translate-y-3",
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
                style={{ backgroundColor: district.accent }}
              />
              <div className="flex items-center gap-3">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded border font-mono text-[10px]"
                  style={{
                    borderColor: `${district.accent}66`,
                    color: district.accent,
                    boxShadow: `0 0 18px ${district.glow}`,
                  }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.13em] text-white/45 uppercase">
                    {getWorkflowStageLabel(preset.visualMode, index)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{step}</p>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(((index + 1) / preset.workflow.length) * 100)}%`,
                    backgroundColor: district.accent,
                    boxShadow: `0 0 14px ${district.glow}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded border border-white/10 bg-white/[0.035] p-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase">
            Proof type
          </p>
          <p className="text-fg-secondary mt-1 text-xs leading-4">{preset.proofType}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.035] p-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase">
            Stack signal
          </p>
          <p className="text-fg-secondary mt-1 line-clamp-2 text-xs leading-4">{stackPreview}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.035] p-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase">
            Room goal
          </p>
          <p className="text-fg-secondary mt-1 text-xs leading-4">{preset.room}</p>
        </div>
      </div>
    </div>
  );
}

function getEntityMedia(entity: WorldEntity, project?: Project): ProjectMedia[] {
  if (project?.media.length) return project.media;
  if (entity.id === "laptop") {
    return [
      {
        src: "/media/projects/kenan-portfolio/kenan-portfolio-home.png",
        alt: "Kenan portfolio homepage showing featured project proof and recruiter positioning",
        label: "Portfolio command center",
        source: "local",
        type: "image",
      },
      {
        src: "/media/screenshots/portfolio-featured-builds.png",
        alt: "Featured builds section with polished project proof cards",
        label: "Featured builds proof",
        source: "local",
        type: "image",
      },
    ];
  }
  if (entity.id === "whiteboard") {
    return [
      {
        src: "/media/screenshots/portfolio-archive-grid.png",
        alt: "Project archive grid showing Kenan's broader GitHub repository proof system",
        label: "Build archive map",
        source: "local",
        type: "image",
      },
      {
        src: "/media/screenshots/portfolio-premium-desktop.png",
        alt: "Desktop portfolio view with premium black and white recruiter-ready layout",
        label: "Recruiter site polish",
        source: "local",
        type: "image",
      },
    ];
  }
  if (entity.id === "google-cert") {
    const media = certifications.find((certification) => certification.media)?.media;
    if (media) {
      return [
        {
          src: media,
          alt: "Google Cybersecurity Professional Certificate proof",
          label: "Certificate proof",
          source: "local",
          type: "image",
        },
      ];
    }
  }
  return [];
}

function getMediaSourceLabel(source: ProjectMedia["source"]) {
  switch (source) {
    case "live":
      return "Live capture";
    case "local":
      return "Local app media";
    case "repo":
      return "Repository artifact";
    case "generated":
      return "Generated asset";
    default:
      return "Project media";
  }
}

function getCurrentDistrict(player: { x: number; y: number }) {
  const center = { x: player.x + PLAYER.width / 2, y: player.y + PLAYER.height / 2 };
  return districts.find(
    (district) =>
      center.x >= district.x &&
      center.x <= district.x + district.w &&
      center.y >= district.y &&
      center.y <= district.y + district.h,
  );
}

function PixelKenan({ facing, moving }: { facing: Facing; moving: boolean }) {
  return (
    <div
      className={cn(
        "kenan-player relative h-[46px] w-[34px] drop-shadow-[0_14px_18px_rgba(0,0,0,.55)]",
        moving && "kenan-player--moving",
      )}
      data-facing={facing}
    >
      <div className="absolute -bottom-1 left-1/2 h-2 w-9 -translate-x-1/2 rounded-full bg-black/45 blur-[1px]" />
      <div className="absolute top-0 left-[8px] h-4 w-5 bg-[#141414] shadow-[4px_0_0_#141414,-4px_2px_0_#141414,0_4px_0_#141414]" />
      <div className="absolute top-[11px] left-[9px] h-3 w-5 border border-black/35 bg-[#8b5a3c]">
        {facing !== "up" && (
          <>
            <span className="absolute top-1 left-1 h-1 w-1 bg-black/75" />
            <span className="absolute top-1 right-1 h-1 w-1 bg-black/75" />
          </>
        )}
      </div>
      <div className="absolute top-[21px] left-[6px] h-5 w-6 border border-black/35 bg-[#101419] shadow-[5px_0_0_#d8fff7,-5px_0_0_#d8fff7]" />
      <div className="absolute top-[24px] left-[12px] h-1.5 w-3 bg-[#76f4df]" />
      <div
        className={cn(
          "absolute top-[37px] h-2 w-2 bg-[#202020] shadow-[12px_0_0_#202020]",
          moving ? "left-[7px]" : "left-[8px]",
        )}
      />
      <div className="absolute top-[28px] left-[1px] h-2 w-2 bg-[#8b5a3c] shadow-[30px_0_0_#8b5a3c]" />
    </div>
  );
}

function PixelNpc({ accent, active }: { accent: string; active: boolean }) {
  return (
    <div className={cn("npc-sprite relative h-full w-full", active && "npc-sprite--active")}>
      {active && (
        <div className="absolute -top-5 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 bg-black/85 font-mono text-[10px] text-white">
          E
        </div>
      )}
      <div className="absolute top-1 left-1/2 h-4 w-4 -translate-x-1/2 bg-[#202020]" />
      <div className="absolute top-4 left-1/2 h-3 w-5 -translate-x-1/2 border border-black/30 bg-[#8b5a3c]" />
      <div
        className="absolute top-7 left-1/2 h-7 w-7 -translate-x-1/2 border border-black/40 shadow-[inset_0_0_0_3px_rgba(255,255,255,.18)]"
        style={{ backgroundColor: accent }}
      />
      <div className="absolute bottom-1 left-[14px] h-3 w-2 bg-[#111] shadow-[12px_0_0_#111]" />
    </div>
  );
}

function BuildingSprite({ entity, active }: { entity: WorldEntity; active: boolean }) {
  const district = districtById.get(entity.district)!;
  const isTower = entity.id.includes("netwatch");
  const isLab = entity.title.toLowerCase().includes("lab") || entity.district === "ai";
  const isMuseum = entity.district === "museum";
  const isCyber = entity.district === "cyber";
  const isFoFit = entity.district === "fofit";
  const isCareer = entity.district === "career";
  const roof =
    entity.id === "marketplace"
      ? "polygon(0 38%, 12% 0, 88% 0, 100% 38%, 100% 100%, 0 100%)"
      : isMuseum
        ? "polygon(50% 0, 100% 42%, 92% 100%, 8% 100%, 0 42%)"
        : isLab
          ? "polygon(14% 0, 86% 0, 100% 100%, 0 100%)"
          : "polygon(8% 0, 92% 0, 100% 100%, 0 100%)";

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute -inset-3 rounded-[2px] opacity-0 blur-md transition duration-300",
          active && "opacity-70",
        )}
        style={{ background: `radial-gradient(circle, ${district.accent}, transparent 70%)` }}
      />
      <div
        className="absolute inset-x-2 top-0 h-8 border border-black/55 shadow-[0_6px_0_rgba(0,0,0,.28)]"
        style={{
          background: `linear-gradient(90deg, ${entity.accent}, ${district.secondary}, rgba(255,255,255,.78))`,
          clipPath: roof,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 border border-black/55"
        style={{ top: isTower ? 20 : 28 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.20)), ${isCyber ? "#06121e" : isFoFit ? "#082724" : isCareer ? "#211f1c" : isMuseum ? "#222016" : "#171321"}`,
          }}
        />
        <div
          className={cn(
            "relative grid h-full gap-2 p-3",
            isTower ? "grid-cols-2" : isFoFit ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          {Array.from({ length: isTower ? 12 : isMuseum ? 4 : 8 }).map((_, index) => (
            <span
              key={index}
              className={cn("border border-white/12", isMuseum && index < 2 ? "rounded-full" : "")}
              style={{
                background:
                  index % 3 === 0
                    ? `${district.accent}66`
                    : isCyber || isLab
                      ? "rgba(255,255,255,.10)"
                      : "rgba(255,255,255,.17)",
                boxShadow: index % 3 === 0 ? `0 0 12px ${district.accent}70` : undefined,
              }}
            />
          ))}
        </div>
      </div>
      {isFoFit && (
        <div className="absolute right-5 bottom-7 h-2 w-14 bg-[#76f4df] shadow-[0_0_14px_#76f4df]" />
      )}
      {isCyber && (
        <div className="absolute top-3 right-2 h-8 w-1 bg-[#78c7ff] shadow-[0_0_14px_#78c7ff]" />
      )}
      {isMuseum && (
        <>
          <div className="absolute right-5 bottom-2 h-16 w-2 bg-[#f6d777]" />
          <div className="absolute bottom-2 left-5 h-16 w-2 bg-[#f6d777]" />
        </>
      )}
      <div className="absolute right-3 bottom-0 left-3 h-5 border border-black/60 bg-black shadow-[0_-4px_0_rgba(255,255,255,.06)]" />
      <div
        className="absolute bottom-1 left-1/2 h-4 w-10 -translate-x-1/2 border border-white/12"
        style={{ backgroundColor: isMuseum ? "#111" : entity.accent }}
      />
      <div
        className="absolute -bottom-3 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-full bg-black/45 blur-[2px]"
        aria-hidden
      />
    </div>
  );
}

function PropSprite({ prop }: { prop: WorldProp }) {
  const color = prop.color ?? districtById.get(prop.district)?.accent ?? "#ffffff";

  if (prop.kind === "tree" || prop.kind === "planter") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute bottom-0 left-1/2 h-4 w-5 -translate-x-1/2 border border-black/50 bg-[#5b3b28]" />
        <div
          className="absolute top-0 left-1/2 size-9 -translate-x-1/2 rounded-[3px] border border-black/40 shadow-[inset_0_0_0_4px_rgba(255,255,255,.12)]"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-5 left-[7px] size-7 rounded-[3px] border border-black/35"
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }

  if (prop.kind === "bench") {
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute inset-x-0 top-2 h-3 border border-black/45"
          style={{ backgroundColor: color }}
        />
        <div className="absolute inset-x-2 top-6 h-2 border border-black/45 bg-black/45" />
        <div className="absolute bottom-0 left-3 h-3 w-2 bg-black/70 shadow-[42px_0_0_rgba(0,0,0,.7)]" />
      </div>
    );
  }

  if (prop.kind === "lamp") {
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute -top-3 left-1/2 size-9 -translate-x-1/2 rounded-full opacity-45 blur-md"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-1 left-1/2 size-4 -translate-x-1/2 rounded-full border border-black/40"
          style={{ backgroundColor: color }}
        />
        <div className="absolute top-5 bottom-1 left-1/2 w-1 -translate-x-1/2 bg-[#161616]" />
        <div className="absolute right-1 bottom-0 left-1 h-2 border border-black/50 bg-[#101010]" />
      </div>
    );
  }

  if (prop.kind === "server") {
    return (
      <div className="grid h-full w-full gap-1 border border-black/55 bg-[#07111a] p-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="border border-white/10 bg-white/[0.08]"
            style={{ boxShadow: index % 2 === 0 ? `0 0 10px ${color}70` : undefined }}
          />
        ))}
      </div>
    );
  }

  if (prop.kind === "antenna") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute bottom-0 left-1/2 h-16 w-1 -translate-x-1/2 bg-white/50" />
        <div
          className="absolute top-4 left-1/2 h-10 w-10 -translate-x-1/2 rotate-45 border-t border-l"
          style={{ borderColor: color }}
        />
        <div
          className="absolute top-1 left-1/2 size-3 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}` }}
        />
      </div>
    );
  }

  if (prop.kind === "terminal" || prop.kind === "kiosk" || prop.kind === "sign") {
    return (
      <div className="relative flex h-full w-full items-center justify-center border border-black/55 bg-[#080808] p-2 text-center font-mono text-[9px] font-semibold text-white uppercase">
        <div className="absolute inset-1 border border-white/10" />
        <span className="relative" style={{ color }}>
          {prop.label ?? prop.kind}
        </span>
      </div>
    );
  }

  if (prop.kind === "trophy") {
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute top-0 left-1/2 size-8 -translate-x-1/2 rounded-b-full border border-black/45"
          style={{ backgroundColor: color }}
        />
        <div className="absolute top-8 left-1/2 h-6 w-2 -translate-x-1/2 bg-white/45" />
        <div className="absolute right-3 bottom-0 left-3 h-3 border border-black/45 bg-[#111]" />
      </div>
    );
  }

  if (prop.kind === "lab-light") {
    return (
      <div
        className="world-pulse h-full w-full rounded-full opacity-70 blur-[1px]"
        style={{ background: `radial-gradient(circle, ${color}, transparent 62%)` }}
      />
    );
  }

  return (
    <div
      className="h-full w-full rounded-[2px] border border-black/40 opacity-80"
      style={{
        background:
          prop.kind === "field"
            ? `repeating-linear-gradient(90deg, ${color} 0 18px, rgba(0,0,0,.12) 18px 24px)`
            : color,
      }}
    />
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
  const district = districtById.get(entity.district)!;
  return (
    <div
      className={cn(
        "world-token flex h-full w-full items-center justify-center rounded-[3px] border-2 border-black font-mono text-[10px] font-bold text-black shadow-[0_0_18px_rgba(255,255,255,.32)]",
        collected && "opacity-25 grayscale",
      )}
      style={{
        backgroundColor: entity.accent,
        boxShadow: collected ? undefined : `0 0 22px ${district.accent}70`,
      }}
    >
      {entity.collectibleLabel}
    </div>
  );
}

function EntitySprite({
  entity,
  active,
  collected,
  unlocked,
  onInteract,
}: {
  entity: WorldEntity;
  active: boolean;
  collected: boolean;
  unlocked: boolean;
  onInteract: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onInteract}
      aria-label={`Interact with ${entity.title}`}
      className={cn(
        "group absolute transition duration-200 focus:outline-none",
        active && "z-30 scale-105",
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
      {active && entity.kind !== "collectible" && (
        <span
          className="pointer-events-none absolute -inset-3 rounded-[2px] border border-white/40 opacity-80"
          style={{ boxShadow: `0 0 26px ${districtById.get(entity.district)?.accent ?? "#fff"}` }}
        />
      )}
      {entity.kind === "building" && <BuildingSprite entity={entity} active={active} />}
      {entity.kind === "npc" && <PixelNpc accent={entity.accent} active={active} />}
      {entity.kind === "object" && <ObjectSprite entity={entity} />}
      {entity.kind === "collectible" && <CollectibleSprite entity={entity} collected={collected} />}
      {unlocked && entity.kind !== "collectible" && (
        <span className="absolute -top-3 -right-3 flex size-6 items-center justify-center rounded-full border border-white bg-white text-black shadow-[0_0_18px_rgba(255,255,255,.32)]">
          <CheckCircle2 size={14} aria-hidden />
        </span>
      )}
      <span
        className={cn(
          "absolute top-full left-1/2 mt-2 -translate-x-1/2 border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-white shadow-lg backdrop-blur transition",
          active ? "block" : "hidden group-hover:block md:block",
        )}
      >
        {entity.title}
      </span>
      {active && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-2 py-1 font-mono text-[9px] whitespace-nowrap text-white uppercase shadow-lg">
          Press E
        </span>
      )}
    </button>
  );
}

function WorldBillboardSprite({
  billboard,
  active,
  unlocked,
  onOpen,
}: {
  billboard: WorldBillboard;
  active: boolean;
  unlocked: boolean;
  onOpen: () => void;
}) {
  const entity = entityById.get(billboard.entityId);
  if (!entity) return null;

  const project = getProject(entity.projectSlug);
  const district = districtById.get(entity.district)!;
  const media = getEntityMedia(entity, project);
  const previewMedia = media[0];
  const isPhone = billboard.variant === "phone";
  const isReport = billboard.variant === "report";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${entity.title} media proof`}
      className={cn(
        "world-billboard group absolute z-20 overflow-hidden rounded border bg-black/80 text-left shadow-[0_18px_55px_rgba(0,0,0,.36)] backdrop-blur-sm transition duration-200 focus:outline-none",
        active && "z-30 scale-[1.035]",
      )}
      style={
        {
          left: billboard.x,
          top: billboard.y,
          width: billboard.w,
          height: billboard.h,
          borderColor: active ? district.accent : `${district.accent}66`,
          boxShadow: active
            ? `0 0 0 1px ${district.accent}, 0 0 34px ${district.accent}70, 0 22px 60px rgba(0,0,0,.42)`
            : `0 0 22px ${district.accent}24, 0 18px 55px rgba(0,0,0,.36)`,
          "--billboard-accent": district.accent,
          "--billboard-glow": district.glow,
          imageRendering: "auto",
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 22% 15%, ${district.glow}, transparent 44%), linear-gradient(135deg, rgba(255,255,255,.11), rgba(255,255,255,.015))`,
        }}
      />

      {previewMedia ? (
        <div
          className={cn(
            "absolute overflow-hidden border border-white/14 bg-black",
            isPhone
              ? "inset-x-[22%] top-5 bottom-8 rounded-[12px]"
              : isReport
                ? "inset-3 rounded bg-white"
                : "inset-x-3 top-7 bottom-9 rounded",
          )}
        >
          <Image
            src={previewMedia.src}
            alt=""
            fill
            sizes={`${billboard.w}px`}
            className={cn(
              "object-top transition duration-500 group-hover:scale-[1.035]",
              isPhone || isReport ? "object-contain" : "object-cover",
              isReport ? "bg-white" : "brightness-[1.08] contrast-[1.08]",
            )}
            style={{ imageRendering: "auto" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-white/8" />
        </div>
      ) : (
        <div className="absolute inset-x-3 top-7 bottom-9 flex items-center justify-center rounded border border-dashed border-white/18 bg-white/[0.045]">
          <span className="font-mono text-[10px] text-white/58 uppercase">Media soon</span>
        </div>
      )}

      <div className="world-billboard-scan pointer-events-none absolute inset-0" />
      <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: district.accent, boxShadow: `0 0 12px ${district.accent}` }}
        />
        <span className="truncate font-mono text-[8px] tracking-[0.14em] text-white/55 uppercase">
          {billboard.subtitle}
        </span>
      </div>
      <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between gap-2 rounded border border-white/10 bg-black/72 px-2 py-1 backdrop-blur">
        <span className="truncate font-mono text-[9px] text-white/80 uppercase">
          {billboard.title}
        </span>
        <span className="shrink-0 font-mono text-[8px] text-white/44 uppercase">
          {unlocked ? "Reviewed" : "Open"}
        </span>
      </div>
      {unlocked && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border border-white bg-white text-black shadow-[0_0_16px_rgba(255,255,255,.38)]">
          <CheckCircle2 size={12} aria-hidden />
        </span>
      )}
    </button>
  );
}

function DistrictPanel({
  district,
  discovered,
}: {
  district: (typeof districts)[number];
  discovered: boolean;
}) {
  return (
    <section
      aria-label={`${district.title}: ${district.subtitle}`}
      className={cn(
        "absolute overflow-hidden border shadow-[inset_0_0_0_2px_rgba(0,0,0,.22),0_24px_90px_rgba(0,0,0,.34)] transition duration-500",
        discovered ? "opacity-100" : "opacity-88",
      )}
      style={{
        left: district.x,
        top: district.y,
        width: district.w,
        height: district.h,
        borderColor: district.border,
        background: `${district.background}, radial-gradient(circle at 78% 82%, ${district.glow}, transparent 34%), repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 2px, transparent 2px 32px), repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, transparent 2px 32px)`,
        boxShadow: `inset 0 0 0 2px rgba(0,0,0,.22), 0 24px 90px rgba(0,0,0,.34), 0 0 55px ${district.glow}`,
        imageRendering: "pixelated",
      }}
    >
      <div
        className="absolute inset-x-6 top-1/2 h-4 -translate-y-1/2 rounded-full border border-black/20 opacity-45"
        style={{ backgroundColor: district.path }}
      />
      <div
        className="absolute top-6 bottom-6 left-1/2 w-4 -translate-x-1/2 rounded-full border border-black/20 opacity-35"
        style={{ backgroundColor: district.path }}
      />
      <div className="absolute top-4 left-4 border border-white/18 bg-black/48 px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,.28)] backdrop-blur">
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/55 uppercase">
          {district.subtitle}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">{district.title}</h2>
          {discovered && <CheckCircle2 size={13} style={{ color: district.accent }} aria-hidden />}
        </div>
      </div>
      <div
        className="world-district-sheen absolute inset-0 opacity-35"
        style={{
          background: `linear-gradient(115deg, transparent 0%, ${district.glow} 46%, transparent 72%)`,
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-36 w-36 opacity-40"
        style={{ background: `radial-gradient(circle, ${district.accent}, transparent 70%)` }}
      />
      <div className="absolute right-4 bottom-4 font-mono text-[42px] font-black text-white/[0.035] uppercase">
        {district.id}
      </div>
    </section>
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
  const preset = getShowroomPreset(entity, project);
  const district = districtById.get(entity.district)!;
  const media = getEntityMedia(entity, project);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const selectedMediaSafeIndex = media.length ? Math.min(selectedMediaIndex, media.length - 1) : 0;
  const selectedMedia = media[selectedMediaSafeIndex] ?? media[0];
  const mediaSourceLabel = selectedMedia ? getMediaSourceLabel(selectedMedia.source) : undefined;
  const proofPanels = project
    ? [
        { label: "Problem", value: project.problem ?? "Project problem statement coming soon." },
        { label: "Built", value: project.built ?? project.longDescription },
        { label: "Proves", value: project.proof ?? preset.proofType },
      ]
    : [
        {
          label: "Signal",
          value: entity.subtitle,
        },
        {
          label: "Context",
          value: preset.proofLine,
        },
        {
          label: "Proves",
          value: preset.proofType,
        },
      ];

  const selectRelativeMedia = useCallback(
    (direction: number) => {
      if (media.length < 2) return;
      setSelectedMediaIndex((current) => (current + direction + media.length) % media.length);
    },
    [media.length],
  );

  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [entity.id, project?.slug]);

  const facts = [
    project ? { label: "Status", value: project.status } : { label: "Type", value: entity.kind },
    project
      ? { label: "Category", value: project.category }
      : { label: "District", value: district.title },
    {
      label: "Media",
      value: media.length
        ? `${media.length} real asset${media.length === 1 ? "" : "s"}`
        : "Coming soon",
    },
    { label: "Proof", value: preset.proofType },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/74 p-2 backdrop-blur-md md:items-center md:justify-center md:p-6">
      <article
        className="world-showroom glass-panel max-h-[94dvh] w-full max-w-6xl overflow-hidden rounded"
        style={
          {
            "--showroom-accent": district.accent,
            "--showroom-secondary": district.secondary,
          } as CSSProperties
        }
      >
        <div className="grid max-h-[94dvh] overflow-y-auto lg:grid-cols-[1.08fr_.92fr]">
          <section className="relative min-h-[420px] overflow-hidden border-b border-white/10 bg-black lg:border-r lg:border-b-0">
            <div
              className="absolute inset-0 opacity-55"
              style={{
                background: `radial-gradient(circle at 25% 15%, ${district.glow}, transparent 32%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.01))`,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
            <div className="relative p-3 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="rounded border border-white/12 bg-black/62 px-3 py-2 backdrop-blur">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-white/55 uppercase">
                    {preset.room}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{entity.title}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close proof panel"
                  title="Close proof panel"
                  className="text-fg-secondary flex h-10 shrink-0 items-center gap-2 rounded border border-white/15 bg-black/60 px-3 font-mono text-[10px] uppercase transition hover:border-white/40 hover:text-white"
                >
                  <X size={16} aria-hidden />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>

              {selectedMedia ? (
                <div
                  className={cn(
                    "world-showroom-media relative overflow-hidden rounded border border-white/16 bg-[#050505] shadow-[0_24px_90px_rgba(0,0,0,.45)]",
                    preset.visualMode === "mobile"
                      ? "mx-auto aspect-[9/16] max-h-[620px] max-w-[380px]"
                      : preset.visualMode === "report"
                        ? "aspect-[13/10]"
                        : "aspect-[16/10]",
                  )}
                >
                  <Image
                    src={selectedMedia.src}
                    alt={selectedMedia.alt}
                    fill
                    sizes={
                      preset.visualMode === "mobile"
                        ? "(min-width: 1024px) 380px, 88vw"
                        : "(min-width: 1024px) 640px, 92vw"
                    }
                    className={cn(
                      "object-top transition duration-500 hover:scale-[1.015]",
                      preset.visualMode === "mobile" || preset.visualMode === "report"
                        ? "object-contain"
                        : "object-cover",
                      preset.visualMode === "mobile" &&
                        "brightness-[1.13] contrast-[1.08] saturate-[1.04]",
                      preset.visualMode === "security" && "brightness-[1.08] contrast-[1.08]",
                      preset.visualMode === "report" && "bg-white",
                    )}
                    priority={project?.featured}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  {media.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => selectRelativeMedia(-1)}
                        aria-label="Show previous project screenshot"
                        className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/70 text-white/78 backdrop-blur transition hover:border-white/42 hover:text-white"
                      >
                        <ChevronLeft size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => selectRelativeMedia(1)}
                        aria-label="Show next project screenshot"
                        className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/70 text-white/78 backdrop-blur transition hover:border-white/42 hover:text-white"
                      >
                        <ChevronRight size={18} aria-hidden />
                      </button>
                    </>
                  )}
                  {media.length > 0 && (
                    <div className="absolute top-3 right-3 rounded border border-white/10 bg-black/68 px-2 py-1 font-mono text-[9px] text-white/64 uppercase backdrop-blur">
                      {selectedMediaSafeIndex + 1}/{media.length}
                    </div>
                  )}
                  <div className="absolute right-3 bottom-3 left-3 rounded border border-white/10 bg-black/68 p-3 backdrop-blur">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[10px] tracking-[0.14em] text-white/58 uppercase">
                        Active media
                      </p>
                      {mediaSourceLabel && (
                        <span className="rounded border border-white/12 px-2 py-0.5 font-mono text-[9px] text-white/52 uppercase">
                          {mediaSourceLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{selectedMedia.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/58">
                      {selectedMedia.alt}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center rounded border border-dashed border-white/16 bg-white/[0.035]">
                  <div className="text-center">
                    <Images className="mx-auto text-white/45" size={28} aria-hidden />
                    <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-white/50 uppercase">
                      Media coming soon
                    </p>
                    <p className="text-fg-secondary mt-2 max-w-sm text-sm">
                      This room is ready for real screenshots once the project surface is captured.
                    </p>
                  </div>
                </div>
              )}

              {media.length > 1 && (
                <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
                  {media.map((item, index) => (
                    <button
                      key={item.src}
                      type="button"
                      onClick={() => setSelectedMediaIndex(index)}
                      className={cn(
                        "group relative h-20 w-28 shrink-0 overflow-hidden rounded border bg-black transition",
                        selectedMediaSafeIndex === index
                          ? "border-white"
                          : "border-white/12 hover:border-white/36",
                      )}
                      aria-label={`Show ${item.label}`}
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover object-top opacity-75 brightness-[1.08] contrast-[1.05] transition group-hover:opacity-100"
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/72 px-2 py-1 text-left font-mono text-[9px] text-white/72">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="relative p-4 md:p-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-20"
              style={{ background: `linear-gradient(180deg, ${district.accent}, transparent)` }}
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase"
                  style={{
                    borderColor: `${district.accent}66`,
                    color: district.accent,
                    backgroundColor: `${district.accent}12`,
                  }}
                >
                  <Sparkles size={12} aria-hidden />
                  {preset.proofType}
                </span>
                <span className="text-fg-muted rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase">
                  {district.title}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{entity.title}</h2>
              <p className="text-fg-secondary mt-3 text-sm leading-6 md:text-base">
                {project?.longDescription ?? preset.proofLine}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded border border-white/10 bg-black/32 p-3">
                    <p className="text-fg-muted font-mono text-[9px] uppercase">{fact.label}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{fact.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-2 md:grid-cols-3">
                {proofPanels.map((panel) => (
                  <div key={panel.label} className="rounded border border-white/10 bg-black/28 p-3">
                    <p className="text-fg-muted font-mono text-[9px] tracking-[0.12em] uppercase">
                      {panel.label}
                    </p>
                    <p className="text-fg-secondary mt-2 text-sm leading-5">{panel.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0"
                    size={17}
                    style={{ color: district.accent }}
                    aria-hidden
                  />
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
                      Recruiter read
                    </p>
                    <p className="text-fg-secondary mt-2 text-sm leading-6">
                      {preset.recruiterRead}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
                <ProofArchitectureMap preset={preset} district={district} project={project} />
                <div className="rounded border border-white/10 bg-black/32 p-4">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} aria-hidden />
                    <p className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
                      Proof terminal
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {entity.proof.map((line) => (
                      <div
                        key={line}
                        className="rounded border border-white/10 bg-white/[0.035] p-3"
                      >
                        <p className="text-fg-secondary text-sm leading-6">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {project && (
                <div className="mt-5 rounded border border-white/10 bg-black/32 p-4">
                  <p className="text-fg-muted font-mono text-[10px] uppercase">Project stack</p>
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
                  {project.notes && (
                    <div className="mt-4 rounded border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-fg-muted font-mono text-[9px] uppercase">Evidence note</p>
                      <p className="text-fg-secondary mt-1 text-xs leading-5">{project.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {caseStudy && (
                <div className="mt-5 rounded border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-fg-muted font-mono text-[10px] uppercase">Case study signal</p>
                  <p className="text-fg-secondary mt-2 text-sm leading-6">{caseStudy.summary}</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
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
                    className="inline-flex h-10 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black transition hover:bg-white/88"
                  >
                    Case Study
                  </Link>
                )}
                {entity.actionLabel && (
                  <button
                    type="button"
                    onClick={onRecruiterMode}
                    className="inline-flex h-10 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black transition hover:bg-white/88"
                  >
                    {entity.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function RecruiterMode({
  collectedCount,
  collectibleCount,
  achievements,
  unlockedProofCount,
  onResetProgress,
  onClose,
}: {
  collectedCount: number;
  collectibleCount: number;
  achievements: Achievement[];
  unlockedProofCount: number;
  onResetProgress: () => void;
  onClose: () => void;
}) {
  const unlockedAchievementCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetProgress}
              className="text-fg-secondary hidden h-10 items-center gap-2 rounded border border-white/15 px-3 font-mono text-xs transition hover:border-white/45 hover:text-white sm:inline-flex"
            >
              <RotateCcw size={14} aria-hidden />
              Reset World
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Recruiter Mode"
              className="text-fg-secondary flex size-10 items-center justify-center rounded border border-white/15 transition hover:border-white/45 hover:text-white"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
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
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-2xl font-semibold">
                    {collectedCount}/{collectibleCount}
                  </p>
                  <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">Proof tokens</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-2xl font-semibold">
                    {unlockedProofCount}/{unlockableEntityIds.length}
                  </p>
                  <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">Proof stops</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-2xl font-semibold">
                    {unlockedAchievementCount}/{achievements.length}
                  </p>
                  <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">Achievements</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-2xl font-semibold">{profile.location.split(",")[0]}</p>
                  <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">Base</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "rounded border p-3 transition",
                      achievement.unlocked
                        ? "border-white/18 bg-white/[0.045]"
                        : "border-white/8 bg-black/22 opacity-58",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor: achievement.unlocked ? achievement.accent : "#555",
                          boxShadow: achievement.unlocked
                            ? `0 0 14px ${achievement.accent}`
                            : "none",
                        }}
                      />
                      <p className="text-sm font-semibold">{achievement.title}</p>
                    </div>
                    <p className="text-fg-muted mt-1 text-xs leading-4">{achievement.detail}</p>
                  </div>
                ))}
              </div>
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

function QuestBoard({
  visitedDistricts,
  collected,
  unlockedProof,
  achievements,
  recruiterViewed,
}: {
  visitedDistricts: DistrictId[];
  collected: string[];
  unlockedProof: string[];
  achievements: Achievement[];
  recruiterViewed: boolean;
}) {
  const tokenTotal = entities.filter((entity) => entity.kind === "collectible").length;
  const quests = [
    {
      label: "Wake the world",
      detail: "Open the MacBook or Whiteboard in Hometown.",
      complete: unlockedProof.some((id) => ["laptop", "whiteboard"].includes(id)),
    },
    {
      label: "Prove FoFit",
      detail: "Visit Mobile HQ and Coach Center.",
      complete: ["fofit-mobile", "fofit-coach"].every((id) => unlockedProof.includes(id)),
    },
    {
      label: "Open cyber proof",
      detail: "Inspect SOC, Netwatch, or the pentest exhibit.",
      complete: ["soc-monitor", "netwatch", "pentest-lab"].some((id) => unlockedProof.includes(id)),
    },
    {
      label: "Inspect agent tools",
      detail: "Enter AgentRoom or another AI lab.",
      complete: ["agentroom", "omni", "ruflo", "stack-mode"].some((id) =>
        unlockedProof.includes(id),
      ),
    },
    {
      label: "Read the founder signal",
      detail: "Visit Larry Investments HQ in Career City.",
      complete: unlockedProof.includes("larry-investments"),
    },
    {
      label: "Collect proof tokens",
      detail: `${collected.length} of ${tokenTotal} tokens collected.`,
      complete: collected.length >= 3,
    },
    {
      label: "Recruiter handoff",
      detail: "Open Recruiter Mode for the clean summary.",
      complete: recruiterViewed,
    },
  ];

  const completedCount = quests.filter((quest) => quest.complete).length;
  const nextQuest = quests.find((quest) => !quest.complete);
  const unlockedAchievementCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;
  const visibleAchievements = achievements.filter((achievement) => achievement.unlocked).slice(-3);
  const achievementPreview = visibleAchievements.length
    ? visibleAchievements
    : achievements.slice(0, 3);

  return (
    <aside className="pointer-events-none fixed top-16 right-5 z-40 hidden w-80 rounded border border-white/12 bg-black/72 p-4 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur xl:block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-fg-muted font-mono text-[10px] tracking-[0.16em] uppercase">
            Quest Board
          </p>
          <h2 className="mt-1 text-lg font-semibold">Build path</h2>
        </div>
        <span className="rounded border border-white/12 bg-white/[0.035] px-2 py-1 font-mono text-[10px] text-white/62">
          {completedCount}/{quests.length}
        </span>
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/[0.035] p-3">
        <p className="text-fg-muted font-mono text-[9px] uppercase">Next proof stop</p>
        <p className="mt-1 text-sm font-semibold">{nextQuest?.label ?? "Proof report ready"}</p>
        <p className="text-fg-secondary mt-1 text-xs leading-5">
          {nextQuest?.detail ?? "Open Recruiter Mode when you want the traditional summary."}
        </p>
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/[0.035] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-fg-muted font-mono text-[9px] uppercase">Achievements</p>
          <span className="font-mono text-[9px] text-white/58">
            {unlockedAchievementCount}/{achievements.length}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {achievementPreview.map((achievement) => (
            <span
              key={achievement.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[9px] uppercase",
                achievement.unlocked
                  ? "border-white/18 bg-white/[0.06] text-white"
                  : "border-white/8 bg-black/24 text-white/42",
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: achievement.unlocked ? achievement.accent : "#555" }}
              />
              {achievement.unlocked ? achievement.title : "Locked"}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {quests.map((quest) => (
          <div
            key={quest.label}
            className={cn(
              "flex items-start gap-2 rounded border p-2 transition",
              quest.complete
                ? "border-white/18 bg-white/[0.045] text-white"
                : "border-white/8 bg-black/28 text-white/60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                quest.complete
                  ? "border-white bg-white text-black"
                  : "border-white/18 bg-white/[0.03]",
              )}
            >
              {quest.complete ? <CheckCircle2 size={11} aria-hidden /> : null}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase">{quest.label}</p>
              <p className="text-fg-muted mt-0.5 text-xs leading-4">{quest.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-fg-muted mt-3 border-t border-white/10 pt-3 font-mono text-[9px] uppercase">
        Districts discovered: {visitedDistricts.length} / {districts.length}
      </p>
    </aside>
  );
}

function GuidePanel({
  guideSteps,
  activeStep,
  target,
  player,
}: {
  guideSteps: GuidedStep[];
  activeStep?: GuidedStep;
  target?: WorldEntity;
  player: { x: number; y: number };
}) {
  const completedCount = guideSteps.filter((step) => step.complete).length;
  const targetDistrict = target ? districtById.get(target.district) : undefined;
  const distance = target ? Math.round(distanceToEntity(player, target)) : undefined;
  const direction = target ? getDirectionHint(player, target) : undefined;

  return (
    <aside className="pointer-events-none fixed top-[10.6rem] left-3 z-40 hidden w-[min(92vw,420px)] rounded border border-white/12 bg-black/72 p-3 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur md:left-5 md:block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-fg-muted font-mono text-[10px] tracking-[0.16em] uppercase">
            Guided Route
          </p>
          <h2 className="mt-1 text-sm font-semibold">
            {activeStep?.title ?? "Build path complete"}
          </h2>
        </div>
        <span className="rounded border border-white/12 bg-white/[0.035] px-2 py-1 font-mono text-[10px] text-white/62">
          {completedCount}/{guideSteps.length}
        </span>
      </div>
      <p className="text-fg-secondary mt-2 text-xs leading-5">
        {activeStep?.detail ?? "Recruiter Mode is ready when you want the clean summary."}
      </p>
      {target && (
        <div className="mt-3 rounded border border-white/10 bg-white/[0.035] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: targetDistrict?.accent ?? "#fff",
                boxShadow: `0 0 16px ${targetDistrict?.accent ?? "#fff"}`,
              }}
            />
            <p className="font-mono text-[10px] text-white/70 uppercase">Next stop</p>
            <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/48 uppercase">
              {targetDistrict?.title}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold">{target.title}</p>
          <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">
            {direction} · {distance} world px
          </p>
        </div>
      )}
      <div className="mt-3 grid grid-cols-6 gap-1">
        {guideSteps.map((step) => (
          <span
            key={step.id}
            className={cn(
              "h-1.5 rounded-full transition",
              step.complete
                ? "bg-white"
                : step.id === activeStep?.id
                  ? "bg-white/55"
                  : "bg-white/12",
            )}
          />
        ))}
      </div>
    </aside>
  );
}

function GuideBeacon({ entity, step }: { entity: WorldEntity; step?: GuidedStep }) {
  const district = districtById.get(entity.district)!;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: entity.x - 22,
        top: entity.y - 22,
        width: entity.w + 44,
        height: entity.h + 44,
      }}
    >
      <div
        className="world-pulse absolute inset-0 rounded-[4px] border border-white/52"
        style={{ boxShadow: `0 0 34px ${district.accent}` }}
      />
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full border px-2 py-1 font-mono text-[9px] whitespace-nowrap uppercase shadow-lg backdrop-blur"
        style={{
          borderColor: `${district.accent}66`,
          color: district.accent,
          backgroundColor: "rgba(0,0,0,.78)",
        }}
      >
        Next: {step?.title ?? entity.title}
      </div>
    </div>
  );
}

function DistrictNavigator({
  currentDistrict,
  visitedDistricts,
  unlockedProof,
  collected,
  guideTarget,
  activeStep,
  completionPercent,
  onTravel,
  onClose,
  onRecruiterMode,
}: {
  currentDistrict?: District;
  visitedDistricts: DistrictId[];
  unlockedProof: string[];
  collected: string[];
  guideTarget?: WorldEntity;
  activeStep?: GuidedStep;
  completionPercent: number;
  onTravel: (districtId: DistrictId) => void;
  onClose: () => void;
  onRecruiterMode: () => void;
}) {
  const guideDistrict = guideTarget ? districtById.get(guideTarget.district) : undefined;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/76 p-3 backdrop-blur-md md:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="world-map-title"
        className="glass-panel max-h-[94dvh] w-full max-w-6xl overflow-hidden rounded"
      >
        <div className="grid max-h-[94dvh] overflow-y-auto lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[460px] border-b border-white/10 bg-black p-4 md:p-6 lg:border-r lg:border-b-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(255,255,255,.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),transparent_44%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-fg-muted font-mono text-[10px] tracking-[0.2em] uppercase">
                    Navigator
                  </p>
                  <h2 id="world-map-title" className="mt-2 text-3xl font-semibold md:text-5xl">
                    World Map
                  </h2>
                  <p className="text-fg-secondary mt-3 max-w-xl text-sm leading-6">
                    Jump between districts without breaking the playable route. Use this when a
                    recruiter wants the fast version, then open proof rooms from the map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close world map"
                  className="text-fg-secondary flex h-10 shrink-0 items-center gap-2 rounded border border-white/15 bg-black/60 px-3 font-mono text-[10px] uppercase transition hover:border-white/40 hover:text-white"
                >
                  <X size={16} aria-hidden />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-fg-muted font-mono text-[9px] uppercase">Completion</p>
                  <p className="mt-1 text-2xl font-semibold">{completionPercent}%</p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-fg-muted font-mono text-[9px] uppercase">Districts found</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {visitedDistricts.length}/{districts.length}
                  </p>
                </div>
                <div className="rounded border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-fg-muted font-mono text-[9px] uppercase">Current district</p>
                  <p className="mt-1 truncate text-lg font-semibold">
                    {currentDistrict?.title ?? "Between districts"}
                  </p>
                </div>
              </div>

              {guideTarget && (
                <div className="mt-5 rounded border border-white/12 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Sparkles size={14} aria-hidden />
                    <p className="font-mono text-[10px] tracking-[0.16em] text-white/58 uppercase">
                      Guided next stop
                    </p>
                    {guideDistrict && (
                      <span
                        className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase"
                        style={{
                          borderColor: `${guideDistrict.accent}55`,
                          color: guideDistrict.accent,
                        }}
                      >
                        {guideDistrict.title}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold">{guideTarget.title}</p>
                      <p className="text-fg-secondary mt-1 max-w-2xl text-sm leading-5">
                        {activeStep?.detail ?? guideTarget.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTravel(guideTarget.district)}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded border border-white bg-white px-3 font-mono text-xs text-black transition hover:bg-white/88"
                    >
                      Travel to next stop
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded border border-white/12 bg-white/[0.025] p-3">
                <div className="relative aspect-[236/154] overflow-hidden border border-white/10 bg-[#050505]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  {districts.map((district) => {
                    const visited = visitedDistricts.includes(district.id);
                    const isCurrent = currentDistrict?.id === district.id;
                    const isGuide = guideTarget?.district === district.id;

                    return (
                      <button
                        key={district.id}
                        type="button"
                        onClick={() => onTravel(district.id)}
                        className={cn(
                          "absolute border text-left transition hover:scale-[1.015] focus:outline-none",
                          isCurrent ? "z-20" : "z-10",
                        )}
                        style={{
                          left: `${(district.x / WORLD.width) * 100}%`,
                          top: `${(district.y / WORLD.height) * 100}%`,
                          width: `${(district.w / WORLD.width) * 100}%`,
                          height: `${(district.h / WORLD.height) * 100}%`,
                          borderColor: isCurrent
                            ? district.accent
                            : isGuide
                              ? "#ffffff"
                              : "rgba(255,255,255,.18)",
                          background: visited
                            ? `linear-gradient(135deg, ${district.glow}, rgba(255,255,255,.035))`
                            : "rgba(255,255,255,.055)",
                          boxShadow: isCurrent
                            ? `0 0 28px ${district.accent}66`
                            : isGuide
                              ? `0 0 20px ${district.accent}55`
                              : undefined,
                        }}
                        aria-label={`Travel to ${district.title}`}
                      >
                        <span className="absolute top-1 left-1 rounded bg-black/72 px-1.5 py-0.5 font-mono text-[8px] text-white/75 uppercase">
                          {district.title}
                        </span>
                        {isCurrent && (
                          <span className="absolute right-1 bottom-1 rounded bg-white px-1.5 py-0.5 font-mono text-[7px] text-black uppercase">
                            Here
                          </span>
                        )}
                        {isGuide && !isCurrent && (
                          <span className="world-pulse absolute right-1 bottom-1 size-2 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
                  District Select
                </p>
                <h3 className="mt-1 text-2xl font-semibold">Choose the next room.</h3>
              </div>
              <button
                type="button"
                onClick={onRecruiterMode}
                className="hidden h-10 shrink-0 items-center rounded border border-white bg-white px-3 font-mono text-xs text-black md:inline-flex"
              >
                Recruiter Mode
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {districts.map((district) => {
                const stats = getDistrictProgress({
                  districtId: district.id,
                  unlockedProof,
                  collected,
                });
                const isCurrent = currentDistrict?.id === district.id;
                const isVisited = visitedDistricts.includes(district.id);
                const travelPoint = districtTravelPoints[district.id];

                return (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => onTravel(district.id)}
                    className={cn(
                      "group rounded border bg-black/34 p-3 text-left transition hover:-translate-y-0.5 hover:border-white/35",
                      isCurrent ? "border-white/45" : "border-white/10",
                    )}
                    style={{
                      boxShadow: isCurrent ? `0 0 28px ${district.accent}30` : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: district.accent,
                              boxShadow: `0 0 14px ${district.accent}`,
                            }}
                          />
                          <p className="font-mono text-[10px] text-white/58 uppercase">
                            {travelPoint.label}
                          </p>
                          {isVisited && <CheckCircle2 size={13} aria-hidden />}
                        </div>
                        <p className="mt-1 text-base font-semibold">{district.title}</p>
                        <p className="text-fg-muted mt-1 text-xs">{district.subtitle}</p>
                      </div>
                      <span className="rounded border border-white/12 px-2 py-1 font-mono text-[9px] text-white/58 uppercase transition group-hover:border-white/32 group-hover:text-white">
                        {isCurrent ? "Center" : "Travel"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded border border-white/10 bg-white/[0.035] p-2">
                        <p className="text-fg-muted font-mono text-[8px] uppercase">Proof rooms</p>
                        <p className="mt-1 font-mono text-xs">
                          {stats.proofUnlocked}/{stats.proofTotal}
                        </p>
                      </div>
                      <div className="rounded border border-white/10 bg-white/[0.035] p-2">
                        <p className="text-fg-muted font-mono text-[8px] uppercase">Tokens</p>
                        <p className="mt-1 font-mono text-xs">
                          {stats.tokenCollected}/{stats.tokenTotal}
                        </p>
                      </div>
                      <div className="rounded border border-white/10 bg-white/[0.035] p-2">
                        <p className="text-fg-muted font-mono text-[8px] uppercase">Next</p>
                        <p className="mt-1 truncate font-mono text-xs">
                          {stats.nextStop?.title ?? "Clear"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NearbyPrompt({
  entity,
  unlocked,
  project,
}: {
  entity: WorldEntity;
  unlocked: boolean;
  project?: Project;
}) {
  const district = districtById.get(entity.district)!;
  const preset = getShowroomPreset(entity, project);
  const media = getEntityMedia(entity, project);
  const previewMedia = media[0];
  const caseStudy = project?.caseStudySlug
    ? caseStudies.find((study) => study.slug === project.caseStudySlug)
    : undefined;
  const verb =
    entity.kind === "collectible"
      ? "Collect proof token"
      : unlocked
        ? "Review proof room"
        : (entity.actionLabel ?? (entity.kind === "npc" ? "Talk" : "Open proof room"));
  const statusLabel =
    entity.kind === "collectible" ? "Proof token" : (project?.status ?? preset.proofType);

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(94vw,640px)] -translate-x-1/2 rounded border border-white/18 bg-black/80 p-3 text-left shadow-[0_18px_70px_rgba(0,0,0,.38)] backdrop-blur md:bottom-8">
      <div className="grid gap-3 sm:grid-cols-[1fr_9.5rem]">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 size-2 shrink-0 rounded-full"
            style={{ backgroundColor: district.accent, boxShadow: `0 0 18px ${district.accent}` }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-fg-muted font-mono text-[10px] uppercase">Nearby proof stop</p>
              <span
                className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase"
                style={{
                  borderColor: `${district.accent}55`,
                  color: district.accent,
                  backgroundColor: `${district.accent}10`,
                }}
              >
                {district.title}
              </span>
              <span className="text-fg-muted rounded border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase">
                {statusLabel}
              </span>
              {caseStudy && (
                <span className="rounded border border-white/16 px-2 py-0.5 font-mono text-[9px] text-white/68 uppercase">
                  Case study
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold md:text-base">{entity.title}</p>
            <p className="text-fg-secondary mt-1 line-clamp-2 text-xs leading-5">
              {project?.description ?? entity.subtitle}
            </p>
            <div className="mt-2 rounded border border-white/10 bg-white/[0.035] p-2">
              <p className="text-fg-muted font-mono text-[9px] uppercase">What this proves</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/72">
                {project?.proof ?? preset.recruiterRead}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 sm:block">
          <div className="relative min-h-20 overflow-hidden rounded border border-white/12 bg-white/[0.035] sm:h-24">
            {previewMedia ? (
              <Image
                src={previewMedia.src}
                alt=""
                fill
                sizes="160px"
                className="object-cover object-top brightness-[1.08] contrast-[1.05]"
              />
            ) : (
              <div
                className="flex h-full min-h-20 items-center justify-center font-mono text-[10px] font-semibold text-black uppercase"
                style={{
                  background: `linear-gradient(135deg, ${entity.accent}, ${district.secondary})`,
                }}
              >
                {entity.collectibleLabel ?? preset.proofType.slice(0, 3)}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-transparent" />
            <p className="absolute right-2 bottom-2 left-2 truncate font-mono text-[9px] text-white/76 uppercase">
              {previewMedia
                ? `${media.length} media asset${media.length === 1 ? "" : "s"}`
                : "Open proof"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col justify-center text-right sm:mt-2">
            <p className="font-mono text-[10px] text-white/75 uppercase">{verb}</p>
            <p className="text-fg-muted mt-1 font-mono text-[9px] uppercase">E / Enter</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMap({
  player,
  activeEntity,
  visitedDistricts,
  currentDistrict,
  onOpen,
}: {
  player: { x: number; y: number };
  activeEntity?: WorldEntity;
  visitedDistricts: DistrictId[];
  currentDistrict?: District;
  onOpen: () => void;
}) {
  return (
    <div className="absolute right-4 bottom-24 z-40 hidden w-56 rounded border border-white/12 bg-black/72 p-3 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur md:block">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapIcon size={12} aria-hidden />
          <p className="text-fg-muted font-mono text-[10px] uppercase">World Map</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open district navigator"
          className="rounded border border-white/12 px-2 py-1 font-mono text-[9px] text-white/64 uppercase transition hover:border-white/35 hover:text-white"
        >
          Open
        </button>
      </div>
      <div className="relative aspect-[236/154] border border-white/10 bg-white/[0.03]">
        {districts.map((district) => (
          <span
            key={district.id}
            className={cn(
              "absolute border transition",
              currentDistrict?.id === district.id ? "opacity-100" : "opacity-65",
            )}
            style={{
              left: `${(district.x / WORLD.width) * 100}%`,
              top: `${(district.y / WORLD.height) * 100}%`,
              width: `${(district.w / WORLD.width) * 100}%`,
              height: `${(district.h / WORLD.height) * 100}%`,
              borderColor:
                currentDistrict?.id === district.id ? district.accent : "rgba(255,255,255,.14)",
              backgroundColor: visitedDistricts.includes(district.id)
                ? `${district.accent}24`
                : "rgba(255,255,255,.08)",
            }}
          />
        ))}
        <span
          className="world-token absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            left: `${(player.x / WORLD.width) * 100}%`,
            top: `${(player.y / WORLD.height) * 100}%`,
          }}
        />
      </div>
      <p className="text-fg-muted mt-2 min-h-4 truncate font-mono text-[10px]">
        {activeEntity
          ? `Near: ${activeEntity.title}`
          : currentDistrict
            ? `In: ${currentDistrict.title}`
            : "Find a building, NPC, or token"}
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
          aria-label="Move up"
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
          aria-label="Move left"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowLeft", true)}
          onPointerUp={() => onDirection("ArrowLeft", false)}
          onPointerCancel={() => onDirection("ArrowLeft", false)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move down"
          className={buttonClass}
          onPointerDown={() => onDirection("ArrowDown", true)}
          onPointerUp={() => onDirection("ArrowDown", false)}
          onPointerCancel={() => onDirection("ArrowDown", false)}
        >
          ↓
        </button>
        <button
          type="button"
          aria-label="Move right"
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
        aria-label="Interact with nearby proof stop"
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
  const [mapOpen, setMapOpen] = useState(false);
  const [recruiterViewed, setRecruiterViewed] = useState(false);
  const [visitedDistricts, setVisitedDistricts] = useState<DistrictId[]>(["hometown"]);
  const [unlockedProof, setUnlockedProof] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    title: string;
    body: string;
    accent: string;
  } | null>(null);
  const [facing, setFacing] = useState<Facing>("down");
  const [moving, setMoving] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const pressed = useRef<Record<string, boolean>>({});
  const movingRef = useRef(false);
  const facingRef = useRef<Facing>("down");
  const achievementCountRef = useRef(0);
  const achievementIdsRef = useRef<Set<string>>(new Set());

  const collectibleCount = useMemo(
    () => entities.filter((entity) => entity.kind === "collectible").length,
    [],
  );

  const currentDistrict = useMemo(() => getCurrentDistrict(player), [player]);

  const achievements = useMemo(
    () => getAchievements({ collected, unlockedProof, visitedDistricts, recruiterViewed }),
    [collected, unlockedProof, visitedDistricts, recruiterViewed],
  );
  const unlockedAchievementCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;
  const guideState = useMemo(() => {
    const guideSteps = getGuideSteps({ unlockedProof, recruiterViewed });
    const activeGuideStep = guideSteps.find((step) => !step.complete);
    const targetId =
      activeGuideStep?.targetIds.find((id) => !unlockedProof.includes(id)) ??
      activeGuideStep?.targetIds[0];

    return {
      guideSteps,
      activeGuideStep,
      guideTarget: targetId ? entityById.get(targetId) : undefined,
    };
  }, [recruiterViewed, unlockedProof]);

  const progressTotal =
    districts.length + collectibleCount + unlockableEntityIds.length + achievements.length;
  const progressCount = Math.min(
    progressTotal,
    visitedDistricts.length + collected.length + unlockedProof.length + unlockedAchievementCount,
  );
  const completionPercent = Math.round((progressCount / progressTotal) * 100);

  const objectiveText = guideState.activeGuideStep
    ? `${guideState.activeGuideStep.title}: ${guideState.activeGuideStep.detail}`
    : collected.length < 3
      ? `Collect ${3 - collected.length} more proof token${3 - collected.length === 1 ? "" : "s"} to unlock the early proof path.`
      : unlockedProof.length < 4
        ? `Enter ${4 - unlockedProof.length} more project or experience stop${4 - unlockedProof.length === 1 ? "" : "s"} to deepen the proof report.`
        : "Open Recruiter Mode when you want the clean summary.";

  const announce = useCallback((title: string, body: string, accent: string) => {
    setNotification({ title, body, accent });
    window.setTimeout(() => {
      setNotification((current) => (current?.title === title ? null : current));
    }, 2400);
  }, []);

  const openRecruiterMode = useCallback(() => {
    setRecruiterViewed(true);
    setMapOpen(false);
    setRecruiterMode(true);
  }, []);

  const resetWorldProgress = useCallback(() => {
    try {
      window.localStorage.removeItem(WORLD_SAVE_KEY);
    } catch {}

    pressed.current = {};
    movingRef.current = false;
    setStarted(false);
    setPlayer(spawn);
    setFocusedEntity(null);
    setCollected([]);
    setRecruiterMode(false);
    setMapOpen(false);
    setRecruiterViewed(false);
    setVisitedDistricts(["hometown"]);
    setUnlockedProof([]);
    setFacing("down");
    facingRef.current = "down";
    setMoving(false);
    achievementCountRef.current = 0;
    achievementIdsRef.current = new Set();
    announce(
      "World reset",
      "Progress cleared on this device. Recruiter Mode still works anytime.",
      "#ffffff",
    );
  }, [announce]);

  const travelToDistrict = useCallback(
    (districtId: DistrictId) => {
      const district = districtById.get(districtId);
      const point = districtTravelPoints[districtId];
      if (!district || !point) return;

      pressed.current = {};
      movingRef.current = false;
      setMoving(false);
      setStarted(true);
      setFocusedEntity(null);
      setRecruiterMode(false);
      setMapOpen(false);
      setPlayer({
        x: clamp(point.x, 20, WORLD.width - PLAYER.width - 20),
        y: clamp(point.y, 20, WORLD.height - PLAYER.height - 20),
      });
      facingRef.current = "down";
      setFacing("down");
      setVisitedDistricts((current) =>
        current.includes(districtId) ? current : [...current, districtId],
      );
      announce("World map travel", `${district.title}: ${point.label}`, district.accent);
    },
    [announce],
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
        announce("Proof token collected", entity.proof[0] ?? entity.title, entity.accent);
        setFocusedEntity(entity);
        return;
      }
      if (entity.id === "resume-terminal") {
        setUnlockedProof((current) =>
          current.includes(entity.id) ? current : [...current, entity.id],
        );
        announce(
          "Recruiter summary unlocked",
          "Resume, projects, skills, and contact in one view.",
          entity.accent,
        );
        openRecruiterMode();
        return;
      }
      if (unlockableEntityIds.includes(entity.id)) {
        setUnlockedProof((current) =>
          current.includes(entity.id) ? current : [...current, entity.id],
        );
        announce("Proof unlocked", `${entity.title} added to the world path.`, entity.accent);
      }
      setFocusedEntity(entity);
    },
    [activeEntity, announce, openRecruiterMode],
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
    try {
      const raw = window.localStorage.getItem(WORLD_SAVE_KEY);
      if (raw) {
        const saved = normalizeSavedWorldState(JSON.parse(raw));
        if (saved) {
          setCollected(saved.collected);
          setUnlockedProof(saved.unlockedProof);
          setVisitedDistricts(
            saved.visitedDistricts.length ? saved.visitedDistricts : ["hometown"],
          );
          setRecruiterViewed(saved.recruiterViewed);
          setPlayer(saved.player);
        }
      }
    } catch {}

    setSaveLoaded(true);
  }, []);

  useEffect(() => {
    if (!saveLoaded) return;

    const hasProgress =
      collected.length > 0 ||
      unlockedProof.length > 0 ||
      visitedDistricts.length > 1 ||
      recruiterViewed ||
      player.x !== spawn.x ||
      player.y !== spawn.y;

    if (!hasProgress) {
      try {
        window.localStorage.removeItem(WORLD_SAVE_KEY);
      } catch {}
      return;
    }

    const saveTimer = window.setTimeout(() => {
      try {
        const nextSave: WorldSaveState = {
          collected,
          unlockedProof,
          visitedDistricts,
          recruiterViewed,
          player,
        };
        window.localStorage.setItem(WORLD_SAVE_KEY, JSON.stringify(nextSave));
      } catch {}
    }, 250);

    return () => window.clearTimeout(saveTimer);
  }, [collected, player, recruiterViewed, saveLoaded, unlockedProof, visitedDistricts]);

  useEffect(() => {
    if (!started || !currentDistrict || visitedDistricts.includes(currentDistrict.id)) return;
    setVisitedDistricts((current) =>
      current.includes(currentDistrict.id) ? current : [...current, currentDistrict.id],
    );
    announce(
      "District discovered",
      `${currentDistrict.title}: ${currentDistrict.subtitle}`,
      currentDistrict.accent,
    );
  }, [announce, currentDistrict, started, visitedDistricts]);

  useEffect(() => {
    if (!started && !recruiterViewed) {
      achievementCountRef.current = unlockedAchievementCount;
      achievementIdsRef.current = new Set(
        achievements
          .filter((achievement) => achievement.unlocked)
          .map((achievement) => achievement.id),
      );
      return;
    }
    if (unlockedAchievementCount <= achievementCountRef.current) {
      achievementCountRef.current = unlockedAchievementCount;
      achievementIdsRef.current = new Set(
        achievements
          .filter((achievement) => achievement.unlocked)
          .map((achievement) => achievement.id),
      );
      return;
    }

    const previousAchievementIds = achievementIdsRef.current;
    const latestAchievement = achievements.find(
      (achievement) => achievement.unlocked && !previousAchievementIds.has(achievement.id),
    );

    if (latestAchievement) {
      announce(
        "Achievement unlocked",
        `${latestAchievement.title}: ${latestAchievement.detail}`,
        latestAchievement.accent,
      );
    }
    achievementCountRef.current = unlockedAchievementCount;
    achievementIdsRef.current = new Set(
      achievements
        .filter((achievement) => achievement.unlocked)
        .map((achievement) => achievement.id),
    );
  }, [achievements, announce, recruiterViewed, started, unlockedAchievementCount]);

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
        if (!focusedEntity && !recruiterMode && !mapOpen) interact();
      }
      if (
        event.key.toLowerCase() === "e" &&
        started &&
        !focusedEntity &&
        !recruiterMode &&
        !mapOpen
      ) {
        interact();
      }
      if (event.key.toLowerCase() === "r") {
        openRecruiterMode();
      }
      if (event.key.toLowerCase() === "m" && started && !focusedEntity && !recruiterMode) {
        event.preventDefault();
        setMapOpen((current) => !current);
      }
      if (event.key === "Escape") {
        if (mapOpen) {
          setMapOpen(false);
        } else {
          setFocusedEntity(null);
          setRecruiterMode(false);
        }
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
  }, [focusedEntity, interact, mapOpen, openRecruiterMode, recruiterMode, started]);

  useEffect(() => {
    if (!started || focusedEntity || recruiterMode || mapOpen) {
      movingRef.current = false;
      setMoving(false);
      return;
    }
    let frame = 0;
    const tick = () => {
      const keys = pressed.current;
      const dx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
      const dy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
      const nextMoving = Boolean(dx || dy);
      if (movingRef.current !== nextMoving) {
        movingRef.current = nextMoving;
        setMoving(nextMoving);
      }
      if (dx || dy) {
        const nextFacing: Facing =
          Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
        if (facingRef.current !== nextFacing) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
        }
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
  }, [focusedEntity, mapOpen, recruiterMode, started]);

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
            <span>{currentDistrict ? currentDistrict.title : "Between districts"}</span>
            <span>{completionPercent}% complete</span>
            <span>Move: WASD / arrows</span>
            <span>Interact: E / Enter</span>
            <span>Recruiter: R</span>
            <span>Map: M</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              aria-label="Open world map"
              className="text-fg-secondary inline-flex h-9 items-center gap-2 rounded border border-white/15 bg-black/45 px-3 font-mono text-xs transition hover:border-white/40 hover:text-white"
            >
              <MapIcon size={13} aria-hidden />
              <span className="hidden sm:inline">World Map</span>
              <span className="sm:hidden">Map</span>
            </button>
            <button
              type="button"
              onClick={openRecruiterMode}
              aria-label="Open Recruiter Mode"
              className="inline-flex h-9 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black"
            >
              <span className="hidden sm:inline">Recruiter Mode</span>
              <span className="sm:hidden">Recruiter</span>
            </button>
          </div>
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
            <DistrictPanel
              key={district.id}
              district={district}
              discovered={visitedDistricts.includes(district.id)}
            />
          ))}

          <div className="absolute top-[280px] left-[630px] h-[28px] w-[1160px] border-y border-white/12 bg-[#5b5650]/70 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" />
          <div className="absolute top-[690px] left-[800px] h-[28px] w-[980px] rotate-[18deg] border-y border-white/12 bg-[#3b4550]/70 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" />
          <div className="absolute top-[600px] left-[900px] h-[760px] w-[28px] border-x border-white/12 bg-[#4c3f64]/70 shadow-[inset_1px_0_0_rgba(255,255,255,.08)]" />

          {worldProps.map((prop) => (
            <div
              key={prop.id}
              className="absolute z-10"
              style={{
                left: prop.x,
                top: prop.y,
                width: prop.w,
                height: prop.h,
                imageRendering: "pixelated",
              }}
            >
              <PropSprite prop={prop} />
            </div>
          ))}

          {worldBillboards.map((billboard) => {
            const entity = entityById.get(billboard.entityId);
            if (!entity) return null;

            return (
              <WorldBillboardSprite
                key={billboard.id}
                billboard={billboard}
                active={activeEntity?.id === entity.id}
                unlocked={unlockedProof.includes(entity.id)}
                onOpen={() => interact(entity)}
              />
            );
          })}

          {started && guideState.guideTarget && !focusedEntity && !recruiterMode && !mapOpen && (
            <GuideBeacon entity={guideState.guideTarget} step={guideState.activeGuideStep} />
          )}

          {entities.map((entity) => (
            <EntitySprite
              key={entity.id}
              entity={entity}
              active={activeEntity?.id === entity.id}
              collected={collected.includes(entity.id)}
              unlocked={unlockedProof.includes(entity.id)}
              onInteract={() => interact(entity)}
            />
          ))}

          <div
            className="absolute z-40"
            style={{ left: player.x, top: player.y, width: PLAYER.width, height: PLAYER.height }}
          >
            <PixelKenan facing={facing} moving={moving} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed top-16 left-3 z-40 max-w-[calc(100vw-1.5rem)] rounded border border-white/12 bg-black/72 p-3 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur md:left-5">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: currentDistrict?.accent ?? "#fff" }}
          />
          <p className="text-fg-muted font-mono text-[10px] uppercase">
            Current Objective · {currentDistrict?.title ?? "World Path"}
          </p>
        </div>
        <p className="text-fg-secondary mt-1 max-w-md text-sm">{objectiveText}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionPercent}%`,
              background: `linear-gradient(90deg, ${currentDistrict?.accent ?? "#fff"}, #ffffff)`,
            }}
          />
        </div>
      </div>

      {started && !focusedEntity && !recruiterMode && !mapOpen && (
        <GuidePanel
          guideSteps={guideState.guideSteps}
          activeStep={guideState.activeGuideStep}
          target={guideState.guideTarget}
          player={player}
        />
      )}

      {notification && (
        <div className="world-notification fixed top-[4.5rem] left-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded border border-white/16 bg-black/78 p-3 shadow-[0_18px_70px_rgba(0,0,0,.42)] backdrop-blur">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: notification.accent,
                boxShadow: `0 0 18px ${notification.accent}`,
              }}
            />
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-white">{notification.body}</p>
            </div>
          </div>
        </div>
      )}

      {activeEntity && started && !focusedEntity && !recruiterMode && !mapOpen && (
        <NearbyPrompt
          entity={activeEntity}
          unlocked={unlockedProof.includes(activeEntity.id)}
          project={getProject(activeEntity.projectSlug)}
        />
      )}

      <QuestBoard
        visitedDistricts={visitedDistricts}
        collected={collected}
        unlockedProof={unlockedProof}
        achievements={achievements}
        recruiterViewed={recruiterViewed}
      />

      <MiniMap
        player={player}
        activeEntity={activeEntity}
        visitedDistricts={visitedDistricts}
        currentDistrict={currentDistrict}
        onOpen={() => setMapOpen(true)}
      />

      <div className="fixed bottom-4 left-4 z-40 hidden rounded border border-white/12 bg-black/72 p-3 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur md:block">
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
        <p className="text-fg-muted mt-3 border-t border-white/10 pt-2 font-mono text-[9px] uppercase">
          Achievements {unlockedAchievementCount} / {achievements.length}
        </p>
      </div>

      <ControlPad onDirection={setDirection} onInteract={() => interact()} />

      {mapOpen && (
        <DistrictNavigator
          currentDistrict={currentDistrict}
          visitedDistricts={visitedDistricts}
          unlockedProof={unlockedProof}
          collected={collected}
          guideTarget={guideState.guideTarget}
          activeStep={guideState.activeGuideStep}
          completionPercent={completionPercent}
          onTravel={travelToDistrict}
          onClose={() => setMapOpen(false)}
          onRecruiterMode={openRecruiterMode}
        />
      )}

      {!started && !recruiterMode && (
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
                Interactive Portfolio Route
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
                  {saveLoaded && progressCount > 1 ? "Resume Kenan World" : "Start Kenan World"}
                </button>
                {saveLoaded && progressCount > 1 && (
                  <button
                    type="button"
                    onClick={resetWorldProgress}
                    className="text-fg-muted inline-flex h-12 items-center gap-2 rounded border border-white/12 px-4 font-mono text-sm transition hover:border-white/35 hover:text-white"
                  >
                    <RotateCcw size={14} aria-hidden />
                    Reset progress
                  </button>
                )}
                <button
                  type="button"
                  onClick={openRecruiterMode}
                  className="text-fg-secondary inline-flex h-12 items-center rounded border border-white/20 px-5 font-mono text-sm transition hover:border-white/45 hover:text-white"
                >
                  Open Recruiter Mode
                </button>
              </div>
              <div className="text-fg-muted mt-8 grid gap-2 border-t border-white/10 pt-5 font-mono text-[10px] uppercase sm:grid-cols-3">
                <span>Move: WASD / arrows / touch</span>
                <span>Interact: E / Enter / tap</span>
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
          onRecruiterMode={openRecruiterMode}
        />
      )}

      {recruiterMode && (
        <RecruiterMode
          collectedCount={collected.length}
          collectibleCount={collectibleCount}
          achievements={achievements}
          unlockedProofCount={unlockedProof.length}
          onResetProgress={resetWorldProgress}
          onClose={() => setRecruiterMode(false)}
        />
      )}
    </main>
  );
}
