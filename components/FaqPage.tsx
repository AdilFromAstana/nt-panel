"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "./SiteHeader";
import { FAQ, TOPICS, TOPIC_ORDER, type FaqItem } from "@/lib/faq-data";

const WHATSAPP = "https://wa.me/77081237069";

export default function FaqPage() {
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = FAQ.filter((f) => f.scope === "global" || f.scope === "category");
  const top = items.filter((f) => f.top);
  const present = TOPIC_ORDER.filter((t) => items.some((f) => f.topic === t));
  const q = query.toLowerCase();
  const list = items.filter(
    (f) => (topic === "all" || f.topic === topic) && (f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
  );

  const toggle = (key: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const openQuestion = (item: FaqItem) => {
    setTopic("all");
    setQuery("");
    setOpen(new Set([item.q]));
    setPending(item.q);
  };

  useEffect(() => {
    if (!pending || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-q="${CSS.escape(pending)}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setPending(null);
  }, [pending, list.length]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          <a href="/" className="hover:text-gray-600">Главная</a><span>/</span>
          <span className="text-gray-600">Вопросы и ответы</span>
        </nav>

        <h1 className="text-3xl font-bold sm:text-4xl">Вопросы и ответы</h1>
        <p className="mt-2 text-base text-gray-500">Подбор и расчёт, монтаж, уход, доставка — всё в одном месте.</p>

        <div className="relative mt-6">
          <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="m21 21-4.3-4.3M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Спросите: сколько нужно, чем клеить, можно ли в ванную…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-base outline-none transition focus:border-green-500 focus:bg-white"
          />
        </div>

        {top.length > 0 && (
          <div className="mt-6">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Популярные вопросы</div>
            <div className="flex flex-wrap gap-2.5">
              {top.map((f) => (
                <button key={f.q} onClick={() => openQuestion(f)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-left text-[15px] text-gray-700 transition hover:border-green-200 hover:bg-green-50">
                  {f.q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {["all", ...present].map((t) => {
            const on = t === topic;
            return (
              <button key={t} onClick={() => setTopic(t)} className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold transition ${on ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t === "all" ? "Все" : TOPICS[t]}
              </button>
            );
          })}
        </div>

        <div ref={listRef} className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {list.length ? (
            list.map((f) => {
              const isOpen = open.has(f.q);
              return (
                <div key={f.q} data-q={f.q}>
                  <button onClick={() => toggle(f.q)} className="flex w-full items-start gap-4 px-5 py-5 text-left hover:bg-gray-50">
                    <span className="flex-1 text-[17px] font-semibold leading-snug text-gray-900">{f.q}</span>
                    <svg className={`h-6 w-6 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-45" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <div className="grid transition-[grid-template-rows] duration-200" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pr-10 text-base leading-7 text-gray-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-5 py-10 text-center text-base text-gray-400">Ничего не найдено. Уточните запрос или напишите нам.</p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <div className="text-lg font-bold text-gray-900">Не нашли ответ?</div>
            <div className="text-sm text-gray-500">Подскажем по подбору, расчёту и доставке.</div>
          </div>
          <div className="flex shrink-0 gap-3">
            <a href={WHATSAPP} className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:brightness-95">Написать в WhatsApp</a>
            <a href="tel:+77081237069" className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50">Позвонить</a>
          </div>
        </div>
      </main>
    </div>
  );
}
