import { notFound } from "next/navigation";
import {
  productById, variantsOf, variantGroupOf, accessoriesFor, sameCategoryItems, similarTo, feedCard,
} from "@/lib/data";
import ProductView from "@/components/ProductView";
import RelatedFeed from "@/components/RelatedFeed";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productById(id);
  if (!product) notFound();

  const variantGroup = variantGroupOf(product);
  const shown = new Set<string>([String(product.id)]);
  variantGroup?.options.forEach((o) => shown.add(String(o.id)));
  const take = (list: ReturnType<typeof variantsOf>) => {
    const out = list.filter((p) => !shown.has(String(p.id)));
    out.forEach((p) => shown.add(String(p.id)));
    return out.map(feedCard);
  };

  const variants = take(variantsOf(product));
  const accessories = take(accessoriesFor(product));
  const category = take(sameCategoryItems(product, shown));
  const feed = similarTo(product, shown).map(feedCard);

  return (
    <div className="bg-white">
      <ProductView product={product} variants={variantGroup} />
      <RelatedFeed variants={variants} accessories={accessories} category={category} feed={feed} />
    </div>
  );
}
