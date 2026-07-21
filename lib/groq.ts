import {
  SECTION_LABELS,
  sectionCategories,
  categoryNames,
  offersText,
  searchProducts,
  toCard,
  volumeDiscountFor,
  volumeTiers,
  offers,
  products,
  accessoriesFor,
  type SearchFilters,
} from "./data";
import { searchFaq } from "./faq-data";

const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function taxonomy(): string {
  const cats = sectionCategories();
  return Object.entries(SECTION_LABELS)
    .map(([sec, label]) => `- ${sec} (${label}): ${Object.keys(cats[sec] || {}).join(", ")}`)
    .join("\n");
}

function systemPrompt(): string {
  return (
    "Ты — живой продавец-консультант магазина отделочных материалов (Астана, Казахстан). Не вываливай список товаров по первому слову — " +
    "веди диалог как хороший продавец: сначала пойми задачу наводящими вопросами, потом предложи решение под неё и доведи до заказа.\n\n" +
    "ГЛАВНОЕ ПРАВИЛО: на ОБЩИЙ запрос («есть панели?», «нужны панели», «что посоветуете») НЕ вызывай search_products в " +
    "первом ответе — сначала задай ОДИН наводящий вопрос (какое помещение? площадь стены?). Ищи товары ТОЛЬКО когда понял " +
    "задачу ИЛИ человек сам назвал конкретику (цвет, модель, категорию с параметром, площадь).\n\n" +
    "ИНСТРУМЕНТЫ (никогда не выдумывай товары/цены/наличие — только через них):\n" +
    "- search_products — подбор из базы; calc_quantity — сколько нужно на площадь; accessories_for — профиль/крепёж/клей;\n" +
    "- search_faq — готовые ответы на вопросы (монтаж, уход, влага, доставка, гарантия);\n" +
    "- volume_discount — скидка за объём; add_to_cart — положить в корзину; save_lead — записать имя+телефон менеджеру.\n\n" +
    "ВОПРОСЫ «как/можно ли/чем/сколько сохнет/подойдёт ли» (монтаж, уход, влагостойкость, доставка, гарантия) — " +
    "ОТВЕЧАЙ через search_faq, не выдумывай. После ответа мягко верни к подбору/заказу.\n\n" +
    "РАЗДЕЛЫ → КАТЕГОРИИ:\n" +
    taxonomy() +
    "\nКатегорию в search_products передавай точным названием. «панели»=«Стеновые панели» (не луверы/профили); " +
    "«луверы»=«Луверы»; «профиль»=«Алюминиевые профили». keywords — для цвета/фактуры/модели, не для категории. Не сужай без нужды.\n\n" +
    "СЦЕНАРИЙ ПРОДАЖИ (SPIN — по одному вопросу за раз, максимум 2–3, не допрос):\n" +
    "1) СИТУАЦИЯ: узнай помещение (гостиная/ванная/кафе), площадь стены в м², ровная ли стена.\n" +
    "2) ПРОБЛЕМА: что важно — влагостойкость, акустика (эхо), скрыть неровности, бюджет/цвет.\n" +
    "3) ПОСЛЕДСТВИЕ+ВЫГОДА: перед предложением ОДНОЙ фразой покажи риск неверного выбора и картинку выгоды " +
    "(«во влажную зону обычный МДФ поведёт — возьмём влагостойкие, будут как бесшовная стена, моются тряпкой»).\n" +
    "4) ПОДБОР: search_products, 2–4 варианта, привязанные к тому, что человек назвал.\n" +
    "5) РАСЧЁТ: calc_quantity (площадь одной панели посчитай из её размера, мм→м², передай цену): «на M м² нужно N шт ≈ СУММА ₸».\n" +
    "6) КОМПЛЕКТ: accessories_for — предложи профиль + клей/крепёж одной фразой.\n" +
    "7) ЗАКРЫТИЕ (как само собой разумеющееся): «Добавить в корзину и подобрать профиль?» — если да, вызови add_to_cart. " +
    "Если не готов или просит менеджера — попроси имя и телефон одной фразой и вызови save_lead(name, phone, summary).\n\n" +
    "ТОН: тепло, коротко (1–2 предложения), зеркаль слова клиента, лёгкая уместная срочность (наличие/одна партия). " +
    "Цены в ₸. Офферы только реальные: " + offersText() + ". Рассрочку не предлагай; скидку за объём считай через volume_discount."
  );
}

