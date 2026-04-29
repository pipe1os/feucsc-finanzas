"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SortDescriptor } from "@heroui/react";
import {
  Card,
  Button,
  Alert,
  Table,
  Modal,
  Tooltip,
  Pagination,
  TextField,
  Label,
  Input,
  AlertDialog,
  EmptyState,
  ListBox,
  Select,
  toast,
} from "@heroui/react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { getNextPaletteColor, OTROS_COLOR } from "@/lib/category-palette";
import { uploadComprobante } from "@/lib/cloudinary";
import { deleteCloudinaryImage } from "@/app/actions/cloudinary";

/* ── Icons ──────────────────────────────────────── */
const SunIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const LogOutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const ImageIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const InboxIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const XIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* ── Theme Toggle Component ─────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 p-1 h-9">
        <div className="flex-1" />
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    <div className="flex items-center rounded-xl bg-gray-100 dark:bg-white/5 p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
          ${
            isLight
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
      >
        <SunIcon />
        <span>Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
          ${
            !isLight
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
      >
        <MoonIcon />
        <span>Oscuro</span>
      </button>
    </div>
  );
}

/* ── ComprobanteUpload component ────────────────── */
interface ComprobanteUploadProps {
  // Modo creación: usamos File seleccionado
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  // Modo edición: URL existente + callback para marcar eliminación
  existingUrl?: string | null;
  onDeleteExisting?: () => void;
  // Estado de eliminación pendiente (para UI)
  isMarkedForDeletion?: boolean;
  // Para ver imagen en lightbox
  onViewImage?: (url: string) => void;
}

