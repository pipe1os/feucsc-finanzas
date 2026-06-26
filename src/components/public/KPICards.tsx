"use client";

import { formatCLP } from "@/lib/utils";
import { useMemo } from "react";
import { SkeletonKPICards } from "./Skeletons";

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
      <div className="rounded-2xl border border-zinc-200 bg-white ring-0 h-full flex flex-col overflow-hidden">
        {/* Top Half: Total Gastado */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-zinc-900 font-bold font-heading animate-fade-in-up">
              {formatCLP(resumenFinanciero.totalGastado)}
            </p>
            <p
              className={`mt-1.5 text-sm font-medium flex items-center gap-1 ${spentStatusText}`}
            >
              <span className="font-bold">
                {Math.round(porcentajeGastado)}%
              </span>
              <span>del presupuesto utilizado</span>
            </p>

            <div className="mt-3 h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
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
        </div>

        {/* Bottom Half: Split info */}
        <div className="grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 bg-zinc-50/30">
          <div className="p-6">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500 mb-1">
              Presupuesto Total
            </p>
            <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-zinc-900 font-semibold font-heading animate-fade-in-up delay-100">
              {formatCLP(resumenFinanciero.presupuestoTotal)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Año académico 2026</p>
          </div>

          <div className="p-6">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500 mb-1">
              Presupuesto Disponible
            </p>
            <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-zinc-900 font-semibold font-heading animate-fade-in-up delay-200">
              {formatCLP(resumenFinanciero.saldoDisponible)}
            </p>
            <p
              className={`mt-1 text-xs font-medium flex items-center gap-1 ${availableStatusText}`}
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
