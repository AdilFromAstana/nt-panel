"use client";
import { useEffect, useState } from "react";

function countFavs(): number {
  try {
    const c = JSON.parse(localStorage.getItem("ntcart2") || "{}");
    return Object.keys(c?.__fav || {}).length;
  } catch {
    return 0;
  }
}

export default function FavBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const calc = () => setN(countFavs());
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
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {n}
    </span>
  );
}
