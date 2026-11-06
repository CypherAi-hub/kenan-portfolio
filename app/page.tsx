import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Globe2,
  PanelsTopLeft,
  Sparkles,
  MoveUpRight,
} from "lucide-react";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import BookingSection from "@/components/studio/BookingSection";
import ProjectVisual from "@/components/studio/ProjectVisual";
import { projectLibrary } from "@/data/project-library";
import { selectedWork } from "@/data/selected-work";
export const metadata = { alternates: { canonical: "https://kenan-portfolio-wine.vercel.app" } };

export default function Home() {
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main id="main">
        <section className="studio-hero studio-shell" id="top">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> INDEPENDENT DESIGNER & DEVELOPER
            </p>
            <h1>
              Good ideas.
              <br />
              Built for
              <br />
              <em>real life.</em>
              <span className="hero-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              I’m Kenan. I build thoughtful websites, apps, and digital tools that help people turn
              their next idea into something useful.
            </p>
            <div className="hero-actions">
              <a className="studio-button" href="#book">
                Let’s build something <ArrowUpRight size={19} aria-hidden="true" />
              </a>
              <a className="text-link" href="#work">
                Explore my work <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-location">
              <span className="location-dot" />
              Based in St. Louis. Building wherever you are.
            </div>
          </div>
          <div className="hero-art">
            <div className="art-grid" />
            <span className="art-kicker">FROM IDEA TO SOMETHING REAL</span>
            <div className="hero-window">
              <div className="hero-window-bar">
                <span>● ● ●</span>
                <span>General Services</span>
                <ArrowUpRight size={12} />
              </div>
              <Image
                src="/media/current/general-services.jpg"
                alt="A recent website built for Maryville’s General Services team"
                width={1440}
                height={1000}
                priority
                sizes="(min-width: 900px) 580px, 85vw"
              />
            </div>
            <div className="hero-phone">
              <Image
                src="/media/current/fofit-workout.webp"
                alt="FoFit workout interface, a mobile product in development"
                width={720}
                height={1565}
                sizes="(min-width: 900px) 190px, 145px"
                priority
              />
            </div>
            <div className="art-note">
              <span className="note-star" aria-hidden="true">
                ✳
              </span>
              <span>
                Made with purpose.
                <br />
                <strong>Built around people.</strong>
              </span>
            </div>
            <span className="art-index">SELECTED WORK / 2026</span>
          </div>
        </section>
        <div className="capability-strip">
          <div className="studio-shell">
            <span>WEBSITES</span>
            <span aria-hidden="true">✳</span>
            <span>WEB APPS</span>
            <span aria-hidden="true">✳</span>
            <span>MOBILE EXPERIENCES</span>
            <span aria-hidden="true">✳</span>
            <span>PRACTICAL AI</span>
          </div>
        </div>
        <section className="work-section studio-shell section-space" id="work">
          <span id="featured" className="legacy-anchor" aria-hidden="true" />
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / SELECTED WORK</p>
              <h2>
                A few things
                <br />
                I’ve brought <em>to life.</em>
              </h2>
            </div>
            <p>
              From a campus request desk to products I’m building from the ground up. Different
              problems, the same care for the details.
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
                    <p className="project-category">
                      {p.category} <span> / {p.status}</span>
                    </p>
                    <h3>
                      <Link href={`/work/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p>{p.summary}</p>
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
                  Your idea.
                  <br />
                  The right <em>build.</em>
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
        <section className="process-section studio-shell section-space">
          <div className="process-intro">
            <p className="eyebrow">03 / WORKING TOGETHER</p>
            <h2>
              Good work starts
              <br />
              with a <em>conversation.</em>
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
          <div className="about-art" aria-hidden="true">
            <span className="about-circle" />
            <span className="about-monogram">
              k<span>.</span>
            </span>
            <span className="about-art-label">
              CURIOUS BY NATURE.
              <br />A BUILDER BY CHOICE.
            </span>
            <MoveUpRight size={45} />
          </div>
          <div className="about-copy">
            <p className="eyebrow">04 / THE PERSON BEHIND THE BUILD</p>
            <h2>
              Hey, I’m <em>Kenan.</em>
            </h2>
            <p>
              I’m a St. Louis–based builder and Maryville University student who likes turning “what
              if” into something people can use.
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
              Before we <em>begin.</em>
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
                "It depends on the scope, features, content, and timeline. After we talk, I’ll put together a proposal so you know what’s included before you commit.",
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
