// app/error.tsx — client-side error boundary.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  Home,
  RotateCcw,
} from "lucide-react";
import {
  BG,
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_DEEP,
} from "@/lib/theme";

const SOFT_RED = "#F87171";
const SOFT_RED_BG = "rgba(248,113,113,0.10)";
const SOFT_RED_BORDER = "rgba(248,113,113,0.30)";

// Stable per-mount ID so a refresh gives a different ref string.
function makeErrorId() {
  // 8-char ULID-ish ref — readable for support.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ERR_${s}`;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [debugOpen, setDebugOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const errorId = useMemo(() => error.digest ?? makeErrorId(), [error.digest]);

  useEffect(() => {
    // Log only — no real telemetry yet.
    // eslint-disable-next-line no-console
    console.error("[autotrade] runtime error:", error);
  }, [error]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(errorId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <main
      className="min-h-screen relative flex items-center justify-center px-6 py-12"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(700px 420px at 50% -10%, rgba(248,113,113,0.10), transparent 60%),
            radial-gradient(820px 520px at 50% 120%, rgba(79,57,216,0.16), transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        <span
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: SOFT_RED_BG,
            border: `1px solid ${SOFT_RED_BORDER}`,
            color: SOFT_RED,
            boxShadow:
              "0 14px 36px -10px rgba(248,113,113,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <AlertTriangle size={22} />
        </span>

        <div className="eyebrow mt-5" style={{ color: TEXT_LOW }}>
          Runtime hiccup
        </div>
        <h1
          className="display mt-3 text-[32px] sm:text-[38px]"
          style={{ color: TEXT_HI, lineHeight: 1.05 }}
        >
          That didn&apos;t work as planned.
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed max-w-md mx-auto" style={{ color: TEXT_MID }}>
          Something on the desk went sideways. The error was logged, and we&apos;ll
          look at it. In the meantime — refresh, or head home and try a different route.
        </p>

        {/* Error ID — copyable */}
        <div className="mt-5 inline-flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Error ID
          </span>
          <button
            onClick={copyRef}
            className="group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_HI,
            }}
            aria-label="Copy error ID"
          >
            {errorId}
            {copied ? (
              <Check size={11} style={{ color: "#4ADE80" }} />
            ) : (
              <Copy size={11} className="opacity-60 group-hover:opacity-100" style={{ color: TEXT_MID }} />
            )}
          </button>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2.5 flex-wrap">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2.5 text-[13px] font-medium transition-all hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`,
              color: "#fff",
              boxShadow:
                "0 14px 36px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            <RotateCcw size={13} />
            Try again
          </button>
          <Link
            href="/terminal"
            className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2.5 text-[13px] transition-colors hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_HI,
            }}
          >
            <Home size={13} />
            Go to desk
          </Link>
        </div>

        {/* Collapsible debug info */}
        {(error.message || error.stack) && (
          <div className="mt-8 mx-auto max-w-lg text-left">
            <button
              onClick={() => setDebugOpen((v) => !v)}
              className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-[11.5px] transition-colors hover:bg-white/[0.04]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${LINE_2}`,
                color: TEXT_MID,
              }}
              aria-expanded={debugOpen}
            >
              <ChevronDown
                size={12}
                className="transition-transform"
                style={{
                  transform: debugOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  color: TEXT_LOW,
                }}
              />
              <span className="font-mono uppercase tracking-[0.16em] text-[10px]">
                Debug info
              </span>
              <span style={{ color: TEXT_LOW }} className="ml-auto text-[11px]">
                {debugOpen ? "hide" : "show"}
              </span>
            </button>
            {debugOpen && (
              <div
                className="mt-2 rounded-md p-3 font-mono text-[11px] leading-relaxed overflow-auto max-h-64"
                style={{
                  background: "rgba(8,6,15,0.65)",
                  border: `1px solid ${LINE}`,
                  color: TEXT_MID,
                }}
              >
                {error.message && (
                  <div className="text-[11.5px] mb-2" style={{ color: SOFT_RED }}>
                    {error.message}
                  </div>
                )}
                {error.stack && (
                  <pre className="whitespace-pre-wrap break-words" style={{ color: TEXT_LOW }}>
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
