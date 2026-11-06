import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Wrench } from "lucide-react";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import EstimateBuilder from "@/components/studio/EstimateBuilder";
import { packages, money } from "@/data/pricing";
import { siteUrl } from "@/data/selected-work";
export const metadata: Metadata = {
  title: "Pricing & Project Estimates",
  description:
    "Website projects from $750, business websites from $1,800, and custom app budgets. Explore packages and build a project estimate with KJL Designs.",
  alternates: { canonical: `${siteUrl}/pricing` },
};
export default function PricingPage() {
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main id="main" className="studio-shell">
        <header className="archive-intro pricing-intro">
          <p className="eyebrow">PRICING & PROJECT PLANNING</p>
          <h1>
            A clear scope.
            <br />A considered investment.
          </h1>
          <p>
            Here’s a starting point for the investment. We’ll talk through your goals, agree on the
            scope, and put the price in writing before the build begins.
          </p>
          <div className="pricing-intro-actions">
            <a className="studio-button" href="#estimate">
              Build my estimate <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <Link className="text-link" href="/book">
              Book a free discovery call <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </header>
        <section aria-label="Project packages" className="package-grid">
          {packages.map((p) => (
            <article
              className={`package-card ${p.id === "business" ? "package-highlight" : ""}`}
              id={p.id}
              key={p.id}
            >
              <p className="eyebrow">{p.label}</p>
              <h2>{p.name}</h2>
              <p className="package-price">
                {money(p.range[0])}
                <span>– {money(p.range[1])}</span>
              </p>
              <p className="package-currency">USD · planning range</p>
              <p>{p.description}</p>
              <h3>Included in the starting scope</h3>
              <ul>
                {p.includes.map((item) => (
                  <li key={item}>
                    <Check size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className="text-link" href="/book">
                Talk about this project <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
        <p className="pricing-scope-note">
          Ranges assume a focused scope and timely feedback. Original branding, substantial
          copywriting, e-commerce catalogs, complex migrations, and public app-store release work
          are quoted separately. All projects receive an agreed scope and final quote before
          starting.
        </p>
        <section className="care-banner">
          <div className="care-heading">
            <Wrench size={26} aria-hidden="true" />
            <div>
              <p className="eyebrow">AFTER THE LAUNCH</p>
              <h2>Support after launch.</h2>
            </div>
          </div>
          <div>
            <p>
              Optional website support from <strong>$75/month</strong> for a small, agreed set of
              content updates and routine checks. Larger changes get their own quote.
            </p>
            <p className="care-small">
              Hosting, domain renewals, and third-party subscriptions are separate. Response times
              and monthly scope are agreed in advance.
            </p>
          </div>
          <Link className="text-link" href="/book">
            Discuss support <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
        <EstimateBuilder />
        <section className="faq-section pricing-faq section-space">
          <div>
            <p className="eyebrow">THE DETAILS</p>
            <h2>
              Clear from
              <br />
              <em>day one.</em>
            </h2>
          </div>
          <div className="faq-list">
            {[
              [
                "Is the estimate a final price?",
                "It’s a planning range. The final quote follows a discovery conversation and a defined scope. If your idea needs more than the starting package, we’ll price the extra work before it begins.",
              ],
              [
                "How do payments work?",
                "Your proposal sets out the payment milestones, any deposit, and what is due before launch or handoff. No payment is collected by this estimator.",
              ],
              [
                "What do I need to provide?",
                "Your goals, logo or existing brand assets, and the words and images you want to use. Content organization is available as an optional extra. You’ll also own the domain and service accounts for your project.",
              ],
              [
                "How long will it take?",
                "We’ll agree on a realistic schedule once the scope and my availability are clear. The amount of content, integrations, and feedback all affect timing. Booking a discovery call doesn’t reserve a build slot.",
              ],
              [
                "What happens if the scope changes?",
                "I’ll explain the cost and timing of the requested change before doing the additional work. You can decide whether to add it now or save it for a later phase.",
              ],
              [
                "What if my budget or project is different?",
                "Bring it to the discovery call. We can look at a smaller first phase, a focused refresh, or a custom scope that makes sense for the goal.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="pricing-final">
          <h2>
            Let’s find the right <em>starting point.</em>
          </h2>
          <Link className="studio-button" href="/book">
            Book with me <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </main>
      <StudioFooter />
    </div>
  );
}
