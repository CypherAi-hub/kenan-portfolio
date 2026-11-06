import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { projectLibrary } from "@/data/project-library";
import { caseStudies, getCaseStudy, projects } from "@/data/projects";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return caseStudies.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getCaseStudy(slug);
  return s ? { title: `${s.title} — Project Notes`, description: s.summary } : {};
}
export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const s = getCaseStudy(slug);
  if (!s) notFound();
  const p = projects.find((x) => x.caseStudySlug === slug);
  return (
    <div className="studio">
      <StudioHeader />
      <main className="studio-shell legacy-case">
        <Link href="/projects" className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Project archive
        </Link>
        <h1>{s.title}</h1>
        <p>From the project archive. These notes describe an earlier stage of the build.</p>
        {slug === "fofit" && (
          <Link className="studio-button" style={{ marginTop: 20 }} href="/work/fofit">
            See the current FoFit overview
          </Link>
        )}
        <h2>The project</h2>
        <p>{s.summary}</p>
        <h2>The problem</h2>
        <p>{s.problem}</p>
        <h2>My role</h2>
        <p>{s.role}</p>
        <h2>Built with</h2>
        <p>{s.techStack.join(" · ")}</p>
        <h2>Features explored</h2>
        <ul>
          {s.keyFeatures.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h2>What I learned</h2>
        <ul>
          {s.learnings.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {p?.media.length ? (
          <>
            <h2>Project gallery</h2>
            <div className="legacy-gallery">
              {p.media.slice(0, 4).map((m) => (
                <figure key={m.src}>
                  <Image
                    src={m.src}
                    alt={m.alt}
                    width={900}
                    height={650}
                    sizes="(min-width: 900px) 45vw, 90vw"
                  />
                  <figcaption>{m.label} · Archive image</figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : null}
        {p && projectLibrary.find((x) => x.slug === p.slug)?.sourceUrl && (
          <a className="text-link" style={{ marginTop: 30 }} href={p.githubUrl}>
            View the project on GitHub
          </a>
        )}
      </main>
      <StudioFooter />
    </div>
  );
}
