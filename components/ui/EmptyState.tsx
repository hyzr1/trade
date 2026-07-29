// components/ui/EmptyState.tsx — reusable empty-state card.
"use client";

import type { ReactNode } from "react";
import { LINE_2, TEXT_HI, TEXT_LOW, TEXT_MID, VIOLET, VIOLET_2, VIOLET_DEEP } from "@/lib/theme";

export type EmptyStateProps = {
  icon?: ReactNode;
  headline: string;
  body?: string;
  cta?: { label: string; onClick?: () => void; href?: string };
  /** Compact variant for inline use inside small panels. */
  compact?: boolean;
};

export function EmptyState({ icon, headline, body, cta, compact = false }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-5 py-8" : "px-6 py-12"
      }`}
    >
      {icon && (
        <span
          className={`inline-flex items-center justify-center mb-4 rounded-2xl ${
            compact ? "w-10 h-10" : "w-12 h-12"
          }`}
          style={{
            background: "rgba(124,95,255,0.10)",
            color: VIOLET_2,
            border: `1px solid rgba(124,95,255,0.22)`,
          }}
        >
          {icon}
        </span>
      )}
      <div
        className={compact ? "text-[13.5px] font-medium" : "text-[15px] font-medium"}
        style={{ color: TEXT_HI }}
      >
        {headline}
      </div>
      {body && (
        <div
          className={`mt-1 max-w-sm ${compact ? "text-[11.5px]" : "text-[12.5px]"}`}
          style={{ color: TEXT_MID }}
        >
          {body}
        </div>
      )}
      {cta && (
        <div className="mt-4">
          {cta.href ? (
            <a
              href={cta.href}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition-all hover:brightness-110"
              style={ctaStyle}
            >
              {cta.label}
            </a>
          ) : (
            <button
              onClick={cta.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition-all hover:brightness-110"
              style={ctaStyle}
            >
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const ctaStyle = {
  background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`,
  color: "#fff",
  border: `1px solid ${LINE_2}`,
  boxShadow:
    "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
} as const;

// Convenience: muted variant when CTA shouldn't be the primary push.
export function EmptyStateMuted({
  headline,
  body,
}: {
  headline: string;
  body?: string;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="text-[12.5px] font-medium" style={{ color: TEXT_HI }}>
        {headline}
      </div>
      {body && (
        <div className="mt-1 text-[11.5px]" style={{ color: TEXT_LOW }}>
          {body}
        </div>
      )}
    </div>
  );
}
