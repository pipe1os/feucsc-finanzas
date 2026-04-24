"use client";

import { Card } from "@heroui/react";
import { gastosPorCategoria, formatCLP } from "@/lib/mockData";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

// Map data for Recharts PieChart — fill is set directly for v3 compat
const chartData = gastosPorCategoria.map((item) => ({
  name: item.categoria,
  value: item.monto,
  color: item.color,
  fill: item.color,
}));

// Custom tooltip that matches the Apple design
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const totalGastado = gastosPorCategoria.reduce(
    (sum, item) => sum + item.monto,
    0,
  );
  const pct = Math.round((data.value / totalGastado) * 100);

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-apple-lg border border-gray-100 pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="text-xs font-semibold text-gray-900">{data.name}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-gray-900">
          {formatCLP(data.value)}
        </span>
        <span className="text-[10px] font-medium text-gray-400">{pct}%</span>
      </div>
    </div>
  );
}

export default function ExpenseCategoryChart() {
  const totalGastado = gastosPorCategoria.reduce(
    (sum, item) => sum + item.monto,
    0,
  );

  return (
    <Card
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-apple
                 animate-fade-in-up opacity-0"
      variant="transparent"
      style={{ animationDelay: "0.25s" }}
    >
      <Card.Header className="pb-4">
        <Card.Title className="text-base font-semibold text-gray-900">
          Gastos por Categoría
        </Card.Title>
        <Card.Description className="text-xs text-gray-400">
          Distribución del gasto acumulado
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col items-center gap-6">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                strokeWidth={0}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
                /* Añadido zIndex: 100 para forzar que el tooltip flote por encima del texto absoluto */
                wrapperStyle={{ outline: "none", zIndex: 100 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Añadido z-0 para asegurar que se quede por debajo del tooltip */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0">
            <span className="text-sm font-bold text-gray-900">
              {formatCLP(totalGastado)}
            </span>
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Percentage breakdown */}
        <div className="w-full space-y-3">
          {gastosPorCategoria.map((item) => {
            const pct = Math.round((item.monto / totalGastado) * 100);
            return (
              <div key={item.categoria} className="flex items-center gap-3">
                <div
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs text-gray-600">
                  {item.categoria}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
