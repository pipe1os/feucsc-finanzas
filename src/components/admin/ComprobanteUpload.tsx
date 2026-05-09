"use client";

import { Button, Label } from "@heroui/react";
import { UploadIcon, EyeIcon } from "./Icons";

interface ComprobanteUploadProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  existingUrl?: string | null;
  onDeleteExisting?: () => void;
  isMarkedForDeletion?: boolean;
  onViewImage?: (url: string) => void;
}

export default function ComprobanteUpload({
  selectedFile,
  setSelectedFile,
  existingUrl,
  onDeleteExisting,
  isMarkedForDeletion,
  onViewImage,
}: ComprobanteUploadProps) {
  const displayText = selectedFile
    ? selectedFile.name
    : existingUrl && !isMarkedForDeletion
      ? "Imagen adjunta"
      : "(sin archivo seleccionado)";


  if (existingUrl !== undefined) {

    if (!existingUrl || isMarkedForDeletion) {
      return (
        <div className="flex flex-col gap-1.5 h-full justify-end">
          <Label>Comprobante</Label>
          <div className="flex items-center gap-3">
            <label
              className={`flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer text-sm font-medium shrink-0
              ${selectedFile ? "opacity-50 cursor-not-allowed" : "hover:border-red-400 hover:text-red-600 transition-colors"}`}
            >
              <UploadIcon />
              {selectedFile ? "Archivo seleccionado" : "Subir archivo"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={!!selectedFile}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </label>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden">
                <span className="truncate max-w-37.5 sm:max-w-50">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Eliminar archivo"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }


    return (
      <div className="flex flex-col gap-2 h-full justify-end">
        <Label>Comprobante</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onViewImage?.(existingUrl)}
            className="inline-flex items-center justify-center size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Ver imagen actual"
          >
            <EyeIcon />
          </button>
          <Button
            variant="ghost"
            className="flex-1 bg-gray-200/50 dark:bg-gray-800/50 h-10 text-red-600 hover:text-red-700"
            onPress={() => onDeleteExisting?.()}
          >
            Eliminar imagen
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-1.5 h-full justify-end">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Comprobante
      </label>
      <div className="flex items-center gap-3">
        <label
          className={`flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer text-sm font-medium shrink-0
          ${selectedFile ? "opacity-50 cursor-not-allowed" : "hover:border-red-400 hover:text-red-600 transition-colors"}`}
        >
          <UploadIcon />
          {selectedFile ? "Archivo seleccionado" : "Subir archivo"}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={!!selectedFile}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
            }}
          />
        </label>

        <div className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden">
          <span className="truncate max-w-37.5 sm:max-w-50">
            {displayText}
          </span>
          {selectedFile && (
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Eliminar archivo"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
