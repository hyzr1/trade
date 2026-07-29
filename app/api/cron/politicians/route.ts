// app/api/cron/politicians/route.ts
import { NextResponse } from "next/server";
import { db, portfolios } from "../../../../lib/db";
import { eq } from "drizzle-orm";
import { ingestPolitician } from "../../../../lib/ingest/politicians";
import { isAuthorizedCron } from "../../../../lib/auth";

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const all = db.select().from(portfolios).where(eq(portfolios.kind, "politician")).all();
  const results: Record<string, string> = {};
  for (const p of all) {
    try { await ingestPolitician(p.id); results[p.slug] = "ok"; }
    catch (e: unknown) { results[p.slug] = `error: ${(e as Error).message}`; }
  }
  return NextResponse.json({ ran: new Date().toISOString(), results });
}
