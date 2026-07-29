// components/ui/TimeAgo.tsx
// Lightweight relative-time renderer. Ticks every 60s.
// Accepts ISO date strings or YYYY-MM-DD; renders "2m ago", "3h ago", "Jan 14".
"use client";

import { useEffect, useState } from "react";

export function timeAgoString(iso: string, now: Date = new Date()): string {
  if (!iso) return "—";
  // Accept YYYY-MM-DD (treat as start of day UTC) or full ISO.
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const diffMs = now.getTime() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 0) {
    // Future date — render absolute.
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  // > 1 week → render absolute date.
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Props = {
  iso: string;
  className?: string;
  style?: React.CSSProperties;
  /** Render absolute date in `title` attribute for hover tooltips. */
  title?: boolean;
};

export function TimeAgo({ iso, className, style, title = true }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const text = timeAgoString(iso);
  const titleText = title
    ? (() => {
        const d = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
        return Number.isNaN(d.getTime())
          ? iso
          : d.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
      })()
    : undefined;

  return (
    <time className={className} style={style} dateTime={iso} title={titleText}>
      {text}
    </time>
  );
}
