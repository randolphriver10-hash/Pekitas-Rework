"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const WATCHED_TABLES = [
  "site_settings",
  "landing_sections",
  "social_links",
  "banners",
  "categories",
  "products",
  "product_images",
  "product_variants",
  "promotions",
  "promotion_products",
  "testimonials",
  "faqs",
  "gallery_items",
];

/**
 * Escucha cambios en las tablas administrables y refresca los Server Components
 * de la página (router.refresh) sin recargar el navegador. No usa el payload del
 * evento como fuente de verdad — solo dispara un refetch server-side, que sí pasa
 * por RLS. Si Realtime no puede conectar (red, límite de conexiones), la landing
 * sigue funcionando con los datos del último render / la próxima recarga manual.
 */
export function RealtimeWatcher() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase.channel("public-content-sync");
    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table },
        scheduleRefresh
      );
    }
    channel.subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
