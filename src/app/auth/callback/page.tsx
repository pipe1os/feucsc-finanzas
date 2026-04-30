"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAuthorizedEmail } from "@/lib/auth";

/**
 * OAuth Callback Page (client-side).
 *
 * After Google sign-in, Supabase redirects here with tokens in the URL hash.
 * The Supabase JS client automatically detects the hash and establishes
 * a session. We then verify the email is authorized and redirect.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificando acceso...");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimeoutRef = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === "SIGNED_IN" && newSession) {
            subscription.unsubscribe();
            clearTimeoutRef();
            await verifyAndRedirect(newSession.user.email);
          }
        });

        timeoutRef.current = setTimeout(() => {
          subscription.unsubscribe();
          router.replace("/login?error=unauthorized");
        }, 8000);

        return () => {
          subscription.unsubscribe();
          clearTimeoutRef();
        };
      }

      await verifyAndRedirect(session.user.email);
    };

    const verifyAndRedirect = async (email: string | undefined) => {
      if (!isAuthorizedEmail(email)) {
        setStatus("Cuenta no autorizada. Redirigiendo...");
        await supabase.auth.signOut();
        timeoutRef.current = setTimeout(() => router.replace("/login?error=unauthorized"), 1000);
        return;
      }

      setStatus("¡Acceso verificado! Redirigiendo...");
      timeoutRef.current = setTimeout(() => router.replace("/admin"), 500);
    };

    handleCallback();

    return () => clearTimeoutRef();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="size-8 animate-spin rounded-full border-3 border-gray-200 border-t-red-500" />
        <p className="text-sm text-gray-500 font-medium">{status}</p>
      </div>
    </div>
  );
}
