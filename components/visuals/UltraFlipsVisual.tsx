"use client";
import Image from "next/image";
import { motion } from "motion/react";

export default function UltraFlipsVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    >
      <Image
        src="/images/projects/ultraflips.png"
        alt="UltraFlips landing page"
        fill
        sizes="(min-width: 1024px) 640px, 100vw"
        className="object-cover object-top"
      />
    </motion.div>
  );
}
