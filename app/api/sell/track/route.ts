import { NextRequest, NextResponse } from "next/server";
import { logEvent, ALLOWED_EVENTS } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let payload: { event?: string; data?: Record<string, unknown> } = {};
  try {
    payload = await req.json();
  } catch {}
  if (payload.event && ALLOWED_EVENTS.has(payload.event)) {
    logEvent(payload.event, payload.data || {});
  }
  return NextResponse.json({ ok: true });
}
