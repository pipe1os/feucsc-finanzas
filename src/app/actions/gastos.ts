"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

const MAX_DESC_LEN = 255;
const MAX_CAT_LEN = 100;

function validDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
}

function validUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function createGasto(formData: FormData) {
  const fecha = formData.get("fecha") as string;
  const descripcion = (formData.get("descripcion") as string || "").trim();
  const categoria = (formData.get("categoria") as string || "").trim();
  const montoRaw = formData.get("monto") as string;
  const monto = Number(montoRaw);
  const comprobante_url = (formData.get("comprobante_url") as string) || null;

  if (!validDate(fecha)) throw new Error("Fecha inválida");
  if (!descripcion || descripcion.length > MAX_DESC_LEN) throw new Error("Descripción inválida");
  if (!categoria || categoria.length > MAX_CAT_LEN) throw new Error("Categoría inválida");
  if (!Number.isFinite(monto) || monto < 0 || monto > 1_000_000_000) throw new Error("Monto inválido");
  if (comprobante_url && !comprobante_url.startsWith("https://res.cloudinary.com/")) throw new Error("URL de comprobante inválida");

  const { error } = await supabaseServer.from("gastos").insert({
    fecha,
    descripcion,
    categoria,
    monto,
    comprobante_url,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function updateGasto(formData: FormData) {
  const id = formData.get("id") as string;
  const fecha = formData.get("fecha") as string;
  const descripcion = (formData.get("descripcion") as string || "").trim();
  const categoria = (formData.get("categoria") as string || "").trim();
  const montoRaw = formData.get("monto") as string;
  const monto = Number(montoRaw);
  const comprobante_url = (formData.get("comprobante_url") as string) || null;

  if (!validUUID(id)) throw new Error("ID inválido");
  if (!validDate(fecha)) throw new Error("Fecha inválida");
  if (!descripcion || descripcion.length > MAX_DESC_LEN) throw new Error("Descripción inválida");
  if (!categoria || categoria.length > MAX_CAT_LEN) throw new Error("Categoría inválida");
  if (!Number.isFinite(monto) || monto < 0 || monto > 1_000_000_000) throw new Error("Monto inválido");
  if (comprobante_url && !comprobante_url.startsWith("https://res.cloudinary.com/")) throw new Error("URL de comprobante inválida");

  const { error } = await supabaseServer.from("gastos").update({
    fecha,
    descripcion,
    categoria,
    monto,
    comprobante_url,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function deleteGasto(id: string) {
  if (!validUUID(id)) throw new Error("ID inválido");

  const { error } = await supabaseServer.from("gastos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/gastos");
}

export async function createCategoria(nombre: string, color: string) {
  const n = (nombre || "").trim();
  if (!n || n.length > MAX_CAT_LEN) throw new Error("Nombre de categoría inválido");
  if (!/^#[0-9a-f]{6}$/i.test(color || "")) throw new Error("Color inválido");

  const { error } = await supabaseServer.from("categorias").insert({ nombre: n, color });
  if (error) throw new Error(error.message);
}

export async function deleteCategoria(nombre: string) {
  const n = (nombre || "").trim();
  if (!n || n.length > MAX_CAT_LEN) throw new Error("Nombre de categoría inválido");

  await supabaseServer.from("gastos").update({ categoria: "N/A" }).eq("categoria", n);
  const { error } = await supabaseServer.from("categorias").delete().eq("nombre", n);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/gastos");
}
