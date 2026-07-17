"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { updatePasswordAction } from "@/app/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(updatePasswordAction, undefined);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  if (state?.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Contraseña actualizada</CardTitle>
          <CardDescription>Ya podés entrar al panel con tu nueva contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push("/admin")}>
            Ir al panel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Elegí una nueva contraseña</CardTitle>
        <CardDescription>Mínimo 8 caracteres.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => startTransition(() => formAction(data)))}
          noValidate
        >
          <FieldGroup>
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
            </Field>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
