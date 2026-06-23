"use client";

import React from"react";
import { ListBox, Pagination } from"@heroui/react";
import { EmptyState } from"@/components/ui/empty-state";
import { formatDate, formatCLP } from"@/lib/utils";
import { m, LazyMotion, domAnimation } from"motion/react";
import type { TransaccionItem } from"./ExpenseTable";
import { EyeIcon, EyeOffIcon } from"./ExpenseTable";

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
 <LazyMotion features={domAnimation}>
 <div className="md:hidden">
 <ListBox
 aria-label="Gastos recientes"
 items={paginated}
 renderEmptyState={() => (
 <EmptyState
 title="Sin resultados"
 description={
 hasActiveFilters
 ?"No hay transacciones con los filtros seleccionados."
 :"La búsqueda no arrojó coincidencias."
 }
 />
 )}
 >
 {(txn: TransaccionItem) => {
 const catColor = txn.color ||"#9CA3AF";
 return (
 <ListBox.Item
 key={txn.id}
 id={txn.id}
 textValue={txn.concepto}
 className="rounded-none px-0 py-3 border-b border-border last:border-b-0"
 >
 <div className="flex flex-col gap-1 w-full">
 <div className="flex items-start justify-between gap-2">
 <span className="text-sm font-medium text-zinc-900 line-clamp-2">
 {txn.concepto}
 </span>
 <span className="text-sm font-semibold text-zinc-900 tabular-nums shrink-0">
 {formatCLP(txn.monto)}
 </span>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <span
 className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
 style={{
 backgroundColor:`${catColor}18`,
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
 <m.button type="button"
 onClick={() => { onViewLightbox(txn.comprobante, txn.concepto); }}
 className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
 aria-label={`Ver comprobante de ${txn.concepto}`}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 transition={{ type:"spring", stiffness: 400, damping: 17 }}
 >
 <span className="size-3.5">
 <EyeIcon />
 </span>
 Ver comprobante
 </m.button>
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
 onPress={() => { onPageChange(Math.max(1, page - 1)); }}
 >
 <Pagination.PreviousIcon />
 </Pagination.Previous>
 </Pagination.Item>
 <span className="text-sm text-zinc-600">
 {page} / {totalPages}
 </span>
 <Pagination.Item>
 <Pagination.Next
 isDisabled={page === totalPages}
 onPress={() => { onPageChange(Math.min(totalPages, page + 1)); }}
 >
 <Pagination.NextIcon />
 </Pagination.Next>
 </Pagination.Item>
 </Pagination.Content>
 </Pagination>
 </div>
 )}
 </div>
 </LazyMotion>
 );
}
