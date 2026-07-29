// components/AnimatedNumber.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  value: number;
  /** Number of decimals to render. */
  precision?: number;
  /** Prefix sign for positive values (default "+"). */
  positivePrefix?: string;
  /** Suffix (e.g. "%"). */
  suffix?: string;
  /** Animation duration. */
  duration?: number;
  className?: string;
};

export function AnimatedNumber({
  value,
  precision = 2,
  positivePrefix = "",
  suffix = "",
  duration = 1.6,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const format = (n: number) => {
      const sign = n > 0 ? positivePrefix : n < 0 ? "-" : "";
      return `${sign}${Math.abs(n).toFixed(precision)}${suffix}`;
    };
    if (reduce) {
      el.textContent = format(value);
      return;
    }
    const state = { n: 0 };
    el.textContent = format(0);
    const ctx = gsap.context(() => {
      gsap.to(state, {
        n: value,
        duration,
        ease: "power3.out",
        onUpdate: () => { el.textContent = format(state.n); },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [value, precision, positivePrefix, suffix, duration]);

  return <span ref={ref} className={className}>{positivePrefix}0{suffix}</span>;
}
