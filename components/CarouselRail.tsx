"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useRef } from "react";
import { motion } from "motion/react";

export type CarouselItem = {
  eyebrow: string;
  title: string;
  description: string;
  media?: {
    src: string;
    alt: string;
  };
  href?: string;
  meta?: string;
  variant?: "phone" | "dashboard" | "terminal" | "report" | "proof";
};

function frameClass(variant: CarouselItem["variant"]) {
  switch (variant) {
    case "phone":
      return "aspect-[9/16] max-h-[420px] w-[58%] mx-auto rounded-[28px] border-[8px] border-white/12 bg-black p-1";
    case "report":
      return "aspect-[4/5] rounded border border-white/12 bg-white p-2";
    case "terminal":
      return "aspect-[4/3] rounded border border-white/12 bg-black p-3";
    default:
      return "aspect-[4/3] rounded border border-white/12 bg-bg-elevated p-2";
  }
}

export default function CarouselRail({ label, items }: { label: string; items: CarouselItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>("[data-carousel-card]");
    const distance = firstCard ? firstCard.offsetWidth + 16 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label={`Previous ${label}`}
          onClick={() => scrollByCard(-1)}
          className="border-border text-fg-secondary flex size-10 items-center justify-center rounded border transition-colors hover:border-white/45 hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Next ${label}`}
          onClick={() => scrollByCard(1)}
          className="border-border text-fg-secondary flex size-10 items-center justify-center rounded border transition-colors hover:border-white/45 hover:text-white"
        >
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>

      <div
        ref={railRef}
        aria-label={label}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        role="list"
      >
        {items.map((item, index) => (
          <motion.article
            key={`${item.title}-${index}`}
            data-carousel-card
            role="listitem"
            tabIndex={0}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.48, delay: Math.min(index * 0.06, 0.24) }}
            className="glass-panel group min-w-[82%] snap-start overflow-hidden rounded p-4 transition-transform duration-300 outline-none hover:-translate-y-1 focus-visible:-translate-y-1 md:min-w-[48%] xl:min-w-[32%]"
          >
            <div className="border-b border-white/10 pb-3">
              <p className="text-fg-muted font-mono text-[10px] uppercase">{item.eyebrow}</p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <h3 className="text-xl leading-tight font-semibold">{item.title}</h3>
                {item.href && (
                  <a
                    href={item.href}
                    aria-label={`Open ${item.title}`}
                    className="border-border text-fg-secondary flex size-8 shrink-0 items-center justify-center rounded border transition-colors hover:border-white/45 hover:text-white"
                  >
                    <ExternalLink size={14} aria-hidden />
                  </a>
                )}
              </div>
            </div>

            <div className="my-4 flex min-h-[250px] items-center justify-center">
              <div className={frameClass(item.variant)}>
                {item.media ? (
                  <Image
                    src={item.media.src}
                    alt={item.media.alt}
                    width={900}
                    height={720}
                    sizes="(min-width: 1280px) 390px, (min-width: 768px) 48vw, 82vw"
                    className="h-full w-full rounded-[4px] object-cover object-top grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                  />
                ) : (
                  <div className="text-fg-muted flex h-full items-center justify-center text-sm">
                    Media coming soon
                  </div>
                )}
              </div>
            </div>

            <p className="text-fg-secondary text-sm leading-6">{item.description}</p>
            {item.meta && (
              <p className="text-fg-muted mt-4 font-mono text-[11px] uppercase">{item.meta}</p>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}
