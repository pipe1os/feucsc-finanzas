import Sidebar from "@/components/public/Sidebar";
import DashboardClient from "@/components/public/DashboardClient";
import LastSyncIndicator from "@/components/public/LastSyncIndicator";
import { supabase } from "@/lib/supabase";
import { parseISODate } from "@/lib/utils";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Gastos | FEUCSC",
  description:
    "Detalle de gastos, tabla completa y distribución por categoría de la Federación de Estudiantes UCSC.",
};

export default async function GastosPage() {
  // Parallel data fetching
  const [gastosRes, categoriasRes] = await Promise.all([
    supabase.from("gastos").select("*").order("fecha", { ascending: false }).limit(500),
    supabase.from("categorias").select("*"),
  ]);

  if (gastosRes.error || categoriasRes.error) {
    throw new Error(
      gastosRes.error?.message || categoriasRes.error?.message || "Error al cargar datos"
    );
  }

  const data = gastosRes.data || [];
  const categoriasData = categoriasRes.data || [];

  const categoryColors: Record<string, string> = {};
  categoriasData.forEach((c) => {
    if (c.color) categoryColors[c.nombre] = c.color;
  });
  if (!categoryColors["N/A"]) categoryColors["N/A"] = "#9CA3AF";
  if (!categoryColors["Varios"]) categoryColors["Varios"] = "#9CA3AF";

  const transacciones = data.map((g) => {
    const catName = g.categoria || "Varios";
    return {
      id: g.id,
      fecha: g.fecha,
      concepto: g.descripcion,
      categoria: catName,
      color: categoryColors[catName] || "#E30707",
      monto: g.monto,
      comprobante: g.comprobante_url || "",
      creado_el: g.creado_el || "",
    };
  });

  const categoriasMap = new Map<string, number>();
  data.forEach((g) => {
    const cat = g.categoria || "Varios";
    categoriasMap.set(cat, (categoriasMap.get(cat) || 0) + g.monto);
  });

  const gastosPorCategoria = Array.from(categoriasMap.entries())
    .map(([categoria, monto]) => ({
      categoria,
      monto,
      color: categoryColors[categoria] || "#E30707",
    }))
    .sort((a, b) => b.monto - a.monto);

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

  return (
    <div className="flex min-h-dvh bg-transparent">
      <Sidebar />

      <main className="flex-1 min-w-0 lg:ml-65">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          {/* Page header */}
          <header className="mb-8 animate-fade-in-up opacity-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
              <div>
                {/* Back navigation — larger and clearer */}
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <span className="flex items-center justify-center size-7 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors duration-200">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </span>
                    <span className="uppercase tracking-wider text-[11px] font-semibold">Resumen</span>
                  </Link>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Detalle de Gastos
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  Todos los gastos registrados, distribución por categoría y
                  comprobantes de respaldo.
                </p>
              </div>

              <LastSyncIndicator lastSyncISO={lastSyncISO} />
            </div>
          </header>

          {/* Table + Category Chart */}
          <DashboardClient
            transacciones={transacciones}
            gastosPorCategoria={gastosPorCategoria}
          />

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
