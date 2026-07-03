import { productById, products } from "@/lib/data";
import VariationsSandbox from "@/components/VariationsSandbox";

export const metadata = { title: "Прототип: селектор вариаций" };

export default function VariationsProtoPage() {
  const anchor = productById("58");
  const groupId = anchor?.variant_group || "";
  const members = products()
    .filter((x) => x.variant_group === groupId)
    .sort((a, b) => (a.variant_order ?? 0) - (b.variant_order ?? 0))
    .map((x) => ({
      id: x.id,
      name: x.name,
      label: x.variant_label || x.name,
      price: x.price,
      stock: Number(x.stock) || 0,
      image: (x.images && x.images[0]) || x.preview_image || "",
      images: (x.images && x.images.length ? x.images : [x.preview_image]).filter(Boolean) as string[],
      attrs: x.attrs || {},
      category_name: x.category_name || "",
    }));

  const axis = anchor?.variant_axis || "Вариант";

  return <VariationsSandbox axis={axis} members={members} />;
}
