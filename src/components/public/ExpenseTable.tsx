"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useTransition,
  useCallback,
} from "react";
import { Modal, Button, SortDescriptor } from "@heroui/react";
import Image from "next/image";
import { SkeletonTable } from "./Skeletons";
import { ExpenseTableFilters } from "./ExpenseTableFilters";
import { ExpenseTableMobile } from "./ExpenseTableMobile";
import { ExpenseTableDesktop } from "./ExpenseTableDesktop";

export interface TransaccionItem {
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

const ROWS_PER_PAGE = 10;

function ExpenseTable({
  transacciones,
  chartCategoryFilter,
  onClearChartFilter,
  isLoading,
}: ExpenseTableProps) {
  // react-doctor-disable-next-line react-doctor/prefer-useReducer
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    transacciones.forEach((t) => cats.add(t.categoria));
    return Array.from(cats).sort();
  }, [transacciones]);

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

    if (selectedMonth !== "all") {
      result = result.filter((t) => {
        if (!t.fecha) return false;
        const month = t.fecha.substring(5, 7);
        return month === selectedMonth;
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((t) => t.categoria === selectedCategory);
    }

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
    return filtered.toSorted((a, b) => {
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

  const handlePageChange = useCallback((newPage: number) => {
    startTransition(() => {
      setPage(newPage);
    });
  }, []);

  const handleViewLightbox = useCallback((src: string, concepto: string) => {
    setLightboxImage({ src, concepto });
  }, []);

  if (isLoading) {
    return <SkeletonTable rows={5} />;
  }

  return (
    <>
      <div
        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-apple overflow-hidden animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="p-6 pb-0">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Gastos Recientes
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "registro" : "registros"} encontrados
          </p>
        </div>

        <ExpenseTableFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedMonth={selectedMonth}
          onMonthChange={(m) => {
            startTransition(() => {
              setSelectedMonth(m);
              setPage(1);
            });
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(c) => {
            startTransition(() => {
              setSelectedCategory(c);
              setPage(1);
            });
            if (chartCategoryFilter && c !== chartCategoryFilter) {
              onClearChartFilter?.();
            }
          }}
          uniqueCategories={uniqueCategories}
          hasActiveFilters={hasActiveFilters}
          onClearAllFilters={handleClearAllFilters}
        />

        <div className="p-6 pt-4">
          <ExpenseTableMobile
            paginated={paginated}
            filteredLength={filtered.length}
            hasActiveFilters={hasActiveFilters}
            page={page}
            totalPages={totalPages}
            start={start}
            end={end}
            onPageChange={handlePageChange}
            onViewLightbox={handleViewLightbox}
          />
          <ExpenseTableDesktop
            paginated={paginated}
            filteredLength={filtered.length}
            hasActiveFilters={hasActiveFilters}
            page={page}
            totalPages={totalPages}
            start={start}
            end={end}
            onPageChange={handlePageChange}
            onViewLightbox={handleViewLightbox}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            visiblePages={visiblePages}
          />
        </div>
      </div>

      <Modal.Backdrop
        isOpen={!!lightboxImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) setLightboxImage(null);
        }}
      >
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="sm:max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-apple-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-semibold text-zinc-900 dark:text-white">
                {lightboxImage?.concepto ?? "Comprobante"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-4">
              {lightboxImage && (
                <div className="flex justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4">
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
              <Button
                slot="close"
                variant="secondary"
                className="rounded-xl text-zinc-900 dark:text-white"
              >
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
