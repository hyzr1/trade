// app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { getCalendarMonth } from "@/lib/queries";

export const revalidate = 60;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const data = await getCalendarMonth(month);
  return NextResponse.json(data);
}
