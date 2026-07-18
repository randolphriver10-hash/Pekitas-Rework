// Uso puntual: reemplaza las fotos de baja calidad migradas del catálogo viejo
// por las fotos profesionales reales, y da de alta como borrador los productos
// que tienen foto pero todavía no existen en la base.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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

const PHOTO_DIR =
  "C:\\Users\\rando\\OneDrive\\Escritorio\\PROYECTOS\\TIENDA PEKITAS\\Subcategorias\\Nenas";

// slug -> lista de archivos en orden de prioridad (el primero queda como imagen principal)
const EXISTING_PRODUCT_PHOTOS = {
  "curva-de-body": ["Body.jpg"],
  "curva-de-body-de-darlon": ["Body De Darlon.jpeg", "Body De Darlon Colores.jpeg"],
  "curva-de-buzo-con-regulador": ["Buzo Con Regulador.jpg"],
  "curva-de-buzo-con-regulador-2": ["Buzo Con Regulador.jpg"],
  "curva-de-buzo-lali": ["Buzo LALI.jpeg"],
  "curva-de-camiseta-con-flor": ["Camiseta.jpeg"],
  "curva-de-buzo-de-corderoy": ["Campera De Corderoy.jpg"],
  "curva-de-tapado-de-buccle": [
    "Tapado IRL.jpg",
    "Tapado IA Model.jpeg",
    "Tapado Colores IA.jpeg",
  ],
  "conjunto-flex": ["Conjunto FLEX.jpeg", "Conjunto FLEX colores.jpeg"],
  "curva-de-buzo-con-volado-en-los-hombros": [
    "Buzo Con Volado IRL.jpeg",
    "Buzo Con Volado IA Model.jpeg",
    "Buzo Con Volado Colores IA.jpeg",
  ],
  "curva-de-chaleco-de-cuerina-y-piel": [
    "Chaleco Cuerina Y Piel Real.jpeg",
    "CVhaleco Piel y Cuero.jpg",
    "Chaleco Cuerina Colores Real.jpeg",
    "Chaleco Cuerina Colores IA.jpg",
  ],
  "curva-de-chaqueta-sarah": ["Chaqueta SARAH.jpeg", "Chaqueta SARAH Colores.jpeg"],
  "curva-de-baggy-de-plush-con-regulador": ["Baggy De Plush Con Regulador.jpg"],
  "curva-de-palazo-animal-prin": ["Palazo Animal Prin.jpg"],
  "curva-de-palazo-darlon-morley": [
    "Baggy Darlon Morley Real.jpeg",
    "Baggy Darlon Morley Model.jpg",
    "Baggy Darlon Morley Colores IA.jpeg",
  ],
  "curva-de-polera-con-corbata": ["Polera Con Corbata.jpg"],
  "curva-de-polera-con-dedito": ["Polera Con Dedito.jpg", "Polera Con Dedito Colores.jpg"],
  "curva-de-short-pollera": ["Short Pollera.jpg"],
  "curva-de-short-pollera-de-pano": [
    "Short Pollera De Paño.jpeg",
    "Colores Short Pollera De Paño.jpeg",
  ],
  "curva-pollera-cuadrille": [
    "Pollera Cuadrille IRL.jpg",
    "Pollera Cuadrille IA Model.jpeg",
    "Pollera Cuadrille Colores IRL.jpg",
    "Pollera Cuadrille Colores IA.jpeg",
  ],
  "curva-de-sueter-combinado": ["Sweter Combinado.jpeg"],
  "curva-de-sueter-con-guante": ["Sweter Con Guante.jpg"],
  "curva-de-sueter-estefy": ["Sueter ESTEFY.jpeg", "Sueter ESTEFY Colores.jpeg"],
  "curva-de-vestido-ford": [
    "Vestido Ford IRL.jpeg",
    "Vestido Ford IA Model.jpeg",
    "Vestido Ford Colores IRL.jpeg",
    "Vestido Ford Colores IA.jpeg",
  ],
};

