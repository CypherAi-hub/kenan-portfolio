"use client";
import { motion } from "motion/react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { ease } from "@/lib/motion";

export default function SectionMarker({ number, label }: { number: string; label: string }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className="text-fg-muted flex items-center gap-4 font-mono text-xs uppercase">
      <motion.span
        className="text-accent"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        / {number}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, ease: ease.out, delay: 0.1 }}
      >
        — {label}
      </motion.span>
      <motion.span
        aria-hidden
        className="bg-border ml-2 h-px max-w-[280px] flex-1 origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: ease.out, delay: 0.2 }}
      />
    </div>
  );
}
