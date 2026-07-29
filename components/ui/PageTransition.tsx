// components/ui/PageTransition.tsx
// Wraps internal page content with a subtle fade+slide on route change.
// Respects prefers-reduced-motion (framer-motion short-circuits via the
// hook, and we also guard duration to keep things snappy).
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="space-y-6"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
