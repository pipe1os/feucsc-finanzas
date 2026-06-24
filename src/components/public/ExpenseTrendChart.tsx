"use client";

import { useMemo } from "react";
import { formatCLP } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import XAxis from "@/components/charts/x-axis";
import YAxis from "@/components/charts/y-axis";
import ChartTooltip from "@/components/charts/tooltip/chart-tooltip";

interface CategoryBreakdown {
  categoria: string;
  monto: number;
  color: string;
}

interface TrendDataPoint {
  mes: string;
  monto: number;
  categorias?: CategoryBreakdown[];
}

interface ExpenseTrendChartProps {
  gastosPorMes: TrendDataPoint[];
}

function formatCompact(value: number): string {
  if (value >= 1000000) {
    const millions = (value / 1000000)
      .toFixed(1)
      .replace(".", ",")
      .replace(/,0$/, "");
    return `$${millions}M`;
  } else if (value >= 1000) {
    const thousands = Math.round(value / 1000).toLocaleString("es-CL");
    return `$${thousands}K`;
  }
  return formatCLP(value);
}

export default function ExpenseTrendChart({
  gastosPorMes,
}: ExpenseTrendChartProps) {
  const chartData = useMemo(() => {
    return gastosPorMes.map((d, index) => ({
      ...d,
      date: new Date(2026, index, 1),
    }));
  }, [gastosPorMes]);

  return (
    <Card className="rounded-2xl border border-border bg-white shadow-apple ring-0 h-full flex flex-col min-h-80 sm:min-h-90 lg:min-h-75">
      <CardHeader className="pb-6">
        <CardTitle className="text-base font-semibold text-zinc-900 font-heading">
          Tendencia de Gastos
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Gasto mensual a lo largo del año
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        <div className="relative flex-1 w-full min-h-0">
          <AreaChart
            data={chartData}
            xDataKey="date"
            aspectRatio="auto"
            className="h-full"
            margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
          >
            <Grid horizontal />
            <Area
              dataKey="monto"
              stroke="#E30707"
              fill="#E30707"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <XAxis />
            <YAxis formatValue={formatCompact} />
            <ChartTooltip
              className="shadow-apple-lg"
              panelStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(212, 212, 216, 0.6)",
                borderRadius: "16px",
                padding: "0px",
              }}
              content={({ point }) => {
                const dataPoint = point as unknown as TrendDataPoint;
                const topCats = (dataPoint?.categorias || []).slice(0, 3);
                return (
                  <div className="px-3 py-2 sm:px-5 sm:py-4 min-w-36 sm:min-w-48 text-zinc-900">
                    <p className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-1">
                      {dataPoint.mes} 2026
                    </p>
                    <p className="text-base sm:text-lg font-bold text-zinc-900 tabular-nums">
                      {formatCLP(dataPoint.monto)}
                    </p>
                    {topCats.length > 0 && (
                      <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-border/50 flex flex-col gap-1 sm:gap-2">
                        {topCats.map((cat) => (
                          <div
                            key={cat.categoria}
                            className="flex items-center gap-2 text-[10px] sm:text-xs"
                          >
                            <span
                              className="size-1.5 sm:size-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-zinc-600 flex-1 truncate">
                              {cat.categoria}
                            </span>
                            <span className="text-zinc-900 font-medium tabular-nums">
                              {formatCompact(cat.monto)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}
