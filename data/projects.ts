export type ProjectCategory =
  | "FoFit Ecosystem"
  | "AI / Agent Tools"
  | "Cybersecurity / Cloud"
  | "Web Apps / Business Builds"
  | "Mobile Apps"
  | "Experiments / Archive";

export type ProjectStatus = "Live" | "In Progress" | "Prototype" | "Archived";

export type ProjectMedia = {
  src: string;
  alt: string;
  type: "image";
  label: string;
  source: "live" | "local" | "repo" | "generated";
};

export type ProjectVisual =
  | "fofit"
  | "coach"
  | "agentroom"
  | "aws"
  | "soc"
  | "netwatch"
  | "portfolio"
  | "archive"
  | "mobile"
  | "business";

export type Project = {
  slug: string;
  title: string;
  repo: string;
  category: ProjectCategory;
  status: ProjectStatus;
  description: string;
  longDescription: string;
  problem?: string;
  built?: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  media: ProjectMedia[];
  featured: boolean;
  caseStudy: boolean;
  caseStudySlug?: string;
  tags: string[];
  priority: number;
  visual: ProjectVisual;
  notes: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  repo: string;
  summary: string;
  problem: string;
  role: string;
  techStack: string[];
  keyFeatures: string[];
  technicalChallenges: string[];
  learnings: string[];
  screenshotPrompt: string;
};

export const projectCategories: ProjectCategory[] = [
  "FoFit Ecosystem",
  "AI / Agent Tools",
  "Cybersecurity / Cloud",
  "Web Apps / Business Builds",
  "Mobile Apps",
  "Experiments / Archive",
];

export const projectStatuses: ProjectStatus[] = ["Live", "In Progress", "Prototype", "Archived"];

const github = (repo: string) => `https://github.com/CypherAi-hub/${repo}`;

const projectImage = (
  src: string,
  alt: string,
  label: string,
  source: ProjectMedia["source"],
): ProjectMedia => ({
  src,
  alt,
  label,
  source,
  type: "image",
});

