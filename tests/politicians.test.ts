// tests/politicians.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCapitolTradesHtml } from "../lib/ingest/politicians";

describe("parseCapitolTradesHtml", () => {
  it("extracts ticker, action, trade date, disclosed date from the disclosures table", () => {
    const html = readFileSync(join(__dirname, "fixtures/capitoltrades-pelosi.html"), "utf-8");
    const rows = parseCapitolTradesHtml(html);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ ticker: "NVDA", action: "buy", tradeDate: "2025-05-05", disclosedDate: "2025-05-20" });
    expect(rows[1]).toMatchObject({ ticker: "AAPL", action: "sell", tradeDate: "2025-04-12", disclosedDate: "2025-04-29" });
  });

  it("silently skips rows missing ticker, dates, or action", () => {
    const html = `<table><tbody>
      <tr class="q-tr">
        <td><span class="q-field issuer-ticker"></span></td>
        <td><div class="q-cell">2025-05-05</div></td>
        <td><div class="q-cell">2025-05-20</div></td>
        <td><span class="q-field tx-type">buy</span></td>
      </tr>
      <tr class="q-tr">
        <td><span class="q-field issuer-ticker">MSFT</span></td>
        <td><div class="q-cell">2025-05-05</div></td>
        <td><span class="q-field tx-type">buy</span></td>
      </tr>
      <tr class="q-tr">
        <td><span class="q-field issuer-ticker">TSLA</span></td>
        <td><div class="q-cell">2025-05-05</div></td>
        <td><div class="q-cell">2025-05-20</div></td>
        <td><span class="q-field tx-type">hold</span></td>
      </tr>
    </tbody></table>`;
    const rows = parseCapitolTradesHtml(html);
    expect(rows).toHaveLength(0);
  });
});
