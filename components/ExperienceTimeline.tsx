import { experiences } from "@/lib/data";
import SectionHeader from "@/components/SectionHeader";

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="section-shell py-20">
      <SectionHeader
        eyebrow="Experience"
        title="Technical work, client work, and operations discipline."
      >
        Experience is framed honestly: technical support, consulting, AI evaluation, and operations
        quality standards.
      </SectionHeader>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {experiences.map((experience) => (
          <article
            key={`${experience.org}-${experience.role}`}
            className="border-border bg-bg-elevated/52 rounded border p-5"
          >
            <p className="text-accent font-mono text-xs">{experience.org}</p>
            <h3 className="mt-3 text-xl font-semibold">{experience.role}</h3>
            <p className="text-fg-secondary mt-3 text-sm leading-6">{experience.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
