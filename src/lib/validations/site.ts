import { z } from "zod";

const optionalUrl = z.union([z.url("URL inválida"), z.literal("")]).optional();
const optionalText = z.string().optional();

export const businessInfoSchema = z.object({
  business_name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: optionalText,
  address: optionalText,
  whatsapp_number: z
    .union([
      z.string().regex(/^\d{8,15}$/, "Formato internacional sin +, espacios ni guiones (ej. 5491122334455)"),
      z.literal(""),
    ])
    .optional(),
  whatsapp_message_template: optionalText,
  email: z.union([z.email("Email inválido"), z.literal("")]).optional(),
  maps_url: optionalUrl,
  catalog_url: optionalUrl,
});
export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;

export const seoSettingsSchema = z.object({
  seo_title: optionalText,
  seo_description: optionalText,
  seo_keywords: optionalText,
  seo_image_url: optionalUrl,
  seo_canonical_url: optionalUrl,
  logo_url: optionalUrl,
  favicon_url: optionalUrl,
});
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;

export const socialLinkSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  platform: z.string().trim().min(1, "Requerido").max(40),
  url: z.url("URL inválida"),
  is_active: z.boolean(),
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

/** Convierte strings vacíos a null antes de guardar (los inputs de texto no manejan null). */
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === "") {
      result[key] = null as never;
    }
  }
  return result;
}
