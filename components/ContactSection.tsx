import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import { profile } from "@/lib/data";
import SectionHeader from "@/components/SectionHeader";

const contactLinks = [
  { label: "Email", href: `mailto:${profile.email}`, value: profile.email, icon: Mail },
  { label: "LinkedIn", href: profile.linkedin, value: profile.linkedinLabel, icon: Linkedin },
  { label: "GitHub", href: profile.github, value: "github.com/CypherAi-hub", icon: Github },
];

export default function ContactSection() {
  return (
    <section id="contact" className="section-shell py-20">
      <SectionHeader
        eyebrow="Contact"
        title="Open to Technology, Cybersecurity, AI, Cloud, and Consulting internships."
      >
        Based in St. Louis, MO and focused on Summer 2027 opportunities.
      </SectionHeader>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded p-5">
          <div className="text-fg-secondary flex items-center gap-3">
            <MapPin size={18} aria-hidden />
            <span>{profile.location}</span>
          </div>
          <p className="text-fg-secondary mt-4 text-sm leading-6">
            I am building toward internships where AI product execution, cybersecurity fundamentals,
            cloud workflows, and communication all matter.
          </p>
        </div>
        <div className="glass-panel rounded p-5">
          <ul className="space-y-3">
            {contactLinks.map(({ label, href, value, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="border-border bg-bg text-fg-secondary flex items-center justify-between gap-4 rounded border px-3 py-3 text-sm transition-colors hover:border-white/45 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} aria-hidden />
                    {label}
                  </span>
                  <span className="font-mono text-xs">{value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
