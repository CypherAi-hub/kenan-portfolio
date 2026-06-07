import Link from "next/link";
import { ExternalLink, FileText, Github } from "lucide-react";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

function ProjectLink({
  href,
  children,
  external,
  icon,
  muted,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  const className = cn(
    "inline-flex h-9 items-center gap-2 rounded border px-3 font-mono text-xs transition-colors",
    muted
      ? "border-border text-fg-secondary hover:border-cyan/50 hover:text-cyan"
      : "border-accent/35 bg-accent/10 text-accent hover:border-accent hover:bg-accent/15",
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {icon}
      {children}
    </Link>
  );
}

export default function ProjectLinks({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
      <ProjectLink href={project.githubUrl} external icon={<Github size={15} aria-hidden />} muted>
        View GitHub
      </ProjectLink>
      {project.liveUrl && (
        <ProjectLink href={project.liveUrl} external icon={<ExternalLink size={15} aria-hidden />}>
          View Live
        </ProjectLink>
      )}
      {project.caseStudySlug && (
        <ProjectLink
          href={`/case-studies/${project.caseStudySlug}`}
          icon={<FileText size={15} aria-hidden />}
          muted
        >
          Read Case Study
        </ProjectLink>
      )}
      {!project.caseStudySlug && project.featured && (
        <span className="border-border text-fg-muted inline-flex h-9 items-center rounded border px-3 font-mono text-xs">
          Case Study Coming Soon
        </span>
      )}
    </div>
  );
}
