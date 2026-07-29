// components/TiltCard.tsx
//
// Mouse-tracked perspective tilt with subtle glare overlay. Gives the hero
// dashboard a sense of physical depth. Wraps any children.
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function TiltCard({
  children,
  max = 7,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const glare = glareRef.current;
    if (!wrap || !inner || !glare) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const rxTo = gsap.quickTo(inner, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ryTo = gsap.quickTo(inner, "rotationY", { duration: 0.6, ease: "power3.out" });
    const gxTo = gsap.quickTo(glare, "x", { duration: 0.6, ease: "power3.out" });
    const gyTo = gsap.quickTo(glare, "y", { duration: 0.6, ease: "power3.out" });
    const goTo = gsap.quickTo(glare, "opacity", { duration: 0.4, ease: "power3.out" });

    gsap.set(wrap, { perspective: 1400, transformStyle: "preserve-3d" });
    gsap.set(inner, { transformStyle: "preserve-3d" });

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const rx = (0.5 - ny) * max * 2;
      const ry = (nx - 0.5) * max * 2;
      rxTo(rx);
      ryTo(ry);
      gxTo((nx - 0.5) * r.width * 0.4);
      gyTo((ny - 0.5) * r.height * 0.4);
      goTo(0.18);
    };
    const onLeave = () => {
      rxTo(0); ryTo(0); goTo(0);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div ref={innerRef} className="relative will-change-transform">
        {children}
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 50%)",
            mixBlendMode: "soft-light",
          }}
        />
      </div>
    </div>
  );
}
