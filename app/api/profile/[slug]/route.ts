// app/api/profile/[slug]/route.ts
import { NextResponse } from "next/server";
import { getPortfolioProfile } from "@/lib/queries";

export const revalidate = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const d = await getPortfolioProfile(slug);
  if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(d);
}
