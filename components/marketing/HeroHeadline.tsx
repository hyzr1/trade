// components/marketing/HeroHeadline.tsx
// Editorial landing-page hero + scroll-reveal helpers.
//
// IMPORTANT: HeroHeadline used to drive its stagger via framer-motion's
// `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` pattern. That renders
// the SERVER-SIDE markup with inline `opacity: 0`, so the headline was
// INVISIBLE on first paint until JS hydrated — the user reported "words don't
// load initially on the home page." Classic flash-of-invisible-content.
//
// Fix: drive the fade entirely via CSS (`.fadein-N` classes in globals.css).
// CSS animations run from the very first frame, even before JS hydrates, so
// the headline is always visible. Reduced-motion is respected at the CSS layer.

"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  lines: string[];
  className?: string;
  style?: CSSProperties;
};

export function HeroHeadline({ lines, className, style }: Props) {
  // Gradient-text styling (background-clip:text + color:transparent) MUST live
  // on the element that actually contains the text — i.e. each <span>, not the
  // <h1>. Putting it on the h1 was rendering the spans as truly transparent
  // with no gradient showing through, so the headline was invisible.
  //
  // We render each line as a block span with the gradient style applied so the
  // gradient-text trick works per line. No animation classes — the headline
  // paints immediately on first frame. Other landing sections still fade in
  // via ScrollReveal as you scroll.
  return (
    <h1 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block" style={style}>
          {line}
        </span>
      ))}
    </h1>
  );
}

/** SSR-safe scroll-into-view reveal.
 *
 * Renders content visible on the server so there's no FOIC if JS fails or is
 * slow. On the client, we re-hide briefly and then animate in as the element
 * enters the viewport — but only if the element is NOT already on screen at
 * mount (avoids a re-hide flash for above-the-fold sections).
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible — SSR + no-JS fallback shows content normally.
  const [state, setState] = useState<"ssr" | "hidden" | "visible">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — just show content, no animation.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setState("visible");
      return;
    }

    // If the element is already in (or above) the viewport at mount, don't
    // bother hiding it — it would cause a visible re-hide flash for hero-
    // adjacent sections. Just mark visible immediately.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (rect.top < vh * 0.9) {
      setState("visible");
      return;
    }

    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setState("visible");
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = state === "hidden";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(16px)" : "translateY(0)",
        transition:
          state === "ssr"
            ? "none"
            : `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/** Hover-lift card. CSS-only — no SSR concerns. */
export function HoverLift({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </div>
  );
}
