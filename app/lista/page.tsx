'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle,
  Package,
  ShoppingCart,
  Users,
  Receipt,
  ShareNetwork,
  Printer,
  PencilSimple,
  Plus,
  Minus,
  X,
  WhatsappLogo,
  Warning,
  Coins,
  CaretDown,
  ChatText,
  Link as LinkIcon,
  Copy,
  Check,
  CloudCheck,
  ArrowsClockwise,
} from '@phosphor-icons/react';

interface MaterialItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
  description?: string;
  unitPrice?: string;
  purchasedQty?: number;
  actualUnitPrice?: string;
}

interface ClientItemEdit {
  checked: boolean;
  purchasedQty?: number;
  actualUnitPrice?: string;
}

interface MaterialList {
  id: string;
  title: string;
  items: MaterialItem[];
  createdAt: number;
  updatedAt?: number;
  sharedAt?: number;
  clientName?: string;
  orcamentoName?: string;
  clientEdits?: Record<string, ClientItemEdit>;
}

// Prefixo e chave para ofuscação binária segura (não legível para leigos na URL e URL-safe)
const OBFUSCATE_PREFIX = 'eart_v2_';
const MASK_KEY = [0x45, 0x41, 0x5f, 0x32, 0x30, 0x32, 0x36]; // 'EA_2026'

