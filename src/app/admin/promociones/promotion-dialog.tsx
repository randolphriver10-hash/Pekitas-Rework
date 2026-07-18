"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { promotionSchema, type PromotionInput } from "@/lib/validations/promotions";
import { upsertPromotionAction } from "@/app/admin/promociones/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

export function PromotionDialog({
  trigger,
  defaultValues,
  categories,
  products,
  updatedAt,
}: {
  trigger: ReactElement;
  defaultValues?: PromotionInput;
  categories: CategoryRow[];
  products: { id: string; name: string }[];
  updatedAt?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PromotionInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: defaultValues ?? {
      name: "",
      discount_type: "percentage",
      productIds: [],
      start_at: "",
      end_at: "",
      show_countdown: false,
      banner_enabled: false,
      status: "draft",
    },
  });

  const discountType = watch("discount_type");

  const onSubmit = (data: PromotionInput) => {
    startTransition(async () => {
      const result = await upsertPromotionAction({ ...data, expectedUpdatedAt: updatedAt });
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
          <DialogDescription>
            Se activa y desactiva sola según las fechas (hora de Argentina).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="promo-name">Nombre</FieldLabel>
              <Input id="promo-name" {...register("name")} />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="promo-desc">Descripción</FieldLabel>
              <Textarea id="promo-desc" rows={2} {...register("description")} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="promo-type">Tipo de descuento</FieldLabel>
                <Controller
                  control={control}
                  name="discount_type"
                  render={({ field }) => (
                    <Select
                      items={{ percentage: "Porcentaje", fixed_price: "Precio fijo" }}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="promo-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje</SelectItem>
                        <SelectItem value="fixed_price">Precio fijo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field data-invalid={!!errors.discount_percentage}>
                <FieldLabel htmlFor="promo-value">
                  {discountType === "percentage" ? "% de descuento" : "Precio final"}
                </FieldLabel>
                <Input
                  id="promo-value"
                  type="number"
                  step="0.01"
                  {...register(discountType === "percentage" ? "discount_percentage" : "fixed_price")}
                />
                <FieldError
                  errors={errors.discount_percentage ? [errors.discount_percentage] : undefined}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.start_at}>
                <FieldLabel htmlFor="promo-start">Inicio</FieldLabel>
                <Input id="promo-start" type="datetime-local" {...register("start_at")} />
                <FieldError errors={errors.start_at ? [errors.start_at] : undefined} />
              </Field>
              <Field data-invalid={!!errors.end_at}>
                <FieldLabel htmlFor="promo-end">Fin</FieldLabel>
                <Input id="promo-end" type="datetime-local" {...register("end_at")} />
                <FieldError errors={errors.end_at ? [errors.end_at] : undefined} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="promo-category">Aplicar a categoría (opcional)</FieldLabel>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select
                    items={{
                      none: "Ninguna",
                      ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
                    }}
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <SelectTrigger id="promo-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {categories.map((c) => (
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
              <FieldLabel>O productos específicos</FieldLabel>
              <Controller
                control={control}
                name="productIds"
                render={({ field }) => (
                  <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border p-2">
                    {products.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={(field.value ?? []).includes(p.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            field.onChange(
                              checked
                                ? [...current, p.id]
                                : current.filter((id: string) => id !== p.id)
                            );
                          }}
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                )}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field orientation="horizontal">
                <FieldLabel htmlFor="promo-countdown">Mostrar contador</FieldLabel>
                <Controller
                  control={control}
                  name="show_countdown"
                  render={({ field }) => (
                    <Switch id="promo-countdown" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="promo-banner">Mostrar banner</FieldLabel>
                <Controller
                  control={control}
                  name="banner_enabled"
                  render={({ field }) => (
                    <Switch id="promo-banner" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="promo-status">Estado</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={{ draft: "Borrador", published: "Publicada", archived: "Archivada" }}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="promo-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicada</SelectItem>
                      <SelectItem value="archived">Archivada</SelectItem>
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
