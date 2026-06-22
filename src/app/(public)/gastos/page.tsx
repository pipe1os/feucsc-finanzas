import DashboardClient from "@/components/public/DashboardClient";
import { supabaseAnon } from "@/lib/supabase-anon";
import { Suspense } from "react";
import { buildCategoryColors } from "@/lib/utils";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Gastos | FEUCSC",
  description:
    "Detalle de gastos, tabla completa y distribución por categoría de la Federación de Estudiantes UCSC.",
};

export default async function GastosPage() {
  const [gastosRes, categoriasRes] = await Promise.all([
    supabaseAnon.from("gastos").select("*").order("fecha", { ascending: false }).order("id", { ascending: true }),
    supabaseAnon.from("categorias").select("*"),
  ]);

  const data = gastosRes.data || [];
  const categoriasData = categoriasRes.data || [];

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

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors duration-200"
              >
                <span className="flex items-center justify-center size-7 rounded-lg bg-zinc-100 group-hover:bg-red-50 transition-colors duration-200">
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
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 font-heading">
              Detalle de Gastos
            </h1>
            <p className="mt-1 text-sm text-zinc-500 max-w-xl">
              Todos los gastos registrados, distribución por categoría y
              comprobantes de respaldo.
            </p>
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        <DashboardClient
          allTransacciones={transacciones}
          uniqueCategories={uniqueCategories}
          categoryColors={categoryColors}
        />
      </Suspense>
      <Footer />
    </div>
  );
}