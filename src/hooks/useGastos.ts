import useSWR from "swr";
import { supabase } from "@/lib/supabase";

interface GastoDB {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  comprobante_url: string | null;
  creado_el: string;
}

const GASTOS_KEY = "supabase:gastos";

async function fetchGastos(): Promise<GastoDB[]> {
  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useGastos() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<GastoDB[]>(
    GASTOS_KEY,
    fetchGastos,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    },
  );

  return {
    gastos: data ?? [],
    isLoading,
    isValidating,
    error,
    mutateGastos: mutate,
  };
}
