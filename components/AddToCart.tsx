"use client";
import { useState } from "react";

export default function AddToCart({ id, className }: { id: string; className?: string }) {
  const [added, setAdded] = useState(false);
  function add() {
    let c: Record<string, number> = {};
    try {
      const raw = JSON.parse(localStorage.getItem("ntcart2") || "{}");
      if (!Array.isArray(raw)) c = raw;
    } catch {}
    c[id] = ((c[id] as number) || 0) + 1;
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
