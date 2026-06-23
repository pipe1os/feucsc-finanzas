"use client";

import { Select, ListBox, Button } from"@heroui/react";
import { SearchIcon, XIcon } from"@/components/admin/Icons";

const MONTH_OPTIONS = [
 { id:"all", label:"Todos los meses" },
 { id:"01", label:"Enero" },
 { id:"02", label:"Febrero" },
 { id:"03", label:"Marzo" },
 { id:"04", label:"Abril" },
 { id:"05", label:"Mayo" },
 { id:"06", label:"Junio" },
 { id:"07", label:"Julio" },
 { id:"08", label:"Agosto" },
 { id:"09", label:"Septiembre" },
 { id:"10", label:"Octubre" },
 { id:"11", label:"Noviembre" },
 { id:"12", label:"Diciembre" },
];

export interface AdminFiltersProps {
 selectedMonth: string;
 setSelectedMonth: (val: string) => void;
 selectedCategory: string;
 setSelectedCategory: (val: string) => void;
 onSearch: (val: string) => void;
 categoriasDB: { nombre: string }[];
 onClear: () => void;
}

export default function AdminFilters({
 selectedMonth,
 setSelectedMonth,
 selectedCategory,
 setSelectedCategory,
 onSearch,
 categoriasDB,
 onClear,
}: AdminFiltersProps) {
 return (
 <div className="flex flex-col gap-2">
 <div className="flex flex-wrap items-center gap-2">
 <Select
 className="w-44"
 placeholder="Mes"
 aria-label="Filtrar por mes"
 selectedKey={selectedMonth}
 onSelectionChange={(key) => {
 if (key !== null) {
 setSelectedMonth(key as string);
 }
 }}
 >
 <Select.Trigger className="rounded-xl border border-border bg-gray-50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm">
 <Select.Value>
 {({ isPlaceholder, state }) => {
 if (isPlaceholder) return"Mes: Todos";
 const k = state.selectedItems?.[0]?.key;
 if (k ==="all") return"Mes: Todos";
 const found = MONTH_OPTIONS.find((m) => m.id === k);
 return`Mes: ${found?.label ??"Todos"}`;
 }}
 </Select.Value>
 <Select.Indicator />
 </Select.Trigger>
 <Select.Popover className="rounded-xl shadow-apple-lg border border-border min-w-48">
 <ListBox>
 {MONTH_OPTIONS.map((m) => (
 <ListBox.Item
 key={m.id}
 id={m.id}
 textValue={m.label}
 >
 {m.label}
 <ListBox.ItemIndicator />
 </ListBox.Item>
 ))}
 </ListBox>
 </Select.Popover>
 </Select>
 <Select
 className="w-56"
 placeholder="Categoría"
 aria-label="Filtrar por categoría"
 selectedKey={selectedCategory}
 onSelectionChange={(key) => {
 if (key !== null) {
 setSelectedCategory(key as string);
 }
 }}
 >
 <Select.Trigger className="rounded-xl border border-border bg-gray-50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm">
 <Select.Value>
 {({ isPlaceholder, state }) => {
 if (isPlaceholder) return"Categoría: Todas";
 const k = state.selectedItems?.[0]?.key;
 if (k ==="all") return"Categoría: Todas";
 return`Categoría: ${String(k ??"Todas")}`;
 }}
 </Select.Value>
 <Select.Indicator />
 </Select.Trigger>
 <Select.Popover className="rounded-xl shadow-apple-lg border border-border min-w-56">
 <ListBox>
 <ListBox.Item id="all" textValue="Todas las categorías">
 Todas las categorías
 <ListBox.ItemIndicator />
 </ListBox.Item>
 {categoriasDB.map((cat) => (
 <ListBox.Item
 key={cat.nombre}
 id={cat.nombre}
 textValue={cat.nombre}
 >
 {cat.nombre}
 <ListBox.ItemIndicator />
 </ListBox.Item>
 ))}
 </ListBox>
 </Select.Popover>
 </Select>

 <div className="relative w-full sm:w-48">
 <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
 <SearchIcon />
 </span>
 <input
 type="text"
 placeholder="Buscar..."
 aria-label="Buscar gastos"
 defaultValue=""
 onChange={(e) => { onSearch(e.target.value); }}
 className="w-full h-9 rounded-xl border border-border bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-hidden transition-all duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
 />
 </div>
 </div>
 {(selectedMonth !=="all" || selectedCategory !=="all") && (
 <Button
 size="sm"
 variant="ghost"
 className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 cursor-pointer h-9 w-fit"
 onPress={onClear}
 >
 <XIcon />
 Limpiar filtros
 </Button>
 )}
 </div>
 );
}
