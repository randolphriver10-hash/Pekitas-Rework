"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  productSchema,
  productImageSchema,
  productVariantSchema,
  type ProductInput,
  type ProductImageInput,
  type ProductVariantInput,
} from "@/lib/validations/catalog";

export type ActionResult = { error?: string; id?: string } | undefined;

function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

function parseTags(tagsText?: string): string[] {
  if (!tagsText) return [];
  return [...new Set(tagsText.split(",").map((t) => t.trim()).filter(Boolean))];
}

export async function upsertProductAction(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id, tagsText, category_id, sale_price, cost, sku, short_description, description, material, seo_title, seo_description, ...rest } =
    parsed.data;

  const payload = {
    ...rest,
    category_id: category_id || null,
    sale_price: sale_price && !Number.isNaN(sale_price) ? sale_price : null,
    cost: cost && !Number.isNaN(cost) ? cost : null,
    sku: sku || null,
    short_description: short_description || null,
    description: description || null,
    material: material || null,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    tags: parseTags(tagsText),
    updated_by: user?.id,
  };

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) {
      if (error.code === "23505") return { error: "Ya existe un producto con ese slug o SKU." };
      return { error: "No se pudo guardar." };
    }
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { id };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...payload, created_by: user?.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con ese slug o SKU." };
    return { error: "No se pudo crear." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { id: data.id };
}

export async function duplicateProductAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: original } = await supabase.from("products").select("*").eq("id", id).single();
  if (!original) return { error: "Producto no encontrado." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let slug = `${original.slug}-copia`;
  let n = 2;
  let slugTaken = true;
  while (slugTaken) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);
    slugTaken = !!count;
    if (slugTaken) slug = `${original.slug}-copia-${n++}`;
  }

  const rest = omit(original, ["id", "created_at", "updated_at", "sku"]);

  const { data: copy, error } = await supabase
    .from("products")
    .insert({ ...rest, name: `${original.name} (copia)`, slug, sku: null, status: "draft", created_by: user?.id })
    .select("id")
    .single();

  if (error || !copy) return { error: "No se pudo duplicar." };

  const { data: images } = await supabase.from("product_images").select("*").eq("product_id", id);
  if (images && images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img) => ({
        ...omit(img, ["id", "product_id", "created_at"]),
        product_id: copy.id,
      }))
    );
  }

  const { data: variants } = await supabase.from("product_variants").select("*").eq("product_id", id);
  if (variants && variants.length > 0) {
    await supabase.from("product_variants").insert(
      variants.map((v) => ({
        ...omit(v, ["id", "product_id", "created_at", "updated_at", "sku"]),
        product_id: copy.id,
      }))
    );
  }

  revalidatePath("/admin/productos");
  return { id: copy.id };
}

export async function softDeleteProductAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);

  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function bulkUpdateProductsAction(
  ids: string[],
  patch: Partial<{
    status: "draft" | "published" | "hidden" | "agotado" | "archived";
    is_featured: boolean;
    deleted_at: string | null;
  }>
): Promise<ActionResult> {
  if (ids.length === 0) return { error: "No hay productos seleccionados." };
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(patch).in("id", ids);
  if (error) return { error: "No se pudo aplicar la acción masiva." };
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// ---------------------------------------------------------------- imágenes
export async function addProductImageAction(
  productId: string,
  input: ProductImageInput
): Promise<ActionResult> {
  const parsed = productImageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    url: parsed.data.url,
    alt_text: parsed.data.alt_text,
    is_primary: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });

  if (error) return { error: "No se pudo agregar la imagen." };
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function removeProductImageAction(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("url, is_primary")
    .eq("id", imageId)
    .single();

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { error: "No se pudo eliminar la imagen." };

  if (image?.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
  }

  if (image?.url) {
    const path = image.url.split("/product-images/")[1];
    if (path) {
      const admin = createAdminClient();
      await admin.storage.from("product-images").remove([path]);
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function setPrimaryImageAction(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// --------------------------------------------------------------- variantes
export async function upsertVariantAction(
  productId: string,
  input: ProductVariantInput
): Promise<ActionResult> {
  const parsed = productVariantSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const { id, ...rest } = parsed.data;
  const payload = { ...rest, sku: rest.sku || null, product_id: productId };

  const { error } = id
    ? await supabase.from("product_variants").update(payload).eq("id", id)
    : await supabase.from("product_variants").insert(payload);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe esa combinación de talle/color." };
    return { error: "No se pudo guardar la variante." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function removeVariantAction(variantId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) return { error: "No se pudo eliminar la variante." };
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
