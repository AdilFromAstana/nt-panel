type Cart = Record<string, number> & { __fav?: Record<string, number> };

function read(): Cart {
  try {
    return JSON.parse(localStorage.getItem("ntcart2") || "{}");
  } catch {
    return {} as Cart;
  }
}

function write(c: Cart) {
  localStorage.setItem("ntcart2", JSON.stringify(c));
  window.dispatchEvent(new Event("ntcart-change"));
}

export function addToCart(id: string, qty = 1) {
  const c = read();
  c[id] = (typeof c[id] === "number" ? c[id] : 0) + qty;
  write(c);
}

export function getCart(): Record<string, number> {
  const c = read();
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(c)) if (k !== "__fav" && typeof v === "number" && v > 0) out[k] = v;
  return out;
}

export function setQty(id: string, qty: number) {
  const c = read();
  if (qty <= 0) delete c[id];
  else c[id] = qty;
  write(c);
}

export function removeFromCart(id: string) {
  setQty(id, 0);
}

export function clearCart() {
  const c = read();
  for (const k of Object.keys(c)) if (k !== "__fav") delete c[k];
  write(c);
}

export function getFavs(): Record<string, number> {
  return read().__fav || {};
}

export function toggleFav(id: string): Record<string, number> {
  const c = read();
  c.__fav = c.__fav || {};
  if (c.__fav[id]) delete c.__fav[id];
  else c.__fav[id] = 1;
  write(c);
  return { ...c.__fav };
}
