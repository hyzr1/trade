// app/watchlist/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ArrowRight, TrendingUp, Sparkles, Users } from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { useWatchlist } from "@/lib/watchlist";
import { useToast } from "@/components/ui/Toaster";
import {
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

type PortfolioSummary = {
  slug: string;
  name: string;
  kind: "politician" | "llm";
  allTimeReturn: number | null;
  sparkPoints: number[];
};

type TickerPreview = {
  ticker: string;
  weekFilings: number;
  lastBuyer: string | null;
  lastBuyDate: string | null;
  lastAction: "buy" | "sell" | null;
};

export default function WatchlistPage() {
  const { items, add, remove, hydrated } = useWatchlist();
  const { toast } = useToast();
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary[]>([]);
  const [tickerData, setTickerData] = useState<TickerPreview[]>([]);
  const [loading, setLoading] = useState(false);

  const portfolioItems = useMemo(() => items.filter((i) => i.type === "portfolio"), [items]);
  const tickerItems = useMemo(() => items.filter((i) => i.type === "ticker"), [items]);

  // Fetch portfolio search payload once to enrich watched portfolios with returns.
  useEffect(() => {
    if (!hydrated) return;
    if (portfolioItems.length === 0 && tickerItems.length === 0) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const requests: Promise<Response>[] = [];
        if (portfolioItems.length > 0) {
          requests.push(fetch("/api/search"));
        }
        if (tickerItems.length > 0) {
          const ids = tickerItems.map((i) => i.id).join(",");
          requests.push(fetch(`/api/watchlist/preview?ids=${encodeURIComponent(ids)}`));
        }
        const responses = await Promise.all(requests);
        let idx = 0;
        if (portfolioItems.length > 0) {
          const search = await responses[idx++].json();
          // Search route only returns slug/name/kind. Pull per-portfolio detail.
          const detailFetches = portfolioItems.map((p) =>
            fetch(`/api/profile/${encodeURIComponent(p.id)}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null),
          );
          const details = await Promise.all(detailFetches);
          const meta: PortfolioSummary[] = portfolioItems.map((p, i) => {
            const fromSearch = search.portfolios?.find(
              (sp: { slug: string }) => sp.slug === p.id,
            );
            const d = details[i];
            const series: { value: number }[] = Array.isArray(d?.portfolioSeries)
              ? d.portfolioSeries
              : [];
            const allTime =
              series.length >= 2 ? series[series.length - 1].value - 100 : null;
            return {
              slug: p.id,
              name: fromSearch?.name ?? p.id,
              kind: fromSearch?.kind ?? "politician",
              allTimeReturn: allTime,
              sparkPoints: series.map((c) => c.value).slice(-60),
            };
          });
          if (!cancelled) setPortfolioData(meta);
        }
        if (tickerItems.length > 0) {
          const preview = await responses[idx++].json();
          if (!cancelled) setTickerData(preview.rows ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, portfolioItems, tickerItems]);

  if (hydrated && items.length === 0) {
    return (
      <DeskShell breadcrumb="Watchlist">
        <EmptyState
          onAdd={(type, id, label) => {
            const added = add(type, id);
            if (added) {
              toast(`${label} added to your watchlist`, {
                variant: "success",
              });
            }
          }}
        />
      </DeskShell>
    );
  }

  return (
    <DeskShell breadcrumb="Watchlist">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
            Watchlist
          </h1>
          <p className="text-[13px] mt-1" style={{ color: TEXT_MID }}>
            {items.length} item{items.length === 1 ? "" : "s"} you&apos;re tracking
            {loading && (
              <span className="ml-2 font-mono text-[11px]" style={{ color: TEXT_LOW }}>
                · loading
              </span>
            )}
          </p>
        </div>
        <Link
          href="/terminal"
          className="text-[12.5px] inline-flex items-center gap-1.5 hover:underline"
          style={{ color: VIOLET_2 }}
        >
          Browse portfolios <ArrowRight size={12} />
        </Link>
      </div>

      {portfolioItems.length > 0 && (
        <section>
          <SectionLabel>Portfolios · {portfolioItems.length}</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <AnimatePresence initial={false} mode="popLayout">
              {portfolioItems.map((item) => {
                const data = portfolioData.find((p) => p.slug === item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PortfolioCard
                      slug={item.id}
                      fallbackName={item.id}
                      data={data}
                      onUnwatch={() => remove("portfolio", item.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {tickerItems.length > 0 && (
        <section className="mt-8">
          <SectionLabel>Tickers · {tickerItems.length}</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <AnimatePresence initial={false} mode="popLayout">
              {tickerItems.map((item) => {
                const preview = tickerData.find((t) => t.ticker === item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TickerCard
                      ticker={item.id}
                      preview={preview}
                      onUnwatch={() => remove("ticker", item.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}
    </DeskShell>
  );
}

/* ───────────────────────── Cards ───────────────────────── */

function PortfolioCard({
  slug,
  fallbackName,
  data,
  onUnwatch,
}: {
  slug: string;
  fallbackName: string;
  data?: PortfolioSummary;
  onUnwatch: () => void;
}) {
  const name = data?.name ?? fallbackName.replace(/\b\w/g, (c) => c.toUpperCase());
  const ret = data?.allTimeReturn;
  const positive = (ret ?? 0) >= 0;
  return (
    <div
      className="rounded-2xl p-5 transition-colors hover:bg-white/[0.025]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/${slug}`} className="block min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{
                background: data?.kind === "llm" ? "rgba(247,210,74,0.12)" : "rgba(124,95,255,0.14)",
                color: data?.kind === "llm" ? YELLOW : VIOLET_2,
              }}
            >
              {data?.kind === "llm" ? "AI" : "POL"}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW }}
            >
              {slug}
            </span>
          </div>
          <h3 className="text-[16px] font-semibold mt-2 truncate" style={{ color: TEXT_HI }}>
            {name}
          </h3>
        </Link>
        <StarButton on onClick={onUnwatch} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            All-time
          </div>
          <div
            className="font-mono tabular-nums text-[22px] font-semibold mt-0.5"
            style={{ color: ret == null ? TEXT_MID : positive ? POSITIVE : NEGATIVE }}
          >
            {ret == null ? "—" : `${positive ? "+" : ""}${ret.toFixed(1)}%`}
          </div>
        </div>
        {data?.sparkPoints && data.sparkPoints.length >= 2 && (
          <MiniSpark points={data.sparkPoints} positive={positive} width={88} height={26} />
        )}
      </div>
    </div>
  );
}

