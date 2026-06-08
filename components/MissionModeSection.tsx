"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Download,
  Github,
  Layers3,
  LockKeyhole,
  Mail,
  MonitorDot,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { profile } from "@/lib/data";
import { cn } from "@/lib/utils";

type MissionId = "identity" | "product" | "cyber" | "cloud" | "agents" | "summary";

type Mission = {
  id: MissionId;
  eyebrow: string;
  title: string;
  objective: string;
  proof: string;
};

const missions: Mission[] = [
  {
    id: "identity",
    eyebrow: "Mission 01",
    title: "Identify the Builder",
    objective:
      "Confirm the candidate signal: Cybersecurity & AI student building applied AI products.",
    proof: "Product range, technical storytelling, and internship-ready positioning.",
  },
  {
    id: "product",
    eyebrow: "Mission 02",
    title: "Product Builder",
    objective: "Map the FoFit ecosystem across mobile, coach, marketing, and content tooling.",
    proof: "AI product ecosystem with multiple product surfaces.",
  },
  {
    id: "cyber",
    eyebrow: "Mission 03",
    title: "Cybersecurity Analyst",
    objective: "Review safe, simulated security scenarios and match remediation categories.",
    proof: "Cybersecurity reporting, defensive thinking, and stakeholder-ready remediation.",
  },
  {
    id: "cloud",
    eyebrow: "Mission 04",
    title: "Cloud / AI Engineer",
    objective: "Trace a cloud ML pipeline from upload to AWS Rekognition output labels.",
    proof: "Cloud automation and explainable AI workflow design.",
  },
  {
    id: "agents",
    eyebrow: "Mission 05",
    title: "Agent Tools / Workflow",
    objective: "Unlock the developer workflow used to plan, build, validate, prove, and deploy.",
    proof: "Agent workflow tooling, validation habits, and proof capture.",
  },
  {
    id: "summary",
    eyebrow: "Mission 06",
    title: "Final Proof Report",
    objective: "Summarize the proof signals recruiters should remember.",
    proof: "Applied AI, cybersecurity, cloud, mobile, dashboards, and consistent shipping.",
  },
];

const missionProjectSlugs = [
  "fofit",
  "fofit-coach",
  "cyberlou-pentest-report",
  "soc-monitor",
  "netwatch",
  "aws-image-label-generator",
  "agentroom",
];

const productSurfacePrompts = [
  {
    label: "Mobile app",
    projectSlug: "fofit",
    unlock: "Athlete-facing React Native product with Cypher, workout flow, and nutrition media.",
  },
  {
    label: "Coach dashboard",
    projectSlug: "fofit-coach",
    unlock: "Team-facing platform direction for coaches, roster workflows, and athlete delivery.",
  },
  {
    label: "Marketing site",
    projectSlug: "fofit-website",
    unlock: "Public product surface for waitlist, positioning, and ecosystem communication.",
  },
  {
    label: "Content lab",
    projectSlug: "fofit-content-lab",
    unlock: "Media and workout-content tooling lane, kept conservative while the pipeline matures.",
  },
];

const cyberScenarios = [
  {
    title: "Shared lab password pattern",
    detail: "A controlled-lab account pattern would make account takeover harder to contain.",
    remediation: "Credential policy",
  },
  {
    title: "Flat simulated network path",
    detail: "A lab service has broader reach than needed across internal segments.",
    remediation: "Network segmentation",
  },
  {
    title: "Thin alert trail",
    detail: "A dashboard action needs clearer audit visibility for analyst review.",
    remediation: "Logging/SIEM",
  },
  {
    title: "Overbroad user role",
    detail: "A simulated user can reach more admin controls than their role requires.",
    remediation: "Access control",
  },
];

const remediationOptions = [
  "Credential policy",
  "Network segmentation",
  "Logging/SIEM",
  "Access control",
];

