"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations/users";
import { inviteUserAction } from "@/app/admin/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: "editor" },
  });

  const onSubmit = (data: InviteUserInput) => {
    startTransition(async () => {
      const result = await inviteUserAction(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invitación enviada a ${data.email}`);
      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus />
        Invitar usuario
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
          <DialogDescription>
            Le llega un email para que elija su contraseña y pueda entrar al panel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input id="invite-email" type="email" {...register("email")} />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="invite-name">Nombre</FieldLabel>
              <Input id="invite-name" {...register("fullName")} />
              <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-role">Rol</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    items={{ editor: "Editor", admin: "Administrador" }}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar invitación"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
