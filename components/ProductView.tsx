"use client";
import { useState } from "react";
import AddToCart from "./AddToCart";
import SiteHeader from "./SiteHeader";

type Product = {
  id: string; name: string; price: number; stock: number;
  category_name?: string; preview_image?: string | null; images?: string[];
  description?: string; attrs?: Record<string, string>;
};

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
const isVideo = (s: string) => /\.(mp4|webm|mov|m4v)$/i.test(s || "");

function badge(stock: number) {
  if (stock <= 0) return { cls: "bg-gray-400", txt: "Под заказ" };
  if (stock <= 10) return { cls: "bg-amber-500", txt: "Осталось мало" };
  return { cls: "bg-green-600", txt: "В наличии" };
}

export default function ProductView({ product }: { product: Product }) {
  const gallery = ((product.images && product.images.length ? product.images : [product.preview_image]) as (string | null | undefined)[]).filter(Boolean) as string[];
  const [main, setMain] = useState(gallery[0] || "");
  const b = badge(Number(product.stock));
  const attrs = Object.entries(product.attrs || {});

  return (
    <div className="bg-white text-gray-900">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {isVideo(main) ? (
              <video
                key={main}
                src={main}
                controls autoPlay loop muted playsInline
                className="aspect-[4/5] w-full rounded-2xl border border-gray-100 bg-[#f3f1ec] object-contain"
              />
            ) : (
              <div
                className="aspect-[4/5] rounded-2xl border border-gray-100 bg-[#f3f1ec] bg-contain bg-center bg-no-repeat"
                style={main ? { backgroundImage: `url('${main}')` } : undefined}
              />
            )}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {gallery.map((s) =>
                  isVideo(s) ? (
                    <button key={s} onClick={() => setMain(s)}
                      className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden cursor-pointer">
                      <video src={s} muted playsInline preload="metadata"
                        className="w-full h-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-lg bg-black/30">▶</span>
                    </button>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={s} src={s} alt="" onClick={() => setMain(s)}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer" />
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-400">{product.category_name || ""}</div>
            <h1 className="text-2xl font-bold mt-1 mb-3">{product.name}</h1>
            <span className={`inline-block text-white text-xs font-bold px-2 py-1 rounded ${b.cls}`}>
              {b.txt}{Number(product.stock) > 0 ? ` · ${product.stock} шт` : ""}
            </span>
            <div className="text-3xl font-extrabold my-4">{fmt(product.price)}</div>
            <div className="text-sm text-red-500 font-semibold mb-5">
              <span className="bg-red-500 text-white rounded px-1.5 py-0.5 text-[10px] mr-1">Kaspi</span>
              0-0-12 · {fmt(Math.round(product.price / 12))}/мес
            </div>
            <AddToCart id={product.id} className="bg-green-700 hover:brightness-95 text-white font-semibold rounded-xl px-8 py-3.5 w-56" />

            {attrs.length > 0 && (
              <table className="w-full mt-7 border-collapse">
                <tbody>
                  {attrs.map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2 px-2 text-gray-500 border-b border-gray-100 w-1/2">{k}</td>
                      <td className="py-2 px-2 border-b border-gray-100">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {product.description && <p className="text-gray-600 mt-4">{product.description}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
