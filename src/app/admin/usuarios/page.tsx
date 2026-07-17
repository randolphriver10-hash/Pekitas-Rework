import { ShieldAlert } from "lucide-react";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { getStaffList } from "@/app/admin/usuarios/actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InviteUserDialog } from "@/app/admin/usuarios/invite-user-dialog";
import { StaffTable } from "@/app/admin/usuarios/staff-table";

export default async function UsersPage() {
  const staff = await getCurrentStaff();

  if (staff?.role !== "admin") {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>No autorizado</EmptyTitle>
          <EmptyDescription>
            Esta sección es exclusiva para administradores.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const staffList = await getStaffList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios y permisos</h1>
          <p className="text-muted-foreground text-sm">
            Administradores tienen acceso total. Editores pueden gestionar contenido pero
            no usuarios ni configuración crítica.
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <StaffTable staff={staffList} currentUserId={staff.id} />
    </div>
  );
}
