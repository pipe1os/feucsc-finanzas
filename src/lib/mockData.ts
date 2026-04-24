import type { Gasto, ResumenFinanciero, GastosPorCategoria } from "@/types";

// ──────────────────────────────────────────────
// Resumen financiero
// ──────────────────────────────────────────────

export const resumenFinanciero: ResumenFinanciero = {
  presupuestoTotal: 12_500_000,
  totalGastado: 8_340_000,
  saldoDisponible: 4_160_000,
};

// ──────────────────────────────────────────────
// Gastos por categoría (para el gráfico donut)
// ──────────────────────────────────────────────

export const gastosPorCategoria: GastosPorCategoria[] = [
  { categoria: "Eventos", monto: 3_200_000, color: "#E30707" },
  { categoria: "Asambleas", monto: 1_850_000, color: "#F87171" },
  { categoria: "Materiales", monto: 1_420_000, color: "#A30505" },
  { categoria: "Servicios", monto: 980_000, color: "#FCA5A5" },
  { categoria: "Transporte", monto: 590_000, color: "#C80606" },
  { categoria: "Otros", monto: 300_000, color: "#7F0404" },
];

// ──────────────────────────────────────────────
// Gastos por mes (para el gráfico de área)
// ──────────────────────────────────────────────

export const gastosPorMes = [
  { mes: "Ene", monto: 1250000 },
  { mes: "Feb", monto: 945000 },
  { mes: "Mar", monto: 1983000 },
  { mes: "Abr", monto: 1520000 },
  { mes: "May", monto: 1100000 },
  { mes: "Jun", monto: 1800000 },
  { mes: "Jul", monto: 800000 },
  { mes: "Ago", monto: 2100000 },
  { mes: "Sep", monto: 2800000 },
  { mes: "Oct", monto: 1400000 },
  { mes: "Nov", monto: 1200000 },
  { mes: "Dic", monto: 900000 },
];

// ──────────────────────────────────────────────
// Transacciones individuales
// ──────────────────────────────────────────────

export const transacciones: Gasto[] = [
  {
    id: "TXN-001",
    fecha: "2025-04-15",
    concepto: "Producción Semana Mechona",
    categoria: "Eventos",
    monto: 850_000,
    comprobante: "#",
  },
  {
    id: "TXN-002",
    fecha: "2025-04-10",
    concepto: "Arriendo Salón Asamblea General",
    categoria: "Asambleas",
    monto: 320_000,
    comprobante: "#",
  },
  {
    id: "TXN-003",
    fecha: "2025-04-08",
    concepto: "Compra de pendones y lienzos",
    categoria: "Materiales",
    monto: 185_000,
    comprobante: "",
  },
  {
    id: "TXN-004",
    fecha: "2025-04-05",
    concepto: "Servicio de diseño gráfico",
    categoria: "Servicios",
    monto: 150_000,
    comprobante: "#",
  },
  {
    id: "TXN-005",
    fecha: "2025-03-28",
    concepto: "Transporte delegación triestamental",
    categoria: "Transporte",
    monto: 210_000,
    comprobante: "#",
  },
  {
    id: "TXN-006",
    fecha: "2025-03-22",
    concepto: "Coffee break Asamblea Extraordinaria",
    categoria: "Asambleas",
    monto: 95_000,
    comprobante: "#",
  },
  {
    id: "TXN-007",
    fecha: "2025-03-18",
    concepto: "Festival cultural de aniversario",
    categoria: "Eventos",
    monto: 1_200_000,
    comprobante: "#",
  },
  {
    id: "TXN-008",
    fecha: "2025-03-12",
    concepto: "Impresión folletos informativos",
    categoria: "Materiales",
    monto: 68_000,
    comprobante: "#",
  },
  {
    id: "TXN-009",
    fecha: "2025-03-05",
    concepto: "Servicio de sonido evento deportivo",
    categoria: "Servicios",
    monto: 420_000,
    comprobante: "#",
  },
  {
    id: "TXN-010",
    fecha: "2025-02-28",
    concepto: "Insumos de oficina FEUCSC",
    categoria: "Otros",
    monto: 45_000,
    comprobante: "",
  },
  {
    id: "TXN-011",
    fecha: "2025-02-20",
    concepto: "Bus Jornada de Inducción San Pedro",
    categoria: "Transporte",
    monto: 380_000,
    comprobante: "#",
  },
  {
    id: "TXN-012",
    fecha: "2025-02-15",
    concepto: "Merchandising bienvenida novatos",
    categoria: "Materiales",
    monto: 520_000,
    comprobante: "#",
  },
];

// ──────────────────────────────────────────────
// Helpers de formato
// ──────────────────────────────────────────────

export function formatCLP(monto: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(monto);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
