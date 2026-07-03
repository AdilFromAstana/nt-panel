import fs from "fs";
import path from "path";

const LOG = path.join(process.cwd(), "data", "analytics.jsonl");

export const ALLOWED_EVENTS = new Set([
  "open", "card_click", "add_cart", "upsell", "whatsapp",
  "nudge_shown", "nudge_click", "exit_intent", "chat",
]);

export function logEvent(ev: string, data?: Record<string, unknown>) {
  const rec: Record<string, unknown> = { ts: new Date().toISOString().slice(0, 19), event: String(ev).slice(0, 40) };
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      rec[String(k).slice(0, 40)] = typeof v === "string" ? v.slice(0, 200) : v;
    }
  }
  try {
    fs.appendFileSync(LOG, JSON.stringify(rec) + "\n");
  } catch {}
}

function topN(counter: Map<string, number>, n: number): [string, number][] {
  return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function analyticsSummary() {
  const events: any[] = [];
  try {
    for (const line of fs.readFileSync(LOG, "utf-8").split("\n")) {
      const s = line.trim();
      if (s) {
        try {
          events.push(JSON.parse(s));
        } catch {}
      }
    }
  } catch {}

  const byType = new Map<string, number>();
  const q = new Map<string, number>();
  const zero = new Map<string, number>();
  const prods = new Map<string, number>();
  let cardClicks = 0;
  const chats = events.filter((e) => e.event === "chat");

  for (const e of events) byType.set(e.event, (byType.get(e.event) || 0) + 1);
  for (const e of chats) {
    const query = (e.query || "").trim().toLowerCase();
    if (query) {
      q.set(query, (q.get(query) || 0) + 1);
      if (e.results === 0) zero.set(query, (zero.get(query) || 0) + 1);
    }
  }
  for (const e of events) {
    if (e.event === "card_click") {
      cardClicks++;
      if (e.name) prods.set(e.name, (prods.get(e.name) || 0) + 1);
    }
  }

  const get = (k: string) => byType.get(k) || 0;
  return {
    total_events: events.length,
    chats: chats.length,
    opens: get("open"),
    whatsapp: get("whatsapp"),
    add_cart: get("add_cart"),
    upsell: get("upsell"),
    nudge_shown: get("nudge_shown"),
    nudge_click: get("nudge_click"),
    exit_intent: get("exit_intent"),
    card_clicks: cardClicks,
    by_type: topN(byType, 50),
    top_queries: topN(q, 15),
    zero_result_queries: topN(zero, 15),
    top_products: topN(prods, 10),
    first: events.length ? events[0].ts : null,
    last: events.length ? events[events.length - 1].ts : null,
  };
}
