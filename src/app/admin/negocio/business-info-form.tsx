"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { businessInfoSchema, type BusinessInfoInput } from "@/lib/validations/site";
import { updateBusinessInfoAction } from "@/app/admin/negocio/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field";
import type { SiteSettingsRow } from "@/lib/supabase/types";

export function BusinessInfoForm({ settings }: { settings: SiteSettingsRow }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BusinessInfoInput>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      business_name: settings.business_name,
      description: settings.description ?? "",
      address: settings.address ?? "",
      whatsapp_number: settings.whatsapp_number ?? "",
      whatsapp_message_template: settings.whatsapp_message_template ?? "",
      email: settings.email ?? "",
      maps_url: settings.maps_url ?? "",
      catalog_url: settings.catalog_url ?? "",
    },
  });

  const onSubmit = (data: BusinessInfoInput) => {
    startTransition(async () => {
      const result = await updateBusinessInfoAction({
        ...data,
        expectedUpdatedAt: settings.updated_at,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Información guardada.");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos generales</CardTitle>
          <CardDescription>Se muestran en la landing y en los mensajes de WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.business_name}>
              <FieldLabel htmlFor="business_name">Nombre comercial</FieldLabel>
              <Input id="business_name" {...register("business_name")} />
              <FieldError errors={errors.business_name ? [errors.business_name] : undefined} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Descripción corta</FieldLabel>
              <Textarea id="description" rows={2} {...register("description")} />
              <FieldError errors={errors.description ? [errors.description] : undefined} />
            </Field>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input id="address" {...register("address")} />
              <FieldError errors={errors.address ? [errors.address] : undefined} />
            </Field>

            <Field data-invalid={!!errors.maps_url}>
              <FieldLabel htmlFor="maps_url">Link de Google Maps</FieldLabel>
              <Input id="maps_url" placeholder="https://maps.google.com/..." {...register("maps_url")} />
              <FieldError errors={errors.maps_url ? [errors.maps_url] : undefined} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email de contacto</FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.catalog_url}>
              <FieldLabel htmlFor="catalog_url">Link de catálogo externo (opcional)</FieldLabel>
              <Input id="catalog_url" {...register("catalog_url")} />
              <FieldError errors={errors.catalog_url ? [errors.catalog_url] : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">WhatsApp</CardTitle>
          <CardDescription>
            El botón flotante y el header de la landing usan estos datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.whatsapp_number}>
              <FieldLabel htmlFor="whatsapp_number">Número de WhatsApp</FieldLabel>
              <Input
                id="whatsapp_number"
                placeholder="5491122334455"
                {...register("whatsapp_number")}
              />
              <FieldDescription>
                Formato internacional, solo números, sin +, espacios ni guiones.
              </FieldDescription>
              <FieldError errors={errors.whatsapp_number ? [errors.whatsapp_number] : undefined} />
            </Field>

            <Field data-invalid={!!errors.whatsapp_message_template}>
              <FieldLabel htmlFor="whatsapp_message_template">Mensaje predeterminado</FieldLabel>
              <Textarea
                id="whatsapp_message_template"
                rows={2}
                {...register("whatsapp_message_template")}
              />
              <FieldDescription>
                Podés usar {"{product_name}"}, {"{price}"} y {"{product_url}"} — se completan
                automáticamente cuando el mensaje viene desde un producto (Etapa 5).
              </FieldDescription>
              <FieldError
                errors={
                  errors.whatsapp_message_template ? [errors.whatsapp_message_template] : undefined
                }
              />
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
