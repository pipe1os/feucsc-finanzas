"use client";

import { formatCLP } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { ProgressBar } from "@heroui/react";

interface ResumenFinanciero {
  presupuestoTotal: number;
  totalGastado: number;
  saldoDisponible: number;
}

interface KPICardsProps {
  resumenFinanciero: ResumenFinanciero;
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

// ── Status color system ────────────────────────────────
type StatusColors = {
  fill: string;
  track: string;
  text: string;
  dot: string;
};

const STATUS_GREEN: StatusColors = {
  fill: "bg-emerald-500",
  track: "bg-emerald-500/10",
  text: "text-emerald-600",
  dot: "bg-emerald-500",
};

const STATUS_AMBER: StatusColors = {
  fill: "bg-amber-400",
  track: "bg-amber-400/10",
  text: "text-amber-600",
  dot: "bg-amber-400",
};

const STATUS_RED: StatusColors = {
  fill: "bg-rose-500",
  track: "bg-rose-500/10",
  text: "text-rose-600",
  dot: "bg-rose-500",
};

const STATUS_NEUTRAL: StatusColors = {
  fill: "bg-gray-400",
  track: "bg-gray-400/10",
  text: "text-gray-500",
  dot: "bg-gray-400",
};

function getSpentStatus(percent: number): StatusColors {
  if (percent <= 40) return STATUS_GREEN;
  if (percent <= 69) return STATUS_AMBER;
  return STATUS_RED;
}

function getAvailableStatus(percent: number): StatusColors {
  if (percent >= 60) return STATUS_GREEN;
  if (percent >= 31) return STATUS_AMBER;
  return STATUS_RED;
}

// ── Single KPI Card ────────────────────────────────────
interface KPICardProps {
  title: string;
  rawValue: number;
  subtitle: string;
  delay?: string;
  countDelay?: number;
  progressValue: number;
  status: StatusColors;
}

function KPICard({
  title,
  rawValue,
  subtitle,
  delay,
  countDelay = 0,
  progressValue,
  status,
}: KPICardProps) {
  const animatedValue = useCountUp(rawValue, 1200, countDelay);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm card-hover animate-fade-in-up opacity-0 p-6"
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500">
          {title}
        </span>
        <span
          className="text-3xl sm:text-4xl tracking-[-0.02em] tabular-nums text-gray-900 dark:text-white"
          style={{ fontWeight: 300 }}
        >
          {formatCLP(animatedValue)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <ProgressBar
          aria-label={`${title} progreso`}
          value={progressValue}
          size="sm"
          className="w-full"
        >
          <ProgressBar.Track className={`${status.track} h-[2px] rounded-full`}>
            <ProgressBar.Fill
              className={`${status.fill} rounded-full transition-all duration-700 ease-out`}
            />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block size-1.5 rounded-full ${status.dot} shrink-0`}
          />
          <span
            className={`text-xs font-medium ${status.text} transition-colors duration-500`}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ resumenFinanciero }: KPICardsProps) {
  const porcentajeGastado = Math.round(
    (resumenFinanciero.totalGastado / resumenFinanciero.presupuestoTotal) * 100,
  );
  const porcentajeDisponible = 100 - porcentajeGastado;

  const spentStatus = getSpentStatus(porcentajeGastado);
  const availableStatus = getAvailableStatus(porcentajeDisponible);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Presupuesto Total — neutral, informational */}
      <KPICard
        title="Presupuesto Total"
        rawValue={resumenFinanciero.presupuestoTotal}
        subtitle="Año académico 2026"
        delay="0.05s"
        countDelay={300}
        progressValue={100}
        status={STATUS_NEUTRAL}
      />
      {/* Total Gastado — green <40%, yellow 41-69%, red ≥70% */}
      <KPICard
        title="Total Gastado"
        rawValue={resumenFinanciero.totalGastado}
        subtitle={`${porcentajeGastado}% del presupuesto utilizado`}
        delay="0.1s"
        countDelay={500}
        progressValue={porcentajeGastado}
        status={spentStatus}
      />
      {/* Presupuesto Disponible — inverted: green when lots left, red when little */}
      <KPICard
        title="Presupuesto Disponible"
        rawValue={resumenFinanciero.saldoDisponible}
        subtitle={`${porcentajeDisponible}% restante`}
        delay="0.15s"
        countDelay={700}
        progressValue={porcentajeDisponible}
        status={availableStatus}
      />
    </div>
  );
}
