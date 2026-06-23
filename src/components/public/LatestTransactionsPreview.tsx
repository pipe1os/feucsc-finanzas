"use client";

import { Table, ListBox } from"@heroui/react";
import { formatDate, formatCLP } from"@/lib/utils";
import Link from"next/link";
import { EmptyState } from"@/components/ui/empty-state";

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
 <div className="rounded-2xl border border-border bg-surface shadow-apple overflow-hidden">
 <div className="px-6 pt-5 pb-4">
 <h2 className="text-base font-semibold text-gray-900 font-heading">
 Últimos Gastos
 </h2>
 </div>

 <div className="md:hidden px-5">
 <ListBox
 aria-label="Últimos gastos"
 items={transactions}
 renderEmptyState={() => (
 <EmptyState
 title="Sin resultados"
 description="No hay transacciones recientes."
 />
 )}
 >
 {(txn: Transaction) => {
 const catColor = txn.color ||"#9CA3AF";
 return (
 <ListBox.Item
 key={txn.id}
 id={txn.id}
 textValue={txn.concepto}
 className="rounded-none px-0 py-3"
 >
 <div className="flex flex-col gap-1 w-full">
 <div className="flex items-start justify-between gap-2">
 <span className="text-sm font-medium text-gray-900 line-clamp-2">
 {txn.concepto}
 </span>
 <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
 {formatCLP(txn.monto)}
 </span>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <span
 className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800"
 style={{
 backgroundColor:`${catColor}18`,
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

 <div className="hidden md:block">
 <Table variant="secondary" className="w-full px-5 [&_tr]:border-none [&_td]:border-none">
 <Table.ScrollContainer>
 <Table.Content aria-label="Últimos gastos">
 <Table.Header>
 <Table.Column
 isRowHeader
 className="text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase"
 >
 Fecha
 </Table.Column>
 <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
 Descripción
 </Table.Column>
 <Table.Column className="text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
 Categoría
 </Table.Column>
 <Table.Column className="text-right text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
 Monto
 </Table.Column>
 </Table.Header>
 <Table.Body>
 {transactions.map((txn) => (
 <Table.Row
 key={txn.id}
 className="hover:bg-gray-50/50 transition-colors duration-150"
 >
 <Table.Cell className="px-4 py-2">
 <span className="text-gray-500 whitespace-nowrap">
 {formatDate(txn.fecha)}
 </span>
 </Table.Cell>
 <Table.Cell className="px-6 py-2">
 <span className="font-medium text-gray-900">
 {txn.concepto}
 </span>
 </Table.Cell>
 <Table.Cell className="px-4 py-2">
 <span
 className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
 style={{
 backgroundColor:`${txn.color}18`,
 color: txn.color,
 }}
 >
 {txn.categoria}
 </span>
 </Table.Cell>
 <Table.Cell className="px-6 py-2 text-right">
 <span className="font-semibold text-gray-900 tabular-nums">
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

 <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
 <span className="text-xs text-gray-500">
 {totalCount} registros en total
 </span>
 <Link
 href="/gastos"
 className="group inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
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
