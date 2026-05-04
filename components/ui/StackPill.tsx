export default function StackPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-bg-elevated/60 px-2 py-1 font-mono text-[11px] text-fg-secondary transition-colors group-hover:border-accent/30">
      {children}
    </span>
  );
}
