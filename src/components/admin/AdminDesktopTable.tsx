import { Table, Tooltip, Pagination, EmptyState } from"@heroui/react";
import type { SortDescriptor } from"@heroui/react";
import { formatCLP, formatDate } from"@/lib/utils";
import { VARIOS_COLOR } from"@/lib/category-palette";
import SortableColumnHeader from"@/components/admin/SortableColumnHeader";
import {
 SearchIcon,
 InboxIcon,
 EyeIcon,
 EditIcon,
 TrashIcon,
} from"@/components/admin/Icons";

import type { GastoDB } from"@/hooks/useGastos";

interface AdminDesktopTableProps {
 paginated: GastoDB[];
 filteredLength: number;
 catColors: Record<string, string>;
 searchQuery: string;
 pStart: number;
 pEnd: number;
 page: number;
 setPage: (p: number | ((prev: number) => number)) => void;
 totalPages: number;
 pages: number[];
 sortDescriptor: SortDescriptor;
 setSortDescriptor: (descriptor: SortDescriptor) => void;
 setLightboxUrl: (url: string) => void;
 openEdit: (g: GastoDB) => void;
 setDeleteGasto: (g: GastoDB) => void;
}

export default function AdminDesktopTable({
 paginated,
 filteredLength,
 catColors,
 searchQuery,
 pStart,
 pEnd,
 page,
 setPage,
 totalPages,
 pages,
 sortDescriptor,
 setSortDescriptor,
 setLightboxUrl,
 openEdit,
 setDeleteGasto,
}: AdminDesktopTableProps) {
 return (
 <div className="hidden md:block">
 <Table variant="secondary" className="w-full">
 <Table.ScrollContainer>
 <Table.Content
 aria-label="Gastos"
 className="w-full"
 sortDescriptor={sortDescriptor}
 onSortChange={setSortDescriptor}
 >
 <Table.Header>
 <Table.Column allowsSorting isRowHeader id="fecha" className="w-27.5">
 {({ sortDirection }) => (
 <SortableColumnHeader sortDirection={sortDirection}>Fecha</SortableColumnHeader>
 )}
 </Table.Column>
 <Table.Column id="desc" className="min-w-50">Descripción</Table.Column>
 <Table.Column allowsSorting id="cat" className="w-30">
 {({ sortDirection }) => (
 <SortableColumnHeader sortDirection={sortDirection}>Categoría</SortableColumnHeader>
 )}
 </Table.Column>
 <Table.Column allowsSorting id="monto" className="w-30">
 {({ sortDirection }) => (
 <SortableColumnHeader sortDirection={sortDirection}>Monto</SortableColumnHeader>
 )}
 </Table.Column>
 <Table.Column id="actions" className="w-35 text-center">Acciones</Table.Column>
 </Table.Header>
 <Table.Body
 renderEmptyState={() => (
 <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
 <div className="flex size-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 border border-border">
 {searchQuery ? <SearchIcon /> : <InboxIcon />}
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-semibold text-zinc-900">
 {searchQuery ?"Sin resultados" :"Sin gastos"}
 </span>
 <span className="text-xs text-zinc-500 mt-0.5">
 {searchQuery ?"Intenta con otro término." :"Ingresa un gasto usando el formulario."}
 </span>
 </div>
 </EmptyState>
 )}
 >
 {paginated.map((g) => {
 const catColor = catColors[g.categoria] || VARIOS_COLOR;
 return (
 <Table.Row key={g.id}>
 <Table.Cell>
 <span className="text-sm text-zinc-600 whitespace-nowrap">
 {formatDate(g.fecha)}
 </span>
 </Table.Cell>
 <Table.Cell>
 <span className="text-sm font-medium text-zinc-900">
 {g.descripcion}
 </span>
 </Table.Cell>
 <Table.Cell>
 <span
 className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
 style={{ backgroundColor:`${catColor}1A`, color: catColor }}
 >
 {g.categoria}
 </span>
 </Table.Cell>
 <Table.Cell>
 <span className="text-sm font-semibold text-zinc-900 tabular-nums">
 {formatCLP(g.monto)}
 </span>
 </Table.Cell>
 <Table.Cell>
 <div className="flex items-center justify-center gap-1.5">
 <Tooltip delay={0}>
 <Tooltip.Trigger>
 <button
 type="button"
 onClick={() => g.comprobante_url && setLightboxUrl(g.comprobante_url)}
 disabled={!g.comprobante_url}
 className={`inline-flex items-center justify-center size-8 rounded-full transition-all duration-200 cursor-pointer ${
 g.comprobante_url
 ?"bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
 :"bg-zinc-50 text-zinc-300 cursor-not-allowed"
 }`}
 aria-label="Ver comprobante"
 >
 <EyeIcon />
 </button>
 </Tooltip.Trigger>
 <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
 <p>{g.comprobante_url ?"Ver comprobante" :"Sin comprobante"}</p>
 </Tooltip.Content>
 </Tooltip>
 <Tooltip delay={0}>
 <Tooltip.Trigger>
 <button
 type="button"
 onClick={() => openEdit(g)}
 className="inline-flex items-center justify-center size-8 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all duration-200 cursor-pointer"
 aria-label="Editar"
 >
 <EditIcon />
 </button>
 </Tooltip.Trigger>
 <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
 <p>Editar</p>
 </Tooltip.Content>
 </Tooltip>
 <Tooltip delay={0}>
 <Tooltip.Trigger>
 <button
 type="button"
 onClick={() => setDeleteGasto(g)}
 className="inline-flex items-center justify-center size-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 cursor-pointer"
 aria-label="Eliminar"
 >
 <TrashIcon />
 </button>
 </Tooltip.Trigger>
 <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
 <p>Eliminar</p>
 </Tooltip.Content>
 </Tooltip>
 </div>
 </Table.Cell>
 </Table.Row>
 );
 })}
 </Table.Body>
 </Table.Content>
 </Table.ScrollContainer>
 {filteredLength > 0 && (
 <Table.Footer>
 <Pagination size="sm">
 <Pagination.Summary>
 {pStart} a {pEnd} de {filteredLength} gastos
 </Pagination.Summary>
 <Pagination.Content>
 <Pagination.Item>
 <Pagination.Previous
 isDisabled={page === 1}
 onPress={() => setPage((p) => Math.max(1, typeof p ==="number" ? p - 1 : p))}
 >
 <Pagination.PreviousIcon />
 Ant.
 </Pagination.Previous>
 </Pagination.Item>
 {pages.map((p) => (
 <Pagination.Item key={p}>
 <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
 {p}
 </Pagination.Link>
 </Pagination.Item>
 ))}
 <Pagination.Item>
 <Pagination.Next
 isDisabled={page === totalPages}
 onPress={() => setPage((p) => Math.min(totalPages, typeof p ==="number" ? p + 1 : p))}
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
