"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { requestPasswordResetAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, undefined);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  if (state?.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Revisá tu email</CardTitle>
          <CardDescription>
            Si el email está registrado, te llegó un link para restablecer la contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm hover:underline">
            Volver al login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
        <CardDescription>Te mandamos un link para elegir una nueva.</CardDescription>
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

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Enviando..." : "Enviar link"}
            </Button>

            <Link href="/login" className="text-muted-foreground text-center text-sm hover:underline">
              Volver al login
            </Link>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
