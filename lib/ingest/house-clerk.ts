// lib/ingest/house-clerk.ts
//
// Ingest US House Periodic Transaction Reports (PTRs) directly from the
// official House Clerk source: https://disclosures-clerk.house.gov.
//
// Flow:
//   1. Download the annual FD ZIP for each year — daily-refreshed index.
//   2. Unzip and parse the XML index to find PTR filings (FilingType=P).
//   3. For each PTR, download the PDF (cached on disk) and extract text.
//   4. Parse the text into structured transactions.
//   5. Insert into transactions; replay into positions/snapshots.
//
// The parser handles standard tabular PTR layouts as emitted by the
// Clerk's online form. PDFs that are scanned images (no text layer)
// are silently skipped — we only ingest what we can verify.

import { db, portfolios, positions, snapshots, transactions } from "../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import { recomputeFor } from "../returns";
import * as cheerio from "cheerio";
import AdmZip from "adm-zip";
import { PDFParse } from "pdf-parse";

const FD_BASE = "https://disclosures-clerk.house.gov/public_disc/financial-pdfs";
const PTR_BASE = "https://disclosures-clerk.house.gov/public_disc/ptr-pdfs";
const CACHE_ROOT = join(process.cwd(), "data", "raw");

export type FilingIndexRow = {
  year: string;
  last: string;
  first: string;
  filingType: string;
  stateDst: string;
  filingDate: string;
  docId: string;
};

export type ParsedPtrTransaction = {
  owner: string;       // SP / JT / DC / OW / "" — self/spouse/joint/dependent
  ticker: string;
  assetName: string;
  assetType: string;   // ST / OP / GS / MF / OT / etc.
  action: "buy" | "sell" | "exchange";
  actionRaw: string;   // raw "P" / "S" / "S (partial)" / "E"
  tradeDate: string;   // ISO YYYY-MM-DD
  notifDate: string;   // ISO YYYY-MM-DD
  amountRange: string; // "$1,001 - $15,000"
};

// ───────────────────────────── Helpers ─────────────────────────────

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

function mmddyyyyToIso(s: string): string {
  const [m, d, y] = s.split("/");
  if (!m || !d || !y) return s;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Same as mmddyyyyToIso but for the FD index which uses single-digit M/D. */
function mmddyyyyToIsoStrict(s: string): string {
  const parts = s.split("/");
  if (parts.length !== 3) return s;
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

async function fetchToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { "User-Agent": "autotrade/1.0 (https://github.com/) research" },
  });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

// ───────────────────────────── Index ─────────────────────────────

export async function downloadAndParseIndex(years: string[]): Promise<FilingIndexRow[]> {
  const rows: FilingIndexRow[] = [];
  ensureDir(CACHE_ROOT);
  for (const year of years) {
    const zipPath = join(CACHE_ROOT, `${year}FD.zip`);
    const xmlPath = join(CACHE_ROOT, year, `${year}FD.xml`);
    if (!existsSync(xmlPath)) {
      console.log(`  fetching ${year}FD.zip…`);
      await fetchToFile(`${FD_BASE}/${year}FD.zip`, zipPath);
      ensureDir(join(CACHE_ROOT, year));
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(join(CACHE_ROOT, year), true);
    }
    const xml = readFileSync(xmlPath, "utf8");
    const $ = cheerio.load(xml, { xmlMode: true });
    $("Member").each((_, el) => {
      const $el = $(el);
      rows.push({
        year,
        last: $el.find("Last").text(),
        first: $el.find("First").text(),
        filingType: $el.find("FilingType").text(),
        stateDst: $el.find("StateDst").text(),
        filingDate: $el.find("FilingDate").text(),
        docId: $el.find("DocID").text(),
      });
    });
  }
  return rows;
}

// ───────────────────────────── PDF parser ─────────────────────────────

const ACTION_MAP: Record<string, "buy" | "sell" | "exchange"> = {
  "P": "buy",
  "S": "sell",
  "S (partial)": "sell",
  "E": "exchange",
};

