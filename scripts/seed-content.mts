import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Faltan env vars de Supabase.");

  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Contenido real recuperado del proyecto anterior (Pekitas-Sumita10 / Supabase
  // chthxgjajyqzandlntnw), tabla `settings`, vía su anon key pública. Textos con
  // problemas de encoding en el origen fueron corregidos a mano.

  console.log("> site_settings");
  const { error: settingsError } = await admin
    .from("site_settings")
    .update({
      business_name: "Pekitas Sumita",
      description: "Moda infantil mayorista para revendedoras y comercios.",
      address: "Bogotá 2973, C1406GCC Ciudad Autónoma de Buenos Aires",
      whatsapp_number: "5491161193179",
      maps_url:
        "https://www.google.com/maps/search/Bogotá+2973+Ciudad+Autónoma+de+Buenos+Aires",
      seo_title: "Pekitas Sumita — Moda infantil mayorista",
      seo_description:
        "Moda infantil por mayor en Buenos Aires. Curvas desde 6 prendas, retiro en local y envíos por transporte a todo el interior.",
      seo_canonical_url: "https://pekitassumitaoficial.com/",
      logo_url:
        "https://chthxgjajyqzandlntnw.supabase.co/storage/v1/object/public/product-images/351c99df11daf233f950.png",
    })
    .eq("id", true);
  if (settingsError) throw settingsError;

  console.log("> landing_sections");
  const sections: {
    type: string;
    sort_order: number;
    status: string;
    content: Record<string, unknown>;
  }[] = [
    {
      type: "header",
      sort_order: 1,
      status: "published",
      content: {
        logo_url:
          "https://chthxgjajyqzandlntnw.supabase.co/storage/v1/object/public/product-images/6508397b82075856c659.png",
      },
    },
    {
      type: "hero",
      sort_order: 2,
      status: "published",
      content: {
        eyebrow: "Mayorista de moda infantil en Buenos Aires",
        title: "Pekitas Sumita — Revendé con estilo",
        subtitle:
          "Prendas para nenas por mayor. Pedido mínimo desde una curva (6 prendas), retiro en local y envíos por transporte a todo el interior.",
        image_url:
          "https://chthxgjajyqzandlntnw.supabase.co/storage/v1/object/public/product-images/a8f6aec175cc7abf4865.jpeg",
        cta_label: "Ver catálogo",
        cta_href: "#productos",
      },
    },
    {
      type: "benefits",
      sort_order: 3,
      status: "published",
      content: {
        items: [
          { icon: "🚚", title: "Pedido mínimo desde una curva (6 prendas)" },
          { icon: "📍", title: "Retiro en local, Flores CABA" },
          { icon: "📦", title: "Envíos al interior por transporte" },
          { icon: "✅", title: "Pagos por transferencia, Mercado Pago o efectivo" },
          { icon: "🕐", title: "Atención directa por WhatsApp" },
        ],
      },
    },
    {
      type: "announcement_bar",
      sort_order: 4,
      status: "published",
      content: {
        texts: [
          "Nueva colección mayorista disponible",
          "Pedido mínimo desde una curva (6 prendas)",
          "Retiro en local: Bogotá 2973, CABA",
          "Envíos por transporte a todo el interior",
          "Pagos por transferencia, Mercado Pago o efectivo",
        ],
      },
    },
    {
      type: "about",
      sort_order: 5,
      status: "published",
      content: {
        title: "Moda infantil pensada para vender",
        text1:
          "Pekitas Sumita acompaña a revendedoras y comercios con prendas infantiles por mayor, curvas claras y atención directa para resolver stock, colores, talles y envíos sin complicaciones.",
        text2:
          "Podés consultar el catálogo online, sumar productos al pedido y finalizar por WhatsApp para confirmar disponibilidad, medio de pago, retiro o despacho por transporte.",
        image_url:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
      },
    },
    {
      type: "footer",
      sort_order: 99,
      status: "published",
      content: {
        tagline:
          "Moda infantil mayorista para revendedoras y comercios. Curvas, retiro en local y envíos al interior.",
        copyright: "© 2026 Pekitas Sumita. Todos los derechos reservados.",
      },
    },
  ];

  for (const section of sections) {
    const { error } = await admin
      .from("landing_sections")
      .upsert(section, { onConflict: "type" });
    if (error) throw error;
    console.log(`  - ${section.type} OK`);
  }

  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
