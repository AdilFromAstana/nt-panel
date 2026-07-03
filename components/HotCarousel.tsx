"use client";
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { addToCart, getFavs, toggleFav } from "@/lib/cart";

type Item = { id: string; name: string; price: number; stock?: number; isNew?: boolean; preview_image?: string | null; category_name?: string };

export default function HotCarousel({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [favs, setFavs] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");

  useEffect(() => setFavs(getFavs()), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const car = ref.current;
    if (!car) return;
    const t = setInterval(() => {
      const w = (car.querySelector(".citem") as HTMLElement)?.offsetWidth + 20 || 300;
      if (car.scrollLeft + car.clientWidth >= car.scrollWidth - 5) car.scrollTo({ left: 0, behavior: "smooth" });
      else car.scrollBy({ left: w, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div ref={ref} className="carousel">
        {items.map((p) => (
          <div key={p.id} className="citem">
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              preview_image={p.preview_image}
              category_name={p.category_name}
              stock={p.stock}
              isNew={p.isNew}
              fav={!!favs[p.id]}
              onFav={() => setFavs(toggleFav(p.id))}
              onAddCart={() => { addToCart(p.id); setToast("Добавлено в корзину"); }}
            />
          </div>
        ))}
      </div>
      <div
        className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </>
  );
}
