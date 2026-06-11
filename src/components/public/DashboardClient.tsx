"use client";

import { useCallback } from "react";
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
}

interface CategoriaData {
  categoria: string;
  monto: number;
  color: string;
}

interface DashboardClientProps {
  transacciones: Transaccion[];
  gastosPorCategoria: CategoriaData[];
  totalRecords: number;
  uniqueCategories: string[];
  isLoading?: boolean;
}

export default function DashboardClient({
  transacciones,
  gastosPorCategoria,
  totalRecords,
  uniqueCategories,
  isLoading,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategoryFilter = searchParams.get("categoria") || null;

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

  return (
    <section
      aria-label="Detalle de gastos"
      className="grid grid-cols-1 gap-6 xl:grid-cols-3"
    >
      <div className="xl:col-span-2">
        <ExpenseTable
          transacciones={transacciones}
          totalRecords={totalRecords}
          uniqueCategories={uniqueCategories}
          isLoading={isLoading}
        />
      </div>
      <div className="xl:col-span-1">
        <LazyExpenseCategoryChart
          gastosPorCategoria={gastosPorCategoria}
          onCategoryClick={handleCategoryClick}
          activeCategoryFilter={activeCategoryFilter}
        />
      </div>
    </section>
  );
}
