// lib/notifications.ts
// LocalStorage-backed notification feed. Seeded on first load with a mix of
// filing, AI-mind, consensus, and user-alert events so the bell never feels
// empty in demo. Multiple hook instances on the same page stay in sync via a
// custom event dispatched from the writer.
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "autotrade.notifications";

export type NotificationType = "filing" | "ai" | "consensus" | "alert";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** ISO timestamp — relative time is rendered at read. */
  createdAt: string;
  read: boolean;
  /** Optional internal link the row will route to when clicked. */
  href?: string;
};

/** Seed data — feels alive on first visit. */
function seed(): Notification[] {
  const now = Date.now();
  const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();
  return [
    {
      id: "n_seed_1",
      type: "filing",
      title: "Nancy Pelosi filed a new PTR",
      body: "BUY NVDA · $5M – $25M · disclosed 38 days after trade.",
      createdAt: ago(8),
      read: false,
      href: "/pelosi",
    },
    {
      id: "n_seed_2",
      type: "consensus",
      title: "3 of 4 minds agreed on TSLA",
      body: "GPT-5, Claude, and Gemini all rotated into Tesla this week.",
      createdAt: ago(54),
      read: false,
      href: "/terminal#ai",
    },
    {
      id: "n_seed_3",
      type: "ai",
      title: "Claude rotated into AVGO",
      body: "Added 3.4% to Broadcom — Claude's first semis position since November.",
      createdAt: ago(140),
      read: false,
      href: "/claude",
    },
    {
      id: "n_seed_4",
      type: "alert",
      title: "Your alert triggered",
      body: '"Anyone buys NVDA" matched Pelosi\'s filing.',
      createdAt: ago(220),
      read: true,
      href: "/alerts",
    },
    {
      id: "n_seed_5",
      type: "filing",
      title: "Marjorie T. Greene filed",
      body: "SELL META · $50K – $100K · partial divestment.",
      createdAt: ago(640),
      read: true,
      href: "/greene",
    },
    {
      id: "n_seed_6",
      type: "ai",
      title: "GPT-5 trimmed NVDA",
      body: "Reduced semis exposure 1.8pp following Tuesday's volatility.",
      createdAt: ago(1280),
      read: true,
      href: "/gpt",
    },
    {
      id: "n_seed_7",
      type: "consensus",
      title: "Defense sector cluster",
      body: "5 senators filed PTRs in LMT, RTX, GD within 72 hours.",
      createdAt: ago(2880),
      read: true,
      href: "/radar",
    },
  ];
}

function read(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("autotrade:notifications"));
}

/** Human-friendly relative time. Tight; max 9 chars. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const onChange = () => setItems(read());
    window.addEventListener("autotrade:notifications", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("autotrade:notifications", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const markRead = useCallback((id: string) => {
    const current = read();
    const next = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    write(next);
    setItems(next);
  }, []);

  const markAllRead = useCallback(() => {
    const current = read();
    const next = current.map((n) => ({ ...n, read: true }));
    write(next);
    setItems(next);
  }, []);

  const remove = useCallback((id: string) => {
    const current = read();
    const next = current.filter((n) => n.id !== id);
    write(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, hydrated, unreadCount, markRead, markAllRead, remove, clear };
}
