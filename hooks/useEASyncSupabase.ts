// hooks/useEASyncSupabase.ts
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

function isValidUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );
}

/**
 * Sanitiza o payload antes de enviar para o Supabase,
 * evitando erros de tipos (como strings vazias em campos UUID).
 */
function sanitizePayload(entity: string, item: any, userId?: string) {
  const clean: any = { ...item };

  // Garante que o ID seja um UUID válido ou gera um novo
  if (!clean.id || !isValidUUID(clean.id)) {
    clean.id = crypto.randomUUID();
  }

  // Tratamento de owner_id
  if (userId && isValidUUID(userId)) {
    clean.owner_id = userId;
  } else if (!clean.owner_id || !isValidUUID(clean.owner_id)) {
    delete clean.owner_id;
  }

  // Limpeza de campos vazios ou nulos desnecessários em relações de chaves estrangeiras
  if (entity === 'orcamentos') {
    if (clean.client_id && !isValidUUID(clean.client_id)) {
      clean.client_id = null;
    }
  }

  if (entity === 'clientes') {
    if (!clean.gender) clean.gender = 'masc';
    if (clean.photo) {
      clean.photo_url = clean.photo;
      delete clean.photo;
    }
  }

  return clean;
}

export function useEASyncSupabase<T>(entity: string) {
  // Chave única para o SWR e para o LocalStorage
  const CACHE_KEY = `ea_cache_${entity}`;

  // 1. Buscamos o dado inicial do LocalStorage (Instantâneo)
  const getLocalData = (): T[] => {
    if (typeof window === 'undefined') return [];
    try {
      const local = localStorage.getItem(CACHE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(
        `[EASyncSupabase] Erro ao ler LocalStorage para ${entity}:`,
        err,
      );
      return [];
    }
  };

  // 2. Hook SWR: Busca no Supabase sem quebrar se offline ou não autenticado
  const { data, error, mutate, isValidating } = useSWR(
    entity,
    async () => {
      console.log(
        `[EASyncSupabase] 🔄 Buscando dados remotos para '${entity}'...`,
      );
      try {
        const { data: remoteData, error: supabaseError } = await supabase
          .from(entity)
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.warn(
            `[EASyncSupabase] ⚠️ Aviso na consulta de '${entity}':`,
            supabaseError.message,
          );
          return getLocalData();
        }

        if (Array.isArray(remoteData)) {
          console.log(
            `[EASyncSupabase] ✅ '${entity}' sincronizado com sucesso (${remoteData.length} registros).`,
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify(remoteData));
          }
          return remoteData as T[];
        }

        return getLocalData();
      } catch (err: any) {
        console.error(
          `[EASyncSupabase] ❌ Falha na sincronização de '${entity}':`,
          err,
        );
        return getLocalData();
      }
    },
    {
      fallbackData: getLocalData(),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 8000,
    },
  );

  // 3. Função de Salvar Otimista (Salva na tela, no LocalStorage e no Supabase)
  const save = async (
    payload: any,
    action: 'create' | 'update' | 'delete' = 'create',
  ): Promise<any> => {
    console.log(
      `[EASyncSupabase] 💾 Executando ${action.toUpperCase()} em '${entity}':`,
      payload,
    );

    let authUser: any = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      authUser = authData?.user || null;
    } catch {
      // Continua caso não haja autenticação ativa
    }

    const previousData = Array.isArray(data) ? data : getLocalData();
    let newData = [...previousData];

    // Sanitiza e gera UUID consistente
    const sanitizedItem = sanitizePayload(entity, payload, authUser?.id);
    const targetId = sanitizedItem.id;

    // Atualização Otimista da UI e LocalStorage
    if (action === 'create') {
      newData = [
        sanitizedItem,
        ...newData.filter((item: any) => item.id !== targetId),
      ];
    } else if (action === 'update') {
      newData = newData.map((item: any) =>
        item.id === targetId ? { ...item, ...sanitizedItem } : item,
      );
    } else if (action === 'delete') {
      newData = newData.filter((item: any) => item.id !== targetId);
    }

    // Aplica na tela e cache local imediatamente
    mutate(newData, false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
    }

    // Sincroniza com o Supabase
    try {
      let result: any = null;

      if (action === 'create') {
        result = await supabase.from(entity).insert([sanitizedItem]).select();
      } else if (action === 'update') {
        result = await supabase
          .from(entity)
          .update(sanitizedItem)
          .eq('id', targetId)
          .select();
      } else if (action === 'delete') {
        result = await supabase.from(entity).delete().eq('id', targetId);
      }

      if (result?.error) {
        console.error(
          `[EASyncSupabase] ❌ Erro retornado pelo Supabase em '${entity}':`,
          result.error,
        );
        toast.info('Salvo localmente no dispositivo');
        return sanitizedItem;
      }

      console.log(
        `[EASyncSupabase] 🚀 Sucesso ao persistir no Supabase '${entity}':`,
        result?.data || result,
      );
      toast.success(
        action === 'delete'
          ? 'Removido com sucesso'
          : action === 'create'
            ? 'Cadastrado e sincronizado com a nuvem'
            : 'Atualizado com sucesso',
      );

      return sanitizedItem;
    } catch (err: any) {
      console.error(
        `[EASyncSupabase] ❌ Exceção ao sincronizar com nuvem em '${entity}':`,
        err,
      );
      toast.info('Salvo no dispositivo (modo offline)');
      return sanitizedItem;
    } finally {
      mutate(); // Revalidação para sincronização final
    }
  };

  return {
    data: Array.isArray(data) ? data : [],
    loading: isValidating && (!data || data.length === 0),
    isSyncing: isValidating,
    save,
    pull: () => mutate(),
  };
}
