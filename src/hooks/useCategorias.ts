import useSWR from "swr";
import { supabase } from "@/lib/supabase";

interface CategoriaDB {
  id: string;
  nombre: string;
  color?: string;
  creado_el: string;
}

const CATEGORIAS_KEY = "supabase:categorias";

async function fetchCategorias(): Promise<CategoriaDB[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

/**
 * SWR hook for categorias data.
 * – Returns cached data instantly on re-mount / tab-switch.
 * – Silently revalidates in the background.
 * – Use `mutate()` after create/delete to trigger refresh.
 */
export function useCategorias() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<CategoriaDB[]>(
    CATEGORIAS_KEY,
    fetchCategorias,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    categoriasDB: data ?? [],
    isLoadingCategorias: isLoading,
    isValidatingCategorias: isValidating,
    error,
    mutateCategorias: mutate,
  };
}
