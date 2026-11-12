"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { selectedWork } from "@/data/selected-work";

const intervalMs = 7500;

export default function ProjectSpotlight() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);
  const project = selectedWork[index];
  const phone = project.slug === "ultraflips" || project.slug === "fofit";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (query.matches) setPlaying(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!playing || hovered || !visible) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % selectedWork.length),
      intervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [index, playing, hovered, visible]);

  return (
    <section
      ref={root}
      className="spotlight"
      aria-label="Featured projects"
      aria-roledescription="carousel"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(e) => {
        if (!e.target.closest(".spotlight-play")) setPlaying(false);
      }}
    >
      <header className="spotlight-bar">
        <span>A CLOSER LOOK</span>
        <button
          type="button"
          className="spotlight-play"
          aria-label={playing ? "Pause project slideshow" : "Play project slideshow"}
          onClick={() => {
            setHovered(false);
            setPlaying((v) => !v);
          }}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? "Pause" : "Play"}
        </button>
      </header>
      <div aria-live={playing ? "off" : "polite"} aria-atomic="true">
        <Link
          href={`/work/${project.slug}`}
          key={project.slug}
          className={`spotlight-view spotlight-${project.theme}`}
          aria-label={`Explore ${project.name}`}
        >
          <div className={`spotlight-stage ${phone ? "spotlight-phones" : "spotlight-web"}`}>
            {phone ? (
              <>
                <Image
                  className="spotlight-handset"
                  src={project.image}
                  alt={project.alt}
                  width={300}
                  height={650}
                  sizes="(max-width: 700px) 100px, 140px"
                />
                <Image
                  className="spotlight-handset second"
                  src={project.secondImage || "/media/showcase/ultra-identification.webp"}
                  alt={
                    project.secondImage
                      ? "FoFit recipe discovery"
                      : "UltraFlips research interface with sample data"
                  }
                  width={300}
                  height={650}
                  sizes="(max-width: 700px) 100px, 140px"
                />
              </>
            ) : (
              <div className="spotlight-screen">
                <Image
                  src={project.image}
                  alt={project.alt}
                  width={1200}
                  height={780}
                  priority={index === 0}
                  sizes="(min-width: 1000px) 500px, 88vw"
                />
              </div>
            )}
          </div>
          <div className="spotlight-caption">
            <div>
              <p>
                {project.category} · {project.status}
              </p>
              <h2>{project.name}</h2>
            </div>
            <ArrowUpRight size={26} aria-hidden="true" />
          </div>
        </Link>
      </div>
      <div className="spotlight-filmstrip" role="group" aria-label="Choose a featured project">
        {selectedWork.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            aria-label={`Show ${item.name}`}
            aria-pressed={i === index}
            onClick={() => {
              setPlaying(false);
              setIndex(i);
            }}
          >
            <Image src={item.image} alt="" fill sizes="100px" />
          </button>
        ))}
      </div>
    </section>
  );
}
