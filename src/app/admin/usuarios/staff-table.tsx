"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { changeRoleAction, revokeAccessAction, type StaffMember } from "@/app/admin/usuarios/actions";

const TZ = "America/Argentina/Buenos_Aires";

export function StaffTable({
  staff,
  currentUserId,
}: {
  staff: StaffMember[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, role: "admin" | "editor") => {
    startTransition(async () => {
      const result = await changeRoleAction({ userId, role });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Rol actualizado.");
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Última conexión</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>
                <div className="font-medium">{member.fullName || "Sin nombre"}</div>
                <div className="text-muted-foreground text-xs">{member.email}</div>
              </TableCell>
              <TableCell>
                {member.userId === currentUserId ? (
                  <Badge variant="secondary">
                    {member.role === "admin" ? "Administrador" : "Editor"} (vos)
                  </Badge>
                ) : (
                  <Select
                    items={{ editor: "Editor", admin: "Administrador" }}
                    value={member.role}
                    disabled={isPending}
                    onValueChange={(role) =>
                      handleRoleChange(member.userId, role as "admin" | "editor")
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {member.lastSignInAt
                  ? formatInTimeZone(member.lastSignInAt, TZ, "d MMM yyyy, HH:mm", { locale: es })
                  : "Nunca"}
              </TableCell>
              <TableCell className="text-right">
                {member.userId !== currentUserId && (
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        Revocar acceso
                      </Button>
                    }
                    title={`¿Revocar acceso a ${member.email}?`}
                    description="Ya no va a poder entrar al panel administrativo. Su cuenta no se elimina, solo pierde el rol."
                    confirmLabel="Revocar acceso"
                    successMessage="Acceso revocado."
                    onConfirm={() => revokeAccessAction(member.userId)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
