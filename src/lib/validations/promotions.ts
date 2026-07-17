import { z } from "zod";

export const promotionSchema = z
  .object({
    // Hidden inputs de RHF mandan "" (no undefined) cuando no hay id todavía.
    id: z.union([z.uuid(), z.literal("")]).optional(),
    name: z.string().trim().min(1, "Requerido").max(150),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "fixed_price"]),
    discount_percentage: z.union([z.coerce.number().min(1).max(100), z.nan()]).optional(),
    fixed_price: z.union([z.coerce.number().min(0), z.nan()]).optional(),
    category_id: z.union([z.uuid(), z.literal("")]).optional(),
    productIds: z.array(z.uuid()).default([]),
    start_at: z.string().min(1, "Requerido"),
    end_at: z.string().min(1, "Requerido"),
    show_countdown: z.boolean(),
    banner_enabled: z.boolean(),
    cta_text: z.string().optional(),
    cta_url: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
  })
  .refine((data) => new Date(data.end_at) >= new Date(data.start_at), {
    message: "La fecha de fin debe ser posterior al inicio",
    path: ["end_at"],
  })
  .refine(
    (data) =>
      data.discount_type === "percentage"
        ? typeof data.discount_percentage === "number" && !Number.isNaN(data.discount_percentage)
        : typeof data.fixed_price === "number" && !Number.isNaN(data.fixed_price),
    { message: "Completá el valor del descuento", path: ["discount_percentage"] }
  );
export type PromotionInput = z.input<typeof promotionSchema>;

export const testimonialSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  customer_name: z.string().trim().min(1, "Requerido").max(120),
  content: z.string().trim().min(1, "Requerido"),
  rating: z.union([z.coerce.number().int().min(1).max(5), z.nan()]).optional(),
  photo_url: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});
export type TestimonialInput = z.input<typeof testimonialSchema>;

export const faqSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  question: z.string().trim().min(1, "Requerido").max(300),
  answer: z.string().trim().min(1, "Requerido"),
  category: z.string().optional(),
  is_active: z.boolean(),
});
export type FaqInput = z.input<typeof faqSchema>;

export const galleryItemSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  image_url: z.string().min(1, "Requerido"),
  alt_text: z.string().trim().min(1, "El texto alternativo es obligatorio").max(200),
  title: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
});
export type GalleryItemInput = z.input<typeof galleryItemSchema>;

export const bannerSchema = z
  .object({
    // Hidden inputs de RHF mandan "" (no undefined) cuando no hay id todavía.
    id: z.union([z.uuid(), z.literal("")]).optional(),
    title: z.string().optional(),
    message: z.string().trim().min(1, "Requerido"),
    cta_text: z.string().optional(),
    cta_url: z.string().optional(),
    image_url: z.string().optional(),
    position: z.enum(["top", "hero", "footer"]),
    start_at: z.string().optional(),
    end_at: z.string().optional(),
    status: z.enum(["draft", "published", "scheduled", "archived"]),
  })
  .refine(
    (data) => !data.start_at || !data.end_at || new Date(data.end_at) >= new Date(data.start_at),
    { message: "La fecha de fin debe ser posterior al inicio", path: ["end_at"] }
  );
export type BannerInput = z.input<typeof bannerSchema>;
