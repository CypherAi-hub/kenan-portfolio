import { Download, Github, Linkedin } from "lucide-react";
import { profile } from "@/lib/data";
import SectionHeader from "@/components/SectionHeader";

export default function ResumeCTA() {
  return (
    <section id="resume" className="section-shell py-20">
      <SectionHeader eyebrow="Resume" title="A clean handoff for recruiters.">
        Central links for resume review, project depth, and professional context.
      </SectionHeader>

      <div className="mt-8 flex flex-wrap gap-3">
        {profile.resumeUrl ? (
          <a
            href={profile.resumeUrl}
            className="border-accent bg-accent text-bg inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
          >
            <Download size={16} aria-hidden />
            Download Resume
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="border-border text-fg-muted inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
          >
            <Download size={16} aria-hidden />
            Download Resume
          </span>
        )}
        <a
          href={profile.linkedin}
          className="border-border text-fg-secondary hover:border-cyan/55 hover:text-cyan inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
        >
          <Linkedin size={16} aria-hidden />
          View LinkedIn
        </a>
        <a
          href={profile.github}
          className="border-border text-fg-secondary hover:border-cyan/55 hover:text-cyan inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
        >
          <Github size={16} aria-hidden />
          View GitHub
        </a>
      </div>
    </section>
  );
}
