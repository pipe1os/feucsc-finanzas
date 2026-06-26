"use client";

import { useMemo } from "react";
import { line as d3line, scaleLinear, curveMonotoneX } from "d3";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 24,
  strokeWidth = 1.5,
  className = "",
  color = "#e30707",
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return null;

    const xScale = scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    const yMin = Math.min(...data);
    const yMax = Math.max(...data);
    const yScale = scaleLinear()
      .domain([yMin * 0.95, yMax * 1.05])
      .range([height, 0]);

    const lineGenerator = d3line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(curveMonotoneX);

    return lineGenerator(data);
  }, [data, width, height]);

  if (!path) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
