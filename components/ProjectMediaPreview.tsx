import Image from "next/image";
import type { Project } from "@/data/projects";
import ProjectVisual from "@/components/ProjectVisual";

type ProjectMediaPreviewProps = {
  project: Project;
  variant?: "featured" | "archive" | "case-study";
};

const sizes = {
  featured: "(min-width: 1024px) 620px, 100vw",
  archive: "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  "case-study": "(min-width: 1024px) 900px, 100vw",
};

export default function ProjectMediaPreview({
  project,
  variant = "featured",
}: ProjectMediaPreviewProps) {
  const media = project.media[0];
  const compact = variant === "archive";

  if (media) {
    return (
      <figure className="relative h-full min-h-[180px] overflow-hidden">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes[variant]}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <figcaption className="from-bg/80 via-bg/20 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-3">
          <span className="border-border bg-bg/80 text-fg-secondary inline-flex rounded border px-2 py-1 font-mono text-[10px] uppercase backdrop-blur">
            {media.label}
          </span>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="relative h-full min-h-[180px] overflow-hidden">
      <div className="absolute inset-0 opacity-35">
        <ProjectVisual visual={project.visual} />
      </div>
      <div className="from-bg via-bg/78 absolute inset-0 bg-gradient-to-br to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-4">
        <span className="border-border text-fg-secondary inline-flex w-fit rounded border px-2 py-1 font-mono text-[10px] uppercase">
          Media coming soon
        </span>
        {!compact && (
          <p className="text-fg-muted mt-3 max-w-sm text-sm leading-6">{project.notes}</p>
        )}
      </div>
    </div>
  );
}
