"use client";

import { formatCLP } from "@/lib/utils";
import { useState, useCallback, useRef, useEffect } from "react";

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
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

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

interface TooltipPayload {
  payload: TrendDataPoint;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    const topCats = (dataPoint?.categorias || []).slice(0, 3);

    return (
      <div className="rounded-xl sm:rounded-2xl bg-white/50 dark:bg-zinc-900/60 backdrop-blur-2xl px-3 py-2 sm:px-5 sm:py-4 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-zinc-300/60 dark:border-white/10 min-w-36 sm:min-w-48">
        <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          {label} 2026
        </p>
        <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
          {formatCLP(payload[0].value)}
        </p>
        {topCats.length > 0 && (
          <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-zinc-200/50 dark:border-white/10 flex flex-col gap-1 sm:gap-2">
            {topCats.map((cat) => (
              <div
                key={cat.categoria}
                className="flex items-center gap-2 text-[10px] sm:text-xs"
              >
                <span
                  className="size-1.5 sm:size-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                  {cat.categoria}
                </span>
                <span className="text-zinc-900 dark:text-white font-medium tabular-nums">
                  {formatCompact(cat.monto)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}

interface ManualTooltipProps {
  data: TrendDataPoint | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

function ManualTooltip({ data, position, onClose }: ManualTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const stableOnClose = useRef(onClose);
  useEffect(() => {
    stableOnClose.current = onClose;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        stableOnClose.current();
      }
    };

    if (data) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [data]);

  if (!data || !position) return null;

  const topCats = (data.categorias || []).slice(0, 3);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-zinc-900/60 backdrop-blur-2xl px-3 py-2 sm:px-5 sm:py-4 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-zinc-300/60 dark:border-white/10 min-w-36 sm:min-w-48 max-w-[90vw] animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%) translateY(-12px)",
      }}
    >
      <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {data.mes} 2026
      </p>
      <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
        {formatCLP(data.monto)}
      </p>
      {topCats.length > 0 && (
        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-zinc-200/50 dark:border-white/10 flex flex-col gap-1 sm:gap-2">
          {topCats.map((cat) => (
            <div
              key={cat.categoria}
              className="flex items-center gap-2 text-[10px] sm:text-xs"
            >
              <span
                className="size-1.5 sm:size-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                {cat.categoria}
              </span>
              <span className="text-zinc-900 dark:text-white font-medium tabular-nums">
                {formatCompact(cat.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const chartConfig = {
  monto: {
    label: "Gasto",
    color: "#E30707",
  },
} satisfies ChartConfig;

export default function ExpenseTrendChart({
  gastosPorMes,
}: ExpenseTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [manualTooltip, setManualTooltip] = useState<{
    data: TrendDataPoint | null;
    position: { x: number; y: number } | null;
  }>({ data: null, position: null });
  const chartRef = useRef<HTMLDivElement>(null);

  const handleChartClick = useCallback(
    (state: { activeTooltipIndex?: unknown }) => {
      const index = state.activeTooltipIndex;
      if (typeof index === "number" && chartRef.current) {
        const data = gastosPorMes[index];
        const rect = chartRef.current.getBoundingClientRect();

        const xPercent = index / (gastosPorMes.length - 1 || 1);
        const x = rect.left + rect.width * xPercent;
        const y = rect.top + rect.height / 2;

        setManualTooltip({ data, position: { x, y } });
        setActiveIndex(index);
      }
    },
    [gastosPorMes],
  );

  const closeManualTooltip = useCallback(() => {
    setManualTooltip({ data: null, position: null });
    setActiveIndex(null);
  }, []);

  return (
    <Card className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-apple ring-0 h-full flex flex-col min-h-80 sm:min-h-90 lg:min-h-75">
      <CardHeader className="pb-6">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white font-heading">
          Tendencia de Gastos
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          Gasto mensual a lo largo del año
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <div
          ref={chartRef}
          className="flex-1 w-full relative **:outline-none min-h-0"
        >
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full flex-1"
          >
            <AreaChart
              data={gastosPorMes}
              margin={{ top: 10, right: 10, left: 16, bottom: 0 }}
              onClick={handleChartClick}
            >
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-monto)"
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-monto)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    const millions = (value / 1000000)
                      .toFixed(1)
                      .replace(".", ",")
                      .replace(/,0$/, "");
                    return `$${millions}M`;
                  } else if (value > 0) {
                    const thousands = Math.round(value / 1000).toLocaleString(
                      "es-CL",
                    );
                    return `$${thousands}K`;
                  }
                  return "$0";
                }}
                dx={-8}
                width={36}
              />
              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#9CA3AF",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="var(--color-monto)"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorMonto)"
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={1400}
                animationEasing="ease-in-out"
                activeDot={(props) => {
                  const isActive = props.index === activeIndex;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isActive ? 8 : 6}
                      fill="#E30707"
                      stroke="white"
                      strokeWidth={2}
                      style={{
                        cursor: "pointer",
                        filter: isActive
                          ? "drop-shadow(0 2px 4px rgba(227, 7, 7, 0.4))"
                          : "none",
                      }}
                    />
                  );
                }}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
          <ManualTooltip
            data={manualTooltip.data}
            position={manualTooltip.position}
            onClose={closeManualTooltip}
          />
        </div>
      </CardContent>
    </Card>
  );
}
