// components/ui/MotionList.tsx
// Shared framer-motion variants for staggered row entrances. Drop the
// `listVariants` on a parent `motion.div` and `itemVariants` on each child.
// Wrappers below give a typed default surface so callers can render rows
// without re-importing motion everywhere.
"use client";

import type { HTMLMotionProps, Transition, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { forwardRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.022,
      delayChildren: 0.02,
      // Cap the cascade so very long lists don't crawl out forever.
      // staggerChildren * 25 ≈ 550ms max budget.
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASE },
  },
};

const REDUCED_LIST: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
};
const REDUCED_ITEM: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
};

/** Hook returning the list/item variants suitable for the current motion
 *  preference. Use inside a "use client" component. */
export function useStaggerVariants(): { list: Variants; item: Variants } {
  const reduced = useReducedMotion();
  return reduced
    ? { list: REDUCED_LIST, item: REDUCED_ITEM }
    : { list: listVariants, item: itemVariants };
}

/** Quick-drop wrapper. Spreads any motion.div props, defaults to
 *  `variants={listVariants}` + initial/animate set to "hidden"/"show". */
type ListProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate"> & {
  keyId?: string | number;
};

export const MotionList = forwardRef<HTMLDivElement, ListProps>(
  function MotionList({ children, keyId, ...rest }, ref) {
    const reduced = useReducedMotion();
    return (
      <motion.div
        ref={ref}
        key={keyId}
        variants={reduced ? REDUCED_LIST : listVariants}
        initial="hidden"
        animate="show"
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

type ItemProps = Omit<HTMLMotionProps<"div">, "variants">;

export const MotionItem = forwardRef<HTMLDivElement, ItemProps>(
  function MotionItem({ children, ...rest }, ref) {
    const reduced = useReducedMotion();
    return (
      <motion.div
        ref={ref}
        variants={reduced ? REDUCED_ITEM : itemVariants}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

/** Re-exported for callers that want their own row element (e.g. table tr). */
export const motionTransition: Transition = { duration: 0.22, ease: EASE };
