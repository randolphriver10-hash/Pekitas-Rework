"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, PackageX, Mail, Info } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/components/admin/notification-actions";
import type { NotificationRow } from "@/lib/supabase/types";

const RELATED_TABLE_HREF: Record<string, string> = {
  products: "/admin/productos",
  newsletter_subscribers: "/admin/newsletter",
};

const TYPE_ICON: Record<string, React.ElementType> = {
  low_stock: PackageX,
  newsletter_signup: Mail,
};

export function NotificationBell({ initial }: { initial: NotificationRow[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: NotificationRow }) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
          toast.info(payload.new.title, { description: payload.new.message ?? undefined });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenNotification = (n: NotificationRow) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      startTransition(() => {
        markNotificationReadAction(n.id);
      });
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring relative rounded-md p-2 outline-none hover:bg-accent focus-visible:ring-2"
        aria-label="Notificaciones"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="text-muted-foreground text-xs font-normal hover:text-foreground"
            >
              Marcar todas como leídas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            No hay notificaciones todavía.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Info;
              const href = n.related_table ? RELATED_TABLE_HREF[n.related_table] : undefined;
              return (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleOpenNotification(n)}
                  render={href ? <Link href={href} /> : undefined}
                  className="flex items-start gap-2.5 whitespace-normal"
                >
                  <Icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm leading-tight", !n.is_read && "font-medium")}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-muted-foreground truncate text-xs">{n.message}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
