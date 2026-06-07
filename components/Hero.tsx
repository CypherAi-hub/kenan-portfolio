import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import GradientMesh from "@/components/effects/GradientMesh";

function HeroLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        primary
          ? "border-accent bg-accent text-bg hover:bg-accent-dim inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors"
          : "border-border text-fg-secondary hover:border-cyan/55 hover:text-cyan inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors"
      }
    >
      {children}
    </a>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <GradientMesh />
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="max-w-4xl">
          <div className="border-accent/45 bg-accent/10 text-accent inline-flex rounded border px-3 py-2 font-mono text-xs">
            {profile.status}
          </div>
          <h1 className="mt-6 text-5xl leading-none font-semibold md:text-7xl">{profile.name}</h1>
          <p className="text-fg mt-5 max-w-3xl text-2xl leading-tight md:text-4xl">
            {profile.headline}
          </p>
          <p className="text-fg-secondary mt-6 max-w-2xl text-base leading-7 md:text-lg">
            {profile.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <HeroLink href="#featured" primary>
              View Projects
              <ArrowRight size={16} aria-hidden />
            </HeroLink>
            {profile.resumeUrl ? (
              <HeroLink href={profile.resumeUrl}>
                <Download size={16} aria-hidden />
                Download Resume
              </HeroLink>
            ) : (
              <span
                aria-disabled="true"
                title="Resume PDF not added yet"
                className="border-border text-fg-muted inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm"
              >
                <Download size={16} aria-hidden />
                Download Resume
              </span>
            )}
            <HeroLink href={profile.github}>
              <Github size={16} aria-hidden />
              GitHub
            </HeroLink>
            <HeroLink href={profile.linkedin}>
              <Linkedin size={16} aria-hidden />
              LinkedIn
            </HeroLink>
            <HeroLink href={`mailto:${profile.email}`}>
              <Mail size={16} aria-hidden />
              Contact
            </HeroLink>
          </div>
        </div>
      </div>
    </section>
  );
}
