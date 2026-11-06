import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Globe2, PanelsTopLeft, Sparkles } from "lucide-react";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import PricingOverview from "@/components/studio/PricingOverview";
import BookingSection from "@/components/studio/BookingSection";
import ProjectVisual from "@/components/studio/ProjectVisual";
import { projectLibrary } from "@/data/project-library";
import { selectedWork } from "@/data/selected-work";
export const metadata = { alternates: { canonical: "https://kjl-designs.vercel.app" } };

export default function Home() {
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main id="main">
        <section className="studio-intro" id="top">
          <div className="studio-shell intro-grid">
            <div className="intro-copy">
              <p className="eyebrow">
                <span /> ST. LOUIS DESIGN & DEVELOPMENT
              </p>
              <h1>
                Designed to
                <br />
                impress.
                <br />
                <span>Built to work.</span>
              </h1>
              <p className="intro-description">
                Custom websites, apps, and digital tools for businesses ready for their next
                chapter. Thoughtfully designed. Personally built by Kenan Larry.
              </p>
              <div className="intro-actions">
                <Link className="studio-button" href="/book">
                  Let’s talk about your project <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link className="intro-pricing" href="/pricing">
                  Explore pricing <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <p className="intro-footnote">Your idea. A clear plan. One dedicated builder.</p>
            </div>
            <Link
              href="/work/general-services"
              className="intro-project"
              aria-label="Explore the Maryville University General Services project"
            >
              <div className="intro-project-top">
                <span>PROJECT SPOTLIGHT</span>
                <span className="live-label">
                  <i /> LIVE WEBSITE
                </span>
              </div>
              <div className="intro-browser">
                <div className="intro-browser-bar">
                  <span aria-hidden="true">● ● ●</span>
                  <span>Maryville University</span>
                  <ArrowUpRight size={12} aria-hidden="true" />
                </div>
                <Image
                  src="/media/current/maryville-request-desk.jpg"
                  alt="Maryville University General Services website, with a campus photograph and six service request forms"
                  width={1440}
                  height={1000}
                  priority
                  sizes="(min-width: 1000px) 560px, 90vw"
                />
              </div>
              <div className="intro-project-bottom">
                <div>
                  <p>MARYVILLE UNIVERSITY</p>
                  <h2>
                    Everyday services.
                    <br />
                    One clear destination.
                  </h2>
                </div>
                <span className="intro-project-arrow">
                  <ArrowUpRight size={23} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
          <div className="intro-capabilities studio-shell">
            <span>FROM FIRST IMPRESSION TO EVERYDAY USE</span>
            <div>
              <span>Business websites</span>
              <span>Web applications</span>
              <span>Mobile experiences</span>
            </div>
          </div>
        </section>
        <div className="studio-principles studio-shell">
          <p>
            <span>01</span>
            <strong>Design with purpose</strong>
            <span>Clear, thoughtful, built around your audience.</span>
          </p>
          <p>
            <span>02</span>
            <strong>A straightforward process</strong>
            <span>Defined scope, honest pricing, regular updates.</span>
          </p>
          <p>
            <span>03</span>
            <strong>Direct collaboration</strong>
            <span>Work with the person designing and building it.</span>
          </p>
        </div>
        <section className="work-section studio-shell section-space" id="work">
          <span id="featured" className="legacy-anchor" aria-hidden="true" />
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / SELECTED WORK</p>
              <h2>
                Real projects.
                <br />
                Thoughtful solutions.
              </h2>
            </div>
            <p>
              Websites, products, and tools built around real needs. Explore the work, the thinking
              behind it, and where each project stands.
            </p>
          </div>
          <div className="selected-grid">
            {selectedWork.map((p, i) => (
              <article className={`work-card ${i === 0 ? "work-wide" : ""}`} key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="project-image-link"
                  aria-label={`Explore ${p.name}`}
                >
                  <ProjectVisual project={p} />
                  <span className="project-open">
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </Link>
                <div className="project-info">
                  <div>
                    {i === 0 && (
                      <p className="featured-label">FEATURED PROJECT / MARYVILLE UNIVERSITY</p>
                    )}
                    <p className="project-category">
                      {p.category} <span> / {p.status}</span>
                    </p>
                    <h3>
                      <Link href={`/work/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p>{p.summary}</p>
                    <div className="project-focus">
                      {p.stack.slice(0, 2).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <Link className="text-link project-story-link" href={`/work/${p.slug}`}>
                      Explore the project <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                  <span className="project-number">/{p.number}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="work-end">
            <span>There’s more behind the work.</span>
            <Link className="text-link" href="/projects">
              Explore all {projectLibrary.length} projects{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section className="services-section section-space" id="services">
          <div className="studio-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">02 / HOW I CAN HELP</p>
                <h2>
                  The right experience
                  <br />
                  for your next chapter.
                </h2>
              </div>
              <p>
                Whether you’re starting fresh or improving what you have, we’ll focus on what your
                business actually needs.
              </p>
            </div>
            <div className="service-grid">
              {[
                {
                  icon: Globe2,
                  n: "01",
                  title: "Websites that feel like you.",
                  text: "A clear, memorable home for your business. Built to look good, explain what you do, and make the next step easy.",
                  tags: "Business websites · Portfolios · Landing pages",
                },
                {
                  icon: PanelsTopLeft,
                  n: "02",
                  title: "Tools that make work easier.",
                  text: "Turn repetitive tasks into a simple workflow. Give your team or customers an easier way to get things done.",
                  tags: "Request portals · Forms · Dashboards",
                },
                {
                  icon: Sparkles,
                  n: "03",
                  title: "An idea worth building.",
                  text: "Move from a rough concept to an app you can explore and improve, with thoughtful interfaces and practical AI where it helps.",
                  tags: "App prototypes · Mobile UX · AI features",
                },
              ].map((s) => (
                <article className="service-card" key={s.n}>
                  <div className="service-top">
                    <s.icon size={28} strokeWidth={1.5} aria-hidden="true" />
                    <span>/{s.n}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="service-tags">{s.tags}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <PricingOverview />
        <section className="process-section studio-shell section-space">
          <div className="process-intro">
            <p className="eyebrow">03 / WORKING TOGETHER</p>
            <h2>
              From first conversation
              <br />
              to final details.
            </h2>
          </div>
          <div className="process-list">
            {[
              [
                "01",
                "Talk it through",
                "We’ll start with your goals, audience, and the problem you want to solve.",
              ],
              [
                "02",
                "Make a clear plan",
                "We’ll agree on the scope, priorities, timeline, and price before the build begins.",
              ],
              [
                "03",
                "Build, review, refine",
                "You’ll see the work as it takes shape, with room for feedback along the way.",
              ],
              [
                "04",
                "Launch with confidence",
                "We’ll check the key flows and layouts, then walk through how to use what we’ve built.",
              ],
            ].map(([n, title, body]) => (
              <div className="process-step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                <ArrowRight size={22} aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
        <section className="about-section studio-shell" id="about">
          <div className="founder-card">
            <span className="founder-kicker">INDEPENDENT BY DESIGN</span>
            <span className="founder-monogram" aria-hidden="true">
              KJL<span>.</span>
            </span>
            <div className="founder-signature">
              <strong>Kenan Larry</strong>
              <span>Founder, designer & developer</span>
            </div>
            <div className="founder-location">
              ST. LOUIS, MISSOURI <ArrowUpRight size={20} aria-hidden="true" />
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">04 / THE PERSON BEHIND THE BUILD</p>
            <h2>
              Your project.
              <br />
              My personal attention.
            </h2>
            <p>
              I’m the founder of KJL Designs, a St. Louis–based builder, and a Maryville University
              student who likes turning “what if” into something people can use.
            </p>
            <p>
              My work spans business websites, mobile products, and the systems behind them. I care
              about how things look, how they work, and how they feel to the person on the other
              side of the screen.
            </p>
            <p>
              When we work together, you’ll talk directly with the person building your project.
              Clear communication, thoughtful decisions, and a shared idea of what comes next.
            </p>
            <a className="text-link" href="#book">
              Let’s get to know your project <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section className="faq-section studio-shell section-space">
          <div>
            <p className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p>
            <h2>
              A little clarity,
              <br />
              before we begin.
            </h2>
          </div>
          <div className="faq-list">
            {[
              [
                "Can you improve my existing website?",
                "Yes. We can start by reviewing what you have, what feels outdated, and what your visitors need. That helps us decide whether a focused refresh or a larger rebuild makes sense.",
              ],
              [
                "How much does a project cost?",
                "Website projects start at $750, business websites at $1,800, and custom web apps at $4,000. Explore the pricing page for package details and an interactive estimate. After we talk, I’ll put together a final quote for your scope.",
              ],
              [
                "Do I need to know exactly what I want?",
                "No. A rough idea, a problem you want to solve, or a few websites you like is enough to start the conversation.",
              ],
              [
                "What happens after I book?",
                "You’ll receive a calendar invitation and a Google Meet link. We’ll use the call to discuss your idea and next steps. If you need a different time, use the rescheduling or cancellation option in your confirmation.",
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
        <BookingSection />
      </main>
      <StudioFooter />
    </div>
  );
}
