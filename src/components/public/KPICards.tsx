"use client";

import { formatCLP } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
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

// ── Animated counter hook ──────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(target);
  const hasAnimated = useRef(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    // Skip animation on remount; jump straight to final value
    if (hasAnimated.current) {
      setValue(target);
      return;
    }
    hasAnimated.current = true;
    setValue(0);

    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      };
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export default function KPICards({ resumenFinanciero, isLoading }: KPICardsProps) {
  const porcentajeGastado =
    resumenFinanciero.presupuestoTotal > 0
      ? Math.round(
          (resumenFinanciero.totalGastado / resumenFinanciero.presupuestoTotal) * 100,
        )
      : 0;
  const porcentajeDisponible = 100 - porcentajeGastado;

  const animatedGastado = useCountUp(resumenFinanciero.totalGastado, 1200, 200);
  const animatedTotal = useCountUp(
    resumenFinanciero.presupuestoTotal,
    1200,
    100,
  );
  const animatedDisponible = useCountUp(
    resumenFinanciero.saldoDisponible,
    1200,
    300,
  );

  // Status color for progress bar (based on spent)
  const statusColor =
    porcentajeGastado <= 40
      ? "bg-emerald-500"
      : porcentajeGastado <= 69
        ? "bg-amber-400"
        : "bg-rose-500";

  // Text color for spent percentage
  const spentStatusText =
    porcentajeGastado <= 40
      ? "text-emerald-600 dark:text-emerald-400"
      : porcentajeGastado <= 69
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  // Text color for available percentage (inverted logic)
  const availableStatusText =
    porcentajeDisponible >= 60
      ? "text-emerald-600 dark:text-emerald-400"
      : porcentajeDisponible >= 31
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  if (isLoading) {
    return <SkeletonKPICards />;
  }

  return (
    <div className="animate-fade-in-up opacity-0 h-full">
      {/* Single integrated summary surface */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple p-6 sm:p-8 h-full flex flex-col">
        {/* Content stacked vertically */}
        <div className="flex flex-col flex-1 justify-between gap-5">
          {/* Hero metric: Total Gastado */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light">
              {formatCLP(animatedGastado)}
            </p>
            <p className={`mt-1.5 text-sm font-medium ${spentStatusText}`}>
              {porcentajeGastado}% del presupuesto utilizado
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${statusColor} transition-all duration-1000 ease-out`}
                style={{ width: `${porcentajeGastado}%` }}
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
                {formatCLP(animatedTotal)}
              </p>
              <p className="mt-1 text-xs text-gray-400">Año académico 2026</p>
            </div>

            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1">
                Presupuesto Disponible
              </p>
              <p className="text-xl sm:text-2xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white font-light">
                {formatCLP(animatedDisponible)}
              </p>
              <p className={`mt-1 text-xs font-medium ${availableStatusText}`}>
                {porcentajeDisponible}% restante
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
