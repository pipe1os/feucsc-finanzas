"use client";

import { Card } from "@heroui/react";
import { formatCLP } from "@/lib/utils";
import { useState, useCallback, useRef, useEffect } from "react";

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

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCompact(value: number): string {
  if (value >= 1000000) {
    // Formato CLP: $1,5M (coma como separador decimal)
    const millions = (value / 1000000).toFixed(1).replace(".", ",").replace(/,0$/, "");
    return `$${millions}M`;
  } else if (value >= 1000) {
    // Formato CLP: $750K (miles con punto, K mayúscula)
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
      <div className="rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 py-3 shadow-lg border border-gray-100 dark:border-gray-700 min-w-45">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-1">
          {label} 2026
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
          {formatCLP(payload[0].value)}
        </p>
        {topCats.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1.5">
            {topCats.map((cat) => (
              <div
                key={cat.categoria}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-gray-500 dark:text-gray-300 flex-1 truncate">
                  {cat.categoria}
                </span>
                <span className="text-gray-900 dark:text-white font-medium tabular-nums">
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

// Tooltip manual para móvil (click)
interface ManualTooltipProps {
  data: TrendDataPoint | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

function ManualTooltip({ data, position, onClose }: ManualTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (data) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [data, onClose]);

  if (!data || !position) return null;

  const topCats = (data.categorias || []).slice(0, 3);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 py-3 shadow-lg border border-gray-100 dark:border-gray-700 min-w-45 animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%) translateY(-12px)",
      }}
    >
      <p className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-1">
        {data.mes} 2026
      </p>
      <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
        {formatCLP(data.monto)}
      </p>
      {topCats.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1.5">
          {topCats.map((cat) => (
            <div key={cat.categoria} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-gray-500 dark:text-gray-300 flex-1 truncate">
                {cat.categoria}
              </span>
              <span className="text-gray-900 dark:text-white font-medium tabular-nums">
                {formatCompact(cat.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => {
      const index = state?.activeTooltipIndex;
      if (typeof index === "number" && chartRef.current) {
        const data = gastosPorMes[index];
        const rect = chartRef.current.getBoundingClientRect();

        // Calcular posición aproximada basada en el índice
        const xPercent = index / (gastosPorMes.length - 1 || 1);
        const x = rect.left + rect.width * xPercent;
        const y = rect.top + rect.height / 2;

        setManualTooltip({ data, position: { x, y } });
        setActiveIndex(index);
      }
    },
    [gastosPorMes]
  );

  const closeManualTooltip = useCallback(() => {
    setManualTooltip({ data: null, position: null });
    setActiveIndex(null);
  }, []);

  return (
    <Card
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-apple animate-fade-in-up opacity-0"
      variant="transparent"
      style={{ animationDelay: "0.2s" }}
    >
      <Card.Header className="pb-6">
        <Card.Title className="text-base font-semibold text-gray-900 dark:text-white">
          Tendencia de Gastos
        </Card.Title>
        <Card.Description className="text-xs text-gray-400 dark:text-gray-500">
          Gasto mensual a lo largo del año
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <div ref={chartRef} className="h-75 w-full relative **:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={gastosPorMes}
              margin={{ top: 10, right: 10, left: 16, bottom: 0 }}
              onClick={handleChartClick}
            >
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#E24B4A"
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="95%"
                    stopColor="#E24B4A"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                    // Formato CLP: $1,5M (coma como separador decimal)
                    const millions = (value / 1000000).toFixed(1).replace(".", ",").replace(/,0$/, "");
                    return `$${millions}M`;
                  } else if (value > 0) {
                    // Formato CLP: $750K (miles con punto, K mayúscula)
                    const thousands = Math.round(value / 1000).toLocaleString("es-CL");
                    return `$${thousands}K`;
                  }
                  return "$0";
                }}
                dx={-8}
                width={36}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--border-color)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="#E24B4A"
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
                      fill="#E24B4A"
                      stroke="white"
                      strokeWidth={2}
                      style={{
                        cursor: "pointer",
                        filter: isActive ? "drop-shadow(0 2px 4px rgba(226, 75, 74, 0.4))" : "none",
                      }}
                    />
                  );
                }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <ManualTooltip
            data={manualTooltip.data}
            position={manualTooltip.position}
            onClose={closeManualTooltip}
          />
        </div>
      </Card.Content>
    </Card>
  );
}