// One big regex over the whole normalised text. Captures, in order:
//   1: ticker  (e.g. AVGO, BRK.B)
//   2: asset type code  (ST, OP, GS, MF, OT, …)
//   3: action  (P / S / S (partial) / E)
//   4: trade date  (MM/DD/YYYY)
//   5: notification date  (MM/DD/YYYY)
//   6: amount range  (e.g. "$1,001 - $15,000" or "Over $50,000,000")
//
// We allow up to ~120 chars between (TICKER) [CODE] and the action to skip
// over the inline "F      S     : New" boilerplate or owner code that
// occasionally lives between rows.
const TXN_RE = new RegExp(
  String.raw`\(([A-Z][A-Z0-9\.]{0,5})\)\s*\[([A-Z]{2})\]` +   // (TICKER) [CODE]
  String.raw`[^\(]{0,160}?` +                                  // skip-ahead, non-greedy, no new "("
  String.raw`(P|S \(partial\)|S|E)\s+` +                       // action
  String.raw`(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+` + // trade + notif
  String.raw`(\$\s?[\d,]+\s*-\s*\$\s?[\d,]+|Over \$\s?[\d,]+)`, // amount
  "g"
);

// To recover the asset name (best-effort) we keep the last ~80 chars
// before the (TICKER) group.
function extractAssetName(textBefore: string): string {
  const trimmed = textBefore.replace(/\s+/g, " ").trim();
  // Strip leading owner code if present.
  const stripped = trimmed.replace(/^(SP|JT|DC|OW)\s+/, "");
  return stripped.slice(-80).trim();
}

function extractOwner(textBefore: string): string {
  // Find the LAST owner-code marker before this match.
  const owners = textBefore.match(/(?:^|\s)(SP|JT|DC|OW)\s/g);
  if (!owners || owners.length === 0) return "";
  return owners[owners.length - 1].trim();
}

export function parsePtrText(text: string): ParsedPtrTransaction[] {
  // Normalise: collapse whitespace runs (including newlines) to single space.
  // PTR PDFs frequently wrap a single record across 4-5 lines.
  const normalised = text.replace(/\s+/g, " ");
  const out: ParsedPtrTransaction[] = [];

  for (const m of normalised.matchAll(TXN_RE)) {
    const ticker = m[1];
    const assetType = m[2];
    const actionRaw = m[3];
    const tradeDate = mmddyyyyToIso(m[4]);
    const notifDate = mmddyyyyToIso(m[5]);
    const amountRange = m[6].replace(/\s+/g, " ").trim();
    const action = ACTION_MAP[actionRaw];
    if (!action) continue;

    const textBefore = normalised.slice(0, m.index ?? 0);
    const assetName = extractAssetName(textBefore);
    const owner = extractOwner(textBefore);

    out.push({
      owner,
      ticker,
      assetName,
      assetType,
      action,
      actionRaw,
      tradeDate,
      notifDate,
      amountRange,
    });
  }

  return out;
}

export async function extractPtrText(pdfPath: string): Promise<string | null> {
  try {
    const buf = readFileSync(pdfPath);
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    const text = result.text || "";
    return text.trim().length > 0 ? text : null;
  } catch {
    return null;
  }
}

export async function getPtrPdf(year: string, docId: string): Promise<string> {
  const dir = join(CACHE_ROOT, "ptrs", year);
  ensureDir(dir);
  const dest = join(dir, `${docId}.pdf`);
  if (!existsSync(dest)) {
    await fetchToFile(`${PTR_BASE}/${year}/${docId}.pdf`, dest);
  }
  return dest;
}

// ───────────────────────────── Ingest one rep ─────────────────────────────

export type TargetRep = {
  /** portfolio id and slug — primary key in `portfolios` */
  slug: string;
  /** matching Last name in House Clerk XML */
  last: string;
  /** matching StateDst (e.g., "CA11", "GA14") */
  stateDst: string;
};

export type IngestResult = {
  slug: string;
  ptrsFound: number;
  ptrsParsed: number;
  ptrsSkipped: number;
  transactionsAdded: number;
  stockTransactions: number;
  optionTransactions: number;
  errors: string[];
};

// Asset type codes that we treat as "tradable equities" for portfolio building.
const TRADABLE_ASSET_TYPES = new Set(["ST", "OP"]);

