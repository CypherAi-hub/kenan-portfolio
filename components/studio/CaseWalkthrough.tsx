import Image from "next/image";

const stories = {
  "ultraflips-mobile": {
    title: "The details that make a buying decision useful.",
    intro:
      "A collector needs more than a number. The product keeps card identity, price provenance, and the proposed offer connected throughout the buying workflow.",
    note: "These are actual Simulator captures with labeled sample data, not live prices. Private mobile beta; camera, account sync, and provider coverage require separate real-device verification.",
    steps: [
      {
        image: "/media/showcase/ultra-identification.webp",
        title: "01 / Confirm the card",
        text: "Review the exact printing, language, condition, and grade before carrying that identity into research.",
        alt: "UltraFlips card identification screen with sample card details",
      },
      {
        image: "/media/showcase/ultra-market.webp",
        title: "02 / Read the evidence",
        text: "See the source, date, and limits beside a reference. Buying guides remain separate from verified sale prices.",
        alt: "UltraFlips dated market reference and buying guides, using sample data",
      },
      {
        image: "/media/showcase/ultra-completed-sales.webp",
        title: "03 / Inspect individual sales",
        text: "Explore a grade-specific sales chart and open the source behind an individual transaction before building an offer.",
        alt: "UltraFlips completed-sales chart with labeled sample transactions",
      },
    ],
  },
  "hirecrate-staffing": {
    title: "Two journeys, designed around the next step.",
    intro:
      "Employers and job seekers arrive with different questions. The site gives each a direct route, gathers the right details, and makes the email handoff explicit.",
    note: "Local website previews, November 2026. Inquiries become email drafts that the visitor sends. The separate operations dashboard stores records in the current browser and supports backup export; it is not a shared cloud recruiting system.",
    steps: [
      {
        image: "/media/showcase/hirecrate-home.png",
        title: "01 / Choose a path",
        text: "Employer and job-seeker calls to action are visible immediately, with service information to help visitors orient themselves.",
        alt: "HireCrate homepage with employer and job-seeker calls to action and warehouse photography",
      },
      {
        image: "/media/showcase/hirecrate-employer.png",
        title: "02 / Describe the need",
        text: "Employers provide the role, location, headcount, and contact details in a guided request form.",
        alt: "HireCrate employer request page",
      },
      {
        image: "/media/showcase/hirecrate-candidate.png",
        title: "03 / Start a conversation",
        text: "Job seekers share their experience and availability. Both paths prepare a reviewable email, with a readable copy fallback.",
        alt: "HireCrate candidate inquiry page",
      },
    ],
  },
};

export default function CaseWalkthrough({ slug }: { slug: string }) {
  const story = stories[slug as keyof typeof stories];
  if (!story) return null;
  return (
    <section
      className={`case-walkthrough ${slug === "hirecrate-staffing" ? "case-web" : ""}`}
      aria-labelledby="case-workflow-title"
    >
      <p className="eyebrow">THE PRODUCT IN PRACTICE</p>
      <h2 id="case-workflow-title">{story.title}</h2>
      <p>{story.intro}</p>
      <div className="case-steps">
        {story.steps.map((step) => (
          <figure key={step.title}>
            <a
              className="case-screen"
              href={step.image}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open full-size screen: ${step.alt}`}
            >
              <Image
                src={step.image}
                alt={step.alt}
                width={slug === "hirecrate-staffing" ? 1440 : 644}
                height={slug === "hirecrate-staffing" ? 1000 : 1400}
                sizes="(max-width: 750px) 80vw, 30vw"
              />
            </a>
            <figcaption>
              <strong>{step.title}</strong>
              {step.text}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="case-boundary">{story.note}</p>
    </section>
  );
}
