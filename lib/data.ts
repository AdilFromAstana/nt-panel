import productsData from "@/data/products-full.json";
import offersData from "@/data/offers.json";

export type Product = {
  id: string;
  name: string;
  model?: string;
  code_1c?: string;
  price: number;
  stock: number;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  section_slug?: string;
  preview_image?: string | null;
  images?: string[];
  description?: string;
  attrs?: Record<string, string>;
};

let _products: Product[] | null = null;
export function products(): Product[] {
  if (!_products) _products = productsData as unknown as Product[];
  return _products;
}

export function productById(id: string): Product | undefined {
  return products().find((p) => String(p.id) === String(id));
}

export const SECTION_LABELS: Record<string, string> = {
  ntpanel: "Стеновые панели и луверы",
  ntstone: "Гибкий камень",
  ntbricks: "Стеклоблоки",
  ntblok: "Блоки",
};

export const SECTIONS = [
  { slug: "all", name: "Все товары" },
  { slug: "ntpanel", name: "NT Panel" },
  { slug: "ntstone", name: "NT Stone" },
  { slug: "ntbricks", name: "NT Bricks" },
  { slug: "ntblok", name: "NT-BLOK" },
];

export function sectionCategories(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const p of products()) {
    const sec = p.section_slug || "";
    const cn = p.category_name || "";
    (out[sec] = out[sec] || {});
    out[sec][cn] = (out[sec][cn] || 0) + 1;
  }
  return out;
}

export function categoryNames(): string[] {
  const set = new Set<string>();
  for (const p of products()) if (p.category_name) set.add(p.category_name);
  return [...set].sort((a, b) => a.localeCompare(b, "ru"));
}

type Tier = { min_amount: number; percent: number };
type Offers = { currency: string; volume_discounts: Tier[]; note?: string };

let _offers: Offers | null = null;
export function offers(): Offers {
  if (!_offers) _offers = offersData as unknown as Offers;
  return _offers;
}

export function volumeTiers(): Tier[] {
  return [...(offers().volume_discounts || [])].sort((a, b) => a.min_amount - b.min_amount);
}

export function volumeDiscountFor(amount: number): number {
  let pct = 0;
  for (const t of volumeTiers()) if (amount >= t.min_amount) pct = t.percent;
  return pct;
}

export function offersText(): string {
  const tiers = volumeTiers();
  if (!tiers.length) return "Спецпредложений сейчас нет.";
  const cur = offers().currency || "₸";
  const parts = tiers.map(
    (t) => `от ${t.min_amount.toLocaleString("ru-RU").replace(/,/g, " ")} ${cur} — ${t.percent}%`
  );
  return "Скидки на объём заказа: " + parts.join(", ") + ". Рассрочку НЕ предлагаем.";
}

const stem = (w: string) => w.slice(0, Math.max(4, w.length - 2));

function asBool(v: unknown): boolean {
  if (typeof v === "string") return ["true", "1", "yes", "да"].includes(v.trim().toLowerCase());
  return Boolean(v);
}

function asNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v.replace(/[^\d.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : null;
}

export type SearchFilters = {
  section?: string;
  category?: string;
  min_price?: number | string;
  max_price?: number | string;
  in_stock?: boolean | string;
  keywords?: string;
  sort?: "price_asc" | "price_desc";
};

export function searchProducts(f: SearchFilters = {}): Product[] {
  let rows = products();
  if (f.section && SECTION_LABELS[f.section]) {
    rows = rows.filter((p) => p.section_slug === f.section);
  }
  const cat = (f.category || "").trim().toLowerCase();
  if (cat) {
    const cw = cat.split(/\s+/).filter((w) => w.length >= 3).map(stem);
    const matches = rows.filter(
      (p) => cw.length > 0 && cw.every((w) => (p.category_name || "").toLowerCase().includes(w))
    );
    if (matches.length) rows = matches;
  }
  if (asBool(f.in_stock)) rows = rows.filter((p) => (p.stock || 0) > 0);
  const mn = asNum(f.min_price);
  const mx = asNum(f.max_price);
  if (mn !== null) rows = rows.filter((p) => p.price >= mn);
  if (mx !== null) rows = rows.filter((p) => p.price <= mx);
  const kw = (f.keywords || "").trim().toLowerCase();
  if (kw) {
    const words = kw.split(/\s+/).filter((w) => w.length >= 3).map(stem);
    const hay = (p: Product) =>
      [p.name || "", p.category_name || "", ...Object.values(p.attrs || {}).map(String)]
        .join(" ")
        .toLowerCase();
    rows = rows.filter((p) => words.every((w) => hay(p).includes(w)));
  }
  if (f.sort === "price_asc") rows = [...rows].sort((a, b) => a.price - b.price);
  else if (f.sort === "price_desc") rows = [...rows].sort((a, b) => b.price - a.price);
  return rows.slice(0, 10);
}

export function toCard(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock ?? 0,
    preview_image: p.preview_image,
    section: SECTION_LABELS[p.section_slug || ""] || "",
    category: p.category_name || "",
    attrs: p.attrs || {},
  };
}

