import { NextResponse } from "next/server";
import { analyticsSummary } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(analyticsSummary());
}
