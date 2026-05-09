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

export function useCategorias() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    CategoriaDB[]
  >(CATEGORIAS_KEY, fetchCategorias, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  return {
    categoriasDB: data ?? [],
    isLoadingCategorias: isLoading,
    isValidatingCategorias: isValidating,
    error,
    mutateCategorias: mutate,
  };
}
