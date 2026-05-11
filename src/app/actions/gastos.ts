"use server";

import crypto from "crypto";

// CRUD de gastos/categorías. Acá validamos todo porque esto termina en la DB.
import { supabaseServer } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Guard simple para asegurar que quien llama está logueado y en la whitelist.
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

const MAX_DESC_LEN = 255;
const MAX_CAT_LEN = 100;

function validDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
}

function validUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function sanitizeDbError(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}): Error {
  console.error("Supabase DB error:", JSON.stringify(error));
  return new Error(
    `Error DB (${error.code || "unknown"}): Error al procesar la solicitud. Inténtalo de nuevo más tarde.`,
  );
}

export async function createGasto(formData: FormData) {
  await requireAuth();
  const fecha = formData.get("fecha") as string;
  const descripcion = ((formData.get("descripcion") as string) || "").trim();
  const categoria = ((formData.get("categoria") as string) || "").trim();
  const montoRaw = formData.get("monto") as string;
  if (montoRaw === null || montoRaw === undefined)
    throw new Error("Monto es requerido");
  const monto = Number(montoRaw);
  const comprobante_url = (formData.get("comprobante_url") as string) || null;

  if (!validDate(fecha)) throw new Error("Fecha inválida");
  if (!descripcion || descripcion.length > MAX_DESC_LEN)
    throw new Error("Descripción inválida");
  if (!categoria || categoria.length > MAX_CAT_LEN)
    throw new Error("Categoría inválida");
  if (!Number.isFinite(monto) || monto < 0 || monto > 1_000_000_000)
    throw new Error("Monto inválido");
  if (comprobante_url) {
    try {
      const parsed = new URL(comprobante_url);
      if (parsed.hostname !== "res.cloudinary.com") throw new Error();
    } catch {
      throw new Error("URL de comprobante inválida");
    }
  }

  const { error } = await supabaseServer.client.from("gastos").insert({
    fecha,
    descripcion,
    categoria,
    monto,
    comprobante_url,
  });

  if (error) throw sanitizeDbError(error);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function updateGasto(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  const fecha = formData.get("fecha") as string;
  const descripcion = ((formData.get("descripcion") as string) || "").trim();
  const categoria = ((formData.get("categoria") as string) || "").trim();
  const montoRaw = formData.get("monto") as string;
  if (montoRaw === null || montoRaw === undefined)
    throw new Error("Monto es requerido");
  const monto = Number(montoRaw);
  const comprobante_url = (formData.get("comprobante_url") as string) || null;

  if (!validUUID(id)) throw new Error("ID inválido");
  if (!validDate(fecha)) throw new Error("Fecha inválida");
  if (!descripcion || descripcion.length > MAX_DESC_LEN)
    throw new Error("Descripción inválida");
  if (!categoria || categoria.length > MAX_CAT_LEN)
    throw new Error("Categoría inválida");
  if (!Number.isFinite(monto) || monto < 0 || monto > 1_000_000_000)
    throw new Error("Monto inválido");
  if (comprobante_url) {
    try {
      const parsed = new URL(comprobante_url);
      if (parsed.hostname !== "res.cloudinary.com") throw new Error();
    } catch {
      throw new Error("URL de comprobante inválida");
    }
  }

  const { error } = await supabaseServer.client
    .from("gastos")
    .update({
      fecha,
      descripcion,
      categoria,
      monto,
      comprobante_url,
    })
    .eq("id", id);

  if (error) throw sanitizeDbError(error);
  revalidatePath("/");
  revalidatePath("/gastos");
}

function extractPublicId(url: string) {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  const path = parts[1];
  const segments = path.split("/");
  if (segments[0].match(/^v\d+$/)) {
    segments.shift();
  }
  const publicIdWithExt = segments.join("/");
  const lastDot = publicIdWithExt.lastIndexOf(".");
  if (lastDot !== -1) {
    return publicIdWithExt.substring(0, lastDot);
  }
  return publicIdWithExt;
}

export async function deleteGasto(id: string) {
  await requireAuth();
  if (!validUUID(id)) throw new Error("ID inválido");

  const { data: gastoData } = await supabaseServer.client
    .from("gastos")
    .select("comprobante_url")
    .eq("id", id)
    .single();

  if (
    gastoData?.comprobante_url &&
    gastoData.comprobante_url.startsWith("https://res.cloudinary.com/")
  ) {
    try {
      const publicId = extractPublicId(gastoData.comprobante_url);
      if (publicId) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
          const timestamp = Math.floor(new Date().getTime() / 1000).toString();
          const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto
            .createHash("sha1")
            .update(stringToSign)
            .digest("hex");

          const formData = new FormData();
          formData.append("public_id", publicId);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            { method: "POST", body: formData },
          );

          if (!response.ok) {
            console.error("Cloudinary delete failed:", await response.json());
          }
        } else {
          console.error("Cloudinary credentials missing for delete");
        }
      }
    } catch (cloudErr) {
      console.error("Error cleaning up Cloudinary image:", cloudErr);
    }
  }

  const { error } = await supabaseServer.client
    .from("gastos")
    .delete()
    .eq("id", id);
  if (error) throw sanitizeDbError(error);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function createCategoria(nombre: string, color: string) {
  await requireAuth();
  const n = (nombre || "").trim();
  if (!n || n.length > MAX_CAT_LEN)
    throw new Error("Nombre de categoría inválido");
  if (!/^#[0-9a-f]{6}$/i.test(color || "")) throw new Error("Color inválido");

  const { error } = await supabaseServer.client
    .from("categorias")
    .insert({ nombre: n, color });
  if (error) throw sanitizeDbError(error);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function deleteCategoria(nombre: string) {
  await requireAuth();
  const n = (nombre || "").trim();
  if (!n || n.length > MAX_CAT_LEN)
    throw new Error("Nombre de categoría inválido");

  const { error: updateError } = await supabaseServer.client
    .from("gastos")
    .update({ categoria: "N/A" })
    .eq("categoria", n);
  if (updateError) throw new Error("Error al reasignar gastos");

  const { error } = await supabaseServer.client
    .from("categorias")
    .delete()
    .eq("nombre", n);
  if (error) throw sanitizeDbError(error);
  revalidatePath("/");
  revalidatePath("/gastos");
}
