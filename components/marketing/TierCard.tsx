// components/marketing/TierCard.tsx
// Pricing tier card with a subtle hover lift. Extracted from
// app/pricing/page.tsx so we can keep the page server-rendered while
// the per-card motion lives on the client.
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BG,
  LINE,
  LINE_2,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_DEEP,
  VIOLET_GRAD,
  YELLOW,
} from "@/lib/theme";

export type Tier = {
  name: string;
  price: string;
  cadence: string;
  tag: string;
  featured: boolean;
  perks: string[];
  cta: { label: string; href: string };
};

export function TierCard({ tier: t }: { tier: Tier }) {
  return (
    <motion.article
      className="relative flex flex-col rounded-2xl p-7"
      style={
        t.featured
          ? {
              background: VIOLET_GRAD,
              border: `1px solid ${VIOLET}`,
              boxShadow: `0 50px 110px -30px ${VIOLET}99, 0 20px 50px -16px ${VIOLET}66, inset 0 1px 0 rgba(255,255,255,0.18)`,
            }
          : {
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${LINE}`,
            }
      }
      whileHover={
        t.featured
          ? {
              y: -2,
              boxShadow: `0 60px 130px -30px ${VIOLET}AA, 0 24px 60px -14px ${VIOLET}77, inset 0 1px 0 rgba(255,255,255,0.20)`,
            }
          : {
              y: -2,
              borderColor: "rgba(167,139,250,0.30)",
              boxShadow: "0 8px 32px -8px rgba(124,95,255,0.25)",
            }
      }
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {t.featured && (
        <>
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)",
              }}
            />
          </div>
          <div
            className="absolute -top-3 left-7 inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm z-10"
            style={{ background: YELLOW, color: BG, boxShadow: `0 10px 24px -8px ${YELLOW}99` }}
          >
            Most subscribed
          </div>
        </>
      )}

      <div className="relative flex items-baseline justify-between">
        <div className="text-[24px] font-semibold tracking-tight" style={{ color: "#fff" }}>
          {t.name}
        </div>
        <div
          className="text-[10.5px] font-mono uppercase tracking-[0.18em]"
          style={{ color: t.featured ? "rgba(255,255,255,0.7)" : TEXT_LOW }}
        >
          Tier
        </div>
      </div>

      <div className="relative mt-6 flex items-baseline gap-2">
        <span
          className="text-[56px] leading-none font-semibold tabular-nums tracking-[-0.03em]"
          style={{ color: "#fff" }}
        >
          {t.price}
        </span>
        <span
          className="text-[12px]"
          style={{ color: t.featured ? "rgba(255,255,255,0.75)" : TEXT_MID }}
        >
          {t.cadence}
        </span>
      </div>

      <p
        className="relative mt-3 text-[13px]"
        style={{ color: t.featured ? "rgba(255,255,255,0.85)" : TEXT_MID }}
      >
        {t.tag}
      </p>

      <ul className="relative mt-7 space-y-2.5 text-[13.5px] flex-1">
        {t.perks.map((p) => (
          <li
            key={p}
            className="flex items-start gap-2.5"
            style={{ color: t.featured ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)" }}
          >
            <span
              className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: t.featured ? YELLOW : TEXT_LOW }}
            />
            <span className="leading-snug">{p}</span>
          </li>
        ))}
      </ul>

      <Link
        href={t.cta.href}
        className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-medium transition-colors"
        style={
          t.featured
            ? {
                background: "#FFFFFF",
                color: VIOLET_DEEP,
                boxShadow: "0 14px 36px -12px rgba(0,0,0,0.45)",
              }
            : {
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                border: `1px solid ${LINE_2}`,
              }
        }
      >
        {t.cta.label} <span aria-hidden>→</span>
      </Link>
    </motion.article>
  );
}