const SEARCH_TOOL = {
  name: "search_products",
  description: "Поиск товаров в реальной базе магазина по фильтрам. Возвращает настоящие товары.",
  parameters: {
    type: "object",
    properties: {
      section: { type: "string", description: "Раздел: ntpanel, ntstone, ntbricks или ntblok" },
      category: { type: "string", description: "Категория, точное название: " + categoryNames().join(", ") },
      min_price: { type: ["number", "string"], description: "Минимальная цена, тенге" },
      max_price: { type: ["number", "string"], description: "Максимальная цена, тенге" },
      in_stock: { type: ["boolean", "string"], description: "true — только в наличии" },
      keywords: { type: "string", description: "Слова по названию/цвету/фактуре" },
      sort: { type: "string", enum: ["price_asc", "price_desc"], description: "Сортировка по цене" },
    },
  },
};

const DISCOUNT_TOOL = {
  name: "volume_discount",
  description: "Точно рассчитать скидку на объём для суммы заказа в тенге.",
  parameters: {
    type: "object",
    properties: { amount: { type: ["number", "string"], description: "Сумма заказа в тенге" } },
    required: ["amount"],
  },
};

const CALC_TOOL = {
  name: "calc_quantity",
  description:
    "Рассчитать, сколько единиц товара нужно на площадь: (площадь × (1 + запас)) ÷ площадь одной единицы, округление вверх. Если передана цена — считает итоговую стоимость.",
  parameters: {
    type: "object",
    properties: {
      area_m2: { type: ["number", "string"], description: "Площадь поверхности (стены/пола), м²" },
      unit_area_m2: { type: ["number", "string"], description: "Площадь одной панели/единицы в м² (посчитай из размера товара)" },
      price_per_unit: { type: ["number", "string"], description: "Цена за единицу, тенге (необязательно)" },
      waste_percent: { type: ["number", "string"], description: "Запас на подрез, % (по умолчанию 10)" },
    },
    required: ["area_m2", "unit_area_m2"],
  },
};

const ACCESSORY_TOOL = {
  name: "accessories_for",
  description: "Подобрать сопутствующие товары (профили, крепёж, клей) к панели/луверу по названию/модели товара, категории или разделу.",
  parameters: {
    type: "object",
    properties: {
      product: { type: "string", description: "Название или модель товара (напр. «BW 61009»)" },
      category: { type: "string", description: "Категория товара" },
      section: { type: "string", description: "Раздел: ntpanel, ntstone, ntbricks, ntblok" },
    },
  },
};

const ADDCART_TOOL = {
  name: "add_to_cart",
  description: "Добавить выбранные товары в корзину покупателя. Вызывай, когда человек согласился купить/оформить. Количество бери из расчёта (calc_quantity).",
  parameters: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Позиции для добавления",
        items: {
          type: "object",
          properties: {
            product: { type: "string", description: "Название или модель товара" },
            quantity: { type: ["number", "string"], description: "Количество, шт" },
          },
          required: ["product"],
        },
      },
    },
    required: ["items"],
  },
};

const LEAD_TOOL = {
  name: "save_lead",
  description: "Сохранить контакт покупателя для менеджера. Вызывай, когда человек оставил имя и телефон или просит перезвонить/связаться.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Имя покупателя" },
      phone: { type: "string", description: "Телефон покупателя" },
      summary: { type: "string", description: "Что подбирали / суть запроса" },
    },
    required: ["phone"],
  },
};

