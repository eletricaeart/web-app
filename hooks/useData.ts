// hooks/useData.ts
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

export function useData<T>(entity: string) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR<T[]>(
    `/api/data/${entity}`,
    fetcher,
  );

  // Função para salvar (Create ou Update)
  const saveData = async (
    payload: any,
    action: "create" | "update" = "create",
  ) => {
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

      const result = await res.json();

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
    } catch (err: any) {
      toast.error("Erro ao salvar", { description: err.message });
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
