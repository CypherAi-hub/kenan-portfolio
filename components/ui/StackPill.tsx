export default function StackPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border bg-bg-elevated/60 text-fg-secondary group-hover:border-accent/30 inline-flex items-center rounded-md border px-2 py-1 font-mono text-[11px] transition-colors">
      {children}
    </span>
  );
}
