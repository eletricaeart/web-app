// hooks/useData.ts
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

/**
 * Interface para a resposta padrão da API (GAS/Middleware)
 */
interface ApiResponse {
  status: "success" | "created" | "updated" | "error";
  message?: string;
  id?: string | number;
}

export function useData<T>(entity: string) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR<T[]>(
    `/api/data/${entity}`,
    fetcher,
  );

  // Função para salvar (Create ou Update)
  const saveData = async (
    payload: Partial<T> & { id?: string | number },
    action: "create" | "update" = "create",
  ): Promise<{ success: boolean; id?: string | number }> => {
    try {
      // CORREÇÃO: Se não houver ID e for criação, enviamos o TEMP_ para o GAS disparar o gerador
      const dataWithId = {
        ...payload,
        id:
          payload.id ||
          (action === "create" ? `TEMP_${Date.now()}` : payload.id),
      };

      const res = await fetch(`/api/data/${entity}`, {
        method: "POST",
        body: JSON.stringify({ action, ...dataWithId }),
      });

      const result: ApiResponse = await res.json();

      // Verifique se o GAS retornou erro de ID duplicado
      if (result.status === "error") {
        throw new Error(result.message);
      }

      if (
        result.status === "success" ||
        result.status === "created" ||
        result.status === "updated"
      ) {
        mutate(`/api/data/${entity}`);
        return { success: true, id: result.id };
      }

      throw new Error(result.message || "Erro desconhecido");
    } catch (err) {
      // Tratamento seguro de erro para TypeScript (substituindo any)
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao salvar", { description: errorMessage });
      return { success: false };
    }
  };

  return {
    items: data || [],
    isLoading,
    isError: error,
    saveData,
    refresh: () => mutate(`/api/data/${entity}`),
  };
}
