"use client";
import { motion } from "motion/react";

export default function FoFitVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ rotateX: 12, rotateY: -18, y: 20, opacity: 0 }}
        whileInView={{ rotateX: 12, rotateY: -18, y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        className="relative h-[360px] w-[180px] rounded-[36px] border-2 border-border bg-bg-elevated shadow-2xl"
      >
        <div className="absolute inset-2 overflow-hidden rounded-[28px] bg-bg p-3 font-mono text-[9px] text-fg-secondary">
          <div className="text-accent">FoFit · today</div>
          <div className="mt-2 text-[8px] uppercase tracking-wider text-fg-muted">workout · push</div>
          {[
            ["Bench Press", "4×8", "185lb"],
            ["Incline DB", "3×10", "65lb"],
            ["Cable Fly", "3×12", "30lb"],
            ["Tri Pushdown", "4×12", "70lb"],
          ].map(([n, s, w], i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="mt-2 flex justify-between border-b border-border pb-1"
            >
              <span className="truncate">{n}</span>
              <span className="text-fg-muted">{s}</span>
              <span className="tabular text-accent">{w}</span>
            </motion.div>
          ))}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "72%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-accent"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
