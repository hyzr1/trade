// app/api/ticker/[symbol]/route.ts
import { NextResponse } from "next/server";
import { getTickerDetail } from "@/lib/queries";

export const revalidate = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await ctx.params;
  const d = await getTickerDetail(symbol);
  if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(d);
}
