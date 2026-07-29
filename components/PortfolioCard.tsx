// components/PortfolioCard.tsx
import Link from "next/link";
import { Sparkline } from "./Sparkline";
import { Avatar } from "./Avatar";
import { formatPct } from "@/lib/format";

export type PortfolioCardData = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  allTimeReturn: number | null;
  sparkPoints: number[];
  topHoldings: { ticker: string; weight: number }[];
  initials: string;
};

export function PortfolioCard({ data }: { data: PortfolioCardData }) {
  const isLLM = data.kind === "llm";
  const positive = (data.allTimeReturn ?? 0) >= 0;
  const sparkColor = data.allTimeReturn == null
    ? "#3f3f46"
    : positive ? "#4ade80" : "#f87171";
  const returnColor = data.allTimeReturn == null
    ? "text-zinc-500"
    : positive ? "text-emerald-400" : "text-red-400";

  return (
    <Link
      href={`/${data.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:bg-[#0e0e10] hover:border-white/[0.12]"
    >
      <div className="flex items-center gap-3 mb-5">
        <Avatar initials={data.initials} kind={data.kind} size={36} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[13.5px] leading-tight text-zinc-100 truncate">{data.name}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{data.label}</div>
        </div>
        <KindBadge kind={data.kind} />
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`text-[26px] font-semibold tracking-tight tabular-nums ${returnColor}`}>
          {formatPct(data.allTimeReturn)}
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {data.allTimeReturn == null ? "tracking" : "all-time"}
        </div>
      </div>

      <div className="my-3 -mx-1">
        <Sparkline points={data.sparkPoints} color={sparkColor} height={32} />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {data.topHoldings.length === 0 && (
          <div className="text-[11px] text-zinc-600 italic">No holdings yet</div>
        )}
        {data.topHoldings.map((h) => (
          <div
            key={h.ticker}
            className="rounded-md bg-white/[0.02] border border-white/[0.06] px-2 py-1 text-[11px] font-mono text-zinc-300"
          >
            <span className="text-zinc-200">{h.ticker}</span>
            <span className="ml-1.5 text-zinc-500 tabular-nums">{h.weight.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

function KindBadge({ kind }: { kind: "politician" | "llm" }) {
  if (kind === "llm") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300 font-mono tracking-wider uppercase">
        <span className="w-1 h-1 rounded-full bg-blue-400" />
        Model
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
      <span className="w-1 h-1 rounded-full bg-emerald-400/70" />
      Live
    </span>
  );
}
