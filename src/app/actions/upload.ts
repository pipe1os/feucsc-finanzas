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
  if (!file) throw new Error("No se proporcionó ningún archivo");


  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el límite de 5 MB");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error("Configuración de Cloudinary incompleta");
  }

  const data = new FormData();
  data.append("file", file);
  if (uploadPreset) {
    data.append("upload_preset", uploadPreset);
  }

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "unknown");
      throw new Error(`Error de Cloudinary: ${res.status} ${body}`);
    }
    const json = await res.json();
    if (!json.secure_url) {
      throw new Error("Respuesta inválida de Cloudinary");
    }
    return json.secure_url;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Error al subir el comprobante");
  }
}
