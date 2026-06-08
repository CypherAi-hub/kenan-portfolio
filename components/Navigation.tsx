import { Github, Linkedin } from "lucide-react";
import { profile } from "@/lib/data";

const navItems = [
  { label: "Work", href: "#featured" },
  { label: "Media", href: "#media" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Archive", href: "#archive" },
  { label: "Resume", href: "#resume" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  return (
    <header className="bg-bg/72 sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded border border-white/18 bg-white/10 font-mono text-sm">
            KL
          </span>
          <span className="hidden text-sm font-semibold sm:inline">{profile.name}</span>
        </a>

        <div className="scrollbar-hide hidden items-center gap-1 overflow-x-auto md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-fg-muted hover:text-fg rounded px-3 py-2 font-mono text-xs transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={profile.github}
            aria-label="GitHub"
            className="border-border text-fg-secondary flex size-9 items-center justify-center rounded border transition-colors hover:border-white/45 hover:text-white"
          >
            <Github size={16} aria-hidden />
          </a>
          <a
            href={profile.linkedin}
            aria-label="LinkedIn"
            className="border-border text-fg-secondary flex size-9 items-center justify-center rounded border transition-colors hover:border-white/45 hover:text-white"
          >
            <Linkedin size={16} aria-hidden />
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="text-fg hidden h-9 items-center rounded border border-white/30 bg-white/10 px-3 font-mono text-xs transition-colors hover:bg-white/15 sm:inline-flex"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
