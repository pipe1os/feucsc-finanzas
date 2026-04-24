import { Card } from "@heroui/react";
import { resumenFinanciero, formatCLP } from "@/lib/mockData";

const WalletIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
  subtitle: string;
  delay?: string;
}

function KPICard({
  title,
  value,
  icon,
  accent,
  subtitle,
  delay,
}: KPICardProps) {
  return (
    <Card
      className={`
        relative overflow-hidden rounded-2xl border p-5
        card-hover animate-fade-in-up opacity-0
        ${
          accent
            ? "border-red-200 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-apple-lg"
            : "border-gray-100 bg-white text-gray-900 shadow-apple"
        }
      `}
      variant="transparent"
      style={{ animationDelay: delay }}
    >
      {/* Decorative gradient orb for accent card */}
      {accent && (
        <div className="absolute -top-8 -right-8 size-24 rounded-full bg-white/10 blur-2xl" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span
            className={`text-xs font-medium tracking-wide uppercase ${accent ? "text-red-100" : "text-gray-400"}`}
          >
            {title}
          </span>
          <span
            className={`text-2xl font-bold tracking-tight ${accent ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </span>
        </div>
        <div
          className={`flex items-center justify-center size-10 rounded-xl
          ${accent ? "bg-white/20 text-white" : "bg-red-50 text-red-500"}
        `}
        >
          {icon}
        </div>
      </div>

      <div
        className={`mt-3 pt-3 border-t ${accent ? "border-white/20" : "border-gray-50"}`}
      >
        <span
          className={`text-xs font-medium ${accent ? "text-red-100" : "text-gray-400"}`}
        >
          {subtitle}
        </span>
      </div>
    </Card>
  );
}

export default function KPICards() {
  const porcentajeGastado = Math.round(
    (resumenFinanciero.totalGastado / resumenFinanciero.presupuestoTotal) * 100,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Presupuesto Total"
        value={formatCLP(resumenFinanciero.presupuestoTotal)}
        icon={<WalletIcon />}
        accent
        subtitle="Año académico 2026"
        delay="0.05s"
      />
      <KPICard
        title="Total Gastado"
        value={formatCLP(resumenFinanciero.totalGastado)}
        icon={<TrendDownIcon />}
        subtitle={`${porcentajeGastado}% del presupuesto utilizado`}
        delay="0.1s"
      />
      <KPICard
        title="Presupuesto Disponible"
        value={formatCLP(resumenFinanciero.saldoDisponible)}
        icon={<CheckCircleIcon />}
        subtitle={`${100 - porcentajeGastado}% restante`}
        delay="0.15s"
      />
    </div>
  );
}