const FAQ_TOOL = {
  name: "search_faq",
  description:
    "Найти готовый ответ на вопрос о монтаже, раскрое, уходе, ремонте, влагостойкости, доставке, оплате, гарантии, подборе/расчёте. Используй, когда человек спрашивает «как / можно ли / чем / сколько сохнет / подойдёт ли», а не просит подобрать товар.",
  parameters: {
    type: "object",
    properties: { query: { type: "string", description: "Суть вопроса пользователя" } },
    required: ["query"],
  },
};

type Card = ReturnType<typeof toCard>;

function resolveProduct(ref: string) {
  const q = String(ref || "").trim().toLowerCase();
  if (!q) return undefined;
  return products().find((p) => String(p.id) === q) || products().find((p) => (p.name || "").toLowerCase().includes(q));
}

function sizeOf(attrs: Record<string, string>): string {
  const k = Object.keys(attrs || {}).find((x) => /размер/i.test(x));
  return k ? String(attrs[k] || "") : "";
}

function toNum(v: unknown): number {
  return Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;
}

function runTool(
  name: string,
  args: Record<string, unknown>
): [Record<string, unknown>, Card[] | null, Record<string, unknown>[] | null] {
  if (name === "add_to_cart") {
    let itemsArg: unknown = args.items;
    if (typeof itemsArg === "string") {
      try { itemsArg = JSON.parse(itemsArg); } catch { itemsArg = []; }
    }
    const raw = Array.isArray(itemsArg)
      ? (itemsArg as Record<string, unknown>[])
      : args.product
      ? [{ product: args.product, quantity: args.quantity }]
      : [];
    const items: { id: string; name: string; qty: number }[] = [];
    for (const it of raw) {
      const p = resolveProduct(String(it.product ?? it.name ?? it.id ?? ""));
      if (!p) continue;
      items.push({ id: String(p.id), name: p.name, qty: Math.max(1, Math.round(toNum(it.quantity) || 1)) });
    }
    if (!items.length) return [{ error: "not_found", note: "Не нашёл товары для добавления." }, null, null];
    return [{ added: items.length, items: items.map((i) => ({ name: i.name, qty: i.qty })) }, null, [{ type: "add_to_cart", items }]];
  }

  if (name === "save_lead") {
    const phone = String(args.phone ?? "").trim();
    if (!phone) return [{ error: "need_phone", note: "Нужен телефон покупателя." }, null, null];
    const lead = { type: "lead", name: String(args.name ?? ""), phone, summary: String(args.summary ?? "") };
    return [{ ok: true }, null, [lead]];
  }

  if (name === "search_faq") {
    const answers = searchFaq(String(args.query ?? ""), 3);
    return [{ answers, count: answers.length }, null, null];
  }

  if (name === "calc_quantity") {
    const area = toNum(args.area_m2);
    const unit = toNum(args.unit_area_m2);
    const waste = args.waste_percent != null ? toNum(args.waste_percent) : 10;
    const price = toNum(args.price_per_unit);
    if (!area || !unit) {
      return [{ error: "need_area_and_unit", note: "Нужны площадь поверхности (м²) и площадь одной единицы (м²)." }, null, null];
    }
    const units = Math.ceil((area * (1 + waste / 100)) / unit);
    const out: Record<string, unknown> = { area_m2: area, unit_area_m2: unit, waste_percent: waste, units };
    if (price) {
      out.price_per_unit = price;
      out.total = units * price;
      out.currency = offers().currency || "₸";
    }
    return [out, null, null];
  }

  if (name === "accessories_for") {
    const q = String(args.product || args.category || "").trim().toLowerCase();
    let anchor = q
      ? products().find((p) => (p.name || "").toLowerCase().includes(q) || (p.category_name || "").toLowerCase().includes(q))
      : undefined;
    if (!anchor) anchor = products().find((p) => p.section_slug === (args.section || "ntpanel"));
    const cards = anchor ? accessoriesFor(anchor).map(toCard) : [];
    const compact = cards.map((c) => ({ name: c.name, price: c.price, stock: c.stock, category: c.category }));
    return [{ accessories: compact, count: compact.length }, cards, null];
  }

  if (name === "volume_discount") {
    const amt = Number(String(args.amount ?? "").replace(/[^\d.]/g, "")) || 0;
    const pct = volumeDiscountFor(amt);
    const out: Record<string, unknown> = { amount: amt, percent: pct, currency: offers().currency || "₸" };
    const next = volumeTiers().find((t) => t.min_amount > amt);
    if (next) {
      out.next_percent = next.percent;
      out.next_min_amount = next.min_amount;
      out.add_to_next = next.min_amount - amt;
    }
    return [out, null, null];
  }
  const cards = searchProducts(args as SearchFilters).map(toCard);
  const compact = cards.map((c) => ({ name: c.name, price: c.price, stock: c.stock, category: c.category, size: sizeOf(c.attrs) }));
  return [{ products: compact, count: compact.length }, cards, null];
}

