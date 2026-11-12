"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Copy, Check, Mail } from "lucide-react";
import { packages, extras, money, calculateEstimate, type PackageId } from "@/data/pricing";
import { profile } from "@/lib/data";
export default function EstimateBuilder() {
  const [packageId, setPackageId] = useState<PackageId>("business");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [extraPages, setExtraPages] = useState(0);
  const [idea, setIdea] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const estimate = calculateEstimate(packageId, extraIds, extraPages);
  const brief = [
    "Hi Kenan,",
    "",
    `I’m interested in: ${estimate.base.name}`,
    `Planning budget: ${money(estimate.min)}–${money(estimate.max)} USD`,
    `Optional features: ${estimate.options.map((e) => e.name).join(", ") || "None selected"}`,
    ...(estimate.pages ? [`Additional pages: ${estimate.pages}`] : []),
    "",
    "My project:",
    idea.trim() || "I’d like to talk through the details.",
    "",
    "I understand this is a planning estimate. Please confirm scope, availability, and a final quote.",
  ].join("\n");
  const toggle = (id: string) => {
    setExtraIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    setCopied(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  };
  return (
    <section id="estimate" className="estimate-section section-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BUILD YOUR ESTIMATE</p>
          <h2>
            Make the idea
            <br />
            <em>a little clearer.</em>
          </h2>
        </div>
        <p>
          Choose a project type and the extras you need. You’ll get a planning range and a project
          brief to send when you’re ready.
        </p>
      </div>
      <div className="estimate-grid">
        <div className="estimate-options">
          <fieldset>
            <legend>01 / What are we building?</legend>
            <div className="estimate-type-grid">
              {packages.map((p) => (
                <label
                  key={p.id}
                  className={packageId === p.id ? "estimate-type selected" : "estimate-type"}
                >
                  <input
                    type="radio"
                    name="project-type"
                    value={p.id}
                    checked={packageId === p.id}
                    onChange={() => {
                      setPackageId(p.id);
                      setExtraIds([]);
                      setExtraPages(0);
                      setCopied(false);
                    }}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <span>
                      {money(p.range[0])}–{money(p.range[1])}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              02 / Make it yours <span>Optional</span>
            </legend>
            <div className="estimate-extra-list">
              {extras
                .filter((e) => e.for.includes(packageId))
                .map((e) => (
                  <label key={e.id} className="estimate-extra">
                    <input
                      type="checkbox"
                      checked={extraIds.includes(e.id)}
                      onChange={() => toggle(e.id)}
                    />
                    <span>
                      <strong>{e.name}</strong>
                      <span>{e.description}</span>
                      <small>
                        + {money(e.range[0])}–{money(e.range[1])}
                      </small>
                    </span>
                  </label>
                ))}
            </div>
            {packageId === "business" && (
              <label className="estimate-pages">
                Pages beyond the included five
                <select
                  value={extraPages}
                  onChange={(e) => {
                    setExtraPages(Number(e.target.value));
                    setCopied(false);
                  }}
                  aria-label="Additional pages"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 0
                        ? "No additional pages"
                        : `${n} additional ${n === 1 ? "page" : "pages"} (+${money(n * 150)}–${money(n * 300)})`}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </fieldset>
          <label className="estimate-idea">
            <span>
              03 / Tell me a little about it <small>Optional</small>
            </span>
            <textarea
              value={idea}
              maxLength={1200}
              rows={4}
              onChange={(e) => {
                setIdea(e.target.value);
                setCopied(false);
              }}
              placeholder="What do you do, who is this for, and what would make the project a success?"
            />
            <span className="estimate-private-note">
              Your notes stay in this page until you choose to copy or email the brief.
            </span>
          </label>
        </div>
        <aside className="estimate-summary" aria-label="Your project estimate">
          <p className="eyebrow">YOUR PLANNING RANGE</p>
          <p className="estimate-total" aria-live="polite">
            {money(estimate.min)}
            <span>– {money(estimate.max)}</span>
          </p>
          <p className="estimate-currency">USD · one-time project budget</p>
          <dl>
            <div>
              <dt>{estimate.base.name}</dt>
              <dd>
                {money(estimate.base.range[0])}–{money(estimate.base.range[1])}
              </dd>
            </div>
            {estimate.options.map((e) => (
              <div key={e.id}>
                <dt>{e.name}</dt>
                <dd>
                  {money(e.range[0])}–{money(e.range[1])}
                </dd>
              </div>
            ))}
            {estimate.pages > 0 && (
              <div>
                <dt>{estimate.pages} additional pages</dt>
                <dd>
                  {money(estimate.pages * 150)}–{money(estimate.pages * 300)}
                </dd>
              </div>
            )}
          </dl>
          <p className="estimate-disclaimer">
            A starting estimate, with a final quote after discovery. Complex integrations or a
            larger scope may fall outside this range. Hosting, domains, subscriptions, and provider
            usage are separate.
          </p>
          <Link className="studio-button" href="/start-project">
            Start detailed project discovery <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <p className="estimate-mail-note">
            Share requirements, answer relevant follow-ups, and send your inquiry directly to Kenan.
            Your estimate remains a planning range.
          </p>
          <a
            className="studio-button"
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`KJL Designs — Project inquiry — ${estimate.base.name}`)}&body=${encodeURIComponent(brief)}`}
          >
            <Mail size={17} aria-hidden="true" />
            Email my project brief
          </a>
          <p className="estimate-mail-note">
            Opens your email app with the brief filled in. Review it and send when you’re ready.
          </p>
          <button className="estimate-copy" onClick={copy}>
            {copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copied ? "Brief copied" : "Copy project brief"}
          </button>
          <span className="sr-only" role="status">
            {copied
              ? "Project brief copied to clipboard."
              : copyFailed
                ? "Automatic copy is unavailable. Select and copy the brief below."
                : ""}
          </span>
          {copyFailed && (
            <label className="manual-brief">
              Select and copy your brief
              <textarea readOnly value={brief} rows={8} onFocus={(e) => e.target.select()} />
            </label>
          )}
          <div className="estimate-book">
            <span>Prefer to talk it through?</span>
            <Link className="text-link" href="/book">
              Book a free discovery call <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
