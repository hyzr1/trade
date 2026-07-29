// components/desk/FilingsFirehose.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { BookmarkPlus, Check, Inbox, X } from "lucide-react";
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, POSITIVE, NEGATIVE, YELLOW, VIOLET, VIOLET_2 } from "@/lib/theme";
import type { FirehoseRow } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { useSavedSearches, type SavedSearchFilters } from "@/lib/saved-searches";
import { useToast } from "@/components/ui/Toaster";
import { FilingRowActions } from "@/components/desk/FilingRowActions";

type Filter = "all" | "buys" | "sells" | "D" | "R";

/** Internal row that tracks when it became "new" so we can flash + show "Just now". */
type LiveRow = FirehoseRow & {
  /** Epoch ms when this row was injected as a "new" arrival. null = original. */
  justArrivedAt: number | null;
};

const FLASH_MS = 5000;

export function FilingsFirehose({ rows }: { rows: FirehoseRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();
  const { save } = useSavedSearches();
  const { toast } = useToast();

  // ── Seed filter + query from URL ────────────────────────────────────────
  const urlSide = searchParams?.get("side");
  const urlQ = searchParams?.get("q");
  const urlTicker = searchParams?.get("ticker");
  const initialFilter: Filter =
    urlSide === "buys" || urlSide === "sells" || urlSide === "D" || urlSide === "R"
      ? urlSide
      : "all";
  const initialQuery = urlTicker ?? urlQ ?? "";

  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState(initialQuery);
  const [saveOpen, setSaveOpen] = useState(false);

  // When URL changes (saved-search deep-link), update local state.
  useEffect(() => {
    setFilter(initialFilter);
    setQuery(initialQuery);
    // We intentionally key off the raw URL values, not the derived ones,
    // so this fires when /terminal?ticker=… changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSide, urlQ, urlTicker]);

  // ── Live pulse state ──────────────────────────────────────────────────────
  // We seed from the server-provided rows but layer a "live" arrival cursor on
  // top. Every ~12-30s we pick one of the source rows, clone it with a fresh
  // disclosedDate of now, and prepend it. Existing rows shift down via layout.
  const [liveRows, setLiveRows] = useState<LiveRow[]>(() =>
    rows.map((r) => ({ ...r, justArrivedAt: null })),
  );
  // Live counter: "12 filings in the last hour"
  const [liveCount, setLiveCount] = useState<number>(() => {
    const oneHourAgo = Date.now() - 60 * 60_000;
    const real = rows.filter((r) => {
      const t = new Date(r.disclosedDate).getTime();
      return Number.isFinite(t) && t >= oneHourAgo;
    }).length;
    return real > 0 ? real : 9;
  });

  useEffect(() => {
    setLiveRows(rows.map((r) => ({ ...r, justArrivedAt: null })));
  }, [rows]);

  useEffect(() => {
    if (reduced || rows.length === 0) return;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const source = rows[Math.floor(Math.random() * rows.length)];
      if (!source) return;
      const now = Date.now();
      const fresh: LiveRow = {
        ...source,
        txId: `${source.txId}::live::${now}`,
        disclosedDate: new Date(now).toISOString(),
        justArrivedAt: now,
      };
      setLiveRows((prev) => {
        const next = [fresh, ...prev];
        return next.slice(0, 300);
      });
      setLiveCount((c) => c + 1);
    };

    const first = setTimeout(tick, 2200 + Math.random() * 1800);
    let interval: ReturnType<typeof setInterval>;
    const startSteady = setTimeout(() => {
      if (stopped) return;
      const step = () => {
        tick();
        interval = setTimeout(step, 12_000 + Math.random() * 18_000) as unknown as ReturnType<typeof setInterval>;
      };
      interval = setTimeout(step, 12_000 + Math.random() * 18_000) as unknown as ReturnType<typeof setInterval>;
    }, 3000);

    return () => {
      stopped = true;
      clearTimeout(first);
      clearTimeout(startSteady);
      clearTimeout(interval as unknown as number);
    };
  }, [rows, reduced]);

  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - FLASH_MS;
      setLiveRows((prev) => {
        let touched = false;
        const next = prev.map((r) => {
          if (r.justArrivedAt && r.justArrivedAt < cutoff) {
            touched = true;
            return { ...r, justArrivedAt: null };
          }
          return r;
        });
        return touched ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return liveRows.filter((r) => {
      if (filter === "buys" && r.action !== "buy") return false;
      if (filter === "sells" && r.action !== "sell") return false;
      if (filter === "D" && r.party !== "D") return false;
      if (filter === "R" && r.party !== "R") return false;
      if (query && !r.ticker.toLowerCase().includes(query.toLowerCase()) &&
                   !r.portfolioName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [liveRows, filter, query]);

  const visible = filtered.slice(0, 30);
  const hasActiveFilter = filter !== "all" || query.length > 0;

  // Current filter snapshot — what gets saved.
  const currentFilters: SavedSearchFilters = useMemo(() => {
    const f: SavedSearchFilters = {};
    if (filter !== "all") f.side = filter;
    if (query) {
      // Heuristic: 5 chars or fewer all-caps treat as ticker shortcut.
      if (/^[A-Z]{1,5}$/.test(query)) f.ticker = query;
      else f.q = query;
    }
    return f;
  }, [filter, query]);

  return (
    <section
      id="firehose"
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Filings firehose</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ background: `${YELLOW}15`, color: YELLOW, border: `1px solid ${YELLOW}40` }}
          >
            <span className="w-1 h-1 rounded-full pulse-dot" style={{ background: YELLOW }} />
            live
          </span>
          <LiveCounter count={liveCount} />
        </div>
        <div className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>
          {filtered.length} of {liveRows.length}
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b flex-wrap"
        style={{ borderColor: LINE }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "buys", "sells", "D", "R"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors select-none"
              style={{
                background: filter === f ? "#fff" : "transparent",
                color: filter === f ? "#000" : TEXT_MID,
                border: `1px solid ${filter === f ? "transparent" : LINE_2}`,
              }}
            >
              {f}
            </button>
          ))}
          {hasActiveFilter && (
            <button
              onClick={() => setSaveOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors select-none"
              style={{
                background: "rgba(124,95,255,0.14)",
                color: VIOLET_2,
                border: `1px solid rgba(124,95,255,0.30)`,
              }}
            >
              <BookmarkPlus size={11} /> Save search
            </button>
          )}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ticker or member…"
          className="w-36 sm:w-64 shrink-0 bg-transparent border rounded-full px-3 py-1 text-[11.5px] outline-none"
          style={{ borderColor: LINE_2, color: TEXT_HI }}
        />
      </div>

      <div
        className="flex items-center gap-3 px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] border-b"
        style={{ background: "rgba(255,255,255,0.02)", color: TEXT_LOW, borderColor: LINE }}
      >
        <div className="w-[58px] sm:w-[68px] shrink-0">Time</div>
        <div className="flex-1 min-w-0">Member</div>
        <div className="hidden sm:block w-28 shrink-0 text-right">Bracket</div>
        <div className="w-12 shrink-0">Side</div>
        <div className="w-16 sm:w-20 shrink-0 text-right">Ticker</div>
        <div className="hidden sm:block w-[88px] shrink-0 text-right">Src</div>
      </div>

      <LayoutGroup>
        <div className="overflow-y-auto" style={{ maxHeight: 540 }}>
          <AnimatePresence initial={false}>
            {visible.map((r, i) => (
              <FirehoseLiveRow
                key={r.txId}
                row={r}
                isLast={i === visible.length - 1}
                router={router}
                reduced={!!reduced}
              />
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <EmptyState
              icon={<Inbox size={18} />}
              headline="No filings match"
              body="Try clearing the side filter or widening your ticker query."
              cta={
                filter !== "all" || query
                  ? {
                      label: "Clear filters",
                      onClick: () => {
                        setFilter("all");
                        setQuery("");
                      },
                    }
                  : undefined
              }
              compact
            />
          )}
        </div>
      </LayoutGroup>

      {saveOpen && (
        <SaveSearchModal
          filters={currentFilters}
          onClose={() => setSaveOpen(false)}
          onSave={(name) => {
            const entry = save(name, currentFilters);
            toast(`Saved “${entry.name}”`, {
              variant: "success",
              description: "Open from sidebar · /saved",
            });
            setSaveOpen(false);
          }}
        />
      )}
    </section>
  );
}

/* ───────────────────────── Save search modal ───────────────────────── */

function SaveSearchModal({
  filters,
  onClose,
  onSave,
}: {
  filters: SavedSearchFilters;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  // Suggest a sensible default name from the filter snapshot.
  const defaultName = useMemo(() => {
    const bits: string[] = [];
    if (filters.side === "buys") bits.push("Buys");
    else if (filters.side === "sells") bits.push("Sells");
    else if (filters.side === "D") bits.push("Dem");
    else if (filters.side === "R") bits.push("GOP");
    if (filters.ticker) bits.push(filters.ticker);
    if (filters.sector) bits.push(filters.sector);
    if (filters.q && !filters.ticker) bits.push(`“${filters.q}”`);
    return bits.length === 0 ? "Search" : bits.join(" · ");
  }, [filters]);
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(4,2,10,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "rgba(14,11,26,0.98)",
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 60px 160px -30px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-md"
              style={{
                background: "rgba(124,95,255,0.18)",
                color: VIOLET_2,
              }}
            >
              <BookmarkPlus size={13} />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold" style={{ color: TEXT_HI }}>
                Save this search
              </div>
              <div className="text-[11.5px]" style={{ color: TEXT_LOW }}>
                One click to re-run it from the sidebar
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5"
            style={{ color: TEXT_LOW }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-5">
          <label
            className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2 block"
            style={{ color: TEXT_LOW }}
          >
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim().length > 0) onSave(name.trim());
            }}
            className="w-full bg-transparent border rounded-md px-3 py-2 text-[13px] outline-none"
            style={{ borderColor: LINE_2, color: TEXT_HI }}
            placeholder="My Pelosi watch"
          />

          {/* Filter summary chips */}
          <div className="mt-4">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2"
              style={{ color: TEXT_LOW }}
            >
              Filters captured
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.side && (
                <Chip>{filters.side === "D" ? "Dem" : filters.side === "R" ? "GOP" : filters.side}</Chip>
              )}
              {filters.ticker && <Chip mono>{filters.ticker}</Chip>}
              {filters.q && <Chip>“{filters.q}”</Chip>}
              {filters.sector && <Chip>{filters.sector}</Chip>}
              {!filters.side && !filters.ticker && !filters.q && !filters.sector && (
                <span className="text-[11.5px]" style={{ color: TEXT_LOW }}>
                  No filters applied
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-white/5"
              style={{ color: TEXT_MID, border: `1px solid ${LINE_2}` }}
            >
              Cancel
            </button>
            <button
              disabled={name.trim().length === 0}
              onClick={() => onSave(name.trim())}
              className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 text-[12.5px] font-medium transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
                color: "#fff",
                boxShadow: "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
              }}
            >
              <Check size={13} /> Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Chip({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11.5px] ${mono ? "font-mono" : ""}`}
      style={{
        background: "rgba(124,95,255,0.10)",
        color: VIOLET_2,
        border: `1px solid rgba(124,95,255,0.25)`,
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────── Live counter ───────────────────────── */

function LiveCounter({ count }: { count: number }) {
  return (
    <motion.span
      key={count}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      initial={{ opacity: 0.55, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="font-mono text-[10px] uppercase tracking-[0.14em]"
      style={{ color: TEXT_MID }}
    >
      <span className="tabular-nums" style={{ color: VIOLET_2 }}>{count}</span>{" "}
      <span style={{ color: TEXT_LOW }}>filings · last hour</span>
    </motion.span>
  );
}

/* ───────────────────────── Row ───────────────────────── */

function FirehoseLiveRow({
  row,
  isLast,
  router,
  reduced,
}: {
  row: LiveRow;
  isLast: boolean;
  router: ReturnType<typeof useRouter>;
  reduced: boolean;
}) {
  const isNew = !!row.justArrivedAt;
  const [hovering, setHovering] = useState(false);
  return (
    <motion.div
      layout={!reduced ? "position" : false}
      initial={
        isNew && !reduced
          ? { opacity: 0, y: -14, backgroundColor: "rgba(124,95,255,0.22)" }
          : { opacity: 0 }
      }
      animate={
        isNew && !reduced
          ? {
              opacity: 1,
              y: 0,
              backgroundColor: ["rgba(124,95,255,0.22)", "rgba(124,95,255,0)"],
            }
          : { opacity: 1, y: 0 }
      }
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{
        duration: reduced ? 0.12 : 0.55,
        ease: [0.22, 1, 0.36, 1],
        backgroundColor: { duration: 2.4 },
      }}
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/${row.slug}`)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/${row.slug}`);
        }
      }}
      className="flex items-center gap-3 px-4 sm:px-5 py-2.5 font-mono text-[12px] relative hover:bg-white/[0.02] transition-colors cursor-pointer"
      style={{
        borderBottom: isLast ? "none" : `1px solid ${LINE}`,
        color: TEXT_HI,
      }}
    >
      {isNew && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.6, ease: "easeOut" }}
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ background: VIOLET, boxShadow: `0 0 14px ${VIOLET}` }}
        />
      )}

      <div className="w-[58px] sm:w-[68px] shrink-0" style={{ color: isNew ? VIOLET_2 : TEXT_LOW }}>
        {isNew ? (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">Just now</span>
        ) : (
          <TimeAgo iso={row.disclosedDate} />
        )}
      </div>
      <div className="flex-1 min-w-0 truncate">
        {row.portfolioName}
        {row.party && <span className="ml-2 text-[10px]" style={{ color: TEXT_MID }}>({row.party})</span>}
      </div>
      <div
        className="hidden sm:block w-28 shrink-0 text-right tabular-nums text-[11px]"
        style={{ color: TEXT_MID }}
      >
        {row.bracket}
      </div>
      <div className="w-12 shrink-0 font-semibold" style={{ color: row.action === "buy" ? POSITIVE : NEGATIVE }}>
        {row.action.toUpperCase()}
      </div>
      <div className="w-16 sm:w-20 shrink-0 text-right" style={{ color: YELLOW }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/ticker/${row.ticker}`);
          }}
          className="hover:underline"
          style={{ color: YELLOW }}
        >
          {row.ticker}
        </button>
      </div>
      <div className="hidden sm:flex w-[88px] shrink-0 items-center justify-end gap-1">
        {row.sourceUrl ? (
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10.5px] hover:underline"
            style={{ color: TEXT_MID }}
          >
            PDF →
          </a>
        ) : (
          <span className="text-[10.5px]" style={{ color: TEXT_LOW }}>—</span>
        )}
        <FilingRowActions row={row} visible={hovering} />
      </div>
    </motion.div>
  );
}
