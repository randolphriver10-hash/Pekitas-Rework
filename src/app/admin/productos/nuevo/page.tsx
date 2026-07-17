import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/admin/productos/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
        <p className="text-muted-foreground text-sm">
          Guardá lo básico primero; las imágenes y variantes se agregan después.
        </p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
