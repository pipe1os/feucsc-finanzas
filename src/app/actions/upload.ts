"use server";

import { requireAuth } from"@/lib/require-auth";
import { isValidImage } from"@/lib/validate-image";
import cloudinary from"@/lib/cloudinary-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Sube un comprobante a Cloudinary y devuelve la URL pública.
export async function uploadComprobanteAction(
 formData: FormData,
): Promise<string | null> {
 await requireAuth();

 const file = formData.get("file");

  if (!file) {
    throw new Error("No se proporcionó ningún archivo");
  }

  if (typeof file === "string") {
    throw new Error("No se proporcionó ningún archivo válido");
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
 folder:"comprobantes",
 resource_type:"image",
 allowed_formats: ["jpg","jpeg","png","gif","webp"],
 transformation: [{ quality:"auto" }],
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
