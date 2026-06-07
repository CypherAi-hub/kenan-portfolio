import { certification, skillGroups } from "@/lib/data";
import SectionHeader from "@/components/SectionHeader";

export default function SkillsGrid() {
  return (
    <section id="skills" className="section-shell py-20">
      <SectionHeader eyebrow="Skills" title="Stack grouped by how recruiters scan.">
        The skills section connects language, product, AI, cloud, and cybersecurity fundamentals
        instead of burying them in a comma-separated wall.
      </SectionHeader>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group) => (
          <article key={group.label} className="border-border bg-bg-elevated/52 rounded border p-5">
            <h3 className="text-accent font-mono text-xs uppercase">{group.label}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="border-border bg-bg text-fg-secondary rounded border px-2.5 py-1.5 text-sm"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <article className="border-amber/45 bg-amber/10 rounded border p-5">
          <h3 className="text-amber font-mono text-xs uppercase">Certification / Learning</h3>
          <p className="mt-4 text-xl font-semibold">{certification.name}</p>
          <p className="text-fg-secondary mt-2 text-sm">{certification.status}</p>
        </article>
      </div>
    </section>
  );
}
