import type { Project } from "@/data/projects";
import ProjectLinks from "@/components/ProjectLinks";
import ProjectMediaPreview from "@/components/ProjectMediaPreview";
import ProjectStatusBadge from "@/components/ProjectStatusBadge";
import TechStackPills from "@/components/TechStackPills";

export default function ProjectArchiveCard({ project }: { project: Project }) {
  return (
    <article className="glass-panel group flex h-full flex-col overflow-hidden rounded transition duration-300 hover:-translate-y-0.5 hover:border-white/22">
      <div className="border-border h-44 border-b">
        <ProjectMediaPreview project={project} variant="archive" />
      </div>

      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <div>
          <h3 className="text-lg leading-snug font-semibold">{project.title}</h3>
          <p className="text-fg-muted mt-1 font-mono text-[11px]">{project.repo}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <p className="text-fg-secondary mt-4 min-h-[72px] px-4 text-sm leading-6">
        {project.description}
      </p>

      <div className="mt-4 px-4">
        <TechStackPills stack={project.techStack.slice(0, 4)} compact />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-4">
        {project.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-fg-muted font-mono text-[11px]">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-auto p-4 pt-5">
        <ProjectLinks project={project} compact />
      </div>
    </article>
  );
}
