// app/api/sector/[name]/route.ts
import { NextResponse } from "next/server";
import { getSectorDetail } from "@/lib/queries";

export const revalidate = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name } = await ctx.params;
  const d = await getSectorDetail(decodeURIComponent(name));
  if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(d);
}
