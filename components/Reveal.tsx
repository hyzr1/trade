// components/Reveal.tsx
//
// GSAP scroll-triggered reveal. Children fade-up when they cross the
// viewport. Honors prefers-reduced-motion.
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  /** When true, also reveals the immediate children one-by-one as a stagger. */
  stagger?: boolean;
  staggerAmount?: number;
};

export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.9,
  className,
  stagger = false,
  staggerAmount = 0.08,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const targets = stagger ? Array.from(el.children) : el;
    gsap.set(targets, { opacity: 0, y });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        stagger: stagger ? staggerAmount : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, duration, stagger, staggerAmount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
