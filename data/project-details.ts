export type ProjectResource = { label: string; url: string; description: string };
export type ProjectDetail = {
  audience: string;
  role: string;
  challenge: string;
  approach: string;
  features: { title: string; description: string }[];
  availability: string;
  related: string[];
  links: ProjectResource[];
  gallery: { src: string; alt: string; caption: string }[];
};

// Public-facing descriptions grounded in the owning source and project-chat briefs.
export const projectDetails: Record<string, ProjectDetail> = {
  "general-services": {
    audience: "Maryville faculty, students, and the General Services team.",
    role: "Website design, request-flow development, and deployment.",
    challenge:
      "Campus requests need the right information, a clear reference, and a reliable way for staff to follow up. Email alone makes it easy to separate a print job from its document.",
    approach:
      "I organized six services into one responsive request desk, with guided forms and separate experiences for requesters and staff.",
    features: [
      {
        title: "Six focused request forms",
        description:
          "Copy jobs, faculty and student badges, business cards, paper, and toner each have their own questions.",
      },
      {
        title: "PDF attachments",
        description:
          "Copy requests accept a PDF with the job. Downloads are restricted to the submitting account and authorized staff.",
      },
      {
        title: "Request tracking",
        description:
          "Guests receive a reference number; signed-in requesters can follow their submissions in a personal dashboard.",
      },
      {
        title: "Staff workflow",
        description:
          "A restricted queue supports reviewing requests and responding with the context in one place.",
      },
      {
        title: "A shareable department card",
        description:
          "A printable business card and QR code give the department another way to direct people to the website.",
      },
    ],
    availability:
      "The public request desk is live. Staff records and submitted files require the appropriate account access.",
    related: ["hirecrate-staffing", "fofit-coach"],
    links: [
      {
        label: "Open request desk",
        url: "https://general-services-request-desk.tomuchdrip.chatgpt.site/",
        description: "Explore the public campus service website.",
      },
      {
        label: "Department business card",
        url: "https://general-services-request-desk.tomuchdrip.chatgpt.site/business-card",
        description: "View the public card and website QR code.",
      },
    ],
    gallery: [],
  },
  fofit: {
    audience:
      "Individual lifters, recreational and competitive athletes, and people organizing their training and nutrition.",
    role: "Founder, product designer, and full-stack developer.",
    challenge:
      "Training plans, exercise logs, food tracking, and advice often live in separate tools. FoFit brings them into a connected daily experience.",
    approach:
      "I lead the mobile product and shared backend, working through the complete flow from planning a workout to logging it and reviewing progress.",
    features: [
      {
        title: "Plan and log training",
        description:
          "Review workouts, adjust exercises, record sets, and return to session history and progress.",
      },
      {
        title: "Discover exercises",
        description:
          "Explore a searchable movement library, muscle groups, programs, and equipment-matched sessions.",
      },
      {
        title: "Cypher guidance",
        description:
          "In-app conversations, source and method disclosures, and review steps for proposed plan changes.",
      },
      {
        title: "Nutrition tools",
        description:
          "Food search, barcode lookup, photo-assisted meal review, manual entries, recipes, and food and water diaries.",
      },
      {
        title: "Connected experiences",
        description:
          "Shared account and data infrastructure connects mobile training with personal web planning and coach workflows.",
      },
    ],
    availability:
      "The mobile app is in development and iOS release preparation. Explore the product website, personal web platform, or coach experience below. Mobile download access is not offered on this page.",
    related: ["fofit-web", "fofit-coach", "fofit-website", "cypher-form-alpha"],
    links: [
      {
        label: "Visit FoFit",
        url: "https://www.fofit.app/",
        description: "Public product website and fitness experience overview.",
      },
      {
        label: "Explore FoFit Web",
        url: "https://app.fofit.app/",
        description: "Public entry point for personal web planning.",
      },
      {
        label: "Explore FoFit Coach",
        url: "https://coach.fofit.app/",
        description: "Public entry point for coach programming.",
      },
    ],
    gallery: [
      {
        src: "/media/current/fofit-recipes.webp",
        alt: "FoFit recipe discovery screen from a development build",
        caption: "Recipe discovery · October 2026 development preview.",
      },
    ],
  },
  "meridian-atlas": {
    audience:
      "Independent researchers and analysts exploring companies, corporate relationships, and financial evidence.",
    role: "Creator and product lead: concept, research priorities, interface direction, and acceptance review.",
    challenge:
      "Company relationships are scattered across filings, registries, and announcements. A useful research tool must keep a connection attached to the evidence that supports it.",
    approach:
      "I shaped a visual research workspace with company maps, financial dossiers, saved investigations, and review controls. The implementation uses AI-assisted development.",
    features: [
      {
        title: "Interactive company networks",
        description:
          "Expand, drag, zoom, and filter a company graph; open the evidence behind a relationship.",
      },
      {
        title: "Financial dossiers",
        description:
          "Review SEC filings, reported financial history, and supported segment and geographic revenue disclosures.",
      },
      {
        title: "Corporate structure",
        description:
          "Explore consolidation records and reviewed subsidiary disclosures with identified source companies.",
      },
      {
        title: "Contracts and transactions",
        description:
          "Research acquisitions, investments, suppliers, and federal contracts with dates and archived source passages.",
      },
      {
        title: "Thesis investigations",
        description:
          "Follow an economic question through filings and supported issuer announcements to discover additional companies.",
      },
      {
        title: "Saved research",
        description:
          "Keep watchlists, notes, source history, and investigations together. Local monitoring runs while the server is active.",
      },
    ],
    availability:
      "A functional local prototype in active development. There is no public hosted demo or source repository. The screenshots show the research interface; displayed figures are dated context.",
    related: ["meridian", "trench-copilot"],
    links: [],
    gallery: [
      {
        src: "/media/current/atlas-company-map.png",
        alt: "Meridian Atlas company graph and financial dossier",
        caption: "Company map and research notebook · November 2026 local build.",
      },
    ],
  },
  "ultraflips-mobile": {
    audience:
      "Trading-card collectors and resellers researching cards and negotiating buying groups at card shows.",
    role: "Product lead and developer, using AI-assisted engineering.",
    challenge:
      "A card name alone is not enough to evaluate a listing. Printing, condition, grading, date, and source context all matter.",
    approach:
      "Shaped around my brother’s needs at card shows, I designed a workflow from scanning a card to confirming its exact version, inspecting price evidence, and calculating an offer.",
    features: [
      {
        title: "Scan and identify",
        description:
          "Camera and gallery workflows support raw and graded cards, optional front-and-back photos, retained images, and repeated scanning for buying groups.",
      },
      {
        title: "Confirm the exact version",
        description:
          "Review printing, language, condition, grading company, and grade before researching a card.",
      },
      {
        title: "Inspect the price evidence",
        description:
          "Review dated references, grade-specific values, original source links, and explanations when supporting evidence is missing.",
      },
      {
        title: "Explore completed sales",
        description:
          "Interactive scatterplots let collectors select grades, date ranges, and individual transactions. Raw market-reference history stays separate.",
      },
      {
        title: "Build a buying session",
        description:
          "Group multiple cards, adjust offers, use 70% and 80% buying guides, account for selling costs, and move purchases into inventory.",
      },
      {
        title: "Track the collection",
        description:
          "Keep inventory, watchlists, recent research, and market-trend views together.",
      },
      {
        title: "Photo-assisted review",
        description:
          "AI-assisted research and condition review include evidence and budget controls. Photo review is not a professional grading service.",
      },
      {
        title: "Deal Scout preview",
        description:
          "A targeted listing-search interface explores delivered costs and estimated margins. Live eBay retrieval remains unconfigured; review examples use labeled synthetic data.",
      },
    ],
    availability:
      "An internal iOS TestFlight beta, with a separate web app in development. Explore the public website and browser experience below. Mobile beta access is private; a public download is not offered on this page.",
    related: ["ultraflips", "ultraflips-website"],
    links: [
      {
        label: "Visit UltraFlips",
        url: "https://ultraflips.com/",
        description: "Public website for the UltraFlips brand.",
      },
      {
        label: "Web app — in development",
        url: "https://app.ultraflips.com/",
        description: "Separate browser application; development and sample content remain visible.",
      },
    ],
    gallery: [],
  },
  "hirecrate-staffing": {
    audience: "Employers requesting workers and job seekers looking for their next opportunity.",
    role: "Website design, frontend development, and business inquiry flows.",
    challenge:
      "Staffing websites serve two audiences with different goals. Both need a clear path without having to interpret the other audience’s messaging.",
    approach:
      "I structured the business website around employer and job-seeker journeys, supported by service information and direct calls to action.",
    features: [
      {
        title: "Employer journey",
        description: "A clear route for businesses to learn about staffing and request workers.",
      },
      {
        title: "Job-seeker journey",
        description: "A separate path for people exploring work opportunities.",
      },
      {
        title: "Service presentation",
        description: "Industry and service information explains what the staffing business offers.",
      },
      {
        title: "Responsive layout",
        description:
          "Navigation, content hierarchy, and inquiry calls to action adapt to phone and desktop screens.",
      },
    ],
    availability:
      "The public business website is live. Its inquiry forms belong to the staffing business; the portfolio links visitors to that existing site.",
    related: ["general-services", "launch-relay"],
    links: [
      {
        label: "Visit HireCrate Staffing",
        url: "https://www.hirecratestaffing.net/",
        description: "Explore the live employer and job-seeker website.",
      },
    ],
    gallery: [],
  },
  meridian: {
    audience: "People exploring market-data interfaces and controlled paper-research workflows.",
    role: "Product direction, terminal interface design, and research tooling development.",
    challenge:
      "A market workspace needs to keep charts, research, and simulated account activity understandable without confusing a paper experiment with an executed trade.",
    approach:
      "Meridian evolved into the Omni market terminal, combining a trading-style interface with separate research records and explicit paper-account context.",
    features: [
      {
        title: "Market workspace",
        description: "Review charts, market context, and watchlists in a terminal-style interface.",
      },
      {
        title: "Paper account",
        description:
          "Explore simulated order and account states with paper labeling visible in the interface.",
      },
      {
        title: "Research records",
        description:
          "Keep strategy experiments and supporting observations separate from account presentation.",
      },
      {
        title: "Data-quality work",
        description:
          "The research pipeline tracks missing or unknown information instead of treating incomplete records as established facts.",
      },
    ],
    availability:
      "A paper-research prototype. The public repository is available; no public live terminal or funded-trading result is claimed.",
    related: ["meridian-atlas", "trench-copilot"],
    links: [
      {
        label: "View public repository",
        url: "https://github.com/CypherAi-hub/meridian",
        description: "Inspect the public project source and documentation.",
      },
    ],
    gallery: [],
  },
  "fofit-website": {
    audience: "People discovering FoFit and deciding which part of the product fits their needs.",
    role: "Product storytelling, web design, and frontend development.",
    challenge:
      "A connected fitness product needs a clear public introduction before someone creates an account or tries an app.",
    approach:
      "I built the public product website around the training, nutrition, and Cypher experience, using real app visuals and links into the wider product family.",
    features: [
      {
        title: "Product introduction",
        description: "Explain the fitness experience through clear sections and visual examples.",
      },
      {
        title: "Real app imagery",
        description:
          "Show the mobile interface with development context rather than treating marketing artwork as a working dashboard.",
      },
      {
        title: "Connected destinations",
        description: "Guide visitors toward the personal web and coach experiences.",
      },
      {
        title: "Responsive product storytelling",
        description:
          "Keep the core message and next step readable across phone and desktop layouts.",
      },
    ],
    availability:
      "The marketing website is public. Product screenshots do not establish public mobile-store availability.",
    related: ["fofit", "fofit-web", "fofit-coach"],
    links: [
      {
        label: "Visit the website",
        url: "https://www.fofit.app/",
        description: "The public FoFit product homepage.",
      },
      {
        label: "View website source",
        url: "https://github.com/CypherAi-hub/fofit-website",
        description: "Public repository for the website.",
      },
    ],
    gallery: [],
  },
  "fofit-coach": {
    audience: "Personal trainers, independent coaches, and coaches managing athletes or teams.",
    role: "Founder, product design, full-stack implementation, and integration work.",
    challenge:
      "Coaching software has to support what happens after a program is written: organizing people, assigning work, and reviewing completion with the right access.",
    approach:
      "I developed the coach side of FoFit around programming, rosters, athlete delivery, and consent-aware review of shared training information.",
    features: [
      {
        title: "Coach workspace",
        description: "Organize programming and coaching operations in a dedicated web experience.",
      },
      {
        title: "Athlete and roster views",
        description:
          "Work with client and team structures rather than an unstructured list of workouts.",
      },
      {
        title: "Program delivery",
        description: "Assign training to athletes and connect it to completion records.",
      },
      {
        title: "Session review",
        description: "Review shared session information within ownership and consent boundaries.",
      },
      {
        title: "Shared product foundation",
        description:
          "Connect coaching workflows to FoFit’s account and training-data infrastructure.",
      },
    ],
    availability:
      "The public Coach entry page is live. Authenticated workflows are implemented in the project; the public landing page is not an anonymous demonstration of every feature.",
    related: ["fofit", "fofit-web", "fofit-platform-blueprint"],
    links: [
      {
        label: "Explore FoFit Coach",
        url: "https://coach.fofit.app/",
        description: "Public coach-programming entry point.",
      },
    ],
    gallery: [],
  },
  "fofit-web": {
    audience: "FoFit users who want a larger screen for planning training and reviewing progress.",
    role: "Founder, product design, frontend development, and shared-data integration.",
    challenge:
      "The phone is useful during a workout, but deeper plan editing and progress review benefit from a larger workspace.",
    approach:
      "I built the personal web side around planning, saved revisions, workout history, and private progress tools that connect to the mobile experience.",
    features: [
      {
        title: "Plan Studio",
        description: "Edit training plans, select exercises, and prepare workout drafts.",
      },
      {
        title: "Review changes",
        description: "Compare before and after states and keep saved revisions visible.",
      },
      {
        title: "Progress workspace",
        description: "Review saved workouts, readiness check-ins, and body measurements.",
      },
      {
        title: "Body Lab",
        description: "Organize private photos and video for comparison and progress review.",
      },
      {
        title: "Connected accounts",
        description:
          "Use the shared FoFit foundation while respecting account ownership and role boundaries.",
      },
    ],
    availability:
      "A public entry page is available at app.fofit.app. The workspace requires account access; newer local workflow changes are not all established as deployed by the landing page.",
    related: ["fofit", "fofit-coach", "fofit-platform-blueprint"],
    links: [
      {
        label: "Explore FoFit Web",
        url: "https://app.fofit.app/",
        description: "Public entry point for planning on web and training on phone.",
      },
    ],
    gallery: [],
  },
  "ultraflips-website": {
    audience: "Collectors discovering the UltraFlips brand and product direction.",
    role: "Brand presentation, marketing website design, and frontend development.",
    challenge:
      "A specialist card product needs to explain its value clearly before visitors reach the detailed research tools.",
    approach:
      "I created a distinct public website for the UltraFlips brand, with workflow previews, beta entry points, and a roadmap for the product.",
    features: [
      {
        title: "Brand introduction",
        description: "Present the product identity and collector-focused positioning.",
      },
      {
        title: "Product storytelling",
        description:
          "Explain card research through workflow previews and beta or waitlist entry points.",
      },
      {
        title: "Responsive website",
        description:
          "Bring product information, FAQs, pricing, roadmap, and legal navigation into a responsive public destination.",
      },
    ],
    availability:
      "The public marketing website is live. Its roadmap includes future ambitions; the mobile and web project pages describe their current implementation separately.",
    related: ["ultraflips-mobile", "ultraflips"],
    links: [
      {
        label: "Visit UltraFlips",
        url: "https://ultraflips.com/",
        description: "Public UltraFlips website.",
      },
    ],
    gallery: [],
  },
  ultraflips: {
    audience: "Collectors exploring card research and collection tools in a browser.",
    role: "Product design and web-application development.",
    challenge:
      "Card research becomes fragmented when collection records, price references, and marketplace context are spread across different tools.",
    approach:
      "I developed a browser workspace for card research, collection records, and saved research alongside the mobile product.",
    features: [
      {
        title: "Catalog and card research",
        description:
          "A browser interface for searching cards and exploring the available research context.",
      },
      {
        title: "Collection and inventory",
        description:
          "Dedicated collection and inventory interfaces keep card records in the product workspace.",
      },
      {
        title: "Saved research",
        description:
          "Watchlist and journal interfaces support returning to cards and organizing research notes.",
      },
      {
        title: "Account workspace",
        description:
          "Authentication, settings, and AI-related interfaces provide the foundation for a connected browser experience.",
      },
    ],
    availability:
      "A deployed web app in development. The public homepage includes seeded sample content; authenticated workflows and current pricing coverage are still being refined. Mobile and web features differ.",
    related: ["ultraflips-mobile", "ultraflips-website"],
    links: [
      {
        label: "Web app — in development",
        url: "https://app.ultraflips.com/",
        description: "Public entry point with development and sample content.",
      },
      {
        label: "Visit brand website",
        url: "https://ultraflips.com/",
        description: "The separate marketing website.",
      },
    ],
    gallery: [],
  },
  agentroom: {
    audience: "Builders organizing AI-assisted work across projects, tasks, and tools.",
    role: "Product concept, interface design, and prototype development.",
    challenge:
      "When agent work is spread across tools, it becomes difficult to see what is running, what needs a decision, and what has been completed.",
    approach:
      "AgentRoom explores a project-based command center with rooms, agents, workflows, approvals, and activity. The public source currently describes a mock-data MVP.",
    features: [
      {
        title: "Project rooms",
        description: "Separate work into focused rooms with their own task and activity views.",
      },
      {
        title: "Agent and task directories",
        description: "Browse the people-like roles and work items within the prototype.",
      },
      {
        title: "Workflow and approval views",
        description: "Make proposed actions and pending decisions visible in the interface.",
      },
      {
        title: "Integration foundation",
        description:
          "Adapter interfaces establish a future connection model; mock data drives the documented MVP.",
      },
      {
        title: "Activity context",
        description: "Keep events and workflow state together so a person can follow the work.",
      },
    ],
    availability:
      "A public website and source repository are available. The documented MVP uses mock data; live integrations and autonomous external actions are not represented as completed.",
    related: ["cypher-os-archive", "ruflo-os", "omni"],
    links: [
      {
        label: "Visit AgentRoom",
        url: "https://www.agentroom.app/",
        description: "Public website and product presentation.",
      },
      {
        label: "View public source",
        url: "https://github.com/CypherAi-hub/AgentRoom",
        description: "Inspect the MVP scope and source code.",
      },
    ],
    gallery: [],
  },
  "aws-image-label-generator": {
    audience:
      "People learning how cloud storage and image-analysis services fit into a small working pipeline.",
    role: "Python implementation, AWS service integration, and output presentation.",
    challenge:
      "An image-analysis demo is easier to understand when the input, cloud service, and resulting labels are connected in a simple workflow.",
    approach:
      "I connected S3 image inputs to AWS Rekognition through Python and boto3, keeping the pipeline small enough to inspect.",
    features: [
      {
        title: "S3 image inputs",
        description: "Use an image stored in a cloud bucket as the analysis input.",
      },
      {
        title: "Rekognition labels",
        description: "Request object labels from AWS’s image-analysis service.",
      },
      {
        title: "Python processing",
        description: "Handle the service call and returned label data in a scriptable workflow.",
      },
    ],
    availability:
      "A source-available cloud learning project. The repository contains the implementation; there is no public hosted web application.",
    related: ["netwatch", "soc-monitor"],
    links: [
      {
        label: "View Python project",
        url: "https://github.com/CypherAi-hub/aws-image-label-generator",
        description: "Public source, setup, and project overview.",
      },
    ],
    gallery: [],
  },
  "soc-monitor": {
    audience: "Students and aspiring security analysts practicing investigation and triage.",
    role: "Defensive simulation design, frontend development, and investigation UX.",
    challenge:
      "Security concepts become easier to learn when an analyst can move from an alert to the underlying packets, conversation, and timeline.",
    approach:
      "I built a browser-based console around simulated and offline-imported network metadata, with connected investigation surfaces.",
    features: [
      {
        title: "Analyst dashboard",
        description: "Review events, alerts, packets, hosts, and suspicious flows in one overview.",
      },
      {
        title: "Packet explorer",
        description:
          "Inspect packet lists, protocol details, and hex/ASCII views with a display-filter language.",
      },
      {
        title: "Follow Stream",
        description: "Reconstruct conversation context and preserve analyst notes.",
      },
      {
        title: "Alert triage",
        description:
          "Acknowledge, resolve, or reopen alerts and inspect mapped MITRE ATT&CK techniques.",
      },
      {
        title: "Offline imports",
        description: "Load JSON, Zeek, or Suricata samples for analysis without live capture.",
      },
      {
        title: "Timeline replay",
        description:
          "Scrub through the simulation and see the evidence available at a particular point.",
      },
    ],
    availability:
      "A defensive simulation with public source and documented local setup. It does not capture live traffic or scan networks.",
    related: ["netwatch", "support-shift", "cyberlou-pentest-report"],
    links: [
      {
        label: "View source and setup",
        url: "https://github.com/CypherAi-hub/soc-monitor",
        description: "Public React application and local-run instructions.",
      },
      {
        label: "Read the demo walkthrough",
        url: "https://github.com/CypherAi-hub/soc-monitor/blob/main/docs/DEMO_60S.md",
        description: "A guided route through the analyst workflow.",
      },
    ],
    gallery: [
      {
        src: "/media/projects/soc-monitor/soc-monitor-packet-explorer.png",
        alt: "SOC Monitor packet explorer with simulated network metadata",
        caption: "Packet investigation · Simulated demonstration data.",
      },
    ],
  },
  netwatch: {
    audience:
      "Developers learning monitoring backends, telemetry models, and database-driven alerting.",
    role: "Database design, telemetry simulation, and alert-workflow implementation.",
    challenge:
      "Monitoring needs more than charts: devices, metrics, and alerts must have consistent relationships and predictable state changes.",
    approach:
      "I built a Supabase/Postgres backend with typed records, migrations, repeatable seeding, and a simulator that feeds the alert logic.",
    features: [
      {
        title: "Device and telemetry models",
        description: "Track devices with CPU, memory, latency, packet loss, and bandwidth samples.",
      },
      {
        title: "Database-triggered alerts",
        description: "Open and resolve threshold alerts as new metrics arrive.",
      },
      {
        title: "Offline detection",
        description: "A callable SQL function identifies devices that stop reporting.",
      },
      {
        title: "Repeatable demo data",
        description:
          "Idempotent seeds and a TypeScript simulator make the backend easier to explore.",
      },
      {
        title: "Access boundaries",
        description: "Row-level policies separate demo reads from server-side writes.",
      },
    ],
    availability:
      "The implemented project is a backend and simulator. A React monitoring dashboard is planned, not presented as an existing feature.",
    related: ["soc-monitor", "aws-image-label-generator"],
    links: [
      {
        label: "View backend source",
        url: "https://github.com/CypherAi-hub/Netwatch",
        description: "Schema, migrations, telemetry scripts, and architecture documentation.",
      },
    ],
    gallery: [],
  },
  "cyberlou-pentest-report": {
    audience: "Readers evaluating security findings, business impact, and remediation priorities.",
    role: "Student security assessment documentation and report writing.",
    challenge:
      "Technical findings need enough context for someone to understand the issue, assess its significance, and act on the recommendation.",
    approach:
      "I organized the assessment into an executive summary, scoped methodology, findings, severity context, and remediation guidance.",
    features: [
      {
        title: "Executive overview",
        description: "Explain the assessment and its conclusions in stakeholder-readable language.",
      },
      {
        title: "Structured findings",
        description: "Connect technical evidence with severity and practical impact.",
      },
      {
        title: "Remediation guidance",
        description:
          "Turn findings into concrete next steps for improving the assessed environment.",
      },
    ],
    availability:
      "A completed academic security report. The existing portfolio PDF is available below; this is a reporting artifact rather than a hosted application.",
    related: ["soc-monitor", "netwatch"],
    links: [
      {
        label: "Read the report",
        url: "/reports/cyberlou-pentest-report.pdf",
        description: "Open the published portfolio PDF.",
      },
    ],
    gallery: [],
  },
  "kenan-portfolio": {
    audience: "Potential clients evaluating website, application, and digital-workflow projects.",
    role: "Founder, content strategy, website design, and development.",
    challenge:
      "A portfolio needs to help visitors understand the work and take a useful next step, rather than leave them with a list of names.",
    approach:
      "KJL Designs connects project stories, public links, transparent planning budgets, and a real discovery-call schedule in a responsive website.",
    features: [
      {
        title: "Searchable project collection",
        description: "Browse 30 projects by category, technology, and project name.",
      },
      {
        title: "Detailed project pages",
        description: "Read the purpose, role, implemented scope, availability, and related work.",
      },
      {
        title: "Project estimates",
        description: "Choose a package and eligible extras to build an itemized planning range.",
      },
      {
        title: "Booking integration",
        description: "Choose a discovery-call time through the connected Google Calendar schedule.",
      },
      {
        title: "Preserved interactive work",
        description:
          "Explore the earlier Kenan World experience alongside the current studio website.",
      },
    ],
    availability:
      "The portfolio is live on Vercel. Pricing is a planning range followed by a scoped quote; the estimator does not collect a payment.",
    related: ["general-services", "hirecrate-staffing"],
    links: [
      {
        label: "Open KJL Designs",
        url: "https://kjl-designs.vercel.app/",
        description: "The current studio homepage.",
      },
      {
        label: "Explore Kenan World",
        url: "/world",
        description: "The earlier interactive portfolio experiment.",
      },
      {
        label: "View current source",
        url: "https://github.com/CypherAi-hub/kenan-portfolio/tree/codex/portfolio-client-refresh-20261106",
        description: "The public branch containing this redesign.",
      },
    ],
    gallery: [],
  },
  "fofit-content-lab": {
    audience: "The internal FoFit team preparing product and marketing content.",
    role: "Internal workflow design and Python tooling development.",
    challenge:
      "Content production needs consistent briefs, reusable brand context, and an organized way to prepare and review assets.",
    approach:
      "This internal project combines a content-generation pipeline with a local planning and coordination dashboard.",
    features: [
      {
        title: "Structured content briefs",
        description:
          "Store concepts, campaigns, recipe sequences, and prompt templates in repeatable formats.",
      },
      {
        title: "Generation adapters",
        description: "Prepare single-clip and batch workflows for supported video providers.",
      },
      {
        title: "Dry-run preparation",
        description: "Preview a generation request before committing to a provider call.",
      },
      {
        title: "Local coordination",
        description:
          "A dashboard and planner, executor, and verifier roles organize the production workflow.",
      },
      {
        title: "Asset organization",
        description: "Separate references, outputs, brand guidance, and archived experiments.",
      },
    ],
    availability:
      "Private internal tooling. Provider availability and completed campaigns vary; this is not a public content-generation service.",
    related: ["fofit-social-automation", "fofit-website", "fofit"],
    links: [],
    gallery: [],
  },
  "cypher-ai-hub": {
    audience: "People discovering my development work through GitHub.",
    role: "Developer identity, project presentation, and profile content.",
    challenge:
      "A developer profile should give visitors a clear starting point for exploring projects and technical interests.",
    approach:
      "I created a public Markdown-based identity surface that connects the broader collection of repositories.",
    features: [
      {
        title: "Public developer profile",
        description: "A central GitHub identity for the project collection.",
      },
      {
        title: "Project discovery",
        description: "A starting point for browsing public repositories and development work.",
      },
    ],
    availability: "A public profile project, not a standalone software product.",
    related: ["kenan-portfolio", "soc-monitor"],
    links: [
      {
        label: "Visit GitHub profile",
        url: "https://github.com/CypherAi-hub",
        description: "Browse the public developer profile.",
      },
      {
        label: "View profile source",
        url: "https://github.com/CypherAi-hub/CypherAi-hub",
        description: "The Markdown profile repository.",
      },
    ],
    gallery: [],
  },
  "cypher-os-archive": {
    audience: "A solo builder exploring structured AI-assisted project operations.",
    role: "Product concept, desktop interface direction, and experimental implementation.",
    challenge:
      "A command workspace needs to organize projects, memory, operations, and decisions without losing the context between them.",
    approach:
      "This archived desktop experiment combines a Tauri interface with local records and named agent-operation workflows.",
    features: [
      {
        title: "Command workspace",
        description: "Views for projects, agents, operations, and decisions.",
      },
      {
        title: "Local memory model",
        description: "A SQLite-backed structure for research context and operating records.",
      },
      {
        title: "Visual maps",
        description: "Graph-style memory exploration and a project overview map.",
      },
      {
        title: "Approval and evaluation views",
        description: "Interfaces for inspecting proposed actions and recorded operation results.",
      },
    ],
    availability:
      "An archived desktop prototype. Runtime integrations depend on the owner’s local environment; there is no public download or hosted demo.",
    related: ["agentroom", "ruflo-os", "omni"],
    links: [],
    gallery: [],
  },
  "ruflo-os": {
    audience: "A builder experimenting with agent operations and project workspaces.",
    role: "Workspace experimentation and tooling direction.",
    challenge:
      "Agent-assisted work benefits from an organized place to keep tasks and operating context.",
    approach:
      "An early exploration of agent operations and workspace state, preserved alongside later command-center and workflow products.",
    features: [
      {
        title: "Agent-operations direction",
        description: "An experiment in organizing assisted work and workspace state.",
      },
      {
        title: "Archived project record",
        description:
          "Preserved as part of the development history and related tooling experiments.",
      },
    ],
    availability: "An archived workspace experiment with no public application release.",
    related: ["agentroom", "cypher-os-archive"],
    links: [],
    gallery: [],
  },
  omni: {
    audience: "Developers exploring an integrated browser-based app-building workspace.",
    role: "Developer-tool concept, interface design, and prototype implementation.",
    challenge:
      "Switching between a file tree, editor, terminal, preview, and AI chat can interrupt the app-building workflow.",
    approach:
      "The earlier Omni IDE prototype brought those surfaces together in a browser interface. It is separate from the Meridian market terminal that later used the Omni name.",
    features: [
      {
        title: "Files and editor",
        description: "An integrated file explorer and code-editing surface.",
      },
      {
        title: "Preview and terminal panels",
        description: "Workspace areas for reviewing output and development activity.",
      },
      {
        title: "Assistant pane",
        description: "A dedicated area for AI-assisted coding conversations.",
      },
      {
        title: "Builder navigation",
        description: "Controls and panels for exploring a complete development-workspace layout.",
      },
    ],
    availability:
      "A local interface prototype. The archived capture used a bundled fallback with in-memory edits; persistent backend operation and public publishing are not claimed.",
    related: ["agentroom", "cypher-os-archive", "meridian"],
    links: [],
    gallery: [],
  },
  "stack-mode": {
    audience: "People organizing debts, savings goals, paychecks, and day-to-day spending.",
    role: "Mobile product concept, interface design, and application development.",
    challenge:
      "A money plan is more useful when someone can connect a daily spending decision to their longer-term goals.",
    approach:
      "Stack Mode explores a local-first mobile experience with editable goals, manual expense records, planning calculations, and account-sync foundations.",
    features: [
      {
        title: "Today and planning views",
        description: "Review spending context, goals, and allocation plans.",
      },
      {
        title: "Savings and debt goals",
        description: "Edit savings buckets and debt-payoff missions.",
      },
      {
        title: "Purchase checks",
        description: "Explore the effect of a proposed purchase on the plan.",
      },
      {
        title: "Local persistence",
        description:
          "Keep editable records on the device and support backup and restore workflows.",
      },
      {
        title: "Sync foundation",
        description:
          "Account and bank-sync scaffolding exists; live bank-provider readiness is separate from the manual planning experience.",
      },
    ],
    availability:
      "A development prototype, with no verified public store release. The bank-sync foundation should not be read as a fully connected live banking service.",
    related: ["fofit", "kenan-portfolio"],
    links: [],
    gallery: [],
  },
  "get-funded": {
    audience: "An early personal research concept around AI-assisted trading workflows.",
    role: "Concept definition and research exploration.",
    challenge:
      "The initial idea was to focus an AI-assisted workflow on a narrow trading-related objective.",
    approach:
      "The original project brief explored a narrowly focused AI-assisted research workflow. It remains a concept in the archive rather than a complete application.",
    features: [
      {
        title: "Focused research brief",
        description: "A small archived concept centered on a single research objective.",
      },
      {
        title: "Development history",
        description:
          "Kept in the collection to show an early direction that preceded more developed research tools.",
      },
    ],
    availability:
      "A concept archive. No functioning public app, funded-account outcome, or trading-performance claim is established.",
    related: ["meridian", "trench-copilot"],
    links: [],
    gallery: [],
  },
  "support-shift": {
    audience: "Learners practicing first-line IT support investigation and escalation.",
    role: "Learning-experience concept and web-application development.",
    challenge:
      "Support practice is more useful when a learner can follow a ticket, inspect clues, and decide when to escalate.",
    approach:
      "I built a private support-office simulation using fictional tickets and simulated tools.",
    features: [
      {
        title: "Five fictional tickets",
        description: "A bounded set of support situations provides a clear practice environment.",
      },
      {
        title: "Simulated investigation",
        description:
          "Explore support tools and ticket context without connecting to real production systems.",
      },
      {
        title: "Escalation practice",
        description: "Work through when a problem needs more information or a specialist.",
      },
    ],
    availability:
      "A private learning simulator. Its portfolio description is public, but the application’s existing access restrictions remain in place.",
    related: ["soc-monitor", "netwatch"],
    links: [],
    gallery: [],
  },
  "fofit-platform-blueprint": {
    audience:
      "People planning how the FoFit mobile, personal web, and coach experiences fit together.",
    role: "Product architecture, experience mapping, and interactive planning.",
    challenge:
      "A product with several interfaces needs clear responsibilities so users know where each task belongs.",
    approach:
      "I created an interactive blueprint for the three FoFit surfaces, their shared foundation, and their priorities.",
    features: [
      {
        title: "Three connected surfaces",
        description: "Map the responsibilities of Mobile, Personal Web, and Coach OS.",
      },
      {
        title: "Product priorities",
        description: "Make the sequence and focus of development easier to discuss.",
      },
      {
        title: "Shared architecture",
        description:
          "Explain how the experiences connect without making every screen do the same job.",
      },
    ],
    availability:
      "A private interactive product-planning interface. It documents direction; roadmap items are not proof that a feature has shipped.",
    related: ["fofit", "fofit-web", "fofit-coach"],
    links: [],
    gallery: [],
  },
  "trench-copilot": {
    audience:
      "Researchers reviewing public Solana market snapshots and keeping a manual research journal.",
    role: "Research workflow design and local application development.",
    challenge:
      "Fast-moving market data needs source context, freshness information, and a place to record observations without turning a research tool into an execution system.",
    approach:
      "I built a local read-only dashboard with public snapshots, manual tracking, a persistent watchlist, and exportable journal records.",
    features: [
      {
        title: "Market radar",
        description: "Review token age, liquidity, activity, and timestamped market snapshots.",
      },
      {
        title: "Manual tracking",
        description: "Add a specific mint and retain research candidates in a watchlist.",
      },
      {
        title: "Source-linked briefs",
        description:
          "Open original sources and copy a structured research brief for further investigation.",
      },
      {
        title: "Research journal",
        description:
          "Record watch, reject, paper-entry, and paper-exit observations and export CSV.",
      },
      {
        title: "Optional local AI",
        description:
          "Screen observation and second-opinion interfaces target a local model; inference was not verified in the saved audit.",
      },
    ],
    availability:
      "A local read-only prototype. It has no wallet connection or order submission. Public discovery is partial, and the paper journal does not model executed fills.",
    related: ["meridian", "meridian-atlas"],
    links: [],
    gallery: [],
  },
  "cypher-form-alpha": {
    audience:
      "Researchers exploring camera-based movement measurements for a narrow exercise task.",
    role: "Motion-analysis research, Python implementation, and product-boundary design.",
    challenge:
      "A single side-view video can support some movement measurements, but unreliable camera evidence should not be turned into confident feedback.",
    approach:
      "I separated pose extraction from a pure measurement engine, then built rep counting, timing, quality checks, and abstention into a standalone research harness.",
    features: [
      {
        title: "Side-view squat analysis",
        description: "A bounded bodyweight-squat workflow using pose landmarks from video.",
      },
      {
        title: "Rep and timing metrics",
        description:
          "Estimate repetition count, descent/ascent timing, a depth proxy, and trunk-lean consistency.",
      },
      {
        title: "Quality and abstention",
        description:
          "Return an insufficient-evidence result when the camera view cannot support the measurement.",
      },
      {
        title: "Reviewable outputs",
        description: "Produce a data report and annotated video for inspection.",
      },
    ],
    availability:
      "A research prototype with limited clip validation. It is not a clinical assessment or injury-risk tool, and broad exercise coverage is not claimed.",
    related: ["fofit", "fofit-web"],
    links: [],
    gallery: [],
  },
  "launch-relay": {
    audience: "App builders exploring help with Expo and React Native release problems.",
    role: "Service positioning, landing-page design, and frontend prototyping.",
    challenge:
      "A technical service needs to explain who it helps, what is included, and how an inquiry starts.",
    approach:
      "Launch Relay is a focused website concept for an app-release rescue service, organized around scope, process, and email intake.",
    features: [
      {
        title: "Clear service scope",
        description: "Describe the intended release-support offer and the problems it addresses.",
      },
      {
        title: "Process explanation",
        description: "Show how an initial inquiry would move toward a defined piece of work.",
      },
      {
        title: "Email intake",
        description: "Provide a straightforward contact path within the prototype.",
      },
    ],
    availability:
      "A website prototype included as design work. It is not an active service or a promise of release-support availability.",
    related: ["hirecrate-staffing", "kenan-portfolio"],
    links: [],
    gallery: [],
  },
  "fofit-social-automation": {
    audience: "The internal FoFit content workflow preparing authentic app media for review.",
    role: "Automation design, capture tooling, and media-review implementation.",
    challenge:
      "App marketing needs usable formats, but the underlying capture must be clean and suitable for publication.",
    approach:
      "I built a Mac-based pipeline that captures Simulator screens, checks visible text, and packages approved media with review records.",
    features: [
      {
        title: "Scene-based capture",
        description: "Select a defined app scene and capture screenshots or short recordings.",
      },
      {
        title: "Visible-text review",
        description: "Use macOS Vision OCR to flag debug labels, errors, and private text.",
      },
      {
        title: "Format packaging",
        description: "Prepare vertical video, Story art, and feed formats from approved input.",
      },
      {
        title: "Review records",
        description:
          "Write machine-readable results and stop packaging when a capture is rejected.",
      },
      {
        title: "Draft queue manifests",
        description: "Prepare a dry-run publishing queue without automatically posting content.",
      },
    ],
    availability:
      "Local internal tooling. Automatic publishing is not implemented; reviewed media and queue drafts remain separate from a published social post.",
    related: ["fofit-content-lab", "fofit-website", "fofit"],
    links: [],
    gallery: [],
  },
};
