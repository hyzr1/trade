// app/insights/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Activity,
  Telescope,
  Shuffle,
  AlertTriangle,
  Mail,
  CalendarDays,
  ChevronDown,
  Newspaper,
  Layers,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { getInsightsForCurrentWeek } from "@/lib/insights-mock";
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import {
  BG_2,
  LINE,
  LINE_2,
  NEGATIVE,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Reveal-on-scroll wrapper — used to stagger sections in as user scrolls. */
function Reveal({
  children,
  delay = 0,
  reduced,
}: {
  children: React.ReactNode;
  delay?: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.42, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function InsightsPage() {
  // The mock is deterministic per ISO week — same week, same copy.
  const insights = useMemo(() => getInsightsForCurrentWeek(), []);
  const reduced = useReducedMotion();

  return (
    <DeskShell breadcrumb="Insights">
      {/* HERO */}
      <Hero
        weekLabel={insights.weekLabel}
        filingsIndexed={insights.filingsIndexed}
        reduced={!!reduced}
      />

      {/* 3-column overview */}
      <Reveal reduced={!!reduced}>
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <OverviewCol
            icon={<Activity size={13} />}
            eyebrow="What moved the needle"
            accent={VIOLET}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <ul className="space-y-2.5">
              {insights.whatMoved.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-[1.45]">
                  <span
                    className="font-mono text-[11px] mt-[2px] tabular-nums shrink-0"
                    style={{ color: VIOLET_2 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: TEXT_MID }}>{t}</span>
                </li>
              ))}
            </ul>
          </OverviewCol>

          <OverviewCol
            icon={<Telescope size={13} />}
            eyebrow="Dissents worth watching"
            accent={YELLOW}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <ul className="space-y-3.5">
              {insights.dissents.map((d, i) => (
                <li key={i}>
                  <div
                    className="text-[12.5px] font-medium leading-tight mb-1"
                    style={{ color: TEXT_HI }}
                  >
                    {d.title}
                  </div>
                  <p className="text-[12px] leading-[1.5]" style={{ color: TEXT_MID }}>
                    {d.body}
                  </p>
                </li>
              ))}
            </ul>
          </OverviewCol>

          <OverviewCol
            icon={<Shuffle size={13} />}
            eyebrow="Sector rotation"
            accent={POSITIVE}
            className="col-span-12 lg:col-span-4"
          >
            <div className="space-y-3">
              <RotationLane label="Rotating in" tone="pos" rows={insights.rotation.incoming} />
              <div style={{ borderTop: `1px solid ${LINE}` }} />
              <RotationLane label="Rotating out" tone="neg" rows={insights.rotation.outgoing} />
            </div>
          </OverviewCol>
        </div>
      </Reveal>

      {/* Per-portfolio commentary */}
      <Reveal reduced={!!reduced}>
        <SectionHeading
          icon={<Newspaper size={13} />}
          eyebrow="Portfolio commentary"
          title="What each book did this week"
          kicker="100-word memo, deterministic from the week."
        />
        <div className="grid grid-cols-12 gap-4 lg:gap-6 mt-4">
          {insights.portfolios.map((p, i) => {
            // Vary widths — first card is featured (8 wide on lg), rest are 4 wide.
            // After that, alternate 6/6 then 4/4/4 to break the grid.
            const spans = featuredColSpan(i, insights.portfolios.length);
            return (
              <motion.div
                key={p.slug}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.32, delay: 0.04 * i, ease: EASE }}
                whileHover={reduced ? undefined : { y: -3 }}
                className={spans}
              >
                <PortfolioMemoCard memo={p} featured={i === 0} />
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      {/* Anomaly alerts */}
      <Reveal reduced={!!reduced}>
        <SectionHeading
          icon={<AlertTriangle size={13} />}
          eyebrow="Anomaly alerts"
          title="Three unusual patterns flagged this week"
          kicker={
            <>
              <AlertTriangle size={11} className="inline mr-1" style={{ color: YELLOW }} />
              Above the 2.0 cluster-detector threshold
            </>
          }
        />
        <div className="grid grid-cols-12 gap-4 lg:gap-6 mt-4">
          {insights.anomalies.map((a, i) => {
            // First anomaly tile spans 6, the rest 3 each (creates a 6/3/3 rhythm).
            const span =
              i === 0
                ? "col-span-12 md:col-span-6 lg:col-span-6"
                : "col-span-12 md:col-span-6 lg:col-span-3";
            return (
              <motion.div
                key={i}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.32, delay: 0.06 * i, ease: EASE }}
                whileHover={reduced ? undefined : { y: -3 }}
                className={span}
              >
                <AnomalyTile a={a} large={i === 0} />
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      {/* Cross-asset moves */}
      <Reveal reduced={!!reduced}>
        <SectionHeading
          icon={<Layers size={13} />}
          eyebrow="Cross-asset moves"
          title="Where filings clustered against the calendar"
          kicker="Sector × catalyst this week"
        />
        <div className="mt-4">
          <CrossAssetGrid rows={insights.crossAsset} />
        </div>
      </Reveal>

      {/* Footer CTA */}
      <Link href="/digest" className="block group">
        <motion.div
          whileHover={reduced ? undefined : { y: -2 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="rounded-2xl px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background:
              `linear-gradient(135deg, rgba(124,95,255,0.16) 0%, rgba(167,139,250,0.06) 60%, rgba(8,6,15,0.4) 100%)`,
            border: `1px solid ${LINE_2}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div
              className="font-mono text-[10.5px] uppercase tracking-[0.18em] mb-1.5"
              style={{ color: VIOLET_2 }}
            >
              <Mail size={11} className="inline mr-1.5 mb-[1px]" />
              Monday digest
            </div>
            <div className="text-[19px] sm:text-[21px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
              Get this delivered every Monday morning.
            </div>
            <div className="text-[13px] mt-1" style={{ color: TEXT_MID }}>
              Filings indexed over the weekend, summarized before market open.
            </div>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full pl-4 pr-3 py-2 text-[12.5px] font-medium shrink-0"
            style={{
              background: VIOLET,
              color: "#fff",
              boxShadow: "0 14px 36px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            Subscribe
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </motion.div>
      </Link>
    </DeskShell>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero({
  weekLabel,
  filingsIndexed,
  reduced,
}: {
  weekLabel: string;
  filingsIndexed: number;
  reduced: boolean;
}) {
  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background:
          `radial-gradient(80% 120% at 12% 0%, rgba(124,95,255,0.14) 0%, rgba(167,139,250,0.04) 38%, rgba(8,6,15,0.0) 60%)`,
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="px-6 sm:px-9 py-8 sm:py-10 relative">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div
            className="font-mono text-[10.5px] uppercase tracking-[0.22em]"
            style={{ color: VIOLET_2 }}
          >
            <Sparkles size={11} className="inline mr-1.5 mb-[1px]" />
            AI insights · weekly memo
          </div>
          <WeekPill weekLabel={weekLabel} />
        </div>
        <h1
          className="text-[26px] sm:text-[32px] lg:text-[36px] font-semibold tracking-tight leading-tight"
          style={{ color: TEXT_HI }}
        >
          <span style={{ color: TEXT_MID }}>
            {filingsIndexed.toLocaleString()}
          </span>{" "}
          <span className="font-normal" style={{ color: TEXT_MID }}>filings indexed,</span>{" "}
          <span>three patterns worth knowing.</span>
        </h1>
        <p className="text-[14px] mt-3 max-w-3xl" style={{ color: TEXT_MID }}>
          autotrade's weekly read on the Hill and the AI minds. Trends, dissents, anomalies,
          and what rotated underneath the headline number — written deterministically from
          the week's PTR record.
        </p>
      </div>

      {/* decorative gradient line */}
      <div
        className="absolute left-0 right-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${VIOLET}66 50%, transparent 100%)` }}
      />
    </motion.section>
  );
}

/** "Week of XX-YY" pill — opens a calendar picker stub on click. */
function WeekPill({ weekLabel }: { weekLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Strip the "Week of " prefix so the pill stays short.
  const short = weekLabel.replace(/^Week of\s+/, "");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-full pl-3 pr-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/[0.06]"
        style={{
          background: "rgba(124,95,255,0.10)",
          color: VIOLET_2,
          border: `1px solid rgba(124,95,255,0.28)`,
        }}
      >
        <CalendarDays size={12} />
        <span className="tabular-nums">{short}</span>
        <ChevronDown
          size={12}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: EASE }}
          className="absolute right-0 top-full mt-2 z-40 rounded-xl p-3 w-[280px]"
          style={{
            background: BG_2,
            border: `1px solid ${LINE_2}`,
            boxShadow:
              "0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="font-mono text-[9.5px] uppercase tracking-[0.18em] mb-2"
            style={{ color: TEXT_LOW }}
          >
            Browse a different week
          </div>
          <div className="space-y-1">
            {/* Previous 4 weeks stub */}
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12px] transition-colors hover:bg-white/[0.05] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ color: TEXT_MID }}
                disabled
                title="Coming soon — week archive"
              >
                <span>{n} {n === 1 ? "week" : "weeks"} ago</span>
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.16em]"
                  style={{ color: TEXT_LOW }}
                >
                  soon
                </span>
              </button>
            ))}
          </div>
          <div
            className="mt-3 pt-2.5 text-[10.5px]"
            style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
          >
            Memos are deterministic per ISO week — archive will surface previous weeks soon.
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Featured column-span helper — gives the first card width and creates rhythm. */
function featuredColSpan(idx: number, total: number): string {
  // 0 → wide, 1 + rest narrower. Drop into 6/6 pattern if 4 cards, 4/4/4 if more.
  if (total <= 3) {
    return "col-span-12 md:col-span-6 lg:col-span-4";
  }
  if (idx === 0) return "col-span-12 lg:col-span-8";
  if (idx === 1) return "col-span-12 md:col-span-6 lg:col-span-4";
  // Remaining cards: balance 6/6 for a 4-card layout, 4/4/4 for ≥5.
  if (total === 4) return "col-span-12 md:col-span-6 lg:col-span-6";
  return "col-span-12 md:col-span-6 lg:col-span-4";
}

