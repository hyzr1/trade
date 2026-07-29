// lib/onboarding.ts — first-run onboarding flag, keyed per email in localStorage.
"use client";

export const ONBOARDED_KEY = "autotrade.onboarded";

type Store = Record<string, boolean>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ONBOARDED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Store;
    }
    return {};
  } catch {
    return {};
  }
}

function write(s: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDED_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function isOnboarded(email: string): boolean {
  if (!email) return true;
  return Boolean(read()[email.toLowerCase()]);
}

export function markOnboarded(email: string): void {
  if (!email) return;
  const key = email.toLowerCase();
  const s = read();
  if (s[key]) return;
  s[key] = true;
  write(s);
}

export function firstNameFromEmail(email: string): string {
  if (!email) return "there";
  const local = email.split("@")[0] ?? "";
  // Strip everything after first separator and capitalize.
  const head = local.split(/[._\-+]/)[0] ?? local;
  if (!head) return "there";
  return head.charAt(0).toUpperCase() + head.slice(1).toLowerCase();
}

/* ───────────────────────── Preferences (priorities + alerts) ───────────────── */

export const PRIORITIES_KEY = "autotrade.priorities";
export const ALERT_PREFS_KEY = "autotrade.alertPrefs";

export type Priorities = {
  sectors: string[];
  politicians: string[];
  minds: string[];
};

export type AlertPrefs = {
  digestDaily: boolean;
  whenWatchedTrade: boolean;
  whenConsensusShifts: boolean;
  whenClusterDetected: boolean;
};

export function loadPriorities(): Priorities {
  if (typeof window === "undefined") {
    return { sectors: [], politicians: [], minds: [] };
  }
  try {
    const raw = window.localStorage.getItem(PRIORITIES_KEY);
    if (!raw) return { sectors: [], politicians: [], minds: [] };
    const p = JSON.parse(raw) as Partial<Priorities>;
    return {
      sectors: Array.isArray(p.sectors) ? p.sectors : [],
      politicians: Array.isArray(p.politicians) ? p.politicians : [],
      minds: Array.isArray(p.minds) ? p.minds : [],
    };
  } catch {
    return { sectors: [], politicians: [], minds: [] };
  }
}

export function savePriorities(p: Priorities): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRIORITIES_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadAlertPrefs(): AlertPrefs {
  const def: AlertPrefs = {
    digestDaily: true,
    whenWatchedTrade: true,
    whenConsensusShifts: false,
    whenClusterDetected: true,
  };
  if (typeof window === "undefined") return def;
  try {
    const raw = window.localStorage.getItem(ALERT_PREFS_KEY);
    if (!raw) return def;
    return { ...def, ...(JSON.parse(raw) as Partial<AlertPrefs>) };
  } catch {
    return def;
  }
}

export function saveAlertPrefs(a: AlertPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ALERT_PREFS_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}
