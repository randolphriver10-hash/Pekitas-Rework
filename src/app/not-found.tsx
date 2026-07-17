import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground">El contenido que buscás no existe o fue movido.</p>
      <Link href="/" className="mt-4 text-sm font-medium underline underline-offset-4">
        Volver al inicio
      </Link>
    </div>
  );
}
