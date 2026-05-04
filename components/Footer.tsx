import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="mt-32 flex items-center justify-between border-t border-border py-10 font-mono text-xs text-fg-muted">
      <span>{profile.copyright}</span>
      <span className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inset-0 rounded-full bg-cyan"
            style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
          />
          <span className="relative h-1.5 w-1.5 rounded-full bg-cyan" />
        </span>
        v1.0 · built with next.js · vercel
      </span>
    </footer>
  );
}
