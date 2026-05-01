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
  const hasMounted = useRef(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setValue(0);
    }

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
  const porcentajeGastado = Math.round(
    (resumenFinanciero.totalGastado / resumenFinanciero.presupuestoTotal) * 100,
  );
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
    <div className="animate-fade-in-up opacity-0">
      {/* Single integrated summary surface */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple p-6 sm:p-8">
        {/* Top row: hero metric (spent) + sub-metrics (total + available) */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
          {/* Hero metric: Total Gastado — what students come to see */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-1.5">
              Total Gastado
            </p>
            <p className="text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums text-gray-900 dark:text-white font-light">
              {formatCLP(animatedGastado)}
            </p>
            <p className={`mt-1.5 text-sm font-medium ${spentStatusText}`}>
              {porcentajeGastado}% del presupuesto utilizado
            </p>
          </div>

          {/* Divider on desktop */}
          <div className="hidden lg:block w-px h-16 bg-gray-100 dark:bg-gray-800" />

          {/* Sub-metrics: Total y Disponible — amounts only, no redundant percentages */}
          <div className="flex items-end gap-8 sm:gap-10 shrink-0">
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

        {/* Progress bar — visual only, percentage already stated above */}
        <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
          <div className="mb-2">
            <span className="text-xs text-gray-400">
              Progreso del presupuesto utilizado
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${statusColor} transition-all duration-1000 ease-out`}
              style={{ width: `${porcentajeGastado}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
