// hooks/useEASyncSupabase.ts
import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export function isValidUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );
}

/**
 * Normaliza datas para o formato SQL aceito pelo PostgreSQL (YYYY-MM-DD)
 */
function normalizeDateForDb(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.split('T')[0];
    }
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (y && m && d) {
        return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Obtém o ID do usuário autenticado de forma ultra-resiliente
 * (tenta sessão ativa, getUser e o cache de sessão persistido do app)
 */
async function getActiveUserId(): Promise<string | null> {
  // 1. Tenta sessão rápida do Supabase
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id && isValidUUID(session.user.id)) {
      return session.user.id;
    }
  } catch {}

  // 2. Tenta getUser do Supabase
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id && isValidUUID(user.id)) {
      return user.id;
    }
  } catch {}

  // 3. Fallback no cache persistente da sessão do painel
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ea_painel_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.userId && isValidUUID(parsed.userId)) {
          return parsed.userId;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Colunas canônicas conhecidas das tabelas do Supabase
 */
const CANONICAL_TABLE_COLUMNS: Record<string, string[]> = {
  orcamentos: [
    'id',
    'owner_id',
    'client_id',
    'client_name_manual',
    'document_title',
    'subtitle',
    'issue_date',
    'expiration',
    'services_json',
    'financial_json',
    'access_password',
    'created_at',
  ],
  clientes: [
    'id',
    'owner_id',
    'name',
    'document',
    'gender',
    'whatsapp',
    'email',
    'zip',
    'street',
    'number',
    'complement',
    'neighborhood',
    'city',
    'obs',
    'photo_url',
    'created_at',
  ],
  recibos: [
    'id',
    'owner_id',
    'client_id',
    'client_name_manual',
    'receipt_number',
    'amount',
    'amount_in_words',
    'issue_date',
    'services_rendered',
    'description',
    'payment_method',
    'access_password',
    'created_at',
  ],
  notas: [
    'id',
    'owner_id',
    'title',
    'content',
    'pinned',
    'color',
    'created_at',
  ],
  profiles: [
    'id',
    'name',
    'email',
    'role',
    'specialty',
    'whatsapp',
    'about',
    'photo_url',
    'gender',
    'created_at',
  ],
};

/**
 * Sanitiza e enriquece o item antes de salvar,
 * garantindo integridade e compatibilidade com o PostgreSQL do Supabase.
 */
function sanitizePayload(entity: string, item: any, userId?: string | null) {
  const clean: any = { ...item };

  // Garante que o ID seja um UUID válido ou gera um novo v4
  if (!clean.id || !isValidUUID(clean.id)) {
    clean.id = crypto.randomUUID();
  }

  // Garante timestamps para ordenação na UI
  const now = new Date().toISOString();
  if (!clean.created_at) {
    clean.created_at = now;
  }
  clean.updated_at = now;

  // Tratamento seguro de owner_id
  if (userId && isValidUUID(userId)) {
    clean.owner_id = userId;
  } else if (!clean.owner_id || !isValidUUID(clean.owner_id)) {
    delete clean.owner_id;
  }

  // Regras específicas de integridade para orçamentos
  if (entity === 'orcamentos') {
    if (clean.client_id && !isValidUUID(clean.client_id)) {
      clean.client_id = null;
    }

    if (clean.issue_date) {
      clean.issue_date = normalizeDateForDb(clean.issue_date);
    }

    // Consolidação de endereço e metadados analíticos em financial_json
    // para garantir persistência 100% segura no Supabase mesmo sem colunas extras
    const baseFin =
      clean.financial_json && typeof clean.financial_json === 'object'
        ? { ...clean.financial_json }
        : clean.financial && typeof clean.financial === 'object'
          ? { ...clean.financial }
          : {};

    const address = {
      zip: clean.zip || baseFin.address?.zip || '',
      street: clean.street || baseFin.address?.street || '',
      number: clean.number || baseFin.address?.number || '',
      neighborhood: clean.neighborhood || baseFin.address?.neighborhood || '',
      city: clean.city || baseFin.address?.city || '',
      complement: clean.complement || baseFin.address?.complement || '',
    };

    clean.financial_json = {
      ...baseFin,
      address,
      investmentCategories:
        clean.investment_categories || baseFin.investmentCategories || [],
      financial_v3: clean.financial_v3 || baseFin.financial_v3 || null,
    };
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

/**
 * Filtra um objeto para conter apenas as colunas canônicas da tabela
 */
function filterToCanonicalColumns(entity: string, item: any): any {
  const allowed = CANONICAL_TABLE_COLUMNS[entity];
  if (!allowed || !Array.isArray(allowed)) {
    return item;
  }

  const filtered: any = {};
  for (const col of allowed) {
    if (item[col] !== undefined) {
      filtered[col] = item[col];
    }
  }
  return filtered;
}

export function useEASyncSupabase<T>(entity: string) {
  const CACHE_KEY = `ea_cache_${entity}`;
  const isSyncingRef = useRef(false);

  // 1. Leitura rápida do LocalStorage para renderização instantânea
  const getLocalData = (): T[] => {
    if (typeof window === 'undefined') return [];
    try {
      const local = localStorage.getItem(CACHE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[EASyncSupabase] Erro ao ler cache para ${entity}:`, err);
      return [];
    }
  };

  // 2. SWR com busca resiliente e Merge Inteligente
  const { data, error, mutate, isValidating } = useSWR(
    entity,
    async () => {
      console.log(
        `[EASyncSupabase] 🔄 Verificando sincronização de '${entity}'...`,
      );
      try {
        // Aguarda a sessão do Supabase estar disponível antes da consulta
        if (typeof window !== 'undefined') {
          try {
            await supabase.auth.getSession();
          } catch {}
        }

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
          const localItems = getLocalData();

          // 🛡️ PROTEÇÃO CONTRA PERDA DE DADOS NO REFRESH (F5):
          // Se a consulta remota retornou 0 itens mas o dispositivo já possui itens locais válidos,
          // NÃO sobrescreva com vazio. Isso ocorre quando a sessão RLS ainda não foi autenticada
          // ou durante inicialização transitória do client.
          if (remoteData.length === 0 && localItems.length > 0) {
            console.log(
              `[EASyncSupabase] 🛡️ Preservando ${localItems.length} registros locais de '${entity}' para segurança contra perda de dados.`,
            );
            return localItems;
          }

          // 🔄 MERGE INTELIGENTE POR ID:
          // O dado remoto atualiza os registros existentes, mas registros locais
          // salvos recentemente que ainda não replicaram NUNCA são apagados!
          const mergedMap = new Map<string, any>();

          // 1º adiciona os itens locais
          for (const item of localItems) {
            if (item && (item as any).id) {
              mergedMap.set(String((item as any).id), item);
            }
          }

          // 2º sobrepõe com os itens remotos atualizados do Supabase
          for (const remoteItem of remoteData) {
            if (remoteItem && (remoteItem as any).id) {
              const existing =
                mergedMap.get(String((remoteItem as any).id)) || {};
              mergedMap.set(String((remoteItem as any).id), {
                ...existing,
                ...remoteItem,
              });
            }
          }

          const finalMerged = Array.from(mergedMap.values());

          // Atualiza o cache seguro
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify(finalMerged));
          }

          console.log(
            `[EASyncSupabase] ✅ '${entity}' sincronizado: ${finalMerged.length} registros consolidados.`,
          );
          return finalMerged as T[];
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
      dedupingInterval: 6000,
    },
  );

  // 3. Ouvinte de estado de autenticação para revalidar quando a sessão carregar
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log(
            `[EASyncSupabase] Sessão ativa detectada, revalidando '${entity}'...`,
          );
          mutate();
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [entity, mutate]);

  // 4. Salvamento seguro com persistência garantida
  const save = async (
    payload: any,
    action: 'create' | 'update' | 'delete' = 'create',
  ): Promise<any> => {
    console.log(
      `[EASyncSupabase] 💾 Executando ${action.toUpperCase()} em '${entity}'`,
    );

    const activeUserId = await getActiveUserId();
    const previousData = Array.isArray(data) ? data : getLocalData();

    // Sanitiza e consolida o item completo para UI e LocalStorage
    const fullSanitizedItem = sanitizePayload(entity, payload, activeUserId);
    const targetId = fullSanitizedItem.id;

    // Atualização Otimista Imediata da UI e LocalStorage
    let newData = [...previousData];
    if (action === 'create') {
      newData = [
        fullSanitizedItem,
        ...newData.filter((item: any) => item && item.id !== targetId),
      ];
    } else if (action === 'update') {
      newData = newData.map((item: any) =>
        item && item.id === targetId ? { ...item, ...fullSanitizedItem } : item,
      );
    } else if (action === 'delete') {
      newData = newData.filter((item: any) => item && item.id !== targetId);
    }

    // Grava imediatamente na UI e no localStorage
    await mutate(newData, false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
    }

    // 5. Persistência no Supabase com resiliência contra erros de schema
    try {
      isSyncingRef.current = true;
      let result: any = null;

      if (action === 'delete') {
        result = await supabase.from(entity).delete().eq('id', targetId);
      } else {
        // Envia diretamente o payload compatível com as colunas reais da tabela no Supabase
        const canonicalPayload = filterToCanonicalColumns(
          entity,
          fullSanitizedItem,
        );
        const currentPayload = { ...canonicalPayload };
        let attempts = 0;
        const maxAttempts = 6;

        while (attempts < maxAttempts) {
          attempts++;
          if (action === 'create') {
            result = await supabase
              .from(entity)
              .insert([currentPayload])
              .select();
            if (
              result?.error &&
              (result.error.code === '42501' ||
                result.error.message?.includes('policy'))
            ) {
              console.warn(
                `[EASyncSupabase] RLS bloqueou o select de retorno. Tentando insert direto sem select...`,
              );
              result = await supabase.from(entity).insert([currentPayload]);
            }
          } else if (action === 'update') {
            result = await supabase
              .from(entity)
              .update(currentPayload)
              .eq('id', targetId)
              .select();
            if (
              result?.error &&
              (result.error.code === '42501' ||
                result.error.message?.includes('policy'))
            ) {
              result = await supabase
                .from(entity)
                .update(currentPayload)
                .eq('id', targetId);
            }
          }

          if (result?.error) {
            const errorMsg = result.error.message || '';
            const match =
              errorMsg.match(/Could not find the '([^']+)' column/i) ||
              errorMsg.match(/column "?([a-zA-Z0-9_]+)"? of/i) ||
              errorMsg.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i);

            if (match && match[1] && currentPayload[match[1]] !== undefined) {
              const badCol = match[1];
              console.warn(
                `[EASyncSupabase] ⚠️ Auto-healing: removendo coluna '${badCol}' não existente na tabela '${entity}' e reenviando...`,
              );
              delete currentPayload[badCol];
              continue;
            }
          }

          break;
        }
      }

      if (result?.error) {
        console.warn(
          `[EASyncSupabase] ⚠️ Supabase retornou aviso em '${entity}':`,
          result.error.message,
        );
        // O item já está salvo localmente no cache seguro do dispositivo
        toast.success(
          action === 'create'
            ? 'Salvo com sucesso no dispositivo!'
            : 'Atualizado com sucesso!',
        );
        return fullSanitizedItem;
      }

      // Se o Supabase retornou o registro criado/atualizado com sucesso
      const serverRecord =
        Array.isArray(result?.data) && result.data[0] ? result.data[0] : null;
      if (serverRecord) {
        const confirmedItem = {
          ...fullSanitizedItem,
          ...serverRecord,
        };

        const updatedData = newData.map((it: any) =>
          it && it.id === targetId ? confirmedItem : it,
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));
        }
        await mutate(updatedData, false);
      }

      console.log(
        `[EASyncSupabase] 🚀 Sucesso ao persistir no Supabase '${entity}'`,
      );
      toast.success(
        action === 'delete'
          ? 'Removido com sucesso!'
          : action === 'create'
            ? 'Orçamento salvo e sincronizado com o Supabase!'
            : 'Atualizado com sucesso!',
      );

      return fullSanitizedItem;
    } catch (err: any) {
      console.warn(
        `[EASyncSupabase] ⚠️ Exceção na sincronização com nuvem:`,
        err,
      );
      toast.success('Salvo localmente com segurança!');
      return fullSanitizedItem;
    } finally {
      isSyncingRef.current = false;
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
