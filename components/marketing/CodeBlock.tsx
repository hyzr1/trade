// components/marketing/CodeBlock.tsx
//
// Stripe-style terminal code block. Mock-chrome with 3 dots, dark surface,
// copy button, optional language label, and CSS-only "syntax" coloring via
// <span> classes. No real highlighter — just structured tokens so the
// markup feels intentional without pulling in a heavy library.

"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { LINE, LINE_2, BG_2 } from "@/lib/theme";

type Props = {
  /** What gets copied to clipboard. */
  raw: string;
  /** Optional pre-rendered children for color-coded display. Falls back to raw. */
  children?: React.ReactNode;
  /** Small label in the top bar — "curl", "JavaScript", "Python", etc. */
  language?: string;
  /** Small filename/route label, like the browser-chrome URL bar. */
  title?: string;
};

export function CodeBlock({ raw, children, language, title }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* no-op — clipboard may be blocked by iframes / permissions */
    }
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden font-mono text-[12.5px] my-6"
      style={{
        background: `linear-gradient(180deg, ${BG_2} 0%, #07060D 100%)`,
        border: `1px solid ${LINE_2}`,
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Mac-style chrome bar */}
      <div
        className="flex items-center px-4 py-2.5 gap-3"
        style={{ background: BG_2, borderBottom: `1px solid ${LINE}` }}
      >
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
        </div>

        {title && (
          <div
            className="flex-1 min-w-0 mx-2 px-3 py-1 rounded-md text-[10.5px] flex items-center justify-center gap-1.5"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <Terminal size={11} className="opacity-70" />
            <span className="truncate">{title}</span>
          </div>
        )}

        {language && !title && (
          <span
            className="ml-auto text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {language}
          </span>
        )}

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy code"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] transition-colors hover:bg-white/[0.06]"
          style={{ color: copied ? "#4ADE80" : "rgba(255,255,255,0.55)" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <pre
        className="px-5 py-4 overflow-x-auto leading-[1.65]"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        <code>{children ?? raw}</code>
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Token primitives. Compose these inside CodeBlock children for "syntax".
   ───────────────────────────────────────────────────────────────────── */
export const Tok = {
  Kw:  ({ children }: { children: React.ReactNode }) => <span style={{ color: "#A78BFA" }}>{children}</span>,
  Str: ({ children }: { children: React.ReactNode }) => <span style={{ color: "#F7D24A" }}>{children}</span>,
  Num: ({ children }: { children: React.ReactNode }) => <span style={{ color: "#4ADE80" }}>{children}</span>,
  Fn:  ({ children }: { children: React.ReactNode }) => <span style={{ color: "#60A5FA" }}>{children}</span>,
  Cmt: ({ children }: { children: React.ReactNode }) => <span style={{ color: "rgba(255,255,255,0.35)" }}>{children}</span>,
  Op:  ({ children }: { children: React.ReactNode }) => <span style={{ color: "#F472B6" }}>{children}</span>,
  Key: ({ children }: { children: React.ReactNode }) => <span style={{ color: "#7DD3FC" }}>{children}</span>,
};
