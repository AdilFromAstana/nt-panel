"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import SiteHeader from "./SiteHeader";
import { IconClose, IconCheck } from "./Icons";

type Product = {
  id: string; name: string; price: number; stock: number; category_id: string;
  category_name?: string; section_slug?: string; preview_image?: string | null;
  images?: string[]; description?: string; attrs?: Record<string, string>;
};

const SECTIONS = [
  { slug: "all", name: "Все товары" },
  { slug: "ntpanel", name: "Декоративные панели" },
  { slug: "ntstone", name: "Гибкий камень" },
  { slug: "ntbricks", name: "Стеклоблоки" },
  { slug: "ntblok", name: "Стеновые блоки" },
];
const PER = 24;
const FACET_LIMIT = 6;
const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";

function availability(p: Product) {
  const s = Number(p.stock);
  if (s <= 0) return { cls: "bg-[#8a8a93]", txt: "Под заказ" };
  if (s <= 10) return { cls: "bg-[#c9772a]", txt: "Осталось мало" };
  return { cls: "bg-[#2e8b4f]", txt: "В наличии" };
}
function sizeAttr(p: Product) {
  const k = Object.keys(p.attrs || {}).find((k) => /размер/i.test(k));
  return k ? p.attrs![k] : "";
}

export default function CatalogClient({
  products, initialSection, initialQ,
}: { products: Product[]; variant?: string; initialSection?: string; initialQ?: string }) {
  const [section, setSection] = useState(
    initialSection && SECTIONS.some((s) => s.slug === initialSection) ? initialSection : "all"
  );
  const [category, setCategory] = useState<string | null>(null);
  const [inStock, setInStock] = useState(false);
  const [q, setQ] = useState((initialQ || "").trim());
  const [attrs, setAttrs] = useState<Record<string, string[]>>({});
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [sort, setSort] = useState("pop");
  const [shown, setShown] = useState(PER);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [qv, setQv] = useState<Product | null>(null);
  const [qvImg, setQvImg] = useState("");
  const [toast, setToast] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [favs, setFavs] = useState<Record<string, number>>({});
  const cartRef = useRef<Record<string, number | Record<string, number>>>({});

  useEffect(() => {
    try {
      cartRef.current = JSON.parse(localStorage.getItem("ntcart2") || "{}");
    } catch {
      cartRef.current = {};
    }
    setFavs((cartRef.current.__fav as Record<string, number>) || {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function persist() {
    localStorage.setItem("ntcart2", JSON.stringify(cartRef.current));
    window.dispatchEvent(new Event("ntcart-change"));
  }
  function addCart(id: string) {
    const c = cartRef.current as Record<string, number>;
    c[id] = ((c[id] as number) || 0) + 1;
    persist();
    setToast("Добавлено в корзину");
  }
  function toggleFav(id: string) {
    const c = cartRef.current as { __fav?: Record<string, number> };
    c.__fav = c.__fav || {};
    if (c.__fav[id]) delete c.__fav[id];
    else c.__fav[id] = 1;
    persist();
    setFavs({ ...c.__fav });
  }

  const pool = useMemo(
    () => (section === "all" ? products : products.filter((p) => p.section_slug === section)),
    [products, section]
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    SECTIONS.forEach((s) => (c[s.slug] = s.slug === "all" ? products.length : products.filter((p) => p.section_slug === s.slug).length));
    return c;
  }, [products]);
  const categoriesOf = useMemo(() => {
    const m: Record<string, { id: string; name: string; count: number }> = {};
    for (const p of pool) {
      const id = String(p.category_id), nm = p.category_name || "—";
      (m[id] = m[id] || { id, name: nm, count: 0 }).count++;
    }
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [pool]);
  const facetCounts = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const p of pool)
      for (const [k, v] of Object.entries(p.attrs || {})) {
        if (v == null || v === "") continue;
        m[k] = m[k] || {};
        m[k][v] = (m[k][v] || 0) + 1;
      }
    return m;
  }, [pool]);
  const pb = useMemo(() => {
    const ps = pool.map((p) => p.price);
    if (!ps.length) return { min: 0, max: 0 };
    return { min: Math.min(...ps), max: Math.max(...ps) };
  }, [pool]);

  const filtered = useMemo(() => {
    let list = pool;
    if (category) list = list.filter((p) => String(p.category_id) === String(category));
    if (inStock) list = list.filter((p) => Number(p.stock) > 0);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
    }
    if (min != null) list = list.filter((p) => p.price >= min);
    if (max != null) list = list.filter((p) => p.price <= max);
    for (const [k, sel] of Object.entries(attrs))
      if (sel.length) list = list.filter((p) => sel.includes(String((p.attrs || {})[k])));
    if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "exp") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "new") list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    return list;
  }, [pool, category, inStock, q, min, max, attrs, sort]);

  const slice = filtered.slice(0, shown);

  const vmin = min != null ? min : pb.min;
  const vmax = max != null ? max : pb.max;
  const span = pb.max - pb.min || 1;
  const fillLeft = ((Math.min(vmin, vmax) - pb.min) / span) * 100;
  const fillWidth = ((Math.max(vmin, vmax) - Math.min(vmin, vmax)) / span) * 100;
  function applyRange(a: number, b: number) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    setMin(lo > pb.min ? lo : null);
    setMax(hi < pb.max ? hi : null);
    setShown(PER);
  }

  function chooseSection(sec: string) {
    setSection(sec); setCategory(null); setAttrs({}); setMin(null); setMax(null); setShown(PER);
  }
  function toggleAttr(k: string, v: string, on: boolean) {
    setAttrs((prev) => {
      const cur = new Set(prev[k] || []);
      if (on) cur.add(v);
      else cur.delete(v);
      return { ...prev, [k]: [...cur] };
    });
    setShown(PER);
  }
  function resetFilters() {
    setCategory(null); setInStock(false); setAttrs({}); setMin(null); setMax(null); setExpanded({});
  }
  function openQV(p: Product) {
    setQv(p);
    setQvImg((p.images && p.images[0]) || p.preview_image || "");
  }

  const sn = (SECTIONS.find((s) => s.slug === section) || {}).name || section;
  const rangeCls =
    "pointer-events-none absolute -left-1.5 -top-[9px] m-0 h-[22px] w-[calc(100%+12px)] appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-[#1f5fd0] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,.18)] " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-[#1f5fd0] [&::-moz-range-thumb]:bg-white";

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1b1b1f]">
      <SiteHeader q={q} onSearch={(v) => { setQ(v.trim()); setShown(PER); }} />

      <main className="mx-auto max-w-[1280px] px-4">
        <nav className="my-3 text-[13px] text-[#7b7b86]">Главная / <b className="text-[#1b1b1f]">Каталог</b></nav>

        <div className="mb-[18px] -mx-4 flex gap-2.5 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:px-0">
          {SECTIONS.map((s) => (
            <button key={s.slug} onClick={() => chooseSection(s.slug)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm ${section === s.slug ? "border-[#1b1b1f] bg-[#1b1b1f] text-white" : "border-[#ececf0] bg-white"}`}>
              {s.name}<b className={`ml-1.5 font-semibold ${section === s.slug ? "text-[#cfcfd6]" : "text-[#7b7b86]"}`}>{counts[s.slug]}</b>
            </button>
          ))}
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-[248px_1fr]">
          <div onClick={() => setSideOpen(false)} className={`fixed inset-0 z-[88] bg-black/45 md:hidden ${sideOpen ? "block" : "hidden"}`} />
          <aside className={`fixed top-0 bottom-0 left-0 z-[90] w-[min(340px,86vw)] overflow-auto bg-white px-4 pb-4 shadow-[2px_0_24px_rgba(0,0,0,.18)] transition-transform duration-200 ${sideOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-[78px] md:z-auto md:max-h-[calc(100vh-100px)] md:w-auto md:translate-x-0 md:self-start md:rounded-2xl md:border md:border-[#ececf0] md:pb-0 md:shadow-none`}>
            <div className="sticky top-0 z-[3] mb-0.5 flex items-center justify-between border-b border-[#ececf0] bg-white pb-3 pt-3.5 md:hidden">
              <span className="text-[17px] font-bold">Фильтры</span>
              <button onClick={() => setSideOpen(false)} aria-label="Закрыть" className="flex p-0.5 text-[#7b7b86]"><IconClose className="h-5 w-5" /></button>
            </div>

            <div className="border-b border-[#f0f0f3] py-4">
              <div className="mb-3 text-sm font-semibold">Категория</div>
              {section === "all" ? (
                SECTIONS.filter((s) => s.slug !== "all").map((s) => (
                  <a key={s.slug} onClick={() => chooseSection(s.slug)} className="flex cursor-pointer items-center py-1.5 text-sm hover:text-[#1f5fd0]">
                    {s.name}<i className="ml-auto not-italic text-[13px] text-[#7b7b86]">{products.filter((p) => p.section_slug === s.slug).length}</i>
                  </a>
                ))
              ) : (
                <>
                  <a onClick={() => chooseSection("all")} className="mb-1 flex cursor-pointer items-center gap-0.5 py-1.5 text-sm text-[#7b7b86]">
                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M14.6 6.5a1.5 1.5 0 0 1-.1 2.1L10.7 12l3.8 3.4a1.5 1.5 0 1 1-2 2.2l-5-4.5a1.5 1.5 0 0 1 0-2.2l5-4.5a1.5 1.5 0 0 1 2.1.1" /></svg>
                    <span>Все товары</span>
                  </a>
                  <div className="py-1.5 text-sm font-bold">{sn}</div>
                  {categoriesOf.map((c) => (
                    <a key={c.id} onClick={() => { setCategory(String(category) === c.id ? null : c.id); setShown(PER); }}
                      className={`flex cursor-pointer items-center py-1.5 pl-3.5 text-sm hover:text-[#1f5fd0] ${String(category) === c.id ? "font-semibold text-[#1f5fd0]" : ""}`}>
                      {c.name}<i className="ml-auto not-italic text-[13px] text-[#7b7b86]">{c.count}</i>
                    </a>
                  ))}
                </>
              )}
            </div>

            <div className="border-b border-[#f0f0f3] py-4">
              <label className="flex cursor-pointer items-center justify-between text-sm">
                <span>Только в наличии</span>
                <span className="relative inline-block h-[22px] w-[38px] shrink-0">
                  <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setShown(PER); }} className="peer sr-only" />
                  <span className="absolute inset-0 rounded-full bg-[#d7d7de] transition peer-checked:bg-[#1f5fd0]" />
                  <span className="absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white transition peer-checked:translate-x-4" />
                </span>
              </label>
            </div>

            <div className="border-b border-[#f0f0f3] py-4">
              <div className="mb-3 text-sm font-semibold">Цена, ₸</div>
              <div>
                <div className="relative mx-1.5 mb-[18px] mt-3.5 h-1 rounded bg-[#e6e6ec]">
                  <div className="absolute h-full rounded bg-[#1f5fd0]" style={{ left: fillLeft + "%", width: fillWidth + "%" }} />
                  <input type="range" min={pb.min} max={pb.max} value={vmin} onChange={(e) => applyRange(+e.target.value, vmax)} className={rangeCls} />
                  <input type="range" min={pb.min} max={pb.max} value={vmax} onChange={(e) => applyRange(vmin, +e.target.value)} className={rangeCls} />
                </div>
                <div className="flex gap-2.5">
                  <label className="flex flex-1 items-center gap-1.5 rounded-[9px] border border-[#ececf0] px-2.5 py-[7px] text-[13px] text-[#7b7b86]">от
                    <input type="number" value={Math.round(vmin)} onChange={(e) => applyRange(+e.target.value || pb.min, vmax)} className="w-full border-none bg-transparent text-sm text-[#1b1b1f] outline-none" /></label>
                  <label className="flex flex-1 items-center gap-1.5 rounded-[9px] border border-[#ececf0] px-2.5 py-[7px] text-[13px] text-[#7b7b86]">до
                    <input type="number" value={Math.round(vmax)} onChange={(e) => applyRange(vmin, +e.target.value || pb.max)} className="w-full border-none bg-transparent text-sm text-[#1b1b1f] outline-none" /></label>
                </div>
              </div>
            </div>

            {Object.keys(facetCounts).map((k) => {
              const vals = Object.keys(facetCounts[k]).sort((a, b) => a.localeCompare(b, "ru"));
              const show = expanded[k] ? vals : vals.slice(0, FACET_LIMIT);
              return (
                <div className="border-b border-[#f0f0f3] py-4 last:border-b-0" key={k}>
                  <div className="mb-3 text-sm font-semibold">{k}</div>
                  {show.map((v) => {
                    const on = (attrs[k] || []).includes(v);
                    return (
                      <label className="relative flex cursor-pointer items-center gap-2.5 py-[5px] text-sm" key={v}>
                        <input type="checkbox" checked={on} onChange={(e) => toggleAttr(k, v, e.target.checked)} className="peer sr-only" />
                        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px] border-[#cdcdd5] transition peer-checked:border-[#1f5fd0] peer-checked:bg-[#1f5fd0]" />
                        <IconCheck className="pointer-events-none absolute left-[3px] top-1/2 hidden h-3 w-3 -translate-y-1/2 text-white peer-checked:block" />
                        <span className="flex-1 leading-tight">{v}</span>
                        <em className="not-italic text-xs text-[#7b7b86]">{facetCounts[k][v]}</em>
                      </label>
                    );
                  })}
                  {vals.length > FACET_LIMIT && (
                    <button className="mt-2 p-0 text-[13px] text-[#1f5fd0]" onClick={() => setExpanded((p) => ({ ...p, [k]: !p[k] }))}>
                      {expanded[k] ? "Свернуть" : "Посмотреть все"}
                    </button>
                  )}
                </div>
              );
            })}

            <button className="my-4 w-full rounded-[10px] border border-[#ececf0] bg-white p-[11px] text-sm hover:border-[#1f5fd0] hover:text-[#1f5fd0]" onClick={resetFilters}>Сбросить фильтры</button>
            <button className="sticky bottom-0 mt-3 block w-full rounded-[10px] bg-[#2f6b3f] p-3.5 text-[15px] font-bold text-white shadow-[0_-10px_14px_rgba(255,255,255,.95)] md:hidden" onClick={() => setSideOpen(false)}>Показать {filtered.length} товаров</button>
          </aside>

          <section>
            {(() => {
              const activeFilters =
                (category ? 1 : 0) + (inStock ? 1 : 0) + (min != null || max != null ? 1 : 0) +
                Object.values(attrs).reduce((a, s) => a + (s.length ? 1 : 0), 0);
              const options = (
                <>
                  <option value="pop">Популярные</option>
                  <option value="cheap">Сначала дешевле</option>
                  <option value="exp">Сначала дороже</option>
                  <option value="new">Новинки</option>
                </>
              );
              return (
                <div className="mb-4">
                  <div className="hidden items-center gap-3.5 md:flex">
                    <span className="text-sm text-[#7b7b86]">Найдено: {filtered.length}</span>
                    <label className="ml-auto text-sm text-[#7b7b86]">Сортировка:
                      <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-1.5 h-[38px] rounded-[9px] border border-[#ececf0] bg-white px-2.5">{options}</select>
                    </label>
                  </div>

                  <div className="md:hidden">
                    <div className="mb-2.5 text-sm text-[#7b7b86]">Найдено: <b className="text-[#1b1b1f]">{filtered.length}</b> товаров</div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button onClick={() => setSideOpen(true)} className="relative flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ececf0] bg-white text-[15px] font-semibold text-[#1b1b1f] active:scale-[.98]">
                        <svg className="h-5 w-5 text-[#7b7b86]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" /></svg>
                        Фильтры
                        {activeFilters > 0 && <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#2f6b3f] px-1 text-xs font-bold text-white">{activeFilters}</span>}
                      </button>
                      <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b7b86]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" /></svg>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-[#ececf0] bg-white pl-10 pr-9 text-[15px] font-semibold text-[#1b1b1f]">{options}</select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7b86]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {slice.length === 0 && <div className="p-10 text-[#999]">Ничего не найдено</div>}
              {slice.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  preview_image={p.preview_image}
                  category_name={p.category_name}
                  size={sizeAttr(p)}
                  stock={p.stock}
                  isNew={Number(p.id) >= 280}
                  fav={!!favs[p.id]}
                  onFav={() => toggleFav(p.id)}
                  onAddCart={() => addCart(p.id)}
                  onQuickView={() => openQV(p)}
                />
              ))}
            </div>

            <div className={`mt-6 flex justify-center ${shown >= filtered.length ? "hidden" : ""}`}>
              <button onClick={() => setShown((s) => s + PER)} className="rounded-[10px] border border-[#ececf0] bg-white px-[30px] py-3 text-[15px]">Показать ещё</button>
            </div>
          </section>
        </div>
      </main>

      <div className={`fixed inset-0 z-[60] bg-black/45 ${qv ? "block" : "hidden"}`} onClick={() => setQv(null)} />
      {qv && (() => {
        const a = availability(qv);
        const gal = ((qv.images && qv.images.length ? qv.images : [qv.preview_image]) as (string | null | undefined)[]).filter(Boolean) as string[];
        const at = Object.entries(qv.attrs || {});
        return (
          <div className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[min(900px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white">
            <button className="absolute right-3.5 top-3 z-10 text-[#7b7b86]" onClick={() => setQv(null)} aria-label="Закрыть"><IconClose className="h-5 w-5" /></button>
            <div className="grid gap-6 p-[22px] md:grid-cols-2">
              <div>
                <div className="aspect-[4/5] rounded-xl border border-[#ececf0] bg-[#f3f1ec] bg-contain bg-center bg-no-repeat" style={qvImg ? { backgroundImage: `url('${qvImg}')` } : undefined} />
                {gal.length > 1 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {gal.map((s) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={s} src={s} alt="" onClick={() => setQvImg(s)} className="h-[58px] w-[58px] cursor-pointer rounded-lg border border-[#ececf0] object-cover" />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-[#7b7b86]">{qv.category_name || ""}</div>
                <h2 className="mb-1.5 text-[22px] font-bold">{qv.name}</h2>
                <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${a.cls}`}>{a.txt}{Number(qv.stock) > 0 ? " · " + qv.stock + " шт" : ""}</span>
                <div className="my-2 text-[26px] font-extrabold">{fmt(qv.price)}</div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#f14635]">
                  <span className="rounded bg-[#f14635] px-1.5 py-px text-[10px] text-white">Kaspi</span>
                  0-0-12 · {fmt(Math.round(qv.price / 12))}/мес
                </div>
                <button className="mt-3.5 w-[220px] rounded-[10px] bg-[#2f6b3f] py-2.5 font-semibold text-white hover:brightness-95" onClick={() => addCart(qv.id)}>В корзину</button>
                {at.length > 0 && (
                  <table className="mt-3 w-full border-collapse">
                    <tbody>{at.map(([k, v]) => (<tr key={k}><td className="w-[48%] border-b border-[#ececf0] px-2 py-[7px] text-sm text-[#7b7b86]">{k}</td><td className="border-b border-[#ececf0] px-2 py-[7px] text-sm">{v}</td></tr>))}</tbody>
                  </table>
                )}
                {qv.description && <p className="mt-3 text-[#555]">{qv.description}</p>}
              </div>
            </div>
          </div>
        );
      })()}

      <div className={`fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[10px] bg-[#13131a] px-5 py-3 text-sm font-semibold text-white transition-all ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"}`}>{toast}</div>
    </div>
  );
}
