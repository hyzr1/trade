// app/api/cron/llms/route.ts
import { NextResponse } from "next/server";
import { db, portfolios } from "../../../../lib/db";
import { eq } from "drizzle-orm";
import { rebalanceLLM } from "../../../../lib/ingest/llms";
import { isAuthorizedCron } from "../../../../lib/auth";

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const all = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  const today = new Date().toISOString().slice(0, 10);
  const results: Record<string, string> = {};
  for (const p of all) {
    try { await rebalanceLLM(p.id, today); results[p.slug] = "ok"; }
    catch (e: unknown) { results[p.slug] = `error: ${(e as Error).message}`; }
  }
  return NextResponse.json({ ran: new Date().toISOString(), results });
}