function TickerCard({
  ticker,
  preview,
  onUnwatch,
}: {
  ticker: string;
  preview?: TickerPreview;
  onUnwatch: () => void;
}) {
  const hasRecent = (preview?.weekFilings ?? 0) > 0;
  return (
    <div
      className="rounded-2xl p-5 transition-colors hover:bg-white/[0.025]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/terminal?ticker=${ticker}`} className="block min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(240,180,41,0.10)", color: YELLOW }}
            >
              Ticker
            </span>
            {hasRecent && (
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
                style={{ background: "rgba(74,222,128,0.10)", color: POSITIVE }}
              >
                Active
              </span>
            )}
          </div>
          <h3 className="font-mono font-semibold text-[20px] mt-2 tracking-tight" style={{ color: YELLOW }}>
            {ticker}
          </h3>
        </Link>
        <StarButton on onClick={onUnwatch} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            7-day filings
          </div>
          <div className="font-mono tabular-nums text-[18px] font-semibold mt-0.5" style={{ color: TEXT_HI }}>
            {preview?.weekFilings ?? 0}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            Last buyer
          </div>
          <div className="text-[13px] mt-0.5 truncate" style={{ color: TEXT_MID }}>
            {preview?.lastBuyer ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={on ? "Unwatch" : "Watch"}
      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/[0.06]"
      style={{
        background: on ? "rgba(124,95,255,0.10)" : "transparent",
        border: `1px solid ${on ? "rgba(124,95,255,0.30)" : LINE_2}`,
        color: on ? VIOLET_2 : TEXT_MID,
      }}
    >
      <Star size={14} fill={on ? VIOLET : "transparent"} />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ color: TEXT_LOW }}
    >
      {children}
    </div>
  );
}

function MiniSpark({
  points,
  positive,
  width = 60,
  height = 18,
}: {
  points: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...points),
    max = Math.max(...points),
    range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(height - ((v - min) / range) * height).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height }} aria-hidden>
      <path d={path} fill="none" stroke={positive ? POSITIVE : NEGATIVE} strokeWidth="1.4" />
    </svg>
  );
}

const SUGGESTED_PORTFOLIOS: { slug: string; label: string; tag: string; ytd: string }[] = [
  { slug: "pelosi", label: "Nancy Pelosi", tag: "D · House", ytd: "+18.4%" },
  { slug: "hern", label: "Kevin Hern", tag: "R · House", ytd: "+11.7%" },
  { slug: "gottheimer", label: "Josh Gottheimer", tag: "D · House", ytd: "+9.2%" },
  { slug: "claude", label: "Claude", tag: "AI Mind", ytd: "+10.9%" },
];

const SUGGESTED_TICKERS: { symbol: string; filings: number }[] = [
  { symbol: "NVDA", filings: 14 },
  { symbol: "AAPL", filings: 9 },
  { symbol: "TSLA", filings: 7 },
  { symbol: "LMT", filings: 5 },
];

