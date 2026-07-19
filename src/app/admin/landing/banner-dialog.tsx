"use client";

import { useState, useTransition, type ReactElement } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { bannerSchema, type BannerInput } from "@/lib/validations/promotions";
import { upsertBannerAction } from "@/app/admin/landing/banner-actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BannerDialog({
  trigger,
  defaultValues,
  updatedAt,
}: {
  trigger: ReactElement;
  defaultValues?: BannerInput;
  updatedAt?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: defaultValues ?? { message: "", position: "top", status: "draft" },
  });

  const imageUrl = watch("image_url");

  const onSubmit = (data: BannerInput) => {
    startTransition(async () => {
      const result = await upsertBannerAction({ ...data, expectedUpdatedAt: updatedAt });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Guardado.");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar banner" : "Nuevo banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field>
              <FieldLabel htmlFor="b-title">Título (opcional)</FieldLabel>
              <Input id="b-title" {...register("title")} />
            </Field>
            <Field data-invalid={!!errors.message}>
              <FieldLabel htmlFor="b-message">Mensaje</FieldLabel>
              <Textarea id="b-message" rows={2} {...register("message")} />
              <FieldError errors={errors.message ? [errors.message] : undefined} />
            </Field>
            <Field>
              <FieldLabel>Imagen (para el banner Hero, ej. carrusel de inicio)</FieldLabel>
              {imageUrl ? (
                <div className="relative aspect-[4/5] w-full max-w-40 overflow-hidden rounded-lg border">
                  <Image src={imageUrl} alt="" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 bottom-1"
                    onClick={() => setValue("image_url", "")}
                  >
                    Quitar
                  </Button>
                </div>
              ) : (
                <ImageUploader
                  bucket="site-assets"
                  folder="banners"
                  onUploaded={(url) => setValue("image_url", url)}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="b-cta-text">Texto del botón</FieldLabel>
                <Input id="b-cta-text" {...register("cta_text")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="b-cta-url">Link del botón</FieldLabel>
                <Input id="b-cta-url" {...register("cta_url")} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="b-position">Posición</FieldLabel>
              <Controller
                control={control}
                name="position"
                render={({ field }) => (
                  <Select
                    items={{ top: "Superior", hero: "Hero", footer: "Footer" }}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="b-position" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Superior</SelectItem>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="b-start">Inicio (opcional)</FieldLabel>
                <Input id="b-start" type="datetime-local" {...register("start_at")} />
              </Field>
              <Field data-invalid={!!errors.end_at}>
                <FieldLabel htmlFor="b-end">Fin (opcional)</FieldLabel>
                <Input id="b-end" type="datetime-local" {...register("end_at")} />
                <FieldError errors={errors.end_at ? [errors.end_at] : undefined} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="b-status">Estado</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={{ draft: "Borrador", published: "Publicado", archived: "Archivado" }}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="b-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
