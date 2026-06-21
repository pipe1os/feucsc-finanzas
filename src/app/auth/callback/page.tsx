"use client";

import { Suspense } from "react";
import { Spinner } from "@heroui/react";
import AuthCallback from "./AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full min-h-dvh items-center justify-center bg-transparent">
          <div className="flex flex-col items-center gap-4 animate-fade-in-up">
            <Spinner size="md" color="danger" />
            <p className="text-sm text-muted font-medium">
              Verificando acceso…
            </p>
          </div>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
