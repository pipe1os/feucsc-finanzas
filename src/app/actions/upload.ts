"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// No confiar en el MIME del navegador: validamos por magic bytes.
function isValidImage(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return true;

  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  )
    return true;

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return true;

  return false;
}

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

// Sube un comprobante a Cloudinary y devuelve la URL pública.
export async function uploadComprobanteAction(
  formData: FormData,
): Promise<string | null> {
  await requireAuth();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No se proporcionó ningún archivo");

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  if (!isValidImage(bytes)) {
    throw new Error(
      "Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)",
    );
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el límite de 5 MB");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
      { method: "POST", body: data },
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
