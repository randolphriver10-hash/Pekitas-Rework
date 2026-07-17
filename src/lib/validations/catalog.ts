import { z } from "zod";

export const categorySchema = z.object({
  // Hidden inputs de RHF mandan "" (no undefined) cuando no hay id todavía —
  // z.uuid().optional() sólo perdona undefined, por eso el string vacío también.
  id: z.union([z.uuid(), z.literal("")]).optional(),
  parent_id: z.union([z.uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(1, "Requerido").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Requerido")
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  image_url: z.union([z.url("URL inválida"), z.literal("")]).optional(),
  is_active: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  // Hidden inputs de RHF mandan "" (no undefined) cuando no hay id todavía —
  // z.uuid().optional() sólo perdona undefined, por eso el string vacío también.
  id: z.union([z.uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(1, "Requerido").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Requerido")
    .max(220)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  sku: z.string().optional(),
  short_description: z.string().max(300).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "No puede ser negativo"),
  sale_price: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  cost: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  category_id: z.union([z.uuid(), z.literal("")]).optional(),
  status: z.enum(["draft", "published", "hidden", "agotado", "archived"]),
  stock: z.coerce.number().int().min(0, "No puede ser negativo"),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  material: z.string().optional(),
  tagsText: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});
// z.input (no z.infer): price/stock/sale_price/cost usan z.coerce.number(), cuyo
// tipo de output difiere del de input — RHF necesita el tipo de input para que
// register() y defaultValues tipen bien contra el resolver.
export type ProductInput = z.input<typeof productSchema>;

export const productImageSchema = z.object({
  url: z.url("URL inválida"),
  alt_text: z.string().min(1, "El texto alternativo es obligatorio").max(200),
});
export type ProductImageInput = z.infer<typeof productImageSchema>;

export const productVariantSchema = z.object({
  // Hidden inputs de RHF mandan "" (no undefined) cuando no hay id todavía —
  // z.uuid().optional() sólo perdona undefined, por eso el string vacío también.
  id: z.union([z.uuid(), z.literal("")]).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "No puede ser negativo"),
  is_active: z.boolean(),
});
export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
