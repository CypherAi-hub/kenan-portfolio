import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { selectedWork, siteUrl } from "@/data/selected-work";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import ProjectDetails from "@/components/studio/ProjectDetails";
import ProjectShare from "@/components/studio/ProjectShare";
import { projectLibrary } from "@/data/project-library";
import { projectDetails } from "@/data/project-details";
import ProjectVisual from "@/components/studio/ProjectVisual";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return selectedWork.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = selectedWork.find((x) => x.slug === slug);
  return p
    ? {
        title: p.name,
        description: p.summary,
        alternates: { canonical: `${siteUrl}/work/${slug}` },
      }
    : {};
}
export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const p = selectedWork.find((x) => x.slug === slug);
  if (!p) notFound();
  const libraryProject = projectLibrary.find(
    (x) => x.slug === (slug === "ultraflips" ? "ultraflips-mobile" : slug),
  );
  if (!libraryProject) notFound();
  const d = projectDetails[libraryProject.slug];
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main id="main">
        <div className="studio-shell">
          <header className="detail-header">
            <Link className="text-link" href="/#work">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to selected work
            </Link>
            <p className="eyebrow">
              {p.name.toUpperCase()} / {p.status.toUpperCase()}
            </p>
            <h1>{p.headline}</h1>
            <p>{p.summary}</p>
            <div className="project-header-actions">
              {d.links[0] && (
                <a className="studio-button" href={d.links[0].url} target="_blank" rel="noreferrer">
                  {d.links[0].label}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
              <a className="text-link" href="#project-links">
                All links & availability <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <ProjectShare url={`${siteUrl}/work/${p.slug}`} />
            </div>
          </header>
          <div className="detail-image">
            <ProjectVisual project={p} hero />
          </div>
          <p className="detail-note">{p.note}</p>
          <ProjectDetails project={libraryProject} />
        </div>
      </main>
      <StudioFooter />
    </div>
  );
}
