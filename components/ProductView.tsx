"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AddToCart from "./AddToCart";
import SiteHeader from "./SiteHeader";
import ProductFaq, { productFaqItems } from "./ProductFaq";
import { getFavs, toggleFav } from "@/lib/cart";
import type { VariantOption } from "@/lib/data";
import { IconHeart, IconPlay, IconTruck, IconCard, IconShield } from "./Icons";

type Product = {
  id: string; name: string; price: number; stock: number;
  category_id: string; category_name?: string; preview_image?: string | null; images?: string[];
  description?: string; attrs?: Record<string, string>;
};

type VariantGroup = { axis: string; options: VariantOption[] } | null;

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
const isVideo = (s: string) => /\.(mp4|webm|mov|m4v)$/i.test(s || "");

function badge(stock: number) {
  if (stock <= 0) return { cls: "bg-gray-400", txt: "Под заказ" };
  if (stock <= 10) return { cls: "bg-amber-500", txt: `Осталось мало · ${stock} шт` };
  return { cls: "bg-green-600", txt: `В наличии · ${stock} шт` };
}

const TRUST = [
  { Icon: IconTruck, title: "Доставка по РК", sub: "1–3 дня" },
  { Icon: IconCard, title: "Kaspi Рассрочка", sub: "0-0-12" },
  { Icon: IconShield, title: "Гарантия качества", sub: "Оригинал" },
];