export async function ingestHousePoliticianReal(
  rep: TargetRep,
  index: FilingIndexRow[],
  options: { maxPtrs?: number } = {}
): Promise<IngestResult> {
  const result: IngestResult = {
    slug: rep.slug,
    ptrsFound: 0,
    ptrsParsed: 0,
    ptrsSkipped: 0,
    transactionsAdded: 0,
    stockTransactions: 0,
    optionTransactions: 0,
    errors: [],
  };

  // Filter index for this rep's PTRs.
  const myPtrs = index
    .filter((r) => r.last === rep.last && r.stateDst === rep.stateDst && r.filingType === "P")
    .sort((a, b) => new Date(a.filingDate).getTime() - new Date(b.filingDate).getTime());

  result.ptrsFound = myPtrs.length;
  const limit = options.maxPtrs ?? myPtrs.length;
  const subset = myPtrs.slice(-limit); // take most recent N

  // Wipe prior real ingest for this portfolio.
  db.delete(transactions).where(eq(transactions.portfolioId, rep.slug)).run();
  db.delete(snapshots).where(eq(snapshots.portfolioId, rep.slug)).run();
  db.delete(positions).where(eq(positions.portfolioId, rep.slug)).run();

  // Track running set of held tickers across all parsed PTRs, in chronological
  // order, so we can emit a portfolio snapshot per disclosed date.
  const held = new Map<string, number>(); // ticker → equal-weight share until next rebalance
  const snapshotDates = new Set<string>();

  for (const row of subset) {
    const sourceUrl = `${PTR_BASE}/${row.year}/${row.docId}.pdf`;
    // The PTR's filing date is when these trades became *publicly visible*.
    // That's what a copy-trader could have actually acted on; we use it as
    // the `disclosedDate` for every row in this PTR.
    const filingIso = mmddyyyyToIsoStrict(row.filingDate);
    try {
      const pdfPath = await getPtrPdf(row.year, row.docId);
      const text = await extractPtrText(pdfPath);
      if (!text) {
        result.ptrsSkipped++;
        result.errors.push(`${row.docId}: empty text (scanned PDF)`);
        continue;
      }
      const txns = parsePtrText(text);
      result.ptrsParsed++;
      if (txns.length === 0) {
        result.ptrsSkipped++;
        continue;
      }

      for (const tx of txns) {
        // Insert raw transaction row (every disclosed action, for the activity feed).
        db.insert(transactions).values({
          id: randomUUID(),
          portfolioId: rep.slug,
          ticker: tx.ticker,
          action: tx.action === "exchange" ? "buy" : (tx.action as "buy" | "sell"),
          tradeDate: tx.tradeDate,
          disclosedDate: filingIso,
          sourceUrl,
        }).run();
        result.transactionsAdded++;

        // Only update portfolio holdings from STOCK / OPTION trades.
        if (!TRADABLE_ASSET_TYPES.has(tx.assetType)) continue;
        if (tx.assetType === "ST") result.stockTransactions++;
        if (tx.assetType === "OP") result.optionTransactions++;

        if (tx.action === "buy") {
          held.set(tx.ticker, 1);
        } else if (tx.action === "sell") {
          held.delete(tx.ticker);
        }

        // Snapshot the holdings as-of the filing date (when copy traders
        // could act). Multiple per-PTR trades collapse into one snapshot
        // for the day.
        const today = filingIso;
        snapshotDates.add(today);
        if (held.size > 0) {
          const weight = 100 / held.size;
          const holdings = Object.fromEntries([...held.keys()].map((t) => [t, weight]));
          db.insert(snapshots).values({
            id: randomUUID(),
            portfolioId: rep.slug,
            snapshotDate: today,
            holdingsJson: JSON.stringify(holdings),
          }).onConflictDoUpdate({
            target: [snapshots.portfolioId, snapshots.snapshotDate],
            set: { holdingsJson: JSON.stringify(holdings) },
          }).run();
        }
      }
    } catch (e: unknown) {
      result.ptrsSkipped++;
      result.errors.push(`${row.docId}: ${(e as Error).message}`);
    }
  }

  // Write current positions = latest held set, equal-weighted.
  if (held.size > 0) {
    const weight = 100 / held.size;
    const today = new Date().toISOString().slice(0, 10);
    for (const ticker of held.keys()) {
      db.insert(positions).values({
        portfolioId: rep.slug, ticker, weightPct: weight, shares: weight, updatedAt: today,
      }).run();
    }
  }

  // Recompute returns now that we have snapshots.
  await recomputeFor(rep.slug);

  return result;
}
