"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { seoSettingsSchema, type SeoSettingsInput } from "@/lib/validations/site";
import { updateSeoSettingsAction } from "@/app/admin/configuracion/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import type { SiteSettingsRow } from "@/lib/supabase/types";

export function SeoForm({ settings }: { settings: SiteSettingsRow }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SeoSettingsInput>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      seo_title: settings.seo_title ?? "",
      seo_description: settings.seo_description ?? "",
      seo_keywords: settings.seo_keywords ?? "",
      seo_image_url: settings.seo_image_url ?? "",
      seo_canonical_url: settings.seo_canonical_url ?? "",
      logo_url: settings.logo_url ?? "",
      favicon_url: settings.favicon_url ?? "",
    },
  });

  const onSubmit = (data: SeoSettingsInput) => {
    startTransition(async () => {
      const result = await updateSeoSettingsAction({
        ...data,
        expectedUpdatedAt: settings.updated_at,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Configuración guardada.");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marca</CardTitle>
          <CardDescription>
            Logo del header y favicon. Subida de archivos llega en la Etapa 5/6 — por ahora,
            pegá la URL de una imagen ya subida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.logo_url}>
              <FieldLabel htmlFor="logo_url">Logo (URL)</FieldLabel>
              <Input id="logo_url" {...register("logo_url")} />
              <FieldError errors={errors.logo_url ? [errors.logo_url] : undefined} />
            </Field>
            <Field data-invalid={!!errors.favicon_url}>
              <FieldLabel htmlFor="favicon_url">Favicon (URL)</FieldLabel>
              <Input id="favicon_url" {...register("favicon_url")} />
              <FieldError errors={errors.favicon_url ? [errors.favicon_url] : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">SEO general</CardTitle>
          <CardDescription>Título y descripción por defecto del sitio.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.seo_title}>
              <FieldLabel htmlFor="seo_title">Título del sitio</FieldLabel>
              <Input id="seo_title" {...register("seo_title")} />
              <FieldError errors={errors.seo_title ? [errors.seo_title] : undefined} />
            </Field>
            <Field data-invalid={!!errors.seo_description}>
              <FieldLabel htmlFor="seo_description">Meta descripción</FieldLabel>
              <Textarea id="seo_description" rows={3} {...register("seo_description")} />
              <FieldError errors={errors.seo_description ? [errors.seo_description] : undefined} />
            </Field>
            <Field data-invalid={!!errors.seo_keywords}>
              <FieldLabel htmlFor="seo_keywords">Palabras clave</FieldLabel>
              <Input id="seo_keywords" placeholder="separadas por coma" {...register("seo_keywords")} />
              <FieldError errors={errors.seo_keywords ? [errors.seo_keywords] : undefined} />
            </Field>
            <Field data-invalid={!!errors.seo_image_url}>
              <FieldLabel htmlFor="seo_image_url">Imagen para compartir (Open Graph)</FieldLabel>
              <Input id="seo_image_url" {...register("seo_image_url")} />
              <FieldError errors={errors.seo_image_url ? [errors.seo_image_url] : undefined} />
            </Field>
            <Field data-invalid={!!errors.seo_canonical_url}>
              <FieldLabel htmlFor="seo_canonical_url">Canonical URL</FieldLabel>
              <Input id="seo_canonical_url" {...register("seo_canonical_url")} />
              <FieldError errors={errors.seo_canonical_url ? [errors.seo_canonical_url] : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        {isDirty && <span className="text-muted-foreground text-sm">Cambios sin guardar</span>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
