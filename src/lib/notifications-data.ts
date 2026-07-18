import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/supabase/types";

export async function getRecentNotifications(limit = 20): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
}
