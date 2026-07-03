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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      {p.onFav && (
        <button
          type="button"
          aria-label="В избранное"
          onClick={p.onFav}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white/80 leading-none backdrop-blur-sm transition hover:scale-110 ${
            p.fav ? "text-red-500" : "text-gray-300 hover:text-red-400"
          }`}
        >
          <IconHeart className="h-5 w-5" filled={p.fav} />
        </button>
      )}

      <a href={href} className="relative block overflow-hidden">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {b && (
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${b.cls}`}>{b.txt}</span>
          )}
          {p.isNew && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">Новинка</span>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.preview_image || ""}
          alt={p.name}
          className="aspect-square w-full bg-gray-50 object-cover transition duration-500 group-hover:scale-105"
        />
      </a>

      <div className="flex flex-1 flex-col p-4">
        <a href={href} className="flex flex-1 flex-col">
          <div className="text-xs text-gray-400">{p.category_name || ""}</div>
          <h3 className="clamp2 mt-0.5 min-h-[2.6rem] text-[15px] font-bold leading-snug text-gray-900 transition group-hover:text-green-600">
            {p.name}
          </h3>
          {p.size && <div className="mt-0.5 text-xs text-gray-400">{p.size}</div>}
          <p className="mt-1.5 text-lg font-extrabold">{fmt(p.price)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <span className="rounded bg-red-500 px-1.5 py-px text-[10px] font-bold text-white">Kaspi</span>
            0-0-12 · {fmt(Math.round(p.price / 12))}/мес
          </p>
        </a>

        {(p.onAddCart || p.onQuickView) && (
          <div className="mt-3 flex items-center gap-2">
            {p.onAddCart && (
              <button
                type="button"
                onClick={p.onAddCart}
                className="flex-1 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95"
              >
                В корзину
              </button>
            )}
            {p.onQuickView && (
              <button
                type="button"
                title="Быстрый просмотр"
                aria-label="Быстрый просмотр"
                onClick={p.onQuickView}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 active:scale-95"
              >
                <IconEye className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
