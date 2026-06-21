import KPICards from "@/components/public/KPICards";
import { LazyExpenseTrendChart } from "@/components/public/LazyCharts";
import LatestTransactionsPreview from "@/components/public/LatestTransactionsPreview";
import { supabaseAnon } from "@/lib/supabase-anon";
import { parseISODate } from "@/lib/utils";
import { buildCategoryColors } from "@/lib/data-transform";
import Footer from "@/components/public/Footer";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparencia Financiera | FEUCSC",
  description: "Presupuesto, gastos y comprobantes de la Federación de Estudiantes UCSC.",
};

export const revalidate = 60;

const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * The main dashboard page for the financial transparency portal.
 * Fetches expenses and categories to render KPI cards, charts, and latest transactions.
 */
export default async function Home() {
  const [gastosRes, categoriasRes] = await Promise.all([
    supabaseAnon
      .from("gastos")
      .select("id, fecha, categoria, monto, descripcion, creado_el")
      .order("fecha", { ascending: false }),
    supabaseAnon.from("categorias").select("*"),
  ]);

  const data = gastosRes.data || [];
  const categoriasData = categoriasRes.data || [];

  const categoryColors = buildCategoryColors(categoriasData);

  const presupuestoTotal = Number(
    process.env.NEXT_PUBLIC_PRESUPUESTO_TOTAL || "19972000",
  );
  const totalGastado = data.reduce((acc, curr) => acc + curr.monto, 0);
  const saldoDisponible = presupuestoTotal - totalGastado;
  const resumenFinanciero = { presupuestoTotal, totalGastado, saldoDisponible };
  const gastosPorMesMap = new Map<string, number>();
  const gastosPorMesCatMap = new Map<string, Map<string, number>>();
  months.forEach((m) => {
    gastosPorMesMap.set(m, 0);
    gastosPorMesCatMap.set(m, new Map());
  });

  data.forEach((g) => {
    const date = parseISODate(g.fecha);
    if (date) {
      const monthStr = months[date.getMonth()];
      gastosPorMesMap.set(
        monthStr,
        (gastosPorMesMap.get(monthStr) || 0) + g.monto,
      );
      const catMap = gastosPorMesCatMap.get(monthStr)!;
      const cat = g.categoria || "Varios";
      catMap.set(cat, (catMap.get(cat) || 0) + g.monto);
    }
  });

  const gastosPorMes = months.map((mes) => {
    const catMap = gastosPorMesCatMap.get(mes)!;
    const categorias = Array.from(catMap.entries())
      .map(([categoria, monto]) => ({
        categoria,
        monto,
        color: categoryColors[categoria] || "#E30707",
      }))
      .sort((a, b) => b.monto - a.monto);
    return {
      mes,
      monto: gastosPorMesMap.get(mes) || 0,
      categorias,
    };
  });

  const latestTransactions = data.slice(0, 3).map((g) => {
    const catName = g.categoria || "Varios";
    return {
      id: g.id,
      fecha: g.fecha,
      concepto: g.descripcion,
      categoria: catName,
      color: categoryColors[catName] || "#E30707",
      monto: g.monto,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-10">
      <header className="mb-12 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-zinc-900 dark:text-white font-heading">
              Transparencia Financiera
            </h1>
            <p className="mt-2 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
              Presupuesto, gastos y comprobantes de la Federación de Estudiantes
              UCSC.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        <section
          aria-label="Indicadores financieros"
          className="col-span-1 lg:col-span-4 h-full animate-fade-in-up stagger-1"
        >
          <KPICards resumenFinanciero={resumenFinanciero} />
        </section>
        <section
          aria-label="Tendencia de gastos"
          className="col-span-1 lg:col-span-8 h-full animate-fade-in-up stagger-2"
        >
          <LazyExpenseTrendChart gastosPorMes={gastosPorMes} />
        </section>
        <section className="col-span-1 lg:col-span-12 animate-fade-in-up stagger-3">
          <LatestTransactionsPreview
            transactions={latestTransactions}
            totalCount={data.length}
          />
        </section>
      </div>
      <Footer />
    </div>
  );
}