export const projects: Project[] = [
  {
    slug: "fofit",
    title: "FoFit",
    repo: "CypherAi-hub/fofit",
    category: "FoFit Ecosystem",
    status: "Live",
    description:
      "AI-powered fitness tracking app built with React Native, Expo, TypeScript, and Supabase.",
    longDescription:
      "Main FoFit mobile product proof: training, Cypher AI support, workout logging, profile, nutrition, and product-system screenshots pulled from the active FoFit app repo.",
    problem:
      "Make training plans, workout logging, and progression feel adaptive instead of static.",
    built:
      "A mobile-first product foundation with auth, workout flows, Supabase-backed data, and AI-assisted fitness workflows.",
    techStack: ["React Native", "Expo", "TypeScript", "Supabase", "OpenAI API"],
    githubUrl: github("fofit"),
    liveUrl: "https://fofit.vercel.app",
    media: [
      projectImage(
        "/media/projects/fofit/fofit-train.png",
        "FoFit mobile Train screen with workout plan and session controls",
        "Mobile Train screen",
        "local",
      ),
      projectImage(
        "/media/projects/fofit/fofit-cypher-chat.png",
        "FoFit Cypher AI mobile chat screen",
        "Cypher AI chat",
        "local",
      ),
      projectImage(
        "/media/projects/fofit/fofit-workout-flow.png",
        "FoFit active workout screen with a logged set",
        "Workout flow",
        "local",
      ),
      projectImage(
        "/media/projects/fofit/fofit-discover.png",
        "FoFit Discover screen showing workout and content imagery",
        "Discover surface",
        "local",
      ),
      projectImage(
        "/media/projects/fofit/fofit-profile.png",
        "FoFit athlete profile screen",
        "Athlete profile",
        "local",
      ),
      projectImage(
        "/media/projects/fofit/fofit-nutrition.png",
        "FoFit nutrition screen",
        "Nutrition screen",
        "local",
      ),
    ],
    featured: true,
    caseStudy: true,
    caseStudySlug: "fofit",
    tags: ["fitness-tech", "mobile", "ai", "product"],
    priority: 1,
    visual: "fofit",
    notes:
      "Primary media is from verified app screenshots in the active FoFit repo; the live URL currently opens an auth/login surface.",
  },
  {
    slug: "fofit-coach",
    title: "FoFit Coach",
    repo: "CypherAi-hub/fofit-coach",
    category: "FoFit Ecosystem",
    status: "In Progress",
    description:
      "Coach and team platform for programming, roster workflows, athlete delivery, and FoFit ecosystem operations.",
    longDescription:
      "FoFit Coach is the team-facing product surface: coach programming, roster workflow, athlete preview, publishing, and workspace setup.",
    problem:
      "Give coaches a serious post-signup product surface instead of a landing-page-only experience.",
    built:
      "Dashboard, team setup, athlete access patterns, invite flow hardening, and launch-readiness workflows.",
    techStack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Vercel"],
    githubUrl: github("fofit-coach"),
    liveUrl: "https://fofit-coach.vercel.app",
    media: [
      projectImage(
        "/media/projects/fofit-coach/fofit-coach-live.png",
        "FoFit Coach live marketing and product workflow preview",
        "Live coach product surface",
        "live",
      ),
    ],
    featured: true,
    caseStudy: true,
    caseStudySlug: "fofit-coach",
    tags: ["coach platform", "b2b", "supabase", "dashboard"],
    priority: 2,
    visual: "coach",
    notes:
      "Captured from the public FoFit Coach deployment; authenticated dashboard screenshots should be added when demo access is ready.",
  },
  {
    slug: "agentroom",
    title: "AgentRoom",
    repo: "CypherAi-hub/AgentRoom",
    category: "AI / Agent Tools",
    status: "Prototype",
    description:
      "Local mission control for AI coding agents with checkpoints, commands, blockers, validation, and proof capture.",
    longDescription:
      "AgentRoom packages an agent-run workflow into a product surface for commands, blockers, validation, checkpoints, and proof capture.",
    problem: "Keep multi-agent coding work observable, auditable, and easier to steer.",
    built:
      "A command-center interface for agent runs, status tracking, validation checkpoints, and screenshot/video proof.",
    techStack: ["TypeScript", "React", "Next.js", "Agent Workflows", "Vercel"],
    githubUrl: github("AgentRoom"),
    liveUrl: "https://agent-room-theta.vercel.app",
    media: [
      projectImage(
        "/media/projects/agentroom/agentroom-dashboard.png",
        "AgentRoom live landing page with mission-control product preview",
        "Live AgentRoom page",
        "live",
      ),
    ],
    featured: true,
    caseStudy: true,
    caseStudySlug: "agentroom",
    tags: ["agents", "developer tools", "workflow", "validation"],
    priority: 3,
    visual: "agentroom",
    notes:
      "Captured from the public deployment; add logged-in mission-control screenshots when available.",
  },
  {
    slug: "aws-image-label-generator",
    title: "AWS Image Label Generator",
    repo: "CypherAi-hub/aws-image-label-generator",
    category: "Cybersecurity / Cloud",
    status: "Prototype",
    description:
      "AWS-based image labeling system using Rekognition and S3 to detect objects and visualize bounding boxes with Python.",
    longDescription:
      "Cloud ML proof project showing Python, AWS Rekognition, S3-style image processing, and generated labeled output images.",
    problem:
      "Show a practical cloud ML pipeline with scoped AWS services and scriptable image analysis.",
    built:
      "Python tooling that connects S3 input, Rekognition label detection, and generated visual outputs.",
    techStack: ["Python", "boto3", "AWS Rekognition", "S3", "Cloud"],
    githubUrl: github("aws-image-label-generator"),
    media: [
      projectImage(
        "/media/projects/aws-image-label-generator/aws-image-label-generator-output-apple.png",
        "AWS Image Label Generator output labeling an apple with confidence",
        "Rekognition output: apple",
        "repo",
      ),
      projectImage(
        "/media/projects/aws-image-label-generator/aws-image-label-generator-output-shoes.png",
        "AWS Image Label Generator output labeling shoes with confidence",
        "Rekognition output: shoes",
        "repo",
      ),
    ],
    featured: true,
    caseStudy: true,
    caseStudySlug: "aws-image-label-generator",
    tags: ["aws", "python", "rekognition", "cloud"],
    priority: 4,
    visual: "aws",
    notes: "Output images came from the public repo; no AWS credentials were inspected or used.",
  },
  {
    slug: "soc-monitor",
    title: "SOC Monitor",
    repo: "CypherAi-hub/soc-monitor",
    category: "Cybersecurity / Cloud",
    status: "Prototype",
    description:
      "Browser-based SOC analyst console with packet investigation, rule detection, MITRE mapping, follow-stream reconstruction, and timeline replay.",
    longDescription:
      "Defensive cybersecurity simulation with a real browser UI for analyst-style triage, packet review, alerts, rules, and timeline workflows.",
    problem:
      "Turn defensive security concepts into an interactive analyst workflow without live capture or scanning.",
    built:
      "Defensive simulation UI for alert triage, packet-style investigation, ATT&CK context, and timeline review.",
    techStack: ["TypeScript", "React", "Security UX", "MITRE ATT&CK", "Simulation"],
    githubUrl: github("soc-monitor"),
    media: [
      projectImage(
        "/media/projects/soc-monitor/soc-monitor-dashboard.png",
        "SOC Monitor dashboard with simulated network events and alert severity charts",
        "SOC dashboard",
        "local",
      ),
      projectImage(
        "/media/projects/soc-monitor/soc-monitor-packet-explorer.png",
        "SOC Monitor packet explorer screen",
        "Packet explorer",
        "local",
      ),
      projectImage(
        "/media/projects/soc-monitor/soc-monitor-mitre-rules.png",
        "SOC Monitor MITRE detection rules screen",
        "MITRE rules",
        "local",
      ),
      projectImage(
        "/media/projects/soc-monitor/soc-monitor-alerts.png",
        "SOC Monitor alerts screen",
        "Alerts view",
        "local",
      ),
    ],
    featured: true,
    caseStudy: true,
    caseStudySlug: "soc-monitor",
    tags: ["soc", "cybersecurity", "mitre", "defensive simulation"],
    priority: 5,
    visual: "soc",
    notes:
      "Captured from a local run of the public repo in a scratch folder; no live capture or scanning was performed.",
  },
  {
    slug: "netwatch",
    title: "Netwatch",
    repo: "CypherAi-hub/Netwatch",
    category: "Cybersecurity / Cloud",
    status: "Prototype",
    description:
      "SOC-style network monitoring system using Supabase for real-time metrics ingestion, alerting, and backend automation.",
    longDescription:
      "Backend-oriented Supabase monitoring build with typed schema, RLS posture, metric ingestion scripts, alert triggers, and simulator workflow.",
    problem: "Model the cadence of a lightweight SOC monitoring surface with live-style telemetry.",
    built:
      "Realtime dashboard patterns for metrics ingestion, anomaly flags, alert review, and security operations practice.",
    techStack: ["TypeScript", "Supabase", "PostgreSQL", "Realtime", "Security Monitoring"],
    githubUrl: github("Netwatch"),
    media: [],
    featured: true,
    caseStudy: true,
    caseStudySlug: "netwatch",
    tags: ["network monitoring", "supabase", "soc", "alerts"],
    priority: 6,
    visual: "netwatch",
    notes:
      "Public repo currently documents the dashboard as planned; keep this card as backend/cloud proof until UI screenshots exist.",
  },
  {
    slug: "kenan-portfolio",
    title: "Kenan Portfolio",
    repo: "CypherAi-hub/kenan-portfolio",
    category: "Web Apps / Business Builds",
    status: "In Progress",
    description:
      "Personal technical portfolio built to present featured projects, case studies, experience, and a complete build archive.",
    longDescription:
      "This portfolio is the curated proof system tying together featured builds, case-study placeholders, reusable project data, screenshots, and a complete repo archive.",
    problem: "Make a recruiter-ready proof system instead of a flat list of repositories.",
    built:
      "A Next.js portfolio with central project data, reusable sections, filtered archive, and Vercel-ready setup.",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    githubUrl: github("kenan-portfolio"),
    media: [
      projectImage(
        "/media/projects/kenan-portfolio/kenan-portfolio-home.png",
        "Kenan Larry portfolio homepage with featured build system",
        "Portfolio homepage",
        "local",
      ),
    ],
    featured: true,
    caseStudy: false,
    tags: ["portfolio", "recruiting", "nextjs", "frontend"],
    priority: 7,
    visual: "portfolio",
    notes:
      "Screenshot is generated from the local production build after the media showcase is wired.",
  },
  {
    slug: "fofit-website",
    title: "FoFit Website",
    repo: "CypherAi-hub/fofit-website",
    category: "FoFit Ecosystem",
    status: "Live",
    description:
      "Marketing, waitlist, and product site for the FoFit ecosystem and marketplace direction.",
    longDescription:
      "Public FoFit marketing/product surface with product storytelling, app-screen assets, waitlist direction, and ecosystem positioning.",
    techStack: ["TypeScript", "React", "Vite", "Product Marketing", "Vercel"],
    githubUrl: github("fofit-website"),
    liveUrl: "https://fofit-website.vercel.app",
    media: [
      projectImage(
        "/media/projects/fofit-website/fofit-website-home.png",
        "FoFit website live homepage",
        "Live FoFit website",
        "live",
      ),
      projectImage(
        "/media/projects/fofit-website/fofit-website-workout-screen.png",
        "FoFit website app screenshot showing workout home",
        "Workout app screen",
        "local",
      ),
      projectImage(
        "/media/projects/fofit-website/fofit-website-cypher-screen.png",
        "FoFit website app screenshot showing Cypher brief",
        "Cypher app screen",
        "local",
      ),
    ],
    featured: false,
    caseStudy: false,
    tags: ["marketing site", "fofit", "vite", "marketplace"],
    priority: 8,
    visual: "fofit",
    notes: "Captured from the live deployment and copied from the active website repo assets.",
  },
  {
    slug: "fofit-content-lab",
    title: "FoFit Content Lab",
    repo: "CypherAi-hub/fofit-content-lab",
    category: "FoFit Ecosystem",
    status: "Prototype",
    description:
      "FoFit content and workout-media tooling. Details should be expanded as the pipeline stabilizes.",
    longDescription:
      "FoFit media/content tooling lane for workout assets, content preparation, and supporting automation work.",
    techStack: ["Python", "Content Pipeline", "Workout Media", "Automation"],
    githubUrl: github("fofit-content-lab"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["fofit", "content", "media tooling", "python"],
    priority: 9,
    visual: "fofit",
    notes:
      "No dedicated UI screenshot found yet; use this archive entry as a content-pipeline placeholder until media tooling is documented.",
  },
  {
    slug: "cypher-ai-hub",
    title: "CypherAi-hub",
    repo: "CypherAi-hub/CypherAi-hub",
    category: "Experiments / Archive",
    status: "Archived",
    description:
      "GitHub profile repository used for the public account README and identity surface.",
    longDescription:
      "Public GitHub profile README repository. This belongs in the archive as identity/supporting surface, not a featured product build.",
    techStack: ["Markdown", "GitHub Profile"],
    githubUrl: github("CypherAi-hub"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["profile", "github", "identity"],
    priority: 10,
    visual: "archive",
    notes: "Profile repository; no product UI expected.",
  },
  {
    slug: "ultraflips",
    title: "UltraFlips",
    repo: "CypherAi-hub/ultraflips",
    category: "Web Apps / Business Builds",
    status: "Prototype",
    description:
      "AI-powered TCG flipping platform for scanning, pricing, portfolio tracking, and marketplace intelligence.",
    longDescription:
      "UltraFlips is a TCG/product-commerce build exploring scanning, pricing, portfolio intelligence, and marketplace workflows.",
    techStack: ["TypeScript", "React", "Marketplace UX", "AI Workflow", "Vercel"],
    githubUrl: github("ultraflips"),
    liveUrl: "https://ultraflips-app.vercel.app",
    media: [
      projectImage(
        "/media/projects/ultraflips/ultraflips-home.png",
        "UltraFlips live product homepage",
        "Live UltraFlips app",
        "live",
      ),
    ],
    featured: false,
    caseStudy: false,
    tags: ["tcg", "marketplace", "ai", "pricing"],
    priority: 11,
    visual: "business",
    notes: "Captured from the live deployment.",
  },
  {
    slug: "ultraflips-website",
    title: "UltraFlips Website",
    repo: "CypherAi-hub/ultraflips-website",
    category: "Web Apps / Business Builds",
    status: "Prototype",
    description: "Marketing website for UltraFlips, an AI-powered TCG flipping platform.",
    longDescription:
      "Marketing website for the UltraFlips product family, focused on communicating the AI-powered TCG flipping concept.",
    techStack: ["TypeScript", "React", "Marketing Site", "Vercel"],
    githubUrl: github("ultraflips-website"),
    liveUrl: "https://ultraflips-website.vercel.app",
    media: [
      projectImage(
        "/media/projects/ultraflips-website/ultraflips-website-home.png",
        "UltraFlips website live homepage",
        "Live UltraFlips website",
        "live",
      ),
    ],
    featured: false,
    caseStudy: false,
    tags: ["marketing", "tcg", "frontend"],
    priority: 12,
    visual: "business",
    notes: "Captured from the live deployment.",
  },
  {
    slug: "cypher-os-archive",
    title: "Cypher OS Archive",
    repo: "CypherAi-hub/cypher-os-archive",
    category: "AI / Agent Tools",
    status: "Archived",
    description: "Repository archive for an earlier AI command-system build iteration.",
    longDescription:
      "Earlier AI command-system/archive repository included to show experimentation history without overstating current product status.",
    techStack: ["TypeScript", "AI Systems", "Archive"],
    githubUrl: github("cypher-os-archive"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["ai tools", "archive", "systems"],
    priority: 13,
    visual: "archive",
    notes: "Archive repo; media should be added only if original screenshots are recovered.",
  },
  {
    slug: "hirecrate-staffing",
    title: "Hirecrate Staffing",
    repo: "CypherAi-hub/hirecrate-staffing",
    category: "Web Apps / Business Builds",
    status: "Prototype",
    description: "Staffing business build with public-site and lightweight dashboard workflows.",
    longDescription:
      "Hirecrate Staffing is a business-facing web build for staffing requests, job-seeker flow, and lightweight operational presentation.",
    techStack: ["TypeScript", "React", "Business Workflow", "Vercel"],
    githubUrl: github("hirecrate-staffing"),
    liveUrl: "https://hirecrate-staffing.vercel.app",
    media: [
      projectImage(
        "/media/projects/hirecrate-staffing/hirecrate-landing.png",
        "Hirecrate Staffing live landing page",
        "Live staffing site",
        "live",
      ),
    ],
    featured: false,
    caseStudy: false,
    tags: ["business", "staffing", "frontend"],
    priority: 14,
    visual: "business",
    notes: "Captured from the live deployment.",
  },
  {
    slug: "ruflo-os",
    title: "Ruflo OS",
    repo: "CypherAi-hub/ruflo-os",
    category: "AI / Agent Tools",
    status: "Prototype",
    description: "Experimental build in progress. More details coming soon.",
    longDescription:
      "Experimental AI/tooling repository included for completeness. Keep claims conservative until the product direction is documented.",
    techStack: ["Details Coming Soon"],
    githubUrl: github("ruflo-os"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["experimental", "ai tools"],
    priority: 15,
    visual: "archive",
    notes: "No reliable UI/media found in the local search pass.",
  },
  {
    slug: "omni",
    title: "Omni",
    repo: "CypherAi-hub/omni",
    category: "AI / Agent Tools",
    status: "In Progress",
    description:
      "Replit-style AI browser IDE for building, running, previewing, and publishing apps.",
    longDescription:
      "Omni is an AI browser IDE direction for building, running, previewing, and publishing applications from an integrated builder surface.",
    techStack: ["TypeScript", "AI IDE", "Browser Tooling", "Developer Experience"],
    githubUrl: github("omni"),
    media: [
      projectImage(
        "/media/projects/omni/omni-opengraph.png",
        "Omni local OpenGraph project artwork",
        "Omni project artwork",
        "local",
      ),
    ],
    featured: false,
    caseStudy: false,
    tags: ["ai ide", "developer tools", "apps"],
    priority: 16,
    visual: "agentroom",
    notes:
      "Local OpenGraph artwork found; add product UI screenshots once the IDE surface is ready for portfolio use.",
  },
  {
    slug: "ultraflips-mobile",
    title: "UltraFlips Mobile",
    repo: "CypherAi-hub/ultraflips-mobile",
    category: "Mobile Apps",
    status: "Prototype",
    description:
      "Mobile companion build for the UltraFlips product family. More details coming soon.",
    longDescription:
      "Mobile companion prototype for the UltraFlips product family. Included in the archive for completeness while details mature.",
    techStack: ["TypeScript", "Mobile", "Product Prototype"],
    githubUrl: github("ultraflips-mobile"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["mobile", "tcg", "prototype"],
    priority: 17,
    visual: "mobile",
    notes: "No mobile screenshot found in this pass.",
  },
  {
    slug: "stack-mode",
    title: "Stack Mode",
    repo: "CypherAi-hub/stack-mode",
    category: "Mobile Apps",
    status: "Prototype",
    description:
      "Money-discipline app for debt payoff, savings buckets, paycheck splits, daily lock-in, Roth pace, and bank-sync planning.",
    longDescription:
      "Personal-finance mobile product concept around debt payoff, savings buckets, paycheck allocation, and bank-sync planning.",
    techStack: ["Expo", "React Native", "Supabase", "Plaid", "TypeScript"],
    githubUrl: github("stack-mode"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["finance", "mobile", "supabase", "plaid"],
    priority: 18,
    visual: "mobile",
    notes: "No screenshot found in this pass; add mobile mockups or simulator captures later.",
  },
  {
    slug: "get-funded",
    title: "Get-funded",
    repo: "CypherAi-hub/Get-funded",
    category: "Experiments / Archive",
    status: "Prototype",
    description:
      "AI trading experiment focused on a one-job, one-goal path to getting funded. Details need refinement.",
    longDescription:
      "AI trading/funding experiment included in the archive. The description stays conservative until the repo has clearer product documentation.",
    techStack: ["AI Workflow", "Trading Experiment", "Details Coming Soon"],
    githubUrl: github("Get-funded"),
    media: [],
    featured: false,
    caseStudy: false,
    tags: ["experiment", "trading", "ai"],
    priority: 19,
    visual: "archive",
    notes: "No reliable UI/media found in the local search pass.",
  },
];

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.priority - b.priority);

export const foFitProjects = projects
  .filter((project) => project.category === "FoFit Ecosystem")
  .sort((a, b) => a.priority - b.priority);

export const caseStudies: CaseStudy[] = [
  {
    slug: "fofit",
    title: "FoFit",
    repo: "CypherAi-hub/fofit",
    summary:
      "AI fitness app case study covering the product foundation, mobile workflow, Supabase data model, and AI-assisted training path.",
    problem:
      "Fitness apps often split planning, logging, and progression into disconnected workflows. FoFit is framed around one adaptive training loop.",
    role: "Founder and builder across product, mobile UX, backend integration, and AI workflow direction.",
    techStack: ["React Native", "Expo", "TypeScript", "Supabase", "OpenAI API"],
    keyFeatures: [
      "Mobile-first workout and discovery flows",
      "Supabase-backed auth, data, and storage foundation",
      "AI-assisted plan and workout progression workflows",
      "FoFit ecosystem link into coach and website surfaces",
    ],
    technicalChallenges: [
      "Keeping mobile UX simple while the training engine grows",
      "Separating app, coach, and website repos without product drift",
      "Balancing generated workout content with honest product readiness",
    ],
    learnings: [
      "Product clarity matters as much as implementation speed",
      "Real simulator/runtime QA catches issues that static code review misses",
      "AI features need tight workflow boundaries to feel useful",
    ],
    screenshotPrompt:
      "Add current iPhone screenshots of Train, Active Workout, Discover, and onboarding.",
  },
  {
    slug: "fofit-coach",
    title: "FoFit Coach",
    repo: "CypherAi-hub/fofit-coach",
    summary:
      "Coach platform case study covering team setup, roster workflows, athlete delivery, and launch-readiness hardening.",
    problem:
      "A coach product has to work after signup. The dashboard must support teams, groups, athletes, invites, and lifecycle integrity.",
    role: "Product and full-stack builder focused on the authenticated coach workflow and launch blockers.",
    techStack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Vercel"],
    keyFeatures: [
      "Coach dashboard and onboarding surface",
      "Team, roster, and group workflow direction",
      "Athlete delivery and invite hardening",
      "Launch-readiness checklist and QA loops",
    ],
    technicalChallenges: [
      "Avoiding landing-page polish when the real product path needs work",
      "Handling local environment gaps without misreading product health",
      "Keeping coach repo work separate from FoFit marketing-site work",
    ],
    learnings: [
      "B2B product surfaces need operational workflows, not just hero copy",
      "Auth and role redirects need rendered QA, not assumptions",
      "Launch readiness is a system of small verified behaviors",
    ],
    screenshotPrompt: "Add dashboard, onboarding, team, invite, and athlete-delivery screenshots.",
  },
  {
    slug: "agentroom",
    title: "AgentRoom",
    repo: "CypherAi-hub/AgentRoom",
    summary:
      "AI developer-tooling case study for monitoring agent work through live checkpoints, commands, blockers, validation, and proof.",
    problem:
      "Agentic coding workflows need visibility. Without checkpoints and proof, it is hard to know what is blocked, validated, or ready.",
    role: "Product and frontend builder shaping the workflow model and interface.",
    techStack: ["TypeScript", "React", "Next.js", "Agent Workflows", "Vercel"],
    keyFeatures: [
      "Mission-control view for agent runs",
      "Command, blocker, validation, and checkpoint surfaces",
      "Screenshot/video proof framing",
      "Local workflow language for AI coding sessions",
    ],
    technicalChallenges: [
      "Designing status language that stays readable under active work",
      "Keeping the interface useful for humans steering agents",
      "Making validation evidence visible without overwhelming the page",
    ],
    learnings: [
      "Operational clarity is a product feature",
      "Good agent tools need human-readable state, not only logs",
      "Proof capture turns vague progress into inspectable progress",
    ],
    screenshotPrompt: "Add mission-control, checkpoint, blocker, and validation screenshots.",
  },
  {
    slug: "aws-image-label-generator",
    title: "AWS Image Label Generator",
    repo: "CypherAi-hub/aws-image-label-generator",
    summary:
      "Cloud ML case study for an AWS Rekognition and S3 image-labeling pipeline written in Python.",
    problem:
      "Show practical AWS fundamentals through a small, inspectable system that ingests images and returns labels with bounding-box context.",
    role: "Builder responsible for AWS service wiring, Python scripting, and output visualization.",
    techStack: ["Python", "boto3", "AWS S3", "AWS Rekognition", "Cloud"],
    keyFeatures: [
      "S3 image input workflow",
      "Rekognition label detection",
      "Bounding-box visualization path",
      "Scriptable Python entry point",
    ],
    technicalChallenges: [
      "Keeping cloud access scoped and understandable",
      "Representing model output in a recruiter-readable demo",
      "Making the pipeline small enough to explain quickly",
    ],
    learnings: [
      "Cloud demos are stronger when they show service boundaries",
      "Python plus AWS SDKs is a practical proof stack",
      "Good screenshots matter for non-interactive cloud projects",
    ],
    screenshotPrompt: "Add before/after image-label outputs and a short architecture diagram.",
  },
  {
    slug: "soc-monitor",
    title: "SOC Monitor",
    repo: "CypherAi-hub/soc-monitor",
    summary:
      "Cybersecurity case study for a defensive SOC analyst console with packet investigation and MITRE ATT&CK context.",
    problem:
      "Security learning becomes more tangible when investigation, detection, and timeline review are visible in one browser-based console.",
    role: "Builder focused on defensive simulation, UX, and investigation flow.",
    techStack: ["TypeScript", "React", "Security UX", "MITRE ATT&CK", "Simulation"],
    keyFeatures: [
      "Packet-style investigation",
      "Rule-based detection",
      "MITRE ATT&CK mapping",
      "Follow-stream reconstruction and timeline replay",
    ],
    technicalChallenges: [
      "Keeping the tool defensive and simulation-only",
      "Designing dense analyst UI without making it unreadable",
      "Explaining security value without exaggerating scope",
    ],
    learnings: [
      "Cybersecurity projects need explicit defensive boundaries",
      "Analyst tools should prioritize scanning, comparison, and context",
      "Realistic UI can teach workflow without needing live capture",
    ],
    screenshotPrompt:
      "Add alert queue, packet detail, MITRE mapping, and timeline replay screenshots.",
  },
  {
    slug: "netwatch",
    title: "Netwatch",
    repo: "CypherAi-hub/Netwatch",
    summary:
      "Network monitoring case study for realtime metrics ingestion, alerting, and SOC-style dashboard practice.",
    problem:
      "Network monitoring concepts are easier to demonstrate through a dashboard that shows telemetry, alert state, and backend automation.",
    role: "Builder focused on realtime product surface and monitoring workflows.",
    techStack: ["TypeScript", "Supabase", "PostgreSQL", "Realtime", "Security Monitoring"],
    keyFeatures: [
      "Realtime-style metrics ingestion",
      "Alert and anomaly surfaces",
      "Backend automation patterns",
      "SOC-style network monitoring dashboard",
    ],
    technicalChallenges: [
      "Making simulated telemetry feel legible and useful",
      "Connecting database events to UI state",
      "Keeping the scope clear for recruiters",
    ],
    learnings: [
      "Monitoring dashboards need strong information hierarchy",
      "Realtime data needs clear empty, normal, and alert states",
      "Supabase is useful for fast security-dashboard prototypes",
    ],
    screenshotPrompt:
      "Add dashboard, alert table, realtime metrics, and anomaly-detail screenshots.",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
