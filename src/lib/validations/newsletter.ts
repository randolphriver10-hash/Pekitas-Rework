import { z } from "zod";

export const newsletterSignupSchema = z.object({
  email: z.email("Ingresá un email válido"),
  segment: z.enum(["bebes", "ninas", "ninos", "general"]),
});
export type NewsletterSignupInput = z.infer<typeof newsletterSignupSchema>;
