import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

export const headerContentSchema = z.object({
  logo_url: optionalText,
});

export const heroContentSchema = z.object({
  eyebrow: optionalText,
  title: z.string().trim().min(1, "El título es obligatorio"),
  subtitle: optionalText,
  image_url: optionalText,
  cta_label: optionalText,
  cta_href: optionalText,
});

export const benefitItemSchema = z.object({
  icon: z.string().trim().max(4).optional(),
  title: z.string().trim().min(1, "Requerido"),
});
export const benefitsContentSchema = z.object({
  items: z.array(benefitItemSchema).max(8),
});

export const announcementContentSchema = z.object({
  texts: z.array(z.string().trim().min(1, "No puede estar vacío")).max(6),
});

export const aboutContentSchema = z.object({
  title: z.string().trim().min(1, "Requerido"),
  text1: optionalText,
  text2: optionalText,
  image_url: optionalText,
});

export const footerContentSchema = z.object({
  tagline: optionalText,
  copyright: optionalText,
});

export type HeaderContent = z.infer<typeof headerContentSchema>;
export type HeroContent = z.infer<typeof heroContentSchema>;
export type BenefitsContent = z.infer<typeof benefitsContentSchema>;
export type AnnouncementContent = z.infer<typeof announcementContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type FooterContent = z.infer<typeof footerContentSchema>;

export const sectionSchemas = {
  header: headerContentSchema,
  hero: heroContentSchema,
  benefits: benefitsContentSchema,
  announcement_bar: announcementContentSchema,
  about: aboutContentSchema,
  footer: footerContentSchema,
} as const;

export type SectionType = keyof typeof sectionSchemas;
