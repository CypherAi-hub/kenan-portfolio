"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import {
  answerText,
  cleanAnswers,
  sections,
  unsure,
  visibleQuestions,
  type Answers,
  type Question,
} from "@/lib/intake/questions";
import type { Followup } from "@/lib/intake/types";

const draftKey = "kjl-project-discovery-v1";
const lifespan = 30 * 86400000;
type Draft = { id: string; answers: Answers; step: number; savedAt: number };
const emptyAnswers: Answers = {};
async function send(body: unknown) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to send. Please try again.");
  return result;
}
function QuestionField({
  question: q,
  value,
  change,
}: {
  question: Question;
  value: string | string[] | undefined;
  change: (value: string | string[]) => void;
}) {
  const label = (
    <>
      {q.label}{" "}
      {q.required ? (
        <span className="intake-required">Required</span>
      ) : (
        <span className="intake-optional">Optional</span>
      )}
    </>
  );
  const hintId = q.id + "-hint";
  if (q.type === "choice" || q.type === "multi")
    return (
      <fieldset
        className="intake-question"
        id={q.id}
        tabIndex={-1}
        aria-describedby={q.hint ? hintId : undefined}
      >
        <legend>{label}</legend>
        {q.hint && (
          <p id={hintId} className="intake-hint">
            {q.hint}
          </p>
        )}
        <div className="intake-choices">
          {q.options?.map((option) => {
            const checked = Array.isArray(value) ? value.includes(option) : value === option;
            return (
              <label className={"intake-choice" + (checked ? " selected" : "")} key={option}>
                <input
                  type={q.type === "multi" ? "checkbox" : "radio"}
                  name={q.id}
                  value={option}
                  checked={checked}
                  onChange={() => {
                    if (q.type !== "multi") change(option);
                    else if (option === unsure) change(checked ? [] : [unsure]);
                    else {
                      const values = Array.isArray(value) ? value.filter((v) => v !== unsure) : [];
                      change(checked ? values.filter((v) => v !== option) : [...values, option]);
                    }
                  }}
                />
                <span>{option}</span>
                <span className="intake-choice-mark" aria-hidden="true">
                  {checked && <Check size={13} />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  const isText = q.type === "text" || q.type === "email";
  return (
    <div className="intake-question">
      <label htmlFor={q.id}>{label}</label>
      {q.hint && (
        <p id={hintId} className="intake-hint">
          {q.hint}
        </p>
      )}
      {isText ? (
        <input
          id={q.id}
          type={q.type}
          autoComplete={q.id === "name" ? "name" : q.id === "email" ? "email" : "off"}
          value={String(value || "")}
          maxLength={200}
          required={q.required}
          aria-describedby={q.hint ? hintId : undefined}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <textarea
          id={q.id}
          rows={3}
          value={String(value || "")}
          maxLength={2000}
          required={q.required}
          aria-describedby={q.hint ? hintId : undefined}
          onChange={(e) => change(e.target.value)}
        />
      )}
      {!isText && (
        <div className="intake-field-bottom">
          <button type="button" onClick={() => change(unsure)}>
            Not sure yet
          </button>
          <span>{String(value || "").length.toLocaleString()} / 2,000</span>
        </div>
      )}
    </div>
  );
}

export default function ProjectIntake() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers),
    [step, setStep] = useState(0);
  const [id, setId] = useState(""),
    [draft, setDraft] = useState<Draft | null>(null),
    [save, setSave] = useState(false),
    [storageNote, setStorageNote] = useState("");
  const [allowAI, setAllowAI] = useState(false),
    [consent, setConsent] = useState(false),
    [website, setWebsite] = useState("");
  const [questions, setQuestions] = useState<Followup[]>([]),
    [followupToken, setFollowupToken] = useState(""),
    [followupAnswers, setFollowupAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"" | "questions" | "submit">(""),
    [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ id: string; briefStatus: string } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const followupStep = sections.length,
    reviewStep = sections.length + 1;
  useEffect(() => {
    setId(crypto.randomUUID());
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const value = JSON.parse(raw);
        if (
          value.savedAt > Date.now() - lifespan &&
          value.savedAt <= Date.now() &&
          typeof value.id === "string" &&
          /^[a-f0-9-]{36}$/.test(value.id) &&
          Number.isInteger(value.step)
        )
          setDraft({
            ...value,
            answers: cleanAnswers(value.answers),
            step: Math.max(0, Math.min(value.step, sections.length - 1)),
          });
        else localStorage.removeItem(draftKey);
      }
    } catch {
      setStorageNote(
        "Draft storage isn’t available in this browser. Keep this page open while you finish.",
      );
    }
  }, []);
  useEffect(() => {
    if (!save || !id || receipt) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ id, answers, step, savedAt: Date.now() }));
      setStorageNote("Draft saved on this device for 30 days.");
    } catch {
      setStorageNote("Your draft could not be saved. Keep this page open while you finish.");
    }
  }, [answers, step, save, id, receipt]);
  function move(next: number) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => title.current?.focus());
  }
  function change(questionId: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setQuestions([]);
    setFollowupToken("");
    setFollowupAnswers({});
  }
  function clearDraft() {
    setSave(false);
    setDraft(null);
    try {
      localStorage.removeItem(draftKey);
      setStorageNote("Saved draft cleared from this device.");
    } catch {
      setStorageNote(
        "The saved draft could not be cleared. You can remove this site’s data in your browser settings.",
      );
    }
  }
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = sections[step]?.questions.filter(
      (q) =>
        (!q.when || q.when(answers)) &&
        q.required &&
        (!answers[q.id] ||
          (typeof answers[q.id] === "string"
            ? !String(answers[q.id]).trim()
            : !answers[q.id].length)),
    );
    if (missing?.length) {
      setError(`Please answer: ${missing[0].label}`);
      document.getElementById(missing[0].id)?.focus();
      return;
    }
    move(step + 1);
  }
  async function getQuestions() {
    setBusy("questions");
    setError("");
    try {
      const result = await send({ action: "clarify", answers, allowAI, website });
      setQuestions(result.questions);
      setFollowupToken(result.token);
      setFollowupAnswers({});
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "AI review is unavailable. You can continue without follow-up questions.",
      );
    } finally {
      setBusy("");
    }
  }
  async function submit() {
    setBusy("submit");
    setError("");
    try {
      const result = await send({
        action: "submit",
        id,
        answers,
        allowAI,
        consent,
        website,
        followupToken,
        followupAnswers,
      });
      setReceipt(result);
      clearDraft();
      requestAnimationFrame(() => title.current?.focus());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to send. Your answers are still here; please try again.",
      );
    } finally {
      setBusy("");
    }
  }
  const activeQuestions = visibleQuestions(answers);
  const answered = activeQuestions.filter((q) => answers[q.id]?.length).length;
  const labels = [...sections.map((s) => s.title), "A thoughtful follow-up", "Review & send"];
  if (receipt)
    return (
      <div className="intake-receipt">
        <CheckCircle2 size={44} aria-hidden="true" />
        <p className="eyebrow">PROJECT RECEIVED</p>
        <h1 ref={title} tabIndex={-1}>
          Your idea is <em>in good hands.</em>
        </h1>
        <p>
          Your project details are saved in Kenan’s private studio for review. He can follow up
          using the email you provided.
        </p>
        <div className="intake-receipt-note">
          <strong>Keep your inquiry reference</strong>
          <code>{receipt.id}</code>
          <p>
            {receipt.briefStatus === "ready"
              ? "A draft brief is ready for Kenan to review."
              : receipt.briefStatus === "not-requested"
                ? "Your original answers are ready for Kenan’s review."
                : "Your answers were saved. Kenan can complete the draft brief from the studio."}
          </p>
        </div>
        <p className="intake-hint">
          This is an inquiry, not a confirmed booking, price, or start date.
        </p>
        <div className="intake-actions">
          <Link className="studio-button" href="/book">
            Book an optional discovery call <ArrowRight size={17} />
          </Link>
          <Link className="text-link" href="/">
            Back to the portfolio
          </Link>
        </div>
      </div>
    );
  return (
    <div className="intake-layout">
      <aside className="intake-sidebar">
        <p className="eyebrow">YOUR PROJECT, UNDERSTOOD</p>
        <h1>
          A little detail.
          <br />
          <em>A better beginning.</em>
        </h1>
        <p>
          Tell me what you have in mind. I’ll turn the details into a clear starting point for our
          conversation.
        </p>
        <ol className="intake-steps" aria-label="Discovery progress">
          {labels.map((label, i) => (
            <li
              key={label}
              className={i === step ? "current" : i < step ? "done" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <button type="button" disabled={i > step || !!busy} onClick={() => move(i)}>
                <span>{i < step ? <Check size={13} /> : String(i + 1).padStart(2, "0")}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>
        <div className="intake-save">
          <LockKeyhole size={17} aria-hidden="true" />
          <div>
            <strong>Your pace. Your project.</strong>
            <p>Optional questions can wait. “Not sure yet” is a useful answer.</p>
            <label>
              <input
                type="checkbox"
                checked={save}
                disabled={!!busy || !!draft}
                onChange={(e) => {
                  if (e.target.checked) setSave(true);
                  else clearDraft();
                }}
              />{" "}
              Save my draft on this device
            </label>
            <p>
              Uses this browser’s storage, including your answers and contact details. Choose this
              only on a device you trust.
            </p>
            {storageNote && <p role="status">{storageNote}</p>}
            {save && (
              <button type="button" className="intake-text-button" onClick={clearDraft}>
                Clear saved draft
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="intake-main">
        {draft && (
          <div className="intake-draft" role="status">
            <strong>You have a saved project draft.</strong>
            <p>Resume it in this browser, or discard it and start fresh.</p>
            <div className="intake-actions">
              <button
                type="button"
                onClick={() => {
                  setAnswers(draft.answers);
                  setId(draft.id);
                  setStep(draft.step);
                  setSave(true);
                  setDraft(null);
                }}
              >
                Resume draft
              </button>
              <button type="button" onClick={clearDraft}>
                Discard saved draft
              </button>
            </div>
          </div>
        )}
        <div className="intake-progress">
          <span>
            STEP {String(step + 1).padStart(2, "0")} / {labels.length}
          </span>
          <span>{answered} details shared</span>
        </div>
        <div className="intake-progress-bar" aria-hidden="true">
          <span style={{ width: `${((step + 1) / labels.length) * 100}%` }} />
        </div>
        <h2 ref={title} tabIndex={-1}>
          {labels[step]}
        </h2>
        <p className="intake-description">
          {sections[step]?.description ||
            (step === followupStep
              ? "Want to go a little deeper? AI can spot missing details and suggest up to five relevant questions."
              : "Give your details a final look. You can edit any section before sending it to Kenan.")}
        </p>
        {error && (
          <div className="intake-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={step < followupStep ? next : (event) => event.preventDefault()}>
          <fieldset disabled={!!busy} className="intake-form-fields">
            <div className="intake-trap" aria-hidden="true">
              <label htmlFor="company-website">Leave this field empty</label>
              <input
                id="company-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            {step < followupStep && (
              <>
                {sections[step].questions
                  .filter((q) => !q.when || q.when(answers))
                  .map((q) => (
                    <QuestionField
                      key={q.id}
                      question={q}
                      value={answers[q.id]}
                      change={(value) => change(q.id, value)}
                    />
                  ))}
                {sections[step].questions.every((q) => q.when && !q.when(answers)) && (
                  <div className="intake-note">
                    No extra feature questions for your selections. We can work out the details
                    together.
                  </div>
                )}
              </>
            )}
            {step === followupStep && (
              <>
                <div className="intake-ai-note">
                  <Sparkles size={22} aria-hidden="true" />
                  <div>
                    <strong>A second look at your idea</strong>
                    <p>
                      With your permission, your project answers are sent to OpenAI to suggest
                      follow-ups and draft a brief. Contact fields are excluded from the AI request.
                      Please leave out passwords and confidential records.
                    </p>
                  </div>
                </div>
                <label className="intake-consent">
                  <input
                    type="checkbox"
                    checked={allowAI}
                    onChange={(e) => {
                      setAllowAI(e.target.checked);
                      setQuestions([]);
                      setFollowupToken("");
                      setFollowupAnswers({});
                    }}
                  />
                  <span>
                    Use AI to review my project details and prepare a draft brief for Kenan. I can
                    submit without AI.
                  </span>
                </label>
                {allowAI && (
                  <button
                    type="button"
                    className="studio-button intake-ai-button"
                    onClick={getQuestions}
                  >
                    {busy === "questions" ? (
                      <LoaderCircle className="intake-spin" size={17} />
                    ) : (
                      <Sparkles size={17} />
                    )}
                    {busy === "questions"
                      ? "Reading your project details…"
                      : followupToken
                        ? "Refresh follow-up questions"
                        : "Find useful follow-up questions"}
                  </button>
                )}
                {followupToken && questions.length === 0 && (
                  <p className="intake-note" role="status">
                    No additional questions came back from this review. You can still add anything
                    else in the delivery section.
                  </p>
                )}
                {questions.map((q) => (
                  <div key={q.id} className="intake-followup">
                    <QuestionField
                      question={{ id: q.id, label: q.question, hint: q.reason, type: "textarea" }}
                      value={followupAnswers[q.id]}
                      change={(value) =>
                        setFollowupAnswers((a) => ({ ...a, [q.id]: String(value) }))
                      }
                    />
                  </div>
                ))}
                <p className="intake-hint">
                  Follow-up answers are optional. Anything unresolved stays visible in the brief for
                  discussion.
                </p>
              </>
            )}
            {step === reviewStep && (
              <>
                {sections.map((section, i) => (
                  <details
                    className="intake-review"
                    key={section.id}
                    open={i === 0 || i === sections.length - 1}
                  >
                    <summary>{section.title}</summary>
                    <dl>
                      {section.questions
                        .filter((q) => !q.when || q.when(answers))
                        .map((q) => (
                          <div key={q.id}>
                            <dt>{q.label}</dt>
                            <dd>{answerText(answers[q.id])}</dd>
                          </div>
                        ))}
                    </dl>
                    <button type="button" className="intake-text-button" onClick={() => move(i)}>
                      Edit {section.title.toLowerCase()}
                    </button>
                  </details>
                ))}
                {questions.length > 0 && (
                  <details className="intake-review">
                    <summary>AI follow-up answers</summary>
                    <dl>
                      {questions.map((q) => (
                        <div key={q.id}>
                          <dt>{q.question}</dt>
                          <dd>{followupAnswers[q.id] || "Deferred for discussion"}</dd>
                        </div>
                      ))}
                    </dl>
                    <button
                      type="button"
                      className="intake-text-button"
                      onClick={() => move(followupStep)}
                    >
                      Edit follow-up answers
                    </button>
                  </details>
                )}
                <div className="intake-note">
                  <FileText size={20} aria-hidden="true" />
                  <p>
                    {allowAI
                      ? "AI review is enabled. Kenan will review the draft alongside your original answers."
                      : "AI review is off. Kenan will review your original answers directly."}{" "}
                    <button
                      type="button"
                      className="intake-text-button"
                      onClick={() => move(followupStep)}
                    >
                      Change
                    </button>
                  </p>
                </div>
                <label className="intake-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I agree that KJL Designs may save these details and contact me about my project.
                    I’ve read the{" "}
                    <Link href="/privacy" target="_blank">
                      privacy notice
                    </Link>
                    .
                  </span>
                </label>
                <p className="intake-hint">
                  Sending an inquiry doesn’t commit you to a price or book a project. Kenan will
                  review scope and availability with you.
                </p>
              </>
            )}
          </fieldset>
          <div className="intake-navigation">
            {step > 0 ? (
              <button
                type="button"
                className="intake-back"
                disabled={!!busy}
                onClick={() => move(step - 1)}
              >
                <ArrowLeft size={17} /> Back
              </button>
            ) : (
              <span />
            )}
            {step < followupStep ? (
              <button type="submit" className="studio-button" disabled={!!busy || !id}>
                Continue <ArrowRight size={17} />
              </button>
            ) : step === followupStep ? (
              <button
                type="button"
                className="studio-button"
                disabled={!!busy}
                onClick={() => move(reviewStep)}
              >
                Review my project <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="studio-button"
                disabled={!!busy || !consent || !id}
                onClick={submit}
              >
                {busy === "submit" ? (
                  <>
                    <LoaderCircle className="intake-spin" size={17} /> Saving your project…
                  </>
                ) : (
                  <>
                    Send project inquiry <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
          </div>
          {busy && (
            <p className="intake-hint" role="status">
              {busy === "submit"
                ? "Please keep this page open while your details are saved. Preparing the draft may take a moment."
                : "Looking for details that will help Kenan understand the project."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
