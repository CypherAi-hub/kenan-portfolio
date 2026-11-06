import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { selectedWork, siteUrl } from "@/data/selected-work";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import BookingSection from "@/components/studio/BookingSection";
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
  return (
    <div className="studio">
      <StudioHeader />
      <main>
        <div className="studio-shell">
          <header className="detail-header">
            <Link className="text-link" href="/#work">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to selected work
            </Link>
            <p className="eyebrow">
              {p.category.toUpperCase()} / {p.status.toUpperCase()}
            </p>
            <h1>{p.headline}</h1>
            <p>{p.summary}</p>
          </header>
          <div className="detail-image">
            <ProjectVisual project={p} hero />
          </div>
          <p className="detail-note">{p.note}</p>
          <div className="detail-body">
            <aside className="detail-aside">
              <div>
                <h2>Project</h2>
                <p>{p.name}</p>
              </div>
              <div>
                <h2>My role</h2>
                <p>{p.role}</p>
              </div>
              <div>
                <h2>Focus</h2>
                <p>{p.stack.join(" · ")}</p>
              </div>
              {p.url && (
                <a className="studio-button" href={p.url} target="_blank" rel="noreferrer">
                  {p.urlLabel}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
            </aside>
            <div className="detail-copy">
              <section>
                <h2>The starting point</h2>
                <p>{p.problem}</p>
              </section>
              <section>
                <h2>How I approached it</h2>
                <p>{p.approach}</p>
              </section>
              <section>
                <h2>Inside the experience</h2>
                <ul>
                  {p.features.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h2>Have something similar in mind?</h2>
                <p>
                  Let’s talk about the experience you want to create and what a useful first version
                  could look like.
                </p>
                <Link href="/#book" className="text-link" style={{ marginTop: 20 }}>
                  Book a discovery call <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </section>
            </div>
          </div>
        </div>
        <BookingSection />
      </main>
      <StudioFooter />
    </div>
  );
}
