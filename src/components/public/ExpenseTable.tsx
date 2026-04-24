"use client";

import { useState, useMemo, useRef } from "react";
import { Card, Table, Modal, Button, Pagination, Tooltip, SortDescriptor, EmptyState } from "@heroui/react";
import { transacciones, formatCLP, formatDate } from "@/lib/mockData";
import type { CategoriaGasto } from "@/types";
import Image from "next/image";

const SearchIcon = () => (
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
);

const EyeIcon = () => (
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
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
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
          strokeWidth="2.5"
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

const categoryStyles: Record<string, { bg: string; text: string }> = {
  Asambleas: { bg: "bg-red-50", text: "text-red-600" },
  Eventos: { bg: "bg-amber-50", text: "text-amber-700" },
  Materiales: { bg: "bg-violet-50", text: "text-violet-600" },
  Servicios: { bg: "bg-cyan-50", text: "text-cyan-700" },
  Transporte: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Otros: { bg: "bg-gray-100", text: "text-gray-600" },
};

const defaultCatStyle = { bg: "bg-blue-50", text: "text-blue-600" };

function getCatStyle(cat: string) {
  return categoryStyles[cat] || defaultCatStyle;
}

const ROWS_PER_PAGE = 10;

export default function ExpenseTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    concepto: string;
  } | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1); // Reset page on new search
    }, 150);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transacciones;
    const q = searchQuery.toLowerCase();
    return transacciones.filter(
      (t) =>
        t.concepto.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const sortedItems = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const col = sortDescriptor.column as keyof typeof a;
      const first = a[col];
      const second = b[col];
      
      let cmp = 0;
      if (col === "monto") {
        cmp = (first as number) - (second as number);
      } else {
        cmp = String(first).localeCompare(String(second));
      }

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }
      return cmp;
    });
  }, [filtered, sortDescriptor]);

  const totalPages = Math.ceil(sortedItems.length / ROWS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedItems.slice(start, start + ROWS_PER_PAGE);
  }, [page, sortedItems]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedItems.length);

  return (
    <>
      <Card
        className="rounded-2xl border border-gray-100 bg-white shadow-apple overflow-hidden animate-fade-in-up opacity-0"
        variant="transparent"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex flex-col gap-3 p-6 pb-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Transacciones Recientes
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length}{" "}
              {filtered.length === 1 ? "registro" : "registros"} encontrados
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Buscar transacción..."
              defaultValue=""
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4
                         text-sm text-gray-900 placeholder:text-gray-400
                         outline-hidden transition-all duration-200
                         focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              id="search-transactions"
            />
          </div>
        </div>

        <div className="p-6 pt-4">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Tabla de transacciones recientes"
                className="min-w-[720px]"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
              >
                <Table.Header>
                  <Table.Column allowsSorting isRowHeader id="fecha" className="w-[120px]">
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>Fecha</SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column id="concepto" className="min-w-[240px]">
                    Descripción
                  </Table.Column>
                  <Table.Column allowsSorting id="categoria" className="w-[120px]">
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>Categoría</SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column allowsSorting id="monto" className="w-[130px]">
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>Monto</SortableColumnHeader>
                    )}
                  </Table.Column>
                  <Table.Column id="boleta" className="w-[100px] text-center">
                    Boleta
                  </Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <EmptyState className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100 shadow-xs">
                        <SearchIcon />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">Sin resultados</span>
                        <span className="text-xs text-gray-500 mt-0.5">La búsqueda no arrojó coincidencias.</span>
                      </div>
                    </EmptyState>
                  )}
                >
                  {paginated.map((txn) => {
                      const catStyle = getCatStyle(txn.categoria);
                      return (
                        <Table.Row key={txn.id}>
                          <Table.Cell>
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {formatDate(txn.fecha)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm font-medium text-gray-900">
                              {txn.concepto}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${catStyle.bg} ${catStyle.text}`}
                            >
                              {txn.categoria}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">
                              {formatCLP(txn.monto)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex justify-center">
                              {txn.comprobante ? (
                                <button
                                  onClick={() =>
                                    setLightboxImage({
                                      src: "/boleta_ejemplo.png",
                                      concepto: txn.concepto,
                                    })
                                  }
                                  className="inline-flex items-center justify-center size-8 rounded-lg bg-red-50 text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-100 hover:text-red-600 hover:scale-105 active:scale-95"
                                  aria-label={`Ver comprobante de ${txn.concepto}`}
                                >
                                  <EyeIcon />
                                </button>
                              ) : (
                                <Tooltip delay={0}>
                                  <Tooltip.Trigger>
                                    <span className="inline-flex items-center justify-center size-8 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100">
                                      <EyeOffIcon />
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
                                    <p>Comprobante pendiente</p>
                                  </Tooltip.Content>
                                </Tooltip>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  }
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            {totalPages > 0 && (
              <Table.Footer>
                <Pagination size="sm">
                  <Pagination.Summary>
                    {start} a {end} de {filtered.length} resultados
                  </Pagination.Summary>
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous
                        isDisabled={page === 1}
                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <Pagination.PreviousIcon />
                        Ant.
                      </Pagination.Previous>
                    </Pagination.Item>
                    {pages.map((p) => (
                      <Pagination.Item key={p}>
                        <Pagination.Link
                          isActive={p === page}
                          onPress={() => setPage(p)}
                        >
                          {p}
                        </Pagination.Link>
                      </Pagination.Item>
                    ))}
                    <Pagination.Item>
                      <Pagination.Next
                        isDisabled={page === totalPages}
                        onPress={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
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
      </Card>

      <Modal.Backdrop
        isOpen={!!lightboxImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) setLightboxImage(null);
        }}
      >
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="sm:max-w-2xl bg-white rounded-2xl overflow-hidden shadow-apple-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-semibold text-gray-900">
                {lightboxImage?.concepto ?? "Comprobante"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-4">
              {lightboxImage && (
                <div className="flex justify-center rounded-xl bg-gray-50 p-4">
                  <Image
                    src={lightboxImage.src}
                    alt={`Comprobante: ${lightboxImage.concepto}`}
                    width={500}
                    height={700}
                    className="max-h-[70vh] w-auto rounded-lg object-contain"
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary" className="rounded-xl">
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
