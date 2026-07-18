// hooks/useEASyncSupabase.ts
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export function useEASyncSupabase<T>(entity: string) {
  // Chave única para o SWR e para o LocalStorage
  const CACHE_KEY = `ea_cache_${entity}`;

  // 1. Buscamos o dado inicial do LocalStorage (Instantâneo)
  const getLocalData = (): T[] => {
    if (typeof window === 'undefined') return [];
    const local = localStorage.getItem(CACHE_KEY);
    return local ? JSON.parse(local) : [];
  };

  // 2. Hook SWR: O cérebro da operação
  const { data, error, mutate, isValidating } = useSWR(
    entity,
    async () => {
      // Busca no Supabase
      const { data: remoteData, error: supabaseError } = await supabase
        .from(entity)
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Atualiza o LocalStorage com o que veio do banco
      localStorage.setItem(CACHE_KEY, JSON.stringify(remoteData));
      return remoteData as T[];
    },
    {
      fallbackData: getLocalData(), // Usa o local enquanto o remoto não chega
      revalidateOnFocus: false, // Não gasta internet ao trocar de aba
      revalidateOnReconnect: true, // Sincroniza se a internet voltar
      dedupingInterval: 10000, // Se o Rafael entrar e sair da tela em 10s, não faz nova requisição
    },
  );

  // 3. Função de Salvar Otimista (Salva na tela e no banco)
  const save = async (
    payload: any,
    action: 'create' | 'update' | 'delete' = 'create',
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const previousData = data || [];
    let newData = [...previousData];

    // Se for criação e não tiver ID, geramos um temporário para a UI não quebrar
    const itemWithId = {
      ...payload,
      id:
        payload.id || (action === 'create' ? crypto.randomUUID() : payload.id),
      owner_id: user.id,
    };

    // Atualização Otimista da UI
    if (action === 'create') newData = [itemWithId, ...newData];
    if (action === 'update')
      newData = newData.map((item) =>
        (item as any).id === payload.id ? payload : item,
      );
    if (action === 'delete')
      newData = newData.filter((item) => (item as any).id !== payload.id);

    // Aplica na tela na hora!
    mutate(newData, false);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newData));

    try {
      let result;
      if (action === 'create') {
        // Pega o ID do usuário logado para o owner_id
        const {
          data: { user },
        } = await supabase.auth.getUser();
        result = await supabase
          .from(entity)
          .insert([{ ...payload, owner_id: user?.id }]);
      } else if (action === 'update') {
        result = await supabase
          .from(entity)
          .update(payload)
          .eq('id', payload.id);
      } else if (action === 'delete') {
        result = await supabase.from(entity).delete().eq('id', payload.id);
      }

      if (result?.error) throw result.error;

      toast.success('Sincronizado com a nuvem');
      return true;
    } catch (err) {
      // Se falhar (ex: sem net), o SWR manterá o dado local.
      // Futuramente podemos implementar a fila de retentativa aqui.
      toast.error('Salvo localmente (offline)');
      return true;
    } finally {
      mutate(); // Revalida para garantir consistência
    }
  };

  return {
    data: data || [],
    loading: isValidating && data?.length === 0, // Só mostra loading se estiver vazio e buscando
    isSyncing: isValidating, // Para mostrar um micro-ícone de "sincronizando" se quiser
    save,
    pull: () => mutate(),
  };
}
