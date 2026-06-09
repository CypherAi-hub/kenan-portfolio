import type { ProjectStatus } from "@/data/projects";
import { cn } from "@/lib/utils";

const statusStyle: Record<ProjectStatus, string> = {
  Live: "border-white/45 bg-white/10 text-white",
  "In Progress": "border-white/25 bg-white/[0.075] text-fg-secondary",
  Prototype: "border-white/20 bg-white/[0.055] text-fg-secondary",
  Archived: "border-white/12 bg-bg-hover text-fg-muted",
};

export default function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-1 font-mono text-[11px] leading-none uppercase",
        statusStyle[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
