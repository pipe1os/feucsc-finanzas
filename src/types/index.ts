// ──────────────────────────────────────────────
// Tipos centrales del Portal de Transparencia
// ──────────────────────────────────────────────

export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  monto: number;
  comprobante: string | null;
}

/**
 * Categorías dinámicas — el admin puede crear nuevas.
 * "Otros" siempre existe como default.
 */
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
