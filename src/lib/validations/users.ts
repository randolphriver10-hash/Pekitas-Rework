import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.email("Ingresá un email válido"),
  fullName: z.string().trim().min(1, "Ingresá un nombre").max(100),
  role: z.enum(["admin", "editor"]),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const changeRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["admin", "editor"]),
});
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
