"use client";

import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import { Spinner } from"@heroui/react";
import { supabase } from"@/lib/supabase";
import { checkAuthorizedEmailClient } from"@/lib/auth-client";

export default function AuthCallback() {
 const { replace } = useRouter();
 const [status, setStatus] = useState("Verificando acceso…");

 useEffect(() => {
 let mounted = true;
 let timeoutId: ReturnType<typeof setTimeout> | null = null;

 const redirectTo = (path: string) => {
 if (mounted) replace(path);
 };

 const verifyAndRedirect = async (email: string | undefined) => {
 if (!mounted) return;

 try {
 if (!(await checkAuthorizedEmailClient(email))) {
 setStatus("Cuenta no autorizada. Redirigiendo…");
 try {
 await supabase.auth.signOut();
 } catch (e) {
 console.error("SignOut error:", e);
 } finally {
 redirectTo("/login?error=unauthorized");
 }
 return;
 }

 redirectTo("/admin");
 } catch (error) {
 console.error("Error checking auth:", error);
 setStatus("Error de servidor. Redirigiendo…");
 try {
 await supabase.auth.signOut();
 } catch (e) {
 console.error("SignOut error:", e);
 } finally {
 redirectTo("/login?error=unauthorized");
 }
 }
 };

 supabase.auth.getSession().then(({ data: { session } }) => {
 if (!mounted) return;
 if (session?.user?.email) {
 verifyAndRedirect(session.user.email);
 }
 });

 const {
 data: { subscription },
 } = supabase.auth.onAuthStateChange((event, newSession) => {
 if (!mounted) return;
 if (
 (event ==="SIGNED_IN" || event ==="INITIAL_SESSION") &&
 newSession?.user?.email
 ) {
 verifyAndRedirect(newSession.user.email);
 }
 });

 timeoutId = setTimeout(() => {
 if (mounted) redirectTo("/login?error=unauthorized");
 }, 12000);

 return () => {
 mounted = false;
 subscription.unsubscribe();
 if (timeoutId) clearTimeout(timeoutId);
 };
 }, [replace]);

 return (
 <div className="flex w-full min-h-dvh items-center justify-center bg-transparent">
 <div className="flex flex-col items-center gap-4 animate-fade-in-up">
 <Spinner size="md" color="danger" />
 <p className="text-sm text-muted font-medium">{status}</p>
 </div>
 </div>
 );
}
