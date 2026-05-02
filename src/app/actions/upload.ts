"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates image file by checking magic byte signatures in the file header.
 * This is a server-side check that cannot be bypassed by changing the MIME type.
 *
 * JPEG: FF D8 FF
 * PNG:  89 50 4E 47
 * GIF:  47 49 46 38
 * WebP: 52 49 46 46 xx xx xx xx 57 45 42 50
 */
function isValidImage(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;

  // GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;

  // WebP: 52 49 46 46 followed by 57 45 42 50 at offset 8
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return true;

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

export async function uploadComprobanteAction(formData: FormData): Promise<string | null> {
  await requireAuth();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No se proporcionó ningún archivo");

  // Server-side magic byte validation — cannot be bypassed by spoofed MIME type
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  if (!isValidImage(bytes)) {
    throw new Error("Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)");
  }

  // Secondary MIME type check (belt-and-suspenders)
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
