import "../catalog.css";
import { products } from "@/lib/data";
import CatalogClient from "@/components/CatalogClient";

const VARIANTS = ["kaspi", "ozon", "hybrid"];

export default async function CatalogVariant({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ section?: string; q?: string }>;
}) {
  const { variant } = await params;
  const sp = await searchParams;
  const v = VARIANTS.includes(variant) ? variant : "hybrid";
  return <CatalogClient products={products()} variant={v} initialSection={sp.section} initialQ={sp.q} />;
}
