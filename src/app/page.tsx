import Sidebar from "@/components/public/Sidebar";
import KPICards from "@/components/public/KPICards";
import LastSyncIndicator from "@/components/public/LastSyncIndicator";
import { LazyExpenseTrendChart } from "@/components/public/LazyCharts";
import { supabase } from "@/lib/supabase";
import { formatCLP, formatDate, parseISODate } from "@/lib/utils";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { Table } from "@heroui/react";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  // Fetch expenses + categories in parallel
  const [gastosRes, categoriasRes] = await Promise.all([
    supabase.from("gastos").select("*").order("fecha", { ascending: false }),
    supabase.from("categorias").select("*"),
  ]);

  if (gastosRes.error || categoriasRes.error) {
    throw new Error(
      gastosRes.error?.message ||
        categoriasRes.error?.message ||
        "Error al cargar datos",
    );
  }

  const data = gastosRes.data || [];
  const categoriasData = categoriasRes.data || [];

  // Build category color map
  const categoryColors: Record<string, string> = {};
  categoriasData.forEach((c) => {
    if (c.color) categoryColors[c.nombre] = c.color;
  });
  if (!categoryColors["N/A"]) categoryColors["N/A"] = "#9CA3AF";
  if (!categoryColors["Varios"]) categoryColors["Varios"] = "#9CA3AF";

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

  // Latest 5 transactions for preview
  const latestTransactions = data.slice(0, 5).map((g) => {
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
          <header className="mb-8 animate-fade-in-up opacity-0">
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
            <section aria-label="Indicadores financieros" className="col-span-1 lg:col-span-4 animate-fade-in-up opacity-0 h-full">
              <KPICards resumenFinanciero={resumenFinanciero} />
            </section>

            {/* Trend Chart — lazy loaded (ssr: false, recharts deferred) */}
            <section aria-label="Tendencia de gastos" className="col-span-1 lg:col-span-8 animate-fade-in-up opacity-0 h-full" style={{ animationDelay: "0.1s" }}>
              <LazyExpenseTrendChart gastosPorMes={gastosPorMes} />
            </section>

            {/* Latest transactions preview */}
            <section
              className="col-span-1 lg:col-span-12 animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.25s" }}
            >
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-gray-900 shadow-xs dark:shadow-none overflow-hidden">
              {/* Preview header */}
              <div className="px-6 pt-5 pb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Últimos Gastos
                </h2>
              </div>

              {/* Mini table */}
              <Table variant="secondary" className="w-full px-5">
                <Table.ScrollContainer>
                  <Table.Content aria-label="Últimos gastos">
                    <Table.Header>
                      <Table.Column isRowHeader className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                        Fecha
                      </Table.Column>
                      <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                        Descripción
                      </Table.Column>
                      <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                        Categoría
                      </Table.Column>
                      <Table.Column className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                        Monto
                      </Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {latestTransactions.map((txn) => (
                        <Table.Row
                          key={txn.id}
                          className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors duration-150"
                        >
                          <Table.Cell className="px-4 py-3.5">
                            <span className="text-gray-500 whitespace-nowrap">
                              {formatDate(txn.fecha)}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="px-6 py-3.5">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {txn.concepto}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-3.5">
                            <span
                              className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: `${txn.color}18`,
                                color: txn.color,
                              }}
                            >
                              {txn.categoria}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="px-6 py-3.5 text-right">
                            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                              {formatCLP(txn.monto)}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>

              {/* Footer with CTA */}
              <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {data.length} registros en total
                </span>
                <Link
                  href="/gastos"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Ver todos los gastos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
