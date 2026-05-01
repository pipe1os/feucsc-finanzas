"use client";

import { useState, useMemo, useRef } from "react";
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
import { getNextPaletteColor, VARIOS_COLOR } from "@/lib/category-palette";
import { parseISODate } from "@/lib/utils";
import { deleteCloudinaryImage } from "@/app/actions/cloudinary";
import { uploadComprobanteAction } from "@/app/actions/upload";
import { createGasto, updateGasto, deleteGasto as deleteGastoAction, createCategoria, deleteCategoria as deleteCategoriaAction } from "@/app/actions/gastos";
import { useGastos } from "@/hooks/useGastos";
import { useCategorias } from "@/hooks/useCategorias";
import ThemeToggle from "@/components/admin/ThemeToggle";
import ComprobanteUpload from "@/components/admin/ComprobanteUpload";
import CategorySelect from "@/components/admin/CategorySelect";
import SortableColumnHeader from "@/components/admin/SortableColumnHeader";
import {
  LogOutIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  SearchIcon,
  InboxIcon,
  XIcon,
} from "@/components/admin/Icons";
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



function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

function formatShortDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
function formatDate(d: string) {
  const date = parseISODate(d);
  if (!date) return "—";
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


/* ══════════════════════════════════════════════════
   Admin Page
   ══════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();

  // ── Form ──
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Varios");
  const [monto, setMonto] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Table ── (SWR-powered)
  const { gastos, isLoading: loadingTable, mutateGastos } = useGastos();
  const { categoriasDB, mutateCategorias } = useCategorias();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Categories from DB ──
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [deletingCatLoading, setDeletingCatLoading] = useState(false);

  // ── Edit ──
  const [editGasto, setEditGasto] = useState<GastoDB | null>(null);
  const [editFecha, setEditFecha] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCategoria, setEditCategoria] = useState("Varios");
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

  // ── Category names sorted (Varios always last) ──
  const categorias = useMemo(() => {
    const names = categoriasDB.map((c) => c.nombre);
    return names.sort((a, b) => {
      if (a === "Varios") return 1;
      if (b === "Varios") return -1;
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
  };
  const handleEditCategoriaChange = async (cat: string) => {
    setEditCategoria(cat);
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
  };

  // ── Delete category ──
  const handleDeleteCategory = async () => {
    if (!deletingCat) return;
    setDeletingCatLoading(true);
    try {
      await deleteCategoriaAction(deletingCat);
      setDeletingCat(null);
      mutateCategorias();
      mutateGastos();
    } catch {
      toast.danger("Error al eliminar categoría");
    } finally {
      setDeletingCatLoading(false);
    }
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
      const uploadForm = new FormData();
      uploadForm.append("file", selectedFile);
      comprobanteUrl = await uploadComprobanteAction(uploadForm);
      if (!comprobanteUrl) {
        setSubmitting(false);
        setFormError("Error al subir el comprobante");
        toast.danger("Error al subir el comprobante");
        return;
      }
    }

    try {
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
      const msg = err instanceof Error ? err.message : "";
      // Only expose known safe messages; hide internal details
      const safeMsg = msg === "No autorizado" || msg.includes("inválid")
        ? msg
        : "Ocurrió un error al registrar el gasto";
      setFormError(safeMsg);
      toast.danger("Error al registrar gasto");
    } finally {
      setSubmitting(false);
    }
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
      const uploadForm = new FormData();
      uploadForm.append("file", editSelectedFile);
      const uploadedUrl = await uploadComprobanteAction(uploadForm);
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

    try {
      const form = new FormData();
      form.append("id", editGasto.id);
      form.append("fecha", editFecha);
      form.append("descripcion", editDescripcion.trim());
      form.append("categoria", editCategoria);
      form.append("monto", editMonto);
      form.append("comprobante_url", finalUrl || "");
      await updateGasto(form);

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
      setTimeout(() => {
        setEditGasto(null);
        mutateGastos();
        toast.success("Gasto actualizado exitosamente");
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const safeMsg = msg === "No autorizado" || msg.includes("inválid")
        ? msg
        : "Ocurrió un error al actualizar el gasto";
      setEditError(safeMsg);
      toast.danger("Error al actualizar gasto");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteGasto) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteGastoAction(deleteGasto.id);

      if (deleteGasto.comprobante_url) {
        await deleteCloudinaryImage(deleteGasto.comprobante_url);
      }

      toast.success("Gasto eliminado exitosamente");
      setDeleteGasto(null);
      mutateGastos();
      if (paginated.length === 1 && page > 1) setPage(page - 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const safeMsg = msg === "No autorizado" || msg.includes("inválid")
        ? msg
        : "Ocurrió un error al eliminar el gasto";
      setDeleteError(safeMsg);
      toast.danger("Error al eliminar gasto");
    } finally {
      setDeleting(false);
    }
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
    <div className="min-h-dvh flex bg-bg-secondary">
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
                    className="w-full h-9 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
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
                          const catColor = catColors[g.categoria] || VARIOS_COLOR;
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
                            catColors[g.categoria] || VARIOS_COLOR;
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
