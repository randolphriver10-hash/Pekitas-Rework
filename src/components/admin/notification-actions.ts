"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  revalidatePath("/admin", "layout");
}
