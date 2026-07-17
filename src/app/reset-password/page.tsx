import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

export const metadata = { title: "Nueva contraseña — Pekitas" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ResetPasswordForm />
    </div>
  );
}
