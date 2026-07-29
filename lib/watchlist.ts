// lib/watchlist.ts
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "autotrade.watchlist";

export type WatchlistItem = {
  type: "ticker" | "portfolio";
  id: string;
  addedAt: string;
};

function read(): WatchlistItem[] {
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

function write(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  // Notify other hook instances on the same page.
  window.dispatchEvent(new CustomEvent("autotrade:watchlist"));
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const onChange = () => setItems(read());
    window.addEventListener("autotrade:watchlist", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("autotrade:watchlist", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback((type: WatchlistItem["type"], id: string) => {
    const current = read();
    if (current.find((i) => i.type === type && i.id === id)) return false;
    const next = [...current, { type, id, addedAt: new Date().toISOString() }];
    write(next);
    setItems(next);
    return true;
  }, []);

  const remove = useCallback((type: WatchlistItem["type"], id: string) => {
    const current = read();
    const next = current.filter((i) => !(i.type === type && i.id === id));
    write(next);
    setItems(next);
  }, []);

  const toggle = useCallback((type: WatchlistItem["type"], id: string) => {
    const current = read();
    const exists = current.find((i) => i.type === type && i.id === id);
    const next = exists
      ? current.filter((i) => !(i.type === type && i.id === id))
      : [...current, { type, id, addedAt: new Date().toISOString() }];
    write(next);
    setItems(next);
    return !exists;
  }, []);

  const has = useCallback(
    (type: WatchlistItem["type"], id: string) =>
      items.some((i) => i.type === type && i.id === id),
    [items],
  );

  return { items, add, remove, toggle, has, hydrated };
}
