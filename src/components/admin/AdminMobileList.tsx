import { ListBox, Pagination } from "@heroui/react";
import { formatCLP } from "@/lib/utils";
import { VARIOS_COLOR } from "@/lib/category-palette";
import {
  SearchIcon,
  ImageIcon,
  EditIcon,
  TrashIcon,
} from "@/components/admin/Icons";
import { GastoDB } from "./AdminDesktopTable";

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

interface AdminMobileListProps {
  paginated: GastoDB[];
  filteredLength: number;
  catColors: Record<string, string>;
  searchQuery: string;
  pStart: number;
  pEnd: number;
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  totalPages: number;
  setLightboxUrl: (url: string) => void;
  openEdit: (g: GastoDB) => void;
  setDeleteGasto: (g: GastoDB) => void;
}

export default function AdminMobileList({
  paginated,
  filteredLength,
  catColors,
  searchQuery,
  pStart,
  pEnd,
  page,
  setPage,
  totalPages,
  setLightboxUrl,
  openEdit,
  setDeleteGasto,
}: AdminMobileListProps) {
  return (
    <div className="md:hidden">
      {paginated.length === 0 ? (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-800 shadow-xs">
            <SearchIcon />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {searchQuery ? "Sin resultados" : "Sin gastos"}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {searchQuery ? "Intenta con otro término." : "Ingresa un gasto usando el formulario."}
            </span>
          </div>
        </div>
      ) : (
        <ListBox aria-label="Gastos" className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {paginated.map((g) => {
            const catColor = catColors[g.categoria] || VARIOS_COLOR;
            return (
              <ListBox.Item
                key={g.id}
                id={g.id}
                textValue={g.descripcion}
                className="rounded-none px-0 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-zinc-900 dark:text-white line-clamp-2">
                      {g.descripcion}
                    </span>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white tabular-nums shrink-0">
                      {formatCLP(g.monto)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-medium"
                        style={{ backgroundColor: `${catColor}18`, color: catColor }}
                      >
                        {g.categoria}
                      </span>
                      <span>{formatShortDate(g.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {g.comprobante_url && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxUrl(g.comprobante_url!);
                          }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                          title="Ver comprobante"
                        >
                          <ImageIcon />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(g);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteGasto(g);
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </ListBox.Item>
            );
          })}
        </ListBox>
      )}
      {totalPages > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <span className="text-xs text-zinc-500 text-center">
            {pStart} a {pEnd} de {filteredLength} resultados
          </span>
          <Pagination size="sm">
            <Pagination.Content className="justify-center">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((p) => Math.max(1, typeof p === "number" ? p - 1 : p))}
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
                  onPress={() => setPage((p) => Math.min(totalPages, typeof p === "number" ? p + 1 : p))}
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
