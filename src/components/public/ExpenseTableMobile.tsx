"use client";

import React from "react";
import { ListBox, Pagination } from "@heroui/react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatCLP } from "@/lib/utils";
import { motion } from "motion/react";
import type { TransaccionItem } from "./ExpenseTable";



const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

function isNew(creado_el?: string): boolean {
  if (!creado_el) return false;
  const created = new Date(creado_el).getTime();
  return Date.now() - created < 48 * 60 * 60 * 1000;
}

export interface ExpenseTableMobileProps {
  paginated: TransaccionItem[];
  filteredLength: number;
  hasActiveFilters: boolean;
  page: number;
  totalPages: number;
  start: number;
  end: number;
  onPageChange: (page: number) => void;
  onViewLightbox: (src: string, concepto: string) => void;
}

export function ExpenseTableMobile({
  paginated,
  filteredLength,
  hasActiveFilters,
  page,
  totalPages,
  start,
  end,
  onPageChange,
  onViewLightbox,
}: ExpenseTableMobileProps) {
  return (
    <div className="md:hidden">
      <ListBox
        aria-label="Gastos recientes"
        items={paginated}
        renderEmptyState={() => (
          <EmptyState
            title="Sin resultados"
            description={
              hasActiveFilters
                ? "No hay transacciones con los filtros seleccionados."
                : "La búsqueda no arrojó coincidencias."
            }
          />
        )}
      >
        {(txn: TransaccionItem) => {
          const catColor = txn.color || "#9CA3AF";
          return (
            <ListBox.Item
              key={txn.id}
              id={txn.id}
              textValue={txn.concepto}
              className="rounded-none px-0 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">
                    {txn.concepto}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white tabular-nums shrink-0">
                    {formatCLP(txn.monto)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${catColor}18`,
                      color: catColor,
                    }}
                  >
                    {txn.categoria}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDate(txn.fecha)}
                  </span>
                  {isNew(txn.creado_el) && (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                      Nuevo
                    </span>
                  )}
                  {txn.comprobante ? (
                    <motion.button type="button"
                      onClick={() => onViewLightbox(txn.comprobante, txn.concepto)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                      aria-label={`Ver comprobante de ${txn.concepto}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="size-3.5">
                        <EyeIcon />
                      </span>
                      Ver comprobante
                    </motion.button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                      <span className="size-3.5">
                        <EyeOffIcon />
                      </span>
                      Sin comprobante
                    </span>
                  )}
                </div>
              </div>
            </ListBox.Item>
          );
        }}
      </ListBox>

      {totalPages > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <span className="text-xs text-zinc-500 text-center">
            {start} a {end} de {filteredLength} resultados
          </span>
          <Pagination size="sm">
            <Pagination.Content className="justify-center">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => onPageChange(Math.max(1, page - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {page} / {totalPages}
              </span>
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() => onPageChange(Math.min(totalPages, page + 1))}
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}
