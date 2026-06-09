import { projects } from "@/data/projects";
import { certifications, profile } from "@/lib/data";
import CarouselRail, { type CarouselItem } from "@/components/CarouselRail";
import SectionHeader from "@/components/SectionHeader";

function projectMediaItem(
  slug: string,
  title: string,
  description: string,
  variant: CarouselItem["variant"],
  mediaIndex = 0,
): CarouselItem | null {
  const project = projects.find((candidate) => candidate.slug === slug);
  const media = project?.media[mediaIndex];
  if (!project || !media) return null;

  return {
    eyebrow: project.proof ?? project.category,
    title,
    description,
    media: { src: media.src, alt: media.alt },
    href: project.caseStudySlug ? `/case-studies/${project.caseStudySlug}` : project.githubUrl,
    meta: project.techStack.slice(0, 3).join(" / "),
    variant,
  };
}

export default function ProofCarouselSection() {
  const googleCertificate = certifications.find((certification) =>
    certification.name.includes("Google Cybersecurity"),
  );

  const items: CarouselItem[] = [
    projectMediaItem(
      "cyberlou-pentest-report",
      "Cyberlou Pentest Report",
      "Safe report preview for a controlled lab engagement, showing security communication and remediation framing.",
      "report",
    ),
    googleCertificate?.media
      ? {
          eyebrow: "Credential proof",
          title: googleCertificate.name,
          description:
            "Completed Google Cybersecurity Professional Certificate proof, paired with Security+ work in progress.",
          media: {
            src: googleCertificate.media,
            alt: "Google Cybersecurity Professional Certificate completion proof for Kenan Larry",
          },
          href: profile.linkedin,
          meta: googleCertificate.detail,
          variant: "proof",
        }
      : null,
    projectMediaItem(
      "fofit",
      "FoFit Product Flow",
      "Mobile-first training, Cypher guidance, nutrition, and workout flow screenshots from the active FoFit product lane.",
      "phone",
      3,
    ),
    projectMediaItem(
      "fofit-coach",
      "FoFit Coach Dashboard",
      "Team and coach product surface showing the B2B side of the FoFit ecosystem.",
      "dashboard",
    ),
    projectMediaItem(
      "agentroom",
      "AgentRoom Workflow",
      "Agent mission-control proof for checkpoints, blockers, validation, and developer workflow visibility.",
      "dashboard",
    ),
    projectMediaItem(
      "omni",
      "Omni IDE Surface",
      "Local AI browser IDE proof with file explorer, editor, terminal panel, and assistant surface.",
      "dashboard",
    ),
    projectMediaItem(
      "soc-monitor",
      "SOC Monitor Dashboard",
      "Defensive security simulation with analyst-style triage, packet investigation, and MITRE context.",
      "terminal",
    ),
    projectMediaItem(
      "netwatch",
      "Netwatch Architecture",
      "Backend monitoring proof showing Supabase schema, simulator flow, trigger-driven alerts, and honest dashboard status.",
      "terminal",
    ),
    projectMediaItem(
      "aws-image-label-generator",
      "AWS Rekognition Output",
      "Cloud ML output proof using Python, Rekognition, and generated labeled image results.",
      "terminal",
    ),
  ].filter((item): item is CarouselItem => Boolean(item));

  return (
    <section id="proof-carousel" className="section-shell py-20">
      <SectionHeader
        eyebrow="Case Study / Proof Carousel"
        title="Built, documented, and ready to discuss."
      >
        Deeper proof assets sit here: report previews, certificate evidence, product flows, security
        dashboards, and cloud outputs.
      </SectionHeader>

      <div className="mt-10">
        <CarouselRail label="Case study proof carousel" items={items} />
      </div>
    </section>
  );
}
