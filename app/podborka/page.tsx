import { products } from "@/lib/data";
import AddToCart from "@/components/AddToCart";
import SiteHeader from "@/components/SiteHeader";
import WhatsAppPodborka from "@/components/WhatsAppPodborka";

const fmt = (n: number) => Number(n || 0).toLocaleString("ru-RU") + " ₸";
function badge(stock: number) {
  if (stock <= 0) return { cls: "text-gray-400", txt: "Под заказ" };
  if (stock <= 5) return { cls: "text-amber-600", txt: "Осталось мало" };
  return { cls: "text-green-600", txt: "В наличии" };
}

export default async function Podborka({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const sp = await searchParams;
  const ids = (sp.ids || "").split(",").map((s) => s.trim()).filter(Boolean);
  const byId: Record<string, ReturnType<typeof products>[number]> = {};
  for (const p of products()) byId[String(p.id)] = p;
  const items = ids.map((i) => byId[i]).filter(Boolean);

  return (
    <div className="bg-[#f4f6fa] min-h-screen text-gray-900">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-5 py-6">
        <h1 className="text-xl font-bold mb-1">Ваша подборка</h1>
        <div className="text-gray-500 text-sm mb-5">
          {items.length} {items.length === 1 ? "товар" : "товаров"} подобрано ИИ-консультантом
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            Подборка пуста. <a href="/catalog/hybrid" className="text-blue-600">Перейти в каталог</a>
          </div>
        ) : (
          <>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
              {items.map((p) => {
                const b = badge(Number(p.stock));
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                    <div className="aspect-square bg-[#eef1f5] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.preview_image || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <div className="text-[13px] font-semibold leading-tight">{p.name.trim()}</div>
                      <div className="text-lg font-extrabold text-[#0a3d8f]">{fmt(p.price)}</div>
                      <div className={`text-[11.5px] font-semibold ${b.cls}`}>{b.txt}</div>
                      <div className="flex gap-2 mt-auto pt-1">
                        <a href={`/product/${p.id}`} className="flex-1 text-center bg-[#eef4ff] text-blue-600 rounded-lg py-2 text-xs font-semibold">Открыть</a>
                        <AddToCart id={p.id} className="flex-1 text-center bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <WhatsAppPodborka />
          </>
        )}
      </div>
    </div>
  );
}
