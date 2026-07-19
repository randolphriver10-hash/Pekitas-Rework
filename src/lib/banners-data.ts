import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BannerRow } from "@/lib/supabase/types";

export async function getActiveBanner(position: "top" | "hero" | "footer"): Promise<BannerRow | null> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("position", position)
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`start_at.is.null,start_at.lte.${nowIso}`)
    .or(`end_at.is.null,end_at.gte.${nowIso}`)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getActiveBanners(
  position: "top" | "hero" | "footer",
  limit = 10
): Promise<BannerRow[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("position", position)
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`start_at.is.null,start_at.lte.${nowIso}`)
    .or(`end_at.is.null,end_at.gte.${nowIso}`)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return data ?? [];
}
