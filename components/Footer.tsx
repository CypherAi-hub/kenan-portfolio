import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-border text-fg-muted mt-32 flex items-center justify-between border-t py-10 font-mono text-xs">
      <span>{profile.copyright}</span>
      <span className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="bg-cyan absolute inset-0 rounded-full"
            style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
          />
          <span className="bg-cyan relative h-1.5 w-1.5 rounded-full" />
        </span>
        v1.0 · built with next.js · vercel
      </span>
    </footer>
  );
}
