"use client";
import { motion } from "motion/react";

export default function UltraFlipsVisual() {
  const cards = [
    { r: -8, x: -60, c: "#5EEAD4" },
    { r: -2, x: -20, c: "#FFD66B" },
    { r: 4, x: 20, c: "#7CFFB2" },
    { r: 10, x: 60, c: "#FF7A7A" },
  ];
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: 1000 }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ y: 60, opacity: 0, rotateZ: 0 }}
          whileInView={{ y: 0, opacity: 1, rotateZ: card.r, x: card.x }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -8, rotateZ: card.r * 0.5 }}
          className="absolute h-[170px] w-[120px] rounded-lg border-2 bg-bg-elevated"
          style={{ borderColor: card.c, boxShadow: `0 8px 30px ${card.c}22` }}
        >
          <div className="p-2 font-mono text-[8px] text-fg-muted">TCG · #{i + 1}</div>
          <div
            className="mx-2 h-[80px] rounded"
            style={{ background: `linear-gradient(135deg, ${card.c}33, transparent)` }}
          />
          <div className="p-2 font-mono text-[8px] text-fg-secondary">
            HP <span className="tabular text-fg">{120 + i * 30}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
