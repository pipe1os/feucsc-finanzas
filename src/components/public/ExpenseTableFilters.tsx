"use client";

import React from "react";
import { Select, ListBox } from "@heroui/react";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const MONTH_OPTIONS = [
  { id: "all", label: "Todos los meses" },
  { id: "01", label: "Enero" },
  { id: "02", label: "Febrero" },
  { id: "03", label: "Marzo" },
  { id: "04", label: "Abril" },
  { id: "05", label: "Mayo" },
  { id: "06", label: "Junio" },
  { id: "07", label: "Julio" },
  { id: "08", label: "Agosto" },
  { id: "09", label: "Septiembre" },
  { id: "10", label: "Octubre" },
  { id: "11", label: "Noviembre" },
  { id: "12", label: "Diciembre" },
];

export interface ExpenseTableFiltersProps {
  searchQuery?: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedMonth: string;
  onMonthChange: (key: string) => void;
  selectedCategory: string;
  onCategoryChange: (key: string) => void;
  uniqueCategories: string[];
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

export function ExpenseTableFilters({
  searchQuery,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  selectedCategory,
  onCategoryChange,
  uniqueCategories,
  hasActiveFilters,
  onClearAllFilters,
}: ExpenseTableFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-6 pt-3">
      <div className="relative w-full sm:w-56">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Buscar gasto..."
          aria-label="Buscar gastos"
          defaultValue={searchQuery}
          onChange={onSearchChange}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-9 pr-4
                     text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                     outline-hidden transition-all duration-200
                     focus:border-red-300 dark:focus:border-red-500/50 focus:bg-surface dark:focus:bg-gray-800 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/20 h-9"
          id="search-transactions"
        />
      </div>

      <Select
        className="w-44"
        placeholder="Mes"
        aria-label="Filtrar por mes"
        selectedKey={selectedMonth}
        onSelectionChange={(key) => {
          if (key !== null) onMonthChange(key as string);
        }}
      >
        <Select.Trigger className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
          <Select.Value>
            {({ isPlaceholder, state }) => {
              if (isPlaceholder) return "Mes: Todos";
              const key = state.selectedItems?.[0]?.key;
              if (key === "all") return "Mes: Todos";
              const found = MONTH_OPTIONS.find((m) => m.id === key);
              return `Mes: ${found?.label ?? "Todos"}`;
            }}
          </Select.Value>
          <Select.Indicator className="text-gray-400 dark:text-gray-500" />
        </Select.Trigger>
        <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-gray-800 dark:bg-gray-900 min-w-48">
          <ListBox>
            {MONTH_OPTIONS.map((m) => (
              <ListBox.Item key={m.id} id={m.id} textValue={m.label}>
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
          if (key !== null) onCategoryChange(key as string);
        }}
      >
        <Select.Trigger className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm h-9 min-h-0 items-center **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-sm dark:text-gray-300">
          <Select.Value>
            {({ isPlaceholder, state }) => {
              if (isPlaceholder) return "Categoría: Todas";
              const key = state.selectedItems?.[0]?.key;
              if (key === "all") return "Categoría: Todas";
              return `Categoría: ${String(key ?? "Todas")}`;
            }}
          </Select.Value>
          <Select.Indicator className="text-gray-400 dark:text-gray-500" />
        </Select.Trigger>
        <Select.Popover className="rounded-xl shadow-apple-lg border border-gray-100 dark:border-gray-800 dark:bg-gray-900 min-w-56">
          <ListBox>
            <ListBox.Item id="all" textValue="Todas las categorías">
              Todas las categorías
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {uniqueCategories.map((cat) => (
              <ListBox.Item key={cat} id={cat} textValue={cat}>
                {cat}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {hasActiveFilters && (
        <button type="button"
          onClick={onClearAllFilters}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 cursor-pointer"
        >
          <XIcon />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
