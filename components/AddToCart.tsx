"use client";
import { useState } from "react";

export default function AddToCart({ id, qty = 1, className }: { id: string; qty?: number; className?: string }) {
  const [added, setAdded] = useState(false);
  function add() {
    let c: Record<string, number> = {};
    try {
      const raw = JSON.parse(localStorage.getItem("ntcart2") || "{}");
      if (!Array.isArray(raw)) c = raw;
    } catch {}
    c[id] = ((c[id] as number) || 0) + Math.max(1, qty);
    localStorage.setItem("ntcart2", JSON.stringify(c));
    window.dispatchEvent(new Event("ntcart-change"));
    setAdded(true);
  }
  return (
    <button className={className} onClick={add}>
      {added ? "✓ Добавлено" : "В корзину"}
    </button>
  );
}
