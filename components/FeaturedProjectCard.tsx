import type { Project } from "@/data/projects";
import ProjectLinks from "@/components/ProjectLinks";
import ProjectMediaPreview from "@/components/ProjectMediaPreview";
import ProjectStatusBadge from "@/components/ProjectStatusBadge";
import TechStackPills from "@/components/TechStackPills";

export default function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <article className="group border-border bg-bg-elevated/62 hover:border-accent/45 grid overflow-hidden rounded border transition-colors lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="border-border text-fg-muted rounded border px-2 py-1 font-mono text-[11px] leading-none uppercase">
            {project.category}
          </span>
        </div>
        <h3 className="mt-5 text-2xl leading-tight font-semibold md:text-3xl">{project.title}</h3>
        <p className="text-fg-secondary mt-3 text-sm leading-6 md:text-base">
          {project.description}
        </p>

        <div className="text-fg-muted mt-5 grid gap-4 text-sm leading-6 md:grid-cols-2">
          {project.problem && (
            <div>
              <p className="text-fg-dimmed font-mono text-[11px] uppercase">Problem</p>
              <p className="mt-1">{project.problem}</p>
            </div>
          )}
          {project.built && (
            <div>
              <p className="text-fg-dimmed font-mono text-[11px] uppercase">What I Built</p>
              <p className="mt-1">{project.built}</p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <TechStackPills stack={project.techStack} />
        </div>

        <div className="mt-6">
          <ProjectLinks project={project} />
        </div>
      </div>

      <div className="border-border bg-bg relative min-h-[280px] border-t lg:border-t-0 lg:border-l">
        <ProjectMediaPreview project={project} />
      </div>
    </article>
  );
}
