import type { Project } from "@/data/projects";
import FeaturedProjectCard from "@/components/FeaturedProjectCard";

export default function ProjectCard({ project }: { project: Project; index?: number }) {
  return <FeaturedProjectCard project={project} />;
}