const NEW_PRODUCTS = [
  { name: "Baggy Con Regulador", category: "Pantalones", photos: ["Baggy Con Regulador.jpg"] },
  { name: "Buzo TAKI", category: "Buzos", photos: ["Buzo TAKI.jpeg"] },
  { name: "Chaleco De Gamulan", category: "Nenas", photos: ["Chaleco De Gamulan.jpg"] },
  { name: "Conjunto Con Ojalillos", category: "Conjuntos", photos: ["Conjunto Con Ojalillos.jpg"] },
  { name: "Conjunto De Darlon", category: "Conjuntos", photos: ["Conjunto De Darlon.jpg"] },
  {
    name: "Sueter Lanilla Cosi",
    category: "Suéters",
    photos: [
      "Sueter Lanilla Cosi IURL.jpeg",
      "Sueter Lanilla Cosi IA Model.jpeg",
      "Sueter Lanilla Cosi Colores.jpeg",
    ],
  },
  { name: "Sweter Con Broderi", category: "Suéters", photos: ["Sweter Con Broderi.jpg"] },
];

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".png" ? "image/png" : "image/jpeg";
}

async function uploadPhoto(supabase, productId, filename) {
  const filePath = path.join(PHOTO_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).replace(".", "") || "jpg";
  const storagePath = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, buffer, { contentType: contentTypeFor(filename), upsert: false });
  if (uploadError) throw new Error(`upload ${filename}: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(storagePath);
  return publicUrl;
}

async function replaceProductImages(supabase, productId, filenames) {
  const { data: oldImages } = await supabase
    .from("product_images")
    .select("id, url")
    .eq("product_id", productId);

  for (const img of oldImages ?? []) {
    const marker = "/product-images/";
    const idx = img.url.indexOf(marker);
    if (idx !== -1) {
      const storagePath = img.url.slice(idx + marker.length);
      await supabase.storage.from("product-images").remove([storagePath]);
    }
  }
  if (oldImages && oldImages.length > 0) {
    await supabase
      .from("product_images")
      .delete()
      .in("id", oldImages.map((i) => i.id));
  }

  let sortOrder = 0;
  for (const filename of filenames) {
    const url = await uploadPhoto(supabase, productId, filename);
    await supabase.from("product_images").insert({
      product_id: productId,
      url,
      alt_text: path.basename(filename, path.extname(filename)),
      is_primary: sortOrder === 0,
      sort_order: sortOrder,
    });
    sortOrder++;
  }
}

async function main() {
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name")
    .is("deleted_at", null);
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null);
  const categoryIdByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  console.log(`> Reemplazando fotos de ${Object.keys(EXISTING_PRODUCT_PHOTOS).length} productos existentes...`);
  for (const [slug, filenames] of Object.entries(EXISTING_PRODUCT_PHOTOS)) {
    const product = (products ?? []).find((p) => p.slug === slug);
    if (!product) {
      console.warn(`  ! No se encontró producto con slug "${slug}", se salta.`);
      continue;
    }
    await replaceProductImages(supabase, product.id, filenames);
    console.log(`  OK ${slug} (${filenames.length} foto/s)`);
  }

  console.log(`> Creando ${NEW_PRODUCTS.length} productos nuevos en borrador...`);
  for (const item of NEW_PRODUCTS) {
    const categoryId = categoryIdByName.get(item.category);
    if (!categoryId) {
      console.warn(`  ! Categoría "${item.category}" no existe, se salta ${item.name}.`);
      continue;
    }
    const slug = slugify(item.name);
    const { data: created, error } = await supabase
      .from("products")
      .insert({
        name: item.name,
        slug,
        category_id: categoryId,
        price: 0,
        stock: 0,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) {
      console.warn(`  ! No se pudo crear "${item.name}": ${error.message}`);
      continue;
    }
    await replaceProductImages(supabase, created.id, item.photos);
    console.log(`  OK ${item.name} -> ${slug} (borrador, ${item.photos.length} foto/s)`);
  }

  console.log("Listo.");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
