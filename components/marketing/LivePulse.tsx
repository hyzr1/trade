// components/marketing/LivePulse.tsx
// A more attention-grabbing pulse than a plain dot — used in hero "Live"
// chip and in the dashboard mockup's filings header.
"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  size?: number;
  color?: string;
  withRing?: boolean;
};

export function LivePulse({
  size = 8,
  color = "#4ADE80",
  withRing = true,
}: Props) {
  const reduced = useReducedMotion();
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {withRing && !reduced && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: color, opacity: 0.55 }}
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: color, opacity: 0.32 }}
            initial={{ scale: 0.6, opacity: 0.4 }}
            animate={{ scale: 2.0, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.55 }}
          />
        </>
      )}
      <span
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 12px ${color}AA`,
        }}
      />
    </span>
  );
}
