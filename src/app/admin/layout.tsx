"use client";

import { useEffect, useState } from "react";
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
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?error=session_expired");
        return;
      }

      if (!isAuthorizedEmail(session.user.email)) {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login?error=session_expired");
      }
    });

    return () => subscription.unsubscribe();
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
