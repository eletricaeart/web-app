// hooks/useEASync.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { eaSyncClient } from "@/lib/EASyncClient";

/**
 * Interface para o retorno padrão das ações do EASyncClient
 */
interface SyncResult {
  success: boolean;
  id?: string | number;
  message?: string;
  [key: string]: any;
}

export function useEASync<T = any>(entity: string) {
  const [data, setData] = useState<T[]>([]);

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    // Inicializa listener de reconexão
    eaSyncClient.init();

    // 1️⃣ Carrega cache local imediatamente
    const local = eaSyncClient.getLocalData(entity) as T[];
    setData(local);

    // 2️⃣ Pull remoto silencioso
    const sync = async () => {
      const remote = (await eaSyncClient.pull(entity)) as T[];
      setData(remote);

      // Processa fila pendente após pull
      eaSyncClient.processQueue();
    };

    sync();
  }, [entity]);

  /* =========================
     SAVE
  ========================= */

  const save = useCallback(
    async (
      payload: Partial<T> & { id?: string | number },
      action: "create" | "update" | "delete" = "create",
    ): Promise<SyncResult> => {
      const result = (await eaSyncClient.save(
        entity,
        payload,
        action,
      )) as SyncResult;

      // Atualiza estado com novo cache local
      const updated = eaSyncClient.getLocalData(entity) as T[];
      setData(updated);

      return result;
    },
    [entity],
  );

  /* =========================
     PULL MANUAL
  ========================= */

  const pull = useCallback(async (): Promise<void> => {
    const remote = (await eaSyncClient.pull(entity)) as T[];
    setData(remote);
  }, [entity]);

  return {
    data,
    save,
    pull,
  };
}
