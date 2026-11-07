import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { projectLibrary, type LibraryProject } from "@/data/project-library";
import { projectVideos } from "@/data/project-media";
import { projectDetails } from "@/data/project-details";
import { siteUrl } from "@/data/selected-work";
import { profile } from "@/lib/data";

export default function ProjectDetails({ project: p }: { project: LibraryProject }) {
  const d = projectDetails[p.slug];
  const video = projectVideos[p.slug];
  const related = d.related
    .map((slug) => projectLibrary.find((x) => x.slug === slug))
    .filter((x): x is LibraryProject => Boolean(x));
  return (
    <>
      {video && (
        <section className="project-film" aria-labelledby="project-film-title">
          <div>
            <h2 id="project-film-title">{video.title}</h2>
            <p>{video.description}</p>
          </div>
          <video
            className={video.portrait ? "portrait-film" : ""}
            controls
            playsInline
            preload="none"
            poster={video.poster}
            aria-label={video.title}
          >
            <source src={video.src} type="video/mp4" />
            <track kind="captions" src={video.captions} srcLang="en" label="English" />
            <a href={video.src}>Open the video</a>
          </video>
        </section>
      )}
      <div className="project-brief-grid">
        <aside className="project-facts" aria-label="Project at a glance">
          <div>
            <h2>My role</h2>
            <p>{d.role}</p>
          </div>
          <div>
            <h2>Who it’s for</h2>
            <p>{d.audience}</p>
          </div>
          <div>
            <h2>Project stage</h2>
            <p>{p.status}</p>
          </div>
          {p.tags.length > 0 && (
            <div>
              <h2>Tools & focus</h2>
              <div className="project-fact-tags">
                {p.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
          <a
            className="text-link"
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`Tell me more about ${p.title}`)}`}
          >
            Ask me about this project <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </aside>
        <div className="project-narrative">
          <section>
            <p className="eyebrow">THE PURPOSE</p>
            <h2>The problem behind the project.</h2>
            <p>{d.challenge}</p>
          </section>
          <section>
            <p className="eyebrow">THE APPROACH</p>
            <h2>How the idea took shape.</h2>
            <p>{d.approach}</p>
          </section>
          <section>
            <p className="eyebrow">INSIDE THE PROJECT</p>
            <h2>What’s included.</h2>
            <div className="project-feature-list">
              {d.features.map((f, i) => (
                <article key={f.title}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      {d.gallery.length > 0 && (
        <section className="project-gallery-section" aria-label="More project views">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A CLOSER LOOK</p>
              <h2>Inside the experience.</h2>
            </div>
            <p>Open a preview to view it at full size.</p>
          </div>
          <div className="project-gallery">
            {d.gallery.map((g) => (
              <figure key={g.src}>
                <a
                  href={g.src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open full-size preview: ${g.alt}`}
                >
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={1440}
                    height={1000}
                    sizes="(min-width: 900px) 70vw, 90vw"
                  />
                  <span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </a>
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <section
        id="project-links"
        className="project-resources"
        aria-label="Project links and availability"
      >
        <div className="project-resource-intro">
          <p className="eyebrow">EXPLORE THE PROJECT</p>
          <h2>Links & availability.</h2>
          <p>{d.availability}</p>
        </div>
        <div className="project-resource-list">
          {d.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="project-resource"
            >
              <div>
                <h3>{link.label}</h3>
                <p>{link.description}</p>
                <span className="resource-url">
                  {new URL(link.url, siteUrl).host}
                  {new URL(link.url, siteUrl).pathname.replace(/\/$/, "")}
                </span>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          ))}
          {!d.links.length && (
            <div className="project-access-note">
              <h3>Explore the work here.</h3>
              <p>
                This page is the public project overview. For more context about the design or
                development, get in touch directly.
              </p>
              <a
                className="text-link"
                href={`mailto:${profile.email}?subject=${encodeURIComponent(`Question about ${p.title}`)}`}
              >
                Ask about {p.title}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          )}
          {p.notesUrl && (
            <Link className="project-archive-link" href={p.notesUrl}>
              Read earlier project notes <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="project-related" aria-label="Related projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KEEP EXPLORING</p>
              <h2>Connected work.</h2>
            </div>
            <Link href="/projects" className="text-link">
              All projects <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="related-project-grid">
            {related.map((r) => (
              <Link href={`/projects/${r.slug}`} key={r.slug} className="related-project">
                <Image
                  className={r.contain ? "related-image contain" : "related-image"}
                  src={r.image}
                  alt={r.imageAlt}
                  width={440}
                  height={255}
                  sizes="(min-width: 750px) 30vw, 90vw"
                />
                <p className="eyebrow">{r.category}</p>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <span>
                  View project <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="project-next-step">
        <div>
          <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
          <h2>Let’s build your next idea.</h2>
          <p>Tell me about the website, app, or workflow you want to create.</p>
        </div>
        <Link href="/book" className="studio-button">
          Book a discovery call <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
