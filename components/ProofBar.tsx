import { proofPoints } from "@/lib/data";

export default function ProofBar() {
  return (
    <section aria-label="Proof points" className="border-border bg-bg-elevated/38 border-y">
      <div className="mx-auto grid max-w-[1280px] gap-px px-4 py-3 sm:grid-cols-2 lg:grid-cols-4 lg:px-8 xl:grid-cols-8">
        {proofPoints.map((point) => (
          <div
            key={point}
            className="border-border text-fg-secondary min-h-14 px-3 py-3 font-mono text-xs leading-5 lg:border-r last:lg:border-r-0"
          >
            {point}
          </div>
        ))}
      </div>
    </section>
  );
}
