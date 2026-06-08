import { proofPoints } from "@/lib/data";

export default function ProofBar() {
  return (
    <section
      aria-label="Proof points"
      className="border-border bg-bg-elevated/38 overflow-hidden rounded border"
    >
      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {proofPoints.map((point) => (
          <div
            key={point}
            className="border-border text-fg-secondary min-h-14 border-b px-3 py-3 font-mono text-xs leading-5 sm:border-r last:sm:border-r-0 lg:border-b-0"
          >
            {point}
          </div>
        ))}
      </div>
    </section>
  );
}
