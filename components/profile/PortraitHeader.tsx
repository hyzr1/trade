// components/profile/PortraitHeader.tsx
"use client";
import Link from "next/link";
import { LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, VIOLET_GRAD, VIOLET_GLOW } from "@/lib/theme";
import { initialsFor } from "@/lib/format";
import type { ProfileData } from "@/lib/queries";
import { CountUp } from "@/components/ui/CountUp";
import { ShareButton } from "@/components/profile/ShareButton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { useToast } from "@/components/ui/Toaster";

export function PortraitHeader({ d }: { d: ProfileData }) {
  const isLlm = d.kind === "llm";
  const { toast } = useToast();
  const onCopyPortfolio = () => {
    toast(`You're on the waitlist for ${d.name}`, {
      variant: "success",
      description: "We'll email you when copy-trading goes live (Q3 2026).",
    });
  };
  return (
    <section
      className="rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-5 sm:gap-6 items-start"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-2xl w-[72px] h-[72px] sm:w-[96px] sm:h-[96px]"
        style={{
          background: isLlm
            ? "linear-gradient(135deg, rgba(124,95,255,0.25), rgba(79,57,216,0.15))"
            : "linear-gradient(135deg, rgba(247,210,74,0.15), rgba(229,189,47,0.05))",
          border: `1px solid ${LINE_2}`,
        }}
      >
        <span className="font-semibold text-[28px] sm:text-[34px] tracking-tight" style={{ color: TEXT_HI }}>
          {initialsFor(d.name)}
        </span>
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-semibold tracking-[-0.02em] leading-tight" style={{ color: TEXT_HI }}>
            {d.name}
          </h1>
          {d.meta.party && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: d.meta.party === "D" ? "#60A5FA" : "#F87171", border: `1px solid ${LINE_2}` }}
            >
              {d.meta.party}
            </span>
          )}
          {d.meta.house && (
            <span
              className="font-mono text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: TEXT_MID, border: `1px solid ${LINE_2}` }}
            >
              {d.meta.house}
            </span>
          )}
        </div>
        <div className="mt-1 text-[13px]" style={{ color: TEXT_MID }}>
          {[d.meta.role, d.meta.district, d.meta.termCount && `${d.meta.termCount}th term`, d.meta.modelId]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <p className="mt-4 text-[13.5px] leading-relaxed max-w-3xl" style={{ color: TEXT_MID }}>
          {d.blurb}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[12px]" style={{ color: TEXT_MID }}>
          {d.meta.estAUM && <span><span style={{ color: TEXT_LOW }}>AUM</span> <span style={{ color: TEXT_HI }}>{d.meta.estAUM}</span></span>}
          <span>
            <span style={{ color: TEXT_LOW }}>Holdings</span>{" "}
            <span style={{ color: TEXT_HI }}>
              <CountUp value={d.holdings.length} format={(v) => Math.round(v).toString()} duration={0.55} />
            </span>
          </span>
          <span>
            <span style={{ color: TEXT_LOW }}>Filings YTD</span>{" "}
            <span style={{ color: TEXT_HI }}>
              <CountUp value={d.transactions.length} format={(v) => Math.round(v).toString()} duration={0.6} />
            </span>
          </span>
          {d.transactions[0] && (
            <span>
              <span style={{ color: TEXT_LOW }}>Last filing</span>{" "}
              <span style={{ color: TEXT_HI }}>{d.transactions[0].disclosedDate}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0 w-full lg:w-auto items-center lg:items-end">
        <div className="lg:mb-1 flex items-center gap-3 lg:flex-col lg:items-end">
          <ScoreBadge score={d.score} size="lg" />
          <div className="lg:hidden text-[11px]" style={{ color: TEXT_LOW }}>
            <span className="font-mono uppercase tracking-[0.14em]">Score</span>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onCopyPortfolio}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium select-none transition-transform active:scale-[0.99] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            style={{ background: VIOLET_GRAD, color: "#fff", boxShadow: VIOLET_GLOW, minHeight: 44 }}
          >
            Join the waitlist →
          </button>
          <ShareButton
            slug={d.slug}
            title={d.name}
            tagline={
              d.meta.estAUM
                ? `Just saw ${d.name}'s portfolio on @autotrade — ${d.meta.estAUM} AUM${
                    d.ytdReturn != null
                      ? `, ${d.ytdReturn >= 0 ? "+" : ""}${d.ytdReturn.toFixed(1)}% YTD`
                      : ""
                  }.`
                : undefined
            }
            compact
          />
        </div>
        {d.transactions[0]?.sourceUrl && (
          <Link
            href={d.transactions[0].sourceUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] select-none active:scale-[0.99]"
            style={{ background: "rgba(255,255,255,0.05)", color: TEXT_HI, border: `1px solid ${LINE_2}`, minHeight: 44 }}
          >
            View source filing →
          </Link>
        )}
      </div>
    </section>
  );
}
