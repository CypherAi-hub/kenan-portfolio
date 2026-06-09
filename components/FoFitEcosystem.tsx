import { foFitProjects } from "@/data/projects";
import ProjectLinks from "@/components/ProjectLinks";
import ProjectMediaPreview from "@/components/ProjectMediaPreview";
import ProjectStatusBadge from "@/components/ProjectStatusBadge";
import SectionHeader from "@/components/SectionHeader";
import TechStackPills from "@/components/TechStackPills";

export default function FoFitEcosystem() {
  return (
    <section id="fofit" className="section-shell py-20">
      <SectionHeader eyebrow="FoFit Ecosystem" title="One product family, multiple surfaces.">
        FoFit is the main proof point: mobile app, coach platform, marketing/product site, and
        content tooling grouped as one serious product lane.
      </SectionHeader>

      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {foFitProjects.map((project) => (
          <article
            key={project.slug}
            className="border-border bg-bg-elevated/52 group flex min-h-[360px] flex-col overflow-hidden rounded border"
          >
            <div className="border-border h-44 border-b">
              <ProjectMediaPreview project={project} variant="archive" />
            </div>
            <div className="flex items-start justify-between gap-3 p-4 pb-0">
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-fg-secondary mt-3 px-4 text-sm leading-6">{project.description}</p>
            <div className="mt-4 px-4">
              <TechStackPills stack={project.techStack.slice(0, 4)} compact />
            </div>
            <div className="mt-auto p-4 pt-5">
              <ProjectLinks project={project} compact />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
