import Image from "next/image";
import type { ProjectVisual as ProjectVisualKind } from "@/data/projects";

function TerminalLines({ lines }: { lines: string[] }) {
  return (
    <div className="bg-bg text-fg-secondary absolute inset-0 overflow-hidden p-4 font-mono text-[11px]">
      <div className="border-border text-fg-muted mb-3 flex items-center gap-2 border-b pb-3 text-[10px] uppercase">
        <span className="h-2 w-2 rounded-full bg-white/35" />
        <span className="h-2 w-2 rounded-full bg-white/22" />
        <span className="h-2 w-2 rounded-full bg-white/12" />
        <span className="ml-2">system proof</span>
      </div>
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={line} className="grid grid-cols-[32px_1fr] gap-3">
            <span className="tabular text-fg-dimmed">{String(index + 1).padStart(2, "0")}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="bg-bg absolute inset-0 p-4">
      <div className="grid h-full grid-cols-[0.7fr_1.3fr] gap-3">
        <div className="border-border space-y-3 border-r pr-3">
          {["Command", "Checkpoints", "Blockers", "Proof"].map((item, index) => (
            <div
              key={item}
              className="border-border bg-bg-elevated text-fg-secondary rounded border px-3 py-2 font-mono text-[10px]"
            >
              <span className={index === 0 ? "text-fg" : "text-fg-muted"}>{item}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-16 rounded border border-white/20 bg-white/10 p-3">
            <div className="h-2 w-28 bg-white/70" />
            <div className="mt-3 h-2 w-full bg-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border bg-bg-elevated h-20 rounded border p-3">
              <div className="h-2 w-16 bg-white/45" />
              <div className="mt-3 h-8 border border-white/18" />
            </div>
            <div className="border-border bg-bg-elevated h-20 rounded border p-3">
              <div className="h-2 w-16 bg-white/32" />
              <div className="mt-3 h-8 border border-white/12" />
            </div>
          </div>
          <div className="border-border bg-bg-elevated h-20 rounded border p-3">
            <div className="bg-fg-dimmed mb-3 h-2 w-24" />
            <div className="space-y-2">
              <div className="bg-fg-dimmed/70 h-1.5 w-full" />
              <div className="bg-fg-dimmed/50 h-1.5 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <svg viewBox="0 0 640 400" className="bg-bg absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="shield-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#8a8a8a" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="#030303" />
      {Array.from({ length: 10 }).map((_, index) => (
        <line
          key={index}
          x1="0"
          y1={40 + index * 34}
          x2="640"
          y2={40 + index * 34}
          stroke="#2a2a2a"
          strokeWidth="1"
          opacity="0.55"
        />
      ))}
      <path
        d="M320 72 442 116v88c0 82-49 126-122 158-73-32-122-76-122-158v-88L320 72Z"
        fill="#0c0c0d"
        stroke="url(#shield-line)"
        strokeWidth="3"
      />
      <path d="M270 206l34 34 76-88" fill="none" stroke="#f5f5f5" strokeWidth="14" />
      <circle cx="122" cy="108" r="7" fill="#d8d8d8" />
      <circle cx="514" cy="268" r="7" fill="#9a9a9a" />
      <circle cx="120" cy="300" r="5" fill="#ffffff" />
      <line x1="129" y1="108" x2="198" y2="154" stroke="#2a2a2a" strokeWidth="2" />
      <line x1="507" y1="268" x2="436" y2="226" stroke="#2a2a2a" strokeWidth="2" />
    </svg>
  );
}

export default function ProjectVisual({ visual }: { visual: ProjectVisualKind }) {
  if (visual === "fofit" || visual === "coach") {
    return (
      <Image
        src={
          visual === "fofit"
            ? "/images/projects/fofit-product-devices.jpg"
            : "/images/projects/fofit-hero-poster.jpg"
        }
        alt={visual === "fofit" ? "FoFit product device preview" : "FoFit coach ecosystem preview"}
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="object-cover"
      />
    );
  }

  if (visual === "aws") {
    return (
      <TerminalLines
        lines={[
          's3 = boto3.client("s3")',
          'rek = boto3.client("rekognition")',
          "detect_labels(Image={S3Object})",
          "draw bounding boxes + confidence",
          "export annotated image output",
        ]}
      />
    );
  }

  if (visual === "soc" || visual === "netwatch") {
    return <ShieldVisual />;
  }

  if (visual === "agentroom" || visual === "portfolio") {
    return <DashboardVisual />;
  }

  return (
    <TerminalLines
      lines={[
        "repo indexed",
        "status classified",
        "description kept conservative",
        "github link verified",
        "details ready for next pass",
      ]}
    />
  );
}
