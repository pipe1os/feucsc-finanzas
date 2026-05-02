import Sidebar from "@/components/public/Sidebar";
import KPICards from "@/components/public/KPICards";
import LastSyncIndicator from "@/components/public/LastSyncIndicator";
import { LazyExpenseTrendChart } from "@/components/public/LazyCharts";
import LatestTransactionsPreview from "@/components/public/LatestTransactionsPreview";
import { supabase } from "@/lib/supabase";
import { parseISODate } from "@/lib/utils";
import { buildCategoryColors } from "@/lib/data-transform";
import Footer from "@/components/public/Footer";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  // Fetch expenses + categories in parallel
  const [gastosRes, categoriasRes] = await Promise.all([
    supabase.from("gastos").select("*").order("fecha", { ascending: false }).limit(500),
    supabase.from("categorias").select("*"),
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

  // Monthly trend data with per-month category breakdown
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

  // Determine last sync time
  let lastSyncISO: string | null = null;
  if (data.length > 0) {
    const timestamps = data
      .map((g) => g.creado_el || g.fecha)
      .filter(Boolean)
      .map((ts: string) => new Date(ts).getTime())
      .filter((t: number) => !isNaN(t));
    if (timestamps.length > 0) {
      lastSyncISO = new Date(Math.max(...timestamps)).toISOString();
    }
  }

  // Latest 3 transactions for preview
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
    <div className="flex min-h-dvh bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0 lg:ml-65">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          {/* Page header — rendered in server HTML (instant LCP) */}
          <header className="mb-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Transparencia Financiera
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  Presupuesto, gastos y comprobantes de la Federación de
                  Estudiantes UCSC.
                </p>
              </div>
              <LastSyncIndicator lastSyncISO={lastSyncISO} />
            </div>
          </header>

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
            {/* KPI Cards — rendered in server HTML (part of LCP) */}
            <section aria-label="Indicadores financieros" className="col-span-1 lg:col-span-4 animate-fade-in-up h-full">
              <KPICards resumenFinanciero={resumenFinanciero} />
            </section>

            {/* Trend Chart — lazy loaded (ssr: false, recharts deferred) */}
            <section aria-label="Tendencia de gastos" className="col-span-1 lg:col-span-8 animate-fade-in-up h-full" style={{ animationDelay: "0.1s" }}>
              <LazyExpenseTrendChart gastosPorMes={gastosPorMes} />
            </section>

            {/* Latest transactions preview */}
            <section
              className="col-span-1 lg:col-span-12 animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              <LatestTransactionsPreview
                transactions={latestTransactions}
                totalCount={data.length}
              />
            </section>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
