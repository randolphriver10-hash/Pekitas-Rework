import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProductRow, ProductImageRow, ProductVariantRow } from "@/lib/supabase/types";
import {
  getActivePromotions,
  findPromotionForProduct,
  computeDiscountedPrice,
  type ActivePromotion,
} from "@/lib/promotions";

const PUBLIC_PRODUCT_FIELDS =
  "id, name, slug, short_description, price, sale_price, is_on_sale, is_new, is_featured, stock, category_id, product_images(url, alt_text, is_primary, sort_order), product_variants(size, color, stock, is_active)";

// `cost` está deliberadamente fuera del GRANT de columnas para `anon` (migración 010).
// Un `select("*")` sobre products pide TODAS las columnas incluida `cost`, así que
// para anon eso siempre da "permission denied" — hay que listar las públicas a mano.
const PUBLIC_PRODUCT_DETAIL_FIELDS = [
  "id",
  "name",
  "slug",
  "sku",
  "short_description",
  "description",
  "price",
  "sale_price",
  "category_id",
  "status",
  "stock",
  "is_featured",
  "is_new",
  "is_on_sale",
  "sale_start_at",
  "sale_end_at",
  "material",
  "tags",
  "sort_order",
  "seo_title",
  "seo_description",
  "created_at",
  "updated_at",
].join(", ");

export type PublicProductCard = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  is_new: boolean;
  is_featured: boolean;
  stock: number;
  category_id: string | null;
  imageUrl: string | null;
  defaultVariant: { size: string | null; color: string | null; stock: number } | null;
};

function mapProductCard(row: Record<string, unknown>, promotions: ActivePromotion[]): PublicProductCard {
  const images = (row.product_images as { url: string; is_primary: boolean }[] | null) ?? [];
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const price = row.price as number;
  const categoryId = row.category_id as string | null;
  const promo = findPromotionForProduct(promotions, row.id as string, categoryId);
  const promoPrice = promo ? computeDiscountedPrice(price, promo) : null;

  const storedSalePrice = row.sale_price as number | null;
  const effectiveSalePrice =
    promoPrice != null && promoPrice < price ? promoPrice : storedSalePrice;

  const variants =
    (row.product_variants as { size: string | null; color: string | null; stock: number; is_active: boolean }[] | null) ??
    [];
  const defaultVariant = variants.find((v) => v.is_active && v.stock > 0) ?? null;

  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    short_description: row.short_description as string | null,
    price,
    sale_price: effectiveSalePrice,
    is_on_sale: effectiveSalePrice != null,
    is_new: row.is_new as boolean,
    is_featured: row.is_featured as boolean,
    stock: row.stock as number,
    category_id: categoryId,
    imageUrl: primary?.url ?? null,
    defaultVariant: defaultVariant
      ? { size: defaultVariant.size, color: defaultVariant.color, stock: defaultVariant.stock }
      : null,
  };
}

export async function getFeaturedProducts(limit = 8): Promise<PublicProductCard[]> {
  const supabase = await createClient();
  const [{ data }, promotions] = await Promise.all([
    supabase
      .from("products")
      .select(PUBLIC_PRODUCT_FIELDS)
      .eq("status", "published")
      .eq("is_featured", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(limit),
    getActivePromotions(),
  ]);
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => mapProductCard(row, promotions));
}

export async function getPublishedProducts(
  categoryId?: string,
  search?: string
): Promise<PublicProductCard[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PUBLIC_PRODUCT_FIELDS)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) query = query.ilike("name", `%${search}%`);

  const [{ data }, promotions] = await Promise.all([query, getActivePromotions()]);
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => mapProductCard(row, promotions));
}

export type ProductWithRelations = Omit<
  ProductRow,
  "cost" | "deleted_at" | "deleted_by" | "created_by" | "updated_by"
> & {
  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
  categories: { name: string; slug: string } | null;
};

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithRelations | null> => {
  const supabase = await createClient();
  const [{ data: product }, promotions] = await Promise.all([
    supabase
      .from("products")
      .select(
        `${PUBLIC_PRODUCT_DETAIL_FIELDS}, product_images(*), product_variants(*), categories(name, slug)`
      )
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle(),
    getActivePromotions(),
  ]);
  if (!product) return null;

  const typed = product as unknown as ProductWithRelations;
  const promo = findPromotionForProduct(promotions, typed.id, typed.category_id);
  if (promo) {
    const promoPrice = computeDiscountedPrice(typed.price, promo);
    if (promoPrice < typed.price) typed.sale_price = promoPrice;
  }
  return typed;
});

export async function getActiveCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
