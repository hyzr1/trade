// components/MagneticButton.tsx
//
// Magnetic hover effect: the button (and an inner label) eases toward the
// cursor while inside its bounding box. Works on any link/button.
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = React.HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  strength?: number;
  className?: string;
};

export function MagneticButton({
  href,
  children,
  strength = 0.35,
  className = "",
  ...rest
}: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const ixTo = gsap.quickTo(inner, "x", { duration: 0.55, ease: "power3.out" });
    const iyTo = gsap.quickTo(inner, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo(dx * strength * 0.4);
      iyTo(dy * strength * 0.4);
    };
    const onLeave = () => {
      xTo(0); yTo(0); ixTo(0); iyTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <a ref={ref} href={href} className={className} {...rest}>
      <span ref={innerRef} className="inline-flex items-center gap-1.5 pointer-events-none">
        {children}
      </span>
    </a>
  );
}
