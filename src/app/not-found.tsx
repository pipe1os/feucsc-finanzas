import Link from "next/link";
import { Button } from "@heroui/react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4">
      <div className="flex flex-col items-center gap-3 max-w-sm text-center">
        <h1 className="text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
          404
        </h1>
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Página no encontrada
          </p>
          <p className="text-xs text-zinc-400">
            Esta URL no existe
          </p>
        </div>
        <Link href="/">
          <Button
            variant="ghost"
            className="text-sm text-red-500 font-medium hover:text-red-600 mt-2"
          >
            ← Volver al resumen
          </Button>
        </Link>
      </div>
    </div>
  );
}
