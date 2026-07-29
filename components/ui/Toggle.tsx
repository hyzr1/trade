// components/ui/Toggle.tsx — reusable switch toggle.
"use client";

import { LINE_2, VIOLET } from "@/lib/theme";

export function Toggle({
  on,
  onChange,
  size = "md",
  ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const dims =
    size === "sm"
      ? { w: 28, h: 16, knob: 12, top: 1, edge: 14 }
      : { w: 36, h: 20, knob: 14, top: 2, edge: 18 };

  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{
        width: dims.w,
        height: dims.h,
        background: on ? VIOLET : "rgba(255,255,255,0.10)",
        border: `1px solid ${on ? "rgba(124,95,255,0.6)" : LINE_2}`,
      }}
    >
      <span
        className="absolute rounded-full transition-all"
        style={{
          top: dims.top,
          width: dims.knob,
          height: dims.knob,
          left: on ? `calc(100% - ${dims.edge}px)` : `${dims.top}px`,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}
