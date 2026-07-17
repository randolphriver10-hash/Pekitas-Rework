"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertTriangle className="text-destructive h-10 w-10" />
      <h1 className="text-xl font-semibold">Ocurrió un error en el panel</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        No se pudo cargar esta sección. Podés reintentar o volver al dashboard.
      </p>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" nativeButton={false} render={<a href="/admin" />}>
          Ir al dashboard
        </Button>
        <Button onClick={() => reset()}>Reintentar</Button>
      </div>
    </div>
  );
}
