import { createClient } from "@/lib/supabase/server";
import { CategoriesList } from "@/app/admin/categorias/categories-list";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("category_id").is("deleted_at", null),
  ]);

  const countByCategory = new Map<string, number>();
  for (const p of products ?? []) {
    if (p.category_id) countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  }

  const withCounts = (categories ?? []).map((c) => ({
    ...c,
    productCount: countByCategory.get(c.id) ?? 0,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground text-sm">
          Organizá el catálogo. Las subcategorías se muestran anidadas.
        </p>
      </div>
      <CategoriesList categories={withCounts} />
    </div>
  );
}
