// Uso puntual: las 11 categorías reales (hijas de la única categoría raíz "Nenas")
// no tenían image_url seteada, así que los tiles de categorías en la home no tenían
// foto de portada. Se les asigna una foto representativa de un producto real ya
// subido a Storage.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvLocal() {
  const text = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[t.slice(0, eq).trim()] = v;
  }
  return env;
}

// categoría (por nombre) -> slug del producto cuya imagen principal se usa de portada
const COVER_BY_CATEGORY = {
  Bodys: "curva-de-body",
  Buzos: "curva-de-buzo-lali",
  Camisetas: "curva-de-camiseta-con-flor",
  "Camperas/Chaquetas": "curva-de-tapado-de-buccle",
  Chalecos: "curva-de-chaleco-de-cuerina-y-piel",
  Conjuntos: "conjunto-flex",
  Pantalones: "curva-de-baggy-de-plush-con-regulador",
  Poleras: "curva-de-polera-con-corbata",
  Polleras: "curva-pollera-cuadrille",
  Suéters: "curva-de-sueter-combinado",
  Vestidos: "curva-de-vestido-ford",
};

async function main() {
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null);

  for (const [categoryName, productSlug] of Object.entries(COVER_BY_CATEGORY)) {
    const category = (categories ?? []).find((c) => c.name === categoryName);
    if (!category) {
      console.warn(`! Categoría "${categoryName}" no existe, se salta.`);
      continue;
    }

    const { data: product } = await supabase
      .from("products")
      .select("id, product_images(url, is_primary, sort_order)")
      .eq("slug", productSlug)
      .single();
    if (!product) {
      console.warn(`! Producto "${productSlug}" no existe, se salta ${categoryName}.`);
      continue;
    }

    const images = product.product_images ?? [];
    const cover = images.find((i) => i.is_primary) ?? images[0];
    if (!cover) {
      console.warn(`! Producto "${productSlug}" no tiene imágenes, se salta ${categoryName}.`);
      continue;
    }

    const { error } = await supabase
      .from("categories")
      .update({ image_url: cover.url })
      .eq("id", category.id);
    if (error) {
      console.warn(`! No se pudo actualizar ${categoryName}: ${error.message}`);
      continue;
    }
    console.log(`OK ${categoryName} -> ${productSlug}`);
  }
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
