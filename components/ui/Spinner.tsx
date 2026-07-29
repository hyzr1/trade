// components/ui/Spinner.tsx — clean spinner, sized + color-themed.
"use client";

import { VIOLET_2 } from "@/lib/theme";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { px: number; stroke: number }> = {
  sm: { px: 12, stroke: 2 },
  md: { px: 16, stroke: 2 },
  lg: { px: 22, stroke: 2.4 },
};

export function Spinner({
  size = "md",
  color = VIOLET_2,
  className = "",
  label = "Loading",
}: {
  size?: Size;
  color?: string;
  className?: string;
  label?: string;
}) {
  const { px, stroke } = SIZES[size];
  const radius = (px - stroke) / 2;
  const cx = px / 2;
  const cy = px / 2;
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox={`0 0 ${px} ${px}`}
        width={px}
        height={px}
        className="animate-spin"
        style={{ animationDuration: "0.75s" }}
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth={stroke}
          fill="none"
          style={{ color }}
        />
        <path
          d={`M ${cx} ${stroke / 2} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
