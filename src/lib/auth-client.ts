export async function checkAuthorizedEmailClient(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;
  
  try {
    const res = await fetch("/api/auth/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    if (!res.ok) return false;
    
    const data = await res.json();
    return !!data.authorized;
  } catch (error) {
    console.error("Failed to check auth via API:", error);
    return false;
  }
}
