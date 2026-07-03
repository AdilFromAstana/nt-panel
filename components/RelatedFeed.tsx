"use client";
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { addToCart, getFavs, toggleFav } from "@/lib/cart";
import type { FeedCard } from "@/lib/data";

const PAGE = 12;

export default function RelatedFeed({
  variants, accessories, category, feed,
}: { variants: FeedCard[]; accessories: FeedCard[]; category: FeedCard[]; feed: FeedCard[] }) {
  const [favs, setFavs] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");
  const [count, setCount] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => setFavs(getFavs()), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting) setCount((c) => Math.min(c + PAGE, feed.length)); },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [feed.length]);

  const card = (p: FeedCard) => (
    <ProductCard
      key={p.id}
      id={p.id}
      name={p.name}
      price={p.price}
      preview_image={p.preview_image}
      category_name={p.category_name}
      size={p.size}
      stock={p.stock}
      isNew={p.isNew}
      fav={!!favs[p.id]}
      onFav={() => setFavs(toggleFav(p.id))}
      onAddCart={() => { addToCart(p.id); setToast("Добавлено в корзину"); }}
    />
  );

  const Section = ({ title, items }: { title: string; items: FeedCard[] }) =>
    items.length ? (
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold md:text-2xl">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map(card)}</div>
      </section>
    ) : null;

  const shown = feed.slice(0, count);
  const done = count >= feed.length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <Section title="Другие варианты" items={variants} />
      <Section title="С этим товаром покупают" items={accessories} />
      <Section title="Из этой категории" items={category} />

      {feed.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold md:text-2xl">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{shown.map(card)}</div>
          {!done && <div ref={sentinel} className="h-10" />}
          {!done && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCount((c) => Math.min(c + PAGE, feed.length))}
                className="rounded-xl border border-gray-200 bg-white px-8 py-3 font-semibold transition hover:bg-gray-50"
              >
                Показать ещё
              </button>
            </div>
          )}
          {done && (
            <div className="mt-8 text-center">
              <a href="/catalog/hybrid" className="font-semibold text-green-600 hover:underline">
                Открыть весь каталог →
              </a>
            </div>
          )}
        </section>
      )}

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
