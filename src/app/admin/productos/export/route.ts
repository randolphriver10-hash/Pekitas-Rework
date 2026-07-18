import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

const COLUMNS = [
  "id",
  "name",
  "slug",
  "sku",
  "category",
  "price",
  "sale_price",
  "cost",
  "stock",
  "status",
  "is_featured",
  "is_new",
  "short_description",
  "description",
  "material",
  "tags",
  "seo_title",
  "seo_description",
];

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, price, sale_price, cost, stock, status, is_featured, is_new, short_description, description, material, tags, seo_title, seo_description, categories(name)"
    )
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const rows = ((data ?? []) as unknown as Record<string, unknown>[]).map((p) => ({
    ...p,
    category: (p.categories as { name: string } | null)?.name ?? "",
    tags: Array.isArray(p.tags) ? p.tags.join("|") : "",
  }));

  const csv = toCsv(rows, COLUMNS);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="productos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
