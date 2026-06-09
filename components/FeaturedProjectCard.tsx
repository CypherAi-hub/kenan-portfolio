import type { Project } from "@/data/projects";
import ProjectLinks from "@/components/ProjectLinks";
import ProjectMediaPreview from "@/components/ProjectMediaPreview";
import ProjectStatusBadge from "@/components/ProjectStatusBadge";
import TechStackPills from "@/components/TechStackPills";
import { cn } from "@/lib/utils";

const visualTreatment: Record<Project["visual"], string> = {
  fofit: "lg:grid-cols-[0.88fr_1.12fr]",
  coach: "lg:grid-cols-[1fr_1.24fr]",
  agentroom: "lg:grid-cols-[1.04fr_1fr]",
  aws: "lg:grid-cols-[1fr_1.08fr]",
  soc: "lg:grid-cols-[1fr_1.16fr]",
  netwatch: "lg:grid-cols-[1fr_1.08fr]",
  report: "lg:grid-cols-[0.94fr_1.06fr]",
  portfolio: "lg:grid-cols-[1fr_1fr]",
  archive: "lg:grid-cols-[1fr_1fr]",
  mobile: "lg:grid-cols-[0.88fr_1.12fr]",
  business: "lg:grid-cols-[1fr_1fr]",
};

export default function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={cn(
        "group glass-panel grid overflow-hidden rounded transition duration-300 hover:-translate-y-1 hover:border-white/24",
        visualTreatment[project.visual],
      )}
    >
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

        <div className="text-fg-secondary mt-5 rounded border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs">
          What it proves: <span className="text-fg">{project.proof ?? project.category}</span>
        </div>

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

      <div className="border-border bg-bg relative min-h-[320px] border-t lg:min-h-[420px] lg:border-t-0 lg:border-l">
        <ProjectMediaPreview project={project} />
      </div>
    </article>
  );
}
