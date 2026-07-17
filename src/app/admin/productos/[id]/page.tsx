import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/admin/productos/product-form";
import { ImagesManager } from "@/app/admin/productos/images-manager";
import { VariantsManager } from "@/app/admin/productos/variants-manager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: images }, { data: variants }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("*").is("deleted_at", null).order("name"),
      supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      supabase.from("product_variants").select("*").eq("product_id", id).order("created_at"),
    ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <p className="text-muted-foreground text-sm">Editando producto.</p>
      </div>
      <ProductForm product={product} categories={categories ?? []} />
      <ImagesManager productId={product.id} images={images ?? []} />
      <VariantsManager productId={product.id} variants={variants ?? []} />
    </div>
  );
}
