"use client";
import { useEffect, useState } from "react";

type Member = {
  id: string;
  name: string;
  label: string;
  price: number;
  stock: number;
  image: string;
  images: string[];
  attrs: Record<string, string>;
  category_name: string;
};

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
const isVideo = (s: string) => /\.(mp4|webm|mov|m4v)$/i.test(s || "");

const STYLES = [
  { key: "swatches", name: "Свотчи с фото" },
  { key: "pills", name: "Кнопки-пилюли" },
  { key: "cards", name: "Крупные карточки" },
] as const;
type StyleKey = (typeof STYLES)[number]["key"];

function stockBadge(stock: number) {
  if (stock <= 0) return { cls: "bg-gray-400", txt: "Под заказ" };
  if (stock <= 10) return { cls: "bg-amber-500", txt: `Осталось мало · ${stock} шт` };
  return { cls: "bg-green-600", txt: `В наличии · ${stock} шт` };
}

function Media({ src, className }: { src: string; className: string }) {
  return isVideo(src) ? (
    <video key={src} src={src} controls autoPlay loop muted playsInline className={`${className} object-contain`} />
  ) : (
    <div className={`${className} bg-contain bg-center bg-no-repeat`} style={{ backgroundImage: `url('${src}')` }} />
  );
}

function Thumb({ src, active, onClick }: { src: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${active ? "border-green-600 ring-1 ring-green-600" : "border-gray-200 hover:border-gray-300"}`}
    >
      {isVideo(src) ? (
        <>
          <video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">▶</span>
        </>
      ) : (
        <span className="block h-full w-full bg-[#f3f1ec] bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
      )}
    </button>
  );
}

function Selector({
  style, members, sel, setSel, compact,
}: { style: StyleKey; members: Member[]; sel: number; setSel: (i: number) => void; compact: boolean }) {
  if (style === "swatches") {
    const sw = compact ? "h-14 w-14" : "h-16 w-16";
    return (
      <div className={`flex gap-3 ${compact ? "-mx-4 overflow-x-auto px-4 pb-1" : "flex-wrap"}`}>
        {members.map((m, i) => (
          <button key={m.id} onClick={() => setSel(i)}
            className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${i === sel ? "ring-2 ring-green-600" : "ring-1 ring-gray-200 hover:ring-gray-300"}`}>
            <span className={`block ${sw} rounded-lg bg-[#f3f1ec] bg-cover bg-center`} style={{ backgroundImage: `url('${m.image}')` }} />
            <span className={`max-w-[80px] text-center text-[11px] leading-tight ${i === sel ? "font-semibold text-gray-900" : "text-gray-500"}`}>{m.label}</span>
          </button>
        ))}
      </div>
    );
  }
  if (style === "pills") {
    return (
      <div className="flex flex-wrap gap-2">
        {members.map((m, i) => (
          <button key={m.id} onClick={() => setSel(i)}
            className={`rounded-xl border px-4 py-2.5 text-left text-sm transition ${i === sel ? "border-green-600 bg-green-50 text-gray-900" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
            <span className="block font-semibold">{m.label}</span>
            <span className="block text-xs text-gray-400">{fmt(m.price)}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {members.map((m, i) => (
        <button key={m.id} onClick={() => setSel(i)}
          className={`rounded-xl border p-2 text-left transition ${i === sel ? "border-green-600 ring-1 ring-green-600" : "border-gray-200 hover:border-gray-300"}`}>
          <span className="mb-2 block aspect-square w-full rounded-lg bg-[#f3f1ec] bg-cover bg-center" style={{ backgroundImage: `url('${m.image}')` }} />
          <span className={`block font-semibold text-gray-900 ${compact ? "text-xs" : "text-sm"}`}>{m.label}</span>
          <span className="block text-xs text-gray-400">{fmt(m.price)}</span>
        </button>
      ))}
    </div>
  );
}

function Qty({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200">
      <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 text-lg text-gray-500 transition hover:text-gray-900">−</button>
      <span className="w-8 text-center font-semibold">{qty}</span>
      <button onClick={() => setQty(qty + 1)} className="h-11 w-11 text-lg text-gray-500 transition hover:text-gray-900">+</button>
    </div>
  );
}

const TRUST = [
  { icon: "🚚", title: "Доставка по РК", sub: "1–3 дня" },
  { icon: "💳", title: "Kaspi Рассрочка", sub: "0-0-12" },
  { icon: "✅", title: "Гарантия качества", sub: "Оригинал" },
];

function TrustRow() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TRUST.map((t) => (
        <div key={t.title} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center">
          <div className="text-lg">{t.icon}</div>
          <div className="mt-0.5 text-[11px] font-semibold leading-tight text-gray-900">{t.title}</div>
          <div className="text-[10px] text-gray-400">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

function Specs({ attrs }: { attrs: Record<string, string> }) {
  const rows = Object.entries(attrs);
  if (!rows.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Характеристики</h2>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="w-1/2 border-b border-gray-100 py-2 pr-2 text-gray-500">{k}</td>
              <td className="border-b border-gray-100 py-2 font-medium text-gray-900">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VariationsSandbox({ axis, members }: { axis: string; members: Member[] }) {
  const [style, setStyle] = useState<StyleKey>("swatches");
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [sel, setSel] = useState(0);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const p = members[sel] || members[0];
  const gallery = p.images.length ? p.images : [p.image];
  const main = gallery[Math.min(img, gallery.length - 1)] || p.image;
  const b = stockBadge(p.stock);
  const perMonth = Math.round(p.price / 12);

  useEffect(() => setImg(0), [sel]);

  const Crumbs = (
    <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
      <span className="hover:text-gray-600">Главная</span><span>/</span>
      <span className="hover:text-gray-600">{p.category_name}</span><span>/</span>
      <span className="text-gray-600">{p.name}</span>
    </nav>
  );

  const PriceBlock = (
    <>
      <div className="my-3 flex items-end gap-3">
        <span className="text-3xl font-extrabold">{fmt(p.price)}</span>
      </div>
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-600">
        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white">Kaspi</span>
        0-0-12 · {fmt(perMonth)}/мес
      </div>
    </>
  );

  const desktop = (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {Crumbs}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Media src={main} className="aspect-[4/5] rounded-2xl border border-gray-100 bg-[#f3f1ec]" />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((s, i) => <Thumb key={s} src={s} active={i === img} onClick={() => setImg(i)} />)}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-400">{p.category_name}</div>
          <h1 className="mb-2 mt-1 text-2xl font-bold">{p.name}</h1>
          <span className={`inline-block rounded px-2 py-1 text-xs font-bold text-white ${b.cls}`}>{b.txt}</span>
          {PriceBlock}
          <div className="mb-5">
            <div className="mb-2 text-sm font-semibold text-gray-500">{axis}: <span className="text-gray-900">{p.label}</span></div>
            <Selector style={style} members={members} sel={sel} setSel={setSel} compact={false} />
          </div>
          <div className="mb-5 flex items-center gap-3">
            <Qty qty={qty} setQty={setQty} />
            <button className="flex-1 rounded-xl bg-green-700 px-8 py-3.5 font-semibold text-white transition hover:brightness-95">В корзину</button>
            <button className="grid h-12 w-12 place-items-center rounded-xl border border-gray-200 text-gray-400 transition hover:text-red-500">♡</button>
          </div>
          <div className="mb-6"><TrustRow /></div>
          <Specs attrs={p.attrs} />
        </div>
      </div>
    </main>
  );

  const mobile = (
    <div className="flex justify-center py-8">
      <div className="relative flex h-[780px] w-[390px] flex-col overflow-hidden rounded-[2.2rem] border-[10px] border-gray-900 bg-white shadow-xl">
        <div className="flex-1 overflow-y-auto pb-28">
          <Media src={main} className="aspect-square w-full bg-[#f3f1ec]" />
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-2">
              {gallery.map((s, i) => <Thumb key={s} src={s} active={i === img} onClick={() => setImg(i)} />)}
            </div>
          )}
          <div className="px-4 pt-1">
            <div className="text-xs text-gray-400">{p.category_name}</div>
            <h1 className="mb-2 mt-0.5 text-lg font-bold leading-snug">{p.name}</h1>
            <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white ${b.cls}`}>{b.txt}</span>
            {PriceBlock}
            <div className="mt-1">
              <div className="mb-2 text-sm font-semibold text-gray-500">{axis}: <span className="text-gray-900">{p.label}</span></div>
              <Selector style={style} members={members} sel={sel} setSel={setSel} compact />
            </div>
            <div className="my-5"><TrustRow /></div>
            <Specs attrs={p.attrs} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 px-4 pb-[calc(1.1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Qty qty={qty} setQty={setQty} />
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-3.5 font-semibold text-white transition hover:brightness-95">
              В корзину · {fmt(p.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-sm font-semibold text-gray-500">Стиль:</span>
          {STYLES.map((s) => (
            <button key={s.key} onClick={() => setStyle(s.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${style === s.key ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"}`}>
              {s.name}
            </button>
          ))}
          <span className="ml-auto text-sm font-semibold text-gray-500">Экран:</span>
          {(["desktop", "mobile"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${view === v ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"}`}>
              {v === "desktop" ? "Десктоп" : "Мобильный"}
            </button>
          ))}
        </div>
      </div>

      {view === "desktop" ? desktop : mobile}

      <p className="mx-auto max-w-5xl px-4 pb-10 text-xs text-gray-400">
        Песочница. Группа: {members.length} вариации. Переключай стиль/экран сверху; выбор варианта меняет товар, миниатюры — фото.
      </p>
    </div>
  );
}
