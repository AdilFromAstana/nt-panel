import { products } from "@/lib/data";
import CatalogClient from "@/components/CatalogClient";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return <CatalogClient products={products()} variant="hybrid" initialSection={sp.section} initialQ={sp.q} />;
}
