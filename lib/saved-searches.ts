// lib/saved-searches.ts
//
// Saved searches for the filings firehose + tickers. Pure client-side
// persistence in localStorage; mirrors the useWatchlist pattern so other hook
// instances on the same page get notified via a custom event.
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "autotrade.savedSearches";

/** Filter shape used by FilingsFirehose + /saved + URL params on /terminal. */
export type SavedSearchFilters = {
  /** "all" | "buys" | "sells" | "D" | "R" */
  side?: "all" | "buys" | "sells" | "D" | "R";
  /** Free-text query — matches ticker or member name. */
  q?: string;
  /** Specific ticker to anchor on (when set, takes priority over q). */
  ticker?: string;
  /** Sector name (Tech / Defense / Healthcare / …). */
  sector?: string;
  /** Time window in days; 30 default. */
  windowDays?: number;
};

export type SavedSearch = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
};

function read(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("autotrade:savedSearches"));
}

function makeId(): string {
  return `ss_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a stable, URL-safe query string from filters — used to deep-link
 *  into /terminal?side=buys&ticker=NVDA&… etc. */
export function filtersToQueryString(f: SavedSearchFilters): string {
  const params = new URLSearchParams();
  if (f.side && f.side !== "all") params.set("side", f.side);
  if (f.q) params.set("q", f.q);
  if (f.ticker) params.set("ticker", f.ticker);
  if (f.sector) params.set("sector", f.sector);
  if (f.windowDays && f.windowDays !== 30) params.set("days", String(f.windowDays));
  return params.toString();
}

/** Inverse — parse filters back out of URL search params. */
export function filtersFromSearchParams(
  sp: URLSearchParams | ReadonlyURLSearchParams,
): SavedSearchFilters {
  const out: SavedSearchFilters = {};
  const side = sp.get("side");
  if (side === "all" || side === "buys" || side === "sells" || side === "D" || side === "R") {
    out.side = side;
  }
  const q = sp.get("q");
  if (q) out.q = q;
  const ticker = sp.get("ticker");
  if (ticker) out.ticker = ticker;
  const sector = sp.get("sector");
  if (sector) out.sector = sector;
  const days = sp.get("days");
  if (days) {
    const n = parseInt(days, 10);
    if (Number.isFinite(n) && n > 0) out.windowDays = n;
  }
  return out;
}

/** Small alias matching what Next.js gives us from useSearchParams(). */
type ReadonlyURLSearchParams = { get(name: string): string | null };

/** Human-readable summary used in the sidebar quick-links + /saved cards. */
export function summarizeFilters(f: SavedSearchFilters): string {
  const parts: string[] = [];
  if (f.side === "buys") parts.push("Buys");
  else if (f.side === "sells") parts.push("Sells");
  else if (f.side === "D") parts.push("Dem");
  else if (f.side === "R") parts.push("GOP");
  if (f.ticker) parts.push(f.ticker);
  if (f.sector) parts.push(f.sector);
  if (f.q && !f.ticker) parts.push(`“${f.q}”`);
  if (f.windowDays) parts.push(`${f.windowDays}d`);
  return parts.length === 0 ? "All filings" : parts.join(" · ");
}

export function useSavedSearches() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const onChange = () => setItems(read());
    window.addEventListener("autotrade:savedSearches", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("autotrade:savedSearches", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const save = useCallback((name: string, filters: SavedSearchFilters): SavedSearch => {
    const entry: SavedSearch = {
      id: makeId(),
      name: name.trim() || "Untitled search",
      filters,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...read()];
    write(next);
    setItems(next);
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((s) => s.id !== id);
    write(next);
    setItems(next);
  }, []);

  const rename = useCallback((id: string, name: string) => {
    const next = read().map((s) => (s.id === id ? { ...s, name } : s));
    write(next);
    setItems(next);
  }, []);

  return { items, save, remove, rename, hydrated };
}
