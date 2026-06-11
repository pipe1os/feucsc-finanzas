"use client";

import { useState, useMemo, useRef } from "react";
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
import AdminModals, { type GastoDB } from "@/components/admin/AdminModals";
import { formatCLP } from "@/lib/utils";

const ROWS_PER_PAGE = 10;

export default function AdminPage() {
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
  const [editGasto, setEditGasto] = useState<GastoDB | null>(null);
  const [deleteGasto, setDeleteGasto] = useState<GastoDB | null>(null);
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

  const openEdit = (g: GastoDB) => {
    setEditGasto(g);
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
                  {filtered.length} de {gastos.length} gastos
                </p>
              </div>
              <AdminFilters
                selectedMonth={selectedMonth}
                setSelectedMonth={(val) => {
                  setSelectedMonth(val);
                  setPage(1);
                }}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
                onSearch={handleSearch}
                categoriasDB={categoriasDB}
                onClear={() => {
                  setSelectedMonth("all");
                  setSelectedCategory("all");
                  setPage(1);
                }}
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
        catCounts={catCounts}
        onGastoDeleted={() => {
          if (paginated.length === 1) {
            setPage((currentPage) => Math.max(1, currentPage - 1));
          }
        }}
      />
    </div>
  );
}
