"use client";

import { useEffect } from "react";
import { eaSyncClient } from "@/lib/EASyncClient";

export default function GlobalSync() {
  useEffect(() => {
    const syncAll = async () => {
      console.log("🔄 Iniciando sincronização global em segundo plano...");

      // Lista de todas as abas/entidades do seu Google Sheets
      const entities = ["clientes", "orcamentos", "notas", "usuarios"];

      // Executa o pull de cada uma de forma silenciosa
      for (const entity of entities) {
        try {
          await eaSyncClient.pull(entity);
        } catch (error) {
          console.error(`Erro ao sincronizar ${entity}:`, error);
        }
      }

      // Após o pull, verifica se ficou algo pendente na fila de envio
      eaSyncClient.processQueue();

      console.log("✅ Sincronização global concluída.");
    };

    // Inicializa os listeners de rede (online/offline)
    eaSyncClient.init();

    // Executa a carga inicial
    syncAll();
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
