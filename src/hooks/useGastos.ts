import useSWR from"swr";
import { supabase } from"@/lib/supabase";

export interface GastoDB {
 id: string;
 fecha: string;
 descripcion: string;
 categoria: string;
 monto: number;
 comprobante_url: string | null;
 creado_el: string;
}

export interface GastosFilters {
 page?: number;
 pageSize?: number;
 searchQuery?: string;
 selectedMonth?: string;
 selectedCategory?: string;
 sortDescriptor?: { column: string; direction: string };
}

const GASTOS_KEY ="supabase:gastos";

async function fetchGastos([, filters]: [string, GastosFilters]): Promise<{ data: GastoDB[], count: number }> {
 let query = supabase
 .from("gastos")
 .select("*", { count:"exact" });

 if (filters.selectedCategory && filters.selectedCategory !=="all") {
 query = query.eq("categoria", filters.selectedCategory);
 }

 if (filters.selectedMonth && filters.selectedMonth !=="all") {
 query = query.like("fecha",`%-` + filters.selectedMonth +`-%`);
 }

 if (filters.searchQuery) {
 const search = filters.searchQuery;
 const numericSearch = !isNaN(Number(search)) && search.trim() !=="" ? Number(search) : null;
 
 if (numericSearch !== null) {
 query = query.or(`descripcion.ilike.%${search}%,categoria.ilike.%${search}%,monto.eq.${numericSearch}`);
 } else {
 query = query.or(`descripcion.ilike.%${search}%,categoria.ilike.%${search}%`);
 }
 }

 const col = filters.sortDescriptor?.column ??"fecha";
 const ascending = filters.sortDescriptor?.direction ==="ascending";
 const mapCol = col ==="cat" ?"categoria" : col;
 
 query = query.order(mapCol, { ascending });

 if (filters.page && filters.pageSize) {
 const from = (filters.page - 1) * filters.pageSize;
 const to = from + filters.pageSize - 1;
 query = query.range(from, to);
 }

 const { data, count, error } = await query;
 if (error) throw error;
 return { data: data ?? [], count: count ?? 0 };
}

export function useGastos(filters: GastosFilters = {}) {
 const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: GastoDB[], count: number }>(
 [GASTOS_KEY, filters],
 fetchGastos,
 {
 revalidateOnFocus: false,
 revalidateOnReconnect: true,
 dedupingInterval: 10000,
 errorRetryCount: 3,
 errorRetryInterval: 5000,
 keepPreviousData: true,
 },
 );

 return {
 gastos: data?.data ?? [],
 totalCount: data?.count ?? 0,
 isLoading,
 isValidating,
 error,
 mutateGastos: mutate,
 };
}
