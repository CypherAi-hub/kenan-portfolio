"use client";
import { useReducedMotion as useMotionReducedMotion } from "motion/react";

export function useReducedMotion(): boolean {
  const prefers = useMotionReducedMotion();
  return Boolean(prefers);
}
