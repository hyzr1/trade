// components/desk/MetricStrip.tsx
//
// Compact desk KPI strip. Padding (px-5 py-4) and 1px LINE_2 border match the
// Firehose card directly below so the two surfaces read as a single column.
"use client";
import { LINE_2, TEXT_HI, TEXT_LOW, VIOLET_2, YELLOW } from "@/lib/theme";
import type { DeskMetrics } from "@/lib/queries";
import { CountUp } from "@/components/ui/CountUp";

type Cell = {
  l: string;
  n: number | null; // numeric value to animate; null → render `v` literally
  v: string;        // fallback / suffix display (e.g. ticker)
  c: string;
  fmt: (v: number) => string;
};

export function MetricStrip({ m }: { m: DeskMetrics }) {
  // Empty-state copy: when 0 / 0, swap zeros for a quiet em-dash so the strip
  // doesn't read as "broken". The 7d count is the more honest signal.
  const todayDisplay = m.filingsToday > 0 ? m.filingsToday.toString() : "—";
  const dissentDisplay = m.topDissent && m.topDissent !== "—" ? m.topDissent : "None";
  const cells: Cell[] = [
    {
      l: "Filings today",
      n: m.filingsToday > 0 ? m.filingsToday : null,
      v: todayDisplay,
      c: m.filingsToday > 0 ? "#fff" : TEXT_LOW,
      fmt: (v) => Math.round(v).toString(),
    },
    {
      l: "Filings 7d",
      n: m.filings7d,
      v: m.filings7d.toString(),
      c: VIOLET_2,
      fmt: (v) => Math.round(v).toString(),
    },
    {
      l: "AI agreement",
      n: m.concurrencePct,
      v: `${m.concurrencePct}%`,
      c: YELLOW,
      fmt: (v) => `${Math.round(v)}%`,
    },
    {
      l: "Top dissent",
      n: null,
      v: dissentDisplay,
      c: dissentDisplay === "None" ? TEXT_LOW : TEXT_HI,
      fmt: (v) => v.toString(),
    },
  ];
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      {cells.map((c) => (
        <div key={c.l}>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>{c.l}</div>
          <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums" style={{ color: c.c }}>
            {c.n === null ? c.v : <CountUp value={c.n} format={c.fmt} duration={0.6} />}
          </div>
        </div>
      ))}
    </div>
  );
}
