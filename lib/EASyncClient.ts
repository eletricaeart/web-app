// lib/EASyncClient.ts
"use client";

type SyncAction = "create" | "update" | "delete";

type SyncOperation = {
  id: string;
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

  getLocalData(entity: string) {
    const raw = localStorage.getItem(this.getCacheKey(entity));
    return raw ? JSON.parse(raw) : [];
  }

  setLocalData(entity: string, data: any[]) {
    localStorage.setItem(this.getCacheKey(entity), JSON.stringify(data));
  }

  /* =========================
     SAVE (INSTANT UX)
  ========================= */
  async save(entity: string, payload: any, action: SyncAction) {
    const localData = this.getLocalData(entity);
    let updatedData = [...localData];

    // Adiciona timestamp local para comparação futura
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

    this.setLocalData(entity, updatedData);

    const queue = this.getQueue();
    queue.push({
      id: crypto.randomUUID(),
      entity,
      action,
      payload: enrichedPayload,
      retries: 0,
    });
    this.setQueue(queue);

    this.processQueue();
    return { success: true };
  }

  /* =========================
     PULL (CONFLITO POR DATA)
  ========================= */
  async pull(entity: string) {
    if (!navigator.onLine) return this.getLocalData(entity);

    try {
      const res = await fetch(`/api/data/${entity}`);
      if (!res.ok) return this.getLocalData(entity);

      const remoteData = await res.json();
      if (!Array.isArray(remoteData)) return this.getLocalData(entity);

      const localData = this.getLocalData(entity);

      // LÓGICA DE MERGE: Compara item por item via updatedAt
      const mergedData = remoteData.map((remoteItem) => {
        const localItem = localData.find((l: any) => l.id === remoteItem.id);

        if (localItem) {
          const remoteTime = new Date(remoteItem.updatedAt || 0).getTime();
          const localTime = new Date(localItem.updatedAt || 0).getTime();

          // Se o dado local for mais novo e ainda não sincronizou (está na fila), mantém o local
          return localTime > remoteTime ? localItem : remoteItem;
        }
        return remoteItem;
      });

      this.setLocalData(entity, mergedData);
      localStorage.setItem(this.getPrevKey(entity), JSON.stringify(mergedData));

      return mergedData;
    } catch (err) {
      return this.getLocalData(entity);
    }
  }

  /* =========================
     PROCESS QUEUE (SUBSTITUIÇÃO DE ID)
  ========================= */
  async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;
    this.isProcessing = true;

    let queue = this.getQueue();

    while (queue.length > 0 && navigator.onLine) {
      const current = queue[0];

      try {
        const res = await fetch(`/api/data/${current.entity}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: current.action, ...current.payload }),
        });

        const result = await res.json();

        if (
          res.ok &&
          (result.status === "success" ||
            result.status === "created" ||
            result.status === "updated")
        ) {
          // Se for criação, troca o TEMP_ID pelo ID real do GS
          if (
            current.action === "create" &&
            result.id &&
            result.id !== current.payload.id
          ) {
            this.updateIdInCache(current.entity, current.payload.id, result.id);
          }

          queue.shift();
          this.setQueue(queue);
          this.updatePrevAnchor(current.entity);
        } else {
          break;
        }
      } catch (error) {
        current.retries++;
        this.setQueue(queue);
        break;
      }
      queue = this.getQueue();
    }
    this.isProcessing = false;
  }

  // Métodos auxiliares de fila e âncora...
  private getQueue(): SyncOperation[] {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  private setQueue(queue: SyncOperation[]) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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
      window.addEventListener("online", () => this.processQueue());
    }
  }
}

export const eaSyncClient = new EASyncClient();
