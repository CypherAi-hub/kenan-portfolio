"use client";

import { Search } from "lucide-react";
import type { ProjectCategory, ProjectStatus } from "@/data/projects";
import { cn } from "@/lib/utils";

export type ArchiveFilters = {
  query: string;
  category: "All" | ProjectCategory;
  status: "All" | ProjectStatus;
};

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded border px-3 font-mono text-xs transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-fg-secondary hover:border-cyan/45 hover:text-cyan",
      )}
    >
      {children}
    </button>
  );
}

export default function ProjectFilters({
  filters,
  onChange,
  categories,
  statuses,
}: {
  filters: ArchiveFilters;
  onChange: (filters: ArchiveFilters) => void;
  categories: ProjectCategory[];
  statuses: ProjectStatus[];
}) {
  return (
    <div className="border-border bg-bg-elevated/52 rounded border p-3">
      <label className="relative block">
        <Search
          size={16}
          aria-hidden
          className="text-fg-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <span className="sr-only">Search repositories</span>
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search repositories, tags, tech..."
          className="border-border bg-bg text-fg placeholder:text-fg-dimmed focus:border-accent h-11 w-full rounded border px-10 font-mono text-sm outline-none"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterButton
          active={filters.category === "All"}
          onClick={() => onChange({ ...filters, category: "All" })}
        >
          All Categories
        </FilterButton>
        {categories.map((category) => (
          <FilterButton
            key={category}
            active={filters.category === category}
            onClick={() => onChange({ ...filters, category })}
          >
            {category}
          </FilterButton>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterButton
          active={filters.status === "All"}
          onClick={() => onChange({ ...filters, status: "All" })}
        >
          All Statuses
        </FilterButton>
        {statuses.map((status) => (
          <FilterButton
            key={status}
            active={filters.status === status}
            onClick={() => onChange({ ...filters, status })}
          >
            {status}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}
