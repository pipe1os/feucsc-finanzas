import DashboardClient from "@/components/public/DashboardClient";
import { supabaseAnon } from "@/lib/supabase-anon";
import { Suspense } from "react";
import { buildCategoryColors } from "@/lib/data-transform";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const revalidate = 60;

const validSortCols = ["fecha", "monto", "descripcion", "categoria"];

export const metadata = {
  title: "Gastos | FEUCSC",
  description:
    "Detalle de gastos, tabla completa y distribución por categoría de la Federación de Estudiantes UCSC.",
};

export default async function GastosPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const categoria = typeof searchParams?.categoria === "string" ? searchParams.categoria : "";
  const mes = typeof searchParams?.mes === "string" ? searchParams.mes : "";
  const sortCol = typeof searchParams?.sort === "string" ? searchParams.sort : "fecha";
  const sortDir = typeof searchParams?.direction === "string" ? searchParams.direction : "descending";

  let query = supabaseAnon.from("gastos").select("*", { count: "exact" });
  let chartQuery = supabaseAnon.from("gastos").select("categoria, monto, fecha, creado_el").limit(500);

  if (search) {
    const q = `%${search}%`;
    const orStr = `descripcion.ilike.${q},categoria.ilike.${q},id.ilike.${q}`;
    query = query.or(orStr);
    chartQuery = chartQuery.or(orStr);
  }

  if (categoria && categoria !== "all") {
    query = query.eq("categoria", categoria);
    chartQuery = chartQuery.eq("categoria", categoria);
  }

  if (mes && mes !== "all") {
    query = query.like("fecha", `____-${mes}-__`);
    chartQuery = chartQuery.like("fecha", `____-${mes}-__`);
  }

  const mappedSortCol = sortCol === "concepto" ? "descripcion" : sortCol;
  const orderCol = validSortCols.includes(mappedSortCol) ? mappedSortCol : "fecha";
  const ascending = sortDir === "ascending";

  query = query.order(orderCol, { ascending });
  if (orderCol !== "id") {
    query = query.order("id", { ascending: true });
  }

  const ROWS_PER_PAGE = 10;
  const from = (page - 1) * ROWS_PER_PAGE;
  const to = from + ROWS_PER_PAGE - 1;
  query = query.range(from, to);

  const [gastosRes, chartRes, categoriasRes] = await Promise.all([
    query,
    chartQuery,
    supabaseAnon.from("categorias").select("*"),
  ]);

  const data = gastosRes.data || [];
  const chartData = chartRes.data || [];
  const categoriasData = categoriasRes.data || [];
  const totalRecords = gastosRes.count || 0;

  const categoryColors = buildCategoryColors(categoriasData);
  const uniqueCategories = categoriasData.map((c) => c.nombre || "Varios");

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
  chartData.forEach((g) => {
    const cat = g.categoria || "Varios";
    categoriasMap.set(cat, (categoriasMap.get(cat) || 0) + g.monto);
  });

  const gastosPorCategoria = Array.from(categoriasMap.entries())
    .map(([cat, monto]) => ({
      categoria: cat,
      monto,
      color: categoryColors[cat] || "#E30707",
    }))
    .sort((a, b) => b.monto - a.monto);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
      <header className="mb-8 animate-fade-in-up opacity-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors duration-200"
              >
                <span className="flex items-center justify-center size-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors duration-200">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </span>
                <span className="uppercase tracking-wider text-[11px] font-semibold">
                  Resumen
                </span>
              </Link>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white font-heading">
              Detalle de Gastos
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
              Todos los gastos registrados, distribución por categoría y
              comprobantes de respaldo.
            </p>
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        <DashboardClient
          transacciones={transacciones}
          gastosPorCategoria={gastosPorCategoria}
          totalRecords={totalRecords}
          uniqueCategories={uniqueCategories}
        />
      </Suspense>
      <Footer />
    </div>
  );
}