"use client";

import { useState } from "react";
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
}

export default function DashboardClient({
  transacciones,
  gastosPorCategoria,
}: DashboardClientProps) {
  const [chartCategoryFilter, setChartCategoryFilter] = useState<string | null>(
    null,
  );

  return (
    <section
      aria-label="Detalle de gastos"
      className="grid grid-cols-1 gap-6 xl:grid-cols-3"
    >
      <div className="xl:col-span-2">
        <ExpenseTable
          transacciones={transacciones}
          chartCategoryFilter={chartCategoryFilter}
          onClearChartFilter={() => setChartCategoryFilter(null)}
        />
      </div>
      <div className="xl:col-span-1">
        <LazyExpenseCategoryChart
          gastosPorCategoria={gastosPorCategoria}
          onCategoryClick={(cat: string) => setChartCategoryFilter(cat)}
          activeCategoryFilter={chartCategoryFilter}
        />
      </div>
    </section>
  );
}
