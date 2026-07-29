// app/[slug]/page.tsx
"use client";
import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { DeskShell } from "@/components/desk/DeskShell";
import { PortraitHeader } from "@/components/profile/PortraitHeader";
import { WeekSummary } from "@/components/profile/WeekSummary";
import { ReturnChartBenchmarks } from "@/components/profile/ReturnChartBenchmarks";
import { HoldingsTable } from "@/components/profile/HoldingsTable";
import { SectorDonut } from "@/components/profile/SectorDonut";
import { AIScorecard } from "@/components/profile/AIScorecard";
import { AttributionWaterfall } from "@/components/profile/AttributionWaterfall";
import { TradeReplay } from "@/components/profile/TradeReplay";
import { TransactionLog } from "@/components/profile/TransactionLog";
import { RelatedPortfolios } from "@/components/profile/RelatedPortfolios";
import { ProfilePageSkeleton } from "@/components/ui/Skeleton";
import type { Sector } from "@/lib/sectors";
import type { ProfileData } from "@/lib/queries";

export default function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [d, setD] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<Sector | null>(null);

  useEffect(() => {
    fetch(`/api/profile/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundFlag(true);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => setD(data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFoundFlag) {
    notFound();
  }

  if (loading || !d) {
    return (
      <DeskShell breadcrumb="Loading…">
        <ProfilePageSkeleton />
      </DeskShell>
    );
  }

  return (
    <DeskShell breadcrumb={d.name}>
      <PortraitHeader d={d} />

      <WeekSummary d={d} />

      <ReturnChartBenchmarks
        portfolio={d.portfolioSeries}
        spy={d.spyOverlap}
        qqq={d.qqqOverlap}
        ytdReturn={d.ytdReturn}
        vsSpy={d.vsSpy}
        maxDD={d.maxDD}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <HoldingsTable
            holdings={d.holdings}
            filterSector={sectorFilter}
            onClearFilter={() => setSectorFilter(null)}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <SectorDonut
            holdings={d.holdings}
            selected={sectorFilter}
            onSelect={setSectorFilter}
          />
        </div>
      </div>

      <AIScorecard grid={d.aiGrid} confirmedPct={d.aiConfirmedPct} />

      <AttributionWaterfall holdings={d.holdings} />

      {/* Transaction log is the primary trade timeline. Replay is an
          alternate (animated) view of the same data — collapse it by default
          so the page doesn't duplicate intent across two full-width cards. */}
      <TransactionLog transactions={d.transactions} />

      <details className="group">
        <summary
          className="cursor-pointer list-none inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-mono uppercase tracking-[0.16em] transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <span className="transition-transform group-open:rotate-90">▸</span>
          Open animated trade replay
        </summary>
        <div className="mt-3">
          <TradeReplay transactions={d.transactions} series={d.portfolioSeries} />
        </div>
      </details>

      <RelatedPortfolios related={d.related} />
    </DeskShell>
  );
}
