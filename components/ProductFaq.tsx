"use client";

import { useState } from "react";
import { FAQ, TOPICS, TOPIC_ORDER, type FaqItem } from "@/lib/faq-data";

export function productFaqItems(productId: string, categoryId: string, includeGlobal: boolean) {
  const own = FAQ.filter((f) => f.scope === "product" && f.pid === productId);
  const inh = FAQ.filter((f) => f.scope === "category" && f.cat === categoryId);
  const glob = includeGlobal ? FAQ.filter((f) => f.scope === "global") : [];
  return [...own, ...inh, ...glob];
}

export default function ProductFaq({
  productId,
  categoryId,
  includeGlobal = true,
}: {
  productId: string;
  categoryId: string;
  includeGlobal?: boolean;
}) {
  const items = productFaqItems(productId, categoryId, includeGlobal);
  const present = TOPIC_ORDER.filter((t) => items.some((f) => f.topic === t));
  const [topic, setTopic] = useState<string>(present[0] || "");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const active = present.includes(topic) ? topic : present[0];
  const list = items.filter((f) => f.topic === active);

  const toggle = (q: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(q) ? n.delete(q) : n.add(q);
      return n;
    });

  if (!items.length) return null;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {present.map((t) => {
          const n = items.filter((f) => f.topic === t).length;
          const on = t === active;
          return (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold transition ${
                on ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {TOPICS[t]}
              <span className={`ml-1.5 text-[13px] ${on ? "text-green-200" : "text-gray-400"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
        {list.map((f: FaqItem) => {
          const isOpen = open.has(f.q);
          return (
            <div key={f.q}>
              <button onClick={() => toggle(f.q)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-gray-50">
                <span className="flex-1 text-[17px] font-semibold text-gray-900 leading-snug">{f.q}</span>
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
        })}
      </div>
    </div>
  );
}
