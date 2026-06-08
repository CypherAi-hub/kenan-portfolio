import Image from "next/image";
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
          <div className="premium-noise bg-bg relative min-h-[420px] overflow-hidden rounded border border-white/12">
            <div className="absolute inset-x-12 top-10 h-28 bg-white/12 blur-3xl" />
            <div className="absolute inset-8 rotate-[-2deg] rounded border border-white/20 bg-white p-2 shadow-2xl shadow-black/60">
              <Image
                src="/media/projects/cyberlou-pentest-report/pentest-report-preview.webp"
                alt="Safe preview of the Cyberlou penetration test report"
                fill
                sizes="(min-width: 1024px) 420px, 100vw"
                className="rounded-[4px] object-cover object-top grayscale"
              />
            </div>
            <div className="bg-bg/82 absolute inset-x-4 bottom-4 rounded border border-white/12 p-4 backdrop-blur">
              <ShieldCheck className="text-fg" size={26} aria-hidden />
              <p className="text-fg-muted mt-3 font-mono text-xs uppercase">Cyberlou Corporation</p>
              <h3 className="mt-1 text-xl font-semibold">Penetration Test Report</h3>
              <p className="text-fg-muted mt-2 text-xs">Safe/redacted portfolio preview</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-fg flex items-center gap-2 font-mono text-xs uppercase">
            <FileText size={15} aria-hidden />
            Security reporting artifact
          </div>
          <h3 className="mt-4 text-2xl font-semibold">Cyberlou Penetration Test Report</h3>
          <p className="text-fg-secondary mt-3 leading-7">
            A 49-page assessment deliverable for a controlled lab engagement covering scope,
            reconnaissance, exploitation documentation, severity, findings, evidence capture, and
            remediation planning. The portfolio preview stays safe and avoids exposing sensitive
            credentials, exploit values, or private data.
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
                  className="border-border text-fg-secondary inline-flex h-10 items-center gap-2 rounded border px-3 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
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
