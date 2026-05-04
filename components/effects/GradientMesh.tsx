"use client";
import { motion } from "motion/react";

export default function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full opacity-[0.18]"
        style={{
          background: "radial-gradient(circle, #7CFFB2 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-1/4 h-[55vw] w-[55vw] rounded-full opacity-[0.10]"
        style={{
          background: "radial-gradient(circle, #5EEAD4 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 30, -40, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[50vw] w-[50vw] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #FFFFFF 0%, transparent 60%)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}
