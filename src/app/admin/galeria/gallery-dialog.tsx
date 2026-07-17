"use client";

import { useState, useTransition, type ReactElement } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { galleryItemSchema, type GalleryItemInput } from "@/lib/validations/promotions";
import { upsertGalleryItemAction } from "@/app/admin/galeria/actions";
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

export function GalleryDialog({
  trigger,
  defaultValues,
}: {
  trigger: ReactElement;
  defaultValues?: GalleryItemInput;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GalleryItemInput>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: defaultValues ?? { image_url: "", alt_text: "", is_active: true },
  });

  const imageUrl = watch("image_url");

  const onSubmit = (data: GalleryItemInput) => {
    startTransition(async () => {
      const result = await upsertGalleryItemAction(data);
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
          <DialogTitle>{defaultValues ? "Editar imagen" : "Nueva imagen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.image_url}>
              <FieldLabel>Imagen</FieldLabel>
              {imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src={imageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <ImageUploader
                  bucket="site-assets"
                  folder="galeria"
                  onUploaded={(url) => setValue("image_url", url)}
                />
              )}
              <FieldError errors={errors.image_url ? [errors.image_url] : undefined} />
            </Field>
            <Field data-invalid={!!errors.alt_text}>
              <FieldLabel htmlFor="g-alt">Texto alternativo</FieldLabel>
              <Input id="g-alt" {...register("alt_text")} />
              <FieldError errors={errors.alt_text ? [errors.alt_text] : undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="g-title">Título (opcional)</FieldLabel>
              <Input id="g-title" {...register("title")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="g-desc">Descripción (opcional)</FieldLabel>
              <Textarea id="g-desc" rows={2} {...register("description")} />
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
