"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function requireAuth() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAuthorizedEmail(user.email)) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function uploadComprobanteAction(formData: FormData): Promise<string | null> {
  await requireAuth();
  const file = formData.get("file") as File | null;
  if (!file) return null;


  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el límite de 5 MB");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary credentials missing");
    return null;
  }

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  const data = new FormData();
  data.append("file", file);
  if (uploadPreset) {
    data.append("upload_preset", uploadPreset);
    data.append("api_key", apiKey);
  }

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.secure_url ?? null;
  } catch {
    return null;
  }
}
