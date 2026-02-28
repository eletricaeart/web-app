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

  /* =========================
     CACHE
  ========================= */

  private getCacheKey(entity: string) {
    return `ea_cache_${entity}`;
  }

  getLocalData(entity: string) {
    const raw = localStorage.getItem(this.getCacheKey(entity));
    return raw ? JSON.parse(raw) : [];
  }

  setLocalData(entity: string, data: any[]) {
    localStorage.setItem(this.getCacheKey(entity), JSON.stringify(data));
  }

  /* =========================
     QUEUE
  ========================= */

  private getQueue(): SyncOperation[] {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private setQueue(queue: SyncOperation[]) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  private addToQueue(operation: Omit<SyncOperation, "id" | "retries">) {
    const queue = this.getQueue();

    const newOp: SyncOperation = {
      id: crypto.randomUUID(),
      retries: 0,
      ...operation,
    };

    queue.push(newOp);
    this.setQueue(queue);
  }

  /* =========================
     SAVE (INSTANT UX)
  ========================= */

  async save(entity: string, payload: any, action: SyncAction) {
    const localData = this.getLocalData(entity);

    let updatedData = [...localData];

    if (action === "create") {
      updatedData.push(payload);
    }

    if (action === "update") {
      updatedData = updatedData.map((item) =>
        item.id === payload.id ? payload : item,
      );
    }

    if (action === "delete") {
      updatedData = updatedData.filter((item) => item.id !== payload.id);
    }

    // Atualiza cache instantaneamente
    this.setLocalData(entity, updatedData);

    // Adiciona à fila
    this.addToQueue({ entity, action, payload });

    // Dispara sync em background
    this.processQueue();

    return { success: true };
  }

  /* =========================
     PULL (FORÇA SINCRONIZAÇÃO REMOTA)
  ========================= */

  async pull(entity: string) {
    if (!navigator.onLine) return this.getLocalData(entity);

    try {
      const res = await fetch(`/api/data/${entity}`, { cache: "no-store" });

      // Se o servidor não responder OK, não toque no cache local!
      if (!res.ok) return this.getLocalData(entity);

      const remote = await res.json();

      // SÓ ATUALIZA SE RECEBER UM ARRAY VÁLIDO
      if (Array.isArray(remote)) {
        this.setLocalData(entity, remote);
        return remote;
      }

      // Se o remote vier estranho ou vazio (mas você tem dados),
      // mantenha o local por segurança.
      return this.getLocalData(entity);
    } catch (error) {
      // Em caso de erro de rede, o Rafael continua vendo os dados no celular
      return this.getLocalData(entity);
    }
  }

  /* =========================
     PROCESS QUEUE
  ========================= */

  async processQueue() {
    if (this.isProcessing) return;
    if (!navigator.onLine) return;

    this.isProcessing = true;

    let queue = this.getQueue();

    while (queue.length > 0 && navigator.onLine) {
      const current = queue[0];

      try {
        await fetch(`/api/data/${current.entity}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: current.action,
            ...current.payload,
          }),
        });

        // Remove operação processada
        queue.shift();
        this.setQueue(queue);
      } catch (error) {
        current.retries++;
        this.setQueue(queue);
        break; // sai e tenta depois
      }

      queue = this.getQueue();
    }

    this.isProcessing = false;
  }

  /* =========================
     INIT LISTENER
  ========================= */

  init() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.processQueue();
      });
    }
  }
}

export const eaSyncClient = new EASyncClient();
