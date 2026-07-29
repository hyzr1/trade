// components/profile/AIScorecard.tsx
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, YELLOW, POSITIVE } from "@/lib/theme";
import type { ProfileData } from "@/lib/queries";

export function AIScorecard({ grid, confirmedPct }: { grid: ProfileData["aiGrid"]; confirmedPct: number }) {
  if (grid.length === 0) return null;
  const mindNames = grid[0].minds.map((m) => m.name);
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>AI scorecard</span>
        <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>
          {confirmedPct.toFixed(0)}% AI-confirmed
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}>
            <th className="px-5 py-2.5 text-left font-normal">Ticker</th>
            <th className="px-3 py-2.5 text-right font-normal">Weight</th>
            {mindNames.map((n) => (
              <th key={n} className="px-3 py-2.5 text-center font-normal">{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, i) => (
            <tr
              key={row.ticker}
              className="text-[13px]"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
            >
              <td className="px-5 py-3 font-mono font-semibold" style={{ color: YELLOW }}>{row.ticker}</td>
              <td className="px-3 py-3 font-mono tabular-nums text-right" style={{ color: TEXT_MID }}>
                {row.weight.toFixed(1)}%
              </td>
              {row.minds.map((m, j) => (
                <td key={j} className="px-3 py-3 text-center">
                  {m.holds ? (
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-[10.5px]"
                      style={{ background: `${POSITIVE}25`, color: POSITIVE, border: `1px solid ${POSITIVE}40` }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span style={{ color: TEXT_LOW }}>—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
