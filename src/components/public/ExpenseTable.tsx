"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useTransition,
  useCallback,
} from "react";
import {
  Table,
  Modal,
  Button,
  Pagination,
  Tooltip,
  SortDescriptor,
  EmptyState,
  Select,
  ListBox,
} from "@heroui/react";
import { formatDate, formatCLP } from "@/lib/utils";
import Image from "next/image";
import { SkeletonTable } from "./Skeletons";

interface TransaccionItem {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  color?: string;
  monto: number;
  comprobante: string;
  creado_el?: string;
}

interface ExpenseTableProps {
  transacciones: TransaccionItem[];
  chartCategoryFilter?: string | null;
  onClearChartFilter?: () => void;
  isLoading?: boolean;
}

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

const EyeOffIcon = () => (
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
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
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

function isNew(creado_el?: string): boolean {
  if (!creado_el) return false;
  const created = new Date(creado_el).getTime();
  return Date.now() - created < 48 * 60 * 60 * 1000;
}

function ExpenseTable({
  transacciones,
  chartCategoryFilter,
  onClearChartFilter,
  isLoading,
}: ExpenseTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("mes") || "all";
    }
    return "all";
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        new URLSearchParams(window.location.search).get("categoria") || "all"
      );
    }
    return "all";
  });

  // Sync state changes to URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;

      if (selectedCategory === "all") {
        if (url.searchParams.has("categoria")) {
          url.searchParams.delete("categoria");
          changed = true;
        }
      } else {
        if (url.searchParams.get("categoria") !== selectedCategory) {
          url.searchParams.set("categoria", selectedCategory);
          changed = true;
        }
      }

      if (selectedMonth === "all") {
        if (url.searchParams.has("mes")) {
          url.searchParams.delete("mes");
          changed = true;
        }
      } else {
        if (url.searchParams.get("mes") !== selectedMonth) {
          url.searchParams.set("mes", selectedMonth);
          changed = true;
        }
      }

      if (changed) {
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [selectedCategory, selectedMonth]);

  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    concepto: string;
  } | null>(null);

  // Extract unique categories from data
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    transacciones.forEach((t) => cats.add(t.categoria));
    return Array.from(cats).sort();
  }, [transacciones]);

  // Sync chart filter to the local category select
  useEffect(() => {
    if (chartCategoryFilter) {
      const timer = setTimeout(() => {
        setSelectedCategory(chartCategoryFilter);
        setPage(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [chartCategoryFilter]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        startTransition(() => {
          setSearchQuery(value);
          setPage(1);
        });
      }, 150);
    },
    [],
  );

  const handleClearAllFilters = useCallback(() => {
    startTransition(() => {
      setSelectedMonth("all");
      setSelectedCategory("all");
      setSearchQuery("");
      setPage(1);
    });
    onClearChartFilter?.();
  }, [onClearChartFilter]);

  const filtered = useMemo(() => {
    let result = transacciones;

    // Month filter
    if (selectedMonth !== "all") {
      result = result.filter((t) => {
        if (!t.fecha) return false;
        const month = t.fecha.substring(5, 7); // "YYYY-MM-DD" → "MM"
        return month === selectedMonth;
      });
    }

    // Category filter (local select OR chart click)
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.categoria === selectedCategory);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.concepto.toLowerCase().includes(q) ||
          t.categoria.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [searchQuery, selectedMonth, selectedCategory, transacciones]);

  const sortedItems = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const col = sortDescriptor.column as keyof typeof a;
      const first = a[col];
      const second = b[col];

      let cmp = 0;
      if (col === "monto") {
        cmp = (first as number) - (second as number);
      } else {
        cmp = String(first).localeCompare(String(second));
      }

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }
      return cmp;
    });
  }, [filtered, sortDescriptor]);

  const totalPages = Math.ceil(sortedItems.length / ROWS_PER_PAGE);

  // Build pagination pages with ellipsis
  const visiblePages = useMemo((): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "ellipsis",
        page - 1,
        page,
        page + 1,
        "ellipsis",
        totalPages,
      );
    }
    return pages;
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedItems.slice(start, start + ROWS_PER_PAGE);
  }, [page, sortedItems]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedItems.length);

  const hasActiveFilters =
    selectedMonth !== "all" || selectedCategory !== "all";

  if (isLoading) {
    return <SkeletonTable rows={5} />;
  }

  return (
    <>
      <div
        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-gray-900 shadow-xs dark:shadow-none overflow-hidden animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Header row: title */}
        <div className="p-6 pb-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Gastos Recientes
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "registro" : "registros"}{" "}
            encontrados
          </p>
        </div>

        {/* Filter row: search + month + category selects */}
        <div className="flex flex-wrap items-center gap-3 px-6 pt-3">
          {/* Search input */}
          <div className="relative w-full sm:w-56">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Buscar gasto..."
              defaultValue=""
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-9 pr-4
                         text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                         outline-hidden transition-all duration-200
                         focus:border-red-300 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/20 h-9"
              id="search-transactions"
            />
          </div>
          {/* Month filter */}
          <Select
            className="w-44"
            placeholder="Mes"
            aria-label="Filtrar por mes"
            selectedKey={selectedMonth}
            onSelectionChange={(key) => {
              if (key !== null) {
                startTransition(() => {
                  setSelectedMonth(key as string);
                  setPage(1);
                });
              }
            }}
          >
            <Select.Trigger className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
              <Select.Value>
                {({ isPlaceholder, state }) => {
                  if (isPlaceholder) return "Mes: Todos";
                  const key = state.selectedItems?.[0]?.key;
                  if (key === "all") return "Mes: Todos";
                  const found = MONTH_OPTIONS.find((m) => m.id === key);
                  return `Mes: ${found?.label ?? "Todos"}`;
                }}
              </Select.Value>
              <Select.Indicator className="text-gray-400 dark:text-gray-500" />
            </Select.Trigger>
            <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-gray-800 dark:bg-gray-900 min-w-48">
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

          {/* Category filter */}
          <Select
            className="w-56"
            placeholder="Categoría"
            aria-label="Filtrar por categoría"
            selectedKey={selectedCategory}
            onSelectionChange={(key) => {
              if (key !== null) {
                startTransition(() => {
                  setSelectedCategory(key as string);
                  setPage(1);
                });
                if (chartCategoryFilter && key !== chartCategoryFilter) {
                  onClearChartFilter?.();
                }
              }
            }}
          >
            <Select.Trigger className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
              <Select.Value>
                {({ isPlaceholder, state }) => {
                  if (isPlaceholder) return "Categoría: Todas";
                  const key = state.selectedItems?.[0]?.key;
                  if (key === "all") return "Categoría: Todas";
                  return `Categoría: ${String(key ?? "Todas")}`;
                }}
              </Select.Value>
              <Select.Indicator className="text-gray-400 dark:text-gray-500" />
            </Select.Trigger>
            <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-gray-800 dark:bg-gray-900 min-w-56">
              <ListBox>
                <ListBox.Item id="all" textValue="Todas las categorías">
                  Todas las categorías
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                {uniqueCategories.map((cat) => (
                  <ListBox.Item key={cat} id={cat} textValue={cat}>
                    {cat}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {/* Active filter indicator + clear */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 cursor-pointer"
            >
              <XIcon />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="p-6 pt-4">
          {/* Mobile ListBox view - hidden on desktop */}
          <div className="md:hidden">
            <ListBox
              aria-label="Gastos recientes"
              items={paginated}
              renderEmptyState={() => (
                <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 shadow-xs">
                    <SearchIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Sin resultados
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {hasActiveFilters
                        ? "No hay transacciones con los filtros seleccionados."
                        : "La búsqueda no arrojó coincidencias."}
                    </span>
                  </div>
                </EmptyState>
              )}
            >
              {(txn: TransaccionItem) => {
                const catColor = txn.color || "#9CA3AF";
                return (
                  <ListBox.Item
                    key={txn.id}
                    id={txn.id}
                    textValue={txn.concepto}
                    className="rounded-none px-0 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {txn.concepto}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums shrink-0">
                          {formatCLP(txn.monto)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${catColor}18`,
                            color: catColor,
                          }}
                        >
                          {txn.categoria}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(txn.fecha)}
                        </span>
                        {isNew(txn.creado_el) && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                            Nuevo
                          </span>
                        )}
                        {txn.comprobante ? (
                          <button
                            onClick={() =>
                              setLightboxImage({
                                src: txn.comprobante,
                                concepto: txn.concepto,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                            aria-label={`Ver comprobante de ${txn.concepto}`}
                          >
                            <span className="size-3.5">
                              <EyeIcon />
                            </span>
                            Ver comprobante
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <span className="size-3.5">
                              <EyeOffIcon />
                            </span>
                            Sin comprobante
                          </span>
                        )}
                      </div>
                    </div>
                  </ListBox.Item>
                );
              }}
            </ListBox>
            {/* Mobile pagination */}
            {totalPages > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-xs text-gray-500 text-center">
                  {start} a {end} de {filtered.length} resultados
                </span>
                <Pagination size="sm">
                  <Pagination.Content className="justify-center">
                    <Pagination.Item>
                      <Pagination.Previous
                        isDisabled={page === 1}
                        onPress={() =>
                          startTransition(() =>
                            setPage((p) => Math.max(1, p - 1)),
                          )
                        }
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
                          startTransition(() =>
                            setPage((p) => Math.min(totalPages, p + 1)),
                          )
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

          {/* Desktop Table - hidden on mobile */}
          <div className="hidden md:block">
            <Table variant="secondary">
              <Table.ScrollContainer>
                <Table.Content
                  aria-label="Tabla de transacciones recientes"
                  className="min-w-165"
                  sortDescriptor={sortDescriptor}
                  onSortChange={setSortDescriptor}
                >
                <Table.Header>
                  <Table.Column
                    allowsSorting
                    isRowHeader
                    id="fecha"
                    className="w-30"
                  >
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        Fecha
                      </SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column id="concepto" className="min-w-60">
                    Descripción
                  </Table.Column>
                  <Table.Column allowsSorting id="categoria" className="w-30">
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        Categoría
                      </SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column allowsSorting id="monto" className="w-32.5">
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        Monto
                      </SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column id="boleta" className="w-25 text-center">
                    Boleta
                  </Table.Column>
                </Table.Header>
                  <Table.Body
                    items={paginated}
                    renderEmptyState={() => (
                      <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 shadow-xs">
                          <SearchIcon />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Sin resultados
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {hasActiveFilters
                              ? "No hay transacciones con los filtros seleccionados."
                              : "La búsqueda no arrojó coincidencias."}
                          </span>
                        </div>
                      </EmptyState>
                    )}
                  >
                    {(txn: TransaccionItem) => {
                      const catColor = txn.color || "#9CA3AF";
                      return (
                        <Table.Row key={txn.id}>
                          <Table.Cell>
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {formatDate(txn.fecha)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {txn.concepto}
                              </span>
                              {isNew(txn.creado_el) && (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                                  Nuevo
                                </span>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: `${catColor}18`,
                                color: catColor,
                              }}
                            >
                              {txn.categoria}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                              {formatCLP(txn.monto)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex justify-center">
                              {txn.comprobante ? (
                                <Tooltip delay={0}>
                                  <Tooltip.Trigger>
                                    <button
                                      onClick={() =>
                                        setLightboxImage({
                                          src: txn.comprobante,
                                          concepto: txn.concepto,
                                        })
                                      }
                                      className="inline-flex items-center justify-center size-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 hover:scale-105 active:scale-95"
                                      aria-label={`Ver comprobante de ${txn.concepto}`}
                                    >
                                      <EyeIcon />
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                                    <p>Ver comprobante</p>
                                  </Tooltip.Content>
                                </Tooltip>
                              ) : (
                                <Tooltip delay={0}>
                                  <Tooltip.Trigger>
                                    <span className="inline-flex items-center justify-center size-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-100 dark:border-gray-700">
                                      <EyeOffIcon />
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                                    <p>Comprobante pendiente</p>
                                  </Tooltip.Content>
                                </Tooltip>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    }}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
              {totalPages > 0 && (
                <Table.Footer>
                  <Pagination size="sm">
                    <Pagination.Summary>
                      {start} a {end} de {filtered.length} resultados
                    </Pagination.Summary>
                    <Pagination.Content>
                      <Pagination.Item>
                        <Pagination.Previous
                          isDisabled={page === 1}
                          onPress={() =>
                            startTransition(() =>
                              setPage((p) => Math.max(1, p - 1)),
                            )
                          }
                        >
                          <Pagination.PreviousIcon />
                          Ant.
                        </Pagination.Previous>
                      </Pagination.Item>
                      {visiblePages.map((p, idx) =>
                        p === "ellipsis" ? (
                          <Pagination.Item key={`ellipsis-${idx}`}>
                            <span className="px-2 text-gray-400 text-sm select-none">
                              …
                            </span>
                          </Pagination.Item>
                        ) : (
                          <Pagination.Item key={p}>
                            <Pagination.Link
                              isActive={p === page}
                              onPress={() => startTransition(() => setPage(p))}
                            >
                              {p}
                            </Pagination.Link>
                          </Pagination.Item>
                        ),
                      )}
                      <Pagination.Item>
                        <Pagination.Next
                          isDisabled={page === totalPages}
                          onPress={() =>
                            startTransition(() =>
                              setPage((p) => Math.min(totalPages, p + 1)),
                            )
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
      </div>

      <Modal.Backdrop
        isOpen={!!lightboxImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) setLightboxImage(null);
        }}
      >
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="sm:max-w-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-apple-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-semibold text-gray-900 dark:text-white">
                {lightboxImage?.concepto ?? "Comprobante"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-4">
              {lightboxImage && (
                <div className="flex justify-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <Image
                    src={lightboxImage.src}
                    alt={`Comprobante: ${lightboxImage.concepto}`}
                    width={500}
                    height={700}
                    className="max-h-[70vh] w-auto rounded-lg object-contain"
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary" className="rounded-xl">
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}

export default React.memo(ExpenseTable);
