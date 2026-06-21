"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Modal, Button, SortDescriptor } from "@heroui/react";
import Image from "next/image";
import { m, LazyMotion, domAnimation, AnimatePresence } from "motion/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  totalRecords: number;
  uniqueCategories: string[];
  isLoading?: boolean;
}

const ROWS_PER_PAGE = 10;

function ExpenseTable({
  transacciones,
  totalRecords,
  uniqueCategories,
  isLoading,
}: ExpenseTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const selectedMonth = searchParams.get("mes") || "all";
  const selectedCategory = searchParams.get("categoria") || "all";
  const sortCol = searchParams.get("sort") || "fecha";
  const sortDir = searchParams.get("direction") || "descending";

  const sortDescriptor: SortDescriptor = {
    column: sortCol as string,
    direction: sortDir as "ascending" | "descending",
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timerRef = debounceTimer;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const setURLParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          if (params.get(key) !== value) {
            params.set(key, value);
            changed = true;
          }
        } else {
          if (params.has(key)) {
            params.delete(key);
            changed = true;
          }
        }
      }
      if (changed) {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [searchParams, pathname, router]
  );



  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        setURLParams({ search: value || null, page: "1" });
      }, 300);
    },
    [setURLParams]
  );

  const handleClearAllFilters = useCallback(() => {
    setURLParams({ mes: null, categoria: null, search: null, page: "1" });
  }, [setURLParams]);

  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

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

  const paginated = transacciones;

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, totalRecords);

  const hasActiveFilters =
    selectedMonth !== "all" || selectedCategory !== "all" || searchQuery !== "";

  const handlePageChange = useCallback((newPage: number) => {
    setURLParams({ page: String(newPage) });
  }, [setURLParams]);

  const handleSortChange = useCallback((desc: SortDescriptor) => {
    setURLParams({ sort: String(desc.column), direction: desc.direction });
  }, [setURLParams]);

  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    concepto: string;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleViewLightbox = useCallback((src: string, concepto: string) => {
    setIsImageLoading(true);
    setLightboxImage({ src, concepto });
  }, []);

  return (
    <>
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SkeletonTable rows={5} />
            </m.div>
          ) : (
            <m.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-surface shadow-apple overflow-hidden"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="p-6 pb-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Gastos Recientes
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {totalRecords} {totalRecords === 1 ? "registro" : "registros"} encontrados
                  </p>
                </div>

                <ExpenseTableFilters
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  selectedMonth={selectedMonth}
                  onMonthChange={(m) => {
                    setURLParams({ mes: m, page: "1" });
                  }}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(c) => {
                    setURLParams({ categoria: c, page: "1" });
                  }}
                  uniqueCategories={uniqueCategories}
                  hasActiveFilters={hasActiveFilters}
                  onClearAllFilters={handleClearAllFilters}
                />

                <div className="p-6 pt-4">
                  <ExpenseTableMobile
                    paginated={paginated}
                    filteredLength={totalRecords}
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
                    filteredLength={totalRecords}
                    hasActiveFilters={hasActiveFilters}
                    page={page}
                    totalPages={totalPages}
                    start={start}
                    end={end}
                    onPageChange={handlePageChange}
                    onViewLightbox={handleViewLightbox}
                    sortDescriptor={sortDescriptor}
                    onSortChange={handleSortChange}
                    visiblePages={visiblePages}
                  />
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>

      <Modal.Backdrop
        isOpen={!!lightboxImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) setLightboxImage(null);
        }}
      >
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="sm:max-w-2xl bg-surface rounded-2xl overflow-hidden shadow-apple-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-semibold text-gray-900 dark:text-white">
                {lightboxImage?.concepto ?? "Comprobante"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-4">
              {lightboxImage && (
                <div className="flex justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 relative min-h-[300px] items-center">
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                    </div>
                  )}
                  <LazyMotion features={domAnimation}>
                    <m.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: isImageLoading ? 0 : 1, scale: isImageLoading ? 0.95 : 1 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
                    >
                      <Image
                        src={lightboxImage.src}
                        alt={`Comprobante: ${lightboxImage.concepto}`}
                        width={500}
                        height={700}
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="max-h-[70vh] w-auto rounded-lg object-contain"
                        onLoad={() => setIsImageLoading(false)}
                      />
                    </m.div>
                  </LazyMotion>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="secondary"
                className="rounded-xl text-gray-900 dark:text-white"
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
