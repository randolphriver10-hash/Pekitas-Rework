import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaff();

  // El proxy ya filtra esto en el 99% de los casos; esto es la segunda capa de
  // defensa por si el rol se revoca entre el chequeo del proxy y el render.
  if (!staff) {
    redirect("/login?error=no-autorizado");
  }

  return (
    <div className="bg-muted/30 flex min-h-svh">
      <AdminSidebar isAdmin={staff.role === "admin"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar staff={staff} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