function EmptyState({
  onAdd,
}: {
  onAdd: (type: "portfolio" | "ticker", id: string, label: string) => void;
}) {
  return (
    <div className="min-h-[60vh] py-10 sm:py-14">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center">
          <EmptyWatchlistSVG />
          <h1 className="text-[26px] font-semibold tracking-tight mt-6" style={{ color: TEXT_HI }}>
            Nothing on watch yet
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed max-w-md mx-auto" style={{ color: TEXT_MID }}>
            Star portfolios and tickers to keep an eye on them. We&apos;ll surface recent activity, fills,
            and AI consensus shifts here.
          </p>
          <Link
            href="/terminal"
            className="mt-5 inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2 text-[13px] font-medium transition-all hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
              color: "#fff",
              boxShadow:
                "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            <TrendingUp size={14} /> Browse all portfolios
          </Link>
        </div>

        {/* Most-watched portfolios */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-3">
            <Users size={12} style={{ color: VIOLET_2 }} />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              Most-watched portfolios
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUGGESTED_PORTFOLIOS.map((p) => (
              <SuggestRow
                key={p.slug}
                title={p.label}
                subtitle={p.tag}
                rightValue={p.ytd}
                rightLabel="YTD"
                accent={VIOLET_2}
                onAdd={() => onAdd("portfolio", p.slug, p.label)}
                href={`/${p.slug}`}
              />
            ))}
          </div>
        </div>

        {/* Most-watched tickers */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={12} style={{ color: YELLOW }} />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              Most-watched tickers
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SUGGESTED_TICKERS.map((t) => (
              <SuggestTicker
                key={t.symbol}
                symbol={t.symbol}
                filings={t.filings}
                onAdd={() => onAdd("ticker", t.symbol, t.symbol)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestRow({
  title,
  subtitle,
  rightValue,
  rightLabel,
  accent,
  onAdd,
  href,
}: {
  title: string;
  subtitle: string;
  rightValue: string;
  rightLabel: string;
  accent: string;
  onAdd: () => void;
  href: string;
}) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.025]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <Link href={href} className="flex-1 min-w-0 flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 font-semibold text-[11px]"
          style={{
            background: "rgba(124,95,255,0.10)",
            border: "1px solid rgba(124,95,255,0.25)",
            color: accent,
          }}
        >
          {title
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate" style={{ color: TEXT_HI }}>
            {title}
          </div>
          <div className="text-[11px]" style={{ color: TEXT_LOW }}>
            {subtitle}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-mono tabular-nums text-[12.5px] font-semibold"
            style={{ color: POSITIVE }}
          >
            {rightValue}
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            {rightLabel}
          </div>
        </div>
      </Link>
      <QuickAddStar onClick={onAdd} />
    </div>
  );
}

function SuggestTicker({
  symbol,
  filings,
  onAdd,
}: {
  symbol: string;
  filings: number;
  onAdd: () => void;
}) {
  return (
    <div
      className="group rounded-xl p-3 transition-colors hover:bg-white/[0.025]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <Link
          href={`/ticker/${symbol}`}
          className="font-mono font-semibold text-[16px] tracking-tight"
          style={{ color: YELLOW }}
        >
          {symbol}
        </Link>
        <QuickAddStar onClick={onAdd} small />
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[10.5px]" style={{ color: TEXT_LOW }}>
        <span className="font-mono tabular-nums" style={{ color: TEXT_MID }}>
          {filings}
        </span>
        <span>filings / 30d</span>
      </div>
    </div>
  );
}

function QuickAddStar({ onClick, small }: { onClick: () => void; small?: boolean }) {
  const size = small ? 24 : 28;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label="Add to watchlist"
      className="shrink-0 inline-flex items-center justify-center rounded-full transition-all hover:bg-white/[0.06] hover:scale-105"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${LINE_2}`,
        color: TEXT_MID,
      }}
    >
      <Star size={small ? 11 : 13} />
    </button>
  );
}

function EmptyWatchlistSVG() {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" aria-hidden className="mx-auto">
      <circle cx="70" cy="64" r="44" fill="rgba(124,95,255,0.06)" stroke="rgba(124,95,255,0.20)" />
      <path
        d="M70 36 L77 56 L98 56 L81 68 L88 88 L70 76 L52 88 L59 68 L42 56 L63 56 Z"
        fill="rgba(124,95,255,0.10)"
        stroke="rgba(167,139,250,0.55)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="118" cy="28" r="3" fill="rgba(247,210,74,0.7)" />
      <circle cx="22" cy="36" r="2" fill="rgba(167,139,250,0.5)" />
      <circle cx="20" cy="92" r="2.5" fill="rgba(247,210,74,0.4)" />
      <circle cx="116" cy="100" r="2" fill="rgba(167,139,250,0.6)" />
    </svg>
  );
}
