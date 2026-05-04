"use client";
import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 h-6 w-6 rounded-full mix-blend-screen"
      style={{
        background: "radial-gradient(circle, rgba(124,255,178,0.35) 0%, transparent 70%)",
      }}
    />
  );
}
