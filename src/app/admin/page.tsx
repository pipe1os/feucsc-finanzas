"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { SortDescriptor } from "@heroui/react";
import {
  Card,
  Button,
  Alert,
  Modal,
  AlertDialog,
  Select,
  ListBox,
  toast,
} from "@heroui/react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";
import {
  deleteGasto as deleteGastoAction,
  deleteCategoria as deleteCategoriaAction,
} from "@/app/actions/gastos";
import { useGastos } from "@/hooks/useGastos";
import { useCategorias } from "@/hooks/useCategorias";
import ThemeToggle from "@/components/admin/ThemeToggle";
import Footer from "@/components/public/Footer";
import {
  HugeiconsMenuIcon,
  type HugeiconsMenuIconHandle,
} from "@/components/ui/hugeicons-menu";
import GastoForm from "@/components/admin/GastoForm";
import EditGastoForm from "@/components/admin/EditGastoForm";
import { LogOutIcon, SearchIcon, XIcon } from "@/components/admin/Icons";
import AdminDesktopTable from "@/components/admin/AdminDesktopTable";
import AdminMobileList from "@/components/admin/AdminMobileList";

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



export default function AdminPage() {
  const { replace } = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuIconRef = useRef<HugeiconsMenuIconHandle>(null);

  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
    if (open) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  };
  const closeSidebar = () => toggleSidebar(false);

  const { gastos, isLoading: loadingTable, mutateGastos } = useGastos();
  const { categoriasDB, mutateCategorias } = useCategorias();

  // react-doctor-disable-next-line react-doctor/prefer-useReducer
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [deletingCatLoading, setDeletingCatLoading] = useState(false);

  const [editGasto, setEditGasto] = useState<GastoDB | null>(null);

  const [deleteGasto, setDeleteGasto] = useState<GastoDB | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const names = categoriasDB.map((c) => c.nombre);
    return names.sort((a, b) => {
      if (a === "Varios") return 1;
      if (b === "Varios") return -1;
      return a.localeCompare(b);
    });
  }, [categoriasDB]);

  const catColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categoriasDB) {
      if (c.color) map[c.nombre] = c.color;
    }
    return map;
  }, [categoriasDB]);

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

  const filtered = useMemo(() => {
    let result = [...gastos];

    if (selectedMonth !== "all") {
      result = result.filter((g) => {
        const month = g.fecha.substring(5, 7);
        return month === selectedMonth;
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((g) => g.categoria === selectedCategory);
    }

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    replace("/login");
  };

  const openEdit = (g: GastoDB) => {
    setEditGasto(g);
  };

  const handleDelete = async () => {
    if (!deleteGasto) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteGastoAction(deleteGasto.id);

      toast.success("Gasto eliminado exitosamente");
      setDeleteGasto(null);
      mutateGastos();
      if (paginated.length === 1) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const safeMsg =
        msg === "No autorizado" || msg.includes("inválid")
          ? msg
          : "Ocurrió un error al eliminar el gasto";
      setDeleteError(safeMsg);
      toast.danger("Error al eliminar gasto");
    } finally {
      setDeleting(false);
    }
  };

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gastos.forEach((g) => {
      counts[g.categoria] = (counts[g.categoria] || 0) + 1;
    });
    return counts;
  }, [gastos]);

  return (
    <div className="min-h-dvh flex bg-transparent">
      <button type="button"
        onClick={() => toggleSidebar(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center
                   size-10 rounded-xl bg-white dark:bg-zinc-800 shadow-apple-lg lg:hidden
                   transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <HugeiconsMenuIcon ref={menuIconRef} size={22} />
      </button>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden cursor-default"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh w-65
          flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
          border-r border-zinc-100 dark:border-zinc-800
          transition-transform duration-300 ease-out
          overflow-y-auto
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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
        <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
        <nav className="flex flex-col gap-1 px-4 pt-6">
          <span className="px-3 pb-2 pt-1 text-[10px] font-medium tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            Administración
          </span>
          <Link
            href="/admin"
            onClick={closeSidebar}
            className={`group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-200 cursor-pointer
              ${
                pathname === "/admin"
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
          >
            {pathname === "/admin" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-red-500/70 dark:bg-red-400/70" />
            )}
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center size-8 rounded-lg transition-all duration-200
                  ${
                    pathname === "/admin"
                      ? "text-red-500 dark:text-red-400"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`}
              >
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
          </Link>
        </nav>
        <div className="flex-1" />
        <div className="px-5 pb-6 pt-4">
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />
          <Button
            variant="ghost"
            onPress={handleSignOut}
            className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer font-medium rounded-xl mb-4"
          >
            <LogOutIcon />
            Cerrar sesión
          </Button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 min-w-0 lg:ml-65">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white font-heading">
              Gestión de Gastos
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ingresa, edita o elimina gastos de la base de datos.
            </p>
          </div>
          <Card className="overflow-visible rounded-2xl shadow-apple border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 sm:p-8 mb-8 animate-fade-in-up stagger-1 opacity-0">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 font-heading">
              Ingresar Gasto
            </h2>
            <GastoForm
              categorias={categorias}
              categoriasDB={categoriasDB}
              mutateGastos={mutateGastos}
              mutateCategorias={mutateCategorias}
              onDeleteCategory={setDeletingCat}
            />
          </Card>
          <Card className="rounded-2xl shadow-apple border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 animate-fade-in-up stagger-2 opacity-0">
            <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white font-heading">
                  Gastos Registrados
                </h2>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {filtered.length} de {gastos.length} gastos
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
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
                    <Select.Trigger className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-zinc-300">
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
                    <Select.Popover className="rounded-xl shadow-apple-lg border border-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 min-w-48">
                      <ListBox>
                        {MONTH_OPTIONS.map((m) => (
                          <ListBox.Item
                            key={m.id}
                            id={m.id}
                            textValue={m.label}
                          >
                            {m.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
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
                    <Select.Trigger className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-zinc-300">
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
                    <Select.Popover className="rounded-xl shadow-apple-lg border border-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 min-w-56">
                      <ListBox>
                        <ListBox.Item id="all" textValue="Todas las categorías">
                          Todas las categorías
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        {categoriasDB.map((cat) => (
                          <ListBox.Item
                            key={cat.nombre}
                            id={cat.nombre}
                            textValue={cat.nombre}
                          >
                            {cat.nombre}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <div className="relative w-full sm:w-48">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 dark:text-zinc-500">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar..."
                      aria-label="Buscar gastos"
                      defaultValue=""
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
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
                  <div className="size-8 animate-spin rounded-full border-3 border-zinc-200 dark:border-zinc-800 border-t-red-500" />
                </div>
              ) : (
                <>
                  <AdminMobileList
                    paginated={paginated}
                    filteredLength={filtered.length}
                    catColors={catColors}
                    searchQuery={searchQuery}
                    pStart={pStart}
                    pEnd={pEnd}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    setLightboxUrl={setLightboxUrl}
                    openEdit={openEdit}
                    setDeleteGasto={setDeleteGasto}
                  />
                  <AdminDesktopTable
                    paginated={paginated}
                    filteredLength={filtered.length}
                    catColors={catColors}
                    searchQuery={searchQuery}
                    pStart={pStart}
                    pEnd={pEnd}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    pages={pages}
                    sortDescriptor={sortDescriptor}
                    setSortDescriptor={setSortDescriptor}
                    setLightboxUrl={setLightboxUrl}
                    openEdit={openEdit}
                    setDeleteGasto={setDeleteGasto}
                  />
                </>
              )}
            </div>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors duration-200"
            >
              ← Ver portal público
            </Link>
          </div>

          <Footer />
        </div>
      </main>
      <Modal.Backdrop
        isOpen={!!editGasto}
        onOpenChange={() => setEditGasto(null)}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-apple-lg">
            <Modal.CloseTrigger className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" />
            <Modal.Header className="sm:px-8 sm:pt-6 border-b border-zinc-100 dark:border-zinc-800/50 pb-4 mb-4">
              <Modal.Heading className="text-xl font-semibold font-heading">
                Editar Gasto
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="sm:px-8 sm:pb-6">
              {editGasto && (
                <EditGastoForm
                  key={editGasto.id}
                  gasto={editGasto}
                  categorias={categorias}
                  categoriasDB={categoriasDB}
                  mutateCategorias={mutateCategorias}
                  onSuccess={() => {
                    setEditGasto(null);
                    mutateGastos();
                    toast.success("Gasto actualizado exitosamente");
                  }}
                  onCancel={() => setEditGasto(null)}
                  onDeleteCategory={setDeletingCat}
                  onViewImage={setLightboxUrl}
                />
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      <AlertDialog.Backdrop
        isOpen={!!deleteGasto}
        onOpenChange={() => setDeleteGasto(null)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-apple-lg">
            <AlertDialog.CloseTrigger className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>¿Eliminar gasto?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
                className="cursor-pointer text-zinc-700 dark:text-zinc-200"
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
      <AlertDialog.Backdrop
        isOpen={!!deletingCat}
        onOpenChange={() => setDeletingCat(null)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-apple-lg">
            <AlertDialog.CloseTrigger className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" />
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>¿Eliminar categoría?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
                className="cursor-pointer text-zinc-700 dark:text-zinc-200"
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