export default function ProductView({ product, variants }: { product: Product; variants?: VariantGroup }) {
  const gallery = ((product.images && product.images.length ? product.images : [product.preview_image]) as (string | null | undefined)[]).filter(Boolean) as string[];
  const [main, setMain] = useState(gallery[0] || "");
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [li, setLi] = useState(0);
  const touchX = useRef(0);
  const openLightbox = (idx: number) => { setLi(Math.max(0, idx)); setLightbox(true); };
  const goLb = (d: number) => setLi((i) => (i + d + gallery.length) % gallery.length);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowLeft") goLb(-1);
      else if (e.key === "ArrowRight") goLb(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightbox, gallery.length]);
  const b = badge(Number(product.stock));
  const attrs = Object.entries(product.attrs || {});
  const opts = variants?.options || [];
  const current = opts.find((o) => o.current);
  const faqItems = productFaqItems(product.id, product.category_id, true);
  const faqTop = faqItems.filter((f) => f.scope !== "global").slice(0, 3);
  const scrollToFaq = () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => setFav(!!getFavs()[product.id]), [product.id]);

  const swatches = opts.length > 1 && (
    <div className="mb-6">
      <div className="mb-2 text-sm font-semibold text-gray-500">
        {variants!.axis}: <span className="text-gray-900">{current?.label || ""}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {opts.map((o) =>
          o.current ? (
            <div key={o.id} className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 ring-2 ring-green-600">
              <span className="block h-16 w-16 rounded-lg bg-[#f3f1ec] bg-cover bg-center"
                style={{ backgroundImage: `url('${o.preview_image || ""}')` }} />
              <span className="max-w-[80px] text-center text-[11px] font-semibold leading-tight text-gray-900">{o.label}</span>
            </div>
          ) : (
            <Link key={o.id} href={`/product/${o.id}`}
              className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 ring-1 ring-gray-200 transition hover:ring-gray-300">
              <span className="block h-16 w-16 rounded-lg bg-[#f3f1ec] bg-cover bg-center"
                style={{ backgroundImage: `url('${o.preview_image || ""}')` }} />
              <span className="max-w-[80px] text-center text-[11px] leading-tight text-gray-500">{o.label}</span>
            </Link>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white text-gray-900">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-8">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">Главная</Link><span>/</span>
          <Link href="/catalog/hybrid" className="hover:text-gray-600">{product.category_name || "Каталог"}</Link><span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {isVideo(main) ? (
              <video key={main} src={main} controls autoPlay loop muted playsInline
                className="aspect-[4/5] w-full rounded-2xl border border-gray-100 bg-[#f3f1ec] object-contain" />
            ) : (
              <button type="button" onClick={() => openLightbox(Math.max(0, gallery.indexOf(main)))} aria-label="Открыть фото на весь экран"
                className="group relative block aspect-[4/5] w-full cursor-zoom-in rounded-2xl border border-gray-100 bg-[#f3f1ec] bg-contain bg-center bg-no-repeat"
                style={main ? { backgroundImage: `url('${main}')` } : undefined}>
                <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-gray-700 shadow-sm backdrop-blur-sm transition group-hover:bg-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" /></svg>
                </span>
              </button>
            )}
            {gallery.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {gallery.map((s) =>
                  isVideo(s) ? (
                    <button key={s} onClick={() => setMain(s)}
                      className={`relative h-16 w-16 overflow-hidden rounded-lg border ${s === main ? "border-green-600 ring-1 ring-green-600" : "border-gray-200"}`}>
                      <video src={s} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white"><IconPlay className="h-5 w-5" /></span>
                    </button>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={s} src={s} alt="" onClick={() => setMain(s)}
                      className={`h-16 w-16 cursor-pointer rounded-lg border object-cover ${s === main ? "border-green-600 ring-1 ring-green-600" : "border-gray-200"}`} />
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-400">{product.category_name || ""}</div>
            <h1 className="mb-2 mt-1 text-2xl font-bold">{product.name}</h1>
            <span className={`inline-block rounded px-2 py-1 text-xs font-bold text-white ${b.cls}`}>{b.txt}</span>
            <div className="my-3 text-3xl font-extrabold">{fmt(product.price)}</div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-600">
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white">Kaspi</span>
              0-0-12 · {fmt(Math.round(product.price / 12))}/мес
            </div>

            {swatches}

            <div className="mb-6 flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-gray-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 text-lg text-gray-500 transition hover:text-gray-900">−</button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-11 w-11 text-lg text-gray-500 transition hover:text-gray-900">+</button>
              </div>
              <AddToCart id={product.id} qty={qty} className="flex-1 rounded-xl bg-green-700 px-8 py-3.5 font-semibold text-white transition hover:brightness-95 md:flex-none md:w-56" />
              <button onClick={() => setFav(!!toggleFav(product.id)[product.id])} aria-label="В избранное"
                className={`grid h-12 w-12 place-items-center rounded-xl border transition ${fav ? "border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-500"}`}>
                <IconHeart className="h-6 w-6" filled={fav} />
              </button>
            </div>

            <div className="mb-7 grid grid-cols-3 gap-2">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center">
                  <t.Icon className="mx-auto h-6 w-6 text-gray-700" />
                  <div className="mt-1 text-[11px] font-semibold leading-tight text-gray-900">{t.title}</div>
                  <div className="text-[10px] text-gray-400">{t.sub}</div>
                </div>
              ))}
            </div>

            {faqItems.length > 0 && (
              <div className="mb-7 rounded-2xl border border-green-100 bg-green-50/60 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wide text-green-800">Частые вопросы о товаре</span>
                  <button onClick={scrollToFaq} className="text-sm font-semibold text-green-700 hover:underline">все {faqItems.length} →</button>
                </div>
                <div className="flex flex-col gap-2">
                  {faqTop.map((f) => (
                    <button key={f.q} onClick={scrollToFaq} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left text-[15px] font-medium text-gray-800 shadow-sm ring-1 ring-gray-100 transition hover:ring-green-200">
                      <span className="line-clamp-1">{f.q}</span>
                      <span className="shrink-0 text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {attrs.length > 0 && (
              <>
                <h2 className="mb-3 text-lg font-bold">Характеристики</h2>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {attrs.map(([k, v]) => (
                      <tr key={k}>
                        <td className="w-1/2 border-b border-gray-100 py-2 px-2 text-gray-500">{k}</td>
                        <td className="border-b border-gray-100 py-2 px-2 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {product.description && <p className="mt-4 text-gray-600">{product.description}</p>}
          </div>
        </div>

        {faqItems.length > 0 && (
          <section id="faq" className="mt-12 scroll-mt-24">
            <h2 className="mb-4 text-xl font-bold">Вопросы о товаре <span className="text-gray-400">({faqItems.length})</span></h2>
            <ProductFaq productId={product.id} categoryId={product.category_id} />
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pl-4 pr-[4.75rem] pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="text-lg font-extrabold">{fmt(product.price * qty)}</div>
            <div className="text-[11px] text-gray-400">{qty} шт</div>
          </div>
          <AddToCart id={product.id} qty={qty} className="flex-1 rounded-xl bg-green-700 py-3.5 text-center font-semibold text-white transition hover:brightness-95" />
        </div>
      </div>

      {lightbox && gallery.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) goLb(dx < 0 ? 1 : -1); }}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm text-white/70">{li + 1} / {gallery.length}</span>
            <button onClick={() => setLightbox(false)} aria-label="Закрыть" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-4" onClick={() => setLightbox(false)}>
            {isVideo(gallery[li]) ? (
              <video key={gallery[li]} src={gallery[li]} controls autoPlay loop playsInline onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[li]} alt={product.name} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full object-contain" />
            )}

            {gallery.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); goLb(-1); }} aria-label="Назад" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:grid">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="m15 6-6 6 6 6" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); goLb(1); }} aria-label="Вперёд" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:grid">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="m9 6 6 6-6 6" /></svg>
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {gallery.map((s, i) => (
                <button key={s} onClick={() => setLi(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${i === li ? "border-white" : "border-transparent opacity-60"}`}>
                  {isVideo(s) ? (
                    <video src={s} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
