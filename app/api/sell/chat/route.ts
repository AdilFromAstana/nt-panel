import { NextRequest, NextResponse } from "next/server";
import { aiChat, type ChatMessage } from "@/lib/groq";
import { logEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let payload: { messages?: ChatMessage[] } = {};
  try {
    payload = await req.json();
  } catch {}
  const messages = payload.messages || [];
  const result = await aiChat(messages);
  const last = [...messages].reverse().find((m) => m.role === "user")?.text || "";
  logEvent("chat", { query: last, results: result.products.length });
  return NextResponse.json(result);
}
