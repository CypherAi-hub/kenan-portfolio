"use client";

import { useMemo, useState } from "react";
import {
  projectCategories,
  projects,
  projectStatuses,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/data/projects";
import ProjectArchiveCard from "@/components/ProjectArchiveCard";
import ProjectFilters, { type ArchiveFilters } from "@/components/ProjectFilters";

const initialFilters: ArchiveFilters = {
  query: "",
  category: "All",
  status: "All",
};

function searchable(project: Project) {
  return [
    project.title,
    project.repo,
    project.category,
    project.status,
    project.description,
    project.techStack.join(" "),
    project.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export default function ProjectArchive() {
  const [filters, setFilters] = useState<ArchiveFilters>(initialFilters);

  const filteredProjects = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return projects
      .filter((project) => {
        const categoryMatch =
          filters.category === "All" || project.category === (filters.category as ProjectCategory);
        const statusMatch =
          filters.status === "All" || project.status === (filters.status as ProjectStatus);
        const queryMatch = !query || searchable(project).includes(query);
        return categoryMatch && statusMatch && queryMatch;
      })
      .sort((a, b) => a.priority - b.priority);
  }, [filters]);

  return (
    <div className="mt-10">
      <ProjectFilters
        filters={filters}
        onChange={setFilters}
        categories={projectCategories}
        statuses={projectStatuses}
      />

      <div className="text-fg-muted mt-5 flex items-center justify-between gap-4 font-mono text-xs">
        <span>
          {filteredProjects.length} of {projects.length} repositories
        </span>
        <span>Owner: CypherAi-hub</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectArchiveCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
