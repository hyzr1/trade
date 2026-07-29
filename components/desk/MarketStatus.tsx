// components/desk/MarketStatus.tsx
//
// Thin status pill that lives just under the TopBar. Shows whether US equity
// markets are open and how long until the next open/close. NYSE regular hours
// (Mon-Fri 09:30–16:00 ET) — holidays/half-days are intentionally not handled.
"use client";
import { useEffect, useState } from "react";
import { LINE_2, POSITIVE, TEXT_LOW, TEXT_MID, YELLOW } from "@/lib/theme";

type Status = {
  open: boolean;
  label: string;
};

/** Returns NYSE wallclock minutes for a Date, treating the time as if it were
 *  America/New_York. We rely on the env's Intl support and avoid a tz lib. */
function nyParts(d: Date): { weekday: number; minutes: number } {
  // weekday 0..6 where Sunday=0 (matches Date#getDay)
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { weekday: map[wd] ?? 1, minutes: hh * 60 + mm };
}

const OPEN_MIN = 9 * 60 + 30; // 09:30
const CLOSE_MIN = 16 * 60; // 16:00

function fmtMinutes(m: number): string {
  if (m <= 0) return "now";
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function compute(now: Date): Status {
  const { weekday, minutes } = nyParts(now);
  const isWeekday = weekday >= 1 && weekday <= 5;

  if (isWeekday && minutes >= OPEN_MIN && minutes < CLOSE_MIN) {
    const left = CLOSE_MIN - minutes;
    return { open: true, label: `Markets open · NYSE closes in ${fmtMinutes(left)}` };
  }

  // Find the next session open. Simple weekend roll-forward.
  const daysAheadByDay: Record<number, number[]> = {
    0: [1], // Sun -> Mon
    1: [0, 1], // Mon (closed pre-open or after close): today or tomorrow
    2: [0, 1],
    3: [0, 1],
    4: [0, 1],
    5: [0, 3], // Fri (after close) -> Mon
    6: [2], // Sat -> Mon
  };
  const options = daysAheadByDay[weekday] ?? [1];
  let dayLabel: string;
  if (weekday >= 1 && weekday <= 5 && minutes < OPEN_MIN) {
    dayLabel = "today";
  } else if (
    (weekday >= 1 && weekday <= 4 && minutes >= CLOSE_MIN) ||
    (weekday === 0 && options[0] === 1)
  ) {
    dayLabel = weekday === 0 ? "Monday" : "tomorrow";
  } else if (weekday === 5 && minutes >= CLOSE_MIN) {
    dayLabel = "Monday";
  } else if (weekday === 6) {
    dayLabel = "Monday";
  } else {
    dayLabel = "soon";
  }
  return { open: false, label: `Markets closed · Opens ${dayLabel} 9:30 ET` };
}

function shortLabel(s: Status): string {
  // Compact form for inline TopBar pill: "OPEN · 2h 14m" / "CLOSED · MON 9:30 ET"
  if (s.open) {
    const m = s.label.match(/closes in (.+)$/);
    return `Open · ${m?.[1] ?? "today"}`;
  }
  const m = s.label.match(/Opens (.+)$/);
  return `Closed · ${m?.[1] ?? "soon"}`;
}

/**
 * Renders an inline status pill suitable for the TopBar. Replaced the older
 * full-width strip — the strip was eating vertical space above the metric grid
 * and pushed the dashboard content down.
 */
export function MarketStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => setStatus(compute(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!status) return null;

  const dot = status.open ? POSITIVE : YELLOW;
  return (
    <span
      className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 select-none"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${LINE_2}`,
      }}
      role="status"
      aria-live="polite"
      title={status.label}
    >
      <span className="relative inline-flex w-1.5 h-1.5">
        {status.open && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: dot, opacity: 0.55 }}
          />
        )}
        <span
          className="relative inline-flex w-1.5 h-1.5 rounded-full"
          style={{ background: dot }}
        />
      </span>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: status.open ? TEXT_MID : TEXT_LOW }}
      >
        {shortLabel(status)}
      </span>
    </span>
  );
}
