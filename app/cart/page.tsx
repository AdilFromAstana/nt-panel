import { productMinis, volumeTiers } from "@/lib/data";
import CartClient from "@/components/CartClient";

export const metadata = { title: "Корзина — NTpanel.KZ" };

export default function CartPage() {
  return <CartClient minis={productMinis()} tiers={volumeTiers()} />;
}
