export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  monto: number;
  comprobante: string | null;
}

export type CategoriaGasto = string;

export interface ResumenFinanciero {
  presupuestoTotal: number;
  totalGastado: number;
  saldoDisponible: number;
}

export interface GastosPorCategoria {
  categoria: CategoriaGasto;
  monto: number;
  color: string;
}
