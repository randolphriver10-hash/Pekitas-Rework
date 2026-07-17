import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.join(process.cwd(), ".env.local") });

const OLD_URL = "https://chthxgjajyqzandlntnw.supabase.co/rest/v1";
const OLD_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGh4Z2phanlxemFuZGxudG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI3OTUsImV4cCI6MjA5NTQ2ODc5NX0.KRfZ9zgvDb7A14D3eShi5_y-6YNOxMuUcAkoKy-mNfY";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function oldFetch(resource: string) {
  const res = await fetch(`${OLD_URL}/${resource}`, {
    headers: { apikey: OLD_ANON_KEY, Authorization: `Bearer ${OLD_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Old API ${resource} -> ${res.status}`);
  return res.json();
}

type OldCategory = {
  id: string;
  data: {
    name: string;
    slug: string;
    description?: string;
    img?: string;
    order?: number;
    active?: boolean;
    subcategories?: string[];
  };
};

type OldProduct = {
  id: string;
  data: {
    id: string;
    name: string;
    sub?: string;
    description?: string;
    price: number;
    priceOld?: number | null;
    stock: number;
    active: boolean;
    featured?: boolean;
    category?: string;
    subcategory?: string;
    sizes?: string[];
    colors?: string[];
    img?: string;
    imgHover?: string;
    imgHovers?: string[];
    badge?: string;
    productTags?: string[];
    order?: number;
    seoTitle?: string;
    seoDesc?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

type OldTag = { id: string; data: { name: string } };

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Faltan env vars de Supabase.");
  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("> Descargando datos del proyecto anterior...");
  const [oldCategories, oldProducts, oldTags] = await Promise.all([
    oldFetch("categories?select=*") as Promise<OldCategory[]>,
    oldFetch("products?select=*&order=id") as Promise<OldProduct[]>,
    oldFetch("tags?select=*") as Promise<OldTag[]>,
  ]);
  const tagNameById = new Map(oldTags.map((t) => [t.id, t.data.name]));

  console.log(`> ${oldCategories.length} categoría(s), ${oldProducts.length} producto(s)`);

  // --- Categorías (padre + subcategorías como hijas) ---
  const categoryIdBySlugPath = new Map<string, string>();

  for (const oldCat of oldCategories) {
    const parentSlug = slugify(oldCat.data.slug || oldCat.data.name);
    const { data: parent, error: parentError } = await admin
      .from("categories")
      .upsert(
        {
          name: oldCat.data.name,
          slug: parentSlug,
          description: oldCat.data.description ?? null,
          image_url: oldCat.data.img ?? null,
          is_active: oldCat.data.active ?? true,
          sort_order: oldCat.data.order ?? 0,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (parentError) throw parentError;
    categoryIdBySlugPath.set(parentSlug, parent.id);
    console.log(`  - categoría: ${oldCat.data.name}`);

    for (const [i, subName] of (oldCat.data.subcategories ?? []).entries()) {
      const childSlug = `${parentSlug}-${slugify(subName)}`;
      const { data: child, error: childError } = await admin
        .from("categories")
        .upsert(
          {
            parent_id: parent.id,
            name: subName,
            slug: childSlug,
            is_active: true,
            sort_order: i,
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();
      if (childError) throw childError;
      categoryIdBySlugPath.set(`${parentSlug}::${slugify(subName)}`, child.id);
    }
  }

  // --- Productos ---
  const usedSlugs = new Set<string>();
  let created = 0;

  for (const oldProduct of oldProducts) {
    const d = oldProduct.data;
    const baseSlug = slugify(d.name);
    let slug = baseSlug;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${n++}`;
    usedSlugs.add(slug);

    const parentSlug = slugify(d.category ?? "nenas");
    const childKey = d.subcategory ? `${parentSlug}::${slugify(d.subcategory)}` : undefined;
    const categoryId =
      (childKey && categoryIdBySlugPath.get(childKey)) ??
      categoryIdBySlugPath.get(parentSlug) ??
      null;

    const hasDiscount = typeof d.priceOld === "number" && d.priceOld > d.price;
    const price = hasDiscount ? d.priceOld! : d.price;
    const salePrice = hasDiscount ? d.price : null;

    const tags = new Set<string>();
    for (const tagId of d.productTags ?? []) {
      const name = tagNameById.get(tagId);
      if (name) tags.add(name);
    }
    if (d.badge && d.badge !== "Nuevo") tags.add(d.badge);

    const { data: product, error: productError } = await admin
      .from("products")
      .insert({
        name: d.name,
        slug,
        sku: d.id,
        short_description: d.sub ?? null,
        description: d.description ?? null,
        price,
        sale_price: salePrice,
        category_id: categoryId,
        status: d.active ? "published" : "hidden",
        stock: d.stock,
        is_featured: d.featured ?? false,
        is_new: d.badge === "Nuevo",
        is_on_sale: hasDiscount,
        tags: [...tags],
        sort_order: d.order ?? 0,
        seo_title: d.seoTitle || null,
        seo_description: d.seoDesc || null,
        created_at: d.createdAt ?? undefined,
        updated_at: d.updatedAt ?? undefined,
      })
      .select("id")
      .single();

    if (productError) {
      console.error(`  ! ${d.name}: ${productError.message}`);
      continue;
    }

    // Imágenes: principal + hover + galería adicional, en orden.
    const imageUrls = [d.img, d.imgHover, ...(d.imgHovers ?? [])].filter(
      (url, i, arr): url is string => !!url && arr.indexOf(url) === i
    );
    if (imageUrls.length > 0) {
      const { error: imagesError } = await admin.from("product_images").insert(
        imageUrls.map((url, i) => ({
          product_id: product.id,
          url,
          alt_text: d.name,
          is_primary: i === 0,
          sort_order: i,
        }))
      );
      if (imagesError) console.error(`  ! imágenes de ${d.name}: ${imagesError.message}`);
    }

    // Variantes: una por color. El sistema viejo vende "curvas" (todos los
    // talles de una vez), así que el rango de talles queda en `size` tal
    // cual y el stock es el mismo valor agregado del producto para cada
    // color — no hay stock desglosado por combinación en el dato original.
    const sizeRange = d.sizes?.[0] ?? null;
    if (d.colors && d.colors.length > 0) {
      const { error: variantsError } = await admin.from("product_variants").insert(
        d.colors.map((color) => ({
          product_id: product.id,
          size: sizeRange,
          color,
          stock: d.stock,
          is_active: true,
        }))
      );
      if (variantsError) console.error(`  ! variantes de ${d.name}: ${variantsError.message}`);
    }

    created++;
    console.log(`  - producto: ${d.name}`);
  }

  console.log(`\nListo. ${created}/${oldProducts.length} productos migrados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
