import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Github } from "lucide-react";
import { caseStudies, getCaseStudy, projects } from "@/data/projects";
import TechStackPills from "@/components/TechStackPills";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return {};
  }

  return {
    title: `${study.title} Case Study`,
    description: study.summary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  const project = projects.find((item) => item.caseStudySlug === study.slug);

  return (
    <main className="mx-auto w-full max-w-[980px] overflow-x-hidden px-4 py-12 lg:px-8">
      <Link
        href="/#case-studies"
        className="text-fg-secondary inline-flex items-center gap-2 font-mono text-sm hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to portfolio
      </Link>

      <header className="border-border mt-12 min-w-0 border-b pb-10">
        <p className="text-fg font-mono text-xs uppercase">Case Study Proof</p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">{study.title}</h1>
        <p className="text-fg-secondary mt-5 text-lg leading-8 break-words">{study.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {project && (
            <a
              href={project.githubUrl}
              className="border-border text-fg-secondary inline-flex h-10 items-center gap-2 rounded border px-3 font-mono text-sm hover:border-white/45 hover:text-white"
            >
              <Github size={16} aria-hidden />
              View GitHub
            </a>
          )}
          {project?.liveUrl && (
            <a
              href={project.liveUrl}
              className="inline-flex h-10 items-center gap-2 rounded border border-white/45 bg-white/10 px-3 font-mono text-sm text-white"
            >
              View Live
            </a>
          )}
        </div>
      </header>

      <div className="grid min-w-0 gap-10 py-10">
        <section className="min-w-0">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-fg-secondary mt-3 leading-7 break-words">{study.summary}</p>
        </section>

        <section className="min-w-0">
          <h2 className="text-2xl font-semibold">Problem</h2>
          <p className="text-fg-secondary mt-3 leading-7 break-words">{study.problem}</p>
        </section>

        <section className="min-w-0">
          <h2 className="text-2xl font-semibold">My Role</h2>
          <p className="text-fg-secondary mt-3 leading-7 break-words">{study.role}</p>
        </section>

        <section className="min-w-0">
          <h2 className="text-2xl font-semibold">Tech Stack</h2>
          <div className="mt-4">
            <TechStackPills stack={study.techStack} />
          </div>
        </section>

        <section className="grid min-w-0 gap-6 md:grid-cols-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">Key Features</h2>
            <ul className="text-fg-secondary mt-3 space-y-2 text-sm leading-6">
              {study.keyFeatures.map((feature) => (
                <li key={feature} className="break-words">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">Technical Challenges</h2>
            <ul className="text-fg-secondary mt-3 space-y-2 text-sm leading-6">
              {study.technicalChallenges.map((challenge) => (
                <li key={challenge} className="break-words">
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">What I Learned</h2>
            <ul className="text-fg-secondary mt-3 space-y-2 text-sm leading-6">
              {study.learnings.map((learning) => (
                <li key={learning} className="break-words">
                  {learning}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-border bg-bg-elevated/52 min-w-0 rounded border p-5">
          <h2 className="text-2xl font-semibold">Screenshots / Demo Area</h2>
          <p className="text-fg-secondary mt-3 leading-7 break-words">{study.screenshotPrompt}</p>
          {project?.media.length ? (
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
              {project.media.map((media) => (
                <figure
                  key={media.src}
                  className="border-border bg-bg relative min-w-0 overflow-hidden rounded border"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="text-fg-muted border-border border-t px-3 py-2 font-mono text-[11px] break-words uppercase">
                    {media.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="border-border text-fg-muted mt-5 rounded border p-4 font-mono text-xs uppercase">
              Media coming soon
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