const pipelineStages = [
  {
    title: "Image upload",
    detail: "Input is treated as a scoped demo artifact, not private production data.",
    proof: "Clear ingestion boundary",
  },
  {
    title: "S3",
    detail: "The object-store step shows cloud service boundaries and durable input handling.",
    proof: "AWS fundamentals",
  },
  {
    title: "Rekognition",
    detail: "AWS Rekognition returns label candidates and confidence values.",
    proof: "Applied cloud ML",
  },
  {
    title: "Python processing",
    detail: "Python tooling translates raw service output into recruiter-readable evidence.",
    proof: "Automation scripting",
  },
  {
    title: "Output labels",
    detail: "The result is a visual proof artifact with labels and bounding-box context.",
    proof: "Explainable output",
  },
];

const agentCheckpoints = ["Plan", "Build", "Validate", "Screenshot", "Deploy"];

const finalProofSignals = [
  "AI product engineering",
  "Cybersecurity reporting",
  "Cloud automation",
  "Mobile app execution",
  "Dashboard/product UX",
  "Consistent shipping across multiple repos",
];

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

function MissionLauncherButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-bg hover:bg-accent-dim inline-flex items-center justify-center gap-2 rounded border border-white bg-white font-mono text-sm transition duration-200 focus-visible:outline-white",
        compact ? "h-10 px-3" : "h-11 px-4",
      )}
    >
      <Play size={16} aria-hidden />
      Launch Proof Mode
    </button>
  );
}

