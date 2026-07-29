// components/desk/AIConsensusPanel.tsx
import { BG, LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, POSITIVE, NEGATIVE, VIOLET, VIOLET_2, YELLOW } from "@/lib/theme";

const RECENT_PICKS: { date: string; ticker: string; votes: boolean[] }[] = [
  { date: "Jun 22", ticker: "MSFT", votes: [true, true, true, false] },
  { date: "Jun 15", ticker: "AVGO", votes: [true, true, false, true] },
  { date: "Jun 08", ticker: "NVDA", votes: [true, true, true, true] },
];

const THESIS: Record<string, string> = {
  MSFT: "Cloud capex up 41% QoQ. Three lawmaker filings cluster around MSFT in the last 7 trading days.",
  NVDA: "Datacenter spend accelerating. Concurrence across three minds; Grok dissents on inventory overhang.",
  AVGO: "Networking ramp + VMware integration. Defense-adjacent revenue beating estimates two quarters running.",
  GOOGL: "Search ad recovery + Gemini monetization. Two Senate filings disclosed within the window.",
};

export function AIConsensusPanel({
  ticker,
  agreement,
  minds,
}: {
  ticker: string | null;
  agreement: { yes: number; total: number };
  minds: { name: string; agrees: boolean }[];
}) {
  const thesis = ticker ? (THESIS[ticker] ?? "Cluster of recent filings detected. Three of four minds align on the position.") : null;
  return (
    <section
      id="ai"
      className="rounded-2xl p-5 relative overflow-hidden h-full flex flex-col"
      style={{
        background: "linear-gradient(160deg, rgba(124,95,255,0.18) 0%, rgba(79,57,216,0.08) 60%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid rgba(124,95,255,0.30)`,
        boxShadow: `0 30px 60px -30px ${VIOLET}55, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10) 0%, transparent 60%)" }}
      />
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: VIOLET_2 }}>
            AI consensus · today
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded-sm"
            style={{ background: YELLOW, color: BG }}
          >
            Pick
          </span>
        </div>

        {ticker ? (
          <div
            className="font-mono text-[44px] font-semibold leading-none tabular-nums tracking-[-0.02em]"
            style={{ color: "#fff", textShadow: `0 0 24px ${VIOLET}66` }}
          >
            {ticker}
          </div>
        ) : (
          <div className="py-4">
            <div className="font-mono text-[20px] font-semibold tracking-[-0.01em]" style={{ color: TEXT_HI }}>
              Awaiting weekly run
            </div>
            <div className="mt-1 text-[12px]" style={{ color: TEXT_MID }}>
              The four minds vote every Monday. Next pick lands when filings cluster.
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_MID }}>
            <span>Agreement</span>
            <span className="font-mono tabular-nums" style={{ color: TEXT_HI }}>
              {ticker ? `${agreement.yes} / ${agreement.total}` : "—"}
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {minds.map((m, i) => (
              <div
                key={m.name + i}
                className="flex-1 h-2.5 rounded-sm"
                style={{
                  background: ticker && m.agrees ? POSITIVE : "rgba(255,255,255,0.10)",
                  boxShadow: ticker && m.agrees ? `0 0 12px ${POSITIVE}80` : "none",
                }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[9.5px] font-mono uppercase tracking-wider">
            {minds.map((m) => (
              <div key={m.name} style={{ color: !ticker ? TEXT_LOW : m.agrees ? TEXT_MID : NEGATIVE }}>
                {m.name}
              </div>
            ))}
          </div>
        </div>

        {thesis && (
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: TEXT_LOW }}>
              Thesis
            </div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: TEXT_MID }}>
              {thesis}
            </p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-[10px] uppercase tracking-[0.18em] mb-2.5" style={{ color: TEXT_LOW }}>
            Recent weekly picks
          </div>
          <ul className="space-y-1.5">
            {RECENT_PICKS.map((p) => (
              <li key={p.date} className="flex items-center gap-3 text-[11.5px]">
                <span className="font-mono w-12 shrink-0" style={{ color: TEXT_LOW }}>{p.date}</span>
                <span className="font-mono font-semibold w-14 shrink-0" style={{ color: YELLOW }}>{p.ticker}</span>
                <div className="flex gap-0.5 ml-auto">
                  {p.votes.map((v, i) => (
                    <span
                      key={i}
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{
                        background: v ? POSITIVE : "rgba(248,113,113,0.85)",
                        boxShadow: v ? `0 0 6px ${POSITIVE}66` : "none",
                      }}
                      aria-label={v ? "concurs" : "dissents"}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10.5px] tabular-nums w-8 text-right" style={{ color: TEXT_MID }}>
                  {p.votes.filter(Boolean).length}/4
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
