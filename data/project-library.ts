import { projects } from "./projects";

export const libraryCategories = [
  "All work",
  "Websites",
  "Apps",
  "Research",
  "AI & tools",
  "Security",
] as const;
export type LibraryCategory = Exclude<(typeof libraryCategories)[number], "All work">;
export type LibraryProject = {
  slug: string;
  title: string;
  category: LibraryCategory;
  status: string;
  description: string;
  detail: string;
  tags: string[];
  monogram: string;
  image?: string;
  imageAlt?: string;
  imageNote?: string;
  overview?: string;
  liveUrl?: string;
  sourceUrl?: string;
  notesUrl?: string;
};

// Public source links are explicit: a private repository is not a useful visitor destination.
const publicRepos = new Set([
  "aws-image-label-generator",
  "agentroom",
  "soc-monitor",
  "netwatch",
  "kenan-portfolio",
  "fofit-website",
  "cypher-ai-hub",
]);
const overrides: Record<string, Partial<LibraryProject>> = {
  fofit: {
    category: "Apps",
    status: "In development",
    overview: "/work/fofit",
    image: "/media/current/fofit-workout.webp",
    imageAlt: "FoFit workout screen",
    imageNote: "October 2026 development build.",
    description:
      "A fitness app connecting workout planning, session logging, nutrition, and the Cypher assistant.",
    detail:
      "An ongoing mobile product built around the daily training experience, with connected data and AI-assisted workflows. The app is in development; the product website is available to explore.",
  },
  "fofit-coach": {
    category: "Apps",
    liveUrl: "https://coach.fofit.app",
    description:
      "A coaching workspace for programming workouts and organizing athlete and team workflows.",
    detail:
      "The professional side of the FoFit ecosystem, with a web interface for coaching operations and training programs. The public product site is live; the platform continues to develop.",
  },
  agentroom: {
    category: "AI & tools",
    liveUrl: "https://www.agentroom.app",
    description:
      "A web experience for organizing AI agents and repeatable work in a shared workspace.",
    detail:
      "An early agent workspace exploring how people can structure tasks and collaborate with AI through a focused browser interface.",
  },
  "aws-image-label-generator": {
    category: "Security",
    description:
      "A Python cloud project that uses AWS Rekognition to identify labels in images stored in S3.",
  },
  "cyberlou-pentest-report": {
    status: "Completed report",
    liveUrl: "/reports/cyberlou-pentest-report.pdf",
    description:
      "A security assessment report presenting findings, risk ratings, and practical remediation.",
  },
  "kenan-portfolio": {
    title: "Kenan Larry Portfolio",
    category: "Websites",
    status: "Live website",
    liveUrl: "https://kenan-portfolio-wine.vercel.app",
    description:
      "My personal design and development website, project library, pricing estimator, and discovery-call booking experience.",
    detail:
      "A responsive Next.js portfolio with project overviews, a searchable work library, and Google Calendar booking. This is the November 2026 redesign; the earlier interactive Kenan World is also preserved.",
  },
  "fofit-website": {
    category: "Websites",
    status: "Live website",
    liveUrl: "https://fofit.app",
    description:
      "The public home for FoFit, introducing its training, nutrition, and connected product experience.",
  },
  "fofit-content-lab": {
    category: "AI & tools",
    description: "Content preparation and workout-media tooling for the FoFit product ecosystem.",
    detail:
      "An experimental Python tooling project for preparing workout assets and supporting repeatable content workflows.",
  },
  "cypher-ai-hub": {
    category: "Websites",
    title: "CypherAi-hub Profile",
    status: "Profile project",
    description:
      "A GitHub profile and developer identity page bringing projects and technical interests together.",
    detail:
      "A Markdown-based public profile and supporting identity surface for my development work.",
  },
  ultraflips: {
    title: "UltraFlips Web App",
    category: "Apps",
    status: "Web prototype",
    liveUrl: "https://ultraflips-app-cypherai-hubs-projects.vercel.app",
    description:
      "A browser-based trading-card product exploring collection, pricing, and marketplace research.",
  },
  "ultraflips-website": {
    category: "Websites",
    status: "Live website",
    liveUrl: "https://ultraflips.com",
    description:
      "A branded marketing website introducing the UltraFlips trading-card product family.",
  },
  "cypher-os-archive": {
    category: "AI & tools",
    description:
      "An earlier AI command-system experiment, preserved as part of the development archive.",
    detail:
      "An archived iteration exploring interfaces and workflows for an AI-assisted command system.",
  },
  "hirecrate-staffing": {
    title: "HireCrate Staffing",
    category: "Websites",
    status: "Live website",
    liveUrl: "https://www.hirecratestaffing.net",
    overview: "/work/hirecrate-staffing",
    image: "/media/current/hirecrate.webp",
    imageAlt: "HireCrate staffing website with employer and job-seeker paths",
    imageNote: "Website screenshot from the project archive.",
    description:
      "A staffing business website with clear paths for employers requesting workers and people looking for work.",
  },
  "ruflo-os": {
    category: "AI & tools",
    description: "An experimental workspace for organizing AI-assisted tasks and agent operations.",
    detail:
      "An early tooling repository exploring agent operations and controlled workflows. This entry represents a prototype, with no public app demo.",
  },
  omni: {
    title: "Omni Browser IDE",
    category: "AI & tools",
    status: "Prototype",
    description:
      "A browser-based development environment concept combining files, code, preview, and an AI assistant.",
    detail:
      "An earlier developer-tool prototype exploring an integrated app-building workspace. This IDE is a separate project from the Meridian market terminal that later used the Omni name.",
  },
  "ultraflips-mobile": {
    category: "Apps",
    status: "In development",
    overview: "/work/ultraflips",
    image: "/media/current/ultraflips-watchlist.webp",
    imageAlt: "UltraFlips mobile watchlist",
    imageNote: "October 2026 Simulator development preview.",
    description:
      "A mobile workspace for exact-card research, dated price references, watchlists, and collection management.",
    detail:
      "The mobile UltraFlips product brings card research and collection records together. Its workflows keep card variants, conditions, and source context visible. It remains in development.",
    tags: ["React Native", "Expo", "Supabase", "TCG", "Mobile"],
  },
  "stack-mode": {
    category: "Apps",
    description:
      "A personal-finance app prototype for savings goals, debt payoff, paycheck planning, and spending decisions.",
    detail:
      "An Expo and React Native foundation with editable money plans, local persistence, manual expense logging, and account sync wiring. Bank integration remains scaffolding; this is a development project.",
  },
  "get-funded": {
    title: "Get Funded",
    category: "Research",
    status: "Early experiment",
    description:
      "An early AI-assisted trading research experiment exploring a focused funding goal.",
    detail:
      "A small experimental repository from my research archive. It is documented as an early concept, without claims of trading performance, funded-account approval, or a finished service.",
    tags: ["AI workflow", "Research", "Experiment"],
  },
};

