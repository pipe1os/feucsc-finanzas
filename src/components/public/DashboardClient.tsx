"use client";

import { useCallback, useMemo } from "react";
import ExpenseTable from "./ExpenseTable";
import { LazyExpenseCategoryChart } from "./LazyCharts";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Transaccion {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  color?: string;
  monto: number;
  comprobante: string;
  creado_el?: string;
}

interface CategoriaData {
  categoria: string;
  monto: number;
  color: string;
}

interface DashboardClientProps {
  allTransacciones: Transaccion[];
  uniqueCategories: string[];
  categoryColors: Record<string, string>;
}

export default function DashboardClient({
  allTransacciones,
  uniqueCategories,
  categoryColors,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const activeCategoryFilter = searchParams.get("categoria") ?? "all";
  const mesFilter = searchParams.get("mes") ?? "all";
  const sortCol = searchParams.get("sort") ?? "fecha";
  const sortDir = searchParams.get("direction") ?? "descending";
  const page = Number(searchParams.get("page")) || 1;
  const ROWS_PER_PAGE = 10;

  const handleCategoryClick = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (activeCategoryFilter === cat) {
        params.delete("categoria");
      } else {
        params.set("categoria", cat);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [activeCategoryFilter, pathname, router, searchParams]
  );

  const filteredTransacciones = useMemo(() => {
    let result = allTransacciones;

    if (search) {
      result = result.filter(
        (t) =>
          t.concepto.toLowerCase().includes(search) ||
          t.categoria.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search)
      );
    }

    if (activeCategoryFilter !== "all") {
      result = result.filter((t) => t.categoria === activeCategoryFilter);
    }

    if (mesFilter !== "all") {
      result = result.filter((t) => {
        // match YYYY-MM-DD
        const monthPart = t.fecha.substring(5, 7);
        return monthPart === mesFilter;
      });
    }

    const sortKey = sortCol === "descripcion" ? "concepto" : sortCol;
    
    // Create a new array for sorting
    result = [...result].sort((a, b) => {
      const valA = a[sortKey as keyof Transaccion];
      const valB = b[sortKey as keyof Transaccion];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "ascending"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "ascending" ? valA - valB : valB - valA;
      }

      return 0;
    });

    return result;
  }, [allTransacciones, search, activeCategoryFilter, mesFilter, sortCol, sortDir]);

  const gastosPorCategoria: CategoriaData[] = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransacciones.forEach((t) => {
      const cat = t.categoria || "Varios";
      map.set(cat, (map.get(cat) ?? 0) + t.monto);
    });

    return Array.from(map.entries())
      .map(([categoria, monto]) => ({
        categoria,
        monto,
        color: categoryColors[categoria] || "#E30707",
      }))
      .sort((a, b) => b.monto - a.monto);
  }, [filteredTransacciones, categoryColors]);

  const paginatedTransacciones = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredTransacciones.slice(start, start + ROWS_PER_PAGE);
  }, [filteredTransacciones, page]);

  return (
    <section
      aria-label="Detalle de gastos"
      className="grid grid-cols-1 gap-6 xl:grid-cols-3"
    >
      <div className="xl:col-span-2">
        <ExpenseTable
          transacciones={paginatedTransacciones}
          totalRecords={filteredTransacciones.length}
          uniqueCategories={uniqueCategories}
          isLoading={false}
        />
      </div>
      <div className="xl:col-span-1">
        <LazyExpenseCategoryChart
          gastosPorCategoria={gastosPorCategoria}
          onCategoryClick={handleCategoryClick}
          activeCategoryFilter={activeCategoryFilter === "all" ? null : activeCategoryFilter}
        />
      </div>
    </section>
  );
}
