"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import ProductCard from "./ProductCard";
import { getFavs, toggleFav, addToCart } from "@/lib/cart";
import type { MiniProduct } from "@/lib/data";
import { IconHeart } from "./Icons";

export default function FavoritesClient({ minis }: { minis: MiniProduct[] }) {
  const byId = new Map(minis.map((m) => [String(m.id), m]));
  const [favs, setFavs] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const sync = () => setFavs(getFavs());
    sync();
    setReady(true);
    window.addEventListener("ntcart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ntcart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const items = Object.keys(favs)
    .map((id) => byId.get(String(id)))
    .filter((m): m is MiniProduct => !!m);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">
          Избранное{items.length > 0 && <span className="text-gray-400"> · {items.length}</span>}
        </h1>

        {!ready ? null : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center">
            <IconHeart className="mx-auto h-14 w-14 text-gray-300" />
            <p className="mt-4 text-lg font-semibold">В избранном пока пусто</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-400">
              Нажимайте <IconHeart className="inline h-4 w-4" /> на карточках товаров
            </p>
            <Link href="/catalog/hybrid" className="mt-6 inline-block rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:brightness-95">
              В каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {items.map((m) => (
              <ProductCard
                key={m.id}
                id={m.id}
                name={m.name}
                price={m.price}
                preview_image={m.preview_image}
                category_name={m.category_name}
                stock={m.stock}
                fav
                onFav={() => setFavs(toggleFav(m.id))}
                onAddCart={() => { addToCart(m.id); setToast("Добавлено в корзину"); }}
              />
            ))}
          </div>
        )}
      </main>

      <div
        className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
