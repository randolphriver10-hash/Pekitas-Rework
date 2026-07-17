"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SectionEditor } from "@/app/admin/landing/section-editor";
import { toggleSectionStatusAction, toggleSectionActiveAction } from "@/app/admin/landing/actions";
import type { LandingSectionRow } from "@/lib/supabase/types";

const typeLabels: Record<string, string> = {
  header: "Encabezado / Logo",
  hero: "Hero principal",
  benefits: "Beneficios",
  announcement_bar: "Banner de anuncios",
  about: "Sobre nosotros",
  footer: "Footer",
};

export function SectionCard({ section }: { section: LandingSectionRow }) {
  const [isPending, startTransition] = useTransition();

  const handlePublishToggle = () => {
    startTransition(async () => {
      const next = section.status === "published" ? "draft" : "published";
      const result = await toggleSectionStatusAction(section.id, next);
      if (result?.error) toast.error(result.error);
      else toast.success(next === "published" ? "Publicado." : "Pasado a borrador.");
    });
  };

  const handleActiveToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleSectionActiveAction(section.id, checked);
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base">{typeLabels[section.type] ?? section.type}</CardTitle>
          <Badge variant={section.status === "published" ? "default" : "secondary"}>
            {section.status === "published" ? "Publicado" : "Borrador"}
          </Badge>
        </div>
        <SectionEditor section={section} />
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={section.is_active}
            disabled={isPending}
            onCheckedChange={handleActiveToggle}
          />
          Visible en la landing
        </label>
        <Button variant="outline" size="sm" disabled={isPending} onClick={handlePublishToggle}>
          {section.status === "published" ? "Pasar a borrador" : "Publicar"}
        </Button>
      </CardContent>
    </Card>
  );
}
