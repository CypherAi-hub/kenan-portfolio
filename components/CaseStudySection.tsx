import Link from "next/link";
import { FileText } from "lucide-react";
import { caseStudies } from "@/data/projects";
import SectionHeader from "@/components/SectionHeader";

export default function CaseStudySection() {
  return (
    <section id="case-studies" className="section-shell py-20">
      <SectionHeader eyebrow="Case Studies" title="Structured writeups, ready for screenshots.">
        Each case study has the honest bones in place: overview, problem, role, stack, features,
        challenges, learnings, and a clear screenshot slot.
      </SectionHeader>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {caseStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/case-studies/${study.slug}`}
            className="group border-border bg-bg-elevated/52 hover:border-accent/45 rounded border p-5 transition-colors"
          >
            <div className="text-accent flex items-center gap-2 font-mono text-xs">
              <FileText size={15} aria-hidden />
              Case Study Coming Soon
            </div>
            <h3 className="group-hover:text-accent mt-4 text-xl font-semibold">{study.title}</h3>
            <p className="text-fg-secondary mt-3 text-sm leading-6">{study.summary}</p>
            <p className="text-fg-muted mt-5 font-mono text-xs">{study.repo}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
