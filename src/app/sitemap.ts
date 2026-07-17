import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("categories")
      .select("id, updated_at")
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...(products ?? []).map((p) => ({
      url: `${siteUrl}/productos/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(categories ?? []).map((c) => ({
      url: `${siteUrl}/productos?categoria=${c.id}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
