"use client";

import { Card } from "@heroui/react";
import { gastosPorMes, formatCLP } from "@/lib/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-white px-4 py-3 shadow-apple-lg border border-gray-100 pointer-events-none">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">
          {formatCLP(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function ExpenseTrendChart() {
  return (
    <Card
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-apple animate-fade-in-up opacity-0"
      variant="transparent"
      style={{ animationDelay: "0.2s" }}
    >
      <Card.Header className="pb-6">
        <Card.Title className="text-base font-semibold text-gray-900">
          Tendencia de Gastos
        </Card.Title>
        <Card.Description className="text-xs text-gray-400">
          Evolución del gasto mensual a lo largo del año
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={gastosPorMes}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E30707" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E30707" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(value) => `$${value / 1000}k`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="#E30707"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMonto)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#E30707" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
}
