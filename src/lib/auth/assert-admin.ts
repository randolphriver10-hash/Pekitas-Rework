import "server-only";
import { getCurrentStaff } from "@/lib/auth/current-staff";

/**
 * Defensa de servidor para acciones exclusivas de admin. La UI ya oculta estos
 * botones a un editor, pero un editor podría igual invocar el server action a
 * mano — esto es lo que realmente lo bloquea (además de RLS en las tablas que
 * corresponda).
 */
export async function assertAdmin() {
  const staff = await getCurrentStaff();
  if (!staff || staff.role !== "admin") {
    throw new Error("No autorizado: esta acción es solo para administradores.");
  }
  return staff;
}
