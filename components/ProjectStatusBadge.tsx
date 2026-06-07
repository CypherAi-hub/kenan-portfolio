import type { ProjectStatus } from "@/data/projects";
import { cn } from "@/lib/utils";

const statusStyle: Record<ProjectStatus, string> = {
  Live: "border-accent/45 bg-accent/10 text-accent",
  "In Progress": "border-amber/45 bg-amber/10 text-amber",
  Prototype: "border-cyan/45 bg-cyan/10 text-cyan",
  Archived: "border-fg-dimmed/55 bg-bg-hover text-fg-muted",
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
