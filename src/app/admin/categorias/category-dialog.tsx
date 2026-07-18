"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categorySchema, slugify, type CategoryInput } from "@/lib/validations/catalog";
import { upsertCategoryAction } from "@/app/admin/categorias/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { CategoryRow } from "@/lib/supabase/types";

export function CategoryDialog({
  trigger,
  defaultValues,
  parentOptions,
  updatedAt,
}: {
  trigger: ReactElement;
  defaultValues?: CategoryInput;
  parentOptions: CategoryRow[];
  updatedAt?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!defaultValues);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      description: "",
      image_url: "",
      parent_id: "",
      is_active: true,
    },
  });

  const onSubmit = (data: CategoryInput) => {
    startTransition(async () => {
      const result = await upsertCategoryAction({ ...data, expectedUpdatedAt: updatedAt });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Guardado.");
      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          <DialogDescription>
            Las subcategorías se eligen marcando una categoría padre.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="cat-name">Nombre</FieldLabel>
              <Input
                id="cat-name"
                {...register("name", {
                  onChange: (e) => {
                    if (!slugTouched) setValue("slug", slugify(e.target.value));
                  },
                })}
              />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
              <Input
                id="cat-slug"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
              />
              <FieldError errors={errors.slug ? [errors.slug] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="cat-parent">Categoría padre (opcional)</FieldLabel>
              <Controller
                control={control}
                name="parent_id"
                render={({ field }) => (
                  <Select
                    items={{
                      none: "Sin padre (categoría principal)",
                      ...Object.fromEntries(parentOptions.map((c) => [c.id, c.name])),
                    }}
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <SelectTrigger id="cat-parent" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin padre (categoría principal)</SelectItem>
                      {parentOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cat-desc">Descripción</FieldLabel>
              <Textarea id="cat-desc" rows={2} {...register("description")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="cat-image">Imagen (URL)</FieldLabel>
              <Input id="cat-image" {...register("image_url")} />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="cat-active">Activa</FieldLabel>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch id="cat-active" checked={field.value} onCheckedChange={field.onChange} />
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
