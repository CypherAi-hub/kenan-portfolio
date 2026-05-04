"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccentLink({
  href,
  children,
  external,
  className,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const C = external ? "a" : Link;
  const ext = external ? { target: "_blank", rel: "noreferrer noopener" } : {};
  return (
    <C
      href={href}
      {...ext}
      className={cn(
        "group relative inline-flex items-center gap-2 font-mono text-sm text-fg transition-colors hover:text-accent",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      </span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      >
        →
      </span>
    </C>
  );
}
