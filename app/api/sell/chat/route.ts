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

  const funnel: Record<string, string> = {
    search_products: "sell_search",
    calc_quantity: "sell_calc",
    accessories_for: "sell_accessories",
    search_faq: "sell_faq",
  };
  for (const t of result.toolsUsed || []) {
    if (funnel[t]) logEvent(funnel[t], { query: last });
  }

  return NextResponse.json(result);
}