function encodePayload(data: unknown): string {
  const jsonStr = JSON.stringify(data);
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  const masked = new Uint8Array(utf8Bytes.length);
  for (let i = 0; i < utf8Bytes.length; i++) {
    masked[i] = utf8Bytes[i] ^ MASK_KEY[i % MASK_KEY.length];
  }
  let binary = '';
  for (let i = 0; i < masked.length; i++) {
    binary += String.fromCharCode(masked[i]);
  }
  const b64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${OBFUSCATE_PREFIX}${b64}`;
}

function decodePayload(raw: string): MaterialList | null {
  if (!raw) return null;

  // 1. Formato novo com ofuscação binária e proteção contra leitura a olho nu
  if (raw.startsWith(OBFUSCATE_PREFIX)) {
    try {
      const cleanB64 = raw
        .substring(OBFUSCATE_PREFIX.length)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const full = cleanB64.padEnd(
        cleanB64.length + ((4 - (cleanB64.length % 4)) % 4),
        '=',
      );
      const binary = atob(full);
      const masked = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        masked[i] = binary.charCodeAt(i) ^ MASK_KEY[i % MASK_KEY.length];
      }
      const jsonStr = new TextDecoder().decode(masked);
      return JSON.parse(jsonStr) as MaterialList;
    } catch (err) {
      console.error('Erro ao decodificar payload ofuscado v2:', err);
    }
  }

  // 2. Fallback retrocompatível para Base64 convencional encodeURIComponent
  try {
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/');
    const full = padded.padEnd(
      padded.length + ((4 - (padded.length % 4)) % 4),
      '=',
    );
    const jsonStr = decodeURIComponent(atob(full));
    return JSON.parse(jsonStr) as MaterialList;
  } catch {
    try {
      const padded = raw.replace(/-/g, '+').replace(/_/g, '/');
      const full = padded.padEnd(
        padded.length + ((4 - (padded.length % 4)) % 4),
        '=',
      );
      const binary = atob(full);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr) as MaterialList;
    } catch (err2) {
      console.error('Erro no fallback de decodificação:', err2);
      return null;
    }
  }
}

// Utilitário para separar número e unidade (ex: "9 un", "100m", "5")
function parseQuantity(qtyStr?: string): { number: number; unit: string } {
  if (!qtyStr) return { number: 1, unit: 'un' };
  const clean = qtyStr.trim();
  const match = clean.match(/^([\d.,]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1].replace(',', '.')) || 1;
    const unit = match[2] ? match[2].trim() : 'un';
    return { number: num, unit: unit || 'un' };
  }
  return { number: 1, unit: 'un' };
}

function parseCurrency(priceStr?: string): number {
  if (!priceStr) return 0;
  const p = parseFloat(
    priceStr
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, ''),
  );
  return isNaN(p) ? 0 : p;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ListContent() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<MaterialList | null>(null);
  const [error, setError] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Customizações do cliente (quantidade comprada, preço pago real, check)
  const [itemEdits, setItemEdits] = useState<Record<string, ClientItemEdit>>(
    {},
  );
  const [isLoadedFromSharedLink, setIsLoadedFromSharedLink] = useState(false);

  // Controle do menu flutuante e sobreposto de envio
  const [isSendMenuOpen, setIsSendMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Item selecionado para edição detalhada no Modal
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [editPrice, setEditPrice] = useState<string>('');

  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sincronização resiliente em background com Supabase (quando a lista tem ID)
  const syncWithSupabase = (
    listId: string,
    currentItems: MaterialItem[],
    edits: Record<string, ClientItemEdit>,
  ) => {
    if (!listId || listId.length < 5) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    setSyncStatus('saving');
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedItems = currentItems.map((it) => {
          const edit = edits[it.id];
          const req = parseQuantity(it.quantity);
          const isChecked = edit?.checked ?? it.checked ?? false;
          return {
            ...it,
            checked: isChecked,
            purchasedQty:
              edit?.purchasedQty !== undefined
                ? edit.purchasedQty
                : isChecked
                  ? req.number
                  : undefined,
            actualUnitPrice:
              edit?.actualUnitPrice !== undefined
                ? edit.actualUnitPrice
                : it.actualUnitPrice || it.unitPrice || '',
          };
        });

        let synced = false;

        // 1. Tenta sincronizar via Server API Route (ignora RLS)
        try {
          const res = await fetch(`/api/lista/${encodeURIComponent(listId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updatedItems }),
          });
          if (res.ok) {
            synced = true;
          }
        } catch (apiErr) {
          console.warn(
            '[ListaPublica] Aviso na sincronização via API:',
            apiErr,
          );
        }

        // 2. Fallback via cliente direto do Supabase
        if (!synced) {
          try {
            const supabase = createClient();
            const { error: updateErr } = await supabase
              .from('listas_materiais')
              .update({
                items: updatedItems,
                updated_at: new Date().toISOString(),
              })
              .eq('id', listId);

            if (!updateErr) {
              synced = true;
            } else {
              console.warn(
                '[ListaPublica] Aviso na sincronização direta Supabase:',
                updateErr.message,
              );
            }
          } catch (dbErr) {
            console.warn('[ListaPublica] Erro no cliente Supabase:', dbErr);
          }
        }

        if (synced) {
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 3500);
        } else {
          setSyncStatus('error');
        }
      } catch (e) {
        console.error('[ListaPublica] Erro na sincronização:', e);
        setSyncStatus('error');
      }
    }, 600);
  };

  useEffect(() => {
    const listId = searchParams.get('id');
    const d = searchParams.get('d');

    const loadList = async () => {
      // 1. ESTRATÉGIA PRIORITÁRIA: Carregamento por ID direto do Banco Compartilhado (Link Curto)
      if (listId) {
        setIsLoadingDb(true);
        setError(false);
        try {
          let row: any = null;

          // 1.1 Tenta carregar pela rota de API do servidor (/api/lista/[id]) que possui permissão de leitura
          try {
            const apiRes = await fetch(
              `/api/lista/${encodeURIComponent(listId)}`,
              {
                cache: 'no-store',
              },
            );
            if (apiRes.ok) {
              const resJson = await apiRes.json();
              if (resJson?.data) {
                row = resJson.data;
              }
            }
          } catch (apiErr) {
            console.warn(
              '[ListaPublica] Tentativa via API route falhou, tentando cliente direto:',
              apiErr,
            );
          }

          // 1.2 Fallback: Tenta cliente Supabase do browser
          if (!row) {
            try {
              const supabase = createClient();
              const { data: dbRow, error: fetchErr } = await supabase
                .from('listas_materiais')
                .select('*')
                .eq('id', listId)
                .maybeSingle();

              if (!fetchErr && dbRow) {
                row = dbRow;
              } else if (fetchErr) {
                console.warn(
                  '[ListaPublica] Aviso ao consultar Supabase direto:',
                  fetchErr.message,
                );
              }
            } catch (clientErr) {
              console.warn(
                '[ListaPublica] Erro no cliente direto do Supabase:',
                clientErr,
              );
            }
          }

          if (row) {
            let parsedItems: MaterialItem[] = [];
            if (typeof row.items === 'string') {
              try {
                parsedItems = JSON.parse(row.items);
              } catch {}
            } else if (Array.isArray(row.items)) {
              parsedItems = row.items;
            }

            const loadedList: MaterialList = {
              id: row.id,
              title: row.title || 'Lista de Materiais',
              items: parsedItems,
              createdAt: row.created_at
                ? new Date(row.created_at).getTime()
                : Date.now(),
              updatedAt: row.updated_at
                ? new Date(row.updated_at).getTime()
                : Date.now(),
              clientName: row.client_name || '',
              orcamentoName: row.orcamento_name || '',
            };

            setList(loadedList);

            // Reconstrução inteligente das marcações e valores salvos
            const editsKey = `@ea:public-list-edits:${row.id}`;
            const storedEdits = localStorage.getItem(editsKey);
            const initialEdits: Record<string, ClientItemEdit> = {};

            parsedItems.forEach((it) => {
              if (
                it.checked ||
                it.purchasedQty !== undefined ||
                it.actualUnitPrice
              ) {
                const req = parseQuantity(it.quantity);
                initialEdits[it.id] = {
                  checked: Boolean(it.checked),
                  purchasedQty:
                    it.purchasedQty !== undefined
                      ? it.purchasedQty
                      : it.checked
                        ? req.number
                        : 0,
                  actualUnitPrice: it.actualUnitPrice || it.unitPrice || '',
                };
              }
            });

            if (storedEdits) {
              try {
                const local = JSON.parse(storedEdits);
                Object.assign(initialEdits, local);
              } catch {}
            }

            setItemEdits(initialEdits);
            setIsLoadedFromSharedLink(true);
            setIsLoadingDb(false);
            return;
          } else {
            console.error(
              '[ListaPublica] Lista não encontrada no banco para ID:',
              listId,
            );
            setError(true);
            setIsLoadingDb(false);
            return;
          }
        } catch (err) {
          console.error('[ListaPublica] Falha ao carregar do banco:', err);
          setError(true);
          setIsLoadingDb(false);
          return;
        }
      }

      // 2. FALLBACK RETROCOMPATÍVEL: Decodificação de payload 'd' na URL
      if (d) {
        try {
          const decoded = decodePayload(d);
          if (!decoded || !decoded.items) {
            throw new Error('Lista inválida ou corrompida');
          }
          setList(decoded);

          // Carrega edição do cliente gravada localmente no navegador
          const editsKey = `@ea:public-list-edits:${decoded.id}`;
          const storedEdits = localStorage.getItem(editsKey);

          // Verifica se o link traz marcações ou estado atualizado explícito compartilhado
          const hasSharedState =
            Boolean(decoded.sharedAt) ||
            Boolean(
              decoded.clientEdits &&
              Object.keys(decoded.clientEdits).length > 0,
            ) ||
            decoded.items.some(
              (it) => it.checked || it.purchasedQty !== undefined,
            );

          if (hasSharedState) {
            const reconstructed: Record<string, ClientItemEdit> = {
              ...(decoded.clientEdits || {}),
            };

            decoded.items.forEach((it) => {
              if (!reconstructed[it.id]) {
                const req = parseQuantity(it.quantity);
                if (it.checked || it.purchasedQty !== undefined) {
                  reconstructed[it.id] = {
                    checked: it.checked ?? false,
                    purchasedQty:
                      it.purchasedQty !== undefined
                        ? it.purchasedQty
                        : it.checked
                          ? req.number
                          : 0,
                    actualUnitPrice: it.actualUnitPrice ?? it.unitPrice ?? '',
                  };
                }
              }
            });

            setItemEdits(reconstructed);
            localStorage.setItem(editsKey, JSON.stringify(reconstructed));
            setIsLoadedFromSharedLink(true);
          } else if (storedEdits) {
            try {
              setItemEdits(JSON.parse(storedEdits));
            } catch (e) {
              console.error('Erro ao ler edições:', e);
            }
          } else {
            // Migração retrocompatível de marcações antigas se houver
            const legacyKey = `@ea:public-list-checked:${decoded.id}`;
            const legacyRaw = localStorage.getItem(legacyKey);
            if (legacyRaw) {
              const legacyMap = JSON.parse(legacyRaw) as Record<
                string,
                boolean
              >;
              const initialEdits: Record<string, ClientItemEdit> = {};
              decoded.items.forEach((it) => {
                if (legacyMap[it.id]) {
                  const parsed = parseQuantity(it.quantity);
                  initialEdits[it.id] = {
                    checked: true,
                    purchasedQty: parsed.number,
                    actualUnitPrice: it.unitPrice || '',
                  };
                }
              });
              setItemEdits(initialEdits);
              localStorage.setItem(editsKey, JSON.stringify(initialEdits));
            }
          }
        } catch (e) {
          console.error('Erro ao decodificar lista:', e);
          setError(true);
        }
      } else {
        setError(true);
      }
    };

    loadList();
  }, [searchParams]);

  // Salva no localStorage e sincroniza no banco sempre que houver alterações
  const saveEdits = (
    newEdits: Record<string, ClientItemEdit>,
    currentItems?: MaterialItem[],
  ) => {
    setItemEdits(newEdits);
    const itemsToSave = currentItems || list?.items || [];
    if (list?.id) {
      try {
        localStorage.setItem(
          `@ea:public-list-edits:${list.id}`,
          JSON.stringify(newEdits),
        );
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }
      syncWithSupabase(list.id, itemsToSave, newEdits);
    }
  };

  // Toggle simples ao clicar na caixa circular de check (Card Antigo)
  const handleToggle = (itemId: string) => {
    if (!list) return;
    const targetItem = list.items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const currentChecked =
      itemEdits[itemId]?.checked ?? targetItem.checked ?? false;
    const newChecked = !currentChecked;
    const req = parseQuantity(targetItem.quantity);

    const updatedItems = list.items.map((it) =>
      it.id === itemId ? { ...it, checked: newChecked } : it,
    );
    setList({ ...list, items: updatedItems });

    const newEdits = {
      ...itemEdits,
      [itemId]: {
        checked: newChecked,
        purchasedQty: newChecked ? req.number : 0,
        actualUnitPrice: targetItem.unitPrice || '',
      },
    };

    saveEdits(newEdits, updatedItems);
  };

  // Abrir Modal de Edição do Item (Componente Antigo)
  const openEditModal = (item: MaterialItem) => {
    setEditingItem({ ...item });
  };

  // Atualiza campo do item em edição no modal antigo
  const handleUpdateField = (field: keyof MaterialItem, value: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      [field]: value,
    });
  };

  // Salvar alterações do Modal antigo
  const handleSaveModal = () => {
    if (!editingItem || !list) return;

    const updatedItems = list.items.map((it) =>
      it.id === editingItem.id ? editingItem : it,
    );
    setList({ ...list, items: updatedItems });

    const req = parseQuantity(editingItem.quantity);
    const newEdits = {
      ...itemEdits,
      [editingItem.id]: {
        checked: editingItem.checked ?? false,
        purchasedQty: editingItem.checked ? req.number : 0,
        actualUnitPrice: editingItem.unitPrice || '',
      },
    };

    saveEdits(newEdits, updatedItems);
    setEditingItem(null);
  };

  // Gera URL curta oficial (via ID) ou fallback codificado se não houver ID
  const getUpdatedShareUrl = () => {
    if (!list) return typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/lista';

    // 1. LINK CURTO DEFINITIVO: Se possui ID, compartilha URL super limpa e imune a truncamento
    if (list.id && list.id.length > 5) {
      return `${origin}${pathname}?id=${encodeURIComponent(list.id)}`;
    }

    // 2. FALLBACK RETROCOMPATÍVEL: URL com payload embutido
    const consolidatedItems: MaterialItem[] = list.items.map((it) => {
      const edit = itemEdits[it.id];
      const req = parseQuantity(it.quantity);
      const isChecked = edit?.checked ?? it.checked ?? false;
      return {
        ...it,
        checked: isChecked,
        purchasedQty:
          edit?.purchasedQty !== undefined
            ? edit.purchasedQty
            : isChecked
              ? req.number
              : undefined,
        actualUnitPrice:
          edit?.actualUnitPrice !== undefined
            ? edit.actualUnitPrice
            : it.unitPrice,
      };
    });

    const updatedList: MaterialList = {
      ...list,
      items: consolidatedItems,
      updatedAt: Date.now(),
      sharedAt: Date.now(),
      clientEdits: itemEdits,
    };

    const payload = encodePayload(updatedList);
    return `${origin}${pathname}?d=${payload}`;
  };

  const handleShare = () => {
    const updatedUrl = getUpdatedShareUrl();
    if (navigator.share) {
      navigator
        .share({
          title: list?.title || 'Lista de Materiais',
          text: `Lista de materiais atualizada`,
          url: updatedUrl,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(updatedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Opção 1: Enviar Resumo em Texto no WhatsApp (como funciona hoje)
  const handleSendWhatsappSummary = () => {
    if (!list) return;
    setIsSendMenuOpen(false);

    let totalGasto = 0;
    let itensCompletos = 0;
    const itensParciais: string[] = [];
    const itensNaoComprados: string[] = [];

    list.items.forEach((it) => {
      const edit = itemEdits[it.id];
      const req = parseQuantity(it.quantity);
      const isChecked = edit?.checked ?? false;
      const purchased =
        edit?.purchasedQty !== undefined
          ? edit.purchasedQty
          : isChecked
            ? req.number
            : 0;
      const unitP = parseCurrency(edit?.actualUnitPrice || it.unitPrice);

      if (isChecked && purchased > 0) {
        totalGasto += purchased * unitP;
        if (purchased < req.number) {
          const falta = req.number - purchased;
          itensParciais.push(
            `• *${it.name}*: comprou ${purchased} ${req.unit} (faltam ${falta} ${req.unit})`,
          );
        } else {
          itensCompletos++;
        }
      } else {
        itensNaoComprados.push(`• *${it.name}*: ${req.number} ${req.unit}`);
      }
    });

    let msg = `📋 *Resumo de Compras - ${list.title}*\n`;
    if (list.clientName) msg += `👤 *Cliente:* ${list.clientName}\n`;
    if (list.orcamentoName) msg += `🏗️ *Obra / Ref:* ${list.orcamentoName}\n`;
    msg += `---------------------------------\n`;
    msg += `✅ *Itens 100% Atendidos:* ${itensCompletos} de ${list.items.length}\n`;
    if (totalGasto > 0) {
      msg += `💰 *Total Investido / Gasto:* R$ ${formatBRL(totalGasto)}\n`;
    }

    if (itensParciais.length > 0) {
      msg += `\n⚠️ *Compras Parciais (Faltou estoque):*\n${itensParciais.join('\n')}\n`;
    }

    if (itensNaoComprados.length > 0) {
      msg += `\n⏳ *Ainda Não Comprados:*\n${itensNaoComprados.join('\n')}\n`;
    }

    msg += `\nLink da lista atualizada: ${getUpdatedShareUrl()}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Opção 2: Enviar Link da Lista Atualizada com os valores e marcações codificados na URL
  const handleSendWhatsappUpdatedLink = () => {
    if (!list) return;
    setIsSendMenuOpen(false);
    const updatedUrl = getUpdatedShareUrl();

    let totalGasto = 0;
    let marcadosCount = 0;
    list.items.forEach((it) => {
      const edit = itemEdits[it.id];
      const req = parseQuantity(it.quantity);
      const isChecked = edit?.checked ?? false;
      const purchased =
        edit?.purchasedQty !== undefined
          ? edit.purchasedQty
          : isChecked
            ? req.number
            : 0;
      const unitP = parseCurrency(edit?.actualUnitPrice || it.unitPrice);
      if (isChecked) marcadosCount++;
      if (isChecked && purchased > 0) {
        totalGasto += purchased * unitP;
      }
    });

    const pct =
      list.items.length > 0
        ? Math.round((marcadosCount / list.items.length) * 100)
        : 0;

    let msg = `📋 *Lista de Materiais Atualizada: ${list.title}*\n`;
    if (list.clientName) msg += `👤 *Cliente:* ${list.clientName}\n`;
    if (list.orcamentoName) msg += `🏗️ *Obra / Ref:* ${list.orcamentoName}\n`;
    msg += `---------------------------------\n`;
    msg += `📊 *Progresso Atual:* ${marcadosCount} de ${list.items.length} itens marcados (${pct}%)\n`;
    if (totalGasto > 0) {
      msg += `💰 *Total Investido:* R$ ${formatBRL(totalGasto)}\n`;
    }
    msg += `\n🔗 *Acesse a lista interativa com os itens já marcados e atualizados:*\n${updatedUrl}\n\n`;
    msg += `_(Ao abrir o link acima, a lista carregará o estado exato com as quantidades compradas e valores atualizados)_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyUpdatedLink = () => {
    const updatedUrl = getUpdatedShareUrl();
    navigator.clipboard.writeText(updatedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A] p-4 text-center">
        <div className="bg-white dark:bg-[#1C1F26] p-8 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} weight="duotone" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">
            Erro ao carregar lista
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            O link fornecido pode estar quebrado, incompleto ou corrompido.
          </p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A]">
        <div className="w-10 h-10 border-4 border-[#00559c]/20 border-t-[#00559c] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Carregando materiais...
        </p>
      </div>
    );
  }

  // Cálculos consolidados da lista
  const totalItemsCount = list.items.length;
  let checkedCount = 0;
  let totalEstimadoLista = 0;

  list.items.forEach((it) => {
    const isChecked = Boolean(it.checked);
    const req = parseQuantity(it.quantity);
    const unitP = parseCurrency(it.unitPrice);

    if (isChecked) {
      checkedCount++;
    }
    if (unitP > 0) {
      totalEstimadoLista += req.number * unitP;
    }
  });

  const progress =
    totalItemsCount === 0
      ? 0
      : Math.round((checkedCount / totalItemsCount) * 100);
  const isComplete = totalItemsCount > 0 && checkedCount === totalItemsCount;

  return (
    <>
      {/* 1. VISUALIZAÇÃO DE IMPRESSÃO / SALVAR COMO PDF */}
      <div
        className="hidden print:block w-full text-slate-900 bg-white"
        id="public-print-view"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 8mm 10mm 8mm;
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-table thead {
              display: table-header-group !important;
            }
            .print-table tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `,
          }}
        />

        {/* EACard Oficial Elétrica & Art com degradê azul sofisticado */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.26fr 0.74fr',
            width: '100%',
            minHeight: '125px',
            padding: '8px 16px',
            boxSizing: 'border-box',
            color: '#f8fafc',
            margin: '0 0 12px 0',
            overflow: 'hidden',
            borderRadius: '12px 12px 4px 4px',
            backgroundColor: '#003366',
            backgroundImage:
              "linear-gradient(135deg, rgba(5, 22, 42, 0.94) 0%, rgba(0, 51, 102, 0.90) 50%, rgba(0, 85, 156, 0.88) 100%), url('https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: '1px solid #00559c',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <img
              src="https://res.cloudinary.com/dyycxyttb/image/upload/v1772753360/EA-logo_ebbhge.png"
              alt="EA Logo"
              style={{
                maxHeight: '100px',
                width: 'auto',
                maxWidth: '90%',
                aspectRatio: '1',
                borderRadius: '9999px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
              padding: '0 4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <img
                src="https://res.cloudinary.com/dyycxyttb/image/upload/v1772753359/ea-Name_iq49ju.png"
                alt="Elétrica & Art"
                style={{
                  maxWidth: '270px',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  marginBottom: '2px',
                  display: 'block',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                display: 'block',
              }}
            >
              CNPJ 32.858.892/0001-52 - IM 67358/0001
            </span>
            <p
              style={{
                fontSize: '9.5px',
                color: '#f1f5f9',
                lineHeight: 1.25,
                margin: '2px 0',
              }}
            >
              Rua José Alves Maciel, 40 - Aviação
              <br />
              Praia Grande - São Paulo - SP - Cep 11702-440
            </p>
            <div
              style={{ fontSize: '9.5px', color: '#f8fafc', lineHeight: 1.25 }}
            >
              <strong style={{ color: '#ffffff' }}>Fone </strong> ( 13 )
              99768-5853 &bull;
              <strong style={{ color: '#ffffff' }}> Whatsapp </strong> ( 13 )
              99768-5853
              <br />
              <strong style={{ color: '#ffffff' }}>E-mail </strong>{' '}
              eletrica.art.ltda@gmail.com
            </div>
          </div>
        </div>

        {/* Card Informativo */}
        <div
          style={{
            border: '1px solid rgba(0, 85, 156, 0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '2px solid #00559c',
              paddingBottom: '6px',
              marginBottom: '8px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#00559c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'block',
                }}
              >
                Documento de Quantitativos & Compras
              </span>
              <h1
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {list.title || 'Lista de Materiais'}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{ fontSize: '10px', color: '#64748b', display: 'block' }}
              >
                Data de Emissão
              </span>
              <strong style={{ fontSize: '12px', color: '#0f172a' }}>
                {new Date(list.createdAt || Date.now()).toLocaleDateString(
                  'pt-BR',
                )}
              </strong>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr',
              gap: '10px',
            }}
          >
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                Cliente
              </span>
              <strong style={{ color: '#1e293b', fontSize: '12px' }}>
                {list.clientName || 'Não especificado'}
              </strong>
            </div>
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                Orçamento / Obra Ref.
              </span>
              <strong style={{ color: '#1e293b', fontSize: '12px' }}>
                {list.orcamentoName || 'Geral'}
              </strong>
            </div>
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                Status da Compra
              </span>
              <strong style={{ color: '#00559c', fontSize: '12px' }}>
                {fullyPurchasedCount}/{totalItemsCount} ({progress}%)
              </strong>
            </div>
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                Total Gasto Comprado
              </span>
              <strong style={{ color: '#00559c', fontSize: '13px' }}>
                R$ {formatBRL(totalGastoCliente)}
              </strong>
            </div>
          </div>
        </div>

        {/* Tabela de Materiais Estilizada */}
        <table
          className="print-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            marginTop: '8px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#00559c', color: '#ffffff' }}>
              <th
                style={{
                  width: '32px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Material / Descrição
              </th>
              <th
                style={{
                  width: '85px',
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Qtd. Necessária
              </th>
              <th
                style={{
                  width: '105px',
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Qtd. Comprada
              </th>
              <th
                style={{
                  width: '85px',
                  padding: '8px 10px',
                  textAlign: 'right',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Preço Unit.
              </th>
              <th
                style={{
                  width: '90px',
                  padding: '8px 10px',
                  textAlign: 'right',
                  fontWeight: 800,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Total Item
              </th>
              <th
                style={{
                  width: '45px',
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 800,
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const rowBg = isEven ? '#edf4fa' : '#fafafa';
              const edit = itemEdits[item.id];
              const req = parseQuantity(item.quantity);
              const isChecked = edit?.checked ?? false;
              const purchased =
                edit?.purchasedQty !== undefined
                  ? edit.purchasedQty
                  : isChecked
                    ? req.number
                    : 0;
              const unitP = parseCurrency(
                edit?.actualUnitPrice || item.unitPrice,
              );
              const totalItem =
                purchased > 0 ? purchased * unitP : req.number * unitP;

              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: rowBg,
                    borderBottom: '1px solid rgba(0, 85, 156, 0.12)',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}
                >
                  <td
                    style={{
                      padding: '7px 4px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#00559c',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      padding: '7px 10px',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#64748b',
                          marginTop: '1px',
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '7px 8px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#0f172a',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    {req.number} {req.unit}
                  </td>
                  <td
                    style={{
                      padding: '7px 8px',
                      textAlign: 'center',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    {isChecked ? (
                      purchased < req.number ? (
                        <div style={{ color: '#b45309', fontWeight: 700 }}>
                          {purchased} {req.unit}{' '}
                          <span style={{ fontSize: '9.5px', color: '#d97706' }}>
                            (Falta {req.number - purchased})
                          </span>
                        </div>
                      ) : (
                        <div style={{ color: '#00559c', fontWeight: 700 }}>
                          {purchased} {req.unit} (OK)
                        </div>
                      )
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '7px 10px',
                      textAlign: 'right',
                      color: '#475569',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    {unitP > 0 ? `R$ ${formatBRL(unitP)}` : '-'}
                  </td>
                  <td
                    style={{
                      padding: '7px 10px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#00559c',
                      borderRight: '1px solid rgba(0,85,156,0.08)',
                    }}
                  >
                    {totalItem > 0 ? `R$ ${formatBRL(totalItem)}` : '-'}
                  </td>
                  <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        border: `1.5px solid ${isChecked ? '#00559c' : '#94a3b8'}`,
                        borderRadius: '3px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isChecked ? '#00559c' : '#ffffff',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 'bold',
                      }}
                    >
                      {isChecked ? '✓' : ''}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Rodapé da Impressão com Totais */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span>
            Elétrica & Art &bull; Soluções em Engenharia e Instalações Elétricas
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>
              Estimado: <strong>R$ {formatBRL(totalEstimadoLista)}</strong>
            </span>
            <span style={{ color: '#00559c', fontSize: '12px' }}>
              Total Gasto Real:{' '}
              <strong>R$ {formatBRL(totalGastoCliente)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZAÇÃO INTERATIVA EM TELA (Mobile-First) */}
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#13151A] text-slate-800 dark:text-slate-100 font-sans pb-32 selection:bg-[#00559c]/20 print:hidden">
        {/* Card Principal com Fundo Azul (Restaurado) */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-gradient-to-br from-[#00559c] to-[#00427c] text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#00559c]/20 relative overflow-hidden">
            {/* Decoração suave no fundo */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <ShoppingCart size={90} weight="bold" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200 flex items-center gap-1.5">
                  <ShoppingCart size={14} weight="bold" />
                  Lista de Materiais
                </span>

                {/* Status de Sincronização */}
                {syncStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-200 bg-amber-400/20 px-2.5 py-0.5 rounded-full animate-pulse border border-amber-300/30">
                    <ArrowsClockwise size={12} className="animate-spin" />
                    Salvando...
                  </span>
                )}
                {syncStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    <CloudCheck size={13} weight="bold" />
                    Sincronizado
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-2 text-white">
                {list.title}
              </h1>

              {(list.clientName || list.orcamentoName) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {list.clientName && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-xs font-semibold text-white backdrop-blur-xs border border-white/20">
                      <Users size={13} />
                      <span className="truncate max-w-[140px]">
                        {list.clientName}
                      </span>
                    </span>
                  )}
                  {list.orcamentoName && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-xs font-semibold text-white backdrop-blur-xs border border-white/20">
                      <Receipt size={13} />
                      <span className="truncate max-w-[160px]">
                        {list.orcamentoName}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Informações e Progresso no rodapé do Card Azul */}
              <div className="flex items-end justify-between gap-4 pt-3 border-t border-white/15">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                    Progresso
                  </span>
                  <div className="text-lg font-black text-white tabular-nums">
                    {checkedCount}{' '}
                    <span className="text-xs font-medium text-blue-200">
                      de {totalItemsCount} comprados ({progress}%)
                    </span>
                  </div>
                </div>

                {totalEstimadoLista > 0 && (
                  <div className="text-right">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                      Total Estimado
                    </span>
                    <span className="text-lg font-black text-white tabular-nums">
                      R$ {formatBRL(totalEstimadoLista)}
                    </span>
                  </div>
                )}
              </div>

              {/* Barra de Progresso interna */}
              <div className="h-2 w-full bg-black/25 rounded-full overflow-hidden mt-3 p-0.5">
                <motion.div
                  className="h-full bg-white rounded-full transition-all"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões Rápidos de Ação: Imprimir / PDF & Enviar WhatsApp & Compartilhar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 flex items-center justify-between gap-2 relative">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-slate-800 hover:border-[#00559c]/50 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer
              size={16}
              weight="bold"
              className="text-[#00559c] dark:text-[#58a6ff]"
            />
            <span>Imprimir / PDF</span>
          </button>

          {/* Botão Enviar com Menu Flutuante e Sobreposto */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsSendMenuOpen(!isSendMenuOpen)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-[0.98] transition-all shadow-sm shadow-emerald-600/20"
              title="Opções de envio no WhatsApp"
            >
              <WhatsappLogo
                size={17}
                weight="fill"
                className="text-white shrink-0"
              />
              <span>Enviar</span>
              <CaretDown
                size={12}
                weight="bold"
                className={`transition-transform duration-200 ${isSendMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Backdrop invisível para fechar ao clicar fora */}
            {isSendMenuOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSendMenuOpen(false)}
              />
            )}

            {/* Menu Flutuante e Sobreposto */}
            <AnimatePresence>
              {isSendMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#1C1F26] rounded-2xl p-2 shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    Como deseja enviar?
                  </div>

                  <div className="flex flex-col gap-1">
                    {/* Opção 1: Texto */}
                    <button
                      type="button"
                      onClick={handleSendWhatsappSummary}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
                        <ChatText size={18} weight="fill" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                          <span>Texto</span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                            Resumo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Envia resumo em texto com os itens atendidos, parciais
                          e pendentes no WhatsApp.
                        </p>
                      </div>
                    </button>

                    {/* Opção 2: Link da Lista Atualizada */}
                    <button
                      type="button"
                      onClick={handleSendWhatsappUpdatedLink}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition-colors flex items-start gap-3 group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#edf4fa] dark:bg-[#00559c]/20 text-[#00559c] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5 border border-[#00559c]/20 group-hover:scale-105 transition-transform">
                        <LinkIcon size={18} weight="bold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                          <span>Link da lista atualizada</span>
                          <span className="text-[10px] font-semibold text-[#00559c] dark:text-[#58a6ff] bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded">
                            Interativo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Envia o link no WhatsApp com o estado atual: itens
                          marcados e valores preenchidos.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Ação secundária: Copiar Link */}
                  <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleCopyUpdatedLink}
                      className="w-full py-1.5 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#00559c] dark:hover:text-[#58a6ff] hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check
                            size={13}
                            weight="bold"
                            className="text-emerald-500"
                          />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Link atualizado copiado!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar link da lista atualizada</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#edf4fa] dark:bg-[#00559c]/20 border border-[#00559c]/30 hover:bg-[#00559c]/15 text-[#00559c] dark:text-[#58a6ff] font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Compartilhar Link"
          >
            <ShareNetwork size={16} weight="bold" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        {/* Notificação se foi carregada de um link compartilhado com progresso */}
        {isLoadedFromSharedLink && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
            <div className="flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 py-1.5 px-3 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-[11.5px]">
                <CheckCircle
                  size={14}
                  weight="fill"
                  className="text-emerald-600 dark:text-emerald-400 shrink-0"
                />
                <span>
                  Lista sincronizada com as marcações e valores enviados no
                  link.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsLoadedFromSharedLink(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 p-0.5"
                title="Fechar aviso"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Dica amigável para o cliente */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3">
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/50 py-1.5 px-3 rounded-lg">
            <PencilSimple size={13} className="text-[#00559c] shrink-0" />
            <span>Toque em qualquer material para ver detalhes ou editar.</span>
          </p>
        </div>

        {/* Lista de Itens */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="bg-gradient-to-r from-[#00559c] to-[#0077d4] rounded-3xl p-5 mb-5 text-white shadow-lg shadow-[#00559c]/25 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-black mb-0.5">Tudo Pronto! 🎉</h2>
                  <p className="text-blue-100 font-medium text-xs">
                    Todos os itens solicitados foram adquiridos.
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-md">
                  <CheckCircle size={24} weight="fill" className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {list.items.length === 0 ? (
                <motion.div className="text-center py-16 bg-white dark:bg-[#1C1F26] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-16 h-16 bg-[#edf4fa] dark:bg-[#00559c]/20 text-[#00559c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} weight="duotone" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Nenhum material adicionado.
                  </p>
                </motion.div>
              ) : (
                [...list.items].map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const isChecked = Boolean(item.checked);

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      onClick={() => openEditModal(item)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        transition: { duration: 0.2 },
                      }}
                      className={`group flex items-center gap-3 p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                        isChecked
                          ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60'
                          : `${isEven ? 'bg-[#edf4fa]/40 dark:bg-[#1f232b]' : 'bg-white dark:bg-[#1a1d24]'} border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-[#00559c]/50`
                      }`}
                    >
                      {/* Checkbox circular */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(item.id);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isChecked
                            ? 'bg-[#00559c] text-white shadow-sm shadow-[#00559c]/30'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#00559c] text-transparent'
                        }`}
                        title={
                          isChecked ? 'Desmarcar item' : 'Marcar como comprado'
                        }
                      >
                        <CheckCircle
                          size={16}
                          weight="fill"
                          className={isChecked ? 'opacity-100' : 'opacity-0'}
                        />
                      </button>

                      {/* Informações do Item */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.quantity && (
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded-md shrink-0 ${
                                isChecked
                                  ? 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                                  : 'bg-[#edf4fa] dark:bg-[#00559c]/20 text-[#00559c] dark:text-[#58a6ff] border border-[#00559c]/20'
                              }`}
                            >
                              {item.quantity}
                            </span>
                          )}
                          <span
                            className={`font-semibold text-[15px] truncate ${
                              isChecked
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {(item.description || item.unitPrice) &&
                          (() => {
                            let itemTotalStr = '';
                            if (item.unitPrice) {
                              const p = parseFloat(
                                item.unitPrice
                                  .replace(/\./g, '')
                                  .replace(',', '.')
                                  .replace(/[^\d.]/g, ''),
                              );
                              const q =
                                parseFloat(
                                  (item.quantity || '1').replace(/[^\d.]/g, ''),
                                ) || 1;
                              if (!isNaN(p) && p > 0 && q > 1) {
                                itemTotalStr = ` (Total: R$ ${(p * q).toFixed(2).replace('.', ',')})`;
                              }
                            }
                            return (
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                {item.description && (
                                  <span className="truncate">
                                    {item.description}
                                  </span>
                                )}
                                {item.unitPrice && (
                                  <span className="text-[#00559c] dark:text-[#58a6ff] font-bold">
                                    R$ {item.unitPrice}
                                    {itemTotalStr}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL DE EDIÇÃO DO ITEM (Componente Antigo: Detalhes do Material) */}
        <AnimatePresence>
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-slate-50 dark:bg-[#181b20] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="px-6 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-amber-500 dark:text-amber-400">
                    Detalhes do Material
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Nome do Material
                    </label>
                    <input
                      value={editingItem.name}
                      onChange={(e) =>
                        handleUpdateField('name', e.target.value)
                      }
                      className="w-full !h-auto !p-3 !rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#21252b] focus:border-[#00559c] focus:ring-2 focus:ring-[#00559c]/20 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Quantidade
                      </label>
                      <input
                        value={editingItem.quantity || ''}
                        onChange={(e) =>
                          handleUpdateField('quantity', e.target.value)
                        }
                        className="w-full !h-auto !p-3 !rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#21252b] focus:border-[#00559c] focus:ring-2 focus:ring-[#00559c]/20 outline-none transition-all text-slate-800 dark:text-slate-100"
                        placeholder="Ex: 10, 5m, 2cx"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Preço Unitário (R$)
                      </label>
                      <input
                        type="text"
                        value={editingItem.unitPrice || ''}
                        onChange={(e) =>
                          handleUpdateField('unitPrice', e.target.value)
                        }
                        className="w-full !h-auto !p-3 !rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#21252b] focus:border-[#00559c] focus:ring-2 focus:ring-[#00559c]/20 outline-none transition-all text-slate-800 dark:text-slate-100"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Observações / Descrição
                    </label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) =>
                        handleUpdateField('description', e.target.value)
                      }
                      className="w-full !h-auto !p-3 !rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#21252b] focus:border-[#00559c] focus:ring-2 focus:ring-[#00559c]/20 outline-none transition-all text-slate-800 dark:text-slate-100 min-h-[100px] resize-none"
                      placeholder="Marca preferida, loja, etc..."
                    />
                  </div>
                </div>

                <div className="pt-2 p-4 bg-slate-50 dark:bg-[#181b20] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModal}
                    className="flex-1 bg-[#00559c] hover:bg-[#004785] text-white py-3 rounded-xl font-bold active:scale-[0.98] transition-transform shadow-lg shadow-[#00559c]/20"
                  >
                    Pronto
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function PublicListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#181b20]">
          <div className="w-8 h-8 border-4 border-[#00559c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ListContent />
    </Suspense>
  );
}
