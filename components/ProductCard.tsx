import { IconHeart, IconEye } from "./Icons";

type Props = {
  id: string;
  name: string;
  price: number;
  preview_image?: string | null;
  category_name?: string;
  size?: string;
  stock?: number;
  isNew?: boolean;
  href?: string;
  fav?: boolean;
  onFav?: () => void;
  onAddCart?: () => void;
  onQuickView?: () => void;
};

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
const PLACEHOLDER = "/uploads/products/placeholder.jpg";

function stockBadge(stock?: number) {
  if (stock == null) return null;
  const s = Number(stock);
  if (s <= 0) return { txt: "Под заказ", cls: "bg-gray-400" };
  if (s <= 10) return { txt: "Осталось мало", cls: "bg-amber-500" };
  return { txt: "В наличии", cls: "bg-green-600" };
}

export default function ProductCard(p: Props) {
  const href = p.href || `/product/${p.id}`;
  const b = stockBadge(p.stock);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
      {p.onFav && (
        <button
          type="button"
          aria-label="В избранное"
          onClick={p.onFav}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white/85 leading-none backdrop-blur-sm transition hover:scale-110 sm:h-9 sm:w-9 ${
            p.fav ? "text-red-500" : "text-gray-300 hover:text-red-400"
          }`}
        >
          <IconHeart className="h-5 w-5" filled={p.fav} />
        </button>
      )}

      <a href={href} className="relative block overflow-hidden">
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {b && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px] ${b.cls}`}>{b.txt}</span>}
          {p.isNew && <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">Новинка</span>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.preview_image || PLACEHOLDER}
          alt={p.name}
          onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
          className="aspect-square w-full bg-gray-50 object-cover transition duration-500 group-hover:scale-105"
        />
        {p.onQuickView && (
          <button
            type="button"
            title="Быстрый просмотр"
            aria-label="Быстрый просмотр"
            onClick={(e) => { e.preventDefault(); p.onQuickView!(); }}
            className="absolute bottom-2.5 right-2.5 hidden h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white sm:group-hover:flex"
          >
            <IconEye className="h-5 w-5" />
          </button>
        )}
      </a>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <a href={href} className="block">
          <div className="truncate text-[11px] text-gray-400 sm:text-xs">{p.category_name || ""}</div>
          <h3 className="clamp2 mt-0.5 min-h-[2.4rem] text-[13px] font-bold leading-snug text-gray-900 transition group-hover:text-green-600 sm:min-h-[2.6rem] sm:text-[15px]">
            {p.name}
          </h3>
          {p.size && <div className="mt-0.5 hidden text-xs text-gray-400 sm:block">{p.size}</div>}
        </a>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[17px] font-extrabold leading-tight sm:text-lg">{fmt(p.price)}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-semibold text-red-500 sm:text-[11px]">
              <span className="rounded bg-red-500 px-1 py-px text-[9px] font-bold text-white sm:text-[10px]">Kaspi</span>
              {fmt(Math.round(p.price / 12))}/мес
            </p>
          </div>
          {p.onAddCart && (
            <button
              type="button"
              aria-label="В корзину"
              onClick={p.onAddCart}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h1.5l1 12.5A2 2 0 007.5 17H17a2 2 0 002-1.7L20.3 8H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
