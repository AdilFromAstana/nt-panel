"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import { getCart, setQty, removeFromCart, clearCart } from "@/lib/cart";
import type { MiniProduct } from "@/lib/data";
import { IconCart } from "./Icons";

type Tier = { min_amount: number; percent: number };

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
const WA = "77081237069";

function discountFor(amount: number, tiers: Tier[]): number {
  let pct = 0;
  for (const t of [...tiers].sort((a, b) => a.min_amount - b.min_amount)) if (amount >= t.min_amount) pct = t.percent;
  return pct;
}

export default function CartClient({ minis, tiers }: { minis: MiniProduct[]; tiers: Tier[] }) {
  const byId = new Map(minis.map((m) => [String(m.id), m]));
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    setReady(true);
    window.addEventListener("ntcart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ntcart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ m: byId.get(String(id)), qty }))
    .filter((l): l is { m: MiniProduct; qty: number } => !!l.m);

  const subtotal = lines.reduce((a, l) => a + l.m.price * l.qty, 0);
  const pct = discountFor(subtotal, tiers);
  const discount = Math.round((subtotal * pct) / 100);
  const total = subtotal - discount;
  const count = lines.reduce((a, l) => a + l.qty, 0);

  const nextTier = [...tiers].sort((a, b) => a.min_amount - b.min_amount).find((t) => subtotal < t.min_amount);

  function checkout() {
    const rows = lines.map((l) => `• ${l.m.name}${l.m.variant_label ? ` (${l.m.variant_label})` : ""} × ${l.qty} — ${fmt(l.m.price * l.qty)}`);
    const msg =
      `Здравствуйте! Хочу оформить заказ:\n\n${rows.join("\n")}\n\n` +
      (discount ? `Скидка за объём ${pct}%: −${fmt(discount)}\n` : "") +
      `Итого: ${fmt(total)}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 pb-28 md:pb-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Корзина{count > 0 && <span className="text-gray-400"> · {count}</span>}</h1>

        {!ready ? null : lines.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center">
            <IconCart className="mx-auto h-14 w-14 text-gray-300" />
            <p className="mt-4 text-lg font-semibold">Корзина пуста</p>
            <p className="mt-1 text-sm text-gray-400">Добавьте товары из каталога</p>
            <Link href="/catalog/hybrid" className="mt-6 inline-block rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:brightness-95">
              В каталог
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="divide-y divide-gray-100">
              {lines.map((l) => (
                <div key={l.m.id} className="flex gap-4 py-4">
                  <Link href={`/product/${l.m.id}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.m.preview_image || ""} alt="" className="h-24 w-24 rounded-xl border border-gray-100 bg-gray-50 object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${l.m.id}`} className="text-[15px] font-semibold leading-snug hover:text-green-600">
                      {l.m.name}
                    </Link>
                    {l.m.variant_label && <div className="mt-0.5 text-xs text-gray-400">{l.m.variant_label}</div>}
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button onClick={() => setQty(l.m.id, l.qty - 1)} className="h-9 w-9 text-gray-500 transition hover:text-gray-900">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                        <button onClick={() => setQty(l.m.id, l.qty + 1)} className="h-9 w-9 text-gray-500 transition hover:text-gray-900">+</button>
                      </div>
                      <button onClick={() => removeFromCart(l.m.id)} className="text-xs text-gray-400 transition hover:text-red-500">Удалить</button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-extrabold">{fmt(l.m.price * l.qty)}</div>
                    {l.qty > 1 && <div className="text-xs text-gray-400">{fmt(l.m.price)}/шт</div>}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button onClick={clearCart} className="text-sm text-gray-400 transition hover:text-red-500">Очистить корзину</button>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-5 md:sticky md:top-24">
              <h2 className="mb-4 text-lg font-bold">Итого</h2>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-500">Товары ({count})</span>
                <span className="font-semibold">{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 text-sm text-green-600">
                  <span>Скидка за объём {pct}%</span>
                  <span className="font-semibold">−{fmt(discount)}</span>
                </div>
              )}
              {nextTier && (
                <p className="mt-2 rounded-lg bg-white p-2.5 text-xs text-gray-500">
                  Добавьте ещё на {fmt(nextTier.min_amount - subtotal)} — скидка {nextTier.percent}%
                </p>
              )}
              <div className="my-4 border-t border-gray-200" />
              <div className="flex items-end justify-between">
                <span className="font-semibold">К оплате</span>
                <span className="text-2xl font-extrabold">{fmt(total)}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <span className="rounded bg-red-500 px-1.5 py-px text-[10px] text-white">Kaspi</span>
                0-0-12 · {fmt(Math.round(total / 12))}/мес
              </div>
              <button onClick={checkout} className="mt-4 hidden w-full rounded-xl bg-green-700 py-3.5 font-semibold text-white transition hover:brightness-95 md:block">
                Оформить в WhatsApp
              </button>
            </aside>
          </div>
        )}
      </main>

      {ready && lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pl-4 pr-[4.75rem] pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-lg font-extrabold">{fmt(total)}</div>
              {discount > 0 && <div className="text-[11px] text-green-600">−{fmt(discount)}</div>}
            </div>
            <button onClick={checkout} className="flex-1 rounded-xl bg-green-700 py-3.5 text-center font-semibold text-white transition hover:brightness-95">
              Оформить в WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
