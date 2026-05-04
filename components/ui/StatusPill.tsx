import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/data";

const config: Record<ProjectStatus, { label: string; cls: string; pulse?: boolean }> = {
  live: { label: "LIVE", cls: "border-accent/40 text-accent", pulse: true },
  active: { label: "ACTIVE BUILD", cls: "border-status-active/40 text-status-active" },
  early: { label: "EARLY BUILD", cls: "border-cyan/40 text-cyan" },
  shipped: { label: "SHIPPED", cls: "border-fg-muted/40 text-fg-secondary" },
  private: { label: "PRIVATE", cls: "border-fg-dimmed/40 text-fg-muted" },
};

export default function StatusPill({ status }: { status: ProjectStatus }) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
        c.cls,
      )}
    >
      {c.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inset-0 rounded-full bg-current"
            style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
          />
          <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {c.label}
    </span>
  );
}
