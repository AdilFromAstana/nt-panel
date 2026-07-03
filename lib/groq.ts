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

const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function taxonomy(): string {
  const cats = sectionCategories();
  return Object.entries(SECTION_LABELS)
    .map(([sec, label]) => {
      const c = cats[sec] || {};
      const cs = Object.entries(c)
        .sort((a, b) => b[1] - a[1])
        .map(([n, v]) => `${n} (${v} шт)`)
        .join(", ");
      return `- ${sec} — ${label}: ${cs}`;
    })
    .join("\n");
}

function systemPrompt(): string {
  return (
    "Ты — вежливый консультант интернет-магазина NT Panel (Астана, Казахстан).\n" +
    "Чтобы подобрать товары, ВСЕГДА вызывай инструмент search_products — никогда не придумывай " +
    "товары, цены или наличие сам. Выборку делает база, ты только задаёшь фильтры.\n\n" +
    "РАЗДЕЛЫ И КАТЕГОРИИ (section → категории, всего товаров):\n" +
    taxonomy() +
    "\n\nПРАВИЛА ВЫБОРА КАТЕГОРИИ:\n" +
    "- Если человек называет категорию — передавай параметр category точным названием из списка выше.\n" +
    "- «панели» / «стеновые панели» = категория «Стеновые панели» (это НЕ луверы и НЕ профили).\n" +
    "- «луверы» = «Луверы»; «профиль/профили» = «Алюминиевые профили»; «стеклоблок(и)» = «Стеклоблок»; " +
    "«гибкий камень» = «Гибкий Камень»; «блоки/плита/поддон» — соответствующая категория ntblok.\n" +
    "- Если раздел/категория не указаны явно — не сужай.\n" +
    "- keywords используй для цвета/фактуры/модели (напр. «белый», «глянец», «BW 61009»), а не для категории.\n\n" +
    "Цены в тенге (₸). Отвечай по-русски, коротко и дружелюбно (1–2 предложения), товары покажутся " +
    "карточками под ответом. Если ничего не нашлось — честно скажи и предложи смягчить условия.\n\n" +
    "РОЛЬ ПРОДАВЦА-КОНСУЛЬТАНТА:\n" +
    "- Если запрос слишком общий — задай ОДИН короткий уточняющий вопрос (комната, площадь м², бюджет, " +
    "цвет/фактура) и только потом ищи. Максимум 1–2 вопроса за диалог.\n" +
    "- После подбора панелей предложи сопутствующее: профиль и крепёж — одной фразой.\n" +
    "ОФФЕРЫ (называй ТОЛЬКО эти условия, ничего не выдумывай):\n" +
    "- " +
    offersText() +
    "\n- Для расчёта скидки на объём ВСЕГДА вызывай инструмент volume_discount с суммой заказа — " +
    "никогда не считай сам. Рассрочку НЕ предлагай.\n\n" +
    "ПРОДАЖНЫЙ СЦЕНАРИЙ (веди к заказу, шаг за шагом):\n" +
    "1) КВАЛИФИКАЦИЯ: если не хватает данных — задай ОДИН вопрос (комната, площадь м², бюджет, цвет/фактура).\n" +
    "2) ПОДБОР: вызови search_products, покажи 2–4 варианта.\n" +
    "3) РАСЧЁТ: как только знаешь площадь и товар — вызови calc_quantity. Площадь одной панели посчитай из её " +
    "размера (переведи мм в м², напр. 140×3000 мм = 0.42 м²), передай цену. Скажи «нужно N шт на M м² ≈ СУММА ₸».\n" +
    "4) КОМПЛЕКТ: после панелей вызови accessories_for и предложи профиль + клей/крепёж одной фразой.\n" +
    "5) ЗАКРЫТИЕ: мягко предложи ОДНО действие — добавить в корзину или оставить телефон менеджеру для точного расчёта " +
    "и брони. Не дави, один призыв в конце.\n" +
    "Отвечай короткими шагами, не вываливай всё сразу."
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

type Card = ReturnType<typeof toCard>;

function sizeOf(attrs: Record<string, string>): string {
  const k = Object.keys(attrs || {}).find((x) => /размер/i.test(x));
  return k ? String(attrs[k] || "") : "";
}

function toNum(v: unknown): number {
  return Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;
}

function runTool(name: string, args: Record<string, unknown>): [Record<string, unknown>, Card[] | null] {
  if (name === "calc_quantity") {
    const area = toNum(args.area_m2);
    const unit = toNum(args.unit_area_m2);
    const waste = args.waste_percent != null ? toNum(args.waste_percent) : 10;
    const price = toNum(args.price_per_unit);
    if (!area || !unit) {
      return [{ error: "need_area_and_unit", note: "Нужны площадь поверхности (м²) и площадь одной единицы (м²)." }, null];
    }
    const units = Math.ceil((area * (1 + waste / 100)) / unit);
    const out: Record<string, unknown> = { area_m2: area, unit_area_m2: unit, waste_percent: waste, units };
    if (price) {
      out.price_per_unit = price;
      out.total = units * price;
      out.currency = offers().currency || "₸";
    }
    return [out, null];
  }

  if (name === "accessories_for") {
    const q = String(args.product || args.category || "").trim().toLowerCase();
    let anchor = q
      ? products().find((p) => (p.name || "").toLowerCase().includes(q) || (p.category_name || "").toLowerCase().includes(q))
      : undefined;
    if (!anchor) anchor = products().find((p) => p.section_slug === (args.section || "ntpanel"));
    const cards = anchor ? accessoriesFor(anchor).map(toCard) : [];
    const compact = cards.map((c) => ({ name: c.name, price: c.price, stock: c.stock, category: c.category }));
    return [{ accessories: compact, count: compact.length }, cards];
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
    return [out, null];
  }
  const cards = searchProducts(args as SearchFilters).map(toCard);
  const compact = cards.map((c) => ({ name: c.name, price: c.price, stock: c.stock, category: c.category, size: sizeOf(c.attrs) }));
  return [{ products: compact, count: compact.length }, cards];
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

function cleanReply(t: string): string {
  return (t || "")
    .replace(/<function=[\s\S]*?<\/function>/g, "")
    .replace(/<function=[^>]*>/g, "")
    .replace(/<\/function>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type ChatMessage = { role: "user" | "model"; text: string };
export type ChatResult = { reply: string; products: Card[]; error?: string };

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
  ];

  let found: Card[] = [];
  let reply = "";

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
      const [payload, cards] = runTool(c.function?.name, args);
      if (cards !== null) found = cards;
      convo.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(payload) });
    }
  }

  reply = cleanReply(reply);
  if (!reply) reply = found.length ? `Нашёл ${found.length} вариант(ов):` : "По вашему запросу ничего не нашлось.";
  return { reply, products: found };
}
