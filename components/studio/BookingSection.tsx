import { ArrowUpRight, Clock3, Video, CalendarDays, Check, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { bookingUrl } from "@/lib/booking";
export default function BookingSection({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <section className="booking-section" id="book">
      <span id="contact" className="legacy-anchor" aria-hidden="true" />
      <div className="studio-shell booking-grid">
        <div>
          <p className="eyebrow light-eyebrow">
            <span /> LET’S MAKE IT HAPPEN
          </p>
          <Heading>
            Big idea?
            <br />
            Let’s <em>talk.</em>
          </Heading>
          <p className="booking-intro">
            A better website. A smoother workflow. An app you’ve been thinking about. Tell me what
            you have in mind.
          </p>
          <a className="booking-email" href={`mailto:${profile.email}`}>
            {profile.email}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>
        <div className="booking-card">
          <span className="booking-label">BOOK WITH ME</span>
          <h3>
            Your next project
            <br />
            starts here.
          </h3>
          <div className="meeting-meta">
            <span>
              <Clock3 size={17} aria-hidden="true" />
              30 minutes
            </span>
            <span>
              <Video size={17} aria-hidden="true" />
              Google Meet
            </span>
          </div>
          <p>
            Choose an available time for an introductory call. We’ll talk through your goals,
            timeline, and what it takes to bring the idea to life.
          </p>
          <ul>
            {[
              "A conversation about your goals",
              "A clear starting point for your project",
              "No technical preparation needed",
            ].map((x) => (
              <li key={x}>
                <Check size={17} aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
          <a
            className="studio-button booking-cta"
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Choose a time <CalendarDays size={18} aria-hidden="true" />
          </a>
          <p className="booking-small">
            Opens Google Calendar booking. Times display in your timezone. Please book at least 24
            hours ahead.
          </p>
          <div className="booking-alternative">
            <Mail size={16} aria-hidden="true" />
            <span>
              Prefer to write it out?{" "}
              <a
                href={`mailto:${profile.email}?subject=${encodeURIComponent("Website / app project inquiry")}`}
              >
                Email me your idea.
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
