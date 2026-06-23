"use server";

import { z } from"zod";
import { destroyCloudinaryImage } from"@/lib/cloudinary-server";

// CRUD de gastos/categorías. Acá validamos todo porque esto termina en la DB.
import { supabaseServer } from"@/lib/supabase-server";
import { requireAuth } from"@/lib/require-auth";
import { revalidatePath } from"next/cache";

import { type PostgrestError } from"@supabase/supabase-js";

function sanitizeDbError(error: PostgrestError): Error {
 console.error("Supabase DB error:", JSON.stringify(error));
 return new Error(
`Error DB (${error.code ||"unknown"}): Error al procesar la solicitud. Inténtalo de nuevo más tarde.`,
 );
}

const GastoSchema = z.object({
 fecha: z
 .string({ message:"Fecha es requerida" })
 .regex(/^\d{4}-\d{2}-\d{2}$/,"Fecha inválida")
 .refine((d) => !isNaN(Date.parse(d)),"Fecha inválida"),
 descripcion: z
 .string({ message:"Descripción es requerida" })
 .min(1,"Descripción inválida")
 .max(255,"Descripción inválida"),
 categoria: z
 .string({ message:"Categoría es requerida" })
 .min(1,"Categoría inválida")
 .max(100,"Categoría inválida"),
 monto: z.coerce
 .number({ message:"Monto es requerido" })
 .min(0,"Monto inválido")
 .max(1_000_000_000,"Monto inválido")
 .finite("Monto inválido"),
 comprobante_url: z.preprocess(
 (val) => (val ==="" ? null : val),
 z.url("URL de comprobante inválida").refine((url) => {
 try {
 return new URL(url).hostname ==="res.cloudinary.com";
 } catch {
 return false;
 }
 },"URL de comprobante inválida").nullable().optional()
 ),
});

const GastoUpdateSchema = GastoSchema.extend({
 id: z.uuid("ID inválido"),
});

const CategoriaSchema = z.object({
 nombre: z.string({ message:"Nombre es requerido" }).min(1,"Nombre de categoría inválido").max(100,"Nombre de categoría inválido"),
 color: z.string({ message:"Color es requerido" }).regex(/^#[0-9a-f]{6}$/i,"Color inválido"),
});

export async function createGasto(formData: FormData) {
 const rawData = {
 fecha: formData.get("fecha"),
 descripcion: typeof formData.get("descripcion") ==="string" ? (formData.get("descripcion") as string).trim() : formData.get("descripcion"),
 categoria: typeof formData.get("categoria") ==="string" ? (formData.get("categoria") as string).trim() : formData.get("categoria"),
 monto: formData.get("monto"),
 comprobante_url: formData.get("comprobante_url"),
 };

 const parsed = GastoSchema.safeParse(rawData);
 if (!parsed.success) {
 throw new Error(parsed.error.issues[0]?.message ||"Datos inválidos");
 }

 const { fecha, descripcion, categoria, monto, comprobante_url } = parsed.data;

 await requireAuth();

 const { error } = await supabaseServer.client.from("gastos").insert({
 fecha,
 descripcion,
 categoria,
 monto,
 comprobante_url: comprobante_url || null,
 });

 if (error) throw sanitizeDbError(error);
 revalidatePath("/");
 revalidatePath("/gastos");
}

export async function updateGasto(formData: FormData) {
 const rawData = {
 id: formData.get("id"),
 fecha: formData.get("fecha"),
 descripcion: typeof formData.get("descripcion") ==="string" ? (formData.get("descripcion") as string).trim() : formData.get("descripcion"),
 categoria: typeof formData.get("categoria") ==="string" ? (formData.get("categoria") as string).trim() : formData.get("categoria"),
 monto: formData.get("monto"),
 comprobante_url: formData.get("comprobante_url"),
 };

 const parsed = GastoUpdateSchema.safeParse(rawData);
 if (!parsed.success) {
 throw new Error(parsed.error.issues[0]?.message ||"Datos inválidos");
 }

 const { id, fecha, descripcion, categoria, monto, comprobante_url } = parsed.data;

 await requireAuth();

 const { error } = await supabaseServer.client
 .from("gastos")
 .update({
 fecha,
 descripcion,
 categoria,
 monto,
 comprobante_url: comprobante_url || null,
 })
 .eq("id", id);

 if (error) throw sanitizeDbError(error);
 revalidatePath("/");
 revalidatePath("/gastos");
}

export async function deleteGasto(id: string) {
 const parsed = z.uuid("ID inválido").safeParse(id);
 if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ||"ID inválido");
 
 await requireAuth();

 const { data: gastoData } = await supabaseServer.client
 .from("gastos")
 .select("comprobante_url")
 .eq("id", id)
 .single();

 if (
 gastoData?.comprobante_url &&
 gastoData.comprobante_url.startsWith("https://res.cloudinary.com/")
 ) {
 await destroyCloudinaryImage(gastoData.comprobante_url);
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
 const rawData = {
 nombre: typeof nombre ==="string" ? nombre.trim() : nombre,
 color,
 };
 
 const parsed = CategoriaSchema.safeParse(rawData);
 if (!parsed.success) {
 throw new Error(parsed.error.issues[0]?.message ||"Datos inválidos");
 }

 await requireAuth();

 const { error } = await supabaseServer.client
 .from("categorias")
 .insert({ nombre: parsed.data.nombre, color: parsed.data.color });
 if (error) throw sanitizeDbError(error);
 revalidatePath("/");
 revalidatePath("/gastos");
}

export async function deleteCategoria(nombre: string) {
 const parsed = z.string().min(1,"Nombre de categoría inválido").max(100,"Nombre de categoría inválido").safeParse(typeof nombre ==="string" ? nombre.trim() : nombre);
 if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ||"Nombre de categoría inválido");
 
 const n = parsed.data;

 await requireAuth();

 const { error: updateError } = await supabaseServer.client
 .from("gastos")
 .update({ categoria:"N/A" })
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
