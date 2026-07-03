"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCart from "./AddToCart";
import SiteHeader from "./SiteHeader";
import { getFavs, toggleFav } from "@/lib/cart";
import type { VariantOption } from "@/lib/data";

type Product = {
  id: string; name: string; price: number; stock: number;
  category_name?: string; preview_image?: string | null; images?: string[];
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
  { icon: "🚚", title: "Доставка по РК", sub: "1–3 дня" },
  { icon: "💳", title: "Kaspi Рассрочка", sub: "0-0-12" },
  { icon: "✅", title: "Гарантия качества", sub: "Оригинал" },
];

export default function ProductView({ product, variants }: { product: Product; variants?: VariantGroup }) {
  const gallery = ((product.images && product.images.length ? product.images : [product.preview_image]) as (string | null | undefined)[]).filter(Boolean) as string[];
  const [main, setMain] = useState(gallery[0] || "");
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const b = badge(Number(product.stock));
  const attrs = Object.entries(product.attrs || {});
  const opts = variants?.options || [];
  const current = opts.find((o) => o.current);

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
              <div className="aspect-[4/5] rounded-2xl border border-gray-100 bg-[#f3f1ec] bg-contain bg-center bg-no-repeat"
                style={main ? { backgroundImage: `url('${main}')` } : undefined} />
            )}
            {gallery.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {gallery.map((s) =>
                  isVideo(s) ? (
                    <button key={s} onClick={() => setMain(s)}
                      className={`relative h-16 w-16 overflow-hidden rounded-lg border ${s === main ? "border-green-600 ring-1 ring-green-600" : "border-gray-200"}`}>
                      <video src={s} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-lg text-white">▶</span>
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
              <button onClick={() => setFav(!!toggleFav(product.id)[product.id])}
                className={`grid h-12 w-12 place-items-center rounded-xl border transition ${fav ? "border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-500"}`}>
                {fav ? "♥" : "♡"}
              </button>
            </div>

            <div className="mb-7 grid grid-cols-3 gap-2">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center">
                  <div className="text-lg">{t.icon}</div>
                  <div className="mt-0.5 text-[11px] font-semibold leading-tight text-gray-900">{t.title}</div>
                  <div className="text-[10px] text-gray-400">{t.sub}</div>
                </div>
              ))}
            </div>

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
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="text-lg font-extrabold">{fmt(product.price * qty)}</div>
            <div className="text-[11px] text-gray-400">{qty} шт</div>
          </div>
          <AddToCart id={product.id} qty={qty} className="flex-1 rounded-xl bg-green-700 py-3.5 text-center font-semibold text-white transition hover:brightness-95" />
        </div>
      </div>
    </div>
  );
}
