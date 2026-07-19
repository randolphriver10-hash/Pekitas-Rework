// Uso puntual: sube las 2 fotos de banner de inicio y las da de alta como
// banners con position='hero' (el carrusel de la home las lee desde ahí).
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

const BANNER_DIR = "C:\\Users\\rando\\OneDrive\\Escritorio\\Banner";

const BANNERS = [
  { file: "Banner 1.jpeg", title: "Nueva colección", message: "Banner hero — nueva colección", sort_order: 0 },
  { file: "Banner 2.jpeg", title: "Revendé con estilo", message: "Banner hero — mayorista", sort_order: 1 },
];

async function main() {
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  for (const banner of BANNERS) {
    const buffer = fs.readFileSync(path.join(BANNER_DIR, banner.file));
    const storagePath = `banners/${crypto.randomUUID()}.jpeg`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error(`upload ${banner.file}: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("site-assets").getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("banners").insert({
      title: banner.title,
      message: banner.message,
      image_url: publicUrl,
      position: "hero",
      status: "published",
      is_active: true,
      sort_order: banner.sort_order,
    });
    if (insertError) throw new Error(`insert ${banner.file}: ${insertError.message}`);

    console.log(`OK ${banner.file} -> ${publicUrl}`);
  }
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
