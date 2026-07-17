import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";

export const metadata = { title: "Recuperar contraseña — Pekitas" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ForgotPasswordForm />
    </div>
  );
}
