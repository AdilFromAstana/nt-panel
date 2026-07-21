"use client";
import { useState } from "react";
import CartBadge from "./CartBadge";
import FavBadge from "./FavBadge";
import { IconSearch, IconMenu, IconClose } from "./Icons";

type Props = {
  q?: string;
  onSearch?: (v: string) => void;
};

export default function SiteHeader({ q, onSearch }: Props) {
  const live = typeof onSearch === "function";
  const [menu, setMenu] = useState(false);

  const search = (extra: string) => (
    <form
      action={live ? undefined : "/catalog/hybrid"}
      onSubmit={live ? (e) => e.preventDefault() : undefined}
      className={extra}
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <IconSearch className="h-4 w-4" />
      </span>
      <input
        name="q"
        placeholder="Поиск по каталогу…"
        defaultValue={live ? undefined : q}
        value={live ? q ?? "" : undefined}
        onChange={live ? (e) => onSearch!(e.target.value) : undefined}
        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <a href="/" className="flex shrink-0 items-center gap-2" aria-label="На главную">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
          </svg>
        </a>

        {search("relative hidden flex-1 md:block")}

        <nav className="ml-auto flex items-center gap-5 sm:gap-6">
          <a href="/" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 md:inline">Главная</a>
          <a href="/catalog/hybrid" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 md:inline">Каталог</a>
          <a href="/faq" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 md:inline">FAQ</a>
          <a href="/about" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 md:inline">О нас</a>
          <a href="tel:+77077133569" className="hidden text-sm font-semibold lg:inline">+7 707 713-35-69</a>
          <a href="/favorites" className="relative" aria-label="Избранное">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <FavBadge />
          </a>
          <a href="/cart" className="relative" aria-label="Корзина">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 000 0z" />
            </svg>
            <CartBadge />
          </a>
          <button className="md:hidden" aria-label="Меню" onClick={() => setMenu((v) => !v)}>
            {menu ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      <div className="relative px-4 pb-3 md:hidden">{search("relative")}</div>

      {menu && (
        <nav className="border-t border-gray-100 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-1">
            {[
              { href: "/", label: "Главная" },
              { href: "/catalog/hybrid", label: "Каталог" },
              { href: "/faq", label: "FAQ" },
              { href: "/about", label: "О нас" },
              { href: "/favorites", label: "Избранное" },
              { href: "/cart", label: "Корзина" },
            ].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="border-b border-gray-50 py-3 font-semibold transition hover:text-green-600">
                {l.label}
              </a>
            ))}
            <a href="tel:+77077133569" className="py-3 font-semibold text-green-600">+7 707 713-35-69</a>
            <a href="https://wa.me/77077133569" className="py-3 font-semibold text-green-600">Написать в WhatsApp</a>
          </div>
        </nav>
      )}
    </header>
  );
}
