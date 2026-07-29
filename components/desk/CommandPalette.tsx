// components/desk/CommandPalette.tsx
"use client";
import { Command } from "cmdk";
import {
  Bell,
  BookOpen,
  Bookmark,
  Brain,
  CalendarDays,
  CreditCard,
  GitCompareArrows,
  Home,
  LineChart,
  Mail,
  MessageSquare,
  Radar as RadarIcon,
  Receipt,
  Search,
  Settings,
  Star,
  Telescope,
  TrendingUp,
  Users,
} from "lucide-react";
// TrendingUp already imported above; used in Markets group.
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
} from "@/lib/theme";
import { filtersToQueryString, summarizeFilters, useSavedSearches } from "@/lib/saved-searches";

type PortfolioRow = { slug: string; name: string; kind: "politician" | "llm" };
type TickerRow = { ticker: string; count: number };
type FilingRow = {
  id: string;
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
  portfolioSlug: string | null;
  portfolioName: string;
};
type SearchPayload = {
  portfolios: PortfolioRow[];
  tickers: TickerRow[];
  recentFilings: FilingRow[];
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PAGES: { label: string; href: string; icon: React.ComponentType<{ size?: number }>; hint?: string }[] = [
  { label: "Desk", href: "/terminal", icon: Home, hint: "Live terminal" },
  { label: "Insights", href: "/insights", icon: Telescope, hint: "Weekly AI memo" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, hint: "Filings by day" },
  { label: "Ask", href: "/chat", icon: MessageSquare, hint: "AI research assistant" },
  { label: "Compare", href: "/compare", icon: GitCompareArrows, hint: "Two portfolios head to head" },
  { label: "Backtest", href: "/backtest", icon: LineChart, hint: "Simulate copy-trading" },
  { label: "Radar", href: "/radar", icon: RadarIcon, hint: "Insider sector radar" },
  { label: "Watchlist", href: "/watchlist", icon: Star, hint: "Saved tickers & portfolios" },
  { label: "Alerts", href: "/alerts", icon: Bell, hint: "Rules & notifications" },
  { label: "Saved searches", href: "/saved", icon: Bookmark, hint: "Saved firehose filters" },
  { label: "Daily digest", href: "/digest", icon: Mail, hint: "Preview tomorrow's email" },
  { label: "Settings", href: "/settings", icon: Settings, hint: "Profile, billing, API" },
  { label: "About", href: "/about", icon: BookOpen },
  { label: "Pricing", href: "/#pricing", icon: CreditCard },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
];

// Quick links to trending ticker / sector deep-dives.
const MARKETS: { label: string; href: string; icon: React.ComponentType<{ size?: number }>; hint: string }[] = [
  { label: "NVDA", href: "/ticker/NVDA", icon: TrendingUp, hint: "NVIDIA · ticker" },
  { label: "MSFT", href: "/ticker/MSFT", icon: TrendingUp, hint: "Microsoft · ticker" },
  { label: "AAPL", href: "/ticker/AAPL", icon: TrendingUp, hint: "Apple · ticker" },
  { label: "LMT",  href: "/ticker/LMT",  icon: TrendingUp, hint: "Lockheed Martin · ticker" },
  { label: "Tech sector",    href: "/sector/Tech",    icon: TrendingUp, hint: "Sector deep-dive" },
  { label: "Defense sector", href: "/sector/Defense", icon: TrendingUp, hint: "Sector deep-dive" },
  { label: "Healthcare sector", href: "/sector/Healthcare", icon: TrendingUp, hint: "Sector deep-dive" },
  { label: "Energy sector", href: "/sector/Energy", icon: TrendingUp, hint: "Sector deep-dive" },
];

function fmtDate(iso: string): string {
  // Accepts YYYY-MM-DD or ISO timestamp.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [data, setData] = useState<SearchPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const { items: savedSearches } = useSavedSearches();

  // Global Cmd+K / Ctrl+K toggle. Works even if the trigger button isn't visible.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Fetch payload on first open, cache afterwards.
  useEffect(() => {
    if (!open || data || loading) return;
    setLoading(true);
    fetch("/api/search")
      .then((r) => r.json())
      .then((j: SearchPayload) => setData(j))
      .catch(() => setData({ portfolios: [], tickers: [], recentFilings: [] }))
      .finally(() => setLoading(false));
  }, [open, data, loading]);

  // Reset query when closing.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange],
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global search"
      shouldFilter={true}
      className="cmdk-root"
    >
      <style jsx global>{`
        [cmdk-overlay] {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(4, 2, 10, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: cmdkOverlayIn 140ms ease-out;
        }
        [cmdk-dialog] {
          position: fixed;
          top: 18vh;
          left: 50%;
          z-index: 61;
          width: min(600px, calc(100vw - 32px));
          transform: translateX(-50%);
          animation: cmdkDialogIn 180ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes cmdkOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdkDialogIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.985); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        [cmdk-list] {
          max-height: 420px;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-padding: 8px 0;
          padding: 6px;
        }
        [cmdk-list]::-webkit-scrollbar { width: 8px; }
        [cmdk-list]::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
        [cmdk-group-heading] {
          padding: 12px 12px 6px;
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: ${TEXT_LOW};
        }
        [cmdk-item] {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: ${TEXT_MID};
          transition: background 110ms ease, color 110ms ease;
          user-select: none;
        }
        [cmdk-item]:hover {
          background: rgba(255, 255, 255, 0.035);
          color: ${TEXT_HI};
        }
        [cmdk-item][data-selected="true"] {
          background: rgba(124, 95, 255, 0.18);
          color: ${TEXT_HI};
        }
        [cmdk-item][data-selected="true"]::before {
          content: "";
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 2px;
          border-radius: 0 2px 2px 0;
          background: ${VIOLET};
        }
        [cmdk-empty] {
          padding: 28px 16px;
          text-align: center;
          font-size: 13px;
          color: ${TEXT_LOW};
        }
      `}</style>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: BG_2,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${LINE_2}`,
          boxShadow:
            "0 60px 160px -30px rgba(0,0,0,0.85), 0 20px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 h-12"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <Search size={15} color={TEXT_LOW} />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search portfolios, tickers, filings, pages…"
            aria-label="Search portfolios, tickers, filings, and pages"
            className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:opacity-50"
            style={{ color: TEXT_HI }}
          />
          <Kbd>esc</Kbd>
        </div>

        {/* Results */}
        <Command.List>
          <Command.Empty>
            {loading ? "Loading…" : `No results found${query ? ` for "${query}"` : ""}`}
          </Command.Empty>

          <Command.Group heading="Navigation">
            {PAGES.map((p) => (
              <Command.Item
                key={p.href}
                value={`page ${p.label} ${p.href}`}
                onSelect={() => go(p.href)}
              >
                <IconWrap><p.icon size={14} /></IconWrap>
                <span className="flex-1 truncate">{p.label}</span>
                {p.hint && (
                  <span className="text-[11px]" style={{ color: TEXT_LOW }}>
                    {p.hint}
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Markets">
            {MARKETS.map((m) => (
              <Command.Item
                key={m.href}
                value={`market ${m.label} ${m.href}`}
                onSelect={() => go(m.href)}
              >
                <IconWrap><m.icon size={14} /></IconWrap>
                <span className="flex-1 truncate">{m.label}</span>
                <span className="text-[11px]" style={{ color: TEXT_LOW }}>
                  {m.hint}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          {savedSearches.length > 0 && (
            <Command.Group heading="Saved searches">
              {savedSearches.slice(0, 6).map((s) => {
                const qs = filtersToQueryString(s.filters);
                const href = qs ? `/terminal?${qs}#firehose` : "/terminal#firehose";
                return (
                  <Command.Item
                    key={s.id}
                    value={`saved ${s.name} ${summarizeFilters(s.filters)}`}
                    onSelect={() => go(href)}
                  >
                    <IconWrap><Bookmark size={14} /></IconWrap>
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-[11px] truncate max-w-[160px]" style={{ color: TEXT_LOW }}>
                      {summarizeFilters(s.filters)}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {data && data.portfolios.length > 0 && (
            <Command.Group heading="Portfolios">
              {data.portfolios.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`portfolio ${p.name} ${p.slug} ${p.kind}`}
                  onSelect={() => go(`/${p.slug}`)}
                >
                  <IconWrap>
                    {p.kind === "llm" ? <Brain size={14} /> : <Users size={14} />}
                  </IconWrap>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: TEXT_LOW }}
                  >
                    {p.kind}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data && data.recentFilings.length > 0 && (
            <Command.Group heading="Recent filings">
              {data.recentFilings.map((f) => (
                <Command.Item
                  key={f.id}
                  value={`filing ${f.portfolioName} ${f.action} ${f.ticker}`}
                  onSelect={() => f.portfolioSlug && go(`/${f.portfolioSlug}`)}
                >
                  <IconWrap><Receipt size={14} /></IconWrap>
                  <span className="flex-1 truncate text-[12.5px]">
                    <span style={{ color: TEXT_HI }}>{f.portfolioName}</span>
                    <span style={{ color: TEXT_LOW }}> · </span>
                    <ActionChip action={f.action} />
                    <span style={{ color: TEXT_LOW }}> · </span>
                    <span className="font-mono" style={{ color: TEXT_MID }}>{f.ticker}</span>
                    <span style={{ color: TEXT_LOW }}> · </span>
                    <span style={{ color: TEXT_LOW }}>{fmtDate(f.tradeDate)}</span>
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data && data.tickers.length > 0 && (
            <Command.Group heading="Tickers">
              {data.tickers.map((t) => (
                <Command.Item
                  key={t.ticker}
                  value={`ticker ${t.ticker}`}
                  onSelect={() => go(`/terminal?ticker=${t.ticker}`)}
                >
                  <IconWrap><TrendingUp size={14} /></IconWrap>
                  <span className="flex-1 truncate font-mono text-[12.5px]" style={{ color: TEXT_HI }}>
                    {t.ticker}
                  </span>
                  <span
                    className="font-mono text-[10.5px] tabular-nums"
                    style={{ color: TEXT_LOW }}
                  >
                    {t.count} filings
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 h-9"
          style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
        >
          <div className="flex items-center gap-3 text-[10.5px] font-mono uppercase tracking-[0.16em]">
            <span className="flex items-center gap-1.5"><Kbd>↑↓</Kbd> navigate</span>
            <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> select</span>
            <span className="flex items-center gap-1.5"><Kbd>esc</Kbd> close</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em]">
            autotrade
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${LINE_2}`,
        color: TEXT_MID,
      }}
    >
      {children}
    </span>
  );
}

function ActionChip({ action }: { action: "buy" | "sell" }) {
  const isBuy = action === "buy";
  return (
    <span
      className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1 py-[1px] rounded-sm"
      style={{
        background: isBuy ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
        color: isBuy ? POSITIVE : NEGATIVE,
      }}
    >
      {action}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${LINE_2}`,
        color: TEXT_LOW,
      }}
    >
      {children}
    </span>
  );
}
