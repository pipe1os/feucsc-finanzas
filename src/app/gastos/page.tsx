import Sidebar from "@/components/public/Sidebar";
import DashboardClient from "@/components/public/DashboardClient";
import LastSyncIndicator from "@/components/public/LastSyncIndicator";
import { supabase } from "@/lib/supabase";
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
    supabase.from("gastos").select("*").order("fecha", { ascending: false }),
    supabase.from("categorias").select("*"),
  ]);

  if (gastosRes.error) console.error("Error fetching gastos:", gastosRes.error);
  if (categoriasRes.error)
    console.error("Error fetching categorias:", categoriasRes.error);

  const data = gastosRes.data || [];
  const categoriasData = categoriasRes.data || [];

  const categoryColors: Record<string, string> = {};
  categoriasData.forEach((c) => {
    if (c.color) categoryColors[c.nombre] = c.color;
  });
  if (!categoryColors["N/A"]) categoryColors["N/A"] = "#9CA3AF";
  if (!categoryColors["Otros"]) categoryColors["Otros"] = "#9CA3AF";

  const transacciones = data.map((g) => {
    const catName = g.categoria || "Otros";
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
    const cat = g.categoria || "Otros";
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
    <div className="flex min-h-dvh bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 min-w-0 lg:ml-65">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          {/* Page header */}
          <header className="mb-8 animate-fade-in-up opacity-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href="/"
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-red-500 uppercase hover:text-red-600 transition-colors"
                  >
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
                    Resumen
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
          <footer
            className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                © 2026 Federación de Estudiantes Universidad Católica de la
                Santísima Concepción.
              </p>
              <a
                href="https://instagram.com/feucsc_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Instagram de FEUCSC"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
