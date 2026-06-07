"use client";
import { motion } from "motion/react";

export default function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ opacity: [0.5, 0.82, 0.5] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-80 opacity-70"
        style={{
          background:
            "linear-gradient(110deg, rgba(119,245,177,0.20), transparent 38%, rgba(103,216,239,0.16) 66%, transparent)",
        }}
      />
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "96px 48px"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="bg-grid absolute inset-0 opacity-55"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(9,11,15,0.74) 48%, #090b0f 100%)",
        }}
      />
    </div>
  );
}
