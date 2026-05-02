"use client";

import { useState, useCallback } from "react";
import { TextField, Label, Input, Button, Alert, toast } from "@heroui/react";
import { createGasto, createCategoria } from "@/app/actions/gastos";
import { uploadComprobanteAction } from "@/app/actions/upload";
import { getNextPaletteColor } from "@/lib/category-palette";
import CategorySelect from "./CategorySelect";
import ComprobanteUpload from "./ComprobanteUpload";
import { PlusIcon } from "./Icons";

interface GastoFormProps {
  categorias: string[];
  categoriasDB: { nombre: string; color?: string }[];
  mutateGastos: () => void;
  mutateCategorias: () => void;
  onDeleteCategory?: (cat: string) => void;
}

export default function GastoForm({
  categorias,
  categoriasDB,
  mutateGastos,
  mutateCategorias,
  onDeleteCategory,
}: GastoFormProps) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Varios");
  const [monto, setMonto] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCategoriaChange = useCallback(
    async (cat: string) => {
      setCategoria(cat);
      if (!categorias.includes(cat)) {
        const usedColors = categoriasDB
          .map((c) => c.color)
          .filter(Boolean) as string[];
        const newColor = getNextPaletteColor(usedColors);
        try {
          await createCategoria(cat, newColor);
          mutateCategorias();
        } catch {
          toast.danger("Error al crear categoría");
        }
      }
    },
    [categorias, categoriasDB, mutateCategorias]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!fecha || !descripcion.trim() || !monto) {
      setFormError("Completa los campos obligatorios.");
      return;
    }
    const montoNum = parseInt(monto, 10);
    if (isNaN(montoNum) || montoNum <= 0) {
      setFormError("El monto debe ser un número positivo.");
      return;
    }
    setSubmitting(true);

    let comprobanteUrl: string | null = null;
    try {
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        comprobanteUrl = await uploadComprobanteAction(uploadForm);
        if (!comprobanteUrl) {
          throw new Error("Error al subir el comprobante");
        }
      }

      const form = new FormData();
      form.append("fecha", fecha);
      form.append("descripcion", descripcion.trim());
      form.append("categoria", categoria);
      form.append("monto", String(montoNum));
      if (comprobanteUrl) form.append("comprobante_url", comprobanteUrl);
      await createGasto(form);

      toast.success("Gasto registrado exitosamente");
      setFecha(new Date().toISOString().split("T")[0]);
      setDescripcion("");
      setCategoria("Varios");
      setMonto("");
      setSelectedFile(null);
      mutateGastos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setFormError(msg);
      toast.danger("Error al registrar gasto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          isRequired
          name="fecha"
          type="date"
          onChange={setFecha}
          className="w-full"
        >
          <Label>Fecha</Label>
          <Input
            value={fecha}
            className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
          />
        </TextField>
        <div className="space-y-1.5">
          <label className="label text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoría
          </label>
          <CategorySelect
            categorias={categorias}
            value={categoria}
            onChange={handleCategoriaChange}
            onDeleteCategory={onDeleteCategory}
          />
        </div>
      </div>
      <TextField
        isRequired
        name="descripcion"
        onChange={setDescripcion}
        className="w-full"
      >
        <Label>Descripción</Label>
        <Input
          placeholder="Ej: Producción Bienvenida Mechona"
          value={descripcion}
          className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
        />
      </TextField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          isRequired
          name="monto"
          type="number"
          onChange={setMonto}
          className="w-full"
        >
          <Label>Monto</Label>
          <Input
            placeholder="850000"
            value={monto}
            className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
          />
        </TextField>
        <ComprobanteUpload
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      </div>
      {formError && (
        <Alert status="danger" className="animate-fade-in-up">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-sm">{formError}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <div className="flex justify-end mt-2">
        <Button
          type="submit"
          size="lg"
          isDisabled={submitting}
          className="w-full sm:w-fit px-8 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 h-12 shadow-sm hover:shadow-md cursor-pointer text-sm"
        >
          {submitting ? (
            <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PlusIcon />
          )}
          {submitting ? "Guardando..." : "Registrar gasto"}
        </Button>
      </div>
    </form>
  );
}
