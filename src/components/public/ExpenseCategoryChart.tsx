"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";
import * as React from "react";
import { pie, arc, PieArcDatum } from "d3";
import { m, LazyMotion, domAnimation } from "motion/react";

interface CategoriaData {
  categoria: string;
  monto: number;
  color: string;
}

interface ExpenseCategoryChartProps {
  gastosPorCategoria: CategoriaData[];
  onCategoryClick?: (category: string) => void;
  activeCategoryFilter?: string | null;
}

export default function ExpenseCategoryChart({
  gastosPorCategoria,
  onCategoryClick,
  activeCategoryFilter,
}: ExpenseCategoryChartProps) {
  const totalGastado = React.useMemo(
    () => gastosPorCategoria.reduce((sum, item) => sum + item.monto, 0),
    [gastosPorCategoria],
  );

  // Chart dimensions
  const radius = 100;
  const gap = 0.02;

  const pieLayout = React.useMemo(() => pie<CategoriaData>()
    .sort(null)
    .value((d) => d.monto)
    .padAngle(gap), [gap]);

  const arcGenerator = React.useMemo(() => arc<PieArcDatum<CategoriaData>>()
    .innerRadius(60)
    .outerRadius(radius)
    .cornerRadius(6), [radius]);

  const labelRadius = 80;
  const arcLabel = React.useMemo(() => arc<PieArcDatum<CategoriaData>>().innerRadius(labelRadius).outerRadius(labelRadius), [labelRadius]);

  const arcs = React.useMemo(() => pieLayout(gastosPorCategoria), [pieLayout, gastosPorCategoria]);

  const computeAngle = React.useCallback((d: PieArcDatum<CategoriaData>) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  }, []);

  const MIN_ANGLE = 20;

  return (
    <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/5 p-2 h-full">
    <Card
      className="rounded-[calc(2rem-0.5rem)] border border-transparent dark:border-white/5 bg-white dark:bg-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_32px_-4px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-0 h-full flex flex-col"
      style={{ animationDelay: "0.25s" }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-zinc-900 font-heading">
          Distribución de Gastos
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Por categoría
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        <LazyMotion features={domAnimation}>
        <div className="relative size-56 **:outline-none flex items-center justify-center">
          <svg
            viewBox={`-${radius * 1.25} -${radius * 1.25} ${radius * 2.5} ${radius * 2.5}`}
            className="overflow-visible w-full h-full"
          >
            {arcs.map((d) => {
              const isActive = activeCategoryFilter === d.data.categoria;
              const isDimmed = activeCategoryFilter && activeCategoryFilter !== d.data.categoria;
              
              return (
                 <g 
                   key={d.data.categoria} 
                   onClick={() => {
                     if (onCategoryClick) {
                       onCategoryClick(d.data.categoria);
                     }
                   }}
                   style={{ cursor: "pointer", opacity: isDimmed ? 0.3 : 1 }}
                   className="transition-opacity duration-200"
                 >
                    <m.path 
                      fill={d.data.color} 
                      d={arcGenerator(d)!} 
                      stroke={isActive ? d.data.color : "none"}
                      strokeWidth={isActive ? 4 : 0}
                      className="transition-all duration-200 outline-none"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: d.index * 0.08 }}
                    />
                  </g>
              );
            })}

            {arcs.map((d: PieArcDatum<CategoriaData>) => {
              const angle = computeAngle(d);
              if (angle <= MIN_ANGLE) return null;

              const [x, y] = arcLabel.centroid(d);
              const pct = totalGastado > 0 ? Math.round((d.data.monto / totalGastado) * 100) : 0;
              const isDimmed = activeCategoryFilter && activeCategoryFilter !== d.data.categoria;

              return (
                <m.text
                  key={d.data.categoria}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="white"
                  fontSize="10.5px"
                  fontWeight="bold"
                  className="pointer-events-none transition-opacity duration-200"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isDimmed ? 0.3 : 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: d.index * 0.08 + 0.3 }}
                >
                  {pct}%
                </m.text>
              );
            })}
          </svg>

          <m.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
          >
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {formatCLP(totalGastado)}
            </span>
            <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">
              Total
            </span>
          </m.div>
        </div>

        <div className="w-full space-y-3">
          {gastosPorCategoria.map((item, index) => {
            const pct =
              totalGastado > 0
                ? Math.round((item.monto / totalGastado) * 100)
                : 0;
            const isActive = activeCategoryFilter === item.categoria;
            const isDimmed =
              activeCategoryFilter && activeCategoryFilter !== item.categoria;
            return (
              <m.button type="button"
                key={item.categoria}
                aria-pressed={isActive}
                onClick={() =>
                  onCategoryClick?.(item.categoria)
                }
                className={`flex items-center gap-3 w-full cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-all duration-200
                  ${isActive ? "bg-zinc-50 dark:bg-white/10" : "hover:bg-zinc-50/60 dark:hover:bg-white/5"}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isDimmed ? 0.4 : 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 + index * 0.08 }}
              >
                <div
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs text-zinc-600 dark:text-zinc-300 text-left">
                  {item.categoria}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block h-1.5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <m.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + index * 0.08 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </m.button>
            );
          })}
        </div>
        </LazyMotion>
      </CardContent>
    </Card>
    </div>
  );
}
