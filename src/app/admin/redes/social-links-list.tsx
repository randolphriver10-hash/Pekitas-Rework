"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Share2 } from "lucide-react";
import { SocialLinkDialog } from "@/app/admin/redes/social-link-dialog";
import { toggleSocialLinkAction, deleteSocialLinkAction } from "@/app/admin/redes/actions";
import type { SocialLinkRow } from "@/lib/supabase/types";

export function SocialLinksList({ links }: { links: SocialLinkRow[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, next: boolean) => {
    startTransition(async () => {
      const result = await toggleSocialLinkAction(id, next);
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SocialLinkDialog
          trigger={
            <Button>
              <Plus />
              Agregar
            </Button>
          }
        />
      </div>

      {links.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Share2 />
            </EmptyMedia>
            <EmptyTitle>Sin redes sociales cargadas</EmptyTitle>
            <EmptyDescription>Agregá Instagram, TikTok o Facebook.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.platform}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {link.url}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={link.is_active}
                      disabled={isPending}
                      onCheckedChange={(checked) => handleToggle(link.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SocialLinkDialog
                        defaultValues={{
                          id: link.id,
                          platform: link.platform,
                          url: link.url,
                          is_active: link.is_active,
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
                        title={`¿Eliminar ${link.platform}?`}
                        description="Se va a quitar del footer de la landing."
                        confirmLabel="Eliminar"
                        successMessage="Eliminado."
                        onConfirm={() => deleteSocialLinkAction(link.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
