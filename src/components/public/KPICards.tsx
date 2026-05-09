"use client";

import { formatCLP } from "@/lib/utils";
import { useMemo } from "react";
import { SkeletonKPICards } from "./Skeletons";
import { NumberTicker } from "@/components/ui/number-ticker";

interface ResumenFinanciero {
  presupuestoTotal: number;
  totalGastado: number;
  saldoDisponible: number;
}

interface KPICardsProps {
  resumenFinanciero: ResumenFinanciero;
  isLoading?: boolean;
}

export default function KPICards({
  resumenFinanciero,
  isLoading,
}: KPICardsProps) {
  const porcentajeGastado =
    resumenFinanciero.presupuestoTotal > 0
      ? Math.round(
          (resumenFinanciero.totalGastado /
            resumenFinanciero.presupuestoTotal) *
            100,
        )
      : 0;
  const porcentajeDisponible = 100 - porcentajeGastado;

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
          ? "text-amber-700 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";

    const available =
      porcentajeDisponible >= 60
        ? "text-emerald-600 dark:text-emerald-400"
        : porcentajeDisponible >= 31
          ? "text-amber-700 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";

    return {
      statusColor: color,
      spentStatusText: spent,
      availableStatusText: available,
    };
  }, [porcentajeGastado, porcentajeDisponible]);

  if (isLoading) {
    return <SkeletonKPICards />;
  }

  return (
    <div className="h-full">
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple p-6 sm:p-8 h-full flex flex-col">
        <div className="flex flex-col flex-1 justify-between gap-5 lg:justify-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light font-heading">
              <NumberTicker
                value={resumenFinanciero.totalGastado}
                formatFn={formatCLP}
                className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light font-heading"
              />
            </p>
            <p
              className={`mt-1.5 text-sm font-medium flex items-center gap-1 ${spentStatusText}`}
            >
              <span>
                <NumberTicker
                  value={porcentajeGastado}
                  className="text-inherit tabular-nums"
                />
                %
              </span>
              <span>del presupuesto utilizado</span>
            </p>

            <div className="mt-3 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${statusColor} animate-bar-grow`}
                style={
                  {
                    "--bar-width": `${porcentajeGastado}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400 mb-1">
                Presupuesto Total
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light font-heading">
                <NumberTicker
                  value={resumenFinanciero.presupuestoTotal}
                  formatFn={formatCLP}
                  className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light font-heading"
                />
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Año académico 2026
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400 mb-1">
                Presupuesto Disponible
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light font-heading">
                <NumberTicker
                  value={resumenFinanciero.saldoDisponible}
                  formatFn={formatCLP}
                  className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light font-heading"
                />
              </p>
              <p
                className={`mt-1 text-xs font-medium flex items-center gap-1 ${availableStatusText}`}
              >
                <span>
                  <NumberTicker
                    value={porcentajeDisponible}
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
