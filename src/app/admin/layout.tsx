"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAuthorizedEmail } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { replace } = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        replace("/login?error=session_expired");
        return;
      }

      if (!(await isAuthorizedEmail(user.email))) {
        await supabase.auth.signOut();
        replace("/login?error=unauthorized");
        return;
      }

      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        replace("/login?error=session_expired");
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !(await isAuthorizedEmail(user.email))) {
          await supabase.auth.signOut();
          replace("/login?error=unauthorized");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [replace]);

  const idleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const IDLE_TIMEOUT = 30 * 60 * 1000;

    const startTimer = () => {
      idleRef.current = setTimeout(() => {
        supabase.auth.signOut();
        replace("/login?error=session_expired");
      }, IDLE_TIMEOUT);
    };

    const resetTimer = () => {
      clearTimeout(idleRef.current);
      startTimer();
    };

    startTimer();

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    window.addEventListener("touchstart", resetTimer, { passive: true });

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("touchstart", resetTimer);
      clearTimeout(idleRef.current);
    };
  }, [replace]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="size-8 animate-spin rounded-full border-3 border-zinc-200 dark:border-zinc-800 border-t-red-500" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
            Verificando acceso…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
