export type ProjectCover = {
  image: string;
  imageAlt: string;
  imageNote: string;
  contain?: boolean;
};
export const projectCovers: Record<string, ProjectCover> = {
  fofit: {
    image: "/media/current/fofit-workout.webp",
    imageAlt: "FoFit workout screen",
    imageNote: "October 2026 development build.",
    contain: true,
  },
  agentroom: {
    image: "/media/projects/agentroom/agentroom-dashboard.png",
    imageAlt: "AgentRoom public product website",
    imageNote: "Archived public website capture. The documented source MVP uses mock data.",
  },
  "soc-monitor": {
    image: "/media/projects/soc-monitor/soc-monitor-dashboard.png",
    imageAlt: "SOC Monitor dashboard with simulated network events and alert charts",
    imageNote: "Local demonstration with simulated network data.",
  },
  "hirecrate-staffing": {
    image: "/media/showcase/hirecrate-home.png",
    imageAlt: "HireCrate staffing website with employer and job-seeker paths",
    imageNote: "November 2026 local website preview.",
  },
  "ultraflips-mobile": {
    image: "/media/showcase/ultra-market.webp",
    imageAlt: "UltraFlips exact-card research and dated price evidence",
    imageNote: "November 2026 Simulator preview with sample data.",
    contain: true,
  },
  "general-services": {
    image: "/media/current/maryville-request-desk.jpg",
    imageAlt: "General Services public request website",
    imageNote: "Public request page. Staff information stays private.",
  },
  "meridian-atlas": {
    image: "/media/current/meridian-atlas.webp",
    imageAlt: "Meridian Atlas company graph and financial research notebook",
    imageNote: "November 2026 local app screenshot. Figures shown are dated research context.",
  },
  meridian: {
    image: "/media/current/meridian.webp",
    imageAlt: "Meridian Omni terminal with market chart and visibly labeled paper account",
    imageNote: "October 2026 paper-terminal screenshot. Balances and orders are simulated.",
  },
  "fofit-website": {
    image: "/media/projects/fofit-website/fofit-website-home.png",
    imageAlt: "FoFit website with mobile product previews",
    imageNote: "Archived public product website.",
  },
  "fofit-coach": {
    image: "/media/projects/fofit-coach/fofit-coach-live.png",
    imageAlt: "FoFit Coach programming platform landing page",
    imageNote: "Public FoFit Coach website capture.",
  },
  "fofit-web": {
    image: "/media/showcase/fofit-web.webp",
    imageAlt: "FoFit OS public landing page for personal planning and training",
    imageNote: "Public entry page for the personal web platform.",
  },
  "ultraflips-website": {
    image: "/media/projects/ultraflips-website/ultraflips-website-home.png",
    imageAlt: "UltraFlips marketing site with its purple card research presentation",
    imageNote: "Archived product website capture.",
  },
  ultraflips: {
    image: "/media/projects/ultraflips/ultraflips-home.png",
    imageAlt: "UltraFlips browser app with a sample card research preview",
    imageNote: "Earlier browser app capture with sample content.",
  },
  "aws-image-label-generator": {
    image: "/media/projects/aws-image-label-generator/aws-image-label-generator-output-shoes.png",
    imageAlt: "Image-labeling output with a bounding box around a running shoe",
    imageNote: "Example image and object-detection output from the project archive.",
    contain: true,
  },
  "cyberlou-pentest-report": {
    image: "/media/projects/cyberlou-pentest-report/pentest-report-preview.webp",
    imageAlt: "Cyberlou security report cover and network topology heading",
    imageNote: "Preview of the completed academic report.",
    contain: true,
  },
  netwatch: {
    image: "/media/projects/netwatch/netwatch-architecture-proof.webp",
    imageAlt: "Netwatch architecture diagram from simulator to database and alert rules",
    imageNote: "Architecture diagram of the monitoring backend and telemetry simulator.",
    contain: true,
  },
  "kenan-portfolio": {
    image: "/media/showcase/studio.webp",
    imageAlt: "KJL Designs homepage with Maryville featured in the hero",
    imageNote: "November 2026 studio homepage, before the animated showcase.",
  },
  "fofit-content-lab": {
    image: "/media/showcase/content-lab.webp",
    imageAlt: "Frame from a FoFit reel showing a fictional workout import example",
    imageNote: "Frame from a finished FoFit content reel. Example workout data.",
    contain: true,
  },
  "cypher-ai-hub": {
    image: "/media/showcase/profile.webp",
    imageAlt: "Excerpt from Kenan Larry’s public developer profile on GitHub",
    imageNote: "The introduction from the public GitHub profile README.",
    contain: true,
  },
  "cypher-os-archive": {
    image: "/media/showcase/cypher-os.webp",
    imageAlt:
      "Architecture study of Cypher OS local memory, projects, operations, decisions and evaluations",
    imageNote: "Portfolio diagram based on the archived desktop project.",
    contain: true,
  },
  "ruflo-os": {
    image: "/media/projects/ruflo-os/ruflo-control-proof.webp",
    imageAlt: "Archived Ruflo OS concept graphic for a controlled agent workspace",
    imageNote: "Archived design graphic showing the intended workspace controls.",
    contain: true,
  },
  omni: {
    image: "/media/showcase/omni.webp",
    imageAlt: "Workflow diagram showing the file tree, active editor and preview in Omni",
    imageNote: "Portfolio diagram of the browser IDE’s local editing workflow.",
    contain: true,
  },
  "stack-mode": {
    image: "/media/projects/stack-mode/stack-mode-readme-proof.webp",
    imageAlt: "Stack Mode architecture graphic showing local planning and savings workflows",
    imageNote: "Archived project overview based on its README.",
    contain: true,
  },
  "get-funded": {
    image: "/media/showcase/get-funded.webp",
    imageAlt: "The original Get Funded one-line project brief, presented as a document excerpt",
    imageNote: "Excerpt from the original README of this archived concept.",
    contain: true,
  },
  "support-shift": {
    image: "/media/showcase/support-shift.webp",
    imageAlt: "Pixel-art Support Shift office with fictional help-desk tickets",
    imageNote: "The simulator’s opening office scene with fictional tickets.",
  },
  "fofit-platform-blueprint": {
    image: "/media/showcase/blueprint.webp",
    imageAlt: "FoFit platform blueprint with mobile, web and coach product roles",
    imageNote: "Saved project preview from the FoFit Platform Blueprint site.",
  },
  "trench-copilot": {
    image: "/media/showcase/trench.webp",
    imageAlt: "Trench Copilot research radar showing its demo data label",
    imageNote: "Local demo mode with synthetic market data.",
  },
  "cypher-form-alpha": {
    image: "/media/showcase/form-landmarks.webp",
    imageAlt: "Three skeletal poses plotted from a generated squat fixture at different timestamps",
    imageNote:
      "Plot of stored shoulder, hip, knee and ankle landmarks from a generated squat fixture.",
    contain: true,
  },
  "launch-relay": {
    image: "/media/showcase/launch-relay.webp",
    imageAlt: "Launch Relay landing page with its Expo release-support brief",
    imageNote: "Original prototype page rendered locally from its archived source.",
  },
  "fofit-social-automation": {
    image: "/media/showcase/media-automation.webp",
    imageAlt: "Finished FoFit Today’s Session image from the reviewed media library",
    imageNote: "Reviewed image from the FoFit Live App Library.",
    contain: true,
  },
};
export function projectCover(slug: string): ProjectCover {
  const cover = projectCovers[slug];
  if (!cover) throw new Error(`Missing portfolio media for ${slug}`);
  return cover;
}

type ProjectVideo = {
  src: string;
  poster: string;
  captions: string;
  title: string;
  description: string;
  portrait?: boolean;
};

export const projectVideos: Partial<Record<string, ProjectVideo>> = {
  fofit: {
    src: "/media/showcase/fofit-screen-tour.mp4",
    poster: "/media/showcase/tour-poster.webp",
    captions: "/media/showcase/fofit-screen-tour.vtt",
    title: "Inside a FoFit training week",
    description:
      "A 23-second screen tour from the October development build, covering workout planning, recipes and Cypher.",
  },
  "fofit-content-lab": {
    src: "/media/showcase/content-lab-reel.mp4",
    poster: "/media/showcase/content-lab.webp",
    captions: "/media/showcase/content-lab.vtt",
    title: "From workout notes to editable sets",
    description:
      "A nine-second FoFit development reel showing import and review with a fictional workout.",
    portrait: true,
  },
};
