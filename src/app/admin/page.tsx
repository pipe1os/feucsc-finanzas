"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
} from "@heroui/react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

/* ── Icons ──────────────────────────────────────── */
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
  creado_el: string;
}

/* ── Category styles ──────────────────────────── */
const knownCatStyles: Record<string, { bg: string; text: string }> = {
  Asambleas: { bg: "bg-red-50", text: "text-red-600" },
  Eventos: { bg: "bg-amber-50", text: "text-amber-700" },
  Materiales: { bg: "bg-violet-50", text: "text-violet-600" },
  Servicios: { bg: "bg-cyan-50", text: "text-cyan-700" },
  Transporte: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Otros: { bg: "bg-gray-100", text: "text-gray-600" },
  "N/A": { bg: "bg-gray-50", text: "text-gray-400" },
};
const defaultCatStyle = { bg: "bg-blue-50", text: "text-blue-600" };
function getCatStyle(cat: string) {
  return knownCatStyles[cat] || defaultCatStyle;
}

const ROWS_PER_PAGE = 10;

function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL");
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
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5
                   text-sm text-gray-900 transition-all duration-200 cursor-pointer
                   hover:border-gray-300 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 outline-hidden"
      >
        <span>{value}</span>
        <span
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-lg py-1 animate-fade-in-up"
          style={{ animationDuration: "150ms" }}
        >
          {categorias.map((cat) => {
            const isSelected = cat === value;
            const isOtros = cat === "Otros";
            return (
              <div
                key={cat}
                className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                ${isSelected ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
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

          {/* Divider + Nueva categoría */}
          <div className="border-t border-gray-100 mt-1 pt-1">
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
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden focus:border-red-300 focus:ring-1 focus:ring-red-100"
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
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-2 py-1.5 text-gray-400 text-xs hover:bg-gray-100 transition-colors cursor-pointer"
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
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Otros");
  const [monto, setMonto] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Table ──
  const [gastos, setGastos] = useState<GastoDB[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [editComprobanteUrl, setEditComprobanteUrl] = useState("");
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

  // ── Create category in DB if new ──
  const handleCategoriaChange = async (cat: string) => {
    setCategoria(cat);
    // If this category doesn't exist in DB yet, insert it
    if (!categorias.includes(cat)) {
      await supabase.from("categorias").insert({ nombre: cat });
      fetchCategorias();
    }
  };
  const handleEditCategoriaChange = async (cat: string) => {
    setEditCategoria(cat);
    if (!categorias.includes(cat)) {
      await supabase.from("categorias").insert({ nombre: cat });
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
  }, [gastos, searchQuery, sortDescriptor]);

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
    const { error } = await supabase.from("gastos").insert({
      fecha,
      descripcion: descripcion.trim(),
      categoria,
      monto: montoNum,
      comprobante_url: comprobanteUrl.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setFormError(`Error: ${error.message}`);
      return;
    }
    setSuccess(true);
    setFecha("");
    setDescripcion("");
    setCategoria("Otros");
    setMonto("");
    setComprobanteUrl("");
    setTimeout(() => setSuccess(false), 4000);
    fetchGastos();
  };

  const openEdit = (g: GastoDB) => {
    setEditGasto(g);
    setEditFecha(g.fecha);
    setEditDescripcion(g.descripcion);
    setEditCategoria(g.categoria);
    setEditMonto(String(g.monto));
    setEditComprobanteUrl(g.comprobante_url || "");
    setEditError(null);
  };
  const handleEditSubmit = async () => {
    if (!editGasto) return;
    setEditSubmitting(true);
    setEditError(null);
    const { error } = await supabase
      .from("gastos")
      .update({
        fecha: editFecha,
        descripcion: editDescripcion.trim(),
        categoria: editCategoria,
        monto: parseInt(editMonto, 10),
        comprobante_url: editComprobanteUrl.trim() || null,
      })
      .eq("id", editGasto.id);
    setEditSubmitting(false);
    if (error) {
      setEditError(`Error: ${error.message}`);
      return;
    }
    setEditGasto(null);
    fetchGastos();
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
      return;
    }
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
    <div className="min-h-dvh bg-gray-50">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 glass-surface border-b border-gray-100">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/feucsclogo.webp"
              alt="FEUCSC"
              width={100}
              height={50}
            />
            <div className="h-6 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-700">
              Panel Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleSignOut}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          >
            <LogOutIcon />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Heading */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 rounded-full bg-red-500" />
            <span className="text-xs font-semibold tracking-widest text-red-500 uppercase">
              Administración
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestión de Gastos
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Ingresa, edita o elimina gastos del portal de transparencia.
          </p>
        </div>

        {/* ── Form card ── */}
        <Card className="rounded-2xl shadow-apple border border-gray-100 bg-white p-6 sm:p-8 mb-8 animate-fade-in-up stagger-1 opacity-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
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
                <Input value={fecha} />
              </TextField>
              <div className="space-y-1.5">
                <label className="label text-sm font-medium text-gray-700">
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
                <Label>Monto (CLP)</Label>
                <Input placeholder="850000" value={monto} />
              </TextField>
              <TextField
                name="comprobante"
                type="url"
                onChange={setComprobanteUrl}
                className="w-full"
              >
                <Label>URL del comprobante (opcional)</Label>
                <Input placeholder="https://..." value={comprobanteUrl} />
              </TextField>
            </div>
            {formError && (
              <Alert status="danger" className="animate-fade-in-up">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title className="text-sm">{formError}</Alert.Title>
                </Alert.Content>
              </Alert>
            )}
            {success && (
              <Alert status="success" className="animate-fade-in-up">
                <Alert.Indicator>
                  <CheckIcon />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title className="text-sm font-medium">
                    Gasto registrado exitosamente
                  </Alert.Title>
                </Alert.Content>
              </Alert>
            )}
            <Button
              type="submit"
              size="lg"
              isDisabled={submitting}
              className="w-full rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-200 h-12 shadow-sm hover:shadow-md cursor-pointer text-sm"
            >
              {submitting ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <PlusIcon />
              )}
              {submitting ? "Guardando..." : "Registrar gasto"}
            </Button>
          </form>
        </Card>

        {/* ── Gastos table ── */}
        <Card className="rounded-2xl shadow-apple border border-gray-100 bg-white animate-fade-in-up stagger-2 opacity-0">
          <div className="p-6 pb-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gastos Registrados
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {filtered.length} de {gastos.length} gastos
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Buscar gastos..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>
          <div className="p-6 pt-4">
            {loadingTable ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 animate-spin rounded-full border-3 border-gray-200 border-t-red-500" />
              </div>
            ) : (
              <Table variant="secondary">
                <Table.ScrollContainer>
                  <Table.Content
                    aria-label="Tabla de gastos admin"
                    className="min-w-200"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                  >
                    <Table.Header>
                      <Table.Column
                        allowsSorting
                        isRowHeader
                        id="fecha"
                        className="w-27.5"
                      >
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
                          <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                            {searchQuery ? <SearchIcon /> : <InboxIcon />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {searchQuery ? "Sin resultados" : "Sin gastos"}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {searchQuery
                                ? "Intenta con otro término."
                                : "Ingresa un gasto usando el formulario."}
                            </span>
                          </div>
                        </EmptyState>
                      )}
                    >
                      {paginated.map((g) => {
                        const catStyle = getCatStyle(g.categoria);
                        return (
                          <Table.Row key={g.id}>
                            <Table.Cell>
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(g.fecha)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm font-medium text-gray-900">
                                {g.descripcion}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${catStyle.bg} ${catStyle.text}`}
                              >
                                {g.categoria}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm font-semibold text-gray-900 tabular-nums">
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
                                      className={`inline-flex items-center justify-center size-8 rounded-full transition-all duration-200 cursor-pointer ${g.comprobante_url ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-50 text-gray-300 cursor-not-allowed"}`}
                                      aria-label="Ver comprobante"
                                    >
                                      <EyeIcon />
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg">
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
                                      className="inline-flex items-center justify-center size-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                                      aria-label="Editar"
                                    >
                                      <EditIcon />
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg">
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
            )}
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            ← Ver portal público
          </Link>
        </div>
      </main>

      {/* ── Edit Modal ── */}
      <Modal.Backdrop
        isOpen={!!editGasto}
        onOpenChange={() => setEditGasto(null)}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Editar Gasto</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-hidden transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  placeholder="Descripción del gasto"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Monto (CLP)
                  </label>
                  <input
                    type="number"
                    value={editMonto}
                    onChange={(e) => setEditMonto(e.target.value)}
                    placeholder="850000"
                    min="1"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    URL comprobante
                  </label>
                  <input
                    type="url"
                    value={editComprobanteUrl}
                    onChange={(e) => setEditComprobanteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                </div>
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
            <Modal.Footer>
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
                className="bg-red-500 text-white hover:bg-red-600 cursor-pointer rounded-xl px-6"
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
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>¿Eliminar gasto?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-gray-600">
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
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>¿Eliminar categoría?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-gray-600">
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
