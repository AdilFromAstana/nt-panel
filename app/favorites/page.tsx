import { productMinis } from "@/lib/data";
import FavoritesClient from "@/components/FavoritesClient";

export const metadata = { title: "Избранное — NTpanel.KZ" };

export default function FavoritesPage() {
  return <FavoritesClient minis={productMinis()} />;
}
