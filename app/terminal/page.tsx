// app/terminal/page.tsx
import { Suspense } from "react";
import { DeskShell } from "@/components/desk/DeskShell";
import { MetricStrip } from "@/components/desk/MetricStrip";
import { FilingsFirehose } from "@/components/desk/FilingsFirehose";
import { AIConsensusPanel } from "@/components/desk/AIConsensusPanel";
import { TopMovers } from "@/components/desk/TopMovers";
import { HotTickers } from "@/components/desk/HotTickers";
import { Leaderboard } from "@/components/desk/Leaderboard";
import { SectorHeatmap } from "@/components/desk/SectorHeatmap";
import {
  getDeskMetrics,
  getFilingsFirehose,
  getTopMovers,
  getHotTickers,
  getLeaderboard,
  getSectorHeatmap,
} from "@/lib/queries";

export const revalidate = 60;

export default async function TerminalPage() {
  const [metrics, firehose, movers, hot, leaderboard, heatmap] = await Promise.all([
    getDeskMetrics(),
    getFilingsFirehose(50),
    getTopMovers(),
    getHotTickers(7),
    getLeaderboard(),
    getSectorHeatmap(30),
  ]);

  const hotPick = hot.tickers[0]?.ticker ?? null;

  return (
    <DeskShell breadcrumb="Desk">
      <MetricStrip m={metrics} />

      <Suspense fallback={null}>
        <FilingsFirehose rows={firehose} />
      </Suspense>

      {/* AI consensus + Hot tickers share a row (5/7). Top movers spans below. */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <div className="col-span-12 lg:col-span-5">
          <AIConsensusPanel
            ticker={hotPick}
            agreement={{ yes: 3, total: 4 }}
            minds={[
              { name: "GPT-5", agrees: true },
              { name: "Claude", agrees: true },
              { name: "Gemini", agrees: true },
              { name: "Grok", agrees: false },
            ]}
          />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <HotTickers tickers={hot.tickers} windowDays={hot.windowDays} />
        </div>
      </div>

      <TopMovers movers={movers} />

      <SectorHeatmap data={heatmap} />

      <Leaderboard rows={leaderboard} />
    </DeskShell>
  );
}
