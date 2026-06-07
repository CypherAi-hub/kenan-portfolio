import { featuredProjects } from "@/data/projects";
import FeaturedProjectCard from "@/components/FeaturedProjectCard";
import SectionHeader from "@/components/SectionHeader";

export default function FeaturedBuilds() {
  return (
    <section id="featured" className="section-shell py-20">
      <SectionHeader eyebrow="Featured Builds" title="Strongest proof first.">
        These are the projects recruiters should see before the full archive: product work, AI
        tooling, cloud fundamentals, and cybersecurity interfaces.
      </SectionHeader>
      <div className="mt-10 grid gap-5">
        {featuredProjects.map((project) => (
          <FeaturedProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
