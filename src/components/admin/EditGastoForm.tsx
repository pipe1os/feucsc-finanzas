"use client";

import { useState, useCallback } from "react";
import { TextField, Label, Input, Button, Alert, toast } from "@heroui/react";
import { updateGasto, createCategoria } from "@/app/actions/gastos";
import { uploadComprobanteAction } from "@/app/actions/upload";
import { deleteCloudinaryImage } from "@/app/actions/cloudinary";
import { getNextPaletteColor } from "@/lib/category-palette";
import CategorySelect from "./CategorySelect";
import ComprobanteUpload from "./ComprobanteUpload";

interface GastoDB {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  comprobante_url: string | null;
  creado_el: string;
}

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
  const [fecha, setFecha] = useState(gasto.fecha);
  const [descripcion, setDescripcion] = useState(gasto.descripcion);
  const [categoria, setCategoria] = useState(gasto.categoria);
  const [monto, setMonto] = useState(String(gasto.monto));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingUrl] = useState<string | null>(gasto.comprobante_url || null);
  const [imageMarkedForDeletion, setImageMarkedForDeletion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoriaChange = useCallback(
    async (cat: string) => {
      setCategoria(cat);
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
    setSubmitting(true);
    setError(null);

    const originalUrl = gasto.comprobante_url;
    let finalUrl: string | null = originalUrl || null;

    try {
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        const uploadedUrl = await uploadComprobanteAction(uploadForm);
        if (uploadedUrl) {
          finalUrl = uploadedUrl;
        } else {
          setError("Error al subir el comprobante");
          toast.danger("Error al subir el comprobante");
          return;
        }
      }

      if (imageMarkedForDeletion) {
        finalUrl = null;
      }
      const form = new FormData();
      form.append("id", gasto.id);
      form.append("fecha", fecha);
      form.append("descripcion", descripcion.trim());
      form.append("categoria", categoria);
      form.append("monto", monto);
      form.append("comprobante_url", finalUrl || "");
      await updateGasto(form);

      if (originalUrl && originalUrl !== finalUrl) {
        await deleteCloudinaryImage(originalUrl);
      }

      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.danger("Error al actualizar gasto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          isRequired
          name="edit_fecha"
          type="date"
          onChange={setFecha}
          className="w-full"
        >
          <Label>Fecha</Label>
          <Input
            value={fecha}
            className="h-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60"
          />
        </TextField>
        <div className="space-y-1.5">
          <label
            htmlFor="edit-gasto-categoria"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Categoría
          </label>
          <CategorySelect
            id="edit-gasto-categoria"
            categorias={categorias}
            value={categoria}
            onChange={handleCategoriaChange}
            onDeleteCategory={onDeleteCategory}
          />
        </div>
      </div>
      <TextField
        isRequired
        name="edit_descripcion"
        onChange={setDescripcion}
        className="w-full"
      >
        <Label>Descripción</Label>
        <Input
          placeholder="Descripción del gasto"
          value={descripcion}
          className="h-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 placeholder:text-zinc-400"
        />
      </TextField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          isRequired
          name="edit_monto"
          type="number"
          onChange={setMonto}
          className="w-full"
        >
          <Label>Monto</Label>
          <Input
            placeholder="850000"
            value={monto}
            className="h-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 placeholder:text-zinc-400"
          />
        </TextField>
        <ComprobanteUpload
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          existingUrl={existingUrl}
          onDeleteExisting={() => setImageMarkedForDeletion(true)}
          isMarkedForDeletion={imageMarkedForDeletion}
          onViewImage={onViewImage}
        />
      </div>
      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-sm">{error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
        <Button
          variant="secondary"
          onPress={onCancel}
          className="cursor-pointer text-zinc-700 dark:text-zinc-200"
        >
          Cancelar
        </Button>
        <Button
          isDisabled={submitting}
          onPress={handleSubmit}
          className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer rounded-xl px-6 font-medium shadow-sm"
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
