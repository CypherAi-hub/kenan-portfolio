import { projects, type ProjectCategory } from "@/data/projects";
import ProjectArchiveCard from "@/components/ProjectArchiveCard";
import SectionHeader from "@/components/SectionHeader";

const sections: { category: ProjectCategory; title: string; description: string }[] = [
  {
    category: "Cybersecurity / Cloud",
    title: "Cybersecurity and cloud proof.",
    description:
      "AWS Image Label Generator, SOC Monitor, and Netwatch show cloud services, defensive simulations, and monitoring interfaces.",
  },
  {
    category: "AI / Agent Tools",
    title: "AI and agent tools.",
    description:
      "AgentRoom, Omni, Cypher OS Archive, and Ruflo OS show the agentic tooling direction without overstating unfinished work.",
  },
  {
    category: "Web Apps / Business Builds",
    title: "Business-facing web builds.",
    description:
      "Portfolio, Hirecrate, UltraFlips, and related websites show product communication, workflow design, and deployable frontend work.",
  },
];

export default function ProjectCategoryShowcase() {
  return (
    <section className="section-shell py-20">
      <SectionHeader eyebrow="Build Range" title="Range without losing the thread.">
        The site groups repos by what they prove, so the archive feels curated instead of flat.
      </SectionHeader>

      <div className="mt-10 space-y-12">
        {sections.map((section) => {
          const categoryProjects = projects
            .filter((project) => project.category === section.category)
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 4);

          return (
            <div key={section.category}>
              <div className="mb-4 max-w-2xl">
                <h3 className="text-2xl font-semibold">{section.title}</h3>
                <p className="text-fg-secondary mt-2 text-sm leading-6">{section.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {categoryProjects.map((project) => (
                  <ProjectArchiveCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
