"use client";

import { Table, ListBox } from "@heroui/react";
import { formatDate, formatCLP } from "@/lib/utils";
import Link from "next/link";

interface Transaction {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  color: string;
  monto: number;
}

interface LatestTransactionsPreviewProps {
  transactions: Transaction[];
  totalCount: number;
}

export default function LatestTransactionsPreview({
  transactions,
  totalCount,
}: LatestTransactionsPreviewProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-xs dark:shadow-none overflow-hidden">
      {/* Preview header */}
      <div className="px-6 pt-5 pb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white font-heading">
          Últimos Gastos
        </h2>
      </div>

      {/* Mobile ListBox view - hidden on desktop */}
      <div className="md:hidden px-5">
        <ListBox
          aria-label="Últimos gastos"
          items={transactions}
          renderEmptyState={() => (
            <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 shadow-xs">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Sin resultados
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  No hay transacciones recientes.
                </span>
              </div>
            </div>
          )}
        >
          {(txn: Transaction) => {
            const catColor = txn.color || "#9CA3AF";
            return (
              <ListBox.Item
                key={txn.id}
                id={txn.id}
                textValue={txn.concepto}
                className="rounded-none px-0 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {txn.concepto}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums shrink-0">
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
                    <span className="text-xs text-gray-500">
                      {formatDate(txn.fecha)}
                    </span>
                  </div>
                </div>
              </ListBox.Item>
            );
          }}
        </ListBox>
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block">
        <Table variant="secondary" className="w-full px-5">
          <Table.ScrollContainer>
            <Table.Content aria-label="Últimos gastos">
              <Table.Header>
                <Table.Column
                  isRowHeader
                  className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase"
                >
                  Fecha
                </Table.Column>
                <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Descripción
                </Table.Column>
                <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Categoría
                </Table.Column>
                <Table.Column className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Monto
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {transactions.map((txn) => (
                  <Table.Row
                    key={txn.id}
                    className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors duration-150"
                  >
                    <Table.Cell className="px-4 py-2">
                      <span className="text-gray-500 whitespace-nowrap">
                        {formatDate(txn.fecha)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {txn.concepto}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-2">
                      <span
                        className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${txn.color}18`,
                          color: txn.color,
                        }}
                      >
                        {txn.categoria}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-2 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                        {formatCLP(txn.monto)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Footer with CTA */}
      <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {totalCount} registros en total
        </span>
        <Link
          href="/gastos"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
        >
          Ver todos los gastos
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
