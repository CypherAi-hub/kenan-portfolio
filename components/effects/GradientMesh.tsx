"use client";
import { motion } from "motion/react";

export default function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ opacity: [0.36, 0.7, 0.36] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-[520px] opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.15), transparent 28%), radial-gradient(circle at 74% 20%, rgba(255,255,255,0.10), transparent 30%)",
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
            "linear-gradient(180deg, transparent 0%, rgba(3,3,3,0.7) 48%, #030303 100%)",
        }}
      />
    </div>
  );
}
