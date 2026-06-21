"use client";

import { useState, useEffect, useRef, useId } from "react";
import { CheckIcon, XIcon, ChevronDownIcon } from "./Icons";

interface CategorySelectProps {
  categorias: string[];
  value: string;
  onChange: (cat: string) => void;
  onDeleteCategory?: (cat: string) => void;
  id?: string;
}

export default function CategorySelect({
  categorias,
  value,
  onChange,
  onDeleteCategory,
  id,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const confirmNewCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsCreating(false);
      setNewCatName("");
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {}
      <button
        id={selectId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setIsCreating(false);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5
                   text-sm text-zinc-900 dark:text-white transition-all duration-200 cursor-pointer
                   hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-red-300  focus:ring-2 focus:ring-red-100 outline-hidden"
      >
        <span>{value}</span>
        <span
          className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1 animate-fade-in-up"
          style={{ animationDuration: "150ms" }}
        >
          <div
            role="menu"
            aria-labelledby={selectId}
            className="max-h-60 overflow-y-auto"
          >
            {categorias.map((cat) => {
              const isSelected = cat === value;
              const isVarios = cat === "Varios";
              return (
                  <div
                    key={cat}
                    className={`group flex items-center justify-between px-3 py-2 text-sm transition-colors duration-150
                  ${isSelected ? "bg-red-50 text-red-600 font-medium" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                  >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex-1 cursor-pointer text-left"
                    onClick={() => {
                      onChange(cat);
                      setOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {!isVarios && onDeleteCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat);
                          setOpen(false);
                        }}
                        className="inline-flex items-center justify-center size-5 rounded-full
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                 text-red-400 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                        aria-label={`Eliminar ${cat}`}
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {}
          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
            {isCreating ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  type="text"
                  placeholder="Nombre..."
                  aria-label="Nombre de nueva categoría"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmNewCategory();
                    }
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-hidden focus:border-red-300 focus:ring-1 focus:ring-red-100"
                />
                <button
                  type="button"
                  onClick={confirmNewCategory}
                  className="inline-flex items-center justify-center rounded-lg bg-red-500 px-2 py-1.5 text-white text-xs hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-zinc-400 dark:text-zinc-500 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsCreating(true);
                  setNewCatName("");
                }}
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm text-red-500 font-medium cursor-pointer hover:bg-red-50 transition-colors duration-150"
              >
                <PlusIcon /> Nueva categoría
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}
