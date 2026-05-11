"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// No confiar en el MIME del navegador: validamos por magic bytes.
function isValidImage(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }

  // GIF
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return true;
  }

  // WEBP
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
  ) {
    return true;
  }

  return false;
}

async function requireAuth() {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAuthorizedEmail(user.email))) {
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

  if (!file) {
    throw new Error("No se proporcionó ningún archivo");
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el límite de 5 MB");
  }

  // Validar MIME
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen");
  }

  // Validar magic bytes
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (!isValidImage(bytes)) {
    throw new Error(
      "Solo se permiten archivos de imagen válidos (JPEG, PNG, GIF, WebP)",
    );
  }

  try {
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${base64}`,
      {
        folder: "comprobantes",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ quality: "auto" }],
      },
    );

    if (!result.secure_url) {
      throw new Error("Cloudinary no devolvió una URL válida");
    }

    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);

    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error("Error al subir el comprobante");
  }
}
