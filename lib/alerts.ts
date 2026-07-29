// lib/alerts.ts
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "autotrade.alerts";

export type AlertKind =
  | "politician_trades"
  | "ticker_trades"
  | "ai_consensus"
  | "daily_digest";

export type AlertChannels = { email: boolean };

export type Alert = {
  id: string;
  kind: AlertKind;
  params: { portfolioSlug?: string; ticker?: string };
  channels: AlertChannels;
  enabled: boolean;
  createdAt: string;
  lastTriggered: string | null;
};

function read(): Alert[] {
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

function write(items: Alert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("autotrade:alerts"));
}

function makeId() {
  return `alert_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function describeAlert(a: Alert, portfolioName?: (slug: string) => string): string {
  switch (a.kind) {
    case "politician_trades": {
      const name = a.params.portfolioSlug
        ? portfolioName?.(a.params.portfolioSlug) ?? a.params.portfolioSlug
        : "anyone";
      return `When ${name} trades any ticker`;
    }
    case "ticker_trades":
      return `When anyone trades ${a.params.ticker ?? "—"}`;
    case "ai_consensus":
      return `When AI consensus shifts on ${a.params.ticker ?? "—"}`;
    case "daily_digest":
      return "Daily digest of all activity";
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAlerts(read());
    setHydrated(true);
    const onChange = () => setAlerts(read());
    window.addEventListener("autotrade:alerts", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("autotrade:alerts", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const create = useCallback(
    (kind: AlertKind, params: Alert["params"], channels: AlertChannels = { email: true }) => {
      const current = read();
      // Daily digest is a singleton — replace if exists.
      const filtered =
        kind === "daily_digest" ? current.filter((a) => a.kind !== "daily_digest") : current;
      const next: Alert = {
        id: makeId(),
        kind,
        params,
        channels,
        enabled: true,
        createdAt: new Date().toISOString(),
        lastTriggered: null,
      };
      const updated = [...filtered, next];
      write(updated);
      setAlerts(updated);
      return next;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    const next = read().filter((a) => a.id !== id);
    write(next);
    setAlerts(next);
  }, []);

  const setEnabled = useCallback((id: string, enabled: boolean) => {
    const next = read().map((a) => (a.id === id ? { ...a, enabled } : a));
    write(next);
    setAlerts(next);
  }, []);

  return { alerts, hydrated, create, remove, setEnabled };
}
