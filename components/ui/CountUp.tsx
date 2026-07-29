// components/ui/CountUp.tsx
// Animates a number from 0 → value on mount and on value change. Renders
// the running interpolation through `format`. Short-circuits to the final
// value when prefers-reduced-motion is set.
"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

export type CountUpProps = {
  value: number;
  format?: (v: number) => string;
  duration?: number; // seconds
  /** When set, the CountUp will start from this value (default: 0). */
  from?: number;
  className?: string;
  style?: React.CSSProperties;
};

const defaultFormat = (v: number) => v.toFixed(0);

export function CountUp({
  value,
  format = defaultFormat,
  duration = 0.7,
  from = 0,
  className,
  style,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(reduced ? value : from);
  const rendered = useTransform(mv, (v) => format(v));

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, duration, mv, reduced]);

  return (
    <motion.span className={className} style={style}>
      {rendered}
    </motion.span>
  );
}
