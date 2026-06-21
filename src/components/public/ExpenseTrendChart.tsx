"use client";

import { formatCLP } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { scaleLinear, line as d3line, max, area as d3area, curveMonotoneX } from "d3";
import { m, LazyMotion, domAnimation } from "motion/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className="rounded-xl sm:rounded-2xl bg-white/50 backdrop-blur-2xl px-3 py-2 sm:px-5 sm:py-4 shadow-2xl shadow-black/5 border border-zinc-300/60 min-w-36 sm:min-w-48">
        <p className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-1">
          {label} 2026
        </p>
        <p className="text-base sm:text-lg font-bold text-zinc-900 tabular-nums">
          {formatCLP(payload[0].value)}
        </p>
        {topCats.length > 0 && (
          <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-zinc-200/50 flex flex-col gap-1 sm:gap-2">
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
  }
  return null;
}

// Removed ManualTooltip as it's now unified

export default function ExpenseTrendChart({
  gastosPorMes,
}: ExpenseTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipState, setTooltipState] = useState<{
    data: TrendDataPoint | null;
    position: { x: number; y: number } | null;
    transform: string;
  }>({ data: null, position: null, transform: "" });
  
  const chartRef = useRef<HTMLDivElement>(null);
  const isTouch = useRef(false);

  useEffect(() => {
    if (!tooltipState.data || !isTouch.current) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
        setTooltipState({ data: null, position: null, transform: "" });
        isTouch.current = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [tooltipState.data]);

  const xScale = scaleLinear()
    .domain([0, Math.max(1, gastosPorMes.length - 1)])
    .range([0, 100]);

  const yMax = max(gastosPorMes.map((d) => d.monto)) ?? 0;
  const yScale = scaleLinear()
    .domain([0, yMax * 1.1])
    .range([100, 0]);

  const line = d3line<TrendDataPoint>()
    .x((d, i) => xScale(i))
    .y((d) => yScale(d.monto))
    .curve(curveMonotoneX);

  const area = d3area<TrendDataPoint>()
    .x((d, i) => xScale(i))
    .y0(yScale(0))
    .y1((d) => yScale(d.monto))
    .curve(curveMonotoneX);

  const areaPath = area(gastosPorMes) ?? undefined;
  const dPath = line(gastosPorMes);

  const getTooltipTransform = (index: number, yValue: number, isManual = false) => {
    let xOffset = "-50%";
    let xPixel = "0px";
    const xPercent = xScale(index);
    
    if (xPercent < 30) {
      xOffset = "0%";
      xPixel = "12px";
    } else if (xPercent > 70) {
      xOffset = "-100%";
      xPixel = "-12px";
    }

    const yPercent = yScale(yValue);
    const gap = isManual ? 12 : 16;
    
    if (yPercent < 25) {
      return `translate(calc(${xOffset} + ${xPixel}), 0%) translateY(${gap}px)`;
    }
    return `translate(calc(${xOffset} + ${xPixel}), -100%) translateY(-${gap}px)`;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!chartRef.current || gastosPorMes.length === 0) return;
    if (e.pointerType === "touch") isTouch.current = true;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(percent * (gastosPorMes.length - 1));
    setActiveIndex(index);

    const data = gastosPorMes[index];
    const xPercent = index / (gastosPorMes.length - 1 || 1);
    const tooltipX = rect.left + rect.width * xPercent;
    const tooltipY = rect.top + rect.height * (yScale(data.monto) / 100);
    const transform = getTooltipTransform(index, data.monto, e.pointerType === "touch" || isTouch.current);

    setTooltipState({ data, position: { x: tooltipX, y: tooltipY }, transform });
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch" && !isTouch.current) {
      setActiveIndex(null);
      setTooltipState({ data: null, position: null, transform: "" });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
  };

// removed closeManualTooltip

  return (
    <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/5 p-2 h-full">
      <Card className="rounded-[calc(2rem-0.5rem)] border border-transparent dark:border-white/5 bg-white dark:bg-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_32px_-4px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-0 h-full flex flex-col min-h-80 sm:min-h-90 lg:min-h-75">
        <CardHeader className="pb-6">
        <CardTitle className="text-base font-semibold text-zinc-900 font-heading">
          Tendencia de Gastos
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Gasto mensual a lo largo del año
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        <div className="relative flex-1 w-full flex flex-row">
          {/* Y axis */}
          <div className="w-10 sm:w-12 shrink-0 relative pb-6 border-r border-zinc-100/50 mr-2">
            {yScale.ticks(5).map((value) => {
              if (value === 0) return null;
              return (
                <div
                  key={`y-tick-${value}`}
                  style={{
                    top: `${yScale(+value)}%`,
                  }}
                  className="absolute right-2 text-[10px] sm:text-xs tabular-nums text-zinc-400 -translate-y-1/2"
                >
                  {formatCompact(+value)}
                </div>
              );
            })}
          </div>

          <div className="relative flex-1 pb-6 flex flex-col min-h-0">
            {/* Chart interactive area */}
            <div
              ref={chartRef}
              className="absolute inset-0 bottom-6 w-full touch-pan-y"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onPointerDown={handlePointerDown}
            >
              <LazyMotion features={domAnimation}>
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                <defs>
                  <linearGradient id="outlinedAreaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#E30707" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E30707" stopOpacity={0} />
                  </linearGradient>
                  <clipPath id="chartClip">
                    <m.rect
                      x="0"
                      y="-10"
                      height="120"
                      initial={{ width: 0 }}
                      animate={{ width: 100 }}
                      transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
                    />
                  </clipPath>
                </defs>

                {/* Grid Lines */}
                {yScale.ticks(5).map((value, i) => (
                  <line
                    key={`grid-${i}`}
                    x1="0"
                    y1={yScale(+value)}
                    x2="100"
                    y2={yScale(+value)}
                    stroke="#E5E7EB"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                <g clipPath="url(#chartClip)">
                  <path d={areaPath} fill="url(#outlinedAreaGradient)" />

                  <path
                    d={dPath!}
                    fill="none"
                    stroke="#E30707"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              </svg>
              </LazyMotion>

              {/* Active Dot */}
              {activeIndex !== null && activeIndex < gastosPorMes.length && (
                <div
                  className="absolute size-3 sm:size-3.5 rounded-full bg-[#E30707] border-2 border-white shadow-md pointer-events-none transition-all duration-75"
                  style={{
                    left: `${xScale(activeIndex)}%`,
                    top: `${yScale(gastosPorMes[activeIndex].monto)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}

              {/* Unified Tooltip */}
              {tooltipState.data !== null && tooltipState.position !== null && (
                <div
                  className="fixed pointer-events-none z-50 transition-transform duration-100"
                  style={{
                    left: tooltipState.position.x,
                    top: tooltipState.position.y,
                    transform: tooltipState.transform,
                  }}
                >
                  <CustomTooltip
                    active={true}
                    payload={[
                      {
                        payload: tooltipState.data,
                        value: tooltipState.data.monto,
                      },
                    ]}
                    label={tooltipState.data.mes}
                  />
                </div>
              )}
            </div>

            {/* X axis */}
            <div className="absolute bottom-0 left-0 right-0 h-6">
              {gastosPorMes.map((d, i) => (
                <div
                  key={`x-tick-${d.mes}`}
                  style={{
                    left: `${xScale(i)}%`,
                  }}
                  className="absolute top-1 text-[10px] sm:text-xs text-zinc-400 -translate-x-1/2"
                >
                  {d.mes}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

    </Card>
    </div>
  );
}
