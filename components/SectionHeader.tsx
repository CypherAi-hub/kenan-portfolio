export default function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-accent font-mono text-xs uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl leading-tight font-semibold md:text-4xl">{title}</h2>
      {children && <p className="text-fg-secondary mt-4 text-base leading-7">{children}</p>}
    </div>
  );
}
