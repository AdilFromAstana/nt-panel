"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import SiteHeader from "./SiteHeader";

type Product = {
  id: string; name: string; price: number; stock: number; category_id: string;
  category_name?: string; section_slug?: string; preview_image?: string | null;
  images?: string[]; description?: string; attrs?: Record<string, string>;
};

const SECTIONS = [
  { slug: "all", name: "Все товары" },
  { slug: "ntpanel", name: "NT Panel" },
  { slug: "ntstone", name: "NT Stone" },
  { slug: "ntbricks", name: "NT Bricks" },
  { slug: "ntblok", name: "NT-BLOK" },
];
const PER = 24;
const FACET_LIMIT = 6;
const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";

function availability(p: Product) {
  const s = Number(p.stock);
  if (s <= 0) return { cls: "order", txt: "Под заказ" };
  if (s <= 10) return { cls: "low", txt: "Осталось мало" };
  return { cls: "stock", txt: "В наличии" };
}
function sizeAttr(p: Product) {
  const k = Object.keys(p.attrs || {}).find((k) => /размер/i.test(k));
  return k ? p.attrs![k] : "";
}

export default function CatalogClient({
  products, variant, initialSection, initialQ,
}: { products: Product[]; variant: string; initialSection?: string; initialQ?: string }) {
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

  return (
    <div className="catalog-root" data-variant={variant}>
      <SiteHeader q={q} onSearch={(v) => { setQ(v.trim()); setShown(PER); }} />

      <main className="wrap">
        <nav className="crumbs">Главная / <b>Каталог</b></nav>

        <div className="chips">
          {SECTIONS.map((s) => (
            <button key={s.slug} className={`chip ${section === s.slug ? "on" : ""}`} onClick={() => chooseSection(s.slug)}>
              {s.name}<b>{counts[s.slug]}</b>
            </button>
          ))}
        </div>

        <div className="layout">
          <aside className={`side ${sideOpen ? "open" : ""}`}>
            <div className="ozg ozcat">
              <div className="ozg__h">Категория</div>
              {section === "all" ? (
                SECTIONS.filter((s) => s.slug !== "all").map((s) => (
                  <a key={s.slug} className="ozcat__row" onClick={() => chooseSection(s.slug)}>
                    {s.name}<i>{products.filter((p) => p.section_slug === s.slug).length}</i>
                  </a>
                ))
              ) : (
                <>
                  <a className="ozcat__back" onClick={() => chooseSection("all")}>
                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M14.6 6.5a1.5 1.5 0 0 1-.1 2.1L10.7 12l3.8 3.4a1.5 1.5 0 1 1-2 2.2l-5-4.5a1.5 1.5 0 0 1 0-2.2l5-4.5a1.5 1.5 0 0 1 2.1.1" /></svg>
                    <span>Все товары</span>
                  </a>
                  <div className="ozcat__cur">{sn}</div>
                  {categoriesOf.map((c) => (
                    <a key={c.id} className={`ozcat__child ${String(category) === c.id ? "on" : ""}`}
                      onClick={() => { setCategory(String(category) === c.id ? null : c.id); setShown(PER); }}>
                      {c.name}<i>{c.count}</i>
                    </a>
                  ))}
                </>
              )}
            </div>

            <div className="ozg">
              <label className="oztog">
                <span>Только в наличии</span>
                <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setShown(PER); }} />
                <i />
              </label>
            </div>

            <div className="ozg">
              <div className="ozg__h">Цена, ₸</div>
              <div className="ozrange">
                <div className="ozrange__track">
                  <div className="ozrange__fill" style={{ left: fillLeft + "%", width: fillWidth + "%" }} />
                  <input type="range" min={pb.min} max={pb.max} value={vmin} onChange={(e) => applyRange(+e.target.value, vmax)} />
                  <input type="range" min={pb.min} max={pb.max} value={vmax} onChange={(e) => applyRange(vmin, +e.target.value)} />
                </div>
                <div className="ozrange__io">
                  <label>от<input type="number" value={Math.round(vmin)} onChange={(e) => applyRange(+e.target.value || pb.min, vmax)} /></label>
                  <label>до<input type="number" value={Math.round(vmax)} onChange={(e) => applyRange(vmin, +e.target.value || pb.max)} /></label>
                </div>
              </div>
            </div>

            {Object.keys(facetCounts).map((k) => {
              const vals = Object.keys(facetCounts[k]).sort((a, b) => a.localeCompare(b, "ru"));
              const show = expanded[k] ? vals : vals.slice(0, FACET_LIMIT);
              return (
                <div className="ozg" key={k}>
                  <div className="ozg__h">{k}</div>
                  {show.map((v) => {
                    const on = (attrs[k] || []).includes(v);
                    return (
                      <label className="ozchk" key={v}>
                        <input type="checkbox" checked={on} onChange={(e) => toggleAttr(k, v, e.target.checked)} />
                        <i /><span>{v}</span><em>{facetCounts[k][v]}</em>
                      </label>
                    );
                  })}
                  {vals.length > FACET_LIMIT && (
                    <button className="ozmore" onClick={() => setExpanded((p) => ({ ...p, [k]: !p[k] }))}>
                      {expanded[k] ? "Свернуть" : "Посмотреть все"}
                    </button>
                  )}
                </div>
              );
            })}

            <button className="ozall" onClick={resetFilters}>Сбросить фильтры</button>
          </aside>

          <section className="main">
            <div className="bar">
              <span className="bar__count">Найдено: {filtered.length}</span>
              <label className="bar__sort">Сортировка:
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="pop">Популярные</option>
                  <option value="cheap">Сначала дешевле</option>
                  <option value="exp">Сначала дороже</option>
                  <option value="new">Новинки</option>
                </select>
              </label>
              <button className="bar__filt" onClick={() => setSideOpen((v) => !v)}>Фильтры</button>
            </div>

            <div className="grid">
              {slice.length === 0 && <div style={{ padding: 40, color: "#999" }}>Ничего не найдено</div>}
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

            <div className={`more ${shown >= filtered.length ? "hide" : ""}`}>
              <button onClick={() => setShown((s) => s + PER)}>Показать ещё</button>
            </div>
          </section>
        </div>
      </main>

      <div className={`overlay ${qv ? "on" : ""}`} onClick={() => setQv(null)} />
      {qv && (() => {
        const a = availability(qv);
        const gal = ((qv.images && qv.images.length ? qv.images : [qv.preview_image]) as (string | null | undefined)[]).filter(Boolean) as string[];
        const at = Object.entries(qv.attrs || {});
        return (
          <div className="qv on">
            <button className="qv__close" onClick={() => setQv(null)}>✕</button>
            <div className="qv__in">
              <div className="qv__gal">
                <div className="main" style={qvImg ? { backgroundImage: `url('${qvImg}')` } : undefined} />
                {gal.length > 1 && (
                  <div className="th">
                    {gal.map((s) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={s} src={s} alt="" onClick={() => setQvImg(s)} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="card__cat">{qv.category_name || ""}</div>
                <h2>{qv.name}</h2>
                <span className={`bdg bdg--${a.cls}`}>{a.txt}{Number(qv.stock) > 0 ? " · " + qv.stock + " шт" : ""}</span>
                <div className="qv__price">{fmt(qv.price)}</div>
                <div className="card__kaspi" style={{ fontSize: 14 }}>Kaspi 0-0-12 · {fmt(Math.round(qv.price / 12))}/мес</div>
                <button className="btn btn--cart" style={{ marginTop: 14, width: 220 }} onClick={() => addCart(qv.id)}>В корзину</button>
                {at.length > 0 && (
                  <table><tbody>{at.map(([k, v]) => (<tr key={k}><td>{k}</td><td>{v}</td></tr>))}</tbody></table>
                )}
                {qv.description && <p style={{ color: "#555", marginTop: 12 }}>{qv.description}</p>}
              </div>
            </div>
          </div>
        );
      })()}

      <div className={`toast ${toast ? "on" : ""}`}>{toast}</div>
    </div>
  );
}
