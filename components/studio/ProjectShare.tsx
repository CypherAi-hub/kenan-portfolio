"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
export default function ProjectShare({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("manual");
    }
  }
  return (
    <div className="project-share">
      <button type="button" onClick={copy} className="text-link">
        {state === "copied" ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Copy size={16} aria-hidden="true" />
        )}
        {state === "copied" ? "Project link copied" : "Copy project link"}
      </button>
      <span className="sr-only" role="status">
        {state === "copied" ? "Project link copied to clipboard." : ""}
      </span>
      {state === "manual" && (
        <label className="share-fallback">
          Copy this project URL
          <input aria-label="Project URL" readOnly value={url} onFocus={(e) => e.target.select()} />
        </label>
      )}
    </div>
  );
}
