"use client";

import { useState, useCallback } from "react";
import ExpenseTable from "./ExpenseTable";
import { LazyExpenseCategoryChart } from "./LazyCharts";

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
  const [chartCategoryFilter, setChartCategoryFilter] = useState<string | null>(
    null,
  );

  const handleClearChartFilter = useCallback(() => {
    setChartCategoryFilter(null);
  }, []);

  const handleCategoryClick = useCallback((cat: string) => {
    setChartCategoryFilter(cat);
  }, []);

  return (
    <section
      aria-label="Detalle de gastos"
      className="grid grid-cols-1 gap-6 xl:grid-cols-3"
    >
      <div className="xl:col-span-2">
        <ExpenseTable
          transacciones={transacciones}
          chartCategoryFilter={chartCategoryFilter}
          onClearChartFilter={handleClearChartFilter}
          totalRecords={totalRecords}
          uniqueCategories={uniqueCategories}
          isLoading={isLoading}
        />
      </div>
      <div className="xl:col-span-1">
        <LazyExpenseCategoryChart
          gastosPorCategoria={gastosPorCategoria}
          onCategoryClick={handleCategoryClick}
          activeCategoryFilter={chartCategoryFilter}
        />
      </div>
    </section>
  );
}
