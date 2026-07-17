import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export const metadata = { title: "Iniciar sesión — Pekitas" };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
