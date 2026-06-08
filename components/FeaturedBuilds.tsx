import { featuredProjects } from "@/data/projects";
import CarouselRail, { type CarouselItem } from "@/components/CarouselRail";
import FeaturedProjectCard from "@/components/FeaturedProjectCard";
import SectionHeader from "@/components/SectionHeader";

function carouselVariant(project: (typeof featuredProjects)[number]): CarouselItem["variant"] {
  if (project.visual === "fofit" || project.visual === "mobile") return "phone";
  if (project.visual === "soc" || project.visual === "netwatch" || project.visual === "aws")
    return "terminal";
  if (project.visual === "report") return "report";
  return "dashboard";
}

export default function FeaturedBuilds() {
  const carouselItems: CarouselItem[] = featuredProjects.map((project) => ({
    eyebrow: project.proof ?? project.category,
    title: project.title,
    description: project.description,
    media: project.media[0] ? { src: project.media[0].src, alt: project.media[0].alt } : undefined,
    href: project.caseStudySlug ? `/case-studies/${project.caseStudySlug}` : project.githubUrl,
    meta: project.techStack.slice(0, 3).join(" / "),
    variant: carouselVariant(project),
  }));

  return (
    <section id="featured" className="section-shell py-20">
      <SectionHeader eyebrow="Featured Builds" title="Strongest proof first.">
        These are the projects recruiters should see before the full archive: product work, AI
        tooling, cloud fundamentals, and cybersecurity interfaces.
      </SectionHeader>

      <div className="mt-10">
        <CarouselRail label="Featured builds carousel" items={carouselItems} />
      </div>

      <div className="mt-12 grid gap-5">
        {featuredProjects.map((project) => (
          <FeaturedProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
