"use client";
import { useCallback, useEffect, useState } from "react";

type Summary = {
  total_events: number; chats: number; opens: number; whatsapp: number; add_cart: number;
  upsell: number; nudge_shown: number; exit_intent: number; card_clicks: number;
  by_type: [string, number][]; top_queries: [string, number][];
  zero_result_queries: [string, number][]; top_products: [string, number][];
  first: string | null; last: string | null;
};

function Bars({ pairs, red }: { pairs: [string, number][]; red?: boolean }) {
  if (!pairs.length) return <div className="text-gray-400 text-sm py-2">Пока нет данных</div>;
  const max = Math.max(...pairs.map((p) => p[1])) || 1;
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {pairs.map(([k, v]) => (
          <tr key={k}>
            <td className="py-1.5 border-b border-gray-50">
              {k}
              <div className="h-1.5 bg-[#eef2f8] rounded mt-1 overflow-hidden">
                <i className="block h-full" style={{ width: Math.round((v / max) * 100) + "%", background: red ? "#d12b2b" : "#1f6feb" }} />
              </div>
            </td>
            <td className={`py-1.5 border-b border-gray-50 text-right font-bold whitespace-nowrap pl-3 ${red ? "text-[#d12b2b]" : "text-[#0a3d8f]"}`}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Card({ n, l }: { n: number; l: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5">
      <div className="text-3xl font-extrabold text-[#0a3d8f]">{n}</div>
      <div className="text-[12.5px] text-gray-500 mt-0.5">{l}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [d, setD] = useState<Summary | null>(null);
  const load = useCallback(() => {
    fetch("/api/sell/analytics").then((r) => r.json()).then(setD);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-[#f4f6fa] min-h-screen text-gray-900">
      <header className="bg-gradient-to-r from-[#1f6feb] to-[#0a3d8f] text-white px-5 py-4 flex items-center gap-3">
        <h1 className="text-lg font-bold m-0">📊 Аналитика ИИ-чата</h1>
        <span className="text-[12.5px] opacity-85 ml-auto">
          {d?.first ? `${d.first.replace("T", " ")} — ${d.last?.replace("T", " ")}` : "нет событий"}
        </span>
        <button onClick={load} className="bg-[#1f6feb] rounded-lg px-3.5 py-2 text-sm">Обновить</button>
      </header>

      <div className="max-w-5xl mx-auto p-5">
        {d && (
          <>
            <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
              <Card n={d.chats} l="Диалогов" />
              <Card n={d.opens} l="Открытий чата" />
              <Card n={d.card_clicks} l="Кликов по товарам" />
              <Card n={d.add_cart} l="В корзину из чата" />
              <Card n={d.upsell} l="Клик апселла" />
              <Card n={d.whatsapp} l="В WhatsApp" />
              <Card n={d.nudge_shown} l="Показов подсказки" />
              <Card n={d.exit_intent} l="Exit-intent" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4"><h2 className="text-sm font-bold mb-2.5">🔎 Топ запросов</h2><Bars pairs={d.top_queries} /></div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4"><h2 className="text-sm font-bold mb-2.5">⚠️ Запросы без результата</h2><Bars pairs={d.zero_result_queries} red /></div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4"><h2 className="text-sm font-bold mb-2.5">👆 Клики по товарам</h2><Bars pairs={d.top_products} /></div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4"><h2 className="text-sm font-bold mb-2.5">📋 Все события</h2><Bars pairs={d.by_type} /></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