const existing: LibraryProject[] = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  category:
    p.category === "Cybersecurity / Cloud"
      ? "Security"
      : p.category === "Mobile Apps" || p.category === "FoFit Ecosystem"
        ? "Apps"
        : p.category === "AI / Agent Tools"
          ? "AI & tools"
          : "Websites",
  status: p.status === "In Progress" ? "In development" : p.status,
  description: p.description,
  detail: p.longDescription,
  tags: p.techStack.filter((t) => t !== "Details Coming Soon"),
  monogram: p.title
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
  sourceUrl: publicRepos.has(p.slug) ? p.githubUrl : undefined,
  notesUrl: p.caseStudySlug ? `/case-studies/${p.caseStudySlug}` : undefined,
  ...overrides[p.slug],
}));

const additions: LibraryProject[] = [
  {
    slug: "general-services",
    title: "General Services Request Desk",
    category: "Websites",
    status: "Live website",
    monogram: "GS",
    description:
      "A campus service portal for printing, badges, business cards, paper, and toner requests.",
    detail:
      "Built for Maryville’s General Services team, with mobile-friendly service forms, request references, requester accounts, and restricted staff workflows.",
    tags: ["Web design", "Forms", "Workflow", "Maryville"],
    image: "/media/current/general-services.jpg",
    imageAlt: "General Services public request website",
    imageNote: "Public request page. Staff information stays private.",
    overview: "/work/general-services",
    liveUrl: "https://general-services-request-desk.tomuchdrip.chatgpt.site/",
  },
  {
    slug: "meridian-atlas",
    title: "Meridian Atlas",
    category: "Research",
    status: "Local research app",
    monogram: "MA",
    description:
      "An interactive company-research workspace connecting corporate relationships, public filings, and financial evidence.",
    detail:
      "A visual research tool with expandable company graphs, financial dossiers, a source library, and saved investigations. SEC filing evidence and revenue breakdowns move through a review step before entering the graph. The workspace is a local research application.",
    tags: ["Research", "Data visualization", "SEC filings", "SQLite", "JavaScript"],
    image: "/media/current/meridian-atlas.webp",
    imageAlt: "Meridian Atlas company graph and financial research notebook",
    imageNote: "November 2026 local app screenshot. Figures shown are dated research context.",
    overview: "/work/meridian-atlas",
  },
  {
    slug: "meridian",
    title: "Meridian / Omni Terminal",
    category: "Research",
    status: "Paper research prototype",
    monogram: "M",
    description:
      "A market-research terminal with charts, watchlists, simulated orders, and separate paper-strategy records.",
    detail:
      "Meridian evolved into the Omni market terminal: a research interface for reviewing Solana market data and paper experiments. It keeps simulated accounts and research records separate. The project is paper-only; it does not demonstrate profitable trading or funded execution.",
    tags: ["React", "TypeScript", "PostgreSQL", "Charts", "Solana", "Paper trading"],
    image: "/media/current/meridian.webp",
    imageAlt: "Meridian Omni terminal with market chart and visibly labeled paper account",
    imageNote: "October 2026 paper-terminal screenshot. Balances and orders are simulated.",
    sourceUrl: "https://github.com/CypherAi-hub/meridian",
  },
  {
    slug: "fofit-web",
    title: "FoFit Web",
    category: "Apps",
    status: "In development",
    monogram: "FW",
    description:
      "A personal fitness command center for deeper planning, progress review, and training history on the web.",
    detail:
      "The desktop side of the FoFit ecosystem, organized around a command center, plan studio, progress, recovery, nutrition, and personal film workflows. This is an access-restricted development build.",
    tags: ["TypeScript", "React", "Supabase", "Fitness", "Dashboard"],
  },
  {
    slug: "support-shift",
    title: "Support Shift",
    category: "Security",
    status: "Private simulator",
    monogram: "SS",
    description:
      "A hands-on IT support game with fictional tickets, simulated tools, and escalation practice.",
    detail:
      "A private learning experience that recreates an IT support office through five fictional tickets. It uses simulated tools to practice investigation and safe escalation without touching real production systems.",
    tags: ["IT support", "Simulation", "Learning", "Web app"],
  },
  {
    slug: "fofit-platform-blueprint",
    title: "FoFit Platform Blueprint",
    category: "Apps",
    status: "Interactive blueprint",
    monogram: "FP",
    description:
      "An interactive planning tool connecting the roles of FoFit Mobile, Personal Web, and Coach OS.",
    detail:
      "A web-based product blueprint with product responsibilities and priorities, built to explain how the three FoFit experiences connect. It is a private planning interface.",
    tags: ["Product design", "React", "Roadmap", "Architecture"],
  },
  {
    slug: "trench-copilot",
    title: "Trench Copilot",
    category: "Research",
    status: "Read-only prototype",
    monogram: "TC",
    description:
      "A local market-research companion with a radar, watchlist, paper journal, and optional screen observation.",
    detail:
      "A read-only Solana research prototype with public market snapshots, manual tracking, source links, and journal exports. Optional local-model features explore screen observation. The tool has no wallet connection or order execution.",
    tags: ["JavaScript", "Local AI", "Research", "Solana", "Ollama"],
  },
  {
    slug: "cypher-form-alpha",
    title: "Cypher Form Alpha",
    category: "Research",
    status: "Research prototype",
    monogram: "CF",
    description: "A computer-vision research tool for analyzing side-view bodyweight squat clips.",
    detail:
      "A Python harness that separates pose extraction from rep-counting and movement metrics. It reports estimated measurements and abstains when the camera evidence is insufficient. This bounded prototype is not a clinical assessment tool.",
    tags: ["Python", "Computer vision", "MediaPipe", "Motion analysis"],
  },
  {
    slug: "launch-relay",
    title: "Launch Relay",
    category: "Websites",
    status: "Website prototype",
    monogram: "LR",
    description:
      "A service landing-page concept for helping Expo and React Native apps through release problems.",
    detail:
      "A focused business website prototype explaining an app-launch rescue service, its scope, process, and email intake. Included as a website build, rather than an active offer or availability commitment.",
    tags: ["Landing page", "Web design", "React", "Service business"],
  },
  {
    slug: "fofit-social-automation",
    title: "FoFit Media Automation",
    category: "AI & tools",
    status: "Local tooling",
    monogram: "FM",
    description:
      "A media pipeline that captures app screens, checks them, and packages reviewed social assets.",
    detail:
      "A Mac-based Node.js and Swift workflow for capturing authentic Simulator media, checking visible text, and preparing vertical video and feed formats. It creates review records and draft queue manifests; automatic publishing is not implemented in this project.",
    tags: ["Node.js", "Swift", "OCR", "FFmpeg", "Automation"],
  },
];

const order = [
  "general-services",
  "meridian-atlas",
  "fofit",
  "ultraflips-mobile",
  "hirecrate-staffing",
  "meridian",
  "fofit-website",
  "fofit-coach",
  "fofit-web",
  "ultraflips-website",
  "ultraflips",
  "agentroom",
];
export const projectLibrary = [...existing, ...additions].sort((a, b) => {
  const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
  return rank(a.slug) - rank(b.slug);
});
