"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { BannerDialog } from "@/app/admin/landing/banner-dialog";
import { toggleBannerStatusAction, softDeleteBannerAction } from "@/app/admin/landing/banner-actions";
import { toArDatetimeLocal } from "@/lib/timezone";
import type { BannerRow } from "@/lib/supabase/types";

const positionLabels: Record<string, string> = { top: "Superior", hero: "Hero", footer: "Footer" };

export function BannersSection({ banners }: { banners: BannerRow[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Banners</CardTitle>
          <CardDescription>Avisos superiores o promocionales.</CardDescription>
        </div>
        <BannerDialog trigger={<Button size="sm"><Plus /> Nuevo</Button>} />
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Megaphone />
              </EmptyMedia>
              <EmptyTitle>Sin banners</EmptyTitle>
              <EmptyDescription>Creá el primero.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {banners.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.message}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">{positionLabels[b.position]}</Badge>
                    <Badge variant={b.status === "published" ? "default" : "outline"}>
                      {b.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await toggleBannerStatusAction(
                          b.id,
                          b.status === "published" ? "draft" : "published"
                        );
                        if (result?.error) toast.error(result.error);
                      })
                    }
                  >
                    {b.status === "published" ? "Ocultar" : "Publicar"}
                  </Button>
                  <BannerDialog
                    updatedAt={b.updated_at}
                    defaultValues={{
                      id: b.id,
                      title: b.title ?? "",
                      message: b.message,
                      cta_text: b.cta_text ?? "",
                      cta_url: b.cta_url ?? "",
                      position: b.position,
                      start_at: toArDatetimeLocal(b.start_at),
                      end_at: toArDatetimeLocal(b.end_at),
                      status: b.status,
                    }}
                    trigger={
                      <Button variant="outline" size="icon-sm">
                        <Pencil />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="icon-sm">
                        <Trash2 />
                      </Button>
                    }
                    title="¿Eliminar este banner?"
                    description="Se mueve a la papelera."
                    confirmLabel="Eliminar"
                    onConfirm={() => softDeleteBannerAction(b.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
