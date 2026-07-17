import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductsToolbar } from "@/app/admin/productos/products-toolbar";
import { ProductsTable } from "@/app/admin/productos/products-table";
import { ProductsPagination } from "@/app/admin/productos/products-pagination";
import type { ProductStatus } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

// El tipado de `Database` no incluye metadata de foreign keys (Relationships: []),
// así que postgrest-js no puede inferir el shape de un select con joins embebidos
// (product_images(...), categories(...)) — la query funciona bien en runtime, esto
// es solo para recuperar el tipo a mano en vez de dejar que colapse a `never`.
type ProductListRow = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: string;
  is_featured: boolean;
  category_id: string | null;
  product_images: { url: string; is_primary: boolean }[] | null;
  categories: { name: string } | null;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, sku, price, sale_price, stock, status, is_featured, category_id, product_images(url, is_primary), categories(name)",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (params.q) query = query.or(`name.ilike.%${params.q}%,sku.ilike.%${params.q}%`);
  if (params.status) query = query.eq("status", params.status as ProductStatus);
  if (params.category) query = query.eq("category_id", params.category);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("sort_order", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  const products = ((data ?? []) as unknown as ProductListRow[]).map((p) => {
    const images = p.product_images ?? [];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      sale_price: p.sale_price,
      stock: p.stock,
      status: p.status,
      is_featured: p.is_featured,
      primaryImageUrl: primary?.url ?? null,
      categoryName: p.categories?.name ?? null,
    };
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground text-sm">{count ?? 0} producto(s) en total.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/productos/nuevo" />}>
          <Plus />
          Nuevo producto
        </Button>
      </div>

      <ProductsToolbar categories={categories ?? []} />
      <ProductsTable products={products} />
      <ProductsPagination page={page} totalPages={totalPages} />
    </div>
  );
}
