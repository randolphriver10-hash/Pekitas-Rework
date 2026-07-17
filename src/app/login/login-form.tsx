"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const authError = searchParams.get("error");

  const [state, formAction] = useActionState(loginAction, undefined);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginInput) => {
    startTransition(() => {
      formAction({ ...data, next });
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Panel administrativo</CardTitle>
        <CardDescription>Pekitas — acceso solo para staff autorizado.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {authError === "no-autorizado" && (
              <Alert variant="destructive">
                <AlertDescription>
                  Tu cuenta no tiene un rol asignado en el panel. Pedile a un administrador que
                  te invite.
                </AlertDescription>
              </Alert>
            )}
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Ingresando..." : "Ingresar"}
            </Button>

            <Link
              href="/forgot-password"
              className="text-muted-foreground text-center text-sm hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
