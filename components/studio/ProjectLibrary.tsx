"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { libraryCategories, projectLibrary } from "@/data/project-library";

export default function ProjectLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All work");
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = projectLibrary.filter((p) => {
    const text = [p.title, p.description, p.category, ...p.tags].join(" ").toLocaleLowerCase();
    return (
      (category === "All work" || category === p.category) &&
      terms.every((term) => text.includes(term))
    );
  });
  const reset = () => {
    setQuery("");
    setCategory("All work");
  };
  return (
    <section className="project-library" aria-label="Searchable project library">
      <div className="library-controls">
        <label className="library-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, ideas, or technologies…"
          />
        </label>
        <div className="library-filters" role="group" aria-label="Filter projects by type">
          {libraryCategories.map((c) => (
            <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="library-result-row">
        <p role="status" aria-live="polite">
          {filtered.length} of {projectLibrary.length} projects <span>/ {category}</span>
        </p>
        {(query || category !== "All work") && (
          <button onClick={reset}>
            Clear filters <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="library-grid">
          {filtered.map((p) => (
            <article key={p.slug} className="library-card">
              <Link
                href={`/projects/${p.slug}`}
                className={`library-art library-art-${p.category.split(" ")[0].toLowerCase()} ${p.image?.includes("fofit-workout") || p.image?.includes("ultraflips-watchlist") ? "library-art-phone" : ""}`}
                aria-label={`Explore ${p.title}`}
              >
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.imageAlt || p.title}
                    fill
                    sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 90vw"
                  />
                ) : (
                  <>
                    <span className="library-monogram" aria-hidden="true">
                      {p.monogram}
                    </span>
                    <span className="library-art-type">{p.category}</span>
                  </>
                )}
                <span className="library-open">
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </Link>
              <div className="library-card-copy">
                <p className="library-status">{p.status}</p>
                <h2>
                  <Link href={`/projects/${p.slug}`}>{p.title}</Link>
                </h2>
                <p>{p.description}</p>
                <div className="library-tags">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <Link className="text-link" href={`/projects/${p.slug}`}>
                  Explore project <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <h2>No matches just yet.</h2>
          <p>Try a project name like FoFit, a technology like React, or a different category.</p>
          <button className="studio-button" onClick={reset}>
            Show all projects <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
