import type { ProjectStatus } from "@/data/projects";
import ProjectStatusBadge from "@/components/ProjectStatusBadge";

export default function StatusPill({ status }: { status: ProjectStatus }) {
  return <ProjectStatusBadge status={status} />;
}
