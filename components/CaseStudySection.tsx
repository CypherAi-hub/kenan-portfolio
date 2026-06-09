import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { caseStudies, projects } from "@/data/projects";
import SectionHeader from "@/components/SectionHeader";

function previewFor(slug: string) {
  const project = projects.find((candidate) => candidate.slug === slug);
  return project?.media[0];
}

export default function CaseStudySection() {
  return (
    <section id="case-studies" className="section-shell py-20">
      <SectionHeader eyebrow="Case Studies" title="Structured writeups, ready for screenshots.">
        Each case study has the honest bones in place: overview, problem, role, stack, features,
        challenges, learnings, and a clear screenshot slot.
      </SectionHeader>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {caseStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/case-studies/${study.slug}`}
            className="group glass-panel overflow-hidden rounded transition duration-300 hover:-translate-y-1 hover:border-white/24"
          >
            <div className="relative h-52 overflow-hidden border-b border-white/10 bg-bg">
              <div className="premium-noise absolute inset-0 opacity-80" />
              {previewFor(study.slug) ? (
                <Image
                  src={previewFor(study.slug)!.src}
                  alt={previewFor(study.slug)!.alt}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-top grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
              ) : (
                <div className="relative flex h-full items-center justify-center text-sm text-fg-muted">
                  Media coming soon
                </div>
              )}
              <div className="from-bg/90 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-4">
                <div className="text-fg flex items-center gap-2 font-mono text-xs uppercase">
                  <FileText size={15} aria-hidden />
                  Case Study
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="group-hover:text-white mt-1 text-xl font-semibold">{study.title}</h3>
              <p className="text-fg-secondary mt-3 text-sm leading-6">{study.summary}</p>
              <div className="mt-5 grid gap-3 text-xs leading-5 text-fg-muted">
                <p>
                  <span className="font-mono uppercase text-fg-dimmed">Problem: </span>
                  {study.problem}
                </p>
                <p>
                  <span className="font-mono uppercase text-fg-dimmed">Proof: </span>
                  {study.keyFeatures[0]}
                </p>
              </div>
              <div className="border-white/10 mt-5 flex items-center justify-between border-t pt-4">
                <p className="text-fg-muted font-mono text-xs">{study.repo}</p>
                <ArrowRight
                  size={16}
                  className="text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-white"
                  aria-hidden
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
