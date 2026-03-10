// lib/EASyncClient.ts
"use client";

type SyncAction = "create" | "update" | "delete";

type SyncOperation = {
  id: string; // ID único da operação na fila
  entity: string;
  action: SyncAction;
  payload: any;
  retries: number;
};

const QUEUE_KEY = "ea_sync_queue";

class EASyncClient {
  private isProcessing = false;

  private getCacheKey(entity: string) {
    return `ea_cache_${entity}`;
  }
  private getPrevKey(entity: string) {
    return `ea_prev_${entity}`;
  }

  /* =========================
     GESTÃO DE CACHE LOCAL
  ========================= */
  getLocalData(entity: string) {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(this.getCacheKey(entity));
    return raw ? JSON.parse(raw) : [];
  }

  setLocalData(entity: string, data: any[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.getCacheKey(entity), JSON.stringify(data));
    }
  }

  /* =========================
     SAVE (INSTANT UX)
  ========================= */
  async save(entity: string, payload: any, action: SyncAction) {
    const localData = this.getLocalData(entity);
    let updatedData = [...localData];

    // Carimba o dado com a data atual para controle de versão
    const enrichedPayload = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    if (action === "create") {
      updatedData.push(enrichedPayload);
    } else if (action === "update") {
      updatedData = updatedData.map((item) =>
        item.id === enrichedPayload.id ? { ...item, ...enrichedPayload } : item,
      );
    } else if (action === "delete") {
      updatedData = updatedData.filter(
        (item) => item.id !== enrichedPayload.id,
      );
    }

    // Atualiza o UI instantaneamente via LocalStorage
    this.setLocalData(entity, updatedData);

    // Adiciona a operação à fila de sincronização
    const queue = this.getQueue();
    queue.push({
      id: crypto.randomUUID(),
      entity,
      action,
      payload: enrichedPayload,
      retries: 0,
    });
    this.setQueue(queue);

    // Tenta processar a fila imediatamente
    this.processQueue();
    return { success: true };
  }

  /* =========================
     PULL (SINCRONIZAÇÃO REMOTA)
  ========================= */
  async pull(entity: string) {
    if (typeof window === "undefined" || !navigator.onLine)
      return this.getLocalData(entity);

    try {
      // Passamos a entidade na URL para garantir o roteamento correto no GAS/Middleware
      const res = await fetch(`/api/data/${entity}?entity=${entity}`);
      if (!res.ok) return this.getLocalData(entity);

      const remoteData = await res.json();
      if (!Array.isArray(remoteData)) return this.getLocalData(entity);

      const localData = this.getLocalData(entity);

      // LÓGICA DE MERGE: O dado mais recente (updatedAt) sempre vence
      const mergedData = remoteData.map((remoteItem) => {
        const localItem = localData.find((l: any) => l.id === remoteItem.id);
        if (localItem) {
          const remoteTime = new Date(remoteItem.updatedAt || 0).getTime();
          const localTime = new Date(localItem.updatedAt || 0).getTime();
          // Se o local for mais novo (edição offline pendente), mantém o local
          return localTime > remoteTime ? localItem : remoteItem;
        }
        return remoteItem;
      });

      this.setLocalData(entity, mergedData);
      localStorage.setItem(this.getPrevKey(entity), JSON.stringify(mergedData));

      return mergedData;
    } catch (err) {
      console.error(`Erro no pull de ${entity}:`, err);
      return this.getLocalData(entity);
    }
  }

  /* =========================
     PROCESS QUEUE (BACKGROUND SYNC)
  ========================= */
  async processQueue() {
    if (this.isProcessing || typeof window === "undefined" || !navigator.onLine)
      return;
    this.isProcessing = true;

    let queue = this.getQueue();

    while (queue.length > 0 && navigator.onLine) {
      const current = queue[0];

      try {
        console.log(
          `📤 Enviando ${current.entity} (${current.action}):`,
          current.payload,
        );

        const res = await fetch(
          `/api/data/${current.entity}?entity=${current.entity}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: current.action,
              entity: current.entity,
              ...current.payload,
            }),
          },
        );

        const result = await res.json();
        console.log(`📥 Resposta do servidor (${current.entity}):`, result);

        if (
          res.ok &&
          (result.status === "success" ||
            result.status === "created" ||
            result.status === "updated" ||
            result.status === "deleted")
        ) {
          // TROCA DE ID: Se o GAS criou um ID real, remove o TEMP_ do cache local
          if (
            current.action === "create" &&
            result.id &&
            result.id !== current.payload.id
          ) {
            this.updateIdInCache(current.entity, current.payload.id, result.id);
          }

          // Sucesso: remove da fila e atualiza a âncora de segurança
          queue.shift();
          this.setQueue(queue);
          this.updatePrevAnchor(current.entity);
        } else {
          // TRATAMENTO DE ERROS FATAIS:
          // Se for um delete e o ID não existe no GS, removemos da fila para não travar o app
          if (
            current.action === "delete" &&
            (result.message === "ID não encontrado" || res.status === 500)
          ) {
            console.warn(
              "🗑️ Removendo operação de delete inválida para destravar a fila.",
            );
            queue.shift();
            this.setQueue(queue);
            continue;
          }
          // Para outros erros (como rede), paramos e tentamos depois
          break;
        }
      } catch (error) {
        current.retries++;
        this.setQueue(queue);
        console.error("Erro na sincronização, retentando mais tarde...", error);
        break;
      }
      queue = this.getQueue();
    }
    this.isProcessing = false;
  }

  /* =========================
     MÉTODOS AUXILIARES
  ========================= */
  private getQueue(): SyncOperation[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private setQueue(queue: SyncOperation[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  }

  private updateIdInCache(entity: string, oldId: string, newId: string) {
    const data = this.getLocalData(entity);
    const updated = data.map((item: any) =>
      item.id === oldId ? { ...item, id: newId } : item,
    );
    this.setLocalData(entity, updated);
  }

  private updatePrevAnchor(entity: string) {
    const currentCache = this.getLocalData(entity);
    localStorage.setItem(this.getPrevKey(entity), JSON.stringify(currentCache));
  }

  init() {
    if (typeof window !== "undefined") {
      // Tenta processar a fila sempre que voltar a ficar online
      window.addEventListener("online", () => {
        console.log("🌐 Conexão restaurada. Processando fila...");
        this.processQueue();
      });
    }
  }
}

export const eaSyncClient = new EASyncClient();
