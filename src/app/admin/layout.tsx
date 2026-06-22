"use client";

import { useEffect, useState } from"react";
// useRouter removed: ponytail - using window.location.href for guaranteed hard redirect
import { supabase } from"@/lib/supabase";
import { checkAuthorizedEmailClient } from"@/lib/auth-client";

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const checkAuth = async () => {
 try {
 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 window.location.href ="/login?error=session_expired";
 return;
 }

 if (!(await checkAuthorizedEmailClient(user.email))) {
 await supabase.auth.signOut();
 window.location.href ="/login?error=unauthorized";
 return;
 }

 setLoading(false);
 } catch (error) {
 console.error("Error during auth check:", error);
 window.location.href ="/login?error=unauthorized";
 }
 };

 checkAuth();

 const {
 data: { subscription },
 } = supabase.auth.onAuthStateChange(async (event, session) => {
 if (!session) {
 window.location.href ="/login?error=session_expired";
 return;
 }

 if (event ==="SIGNED_IN" || event ==="INITIAL_SESSION") {
 try {
 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user || !(await checkAuthorizedEmailClient(user.email))) {
 await supabase.auth.signOut();
 window.location.href ="/login?error=unauthorized";
 }
 } catch (error) {
 console.error("Error during auth state change:", error);
 await supabase.auth.signOut();
 window.location.href ="/login?error=unauthorized";
 }
 }
 });

 return () => subscription.unsubscribe();
 }, []);

 useEffect(() => {
 const IDLE_TIMEOUT = 30 * 60 * 1000;
 let timer: ReturnType<typeof setTimeout> | undefined;

 const startTimer = () => {
 timer = setTimeout(async () => {
 await supabase.auth.signOut();
 window.location.href ="/login?error=session_expired";
 }, IDLE_TIMEOUT);
 };

 const resetTimer = () => {
 clearTimeout(timer);
 startTimer();
 };

 const events = ["mousemove","keydown","click","scroll"];
 events.forEach((event) => window.addEventListener(event, resetTimer));
 window.addEventListener("touchstart", resetTimer, { passive: true });

 startTimer();

 return () => {
 events.forEach((event) => window.removeEventListener(event, resetTimer));
 window.removeEventListener("touchstart", resetTimer);
 clearTimeout(timer);
 };
 }, []);

 if (loading) {
 return (
 <div className="flex w-full min-h-dvh items-center justify-center bg-transparent">
 <div className="flex flex-col items-center gap-4 animate-fade-in-up">
 <div className="size-8 animate-spin rounded-full border-3 border-border border-t-red-500" />
 <p className="text-sm text-zinc-400 font-medium">
 Verificando acceso…
 </p>
 </div>
 </div>
 );
 }

 return <>{children}</>;
}
