import Image from "next/image";
import { certifications, skillGroups } from "@/lib/data";
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
          <article
            key={group.label}
            className="glass-panel group rounded p-5 transition duration-300 hover:-translate-y-1 hover:border-white/22"
          >
            <h3 className="text-fg font-mono text-xs uppercase">{group.label}</h3>
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
        <article className="glass-panel overflow-hidden rounded md:col-span-2 xl:col-span-3">
          <div className="grid lg:grid-cols-[1fr_1.05fr]">
            <div className="p-5">
              <h3 className="text-fg font-mono text-xs uppercase">Certifications / Learning</h3>
              <div className="mt-5 grid gap-3">
                {certifications.map((certification) => (
                  <div
                    key={certification.name}
                    className="border-border bg-bg/70 rounded border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold">{certification.name}</p>
                      <span className="text-fg-secondary rounded border border-white/20 bg-white/[0.06] px-2 py-1 font-mono text-[11px] uppercase">
                        {certification.status}
                      </span>
                    </div>
                    <p className="text-fg-muted mt-2 text-sm">{certification.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[280px] border-t border-white/10 bg-white lg:border-t-0 lg:border-l">
              <Image
                src="/media/projects/certifications/google-cybersecurity-certificate.webp"
                alt="Google Cybersecurity Professional Certificate completion proof for Kenan Larry"
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
