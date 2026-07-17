import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LandingSectionRow, SiteSettingsRow } from "@/lib/supabase/types";

// cache() dedupea: layout.tsx y cada page.tsx piden esto mismo, así que sin esto
// se dispararían 2 queries idénticas por request en vez de 1.
export const getSiteSettings = cache(async (): Promise<SiteSettingsRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
  return data;
});

export const getPublishedSections = cache(async (): Promise<LandingSectionRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("landing_sections")
    .select("*")
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export function getSection(sections: LandingSectionRow[], type: string) {
  return sections.find((s) => s.type === type);
}
