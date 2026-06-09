"use client";
import { motion } from "motion/react";

const NODES = [
  { id: 0, x: 50, y: 50, label: "core" },
  ...Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return {
      id: i + 1,
      x: 50 + Math.cos(angle) * 32,
      y: 50 + Math.sin(angle) * 32,
      label: `dept-${i + 1}`,
    };
  }),
];

export default function CypherOSVisual() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#7CFFB2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7CFFB2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#glow)" />
      {NODES.slice(1).map((n, i) => (
        <motion.line
          key={`line-${i}`}
          x1={50}
          y1={50}
          x2={n.x}
          y2={n.y}
          stroke="#1D2128"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      {NODES.slice(1).map((n, i) => (
        <motion.circle
          key={`pulse-${i}`}
          cx={50}
          cy={50}
          r="0.5"
          fill="#7CFFB2"
          animate={{ cx: [50, n.x], cy: [50, n.y], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r={i === 0 ? "2" : "1.2"}
          fill={i === 0 ? "#7CFFB2" : "#101216"}
          stroke={i === 0 ? "#7CFFB2" : "#5BD494"}
          strokeWidth="0.4"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}
