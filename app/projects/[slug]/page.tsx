import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projectLibrary } from "@/data/project-library";
import { siteUrl } from "@/data/selected-work";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import ProjectDetails from "@/components/studio/ProjectDetails";
import ProjectShare from "@/components/studio/ProjectShare";
import { projectDetails } from "@/data/project-details";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projectLibrary.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projectLibrary.find((x) => x.slug === slug);
  return p
    ? {
        title: p.title,
        description: p.description,
        alternates: { canonical: `${siteUrl}/projects/${slug}` },
      }
    : {};
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = projectLibrary.find((x) => x.slug === slug);
  if (!p) notFound();
  const d = projectDetails[p.slug];
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main id="main" className="studio-shell library-detail">
        <header className="detail-header">
          <Link href="/projects" className="text-link">
            <ArrowLeft size={16} aria-hidden="true" />
            All projects
          </Link>
          <p className="eyebrow">
            {p.category.toUpperCase()} / {p.status.toUpperCase()}
          </p>
          <h1>{p.title}</h1>
          <p>{p.description}</p>
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
            <ProjectShare url={`${siteUrl}/projects/${p.slug}`} />
          </div>
        </header>
        {p.image && (
          <figure
            className={`library-detail-image ${p.image.includes("fofit-workout") || p.image.includes("ultraflips-watchlist") ? "library-detail-phone" : ""}`}
          >
            <Image
              src={p.image}
              alt={p.imageAlt || p.title}
              width={1440}
              height={1000}
              sizes="(min-width: 900px) 80vw, 90vw"
              priority
            />
            <figcaption>{p.imageNote}</figcaption>
          </figure>
        )}
        <ProjectDetails project={p} />
      </main>
      <StudioFooter />
    </div>
  );
}
