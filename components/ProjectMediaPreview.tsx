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

function previewFrame(project: Project, compact: boolean) {
  if (compact) return "absolute inset-0";

  if (project.visual === "fofit" || project.visual === "mobile") {
    return "absolute inset-y-6 left-1/2 aspect-[9/16] w-[46%] -translate-x-1/2 rounded-[30px] border-[8px] border-white/12 bg-black p-1 shadow-2xl shadow-black/70";
  }

  if (project.visual === "report") {
    return "absolute inset-y-5 left-1/2 aspect-[4/5] w-[54%] -translate-x-1/2 rotate-[-2deg] rounded border border-white/18 bg-white p-2 shadow-2xl shadow-black/60";
  }

  if (project.visual === "soc" || project.visual === "netwatch" || project.visual === "aws") {
    return "absolute inset-6 rounded border border-white/12 bg-black p-3 shadow-2xl shadow-black/70";
  }

  return "absolute inset-6 rounded border border-white/12 bg-bg-elevated p-2 shadow-2xl shadow-black/60";
}

function previewChrome(project: Project, compact: boolean) {
  if (
    compact ||
    project.visual === "fofit" ||
    project.visual === "mobile" ||
    project.visual === "report"
  ) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
      <div className="flex gap-1.5">
        <span className="size-1.5 rounded-full bg-white/35" />
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/10" />
      </div>
      <span className="text-fg-dimmed font-mono text-[9px] uppercase">{project.visual}</span>
    </div>
  );
}

function imageAreaClass(project: Project, compact: boolean) {
  if (
    compact ||
    project.visual === "fofit" ||
    project.visual === "mobile" ||
    project.visual === "report"
  ) {
    return "relative h-full overflow-hidden rounded-[4px]";
  }

  return "relative h-[calc(100%-26px)] overflow-hidden rounded-[4px]";
}

export default function ProjectMediaPreview({
  project,
  variant = "featured",
}: ProjectMediaPreviewProps) {
  const media = project.media[0];
  const compact = variant === "archive";

  if (media) {
    return (
      <figure className="bg-bg relative h-full min-h-[180px] overflow-hidden">
        <div className="premium-noise absolute inset-0 opacity-80" />
        <div className={previewFrame(project, compact)}>
          {previewChrome(project, compact)}
          <div className={imageAreaClass(project, compact)}>
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes={sizes[variant]}
              className="object-cover object-top grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
          </div>
        </div>
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
