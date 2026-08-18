// hooks/useEASyncSupabase.ts
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export function useEASyncSupabase<T>(entity: string) {
  // Chave única para o SWR e para o LocalStorage
  const CACHE_KEY = `ea_cache_${entity}`;

  // 1. Buscamos o dado inicial do LocalStorage (Instantâneo e seguro)
  const getLocalData = (): T[] => {
    if (typeof window === 'undefined') return [];
    try {
      const local = localStorage.getItem(CACHE_KEY);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  };

  // 2. Hook SWR: Busca no Supabase sem sobrescrever dados locais caso o banco esteja indisponível
  const { data, error, mutate, isValidating } = useSWR(
    entity,
    async () => {
      try {
        const { data: remoteData, error: supabaseError } = await supabase
          .from(entity)
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.warn(
            `[useEASyncSupabase] Supabase error for ${entity}:`,
            supabaseError,
          );
          return getLocalData();
        }

        const localData = getLocalData();
        if (!remoteData || remoteData.length === 0) {
          // Se o remoto estiver vazio mas já temos dados no cache local, preserva os locais
          if (localData && localData.length > 0) {
            return localData;
          }
          localStorage.setItem(CACHE_KEY, JSON.stringify([]));
          return [] as T[];
        }

        // Mesclagem segura: preserva registros criados localmente que ainda não foram sincronizados
        const remoteIds = new Set(
          remoteData.map((item: any) => String(item.id)),
        );
        const pendingLocal = localData.filter(
          (item: any) => item?.id && !remoteIds.has(String(item.id)),
        );

        const mergedData = [...pendingLocal, ...remoteData];
        localStorage.setItem(CACHE_KEY, JSON.stringify(mergedData));
        return mergedData as T[];
      } catch (err) {
        console.warn(
          `[useEASyncSupabase] Network/fetch error for ${entity}:`,
          err,
        );
        return getLocalData();
      }
    },
    {
      fallbackData: getLocalData(),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  // 3. Função de Salvar Otimista (Garante persistência local instantânea e sync com a nuvem)
  const save = async (
    payload: any,
    action: 'create' | 'update' | 'delete' = 'create',
  ) => {
    let currentUser: any = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      currentUser = authData?.user || null;
    } catch {
      currentUser = null;
    }

    const currentLocal = getLocalData();
    const previousData = data && data.length > 0 ? data : currentLocal;
    let newData = [...previousData];

    // Garante ID para criação
    const itemId =
      payload.id || (action === 'create' ? crypto.randomUUID() : payload.id);

    const itemWithId = {
      ...payload,
      id: itemId,
      owner_id: payload.owner_id || currentUser?.id || null,
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Atualização Otimista da UI e do LocalStorage
    if (action === 'create') {
      newData = [
        itemWithId,
        ...newData.filter((item: any) => String(item.id) !== String(itemId)),
      ];
    } else if (action === 'update') {
      newData = newData.map((item: any) =>
        String(item.id) === String(payload.id)
          ? { ...item, ...payload, updated_at: new Date().toISOString() }
          : item,
      );
    } else if (action === 'delete') {
      newData = newData.filter(
        (item: any) => String(item.id) !== String(payload.id),
      );
    }

    // Aplica imediatamente na tela e no cache local
    localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
    mutate(newData, false);

    // Tenta persistir no Supabase
    try {
      let result;
      if (action === 'create') {
        result = await supabase.from(entity).insert([itemWithId]);
      } else if (action === 'update') {
        result = await supabase
          .from(entity)
          .update(payload)
          .eq('id', payload.id);
      } else if (action === 'delete') {
        result = await supabase.from(entity).delete().eq('id', payload.id);
      }

      if (result?.error) {
        console.warn(
          `[useEASyncSupabase] Supabase save warning (${entity}):`,
          result.error,
        );
        toast.info('Salvo localmente no dispositivo');
        return true;
      }

      return true;
    } catch (err) {
      console.warn(`[useEASyncSupabase] Offline save for (${entity}):`, err);
      toast.info('Salvo localmente no dispositivo');
      return true;
    }
  };

  return {
    data: data || [],
    loading: isValidating && (!data || data.length === 0),
    isSyncing: isValidating,
    save,
    pull: () => mutate(),
  };
}
