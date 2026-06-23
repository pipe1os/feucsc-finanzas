"use client";

import { useReducer, useCallback } from"react";
import { TextField, Label, Input, Button, Alert, toast } from"@heroui/react";
import { createGasto, createCategoria } from"@/app/actions/gastos";
import { uploadComprobanteAction } from"@/app/actions/upload";
import { getNextPaletteColor } from"@/lib/category-palette";
import CategorySelect from"./CategorySelect";
import ComprobanteUpload from"./ComprobanteUpload";
import { PlusIcon } from"./Icons";

interface GastoFormProps {
 categorias: string[];
 categoriasDB: { nombre: string; color?: string }[];
 mutateGastos: () => void;
 mutateCategorias: () => void;
 onDeleteCategory?: (cat: string) => void;
}

const initialState = {
 fecha: new Date().toISOString().split("T")[0],
 descripcion:"",
 categoria:"Varios",
 monto:"",
 selectedFile: null as File | null,
 submitting: false,
 formError: null as string | null,
};

export default function GastoForm({
 categorias,
 categoriasDB,
 mutateGastos,
 mutateCategorias,
 onDeleteCategory,
}: GastoFormProps) {
 const [state, setState] = useReducer(
 (prev: typeof initialState, next: Partial<typeof initialState>) => ({ ...prev, ...next }),
 initialState
 );

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

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setState({ formError: null });
 if (!state.fecha || !state.descripcion.trim() || !state.monto) {
 setState({ formError:"Completa los campos obligatorios." });
 return;
 }
 const montoNum = parseInt(state.monto, 10);
 if (isNaN(montoNum) || montoNum <= 0) {
 setState({ formError:"El monto debe ser un número positivo." });
 return;
 }
 setState({ submitting: true });

 let comprobanteUrl: string | null = null;
 try {
 if (state.selectedFile) {
 const uploadForm = new FormData();
 uploadForm.append("file", state.selectedFile);
 comprobanteUrl = await uploadComprobanteAction(uploadForm);
 if (!comprobanteUrl) {
 throw new Error("Error al subir el comprobante");
 }
 }

 const form = new FormData();
 form.append("fecha", state.fecha);
 form.append("descripcion", state.descripcion.trim());
 form.append("categoria", state.categoria);
 form.append("monto", String(montoNum));
 if (comprobanteUrl) form.append("comprobante_url", comprobanteUrl);
 await createGasto(form);

 toast.success("Gasto registrado exitosamente");
 setState({
 fecha: new Date().toISOString().split("T")[0],
 descripcion:"",
 categoria:"Varios",
 monto:"",
 selectedFile: null,
 });
 mutateGastos();
 } catch (err: unknown) {
 const msg = err instanceof Error ? err.message :"Error desconocido";
 setState({ formError: msg });
 toast.danger("Error al registrar gasto");
 } finally {
 setState({ submitting: false });
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <TextField
 isRequired
 name="fecha"
 type="date"
 onChange={(val) => { setState({ fecha: val }); }}
 className="w-full"
 >
 <Label>Fecha</Label>
 <Input
 value={state.fecha}
 className="h-10 bg-gray-50 border border-border"
 />
 </TextField>
 <div className="space-y-1.5">
 <label
 htmlFor="gasto-categoria"
 className="label text-sm font-medium text-gray-700"
 >
 Categoría
 </label>
 <CategorySelect
 id="gasto-categoria"
 categorias={categorias}
 value={state.categoria}
 onChange={handleCategoriaChange}
 onDeleteCategory={onDeleteCategory}
 />
 </div>
 </div>
 <TextField
 isRequired
 name="descripcion"
 onChange={(val) => { setState({ descripcion: val }); }}
 className="w-full"
 >
 <Label>Descripción</Label>
 <Input
 placeholder="Ej: Producción Bienvenida Mechona"
 value={state.descripcion}
 className="h-10 bg-gray-50 border border-border placeholder:text-gray-400"
 />
 </TextField>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <TextField
 isRequired
 name="monto"
 type="number"
 onChange={(val) => { setState({ monto: val }); }}
 className="w-full"
 >
 <Label>Monto</Label>
 <Input
 placeholder="850000"
 value={state.monto}
 className="h-10 bg-gray-50 border border-border placeholder:text-gray-400"
 />
 </TextField>
 <ComprobanteUpload
 selectedFile={state.selectedFile}
 setSelectedFile={(val) => { setState({ selectedFile: val }); }}
 />
 </div>
 {state.formError && (
 <Alert status="danger" className="animate-fade-in-up">
 <Alert.Indicator />
 <Alert.Content>
 <Alert.Title className="text-sm">{state.formError}</Alert.Title>
 </Alert.Content>
 </Alert>
 )}

 <div className="flex justify-end mt-2">
 <Button
 type="submit"
 size="lg"
 isDisabled={state.submitting}
 className="w-full sm:w-fit px-8 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-200 h-12 shadow-xs hover:shadow-md cursor-pointer text-sm"
 >
 {state.submitting ? (
 <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
 ) : (
 <PlusIcon />
 )}
 {state.submitting ?"Guardando..." :"Registrar gasto"}
 </Button>
 </div>
 </form>
 );
}
