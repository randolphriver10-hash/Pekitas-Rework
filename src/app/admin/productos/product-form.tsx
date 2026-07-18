"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, slugify, type ProductInput } from "@/lib/validations/catalog";
import { upsertProductAction } from "@/app/admin/productos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryRow, ProductRow } from "@/lib/supabase/types";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  hidden: "Oculto",
  agotado: "Agotado",
  archived: "Archivado",
};

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductRow;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!product);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku ?? "",
          short_description: product.short_description ?? "",
          description: product.description ?? "",
          price: product.price,
          sale_price: product.sale_price ?? undefined,
          cost: product.cost ?? undefined,
          category_id: product.category_id ?? "",
          status: product.status,
          stock: product.stock,
          is_featured: product.is_featured,
          is_new: product.is_new,
          material: product.material ?? "",
          tagsText: product.tags?.join(", ") ?? "",
          seo_title: product.seo_title ?? "",
          seo_description: product.seo_description ?? "",
        }
      : {
          name: "",
          slug: "",
          price: 0,
          stock: 0,
          status: "draft",
          is_featured: false,
          is_new: false,
        },
  });

  const onSubmit = (data: ProductInput) => {
    startTransition(async () => {
      const result = await upsertProductAction({ ...data, expectedUpdatedAt: product?.updated_at });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Producto guardado." : "Producto creado.");
      if (!product && result?.id) {
        router.push(`/admin/productos/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información básica</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="p-name">Nombre</FieldLabel>
              <Input
                id="p-name"
                {...register("name", {
                  onChange: (e) => {
                    if (!slugTouched) setValue("slug", slugify(e.target.value));
                  },
                })}
              />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="p-slug">Slug</FieldLabel>
                <Input id="p-slug" {...register("slug", { onChange: () => setSlugTouched(true) })} />
                <FieldError errors={errors.slug ? [errors.slug] : undefined} />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-sku">SKU / Código</FieldLabel>
                <Input id="p-sku" {...register("sku")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="p-short">Descripción corta</FieldLabel>
              <Textarea id="p-short" rows={2} {...register("short_description")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="p-desc">Descripción completa</FieldLabel>
              <Textarea id="p-desc" rows={4} {...register("description")} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="p-category">Categoría</FieldLabel>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      items={{
                        none: "Sin categoría",
                        ...Object.fromEntries(
                          categories.map((c) => [c.id, c.parent_id ? `— ${c.name}` : c.name])
                        ),
                      }}
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="p-category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.parent_id ? `— ${c.name}` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-material">Material / Tela</FieldLabel>
                <Input id="p-material" {...register("material")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="p-tags">Etiquetas</FieldLabel>
              <Input id="p-tags" placeholder="separadas por coma" {...register("tagsText")} />
              <FieldDescription>Ej: Oferta, Más vendido, TOP</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Precio y stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="p-price">Precio</FieldLabel>
              <Input id="p-price" type="number" step="0.01" {...register("price")} />
              <FieldError errors={errors.price ? [errors.price] : undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="p-sale-price">Precio promo</FieldLabel>
              <Input id="p-sale-price" type="number" step="0.01" {...register("sale_price")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="p-cost">Costo (interno)</FieldLabel>
              <Input id="p-cost" type="number" step="0.01" {...register("cost")} />
              <FieldDescription>No se muestra en la landing.</FieldDescription>
            </Field>
            <Field data-invalid={!!errors.stock}>
              <FieldLabel htmlFor="p-stock">Stock</FieldLabel>
              <Input id="p-stock" type="number" {...register("stock")} />
              <FieldError errors={errors.stock ? [errors.stock] : undefined} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="p-status">Estado de publicación</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select items={statusLabels} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="p-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="p-featured">Destacado</FieldLabel>
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <Switch id="p-featured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="p-new">Nuevo</FieldLabel>
              <Controller
                control={control}
                name="is_new"
                render={({ field }) => (
                  <Switch id="p-new" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="p-seo-title">Meta título</FieldLabel>
              <Input id="p-seo-title" {...register("seo_title")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="p-seo-desc">Meta descripción</FieldLabel>
              <Textarea id="p-seo-desc" rows={2} {...register("seo_description")} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        {isDirty && <span className="text-muted-foreground text-sm">Cambios sin guardar</span>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : product ? "Guardar cambios" : "Crear y continuar"}
        </Button>
      </div>
    </form>
  );
}
