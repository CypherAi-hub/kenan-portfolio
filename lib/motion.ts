import type { Variants } from "motion/react";

export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const dur = { instant: 0.1, fast: 0.2, base: 0.4, slow: 0.8 };

export const spring = {
  snappy: { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.8 },
  soft: { type: "spring" as const, stiffness: 200, damping: 28 },
};

export const heroSequence = {
  container: { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } },
  letter: {
    initial: { y: "110%" },
    animate: { y: "0%", transition: { duration: 0.9, ease: ease.out } },
  },
  fadeUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  },
} as const;

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.out, delay: i * 0.1 },
  }),
};

export const writeupReveal: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.out, delay: i * 0.06 },
  }),
};

export const viewport = { once: true, margin: "-80px" } as const;
