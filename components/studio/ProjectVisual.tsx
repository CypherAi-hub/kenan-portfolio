import Image from "next/image";
import { selectedWork } from "@/data/selected-work";
export default function ProjectVisual({
  project,
  hero = false,
}: {
  project: (typeof selectedWork)[number];
  hero?: boolean;
}) {
  return (
    <div className={`project-visual visual-${project.theme} ${hero ? "visual-hero" : ""}`}>
      <span className="visual-orbit orbit-one" aria-hidden="true" />
      <span className="visual-orbit orbit-two" aria-hidden="true" />
      {!["fofit", "ultraflips"].includes(project.slug) ? (
        <div className="browser-frame">
          <div className="browser-bar">
            <span aria-hidden="true">● ● ●</span>
            <span>{project.name}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <Image
            src={project.image}
            alt={project.alt}
            width={1440}
            height={1000}
            sizes="(min-width: 900px) 65vw, 100vw"
            priority={hero}
            className="browser-capture"
          />
        </div>
      ) : (
        <div className="phones">
          <div className="phone-frame">
            <Image
              src={project.image}
              alt={project.alt}
              width={720}
              height={1565}
              sizes="(min-width: 900px) 280px, 220px"
            />
          </div>
          {project.secondImage ? (
            <div className="phone-frame second-phone">
              <Image
                src={project.secondImage}
                alt="FoFit recipe discovery interface from a development build"
                width={720}
                height={1565}
                sizes="(min-width: 900px) 250px, 180px"
              />
            </div>
          ) : (
            <div className="phone-frame second-phone">
              <Image
                src="/media/showcase/ultra-identification.webp"
                alt="UltraFlips exact-card review in a Simulator with sample data"
                width={720}
                height={1565}
                sizes="(min-width: 900px) 250px, 180px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
