"use client";

import { useEffect, useState, useCallback } from "react";
import { eaSyncClient } from "@/lib/EASyncClient";

export function useEASync<T = any>(entity: string) {
  const [data, setData] = useState<T[]>([]);

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    // Inicializa listener de reconexão
    eaSyncClient.init();

    // 1️⃣ Carrega cache local imediatamente
    const local = eaSyncClient.getLocalData(entity);
    setData(local);

    // 2️⃣ Pull remoto silencioso
    const sync = async () => {
      const remote = await eaSyncClient.pull(entity);
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
    async (payload: any, action: "create" | "update" | "delete" = "create") => {
      const result = await eaSyncClient.save(entity, payload, action);

      // Atualiza estado com novo cache local
      const updated = eaSyncClient.getLocalData(entity);
      setData(updated);

      return result;
    },
    [entity],
  );

  /* =========================
     PULL MANUAL
  ========================= */

  const pull = useCallback(async () => {
    const remote = await eaSyncClient.pull(entity);
    setData(remote);
  }, [entity]);

  return {
    data,
    save,
    pull,
  };
}
