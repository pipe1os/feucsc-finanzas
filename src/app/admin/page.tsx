"use client";

import { useReducer, useMemo, useRef } from "react";
import Link from "next/link";
import type { SortDescriptor } from "@heroui/react";
import { Card } from "@heroui/react";
import { useGastos } from "@/hooks/useGastos";
import { useCategorias } from "@/hooks/useCategorias";
import Footer from "@/components/public/Footer";
import GastoForm from "@/components/admin/GastoForm";
import AdminDesktopTable from "@/components/admin/AdminDesktopTable";
import AdminMobileList from "@/components/admin/AdminMobileList";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminModals from "@/components/admin/AdminModals";
import type { GastoDB } from "@/hooks/useGastos";

const ROWS_PER_PAGE = 10;

type AdminState = {
  page: number;
  searchQuery: string;
  selectedMonth: string;
  selectedCategory: string;
  sortDescriptor: SortDescriptor;
  deletingCat: string | null;
  editGasto: GastoDB | null;
  deleteGasto: GastoDB | null;
  lightboxUrl: string | null;
};

type AdminAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_MONTH"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SORT"; payload: SortDescriptor }
  | { type: "SET_DELETING_CAT"; payload: string | null }
  | { type: "SET_EDIT_GASTO"; payload: GastoDB | null }
  | { type: "SET_DELETE_GASTO"; payload: GastoDB | null }
  | { type: "SET_LIGHTBOX_URL"; payload: string | null }
  | { type: "CLEAR_FILTERS" };

const initialState: AdminState = {
  page: 1,
  searchQuery: "",
  selectedMonth: "all",
  selectedCategory: "all",
  sortDescriptor: { column: "fecha", direction: "descending" },
  deletingCat: null,
  editGasto: null,
  deleteGasto: null,
  lightboxUrl: null,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_PAGE": return { ...state, page: action.payload };
    case "SET_SEARCH": return { ...state, searchQuery: action.payload, page: 1 };
    case "SET_MONTH": return { ...state, selectedMonth: action.payload, page: 1 };
    case "SET_CATEGORY": return { ...state, selectedCategory: action.payload, page: 1 };
    case "SET_SORT": return { ...state, sortDescriptor: action.payload };
    case "SET_DELETING_CAT": return { ...state, deletingCat: action.payload };
    case "SET_EDIT_GASTO": return { ...state, editGasto: action.payload };
    case "SET_DELETE_GASTO": return { ...state, deleteGasto: action.payload };
    case "SET_LIGHTBOX_URL": return { ...state, lightboxUrl: action.payload };
    case "CLEAR_FILTERS": return { ...state, selectedMonth: "all", selectedCategory: "all", page: 1 };
    default: return state;
  }
}

export default function AdminPage() {
  const { categoriasDB, mutateCategorias } = useCategorias();

  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { page, searchQuery, selectedMonth, selectedCategory, sortDescriptor, deletingCat, editGasto, deleteGasto, lightboxUrl } = state;

  const setPage = (p: number | ((prev: number) => number)) => dispatch({ type: "SET_PAGE", payload: typeof p === "function" ? p(page) : p });
  const setSortDescriptor = (s: SortDescriptor | ((prev: SortDescriptor) => SortDescriptor)) => dispatch({ type: "SET_SORT", payload: typeof s === "function" ? s(sortDescriptor) : s });
  const setDeletingCat = (c: string | null) => dispatch({ type: "SET_DELETING_CAT", payload: c });
  const setEditGasto = (g: GastoDB | null) => dispatch({ type: "SET_EDIT_GASTO", payload: g });
  const setDeleteGasto = (g: GastoDB | null) => dispatch({ type: "SET_DELETE_GASTO", payload: g });
  const setLightboxUrl = (url: string | null) => dispatch({ type: "SET_LIGHTBOX_URL", payload: url });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { gastos: paginated, totalCount, isLoading: loadingTable, mutateGastos } = useGastos({
    page,
    pageSize: ROWS_PER_PAGE,
    searchQuery,
    selectedMonth,
    selectedCategory,
    sortDescriptor: { column: sortDescriptor.column as string, direction: sortDescriptor.direction }
  });

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

  const totalPages = Math.max(1, Math.ceil(totalCount / ROWS_PER_PAGE));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // paginated is directly returned from useGastos
  const pStart = totalCount === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const pEnd = Math.min(page * ROWS_PER_PAGE, totalCount);

  const handleSearch = (val: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({ type: "SET_SEARCH", payload: val });
    }, 250);
  };

  const openEdit = (g: GastoDB) => {
    dispatch({ type: "SET_EDIT_GASTO", payload: g });
  };

  return (
    <div className="min-h-dvh flex w-full bg-transparent">
      <AdminSidebar />
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
                  {totalCount} gastos encontrados
                </p>
              </div>
              <AdminFilters
                selectedMonth={selectedMonth}
                setSelectedMonth={(val) => dispatch({ type: "SET_MONTH", payload: val })}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => dispatch({ type: "SET_CATEGORY", payload: val })}
                onSearch={handleSearch}
                categoriasDB={categoriasDB}
                onClear={() => dispatch({ type: "CLEAR_FILTERS" })}
              />
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
                    filteredLength={totalCount}
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
                    filteredLength={totalCount}
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

      <AdminModals
        editGasto={editGasto}
        setEditGasto={setEditGasto}
        deleteGasto={deleteGasto}
        setDeleteGasto={setDeleteGasto}
        deletingCat={deletingCat}
        setDeletingCat={setDeletingCat}
        lightboxUrl={lightboxUrl}
        setLightboxUrl={setLightboxUrl}
        categorias={categorias}
        categoriasDB={categoriasDB}
        mutateGastos={mutateGastos}
        mutateCategorias={mutateCategorias}
        onGastoDeleted={() => {
          if (paginated.length === 1) {
            setPage((currentPage) => Math.max(1, currentPage - 1));
          }
        }}
      />
    </div>
  );
}
