// components/ui/Skeleton.tsx — base skeleton + a few composed ones for Desk/Profile.
import type { CSSProperties, HTMLAttributes } from "react";
import { LINE, LINE_2 } from "@/lib/theme";

type SkelProps = HTMLAttributes<HTMLDivElement> & {
  /** Stronger base tint (use sparingly for hero blocks). */
  strong?: boolean;
};

export function Skeleton({ className = "", style, strong = false, ...rest }: SkelProps) {
  return (
    <div
      aria-hidden
      className={`autotrade-skeleton ${strong ? "autotrade-skeleton-strong" : ""} ${className}`}
      style={style}
      {...rest}
    />
  );
}

/* ───────────────────────── Composed skeletons ───────────────────────── */

const cardShell: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
  border: `1px solid ${LINE_2}`,
  borderRadius: 16,
};

export function MetricStripSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 px-5 sm:px-7 py-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${LINE}`,
        borderRadius: 16,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="h-[10px] w-20" />
          <Skeleton className="mt-2 h-[22px] w-16" strong />
        </div>
      ))}
    </div>
  );
}

export function PortfolioCardSkeleton() {
  return (
    <div className="p-5" style={cardShell}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" strong />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-[10px] w-20" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-[120px] w-full" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14 ml-auto" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div className="p-6" style={cardShell}>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-[10px] w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-full" style={{ height }} strong />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-2.5"
      style={{ borderBottom: `1px solid ${LINE}` }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ flex: i === 1 ? "1 1 auto" : "0 0 auto", width: i === 1 ? undefined : 60 + (i % 3) * 14 }}
        />
      ))}
    </div>
  );
}

export function FirehoseSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div style={cardShell}>
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <Skeleton className="h-[10px] w-28" />
        <Skeleton className="h-[10px] w-14" />
      </div>
      <div
        className="flex flex-wrap items-center gap-1.5 px-5 py-2.5"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-12 rounded-full" />
        ))}
        <Skeleton className="ml-auto h-6 w-40 rounded-full" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Portrait header */}
      <div className="p-6" style={cardShell}>
        <div className="flex items-center gap-5">
          <Skeleton className="w-20 h-20 rounded-full" strong />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-56" strong />
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="space-y-2">
              <Skeleton className="h-[10px] w-14" />
              <Skeleton className="h-5 w-16" strong />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-[10px] w-14" />
              <Skeleton className="h-5 w-16" strong />
            </div>
          </div>
        </div>
      </div>
      <ChartSkeleton />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8" style={cardShell}>
          <div className="p-5 space-y-2">
            <Skeleton className="h-[10px] w-32" />
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 p-6" style={cardShell}>
          <Skeleton className="h-[10px] w-24 mb-4" />
          <Skeleton className="w-full aspect-square rounded-full" strong />
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-sm" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