function ComprobanteUpload({
  selectedFile,
  setSelectedFile,
  existingUrl,
  onDeleteExisting,
  isMarkedForDeletion,
  onViewImage,
}: ComprobanteUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crear URL de preview cuando hay archivo seleccionado
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const displayText = selectedFile
    ? selectedFile.name
    : existingUrl && !isMarkedForDeletion
      ? "Imagen adjunta"
      : "(sin archivo seleccionado)";

  const hasContent = selectedFile || (existingUrl && !isMarkedForDeletion);

  // Modo edición con imagen existente
  if (existingUrl !== undefined) {
    // Sin imagen o marcada para eliminar - mostrar input de upload
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
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
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

    // Tiene imagen existente - mostrar icono ver + eliminar centrado
    return (
      <div className="flex flex-col gap-2 h-full justify-end">
        <Label>Comprobante</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onViewImage?.(existingUrl)}
            className="inline-flex items-center justify-center size-8 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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

  // Modo creación
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
          <span className="truncate max-w-[150px] sm:max-w-[200px]">
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

/* ── Sortable header ─────────────────────────── */
function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center gap-1 cursor-pointer">
      {children}
      {!!sortDirection && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-transform duration-200 ease-out ${sortDirection === "descending" ? "rotate-180" : ""}`}
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      )}
    </span>
  );
}

/* ── Types ──────────────────────────────────────── */
interface GastoDB {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  comprobante_url: string | null;
  creado_el: string;
}
interface CategoriaDB {
  id: string;
  nombre: string;
  color?: string;
  creado_el: string;
}

const ROWS_PER_PAGE = 10;

// Opciones de mes para filtrado (solo meses de 2026)
const MONTH_OPTIONS = [
  { id: "all", label: "Todos los meses" },
  { id: "01", label: "Enero" },
  { id: "02", label: "Febrero" },
  { id: "03", label: "Marzo" },
  { id: "04", label: "Abril" },
  { id: "05", label: "Mayo" },
  { id: "06", label: "Junio" },
  { id: "07", label: "Julio" },
  { id: "08", label: "Agosto" },
  { id: "09", label: "Septiembre" },
  { id: "10", label: "Octubre" },
  { id: "11", label: "Noviembre" },
  { id: "12", label: "Diciembre" },
];

// Colores por categoría
const CATEGORY_COLORS: Record<string, string> = {
  "Reuniones y eventos": "bg-amber-100 text-amber-800 border-amber-200",
  "Viáticos y transporte": "bg-green-100 text-green-800 border-green-200",
  "Infraestructura y mantenimiento": "bg-red-100 text-red-800 border-red-200",
  "Tecnología y equipos": "bg-blue-100 text-blue-800 border-blue-200",
  "Apoyo a estudiantes": "bg-purple-100 text-purple-800 border-purple-200",
  "Difusión y publicidad": "bg-orange-100 text-orange-800 border-orange-200",
  "Oficina y útiles": "bg-gray-100 text-gray-800 border-gray-200",
  "Arriendo": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Otros": "bg-gray-100 text-gray-800 border-gray-200",
};

function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

function formatShortDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


/* ── CategorySelect — custom dropdown with inline delete ── */
function CategorySelect({
  categorias,
  value,
  onChange,
  onDeleteCategory,
}: {
  categorias: string[];
  value: string;
  onChange: (cat: string) => void;
  onDeleteCategory?: (cat: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const confirmNewCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsCreating(false);
      setNewCatName("");
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setIsCreating(false);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 px-4 py-2.5
                   text-sm text-gray-900 dark:text-white transition-all duration-200 cursor-pointer
                   hover:border-gray-300 dark:hover:border-zinc-700 focus:border-red-300  focus:ring-2 focus:ring-red-100 outline-hidden"
      >
        <span>{value}</span>
        <span
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1 animate-fade-in-up"
          style={{ animationDuration: "150ms" }}
        >
          <div className="max-h-60 overflow-y-auto">
            {categorias.map((cat) => {
              const isSelected = cat === value;
              const isOtros = cat === "Otros";
              return (
                <div
                  key={cat}
                  className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                ${isSelected ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                >
                  <span
                    className="flex-1"
                    onClick={() => {
                      onChange(cat);
                      setOpen(false);
                    }}
                  >
                    {cat}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {!isOtros && onDeleteCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat);
                          setOpen(false);
                        }}
                        className="inline-flex items-center justify-center size-5 rounded-full
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                 text-red-400 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                        aria-label={`Eliminar ${cat}`}
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider + Nueva categoría */}
          <div className="border-t border-gray-100 dark:border-zinc-800 mt-1 pt-1">
            {isCreating ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nombre..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmNewCategory();
                    }
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-gray-500 outline-hidden focus:border-red-300 focus:ring-1 focus:ring-red-100"
                />
                <button
                  type="button"
                  onClick={confirmNewCategory}
                  className="inline-flex items-center justify-center rounded-lg bg-red-500 px-2 py-1.5 text-white text-xs hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-800 px-2 py-1.5 text-gray-400 dark:text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setIsCreating(true);
                  setNewCatName("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 font-medium cursor-pointer hover:bg-red-50 transition-colors duration-150"
              >
                <PlusIcon /> Nueva categoría
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Admin Page
   ══════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();

  // ── Form ──
  const [fecha, setFecha] = useState("");
  useEffect(() => {
    setFecha(new Date().toISOString().split("T")[0]);
  }, []);
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Otros");
  const [monto, setMonto] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Table ──
  const [gastos, setGastos] = useState<GastoDB[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Categories from DB ──
  const [categoriasDB, setCategoriasDB] = useState<CategoriaDB[]>([]);
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [deletingCatLoading, setDeletingCatLoading] = useState(false);

  // ── Edit ──
  const [editGasto, setEditGasto] = useState<GastoDB | null>(null);
  const [editFecha, setEditFecha] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCategoria, setEditCategoria] = useState("Otros");
  const [editMonto, setEditMonto] = useState("");
  // Estados para manejo de imagen en edición
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editExistingUrl, setEditExistingUrl] = useState<string | null>(null);
  const [editImageMarkedForDeletion, setEditImageMarkedForDeletion] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Delete gasto ──
  const [deleteGasto, setDeleteGasto] = useState<GastoDB | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Lightbox ──
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ── Fetch gastos ──
  const fetchGastos = useCallback(async () => {
    setLoadingTable(true);
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    if (!error && data) setGastos(data);
    setLoadingTable(false);
  }, []);

  // ── Fetch categories from DB ──
  const fetchCategorias = useCallback(async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");
    if (!error && data) setCategoriasDB(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGastos();
    fetchCategorias();
  }, [fetchGastos, fetchCategorias]);

  // ── Category names sorted (Otros always last) ──
  const categorias = useMemo(() => {
    const names = categoriasDB.map((c) => c.nombre);
    return names.sort((a, b) => {
      if (a === "Otros") return 1;
      if (b === "Otros") return -1;
      return a.localeCompare(b);
    });
  }, [categoriasDB]);

  // ── Compute category colors map ──
  const catColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categoriasDB) {
      if (c.color) map[c.nombre] = c.color;
    }
    return map;
  }, [categoriasDB]);

  // ── Create category in DB if new ──
  const handleCategoriaChange = async (cat: string) => {
    setCategoria(cat);
    // If this category doesn't exist in DB yet, insert it
    if (!categorias.includes(cat)) {
      const usedColors = categoriasDB
        .map((c) => c.color)
        .filter(Boolean) as string[];
      const newColor = getNextPaletteColor(usedColors);
      await supabase
        .from("categorias")
        .insert({ nombre: cat, color: newColor });
      fetchCategorias();
    }
  };
  const handleEditCategoriaChange = async (cat: string) => {
    setEditCategoria(cat);
    if (!categorias.includes(cat)) {
      const usedColors = categoriasDB
        .map((c) => c.color)
        .filter(Boolean) as string[];
      const newColor = getNextPaletteColor(usedColors);
      await supabase
        .from("categorias")
        .insert({ nombre: cat, color: newColor });
      fetchCategorias();
    }
  };

  // ── Delete category ──
  const handleDeleteCategory = async () => {
    if (!deletingCat) return;
    setDeletingCatLoading(true);
    // 1. Update all gastos with this category → "N/A"
    await supabase
      .from("gastos")
      .update({ categoria: "N/A" })
      .eq("categoria", deletingCat);
    // 2. Delete from categorias table
    await supabase.from("categorias").delete().eq("nombre", deletingCat);
    setDeletingCatLoading(false);
    setDeletingCat(null);
    fetchCategorias();
    fetchGastos();
  };

  // ── Search + Sort + Paginate ──
  const filtered = useMemo(() => {
    let result = [...gastos];

    // Filtro por mes
    if (selectedMonth !== "all") {
      result = result.filter((g) => {
        const month = g.fecha.substring(5, 7);
        return month === selectedMonth;
      });
    }

    // Filtro por categoría
    if (selectedCategory !== "all") {
      result = result.filter((g) => g.categoria === selectedCategory);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.descripcion.toLowerCase().includes(q) ||
          g.categoria.toLowerCase().includes(q) ||
          formatCLP(g.monto).includes(q) ||
          g.fecha.includes(q),
      );
    }

    if (sortDescriptor.column) {
      result.sort((a, b) => {
        const col = sortDescriptor.column as string;
        let cmp = 0;
        if (col === "fecha") cmp = a.fecha.localeCompare(b.fecha);
        else if (col === "cat") cmp = a.categoria.localeCompare(b.categoria);
        else if (col === "monto") cmp = a.monto - b.monto;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
    }
    return result;
  }, [gastos, searchQuery, sortDescriptor, selectedMonth, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );
  const pStart = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const pEnd = Math.min(page * ROWS_PER_PAGE, filtered.length);

  const handleSearch = (val: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(1);
    }, 250);
  };

  // ── Handlers ──
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
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
    
    // Subir imagen a Cloudinary si hay archivo seleccionado
    let comprobanteUrl: string | null = null;
    if (selectedFile) {
      comprobanteUrl = await uploadComprobante(selectedFile);
      if (!comprobanteUrl) {
        setSubmitting(false);
        setFormError("Error al subir el comprobante");
        toast.danger("Error al subir el comprobante");
        return;
      }
    }
    
    const { error } = await supabase.from("gastos").insert({
      fecha,
      descripcion: descripcion.trim(),
      categoria,
      monto: montoNum,
      comprobante_url: comprobanteUrl,
    });
    setSubmitting(false);
    if (error) {
      setFormError(`Error: ${error.message}`);
      toast.danger("Error al registrar gasto");
      return;
    }
    setSuccess(true);
    toast.success("Gasto registrado exitosamente");
    setFecha(new Date().toISOString().split("T")[0]);
    setDescripcion("");
    setCategoria("Otros");
    setMonto("");
    setSelectedFile(null);
    setTimeout(() => setSuccess(false), 4000);
    fetchGastos();
  };

  const openEdit = (g: GastoDB) => {
    setEditGasto(g);
    setEditFecha(g.fecha);
    setEditDescripcion(g.descripcion);
    setEditCategoria(g.categoria);
    setEditMonto(String(g.monto));
    // Resetear estados de imagen
    setEditSelectedFile(null);
    setEditExistingUrl(g.comprobante_url || null);
    setEditImageMarkedForDeletion(false);
    setEditError(null);
  };
  const handleEditSubmit = async () => {
    if (!editGasto) return;
    setEditSubmitting(true);
    setEditError(null);

    const originalUrl = editGasto.comprobante_url;
    let finalUrl: string | null = originalUrl || null;

    // Si hay nueva imagen seleccionada, subirla
    if (editSelectedFile) {
      const uploadedUrl = await uploadComprobante(editSelectedFile);
      if (uploadedUrl) {
        finalUrl = uploadedUrl;
      } else {
        setEditSubmitting(false);
        setEditError("Error al subir el comprobante");
        toast.danger("Error al subir el comprobante");
        return;
      }
    }

    // Si se marcó para eliminar, establecer URL como null
    if (editImageMarkedForDeletion) {
      finalUrl = null;
    }

    const { error } = await supabase
      .from("gastos")
      .update({
        fecha: editFecha,
        descripcion: editDescripcion.trim(),
        categoria: editCategoria,
        monto: parseInt(editMonto, 10),
        comprobante_url: finalUrl,
      })
      .eq("id", editGasto.id);
    
    setEditSubmitting(false);
    if (error) {
      setEditError(`Error: ${error.message}`);
      toast.danger("Error al actualizar gasto");
      return;
    }

    // Eliminar imagen anterior de Cloudinary si:
    // 1. Se subió una nueva imagen (reemplazo)
    // 2. Se eliminó la imagen existente
    if (originalUrl && originalUrl !== finalUrl) {
      await deleteCloudinaryImage(originalUrl);
    }

    // Limpiar estados de imagen primero
    setEditSelectedFile(null);
    setEditExistingUrl(null);
    setEditImageMarkedForDeletion(false);
    // Cerrar modal con delay para evitar conflicto de view transitions
    // HeroUI v3 usa View Transitions API y puede colisionar con múltiples overlays
    setTimeout(() => {
      setEditGasto(null);
      fetchGastos();
      toast.success("Gasto actualizado exitosamente");
    }, 500);
  };

  const handleDelete = async () => {
    if (!deleteGasto) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", deleteGasto.id);
    setDeleting(false);
    if (error) {
      setDeleteError(`Error: ${error.message}`);
      toast.danger("Error al eliminar gasto");
      return;
    }

    if (deleteGasto.comprobante_url) {
      await deleteCloudinaryImage(deleteGasto.comprobante_url);
    }

    toast.success("Gasto eliminado exitosamente");
    setDeleteGasto(null);
    fetchGastos();
    if (paginated.length === 1 && page > 1) setPage(page - 1);
  };

  // Count gastos per category for the manager panel
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gastos.forEach((g) => {
      counts[g.categoria] = (counts[g.categoria] || 0) + 1;
    });
    return counts;
  }, [gastos]);

  return (
    <div className="min-h-dvh flex bg-gray-50 dark:bg-zinc-950">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center px-5 pt-7 pb-5">
            <Image
              src="/logofeucsc.webp"
              alt="Logo FEUCSC"
              width={894}
              height={307}
              className="h-16 w-auto object-contain dark:brightness-110 dark:contrast-110"
              priority
            />
          </div>
          <div className="mx-5 h-px bg-gray-100 dark:bg-gray-800" />

          <nav className="flex flex-col gap-1 px-4 pt-6">
            <span className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
              Administración
            </span>
            <div
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm text-red-600 dark:text-red-400 cursor-pointer"
              style={{ backgroundColor: "rgba(227, 7, 7, 0.07)" }}
            >
              <span className="flex items-center justify-center size-8 rounded-lg text-red-500 dark:text-red-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
              </span>
              Gestión de Gastos
            </div>
          </nav>

          <div className="flex-1" />

          <div className="px-5 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onPress={handleSignOut}
              className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer font-medium rounded-xl mb-4"
            >
              <LogOutIcon />
              Cerrar sesión
            </Button>
            <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-14 flex items-center">
        <div className="w-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logofeucsc.webp"
              alt="FEUCSC"
              width={80}
              height={40}
              className="object-contain dark:brightness-110 dark:contrast-110"
            />
            <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={handleSignOut}
            className="text-gray-500 hover:text-red-500"
          >
            <LogOutIcon />
          </Button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          {/* Heading */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Gestión de Gastos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ingresa, edita o elimina gastos de la base de datos.
            </p>
          </div>

          {/* ── Form card ── */}
          <Card className="overflow-visible rounded-2xl shadow-apple border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 sm:p-8 mb-8 animate-fade-in-up stagger-1 opacity-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Ingresar Gasto
            </h2>
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
                    onDeleteCategory={setDeletingCat}
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
                  placeholder="Ej: Producción Semana Mechona"
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
          </Card>

          {/* ── Gastos table ── */}
          <Card className="rounded-2xl shadow-apple border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 animate-fade-in-up stagger-2 opacity-0">
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gastos Registrados
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                  {filtered.length} de {gastos.length} gastos
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filtro por mes */}
                  <Select
                    className="w-44"
                    placeholder="Mes"
                    aria-label="Filtrar por mes"
                    selectedKey={selectedMonth}
                    onSelectionChange={(key) => {
                      if (key !== null) {
                        setSelectedMonth(key as string);
                        setPage(1);
                      }
                    }}
                  >
                    <Select.Trigger className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
                      <Select.Value>
                        {({ isPlaceholder, state }) => {
                          if (isPlaceholder) return "Mes: Todos";
                          const k = state.selectedItems?.[0]?.key;
                          if (k === "all") return "Mes: Todos";
                          const found = MONTH_OPTIONS.find((m) => m.id === k);
                          return `Mes: ${found?.label ?? "Todos"}`;
                        }}
                      </Select.Value>
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-zinc-700 dark:bg-zinc-900 min-w-48">
                      <ListBox>
                        {MONTH_OPTIONS.map((m) => (
                          <ListBox.Item key={m.id} id={m.id} textValue={m.label}>
                            {m.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  {/* Filtro por categoría */}
                  <Select
                    className="w-56"
                    placeholder="Categoría"
                    aria-label="Filtrar por categoría"
                    selectedKey={selectedCategory}
                    onSelectionChange={(key) => {
                      if (key !== null) {
                        setSelectedCategory(key as string);
                        setPage(1);
                      }
                    }}
                  >
                    <Select.Trigger className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
                      <Select.Value>
                        {({ isPlaceholder, state }) => {
                          if (isPlaceholder) return "Categoría: Todas";
                          const k = state.selectedItems?.[0]?.key;
                          if (k === "all") return "Categoría: Todas";
                          return `Categoría: ${String(k ?? "Todas")}`;
                        }}
                      </Select.Value>
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-zinc-700 dark:bg-zinc-900 min-w-56">
                      <ListBox>
                        <ListBox.Item id="all" textValue="Todas las categorías">
                          Todas las categorías
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        {categoriasDB.map((cat) => (
                          <ListBox.Item key={cat.nombre} id={cat.nombre} textValue={cat.nombre}>
                            {cat.nombre}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <div className="relative w-full sm:w-48">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    defaultValue=""
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-gray-500 outline-hidden transition-all duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {/* Limpiar filtros - aparece debajo */}
              {(selectedMonth !== "all" || selectedCategory !== "all") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 cursor-pointer h-9 w-fit"
                  onPress={() => {
                    setSelectedMonth("all");
                    setSelectedCategory("all");
                    setPage(1);
                  }}
                >
                  <XIcon />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
          <div className="p-6 pt-4">
              {loadingTable ? (
                <div className="flex items-center justify-center py-16">
                  <div className="size-8 animate-spin rounded-full border-3 border-gray-200 dark:border-zinc-800 border-t-red-500" />
                </div>
              ) : (
                <div>
                  {/* ListBox para mobile */}
                  <div className="md:hidden">
                    {paginated.length === 0 ? (
                      <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-400 border border-gray-100 dark:border-zinc-800 shadow-xs">
                          <SearchIcon />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {searchQuery ? "Sin resultados" : "Sin gastos"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {searchQuery
                              ? "Intenta con otro término."
                              : "Ingresa un gasto usando el formulario."}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <ListBox
                        aria-label="Gastos"
                        className="divide-y divide-gray-100 dark:divide-gray-800"
                      >
                        {paginated.map((g) => {
                          const catColor = catColors[g.categoria] || OTROS_COLOR;
                          return (
                            <ListBox.Item
                              key={g.id}
                              id={g.id}
                              textValue={g.descripcion}
                              className="rounded-none px-0 py-3 border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {g.descripcion}
                                  </span>
                                  <span className="font-semibold text-sm text-gray-900 dark:text-white tabular-nums shrink-0">
                                    {formatCLP(g.monto)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-medium"
                                      style={{
                                        backgroundColor: `${catColor}18`,
                                        color: catColor,
                                      }}
                                    >
                                      {g.categoria}
                                    </span>
                                    <span>{formatShortDate(g.fecha)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {g.comprobante_url && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setLightboxUrl(g.comprobante_url!);
                                        }}
                                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        title="Ver comprobante"
                                      >
                                        <ImageIcon />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEdit(g);
                                      }}
                                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                      title="Editar"
                                    >
                                      <EditIcon />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteGasto(g);
                                      }}
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      title="Eliminar"
                                    >
                                      <TrashIcon />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    )}
                    {/* Mobile pagination */}
                    {totalPages > 0 && (
                      <div className="mt-4 flex flex-col gap-3">
                        <span className="text-xs text-gray-500 text-center">
                          {pStart} a {pEnd} de {filtered.length} resultados
                        </span>
                        <Pagination size="sm">
                          <Pagination.Content className="justify-center">
                            <Pagination.Item>
                              <Pagination.Previous
                                isDisabled={page === 1}
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                              >
                                <Pagination.PreviousIcon />
                              </Pagination.Previous>
                            </Pagination.Item>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {page} / {totalPages}
                            </span>
                            <Pagination.Item>
                              <Pagination.Next
                                isDisabled={page === totalPages}
                                onPress={() =>
                                  setPage((p) => Math.min(totalPages, p + 1))
                                }
                              >
                                <Pagination.NextIcon />
                              </Pagination.Next>
                            </Pagination.Item>
                          </Pagination.Content>
                        </Pagination>
                      </div>
                    )}
                  </div>

                  {/* Tabla para desktop */}
                  <div className="hidden md:block">
                    <Table variant="secondary" className="w-full">
                      <Table.ScrollContainer>
                        <Table.Content aria-label="Gastos" className="w-full">
                      <Table.Header>
                        <Table.Column allowsSorting isRowHeader id="fecha" className="w-27.5">
                          {({ sortDirection }) => (
                            <SortableColumnHeader sortDirection={sortDirection}>
                              Fecha
                            </SortableColumnHeader>
                          )}
                        </Table.Column>
                        <Table.Column id="desc" className="min-w-50">
                          Descripción
                        </Table.Column>
                        <Table.Column allowsSorting id="cat" className="w-30">
                          {({ sortDirection }) => (
                            <SortableColumnHeader sortDirection={sortDirection}>
                              Categoría
                            </SortableColumnHeader>
                          )}
                        </Table.Column>
                        <Table.Column allowsSorting id="monto" className="w-30">
                          {({ sortDirection }) => (
                            <SortableColumnHeader sortDirection={sortDirection}>
                              Monto
                            </SortableColumnHeader>
                          )}
                        </Table.Column>
                        <Table.Column id="actions" className="w-35 text-center">
                          Acciones
                        </Table.Column>
                      </Table.Header>
                      <Table.Body
                        renderEmptyState={() => (
                          <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-zinc-800">
                              {searchQuery ? <SearchIcon /> : <InboxIcon />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {searchQuery ? "Sin resultados" : "Sin gastos"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {searchQuery
                                  ? "Intenta con otro término."
                                  : "Ingresa un gasto usando el formulario."}
                              </span>
                            </div>
                          </EmptyState>
                        )}
                      >
                        {paginated.map((g) => {
                          const catColor =
                            catColors[g.categoria] || OTROS_COLOR;
                          return (
                            <Table.Row key={g.id}>
                              <Table.Cell>
                                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {formatDate(g.fecha)}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {g.descripcion}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <span
                                  className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: `${catColor}1A`,
                                    color: catColor,
                                  }}
                                >
                                  {g.categoria}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                  {formatCLP(g.monto)}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <div className="flex items-center justify-center gap-1.5">
                                  <Tooltip delay={0}>
                                    <Tooltip.Trigger>
                                      <button
                                        onClick={() =>
                                          g.comprobante_url &&
                                          setLightboxUrl(g.comprobante_url)
                                        }
                                        disabled={!g.comprobante_url}
                                        className={`inline-flex items-center justify-center size-8 rounded-full transition-all duration-200 cursor-pointer ${g.comprobante_url ? "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700" : "bg-gray-50 dark:bg-zinc-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed"}`}
                                        aria-label="Ver comprobante"
                                      >
                                        <EyeIcon />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
                                      <p>
                                        {g.comprobante_url
                                          ? "Ver comprobante"
                                          : "Sin comprobante"}
                                      </p>
                                    </Tooltip.Content>
                                  </Tooltip>
                                  <Tooltip delay={0}>
                                    <Tooltip.Trigger>
                                      <button
                                        onClick={() => openEdit(g)}
                                        className="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
                                        aria-label="Editar"
                                      >
                                        <EditIcon />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
                                      <p>Editar</p>
                                    </Tooltip.Content>
                                  </Tooltip>
                                  <Tooltip delay={0}>
                                    <Tooltip.Trigger>
                                      <button
                                        onClick={() => setDeleteGasto(g)}
                                        className="inline-flex items-center justify-center size-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 cursor-pointer"
                                        aria-label="Eliminar"
                                      >
                                        <TrashIcon />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg">
                                      <p>Eliminar</p>
                                    </Tooltip.Content>
                                  </Tooltip>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                  {filtered.length > 0 && (
                    <Table.Footer>
                      <Pagination size="sm">
                        <Pagination.Summary>
                          {pStart} a {pEnd} de {filtered.length} gastos
                        </Pagination.Summary>
                        <Pagination.Content>
                          <Pagination.Item>
                            <Pagination.Previous
                              isDisabled={page === 1}
                              onPress={() => setPage((p) => Math.max(1, p - 1))}
                            >
                              <Pagination.PreviousIcon />
                              Ant.
                            </Pagination.Previous>
                          </Pagination.Item>
                          {pages.map((p) => (
                            <Pagination.Item key={p}>
                              <Pagination.Link
                                isActive={p === page}
                                onPress={() => setPage(p)}
                              >
                                {p}
                              </Pagination.Link>
                            </Pagination.Item>
                          ))}
                          <Pagination.Item>
                            <Pagination.Next
                              isDisabled={page === totalPages}
                              onPress={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                            >
                              Sig.
                              <Pagination.NextIcon />
                            </Pagination.Next>
                          </Pagination.Item>
                        </Pagination.Content>
                      </Pagination>
                    </Table.Footer>
                  )}
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              ← Ver portal público
            </Link>
          </div>
        </div>
      </main>

      {/* ── Edit Modal ── */}
      <Modal.Backdrop
        isOpen={!!editGasto}
        onOpenChange={() => setEditGasto(null)}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-apple-lg">
            <Modal.CloseTrigger className="hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" />
            <Modal.Header className="sm:px-8 sm:pt-6 border-b border-gray-100 dark:border-zinc-800/50 pb-4 mb-4">
              <Modal.Heading className="text-xl font-semibold">
                Editar Gasto
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-5 sm:px-8 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField
                  isRequired
                  name="edit_fecha"
                  type="date"
                  onChange={setEditFecha}
                  className="w-full"
                >
                  <Label>Fecha</Label>
                  <Input
                    value={editFecha}
                    className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
                  />
                </TextField>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría
                  </label>
                  <CategorySelect
                    categorias={categorias}
                    value={editCategoria}
                    onChange={handleEditCategoriaChange}
                    onDeleteCategory={setDeletingCat}
                  />
                </div>
              </div>
              <TextField
                isRequired
                name="edit_descripcion"
                onChange={setEditDescripcion}
                className="w-full"
              >
                <Label>Descripción</Label>
                <Input
                  placeholder="Descripción del gasto"
                  value={editDescripcion}
                  className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
                />
              </TextField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  isRequired
                  name="edit_monto"
                  type="number"
                  onChange={setEditMonto}
                  className="w-full"
                >
                  <Label>Monto</Label>
                  <Input
                    placeholder="850000"
                    value={editMonto}
                    className="h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60"
                  />
                </TextField>
                <ComprobanteUpload
                  selectedFile={editSelectedFile}
                  setSelectedFile={setEditSelectedFile}
                  existingUrl={editExistingUrl}
                  onDeleteExisting={() => setEditImageMarkedForDeletion(true)}
                  isMarkedForDeletion={editImageMarkedForDeletion}
                  onViewImage={setLightboxUrl}
                />
              </div>
              {editError && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title className="text-sm">{editError}</Alert.Title>
                  </Alert.Content>
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer className="sm:px-8 sm:pb-6 pt-4 border-t border-gray-100 dark:border-zinc-800/50 mt-4">
              <Button
                variant="secondary"
                slot="close"
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                isDisabled={editSubmitting}
                onPress={handleEditSubmit}
                className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer rounded-xl px-6 font-medium shadow-sm"
              >
                {editSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* ── Delete Gasto AlertDialog ── */}
      <AlertDialog.Backdrop
        isOpen={!!deleteGasto}
        onOpenChange={() => setDeleteGasto(null)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-apple-lg">
            <AlertDialog.CloseTrigger className="hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>¿Eliminar gasto?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estás por eliminar{" "}
                <strong>&ldquo;{deleteGasto?.descripcion}&rdquo;</strong> por{" "}
                <strong>
                  {deleteGasto ? formatCLP(deleteGasto.monto) : ""}
                </strong>
                . Esta acción no se puede deshacer.
              </p>
              {deleteError && (
                <Alert status="danger" className="mt-3">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title className="text-sm">{deleteError}</Alert.Title>
                  </Alert.Content>
                </Alert>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                variant="tertiary"
                slot="close"
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                isDisabled={deleting}
                onPress={handleDelete}
                className="cursor-pointer"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* ── Delete Category AlertDialog ── */}
      <AlertDialog.Backdrop
        isOpen={!!deletingCat}
        onOpenChange={() => setDeletingCat(null)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-apple-lg">
            <AlertDialog.CloseTrigger className="hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" />
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>¿Eliminar categoría?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vas a eliminar la categoría{" "}
                <strong>&ldquo;{deletingCat}&rdquo;</strong>.
                {(catCounts[deletingCat || ""] || 0) > 0 && (
                  <>
                    {" "}
                    Los <strong>{catCounts[deletingCat || ""]}</strong> gastos
                    que usan esta categoría pasarán a{" "}
                    <strong>&ldquo;N/A&rdquo;</strong>.
                  </>
                )}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                variant="tertiary"
                slot="close"
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                isDisabled={deletingCatLoading}
                onPress={handleDeleteCategory}
                className="bg-amber-500 text-white hover:bg-amber-600 cursor-pointer rounded-xl px-6"
              >
                {deletingCatLoading ? "Eliminando..." : "Eliminar categoría"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* ── Lightbox Modal ── */}
      <Modal.Backdrop
        isOpen={!!lightboxUrl}
        onOpenChange={() => setLightboxUrl(null)}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Comprobante</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex items-center justify-center p-6">
              {lightboxUrl && (
                <Image
                  src={lightboxUrl}
                  alt="Comprobante de gasto"
                  width={600}
                  height={800}
                  className="max-h-[70vh] w-auto rounded-xl object-contain"
                  unoptimized
                />
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
