"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            No se pudieron cargar los datos
          </p>
          <p className="text-xs text-zinc-400">
            Intenta nuevamente o contáctanos
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            onPress={reset}
            className="text-sm text-red-500 font-medium hover:text-red-600 bg-transparent"
          >
            Reintentar
          </Button>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
