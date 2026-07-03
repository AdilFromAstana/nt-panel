"use client";
import CartBadge from "./CartBadge";

type Props = {
  q?: string;
  onSearch?: (v: string) => void;
};

export default function SiteHeader({ q, onSearch }: Props) {
  const live = typeof onSearch === "function";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <a href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/logo.png" className="h-8" alt="NTpanel" />
          <span className="text-xl font-bold tracking-tight">
            NTpanel<span className="text-green-600">.KZ</span>
          </span>
        </a>

        <form
          action={live ? undefined : "/catalog/hybrid"}
          onSubmit={live ? (e) => e.preventDefault() : undefined}
          className="relative hidden flex-1 md:block"
        >
          <input
            name="q"
            placeholder="Поиск по каталогу…"
            defaultValue={live ? undefined : q}
            value={live ? q ?? "" : undefined}
            onChange={live ? (e) => onSearch!(e.target.value) : undefined}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
          />
        </form>

        <nav className="ml-auto flex items-center gap-5 sm:gap-7">
          <a href="/" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 sm:inline">Главная</a>
          <a href="/catalog/hybrid" className="hidden text-xs font-bold uppercase tracking-widest transition hover:text-green-600 sm:inline">Каталог</a>
          <a href="tel:+77081237069" className="hidden text-sm font-semibold lg:inline">+7 708 123-70-69</a>
          <a href="/catalog/hybrid" className="relative" aria-label="Корзина">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 000 0z" />
            </svg>
            <CartBadge />
          </a>
        </nav>
      </div>
    </header>
  );
}
