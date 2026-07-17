"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth/assert-admin";

export type ActionResult = { error?: string } | undefined;

const TRASH_TABLES = [
  "products",
  "categories",
  "promotions",
  "testimonials",
  "faqs",
  "gallery_items",
  "banners",
] as const;
export type TrashTable = (typeof TRASH_TABLES)[number];

function assertValidTable(table: string): asserts table is TrashTable {
  if (!TRASH_TABLES.includes(table as TrashTable)) {
    throw new Error(`Tabla no permitida: ${table}`);
  }
}

export async function restoreItemAction(table: string, id: string): Promise<ActionResult> {
  assertValidTable(table);
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", id);

  if (error) return { error: "No se pudo restaurar." };
  revalidatePath("/admin/historial");
  revalidatePath("/");
  return undefined;
}

export async function hardDeleteItemAction(table: string, id: string): Promise<ActionResult> {
  await assertAdmin();
  assertValidTable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar definitivamente." };
  revalidatePath("/admin/historial");
  return undefined;
}
