"use client";

import { formatCLP } from "@/lib/utils";
import { useMemo } from "react";
import { SkeletonKPICards } from "./Skeletons";
import { Sparkline } from "./Sparkline";

interface ResumenFinanciero {
  presupuestoTotal: number;
  totalGastado: number;
  saldoDisponible: number;
}

interface KPICardsProps {
  resumenFinanciero: ResumenFinanciero;
  monthlySpending?: number[];
  isLoading?: boolean;
}

export default function KPICards({
  resumenFinanciero,
  monthlySpending = [],
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
        ? "text-emerald-600"
        : porcentajeGastado <= 69
          ? "text-amber-700"
          : "text-rose-600";

    const available =
      porcentajeDisponible >= 60
        ? "text-emerald-600"
        : porcentajeDisponible >= 31
          ? "text-amber-700"
          : "text-rose-600";

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
      <div className="rounded-2xl border border-zinc-200 bg-white h-full flex flex-col divide-y divide-zinc-100">
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 font-bold font-heading animate-fade-in-up">
              {formatCLP(resumenFinanciero.totalGastado)}
            </p>
            <p
              className={`mt-1.5 text-sm font-medium flex items-center gap-1 tabular-nums ${spentStatusText}`}
            >
              <span className="font-bold">
                {Math.round(porcentajeGastado)}%
              </span>
              <span>del presupuesto utilizado</span>
            </p>

            {monthlySpending.length > 0 && (
              <div className="mt-3 w-full">
                <Sparkline
                  data={monthlySpending}
                  width={100}
                  height={28}
                  strokeWidth={2}
                  color={
                    porcentajeGastado <= 40
                      ? "#10b981"
                      : porcentajeGastado <= 69
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 flex items-end justify-between gap-4 bg-zinc-50/30">
          <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 mb-1">
                Presupuesto Total
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 font-semibold font-heading animate-fade-in-up delay-100">
                {formatCLP(resumenFinanciero.presupuestoTotal)}
              </p>
              <p className="mt-1 text-xs text-gray-500 tabular-nums">Año académico 2026</p>
            </div>

            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 mb-1">
                Presupuesto Disponible
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 font-semibold font-heading animate-fade-in-up delay-200">
                {formatCLP(resumenFinanciero.saldoDisponible)}
              </p>
              <p
                className={`mt-1 text-xs font-medium flex items-center gap-1 tabular-nums ${availableStatusText}`}
              >
                <span className="font-semibold">
                  {Math.round(porcentajeDisponible)}%
                </span>
                <span>restante</span>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
