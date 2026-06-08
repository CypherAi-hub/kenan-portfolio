import { projects } from "@/data/projects";
import CarouselRail, { type CarouselItem } from "@/components/CarouselRail";
import SectionHeader from "@/components/SectionHeader";

const mediaPlan = [
  { slug: "fofit", index: 0, variant: "phone" as const, meta: "Mobile app execution" },
  { slug: "fofit", index: 2, variant: "phone" as const, meta: "Workout flow" },
  { slug: "fofit-coach", index: 0, variant: "dashboard" as const, meta: "Coach platform" },
  { slug: "agentroom", index: 0, variant: "dashboard" as const, meta: "Agent workflow" },
  { slug: "soc-monitor", index: 0, variant: "terminal" as const, meta: "SOC dashboard" },
  {
    slug: "aws-image-label-generator",
    index: 0,
    variant: "terminal" as const,
    meta: "AWS Rekognition output",
  },
  {
    slug: "cyberlou-pentest-report",
    index: 0,
    variant: "report" as const,
    meta: "Security report artifact",
  },
  {
    slug: "hirecrate-staffing",
    index: 0,
    variant: "dashboard" as const,
    meta: "Business web build",
  },
];

export default function ProjectMediaShowcase() {
  const items: CarouselItem[] = mediaPlan
    .map((entry): CarouselItem | null => {
      const project = projects.find((candidate) => candidate.slug === entry.slug);
      const media = project?.media[entry.index];
      if (!project || !media) return null;

      return {
        eyebrow: media.label,
        title: project.title,
        description: project.longDescription,
        media: { src: media.src, alt: media.alt },
        href: project.liveUrl ?? project.githubUrl,
        meta: entry.meta,
        variant: entry.variant,
      };
    })
    .filter((item): item is CarouselItem => Boolean(item));

  return (
    <section id="media" className="section-shell py-20">
      <SectionHeader eyebrow="Project Media" title="Screenshots that prove the work.">
        FoFit mobile screens, dashboard surfaces, security consoles, cloud outputs, and report
        previews are grouped into a fast visual scan.
      </SectionHeader>

      <div className="mt-10">
        <CarouselRail label="Project media carousel" items={items} />
      </div>
    </section>
  );
}
