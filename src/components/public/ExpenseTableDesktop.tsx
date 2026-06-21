"use client";

import React from "react";
import { Table, Tooltip, EmptyState, Pagination, SortDescriptor } from "@heroui/react";
import { formatDate, formatCLP } from "@/lib/utils";
import type { TransaccionItem } from "./ExpenseTable";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

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

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center gap-1 cursor-pointer">
      {children}
      {!!sortDirection && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-transform duration-200 ease-out ${sortDirection === "descending" ? "rotate-180" : ""}`}
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      )}
    </span>
  );
}

function isNew(creado_el?: string): boolean {
  if (!creado_el) return false;
  const created = new Date(creado_el).getTime();
  return Date.now() - created < 48 * 60 * 60 * 1000;
}

export interface ExpenseTableDesktopProps {
  paginated: TransaccionItem[];
  filteredLength: number;
  hasActiveFilters: boolean;
  page: number;
  totalPages: number;
  start: number;
  end: number;
  onPageChange: (page: number) => void;
  onViewLightbox: (src: string, concepto: string) => void;
  sortDescriptor: SortDescriptor;
  onSortChange: (descriptor: SortDescriptor) => void;
  visiblePages: (number | "ellipsis")[];
}

export function ExpenseTableDesktop({
  paginated,
  filteredLength,
  hasActiveFilters,
  page,
  totalPages,
  start,
  end,
  onPageChange,
  onViewLightbox,
  sortDescriptor,
  onSortChange,
  visiblePages,
}: ExpenseTableDesktopProps) {
  return (
    <div className="hidden md:block">
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Tabla de transacciones recientes"
            className="min-w-165"
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
          >
            <Table.Header>
              <Table.Column allowsSorting isRowHeader id="fecha" className="w-30">
                {({ sortDirection }) => (
                  <SortableColumnHeader sortDirection={sortDirection}>
                    Fecha
                  </SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column id="concepto" className="min-w-60">
                Descripción
              </Table.Column>
              <Table.Column allowsSorting id="categoria" className="w-30">
                {({ sortDirection }) => (
                  <SortableColumnHeader sortDirection={sortDirection}>
                    Categoría
                  </SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="monto" className="w-32.5">
                {({ sortDirection }) => (
                  <SortableColumnHeader sortDirection={sortDirection}>
                    Monto
                  </SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column id="boleta" className="w-25 text-center">
                Boleta
              </Table.Column>
            </Table.Header>
            <Table.Body
              items={paginated}
              renderEmptyState={() => (
                <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700 shadow-xs">
                    <SearchIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Sin resultados
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5">
                      {hasActiveFilters
                        ? "No hay transacciones con los filtros seleccionados."
                        : "La búsqueda no arrojó coincidencias."}
                    </span>
                  </div>
                </EmptyState>
              )}
            >
              {(txn: TransaccionItem) => {
                const catColor = txn.color || "#9CA3AF";
                return (
                  <Table.Row key={txn.id}>
                    <Table.Cell>
                      <span className="text-sm text-zinc-600 whitespace-nowrap">
                        {formatDate(txn.fecha)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {txn.concepto}
                        </span>
                        {isNew(txn.creado_el) && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                            Nuevo
                          </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${catColor}18`,
                          color: catColor,
                        }}
                      >
                        {txn.categoria}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                        {formatCLP(txn.monto)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-center">
                        {txn.comprobante ? (
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <button type="button"
                                onClick={() => onViewLightbox(txn.comprobante, txn.concepto)}
                                className="inline-flex items-center justify-center size-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 hover:scale-105 active:scale-95"
                                aria-label={`Ver comprobante de ${txn.concepto}`}
                              >
                                <EyeIcon />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                              <p>Ver comprobante</p>
                            </Tooltip.Content>
                          </Tooltip>
                        ) : (
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <span className="inline-flex items-center justify-center size-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-100 dark:border-zinc-700">
                                <EyeOffIcon />
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                              <p>Comprobante pendiente</p>
                            </Tooltip.Content>
                          </Tooltip>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        {totalPages > 0 && (
          <Table.Footer>
            <Pagination size="sm">
              <Pagination.Summary>
                {start} a {end} de {filteredLength} resultados
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => onPageChange(Math.max(1, page - 1))}
                  >
                    <Pagination.PreviousIcon />
                    Ant.
                  </Pagination.Previous>
                </Pagination.Item>
                {visiblePages.map((p, idx) => {
                  if (p === "ellipsis") {
                    return (
                      // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                      <Pagination.Item key={`ellipsis-${idx}`}>
                        <span className="px-2 text-zinc-400 text-sm select-none">
                          …
                        </span>
                      </Pagination.Item>
                    );
                  }
                  return (
                    <Pagination.Item key={p}>
                      <Pagination.Link
                        isActive={p === page}
                        onPress={() => onPageChange(p as number)}
                      >
                        {p}
                      </Pagination.Link>
                    </Pagination.Item>
                  );
                })}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() => onPageChange(Math.min(totalPages, page + 1))}
                  >
                    Sig.
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </Table.Footer>
        )}
      </Table>
    </div>
  );
}
