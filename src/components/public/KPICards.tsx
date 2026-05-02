"use client";

import { formatCLP } from "@/lib/utils";
import { useMemo } from "react";
import { SkeletonKPICards } from "./Skeletons";
import { NumberTicker } from "@/components/ui/number-ticker";
import { motion } from "motion/react";

interface ResumenFinanciero {
  presupuestoTotal: number;
  totalGastado: number;
  saldoDisponible: number;
}

interface KPICardsProps {
  resumenFinanciero: ResumenFinanciero;
  isLoading?: boolean;
}

export default function KPICards({ resumenFinanciero, isLoading }: KPICardsProps) {
  const porcentajeGastado =
    resumenFinanciero.presupuestoTotal > 0
      ? Math.round(
          (resumenFinanciero.totalGastado / resumenFinanciero.presupuestoTotal) * 100,
        )
      : 0;
  const porcentajeDisponible = 100 - porcentajeGastado;

  // Status/status text derived from percentages (memoized)
  const { statusColor, spentStatusText, availableStatusText } = useMemo(() => {
    const color =
      porcentajeGastado <= 40
        ? "bg-emerald-500"
        : porcentajeGastado <= 69
          ? "bg-amber-400"
          : "bg-rose-500";

    const spent =
      porcentajeGastado <= 40
        ? "text-emerald-600 dark:text-emerald-400"
        : porcentajeGastado <= 69
          ? "text-amber-600 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";

    const available =
      porcentajeDisponible >= 60
        ? "text-emerald-600 dark:text-emerald-400"
        : porcentajeDisponible >= 31
          ? "text-amber-600 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";

    return { statusColor: color, spentStatusText: spent, availableStatusText: available };
  }, [porcentajeGastado, porcentajeDisponible]);

  if (isLoading) {
    return <SkeletonKPICards />;
  }

  return (
    <div className=" animate-fade-in-up h-full">
      {/* Single integrated summary surface */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple p-6 sm:p-8 h-full flex flex-col">
        {/* Content stacked vertically */}
        <div className="flex flex-col flex-1 justify-between gap-5 lg:justify-center">
          {/* Hero metric: Total Gastado */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light">
              <NumberTicker
                value={resumenFinanciero.totalGastado}
                delay={0.2}
                formatFn={formatCLP}
                className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light"
              />
            </p>
            <p className={`mt-1.5 text-sm font-medium flex items-center gap-1 ${spentStatusText}`}>
              <span>
                <NumberTicker
                  value={porcentajeGastado}
                  delay={0.2}
                  className="text-inherit tabular-nums"
                />
                %
              </span>
              <span>del presupuesto utilizado</span>
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${porcentajeGastado}%` }}
                transition={{ type: "spring", damping: 30, stiffness: 170, delay: 0.2 }}
                className={`h-full rounded-full ${statusColor}`}
              />
            </div>
          </div>

          {/* Sub-metrics: Total y Disponible */}
          <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1">
                Presupuesto Total
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light">
                <NumberTicker
                  value={resumenFinanciero.presupuestoTotal}
                  delay={0.1}
                  formatFn={formatCLP}
                  className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light"
                />
              </p>
              <p className="mt-1 text-xs text-gray-400">Año académico 2026</p>
            </div>

            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1">
                Presupuesto Disponible
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light">
                <NumberTicker
                  value={resumenFinanciero.saldoDisponible}
                  delay={0.3}
                  formatFn={formatCLP}
                  className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light"
                />
              </p>
              <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${availableStatusText}`}>
                <span>
                  <NumberTicker
                    value={porcentajeDisponible}
                    delay={0.3}
                    className="text-inherit tabular-nums"
                  />
                  %
                </span>
                <span>restante</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
