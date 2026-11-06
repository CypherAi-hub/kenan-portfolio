import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { packages, money } from "@/data/pricing";
export default function PricingOverview() {
  return (
    <section className="pricing-overview section-space" id="pricing">
      <div className="studio-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A CLEAR STARTING POINT</p>
            <h2>
              Clear scope.
              <br />
              Confident decisions.
            </h2>
          </div>
          <p>
            Choose a starting point that fits your idea. We’ll define the details together and agree
            on a fixed project quote before work begins.
          </p>
        </div>
        <div className="pricing-teaser-grid">
          {packages.slice(0, 3).map((p) => (
            <article
              key={p.id}
              className={`price-teaser ${p.id === "business" ? "price-teaser-featured" : ""}`}
            >
              <p className="eyebrow">{p.label}</p>
              <h3>{p.name}</h3>
              <p className="price-from">
                FROM <strong>{money(p.range[0])}</strong>
                <span>USD / project</span>
              </p>
              <p className="price-description">{p.description}</p>
              <ul>
                {p.includes.slice(0, 3).map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className="text-link" href={`/pricing#${p.id}`}>
                See what’s included <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className="work-end">
          <span>Mobile prototypes, optional support, and custom scopes available.</span>
          <Link className="text-link" href="/pricing#estimate">
            Build a project estimate <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
