import { projects, type Project } from "@/data/projects";
import { certifications, profile } from "@/lib/data";
import CarouselRail, { type CarouselItem } from "@/components/CarouselRail";
import SectionHeader from "@/components/SectionHeader";

type ProjectScene = {
  title: string;
  slug: string;
  mediaLabel?: string;
  description: string;
  meta: string;
  variant: CarouselItem["variant"];
  href?: string;
};

const projectScenes: ProjectScene[] = [
  {
    title: "FoFit City",
    slug: "fofit",
    mediaLabel: "Current mobile home",
    description:
      "Mobile product proof for training, Cypher guidance, workout logging, nutrition, and profile workflows from the active FoFit lane.",
    meta: "Product Campus / React Native / Supabase",
    variant: "phone",
  },
  {
    title: "Cyber City",
    slug: "soc-monitor",
    mediaLabel: "SOC dashboard",
    description:
      "Defensive security simulation with analyst-style triage, packet investigation, MITRE context, and timeline review.",
    meta: "SOC + Pentest Labs / Defensive UX",
    variant: "terminal",
  },
  {
    title: "AI District",
    slug: "agentroom",
    mediaLabel: "Live AgentRoom page",
    description:
      "Agent workflow surface for commands, blockers, validation, checkpoints, and proof capture across coding runs.",
    meta: "Agent Labs / Workflow Proof",
    variant: "dashboard",
  },
  {
    title: "Career City",
    slug: "kenan-portfolio",
    mediaLabel: "Portfolio homepage",
    description:
      "Recruiter-facing portfolio system tying project data, case-study paths, screenshots, and the full build archive together.",
    meta: "Experience NPCs / Portfolio System",
    variant: "dashboard",
  },
  {
    title: "Cloud Pipeline",
    slug: "aws-image-label-generator",
    mediaLabel: "Rekognition output: apple",
    description:
      "Cloud ML output proof from a Python, S3, and AWS Rekognition image-labeling workflow using repo-sourced visuals.",
    meta: "AWS / Rekognition / Python",
    variant: "terminal",
  },
  {
    title: "Cyberlou Report",
    slug: "cyberlou-pentest-report",
    mediaLabel: "Report preview",
    description:
      "Safe preview of a controlled-lab penetration testing report focused on evidence, severity, remediation, and communication.",
    meta: "Security Reporting / Controlled Lab",
    variant: "report",
  },
  {
    title: "Recruiter Mode",
    slug: "fofit",
    mediaLabel: "FoFit journey poster",
    description:
      "The world stays playful, but the traditional recruiter route still opens the resume, projects, skills, certificates, GitHub, LinkedIn, and contact path.",
    meta: "Open /world / Press R",
    variant: "proof",
    href: "/world",
  },
];

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

function findMedia(project: Project, label?: string) {
  if (!label) return project.media[0];
  return project.media.find((media) => media.label === label) ?? project.media[0];
}

function projectSceneToCarouselItem(scene: ProjectScene): CarouselItem | null {
  const project = findProject(scene.slug);
  if (!project) return null;

  const media = findMedia(project, scene.mediaLabel);
  if (!media) return null;

  return {
    eyebrow: project.proof ?? project.category,
    title: scene.title,
    description: scene.description,
    media: {
      src: media.src,
      alt: media.alt,
    },
    href:
      scene.href ??
      (project.caseStudySlug ? `/case-studies/${project.caseStudySlug}` : project.liveUrl) ??
      project.githubUrl,
    meta: scene.meta,
    variant: scene.variant,
  };
}

function achievementSceneToCarouselItem(): CarouselItem | null {
  const googleCertificate = certifications.find((certification) =>
    certification.name.includes("Google Cybersecurity"),
  );

  if (!googleCertificate?.media) return null;

  return {
    eyebrow: "Credential proof",
    title: "Achievement Hall",
    description:
      "Completed Google Cybersecurity Professional Certificate proof, with Security+ kept as in progress in the profile data.",
    media: {
      src: googleCertificate.media,
      alt: "Google Cybersecurity Professional Certificate completion proof for Kenan Larry",
    },
    href: profile.linkedin,
    meta: googleCertificate.detail,
    variant: "proof",
  };
}

export default function WorldProofCarousel() {
  const items = [
    ...projectScenes.slice(0, 3).map(projectSceneToCarouselItem),
    achievementSceneToCarouselItem(),
    ...projectScenes.slice(3).map(projectSceneToCarouselItem),
  ].filter((item): item is CarouselItem => Boolean(item));

  return (
    <section
      id="world-proof-scenes"
      className="section-shell py-20"
      aria-label="World Proof Scenes"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader eyebrow="World Proof Scenes" title="Explore the proof path.">
          A compact route into Kenan World: FoFit City, Cyber City, AI District, Achievement Hall,
          Career City, Cloud Pipeline, Cyberlou Report, and Recruiter Mode, all backed by existing
          portfolio media.
        </SectionHeader>

        <a
          href="/world"
          aria-label="Open Kenan World interactive proof map"
          className="group inline-flex h-11 w-fit items-center rounded border border-[#76f4df]/30 bg-[#76f4df]/10 px-4 font-mono text-sm text-[#76f4df] transition hover:border-[#76f4df]/60 hover:bg-[#76f4df]/15"
        >
          Open /world
          <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-1">
            -&gt;
          </span>
        </a>
      </div>

      <div className="text-fg-muted mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase">
        <span className="rounded border border-white/12 bg-white/[0.03] px-2.5 py-1">
          {items.length} proof scenes
        </span>
        <span className="rounded border border-[#76f4df]/20 bg-[#76f4df]/5 px-2.5 py-1 text-[#76f4df]">
          FoFit City route
        </span>
        <span className="rounded border border-white/12 bg-white/[0.03] px-2.5 py-1">
          Uses existing media
        </span>
      </div>

      <div className="mt-10">
        <CarouselRail label="World proof scenes carousel" items={items} />
      </div>
    </section>
  );
}