function looseArgs(text: string): Record<string, unknown> {
  const str = (re: RegExp) => text.match(re)?.[1];
  const num = (re: RegExp) => text.match(re)?.[1];
  const args: Record<string, unknown> = {};
  const section = str(/"section"\s*:\s*"([^"]+)"/);
  const category = str(/"category"\s*:\s*"([^"]+)"/);
  const keywords = str(/"keywords?"\s*:\s*"([^"]+)"/);
  const minp = num(/"min_price"\s*:\s*"?([\d.]+)"?/);
  const maxp = num(/"max_price"\s*:\s*"?([\d.]+)"?/);
  const inStock = str(/"in_stock"\s*:\s*"?(true|false)"?/);
  const sort = str(/"sort"\s*:\s*"([^"]+)"/);
  const amount = num(/"amount"\s*:\s*"?([\d.]+)"?/);
  if (section) args.section = section;
  if (category) args.category = category;
  if (keywords) args.keywords = keywords;
  if (minp) args.min_price = minp;
  if (maxp) args.max_price = maxp;
  if (inStock) args.in_stock = inStock;
  if (sort) args.sort = sort;
  if (amount) args.amount = amount;
  return args;
}

function salvageToolCall(bodyText: string): ChatResult | null {
  let failed = bodyText;
  try {
    failed = JSON.parse(bodyText)?.error?.failed_generation || bodyText;
  } catch {}
  if (!/<function=|search_products|volume_discount/.test(failed)) return null;
  const name = /volume_discount/.test(failed) && !/search_products/.test(failed) ? "volume_discount" : "search_products";

  let args: Record<string, unknown> | null = null;
  const m = failed.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      args = JSON.parse(m[0]);
    } catch {}
  }
  if (!args) args = looseArgs(failed);
  if (!Object.keys(args).length && name === "search_products") return null;

  const [, cards] = runTool(name, args);
  const found = cards || [];
  const reply = found.length ? `Нашёл ${found.length} вариант(ов):` : "По вашему запросу ничего не нашлось.";
  return { reply, products: found };
}

const TOOL_NAMES = "search_products|calc_quantity|accessories_for|search_faq|volume_discount|add_to_cart|save_lead";

function extractLeakedCalls(text: string): { name: string; args: Record<string, unknown>; start: number; end: number }[] {
  const out: { name: string; args: Record<string, unknown>; start: number; end: number }[] = [];
  const re = new RegExp(`function\\s*=\\s*(${TOOL_NAMES})\\s*>`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const i = text.indexOf("{", m.index);
    if (i < 0) continue;
    let depth = 0, j = i, inStr = false, esc = false;
    for (; j < text.length; j++) {
      const ch = text[j];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { j++; break; } }
    }
    const jsonStr = text.slice(i, j);
    let args: Record<string, unknown> = {};
    try { args = JSON.parse(jsonStr); } catch { args = looseArgs(jsonStr); }
    let end = j;
    const tail = text.slice(j).match(/^\s*<\/?function>/);
    if (tail) end = j + tail[0].length;
    out.push({ name: m[1], args, start: m.index, end });
    re.lastIndex = end;
  }
  return out;
}

