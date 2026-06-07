import { Download, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const reportLinks = [
  {
    label: "View PDF",
    href: "/reports/cyberlou-pentest-report.pdf",
    icon: ExternalLink,
  },
  {
    label: "Download DOCX",
    href: "/reports/cyberlou-pentest-report.docx",
    icon: Download,
  },
];

export default function SecurityReportSection() {
  return (
    <section id="security-report" className="section-shell py-20">
      <SectionHeader eyebrow="Security Assessment" title="Pentest report proof.">
        A complete Cyberlou Corporation penetration test report from a CTF-style assessment, showing
        executive communication, methodology, finding writeups, severity framing, and remediation
        guidance.
      </SectionHeader>

      <article className="border-border bg-bg-elevated/56 mt-10 grid overflow-hidden rounded border lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-border bg-bg/70 border-b p-6 lg:border-r lg:border-b-0">
          <div className="border-border bg-bg-elevated flex aspect-[4/3] items-center justify-center rounded border">
            <div className="text-center">
              <ShieldCheck className="text-accent mx-auto" size={42} aria-hidden />
              <p className="text-fg-muted mt-5 font-mono text-xs uppercase">Cyberlou Corporation</p>
              <h3 className="mt-2 text-2xl font-semibold">Penetration Test Report</h3>
              <p className="text-fg-muted mt-3 text-sm">470 Final SP26 CTF Assessment</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-accent flex items-center gap-2 font-mono text-xs uppercase">
            <FileText size={15} aria-hidden />
            Security reporting artifact
          </div>
          <h3 className="mt-4 text-2xl font-semibold">Cyberlou Pentest Report</h3>
          <p className="text-fg-secondary mt-3 leading-7">
            A polished assessment deliverable covering scope, methodology, severity, findings,
            business impact, and remediation. It complements the SOC Monitor and Netwatch projects
            by showing that I can communicate security work in a client-ready format.
          </p>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            {["Executive summary", "Technical findings", "Remediation guidance"].map((item) => (
              <div key={item} className="border-border bg-bg rounded border p-3">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {reportLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="border-border text-fg-secondary hover:border-accent/45 hover:text-accent inline-flex h-10 items-center gap-2 rounded border px-3 font-mono text-sm transition-colors"
                >
                  <Icon size={16} aria-hidden />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </article>
    </section>
  );
}