function MissionProgressBar({ activeIndex }: { activeIndex: number }) {
  const progress = ((activeIndex + 1) / missions.length) * 100;

  return (
    <div className="space-y-3" aria-label={`Mission ${activeIndex + 1} of ${missions.length}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-fg-muted font-mono text-[11px] uppercase">
          {missions[activeIndex].eyebrow}
        </p>
        <p className="text-fg-muted font-mono text-[11px] uppercase">
          {String(activeIndex + 1).padStart(2, "0")} / {String(missions.length).padStart(2, "0")}
        </p>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-white"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function InteractiveTerminal({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded border border-white/14 bg-black/55 p-4 font-mono text-xs leading-6"
      aria-label={lines.join(" ")}
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        <span className="size-2 rounded-full bg-white/30" />
        <span className="size-2 rounded-full bg-white/18" />
        <span className="size-2 rounded-full bg-emerald-300/60" />
      </div>
      <div className="space-y-1">
        {lines.map((line, index) => (
          <p key={line} className="text-fg-secondary">
            <span className="text-emerald-300/80">{">"}</span>{" "}
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.09, duration: 0.26 }}
            >
              {line}
            </motion.span>
            {index === lines.length - 1 && (
              <span className="animate-blink ml-1 inline-block h-3 w-1 bg-white/70" aria-hidden />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

function ProjectUnlockCard({
  project,
  label,
  className,
}: {
  project?: Project;
  label?: string;
  className?: string;
}) {
  if (!project) {
    return (
      <div className={cn("rounded border border-white/12 bg-white/[0.035] p-4", className)}>
        <p className="text-fg-muted font-mono text-[11px] uppercase">Media coming soon</p>
        <p className="text-fg-secondary mt-2 text-sm leading-6">
          This project stays in the proof system without a fake screenshot.
        </p>
      </div>
    );
  }

  const media = project.media[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "group overflow-hidden rounded border border-white/14 bg-white/[0.035] transition-colors hover:border-white/32",
        className,
      )}
    >
      <div className="aspect-[16/10] border-b border-white/10 bg-black/45">
        {media ? (
          <Image
            src={media.src}
            alt={media.alt}
            width={720}
            height={460}
            sizes="(min-width: 1024px) 360px, 90vw"
            className="h-full w-full object-cover object-top grayscale transition duration-500 group-hover:scale-[1.025] group-hover:grayscale-0"
          />
        ) : (
          <div className="text-fg-muted flex h-full items-center justify-center font-mono text-xs uppercase">
            Media coming soon
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-fg-muted font-mono text-[10px] uppercase">
              {label ?? project.proof ?? project.category}
            </p>
            <h4 className="mt-1 font-semibold">{project.title}</h4>
          </div>
          <span className="rounded border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] text-emerald-200 uppercase">
            Unlocked
          </span>
        </div>
        <p className="text-fg-secondary mt-3 line-clamp-2 text-sm leading-6">
          {project.description}
        </p>
      </div>
    </motion.article>
  );
}

function MissionCard({ mission, children }: { mission: Mission; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs text-emerald-200 uppercase">{mission.eyebrow}</p>
      <h3 className="mt-2 text-3xl leading-tight font-semibold md:text-4xl">{mission.title}</h3>
      <p className="text-fg-secondary mt-3 max-w-2xl text-sm leading-6 md:text-base">
        {mission.objective}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function IdentityMission({ onContinue }: { onContinue: () => void }) {
  const highlighted = missionProjectSlugs.map(getProject).filter(Boolean) as Project[];

  return (
    <MissionCard mission={missions[0]}>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <InteractiveTerminal
          lines={[
            "system online",
            "candidate profile detected: Kenan Larry",
            "track: Cybersecurity & AI student building applied AI products",
            "proof map ready",
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {highlighted.slice(0, 4).map((project) => (
            <ProjectUnlockCard key={project.slug} project={project} label={project.proof} />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-11 items-center gap-2 rounded border border-white/35 bg-white/10 px-4 font-mono text-sm transition-colors hover:border-white hover:bg-white/15"
        >
          Unlock Project Map
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </MissionCard>
  );
}

function ProductBuilderMission() {
  const [activeSurface, setActiveSurface] = useState(productSurfacePrompts[0]);
  const activeProject = getProject(activeSurface.projectSlug);
  const foFit = getProject("fofit");
  const coach = getProject("fofit-coach");

  return (
    <MissionCard mission={missions[1]}>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3" role="list" aria-label="FoFit product surfaces">
          {productSurfacePrompts.map((surface) => (
            <button
              key={surface.label}
              type="button"
              onClick={() => setActiveSurface(surface)}
              className={cn(
                "w-full rounded border p-4 text-left transition-colors",
                activeSurface.label === surface.label
                  ? "border-emerald-300/45 bg-emerald-300/10"
                  : "border-white/12 bg-white/[0.035] hover:border-white/28",
              )}
            >
              <span className="text-fg font-mono text-sm">{surface.label}</span>
              <span className="text-fg-secondary mt-2 block text-sm leading-6">
                {surface.unlock}
              </span>
            </button>
          ))}
        </div>
        <div>
          <ProjectUnlockCard project={activeProject} label="Selected product surface" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ProjectUnlockCard project={foFit} label="Mobile proof" />
            <ProjectUnlockCard project={coach} label="Coach proof" />
          </div>
          <p className="mt-4 rounded border border-emerald-300/25 bg-emerald-300/10 p-4 font-mono text-xs text-emerald-100">
            Proof unlocked: AI product ecosystem.
          </p>
        </div>
      </div>
    </MissionCard>
  );
}

function SafeCyberScenario() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const solvedCount = cyberScenarios.filter(
    (scenario) => answers[scenario.title] === scenario.remediation,
  ).length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {cyberScenarios.map((scenario) => {
          const answer = answers[scenario.title];
          const solved = answer === scenario.remediation;

          return (
            <article
              key={scenario.title}
              className={cn(
                "rounded border p-4 transition-colors",
                solved
                  ? "border-emerald-300/35 bg-emerald-300/10"
                  : "border-white/12 bg-white/[0.035]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{scenario.title}</p>
                  <p className="text-fg-secondary mt-2 text-sm leading-6">{scenario.detail}</p>
                </div>
                {solved && <CheckCircle2 className="text-emerald-200" size={18} aria-hidden />}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {remediationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [scenario.title]: option,
                      }))
                    }
                    className={cn(
                      "rounded border px-3 py-2 font-mono text-[11px] transition-colors",
                      answer === option
                        ? "border-white/55 bg-white/12 text-white"
                        : "text-fg-secondary border-white/12 hover:border-white/35 hover:text-white",
                    )}
                    aria-pressed={answer === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-fg-secondary rounded border border-white/12 bg-black/35 p-4 font-mono text-xs leading-6">
        Safe scenario only: {solvedCount} / {cyberScenarios.length} remediation matches complete. No
        exploit steps, credentials, IPs, hashes, or private assessment details are shown.
      </p>
    </div>
  );
}

function CyberMission() {
  return (
    <MissionCard mission={missions[2]}>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <SafeCyberScenario />
        <div className="grid gap-3">
          <ProjectUnlockCard project={getProject("cyberlou-pentest-report")} label="Report proof" />
          <ProjectUnlockCard project={getProject("soc-monitor")} label="Defensive UX" />
          <ProjectUnlockCard project={getProject("netwatch")} label="Monitoring architecture" />
        </div>
      </div>
    </MissionCard>
  );
}

function MiniPipelineInteraction() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = pipelineStages[activeStage];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div>
        <div className="grid gap-2 md:grid-cols-5" aria-label="AWS image label pipeline">
          {pipelineStages.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveStage(index)}
              className={cn(
                "relative min-h-24 rounded border p-3 text-left transition-colors",
                activeStage === index
                  ? "border-emerald-300/45 bg-emerald-300/10"
                  : "border-white/12 bg-white/[0.035] hover:border-white/28",
              )}
            >
              <span className="text-fg-muted font-mono text-[10px] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm font-semibold">{item.title}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded border border-white/12 bg-black/35 p-5">
          <p className="text-fg-muted font-mono text-[11px] uppercase">{stage.proof}</p>
          <h4 className="mt-2 text-xl font-semibold">{stage.title}</h4>
          <p className="text-fg-secondary mt-3 text-sm leading-6">{stage.detail}</p>
        </div>
      </div>
      <ProjectUnlockCard
        project={getProject("aws-image-label-generator")}
        label="Cloud pipeline proof"
      />
    </div>
  );
}

function CloudMission() {
  return (
    <MissionCard mission={missions[3]}>
      <MiniPipelineInteraction />
    </MissionCard>
  );
}

function AgentWorkflowMission() {
  const [unlocked, setUnlocked] = useState<string[]>(["Plan"]);
  const agentProjects = ["agentroom", "omni", "stack-mode", "cypher-os-archive", "ruflo-os"]
    .map(getProject)
    .filter(Boolean) as Project[];

  function toggleCheckpoint(checkpoint: string) {
    setUnlocked((current) =>
      current.includes(checkpoint)
        ? current.filter((item) => item !== checkpoint)
        : [...current, checkpoint],
    );
  }

  return (
    <MissionCard mission={missions[4]}>
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-3">
          {agentCheckpoints.map((checkpoint, index) => {
            const isUnlocked = unlocked.includes(checkpoint);
            return (
              <button
                key={checkpoint}
                type="button"
                onClick={() => toggleCheckpoint(checkpoint)}
                className={cn(
                  "flex w-full items-center justify-between rounded border p-4 text-left transition-colors",
                  isUnlocked
                    ? "border-emerald-300/35 bg-emerald-300/10"
                    : "border-white/12 bg-white/[0.035] hover:border-white/28",
                )}
                aria-pressed={isUnlocked}
              >
                <span>
                  <span className="text-fg-muted block font-mono text-[10px] uppercase">
                    Checkpoint {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-semibold">{checkpoint}</span>
                </span>
                {isUnlocked ? (
                  <CheckCircle2 className="text-emerald-200" size={18} aria-hidden />
                ) : (
                  <LockKeyhole className="text-fg-muted" size={17} aria-hidden />
                )}
              </button>
            );
          })}
          <p className="text-fg-secondary rounded border border-white/12 bg-black/35 p-4 font-mono text-xs leading-6">
            {unlocked.length} / {agentCheckpoints.length} workflow checkpoints unlocked.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {agentProjects.map((project) => (
            <ProjectUnlockCard key={project.slug} project={project} label={project.proof} />
          ))}
        </div>
      </div>
    </MissionCard>
  );
}

function ProofReportSummary() {
  const highlightedProjects = missionProjectSlugs.map(getProject).filter(Boolean) as Project[];

  return (
    <MissionCard mission={missions[5]}>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded border border-white/14 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded border border-emerald-300/25 bg-emerald-300/10">
              <ShieldCheck className="text-emerald-200" size={20} aria-hidden />
            </div>
            <div>
              <p className="text-fg-muted font-mono text-[11px] uppercase">Proof Report</p>
              <h4 className="text-xl font-semibold">Recruiter signal unlocked</h4>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {finalProofSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded border border-white/10 bg-black/30 px-3 py-3"
              >
                <CheckCircle2 className="text-emerald-200" size={16} aria-hidden />
                <span className="text-fg-secondary text-sm">{signal}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                className="hover:bg-accent-dim inline-flex h-10 items-center gap-2 rounded border border-white bg-white px-3 font-mono text-xs text-black transition-colors"
              >
                <Download size={15} aria-hidden />
                Download Resume
              </a>
            )}
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/18 px-3 font-mono text-xs transition-colors hover:border-white/45 hover:text-white"
            >
              <Github size={15} aria-hidden />
              View GitHub
            </a>
            <Link
              href="#case-studies"
              className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/18 px-3 font-mono text-xs transition-colors hover:border-white/45 hover:text-white"
            >
              <Layers3 size={15} aria-hidden />
              View Case Studies
            </Link>
            <a
              href={`mailto:${profile.email}`}
              className="text-fg-secondary inline-flex h-10 items-center gap-2 rounded border border-white/18 px-3 font-mono text-xs transition-colors hover:border-white/45 hover:text-white"
            >
              <Mail size={15} aria-hidden />
              Contact Me
            </a>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {highlightedProjects.slice(0, 6).map((project) => (
            <ProjectUnlockCard key={project.slug} project={project} label={project.proof} />
          ))}
        </div>
      </div>
    </MissionCard>
  );
}

function MissionBody({ missionId, onContinue }: { missionId: MissionId; onContinue: () => void }) {
  switch (missionId) {
    case "identity":
      return <IdentityMission onContinue={onContinue} />;
    case "product":
      return <ProductBuilderMission />;
    case "cyber":
      return <CyberMission />;
    case "cloud":
      return <CloudMission />;
    case "agents":
      return <AgentWorkflowMission />;
    case "summary":
      return <ProofReportSummary />;
    default:
      return null;
  }
}

function MissionOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeMission = missions[activeIndex];
  const canGoBack = activeIndex > 0;
  const canGoForward = activeIndex < missions.length - 1;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && canGoForward) setActiveIndex((index) => index + 1);
      if (event.key === "ArrowLeft" && canGoBack) setActiveIndex((index) => index - 1);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [canGoBack, canGoForward, onClose, open]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/86 px-3 py-4 backdrop-blur-xl md:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="proof-mode-title"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1240px] overflow-hidden rounded border border-white/16 bg-[#050505] shadow-2xl shadow-black"
          >
            <header className="sticky top-0 z-10 border-b border-white/12 bg-black/78 px-4 py-4 backdrop-blur md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-emerald-200 uppercase">
                    Kenan OS · Proof Mode
                  </p>
                  <h2 id="proof-mode-title" className="mt-1 text-xl font-semibold md:text-2xl">
                    Build Mission
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => canGoBack && setActiveIndex((index) => index - 1)}
                    disabled={!canGoBack}
                    className="text-fg-secondary flex size-9 items-center justify-center rounded border border-white/14 transition-colors hover:border-white/38 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 md:size-10"
                    aria-label="Previous mission"
                  >
                    <ChevronLeft size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => canGoForward && setActiveIndex((index) => index + 1)}
                    disabled={!canGoForward}
                    className="text-fg-secondary flex size-9 items-center justify-center rounded border border-white/14 transition-colors hover:border-white/38 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 md:size-10"
                    aria-label="Next mission"
                  >
                    <ChevronRight size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-fg-secondary flex size-9 items-center justify-center rounded border border-white/14 transition-colors hover:border-white/38 hover:text-white md:size-10"
                    aria-label="Close proof mode"
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <MissionProgressBar activeIndex={activeIndex} />
              </div>
            </header>

            <div className="bg-grid relative p-4 md:p-6 lg:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-emerald-200/30" />
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <nav
                  className="scrollbar-hide flex snap-x gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"
                  aria-label="Proof mode missions"
                >
                  {missions.map((mission, index) => (
                    <button
                      key={mission.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "min-w-[210px] snap-start rounded border p-3 text-left transition-colors lg:w-full lg:min-w-0",
                        activeIndex === index
                          ? "border-emerald-300/40 bg-emerald-300/10 text-white"
                          : "text-fg-secondary border-white/10 bg-black/35 hover:border-white/26 hover:text-white",
                      )}
                      aria-current={activeIndex === index ? "step" : undefined}
                    >
                      <span className="text-fg-muted font-mono text-[10px] uppercase">
                        {mission.eyebrow}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">{mission.title}</span>
                    </button>
                  ))}
                </nav>

                <section className="min-h-[620px] rounded border border-white/12 bg-black/48 p-4 md:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMission.id}
                      initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <MissionBody
                        missionId={activeMission.id}
                        onContinue={() =>
                          setActiveIndex((index) => Math.min(index + 1, missions.length - 1))
                        }
                      />
                    </motion.div>
                  </AnimatePresence>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MissionModeSection() {
  const [open, setOpen] = useState(false);
  const featuredPreview = useMemo(
    () => missionProjectSlugs.map(getProject).filter(Boolean).slice(0, 5) as Project[],
    [],
  );

  return (
    <section id="proof-mode" className="section-shell py-16 md:py-20">
      <div className="glass-panel relative overflow-hidden rounded p-5 md:p-8">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="pointer-events-none absolute right-8 bottom-0 h-32 w-64 bg-emerald-200/10 blur-[90px]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 font-mono text-xs text-emerald-100">
              <Sparkles size={14} aria-hidden />
              INTERACTIVE PROOF
            </div>
            <h2 className="mt-4 text-3xl leading-tight font-semibold md:text-5xl">
              Play the build path.
            </h2>
            <p className="text-fg-secondary mt-4 max-w-2xl text-base leading-7">
              A short mission-mode walkthrough of the products, cyber work, cloud projects, and AI
              tools I’ve built. It is optional, recruiter-safe, and designed like a command center
              instead of a toy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <MissionLauncherButton onClick={() => setOpen(true)} />
              <Link
                href="#featured"
                className="border-border text-fg-secondary inline-flex h-11 items-center gap-2 rounded border px-4 font-mono text-sm transition-colors hover:border-white/45 hover:text-white"
              >
                Skip to Projects
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                ["AI Products", Code2],
                ["Cybersecurity", ShieldCheck],
                ["Cloud Pipeline", Cloud],
                ["Mission Control", MonitorDot],
              ].map(([label, Icon]) => {
                const IconComponent = Icon as typeof Code2;
                return (
                  <div
                    key={label as string}
                    className="flex items-center gap-3 rounded border border-white/10 bg-black/28 px-3 py-3"
                  >
                    <IconComponent className="text-emerald-200" size={16} aria-hidden />
                    <span className="text-fg-secondary font-mono text-xs uppercase">
                      {label as string}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute inset-0 rounded border border-white/12 bg-black/55" />
            <div className="absolute inset-x-5 top-5 flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-fg-muted font-mono text-[10px] uppercase">
                Kenan OS / Mission Control
              </p>
              <span className="rounded border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] text-emerald-100 uppercase">
                System online
              </span>
            </div>
            <div className="absolute inset-x-5 top-20 grid gap-3">
              {missions.slice(0, 5).map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.06, duration: 0.34 }}
                  className="flex items-center justify-between gap-3 rounded border border-white/10 bg-white/[0.035] px-3 py-3"
                >
                  <div>
                    <p className="text-fg-muted font-mono text-[10px] uppercase">
                      {mission.eyebrow}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{mission.title}</p>
                  </div>
                  <CheckCircle2 className="text-emerald-200" size={16} aria-hidden />
                </motion.div>
              ))}
            </div>
            <div className="absolute inset-x-5 bottom-5 grid grid-cols-5 gap-2">
              {featuredPreview.map((project) => {
                const media = project.media[0];
                return (
                  <div
                    key={project.slug}
                    className="aspect-square overflow-hidden rounded border border-white/12 bg-white/[0.035]"
                    title={project.title}
                  >
                    {media ? (
                      <Image
                        src={media.src}
                        alt={media.alt}
                        width={160}
                        height={160}
                        sizes="96px"
                        className="h-full w-full object-cover object-top grayscale"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Layers3 size={16} className="text-fg-muted" aria-hidden />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <MissionOverlay open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