function cleanReply(t: string): string {
  return (t || "")
    .replace(/<function=[\s\S]*?<\/function>/g, "")
    .replace(/<function=[^>]*>/g, "")
    .replace(/<\/function>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type ChatMessage = { role: "user" | "model"; text: string };
export type ChatResult = { reply: string; products: Card[]; actions?: Record<string, unknown>[]; toolsUsed?: string[]; error?: string };

export async function aiChat(messages: ChatMessage[]): Promise<ChatResult> {
  if (!GROQ_KEY) {
    return { reply: "ИИ-поиск пока не настроен: добавьте GROQ_API_KEY в .env.", products: [] };
  }

  const convo: Record<string, unknown>[] = [{ role: "system", content: systemPrompt() }];
  for (const m of messages) {
    convo.push({ role: m.role === "model" ? "assistant" : "user", content: String(m.text || "") });
  }

  const tools = [
    { type: "function", function: SEARCH_TOOL },
    { type: "function", function: DISCOUNT_TOOL },
    { type: "function", function: CALC_TOOL },
    { type: "function", function: ACCESSORY_TOOL },
    { type: "function", function: ADDCART_TOOL },
    { type: "function", function: LEAD_TOOL },
    { type: "function", function: FAQ_TOOL },
  ];

  let found: Card[] = [];
  let reply = "";
  const actions: Record<string, unknown>[] = [];
  const usedTools = new Set<string>();

  for (let i = 0; i < 4; i++) {
    let data: any;
    try {
      const r = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({ model: GROQ_MODEL, messages: convo, tools, tool_choice: "auto", temperature: 0.3 }),
      });
      if (!r.ok) {
        const bodyText = await r.text();
        if (r.status === 400) {
          const salvaged = salvageToolCall(bodyText);
          if (salvaged) return salvaged;
        }
        const msg =
          r.status === 429
            ? "Сейчас много запросов — подождите 10–15 секунд и повторите 🙏"
            : r.status === 401 || r.status === 403
            ? "Проблема с ключом ИИ — проверьте GROQ_API_KEY."
            : `Ошибка ИИ (${r.status}). Попробуйте ещё раз.`;
        return { reply: msg, products: [], error: bodyText.slice(0, 300) };
      }
      data = await r.json();
    } catch (e) {
      return { reply: "Не удалось связаться с ИИ. Попробуйте ещё раз.", products: [], error: String(e) };
    }

    const msg = data?.choices?.[0]?.message || {};
    const calls = msg.tool_calls || [];
    if (msg.content) reply = String(msg.content).trim();

    if (!calls.length) break;

    convo.push({ role: "assistant", content: msg.content || "", tool_calls: calls });
    for (const c of calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(c.function?.arguments || "{}");
      } catch {
        args = {};
      }
      if (c.function?.name) usedTools.add(String(c.function.name));
      const [payload, cards, acts] = runTool(c.function?.name, args);
      if (cards !== null) found = cards;
      if (acts) actions.push(...acts);
      convo.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(payload) });
    }
  }

  const leaked = extractLeakedCalls(reply);
  if (leaked.length) {
    for (const l of [...leaked].sort((a, b) => b.start - a.start)) {
      reply = reply.slice(0, l.start) + reply.slice(l.end);
    }
    for (const l of leaked) {
      usedTools.add(l.name);
      const [, cards, acts] = runTool(l.name, l.args);
      if (cards !== null) found = cards;
      if (acts) actions.push(...acts);
    }
  }

  reply = cleanReply(reply);
  if (!reply) reply = found.length ? `Нашёл ${found.length} вариант(ов):` : "По вашему запросу ничего не нашлось.";
  return { reply, products: found, actions, toolsUsed: [...usedTools] };
}
