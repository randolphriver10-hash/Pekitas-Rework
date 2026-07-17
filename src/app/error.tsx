"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ocurrió un error inesperado. Podés intentar de nuevo; si el problema sigue, avisá al
        administrador del sitio.
      </p>
      <Button onClick={() => reset()} className="mt-2">
        Reintentar
      </Button>
    </div>
  );
}
