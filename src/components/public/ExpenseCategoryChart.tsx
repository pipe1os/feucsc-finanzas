"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCLP } from "@/lib/utils";
import { PieChart, Pie, Cell } from "recharts";
import * as React from "react";

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

// Custom tooltip that matches the Apple design
function CustomTooltip({
  active,
  payload,
  totalGastado,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  totalGastado: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const pct =
    totalGastado > 0 ? Math.round((data.value / totalGastado) * 100) : 0;

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 px-4 py-3 shadow-apple-lg border border-gray-100 dark:border-gray-700 pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="text-xs font-semibold text-gray-900 dark:text-white">
          {data.name}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatCLP(data.value)}
        </span>
        <span className="text-[10px] font-medium text-gray-400">{pct}%</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Clic para filtrar</p>
    </div>
  );
}

export default function ExpenseCategoryChart({
  gastosPorCategoria,
  onCategoryClick,
  activeCategoryFilter,
}: ExpenseCategoryChartProps) {
  const totalGastado = gastosPorCategoria.reduce(
    (sum, item) => sum + item.monto,
    0,
  );

  const chartData = gastosPorCategoria.map((item) => ({
    name: item.categoria,
    value: item.monto,
    color: item.color,
    fill: item.color,
  }));

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Monto",
      },
    };
    gastosPorCategoria.forEach((item) => {
      config[item.categoria] = {
        label: item.categoria,
        color: item.color,
      };
    });
    return config;
  }, [gastosPorCategoria]);

  const handlePieClick = (data: { name?: string }) => {
    if (onCategoryClick && data.name) {
      // If clicking the already-active filter, clear it
      if (activeCategoryFilter === data.name) {
        onCategoryClick(""); // Will be treated as clear
      } else {
        onCategoryClick(data.name);
      }
    }
  };

  return (
    <Card
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple ring-0 animate-fade-in-up opacity-0"
      style={{ animationDelay: "0.25s" }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
          Distribución de Gastos
        </CardTitle>
        <CardDescription className="text-xs text-gray-400">
          Por categoría
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        <div className="relative h-48 w-48 **:outline-none">
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-48 w-48"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip totalGastado={totalGastado} />}
                /* Añadido zIndex: 100 para forzar que el tooltip flote por encima del texto absoluto */
                wrapperStyle={{ outline: "none", zIndex: 100 }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={300}
                animationDuration={1200}
                animationEasing="ease-out"
                strokeWidth={0}
                onClick={handlePieClick}
                cursor="pointer"
                className="outline-none"
              >
                {chartData.map((entry, index) => {
                  const isActive = activeCategoryFilter === entry.name;
                  const isDimmed =
                    activeCategoryFilter && activeCategoryFilter !== entry.name;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={isDimmed ? 0.3 : 1}
                      stroke={isActive ? entry.color : "none"}
                      strokeWidth={isActive ? 3 : 0}
                      className="outline-none"
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Añadido z-0 para asegurar que se quede por debajo del tooltip */}
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0 animate-scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCLP(totalGastado)}
            </span>
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Percentage breakdown */}
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
              <button
                key={item.categoria}
                onClick={() =>
                  onCategoryClick?.(isActive ? "" : item.categoria)
                }
                className={`flex items-center gap-3 w-full animate-fade-in-up opacity-0 cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-all duration-200
                  ${isActive ? "bg-gray-50 dark:bg-white/5" : "hover:bg-gray-50/60 dark:hover:bg-white/3"}
                  ${isDimmed ? "opacity-40" : ""}`}
                style={{ animationDelay: `${0.6 + index * 0.08}s` }}
              >
                <div
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 text-left">
                  {item.categoria}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full animate-bar-grow"
                      style={{
                        ["--bar-width" as string]: `${pct}%`,
                        backgroundColor: item.color,
                        animationDelay: `${0.8 + index * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