export type FeedCard = {
  id: string;
  name: string;
  price: number;
  stock: number;
  preview_image?: string | null;
  category_name?: string;
  size?: string;
  isNew?: boolean;
};

export function feedCard(p: Product): FeedCard {
  const sizeKey = Object.keys(p.attrs || {}).find((k) => /размер/i.test(k));
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: Number(p.stock) || 0,
    preview_image: p.preview_image ?? null,
    category_name: p.category_name || "",
    size: sizeKey ? p.attrs![sizeKey] : "",
    isNew: Number(p.id) >= 280,
  };
}

function attrVal(p: Product, key: string): string {
  const k = Object.keys(p.attrs || {}).find((x) => x.toLowerCase().includes(key.toLowerCase()));
  return k ? String(p.attrs![k] || "") : "";
}

function codeFamily(name: string): string {
  const m = name.match(/[a-zа-я]{1,3}\s?\d{3,6}/i);
  return m ? m[0].toLowerCase().replace(/\s+/g, "") : "";
}

export function variantsOf(p: Product, limit = 8): Product[] {
  const fam = codeFamily(p.name);
  if (!fam) return [];
  return products()
    .filter((x) => String(x.id) !== String(p.id) && x.category_id === p.category_id && codeFamily(x.name) === fam)
    .slice(0, limit);
}

const ACCESSORY_CATS = ["Алюминиевые профили", "Материалы крепления"];

export function accessoriesFor(p: Product, limit = 8): Product[] {
  const pool = products().filter((x) => String(x.id) !== String(p.id));
  const isAccessory = ACCESSORY_CATS.includes(p.category_name || "");
  const list = isAccessory
    ? pool.filter((x) => x.section_slug === p.section_slug && !ACCESSORY_CATS.includes(x.category_name || ""))
    : pool.filter((x) => ACCESSORY_CATS.includes(x.category_name || ""));
  return [...list].sort((a, b) => Number(b.stock) - Number(a.stock)).slice(0, limit);
}

export function sameCategoryItems(p: Product, exclude: Set<string>, limit = 8): Product[] {
  return products()
    .filter((x) => x.category_id === p.category_id && String(x.id) !== String(p.id) && !exclude.has(String(x.id)))
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, limit);
}

export function similarTo(p: Product, exclude: Set<string> = new Set()): Product[] {
  const pColor = attrVal(p, "Цвет"), pFab = attrVal(p, "Фактура"), pForm = attrVal(p, "Форма");
  return products()
    .filter((x) => String(x.id) !== String(p.id) && !exclude.has(String(x.id)))
    .map((x) => {
      let s = 0;
      if (x.category_id === p.category_id) s += 100;
      if (x.section_slug === p.section_slug) s += 40;
      if (pColor && attrVal(x, "Цвет") === pColor) s += 10;
      if (pFab && attrVal(x, "Фактура") === pFab) s += 10;
      if (pForm && attrVal(x, "Форма") === pForm) s += 10;
      const pd = p.price ? Math.abs(x.price - p.price) / p.price : 1;
      s += Math.max(0, 20 - pd * 20);
      return { x, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((o) => o.x);
}
