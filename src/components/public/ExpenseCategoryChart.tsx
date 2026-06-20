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
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Cell, Pie, PieChart } from "recharts";
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
    <div className="rounded-xl bg-white px-4 py-3 shadow-xs border border-zinc-200/80 pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="text-xs font-semibold text-zinc-900">
          {data.name}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-zinc-900">
          {formatCLP(data.value)}
        </span>
        <span className="text-[10px] font-medium text-zinc-400">{pct}%</span>
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">Clic para filtrar</p>
    </div>
  );
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

  const chartData = React.useMemo(
    () =>
      gastosPorCategoria.map((item) => ({
        name: item.categoria,
        value: item.monto,
        color: item.color,
        fill: item.color,
      })),
    [gastosPorCategoria],
  );

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
      if (activeCategoryFilter === data.name) {
        onCategoryClick("");
      } else {
        onCategoryClick(data.name);
      }
    }
  };

  return (
    <Card
      className="rounded-2xl border border-zinc-100 bg-white shadow-apple ring-0"
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
        <div className="relative size-48 **:outline-none">
          <ChartContainer
            config={chartConfig}
            className="aspect-square size-48"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip totalGastado={totalGastado} />}
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
                {chartData.map((entry) => {
                  const isActive = activeCategoryFilter === entry.name;
                  const isDimmed =
                    activeCategoryFilter && activeCategoryFilter !== entry.name;
                  return (
                    <Cell
                      key={entry.name}
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
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0 animate-scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-sm font-bold text-zinc-900">
              {formatCLP(totalGastado)}
            </span>
            <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">
              Total
            </span>
          </div>
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
              <button type="button"
                key={item.categoria}
                onClick={() =>
                  onCategoryClick?.(isActive ? "" : item.categoria)
                }
                className={`flex items-center gap-3 w-full cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-all duration-200
                  ${isActive ? "bg-zinc-50" : "hover:bg-zinc-50/60"}
                  ${isDimmed ? "opacity-40" : ""}`}
                style={{ animationDelay: `${0.6 + index * 0.08}s` }}
              >
                <div
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs text-zinc-600 text-left">
                  {item.categoria}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block h-1.5 w-16 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full animate-bar-grow"
                      style={{
                        ["--bar-width" as string]: `${pct}%`,
                        backgroundColor: item.color,
                        animationDelay: `${0.8 + index * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 w-8 text-right">
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
