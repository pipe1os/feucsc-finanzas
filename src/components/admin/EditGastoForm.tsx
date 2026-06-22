"use client";

import { useReducer, useCallback } from"react";
import { TextField, Label, Input, Button, Alert, toast } from"@heroui/react";
import { updateGasto, createCategoria } from"@/app/actions/gastos";
import { uploadComprobanteAction } from"@/app/actions/upload";
import { deleteCloudinaryImage } from"@/app/actions/cloudinary";
import { getNextPaletteColor } from"@/lib/category-palette";
import CategorySelect from"./CategorySelect";
import ComprobanteUpload from"./ComprobanteUpload";

import type { GastoDB } from"@/hooks/useGastos";

interface EditGastoFormProps {
 gasto: GastoDB;
 categorias: string[];
 categoriasDB: { nombre: string; color?: string }[];
 mutateCategorias: () => void;
 onSuccess: () => void;
 onCancel: () => void;
 onDeleteCategory?: (cat: string) => void;
 onViewImage?: (url: string) => void;
}

export default function EditGastoForm({
 gasto,
 categorias,
 categoriasDB,
 mutateCategorias,
 onSuccess,
 onCancel,
 onDeleteCategory,
 onViewImage,
}: EditGastoFormProps) {
 const initialState = {
 fecha: gasto.fecha,
 descripcion: gasto.descripcion,
 categoria: gasto.categoria,
 monto: String(gasto.monto),
 selectedFile: null as File | null,
 imageMarkedForDeletion: false,
 submitting: false,
 error: null as string | null,
 };

 const [state, setState] = useReducer(
 (prev: typeof initialState, next: Partial<typeof initialState>) => ({ ...prev, ...next }),
 initialState
 );
 const existingUrl = gasto.comprobante_url || null;

 const handleCategoriaChange = useCallback(
 async (cat: string) => {
 setState({ categoria: cat });
 if (!categorias.includes(cat)) {
 const usedColors = categoriasDB
 .flatMap((c) => c.color ? [c.color] : []) as string[];
 const newColor = getNextPaletteColor(usedColors);
 try {
 await createCategoria(cat, newColor);
 mutateCategorias();
 } catch {
 toast.danger("Error al crear categoría");
 }
 }
 },
 [categorias, categoriasDB, mutateCategorias],
 );

 const handleSubmit = async () => {
 setState({ submitting: true, error: null });

 const originalUrl = gasto.comprobante_url;
 let finalUrl: string | null = originalUrl || null;

 try {
 if (state.selectedFile) {
 const uploadForm = new FormData();
 uploadForm.append("file", state.selectedFile);
 const uploadedUrl = await uploadComprobanteAction(uploadForm);
 if (uploadedUrl) {
 finalUrl = uploadedUrl;
 } else {
 setState({ error:"Error al subir el comprobante" });
 toast.danger("Error al subir el comprobante");
 return;
 }
 }

 if (state.imageMarkedForDeletion) {
 finalUrl = null;
 }
 const form = new FormData();
 form.append("id", gasto.id);
 form.append("fecha", state.fecha);
 form.append("descripcion", state.descripcion.trim());
 form.append("categoria", state.categoria);
 form.append("monto", state.monto);
 form.append("comprobante_url", finalUrl ||"");
 await updateGasto(form);

 if (originalUrl && originalUrl !== finalUrl) {
 await deleteCloudinaryImage(originalUrl);
 }

 setTimeout(() => {
 onSuccess();
 }, 500);
 } catch (err: unknown) {
 const msg = err instanceof Error ? err.message :"Error desconocido";
 setState({ error: msg });
 toast.danger("Error al actualizar gasto");
 } finally {
 setState({ submitting: false });
 }
 };

 return (
 <div className="space-y-5">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <TextField
 isRequired
 name="edit_fecha"
 type="date"
 onChange={(val) => setState({ fecha: val })}
 className="w-full"
 >
 <Label>Fecha</Label>
 <Input
 value={state.fecha}
 className="h-10 bg-zinc-50 border border-border"
 />
 </TextField>
 <div className="space-y-1.5">
 <label
 htmlFor="edit-gasto-categoria"
 className="text-sm font-medium text-zinc-700"
 >
 Categoría
 </label>
 <CategorySelect
 id="edit-gasto-categoria"
 categorias={categorias}
 value={state.categoria}
 onChange={handleCategoriaChange}
 onDeleteCategory={onDeleteCategory}
 />
 </div>
 </div>
 <TextField
 isRequired
 name="edit_descripcion"
 onChange={(val) => setState({ descripcion: val })}
 className="w-full"
 >
 <Label>Descripción</Label>
 <Input
 placeholder="Descripción del gasto"
 value={state.descripcion}
 className="h-10 bg-zinc-50 border border-border placeholder:text-zinc-400"
 />
 </TextField>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <TextField
 isRequired
 name="edit_monto"
 type="number"
 onChange={(val) => setState({ monto: val })}
 className="w-full"
 >
 <Label>Monto</Label>
 <Input
 placeholder="850000"
 value={state.monto}
 className="h-10 bg-zinc-50 border border-border placeholder:text-zinc-400"
 />
 </TextField>
 <ComprobanteUpload
 selectedFile={state.selectedFile}
 setSelectedFile={(val) => setState({ selectedFile: val, imageMarkedForDeletion: false })}
 existingUrl={existingUrl}
 onDeleteExisting={() => setState({ imageMarkedForDeletion: true })}
 isMarkedForDeletion={state.imageMarkedForDeletion}
 onViewImage={onViewImage}
 />
 </div>
 {state.error && (
 <Alert status="danger">
 <Alert.Indicator />
 <Alert.Content>
 <Alert.Title className="text-sm">{state.error}</Alert.Title>
 </Alert.Content>
 </Alert>
 )}
 <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
 <Button
 variant="secondary"
 onPress={onCancel}
 className="cursor-pointer text-zinc-700"
 >
 Cancelar
 </Button>
 <Button
 isDisabled={state.submitting}
 onPress={handleSubmit}
 className="bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer rounded-xl px-6 font-medium shadow-sm"
 >
 {state.submitting ?"Guardando..." :"Guardar cambios"}
 </Button>
 </div>
 </div>
 );
}
