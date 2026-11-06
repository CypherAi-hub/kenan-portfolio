import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projectLibrary } from "@/data/project-library";
import { siteUrl } from "@/data/selected-work";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";

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
  return (
    <div className="studio">
      <StudioHeader />
      <main className="studio-shell library-detail">
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
        <div className="detail-body">
          <aside className="detail-aside">
            <div>
              <h2>Project stage</h2>
              <p>{p.status}</p>
            </div>
            <div>
              <h2>Focus</h2>
              <p>{p.tags.join(" · ")}</p>
            </div>
          </aside>
          <div className="detail-copy">
            <section>
              <h2>About the project</h2>
              <p>{p.detail}</p>
              <div className="library-detail-links">
                {p.overview && (
                  <Link className="studio-button" href={p.overview}>
                    Read the project story <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                )}
                {p.liveUrl && (
                  <a className="text-link" href={p.liveUrl} target="_blank" rel="noreferrer">
                    {p.liveUrl.endsWith(".pdf") ? "Read the report" : "Visit the website"}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                )}
                {p.notesUrl && (
                  <Link className="text-link" href={p.notesUrl}>
                    Earlier project notes <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                )}
                {p.sourceUrl && (
                  <a className="text-link" href={p.sourceUrl} target="_blank" rel="noreferrer">
                    Public source <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                )}
              </div>
            </section>
            <section>
              <h2>Let’s build your next idea.</h2>
              <p>
                Have a website, app, or workflow in mind? We can start with a short conversation
                about what you need.
              </p>
              <Link href="/book" className="text-link" style={{ marginTop: 20 }}>
                Book with me <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </section>
          </div>
        </div>
      </main>
      <StudioFooter />
    </div>
  );
}
