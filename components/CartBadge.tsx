"use client";
import { useEffect, useState } from "react";

function countCart(): number {
  try {
    const c = JSON.parse(localStorage.getItem("ntcart2") || "{}");
    if (Array.isArray(c)) return c.reduce((a, x) => a + (x?.qty || 1), 0);
    return Object.entries(c)
      .filter(([k]) => k !== "__fav")
      .reduce((a, [, v]) => a + (typeof v === "number" ? v : (v as { qty?: number })?.qty || 0), 0);
  } catch {
    return 0;
  }
}

export default function CartBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const calc = () => setN(countCart());
    calc();
    window.addEventListener("ntcart-change", calc);
    window.addEventListener("storage", calc);
    return () => {
      window.removeEventListener("ntcart-change", calc);
      window.removeEventListener("storage", calc);
    };
  }, []);
  if (!n) return null;
  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
      {n}
    </span>
  );
}