/* ───────────────────────── Overview column ───────────────────────── */

function OverviewCol({
  icon,
  eyebrow,
  accent,
  className,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  accent: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: LINE }}
      >
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
          {eyebrow}
        </span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function RotationLane({
  label,
  tone,
  rows,
}: {
  label: string;
  tone: "pos" | "neg";
  rows: { name: string; delta: string }[];
}) {
  const accent = tone === "pos" ? POSITIVE : NEGATIVE;
  return (
    <div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2"
        style={{ color: TEXT_LOW }}
      >
        {label}
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li
            key={r.name}
            className="flex items-center justify-between text-[12.5px] tabular-nums"
          >
            <span style={{ color: TEXT_HI }}>{r.name}</span>
            <span className="font-mono" style={{ color: accent }}>
              {r.delta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── Portfolio memo ───────────────────────── */

function PortfolioMemoCard({
  memo,
  featured = false,
}: {
  memo: ReturnType<typeof getInsightsForCurrentWeek>["portfolios"][number];
  featured?: boolean;
}) {
  return (
    <Link
      href={`/${memo.slug}`}
      className="block rounded-2xl group h-full transition-shadow"
      style={{
        background: featured
          ? `linear-gradient(135deg, rgba(124,95,255,0.10) 0%, rgba(167,139,250,0.04) 55%, rgba(8,6,15,0.0) 100%)`
          : "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${featured ? "rgba(124,95,255,0.25)" : LINE_2}`,
        boxShadow: featured
          ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 22px 60px -28px rgba(124,95,255,0.45)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className={`${featured ? "px-7 py-6" : "px-5 py-4"} h-full flex flex-col`}>
        {featured && (
          <div
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] mb-2 inline-flex items-center gap-1.5 self-start"
            style={{
              color: VIOLET_2,
              background: "rgba(124,95,255,0.10)",
              border: `1px solid rgba(124,95,255,0.30)`,
              borderRadius: 9999,
              padding: "2px 8px",
            }}
          >
            <Sparkles size={10} />
            Featured this week
          </div>
        )}
        <div className="flex items-baseline justify-between mb-1 gap-2">
          <div
            className={`${featured ? "text-[18px]" : "text-[15px]"} font-semibold tracking-tight group-hover:underline`}
            style={{ color: TEXT_HI }}
          >
            {memo.name}
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: TEXT_LOW }}
          >
            {memo.label}
          </div>
        </div>
        <p
          className={`${featured ? "text-[13.5px]" : "text-[12.5px]"} leading-[1.55] mt-1.5`}
          style={{ color: TEXT_MID }}
        >
          {memo.paragraph}
        </p>
        <div
          className="grid grid-cols-3 gap-2 mt-4 pt-4"
          style={{ borderTop: `1px solid ${LINE}` }}
        >
          {memo.stats.map((s) => {
            const tone =
              s.positive == null ? TEXT_HI : s.positive ? POSITIVE : NEGATIVE;
            return (
              <div key={s.label}>
                <div
                  className="font-mono text-[9.5px] uppercase tracking-[0.16em]"
                  style={{ color: TEXT_LOW }}
                >
                  {s.label}
                </div>
                <div
                  className={`font-mono ${featured ? "text-[16px]" : "text-[14px]"} tabular-nums mt-0.5`}
                  style={{ color: tone }}
                >
                  {s.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── Anomaly tile ───────────────────────── */

function AnomalyTile({
  a,
  large = false,
}: {
  a: ReturnType<typeof getInsightsForCurrentWeek>["anomalies"][number];
  large?: boolean;
}) {
  return (
    <article
      className="rounded-2xl h-full overflow-hidden flex flex-col"
      style={{
        background: large
          ? `linear-gradient(135deg, rgba(247,210,74,0.10) 0%, rgba(247,210,74,0.02) 60%, rgba(8,6,15,0.0) 100%)`
          : "linear-gradient(180deg, rgba(247,210,74,0.06) 0%, rgba(247,210,74,0.01) 100%)",
        border: `1px solid ${large ? "rgba(247,210,74,0.30)" : LINE_2}`,
        boxShadow: large
          ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 22px 60px -28px rgba(247,210,74,0.30)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className={`${large ? "px-6 pt-5 pb-3" : "px-5 pt-4 pb-3"} flex items-center justify-between`}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ background: `${YELLOW}18`, color: YELLOW, border: `1px solid ${YELLOW}40` }}
        >
          {a.kind}
        </span>
        <span
          className="font-mono text-[10.5px] tabular-nums"
          style={{ color: TEXT_MID }}
        >
          score {a.score.toFixed(1)}
        </span>
      </div>
      <div className={`${large ? "px-6 pb-6" : "px-5 pb-5"} flex-1 flex flex-col`}>
        <div className="flex items-start gap-3">
          <span
            className={`${large ? "text-[28px]" : "text-[20px]"} leading-none mt-0.5`}
            style={{ color: YELLOW }}
            aria-hidden
          >
            {a.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div
              className={`${large ? "text-[18px]" : "text-[14.5px]"} font-semibold leading-tight`}
              style={{ color: TEXT_HI }}
            >
              {a.headline}
            </div>
            <p
              className={`${large ? "text-[13.5px]" : "text-[12.5px]"} leading-[1.5] mt-1.5`}
              style={{ color: TEXT_MID }}
            >
              {a.body}
            </p>
          </div>
        </div>
        <div
          className="mt-4 pt-3 font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
        >
          {a.tag}
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────── Cross-asset ───────────────────────── */

function CrossAssetGrid({
  rows,
}: {
  rows: ReturnType<typeof getInsightsForCurrentWeek>["crossAsset"];
}) {
  const maxFilings = Math.max(1, ...rows.map((r) => r.filings));
  return (
    <section
      className="rounded-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="grid grid-cols-12 gap-px" style={{ background: LINE }}>
        {rows.map((r) => {
          const sectorColor = SECTOR_COLORS[r.sector as Sector] ?? VIOLET;
          const widthPct = (r.filings / maxFilings) * 100;
          const netPos = r.netBuy >= 0;
          return (
            <Link
              key={r.sector}
              href={`/sector/${r.sector}`}
              className="col-span-12 sm:col-span-6 lg:col-span-4 group px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{ background: "rgba(8,6,15,0.4)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: sectorColor }}
                  />
                  <span
                    className="text-[13px] font-medium group-hover:underline"
                    style={{ color: TEXT_HI }}
                  >
                    {r.sector}
                  </span>
                </div>
                <span
                  className="font-mono text-[10.5px] tabular-nums"
                  style={{ color: TEXT_MID }}
                >
                  {r.filings} filings
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ background: sectorColor, width: `${widthPct}%`, opacity: 0.7 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: TEXT_LOW }}
                >
                  anchored to {r.anchor}
                </span>
                <span
                  className="font-mono text-[10.5px] tabular-nums"
                  style={{ color: netPos ? POSITIVE : NEGATIVE }}
                >
                  {netPos ? "+" : ""}
                  {(r.netBuy * 100).toFixed(0)}% net
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── Section heading ───────────────────────── */

function SectionHeading({
  icon,
  eyebrow,
  title,
  kicker,
}: {
  icon?: React.ReactNode;
  eyebrow: string;
  title: string;
  kicker?: React.ReactNode;
}) {
  return (
    <div className="mt-2 mb-1">
      <div
        className="font-mono text-[10px] uppercase tracking-[0.22em] mb-1.5 inline-flex items-center gap-1.5"
        style={{ color: VIOLET_2 }}
      >
        {icon}
        {eyebrow}
      </div>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2
          className="text-[20px] sm:text-[22px] font-semibold tracking-tight"
          style={{ color: TEXT_HI }}
        >
          {title}
        </h2>
        {kicker && (
          <div className="text-[12px]" style={{ color: TEXT_LOW }}>
            {kicker}
          </div>
        )}
      </div>
    </div>
  );
}
