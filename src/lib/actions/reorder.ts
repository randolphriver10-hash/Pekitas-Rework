"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const REORDERABLE_TABLES = [
  "faqs",
  "testimonials",
  "categories",
  "social_links",
  "gallery_items",
] as const;

type ReorderableTable = (typeof REORDERABLE_TABLES)[number];

export async function reorderItemsAction(
  table: ReorderableTable,
  ids: string[],
  path: string
): Promise<{ error?: string }> {
  if (!REORDERABLE_TABLES.includes(table)) return { error: "Tabla inválida." };

  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, index) => supabase.from(table).update({ sort_order: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed) return { error: "No se pudo guardar el nuevo orden." };

  revalidatePath(path);
  revalidatePath("/");
  return {};
}
