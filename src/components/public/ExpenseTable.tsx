"use client";

import React, {
 useState,
 useMemo,
 useRef,
 useEffect,
 useCallback,
} from"react";
import { Modal, SortDescriptor } from "@heroui/react";
import Image from"next/image";
import { m, LazyMotion, domAnimation, AnimatePresence } from"motion/react";
import { useRouter, usePathname, useSearchParams } from"next/navigation";
import { SkeletonTable } from"./Skeletons";
import { ExpenseTableFilters } from"./ExpenseTableFilters";
import { ExpenseTableMobile } from"./ExpenseTableMobile";
import { ExpenseTableDesktop } from"./ExpenseTableDesktop";

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

export const EyeIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
 <circle cx="12" cy="12" r="3" />
 </svg>
);

export const EyeOffIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
 <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
 <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
 <line x1="2" x2="22" y1="2" y2="22" />
 </svg>
);

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
 direction: sortDir as"ascending" |"descending",
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
 if (value && value !=="all") {
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
 setURLParams({ search: value || null, page:"1" });
 }, 300);
 },
 [setURLParams]
 );

 const handleClearAllFilters = useCallback(() => {
 setURLParams({ mes: null, categoria: null, search: null, page:"1" });
 }, [setURLParams]);

 const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

 const visiblePages = useMemo((): (number |"ellipsis")[] => {
 if (totalPages <= 7) {
 return Array.from({ length: totalPages }, (_, i) => i + 1);
 }
 const pages: (number |"ellipsis")[] = [];
 if (page <= 4) {
 pages.push(1, 2, 3, 4, 5,"ellipsis", totalPages);
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
 selectedMonth !=="all" || selectedCategory !=="all" || searchQuery !=="";

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
 
  const [lastImage, setLastImage] = useState<{
    src: string;
    concepto: string;
  } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  // Reset lastImage after modal closing animation completes to avoid memory leak
  useEffect(() => {
    if (!lightboxImage) {
      const timer = setTimeout(() => {
        setLastImage(null);
      }, 300);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [lightboxImage]);

  // Guard cached image reopens: check if image is already complete in browser cache
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsImageLoading(false);
    }
  }, [lastImage]);

  const handleViewLightbox = useCallback((src: string, concepto: string) => {
    setIsImageLoading(true);
    const img = { src, concepto };
    setLightboxImage(img);
    setLastImage(img);
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
 className="rounded-2xl border border-border bg-surface shadow-apple overflow-hidden"
 style={{ animationDelay:"0.2s" }}
 >
 <div className="p-6 pb-0">
 <h3 className="text-base font-semibold text-gray-900">
 Gastos Recientes
 </h3>
 <p className="text-xs text-gray-400 mt-0.5">
 {totalRecords} {totalRecords === 1 ?"registro" :"registros"} encontrados
 </p>
 </div>

 <ExpenseTableFilters
 searchQuery={searchQuery}
 onSearchChange={handleSearchChange}
 selectedMonth={selectedMonth}
 onMonthChange={(m) => {
 setURLParams({ mes: m, page:"1" });
 }}
 selectedCategory={selectedCategory}
 onCategoryChange={(c) => {
 setURLParams({ categoria: c, page:"1" });
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
      <Modal.Dialog
        aria-label={lastImage ? `Comprobante: ${lastImage.concepto}` : "Comprobante"}
        className="relative sm:max-w-2xl bg-surface rounded-2xl overflow-hidden shadow-apple-lg p-3"
      >
        <Modal.CloseTrigger className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white text-zinc-800 rounded-full p-1.5 transition-colors shadow-xs cursor-pointer border border-zinc-200/50" />
        <Modal.Body className="p-0">
          {lastImage && (
            <div className="relative flex justify-center items-center min-h-[300px] w-full">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-xs rounded-xl z-10">
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
                    ref={imgRef}
                    key={lastImage.src}
                    src={lastImage.src}
                    alt={`Comprobante: ${lastImage.concepto}`}
                    width={600}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="max-h-[75vh] w-auto rounded-xl object-contain shadow-xs block"
                    onLoad={() => { setIsImageLoading(false); }}
                  />
                </m.div>
              </LazyMotion>
            </div>
          )}
        </Modal.Body>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
 </>
 );
}

export default React.memo(ExpenseTable);
