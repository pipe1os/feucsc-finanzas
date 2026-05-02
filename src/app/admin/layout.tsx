"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAuthorizedEmail } from "@/lib/auth";

/**
 * Admin layout — protects all /admin/* routes.
 * Checks for an active Supabase session and verifies the email is authorized.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?error=session_expired");
        return;
      }

      if (!isAuthorizedEmail(user.email)) {
        await supabase.auth.signOut();
        router.replace("/login?error=unauthorized");
        return;
      }

      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes (e.g. sign out from another tab)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.replace("/login?error=session_expired");
        return;
      }

      // Validate JWT on sign in / initial load
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isAuthorizedEmail(user.email)) {
          await supabase.auth.signOut();
          router.replace("/login?error=unauthorized");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Idle timeout: auto sign-out after 30 minutes of inactivity
  const idleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const startTimer = () => {
      idleRef.current = setTimeout(() => {
        supabase.auth.signOut();
        router.replace("/login?error=session_expired");
      }, IDLE_TIMEOUT);
    };

    const resetTimer = () => {
      clearTimeout(idleRef.current);
      startTimer();
    };

    startTimer();

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(idleRef.current);
    };
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="size-8 animate-spin rounded-full border-3 border-gray-200 dark:border-gray-800 border-t-red-500" />
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
