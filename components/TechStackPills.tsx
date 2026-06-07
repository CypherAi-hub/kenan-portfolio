import { cn } from "@/lib/utils";

export default function TechStackPills({
  stack,
  compact = false,
}: {
  stack: string[];
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
      {stack.map((item) => (
        <li
          key={item}
          className={cn(
            "border-border bg-bg-elevated/80 text-fg-secondary rounded border font-mono",
            compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
