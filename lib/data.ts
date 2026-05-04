export type ProjectStatus = "live" | "active" | "early" | "shipped" | "private";

export type Project = {
  slug: string;
  index: string;
  title: string;
  status: ProjectStatus;
  category: string;
  blurb: string;
  body: string;
  stack: string[];
  links: { live?: string; github?: string; case?: string };
  visual: "fofit" | "cypher" | "ultraflips" | "netwatch" | "aws";
};

export const projects: Project[] = [
  {
    slug: "fofit",
    index: "P/01",
    title: "FoFit",
    status: "live",
    category: "MOBILE · AI",
    blurb: "AI fitness coach that builds & adapts plans from your real workout history.",
    body: "Founded and shipped solo. React Native + Expo on iOS, Supabase for auth/data/storage, OpenAI for plan generation and adaptive progression. Live at fofit.app.",
    stack: ["React Native", "Expo", "Supabase", "OpenAI", "TypeScript"],
    links: { live: "https://fofit.app", github: "https://github.com/CypherAi-hub" },
    visual: "fofit",
  },
  {
    slug: "cypher-os",
    index: "P/02",
    title: "Cypher OS",
    status: "active",
    category: "DESKTOP · AGENTIC AI",
    blurb: "Sovereign AI command system. 30+ specialized agents across 8 departments.",
    body: "Tauri 2 + React + TypeScript + SQLite. Local-first, privacy-respecting, built around an orchestration layer that routes tasks to domain-specialized agents.",
    stack: ["Tauri 2", "React", "TypeScript", "SQLite", "Rust"],
    links: { github: "https://github.com/CypherAi-hub" },
    visual: "cypher",
  },
  {
    slug: "ultraflips",
    index: "P/03",
    title: "UltraFlips",
    status: "early",
    category: "WEB · MARKETPLACE",
    blurb: "Pokémon TCG marketplace with AI-driven pricing and condition grading.",
    body: "Next.js 15 + Supabase + Stripe Connect for marketplace payments, Anthropic SDK for grading assistance, Inngest for background jobs (price syncs, payouts).",
    stack: ["Next.js 15", "Supabase", "Stripe Connect", "Anthropic", "Inngest"],
    links: {},
    visual: "ultraflips",
  },
  {
    slug: "netwatch",
    index: "P/04",
    title: "Netwatch",
    status: "shipped",
    category: "SECURITY · MONITORING",
    blurb: "SOC-style network monitoring dashboard with anomaly scoring.",
    body: "Supabase backend, real-time event ingestion, anomaly heuristics. Built to mirror the cadence of an entry-level SOC console.",
    stack: ["Supabase", "TypeScript", "Postgres", "Realtime"],
    links: { github: "https://github.com/CypherAi-hub" },
    visual: "netwatch",
  },
  {
    slug: "aws-image-label",
    index: "P/05",
    title: "AWS Image Label Generator",
    status: "shipped",
    category: "CLOUD · ML",
    blurb: "Python + boto3 pipeline using Rekognition for batch image labeling.",
    body: "Demonstrates IAM-scoped service access, S3 ingest, and Rekognition orchestration. Lightweight, scriptable, runs as a CLI.",
    stack: ["Python", "boto3", "AWS Rekognition", "S3"],
    links: { github: "https://github.com/CypherAi-hub" },
    visual: "aws",
  },
];

export type Writeup = {
  slug: string;
  index: string;
  category: string;
  title: string;
  summary: string;
  href: string;
};

// TODO(kenan): replace these placeholder writeups with real ones.
export const writeups: Writeup[] = [
  {
    slug: "todo-1",
    index: "W/01",
    category: "PHISHING SIM",
    title: "TODO: real writeup title",
    summary: "TODO: 1-2 sentence summary of the engagement, scope, and outcome.",
    href: "/writeups/todo-1",
  },
  {
    slug: "todo-2",
    index: "W/02",
    category: "PEN TEST",
    title: "TODO: real writeup title",
    summary: "TODO: replace with actual finding overview.",
    href: "/writeups/todo-2",
  },
  {
    slug: "todo-3",
    index: "W/03",
    category: "NETWORK",
    title: "TODO: real writeup title",
    summary: "TODO: real summary.",
    href: "/writeups/todo-3",
  },
  {
    slug: "todo-4",
    index: "W/04",
    category: "AI SECURITY",
    title: "TODO: real writeup title",
    summary: "TODO: real summary.",
    href: "/writeups/todo-4",
  },
  {
    slug: "todo-5",
    index: "W/05",
    category: "CLOUD",
    title: "TODO: real writeup title",
    summary: "TODO: real summary.",
    href: "/writeups/todo-5",
  },
  {
    slug: "todo-6",
    index: "W/06",
    category: "OSINT",
    title: "TODO: real writeup title",
    summary: "TODO: real summary.",
    href: "/writeups/todo-6",
  },
];

export const profile = {
  name: "KENAN LARRY",
  tagline: "Cybersecurity & AI · Builder · St. Louis",
  intro:
    "I build sovereign tools and ship products. Currently studying Cybersecurity & AI at Maryville University, doing pen tests and phishing simulations as a student consultant at Maryville Business Solutions, and architecting a personal AI command system called Cypher OS. I shipped FoFit solo and it's live in users' hands.",
  location: "St. Louis, MO",
  education: "B.S. Cybersecurity & AI, Maryville University · expected May 2028",
  currently: "Architecting Cypher OS · Building UltraFlips",
  openTo: "Internships · Security research · Founding-engineering work",
  email: "kenan@kenanlarry.dev",
  github: "https://github.com/CypherAi-hub",
  linkedin: "https://www.linkedin.com/in/kenan-larry",
  copyright: `© ${new Date().getFullYear()} Kenan Larry. Built in St. Louis.`,
};
