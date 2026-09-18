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

// Prefixo e chave para ofuscação binária segura (fallback retrocompatível para links com dados embutidos)
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

  const [itemEdits, setItemEdits] = useState<Record<string, ClientItemEdit>>(
    {},
  );
  const [isLoadedFromSharedLink, setIsLoadedFromSharedLink] = useState(false);

  const [isSendMenuOpen, setIsSendMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [editPrice, setEditPrice] = useState<string>('');

  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

        // 1. Tenta sincronizar via Server API Route (ignora restrições de RLS)
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

          // 1.1 Tenta carregar pela rota de API do servidor (/api/lista/[id])
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

          const editsKey = `@ea:public-list-edits:${decoded.id}`;
          const storedEdits = localStorage.getItem(editsKey);

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

  const saveEdits = (newEdits: Record<string, ClientItemEdit>) => {
    setItemEdits(newEdits);
    if (list?.id) {
      localStorage.setItem(
        `@ea:public-list-edits:${list.id}`,
        JSON.stringify(newEdits),
      );
      syncWithSupabase(list.id, list.items, newEdits);
    }
  };

  const toggleItemCheck = (item: MaterialItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = itemEdits[item.id];
    const isChecked = current?.checked ?? false;
    const req = parseQuantity(item.quantity);

    const newEdits = {
      ...itemEdits,
      [item.id]: {
        checked: !isChecked,
        purchasedQty: !isChecked
          ? (current?.purchasedQty ?? req.number)
          : (current?.purchasedQty ?? req.number),
        actualUnitPrice: current?.actualUnitPrice ?? item.unitPrice ?? '',
      },
    };
    saveEdits(newEdits);
  };

  const handlePriceChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setEditPrice('');
      return;
    }
    const cents = parseInt(digits, 10) / 100;
    setEditPrice(
      cents.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  };

  const openEditModal = (item: MaterialItem) => {
    const edit = itemEdits[item.id];
    const req = parseQuantity(item.quantity);
    setEditingItem(item);
    setEditQty(
      edit?.purchasedQty !== undefined ? edit.purchasedQty : req.number,
    );

    const initialPriceStr =
      edit?.actualUnitPrice !== undefined
        ? edit.actualUnitPrice
        : item.unitPrice || '';
    if (initialPriceStr) {
      const val = parseCurrency(initialPriceStr);
      setEditPrice(
        val > 0
          ? val.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '',
      );
    } else {
      setEditPrice('');
    }
  };

  const handleSaveModal = () => {
    if (!editingItem) return;
    const isPurchased = editQty > 0;
    const newEdits = {
      ...itemEdits,
      [editingItem.id]: {
        checked: isPurchased,
        purchasedQty: editQty,
        actualUnitPrice: editPrice.trim(),
      },
    };
    saveEdits(newEdits);
    setEditingItem(null);
  };

  const getUpdatedShareUrl = () => {
    if (!list) return typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/lista';

    // Se a lista possui ID salvo no banco compartilhado, gera link curto
    if (list.id && list.id.length > 5) {
      return `${origin}${pathname}?id=${encodeURIComponent(list.id)}`;
    }

    // Fallback retrocompatível
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
      const price = parseCurrency(edit?.actualUnitPrice || it.unitPrice);

      if (isChecked && purchased > 0) {
        totalGasto += purchased * price;
        if (purchased >= req.number) {
          itensCompletos++;
        } else {
          itensParciais.push(
            `${it.name} (${purchased}/${req.number} ${req.unit})`,
          );
        }
      } else {
        itensNaoComprados.push(`${req.number} ${req.unit} - ${it.name}`);
      }
    });

    let msg = `📋 *Status da Lista de Materiais*\n`;
    msg += `*${list.title}*\n`;
    if (list.clientName) msg += `👤 *Cliente:* ${list.clientName}\n`;
    if (list.orcamentoName) msg += `🏗️ *Obra / Ref:* ${list.orcamentoName}\n`;
    msg += `---------------------------------\n`;
    msg += `✅ *Itens Comprados:* ${itensCompletos} de ${list.items.length}\n`;
    if (totalGasto > 0) {
      msg += `💰 *Total Investido:* R$ ${formatBRL(totalGasto)}\n`;
    }

    if (itensParciais.length > 0) {
      msg += `\n⚠️ *Comprados Parcialmente (${itensParciais.length}):*\n`;
      itensParciais.forEach((item) => {
        msg += `• ${item}\n`;
      });
    }

    if (itensNaoComprados.length > 0) {
      msg += `\n🛒 *Faltando Comprar (${itensNaoComprados.length}):*\n`;
      itensNaoComprados.forEach((item) => {
        msg += `• ${item}\n`;
      });
    }

    msg += `\n🔗 *Acessar lista completa interativa:*\n${getUpdatedShareUrl()}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

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
      const price = parseCurrency(edit?.actualUnitPrice || it.unitPrice);

      if (isChecked && purchased > 0) {
        marcadosCount++;
        totalGasto += purchased * price;
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
            O link fornecido pode estar quebrado, incompleto ou não encontrado
            no banco.
          </p>
        </div>
      </div>
    );
  }

  if (!list || isLoadingDb) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A]">
        <div className="w-10 h-10 border-4 border-[#00559c]/20 border-t-[#00559c] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Carregando materiais...
        </p>
      </div>
    );
  }

  const totalItemsCount = list.items.length;
  let fullyPurchasedCount = 0;
  let partialPurchasedCount = 0;
  let totalGastoCliente = 0;
  let totalEstimadoLista = 0;

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
    const originalUnitP = parseCurrency(it.unitPrice);

    totalEstimadoLista += req.number * (unitP || originalUnitP);

    if (isChecked && purchased > 0) {
      totalGastoCliente += purchased * unitP;
      if (purchased >= req.number) {
        fullyPurchasedCount++;
      } else {
        partialPurchasedCount++;
      }
    }
  });

  const checkedCount = fullyPurchasedCount + partialPurchasedCount;
  const progress =
    totalItemsCount === 0
      ? 0
      : Math.round((fullyPurchasedCount / totalItemsCount) * 100);
  const isComplete =
    totalItemsCount > 0 && fullyPurchasedCount === totalItemsCount;

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
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#00559c',
                  fontWeight: 800,
                }}
              >
                Documento Oficial
              </span>
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                {list.title}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                Data de Emissão
              </span>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}
              >
                {new Date(list.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            {list.clientName && (
              <div>
                <span
                  style={{
                    color: '#64748b',
                    fontSize: '9.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Cliente
                </span>
                <strong style={{ color: '#0f172a' }}>{list.clientName}</strong>
              </div>
            )}
            {list.orcamentoName && (
              <div>
                <span
                  style={{
                    color: '#64748b',
                    fontSize: '9.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Orçamento / Ref
                </span>
                <strong style={{ color: '#0f172a' }}>
                  {list.orcamentoName}
                </strong>
              </div>
            )}
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                Total de Itens
              </span>
              <strong style={{ color: '#0f172a' }}>
                {totalItemsCount} itens
              </strong>
            </div>
            <div>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                Progresso de Compra
              </span>
              <strong style={{ color: isComplete ? '#16a34a' : '#00559c' }}>
                {checkedCount} / {totalItemsCount} ({progress}%)
              </strong>
            </div>
          </div>
        </div>

        <table
          className="print-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '10.5px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#003366',
                color: '#ffffff',
                textAlign: 'left',
              }}
            >
              <th
                style={{
                  padding: '6px 8px',
                  width: '32px',
                  textAlign: 'center',
                }}
              >
                #
              </th>
              <th style={{ padding: '6px 8px', width: '85px' }}>
                Qtd Requisitada
              </th>
              <th style={{ padding: '6px 8px' }}>Descrição do Material</th>
              <th
                style={{
                  padding: '6px 8px',
                  width: '90px',
                  textAlign: 'center',
                }}
              >
                Qtd Comprada
              </th>
              <th
                style={{
                  padding: '6px 8px',
                  width: '85px',
                  textAlign: 'right',
                }}
              >
                Vlr. Unitário
              </th>
              <th
                style={{
                  padding: '6px 8px',
                  width: '90px',
                  textAlign: 'right',
                }}
              >
                Subtotal
              </th>
              <th
                style={{
                  padding: '6px 8px',
                  width: '55px',
                  textAlign: 'center',
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((item, index) => {
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
              const subtotal = purchased * unitP;
              const isEven = index % 2 === 0;

              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: isEven ? '#f8fafc' : '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <td
                    style={{
                      padding: '5px 8px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: '5px 8px',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {item.quantity || '1 un'}
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {item.name}
                    </div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: '9px',
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
                      padding: '5px 8px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: isChecked ? '#00559c' : '#94a3b8',
                    }}
                  >
                    {isChecked ? `${purchased} ${req.unit}` : '-'}
                  </td>
                  <td
                    style={{
                      padding: '5px 8px',
                      textAlign: 'right',
                      color: '#475569',
                    }}
                  >
                    {unitP > 0 ? `R$ ${formatBRL(unitP)}` : '-'}
                  </td>
                  <td
                    style={{
                      padding: '5px 8px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {subtotal > 0 ? `R$ ${formatBRL(subtotal)}` : '-'}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: isChecked
                          ? '1px solid #00559c'
                          : '1px solid #cbd5e1',
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
        {/* Header Fixo com Progresso */}
        <div className="bg-white dark:bg-[#1C1F26] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] pt-safe">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00559c] to-[#0088ff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#00559c] dark:text-[#58a6ff] uppercase tracking-widest">
                    <ShoppingCart size={14} weight="bold" />
                    Lista de Compras
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">
                    &bull;
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {checkedCount} de {totalItemsCount} marcados
                  </span>
                  {syncStatus === 'saving' && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">
                        &bull;
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 animate-pulse">
                        <ArrowsClockwise size={12} className="animate-spin" />
                        Salvando...
                      </span>
                    </>
                  )}
                  {syncStatus === 'saved' && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">
                        &bull;
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CloudCheck size={13} weight="bold" />
                        Sincronizado
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate leading-tight">
                  {list.title}
                </h1>

                {(list.clientName || list.orcamentoName) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {list.clientName && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#edf4fa] dark:bg-[#00559c]/20 text-xs font-semibold text-[#00559c] dark:text-[#58a6ff] border border-[#00559c]/20">
                        <Users size={13} />
                        <span className="truncate max-w-[120px]">
                          {list.clientName}
                        </span>
                      </span>
                    )}
                    {list.orcamentoName && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                        <Receipt size={13} />
                        <span className="truncate max-w-[150px]">
                          {list.orcamentoName}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0 flex flex-col items-end">
                <span className="block text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter leading-none">
                  {progress}
                  <span className="text-lg text-[#00559c] dark:text-[#58a6ff]">
                    %
                  </span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Concluído
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
          {/* Banner de Boas-Vindas e Dica */}
          <div className="bg-gradient-to-br from-[#00559c]/10 via-[#00559c]/5 to-transparent dark:from-[#00559c]/20 border border-[#00559c]/20 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#00559c] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white block text-sm font-bold mb-0.5">
                Checklist Interativo de Materiais
              </strong>
              Toque no círculo para marcar o item como comprado. Toque no lápis
              ou no card para informar a quantidade comprada e o preço pago real
              na loja. Suas alterações são sincronizadas automaticamente!
            </div>
          </div>

          {/* Cards de Resumo Financeiro da Compra */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#1C1F26] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Estimado na Lista
              </span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                R$ {formatBRL(totalEstimadoLista)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {totalItemsCount} materiais planejados
              </span>
            </div>

            <div className="bg-white dark:bg-[#1C1F26] p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Gasto Real Efetuado
              </span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                R$ {formatBRL(totalGastoCliente)}
              </div>
              <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-1 block">
                {checkedCount} itens adquiridos
              </span>
            </div>
          </div>

          {/* Itens da Lista */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Itens para Compra ({totalItemsCount})
              </span>
              {checkedCount > 0 && (
                <button
                  onClick={() => saveEdits({})}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Desmarcar todos
                </button>
              )}
            </div>

            {list.items.map((item, index) => {
              const edit = itemEdits[item.id];
              const isChecked = edit?.checked ?? false;
              const req = parseQuantity(item.quantity);
              const purchased =
                edit?.purchasedQty !== undefined
                  ? edit.purchasedQty
                  : isChecked
                    ? req.number
                    : 0;
              const unitP = parseCurrency(
                edit?.actualUnitPrice || item.unitPrice,
              );
              const isPartial =
                isChecked && purchased > 0 && purchased < req.number;
              const hasPrice = unitP > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => openEditModal(item)}
                  className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-white dark:bg-[#1C1F26] border-emerald-200 dark:border-emerald-900/40 shadow-sm'
                      : 'bg-white dark:bg-[#1C1F26] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  {/* Botão de Check Circular */}
                  <button
                    type="button"
                    onClick={(e) => toggleItemCheck(item, e)}
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                      isChecked
                        ? isPartial
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#00559c] dark:hover:border-[#58a6ff]'
                    }`}
                  >
                    {isChecked && <Check size={14} weight="bold" />}
                  </button>

                  {/* Informações do Material */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-base font-semibold transition-colors truncate ${
                          isChecked && !isPartial
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Quantidade Solicitada Badge */}
                      <span className="shrink-0 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 tabular-nums">
                        {item.quantity || '1 un'}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Linha de Status de Compra e Valores */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      {isChecked ? (
                        <>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isPartial
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            <CheckCircle size={14} weight="fill" />
                            {isPartial
                              ? `Comprado: ${purchased} de ${req.number} ${req.unit}`
                              : `Comprado completo (${purchased} ${req.unit})`}
                          </span>

                          {hasPrice && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">
                                &bull;
                              </span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                R$ {formatBRL(unitP)} / {req.unit}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">
                                &bull;
                              </span>
                              <span className="font-extrabold text-[#00559c] dark:text-[#58a6ff]">
                                Total: R$ {formatBRL(purchased * unitP)}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Package size={13} />
                          Pendente de compra
                          {item.unitPrice && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">
                                &bull;
                              </span>
                              <span>Est.: R$ {item.unitPrice}</span>
                            </>
                          )}
                        </span>
                      )}

                      {/* Botão de Edição Rápida */}
                      <div className="ml-auto opacity-70 group-hover:opacity-100 flex items-center gap-1 text-[#00559c] dark:text-[#58a6ff] text-[11px] font-semibold">
                        <PencilSimple size={13} />
                        <span className="hidden sm:inline">Editar</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Fixo de Ações com Menu Flutuante Sobreposto */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C1F26]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)] pb-safe">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            {/* Botão de Enviar com Menu Flutuante e Sobreposto */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setIsSendMenuOpen(!isSendMenuOpen)}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-[#25D366]/20 transition-all text-sm"
              >
                <WhatsappLogo size={20} weight="fill" />
                <span>Enviar</span>
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${isSendMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Menu Flutuante e Sobreposto */}
              <AnimatePresence>
                {isSendMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
                      onClick={() => setIsSendMenuOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white dark:bg-[#1F232B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-2 overflow-hidden"
                    >
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        Como deseja enviar?
                      </div>

                      {/* Opção 1: Texto (como funciona hoje) */}
                      <button
                        type="button"
                        onClick={handleSendWhatsappSummary}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-800 dark:text-slate-100 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <ChatText size={18} weight="bold" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                            Texto
                            <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                              Padrão
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Envia mensagem formatada com itens comprados e
                            pendentes.
                          </p>
                        </div>
                      </button>

                      {/* Opção 2: Link da Lista Atualizada */}
                      <button
                        type="button"
                        onClick={handleSendWhatsappUpdatedLink}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-800 dark:text-slate-100 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#00559c]/10 dark:bg-[#00559c]/30 text-[#00559c] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <LinkIcon size={18} weight="bold" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                            Link da lista atualizada
                            <span className="text-[10px] font-semibold bg-[#00559c]/10 text-[#00559c] dark:text-[#58a6ff] px-1.5 py-0.5 rounded">
                              Curto & Sincronizado
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Gera um link curto e seguro que carrega exatamente a
                            situação e marcações atuais.
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Compartilhar Geral / Copiar Link */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-[#00559c] hover:bg-[#00447c] active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#00559c]/20 transition-all text-sm"
              title="Compartilhar ou Copiar Link"
            >
              {copiedLink ? (
                <>
                  <Check size={18} weight="bold" />
                  <span className="hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <ShareNetwork size={18} weight="bold" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </>
              )}
            </button>

            {/* Imprimir / Salvar PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-3.5 text-slate-600 dark:text-slate-300 hover:text-[#00559c] hover:bg-[#edf4fa] dark:hover:bg-[#00559c]/20 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              title="Imprimir / Salvar em PDF"
            >
              <Printer size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Modal de Edição Detalhada do Item */}
        <AnimatePresence>
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-white dark:bg-[#1C1F26] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#00559c] dark:text-[#58a6ff] uppercase tracking-wider block mb-1">
                      Editar Item de Compra
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {editingItem.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>

                {/* Quantidade Requisitada Original */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Quantidade solicitada no projeto:
                  </span>
                  <strong className="text-slate-800 dark:text-slate-100 font-bold">
                    {editingItem.quantity || '1 un'}
                  </strong>
                </div>

                {/* Controle de Quantidade Comprada */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Quantidade Efetivamente Comprada (
                    {parseQuantity(editingItem.quantity).unit}):
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditQty(Math.max(0, editQty - 1))}
                      className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <Minus size={18} weight="bold" />
                    </button>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editQty}
                      onChange={(e) =>
                        setEditQty(parseFloat(e.target.value) || 0)
                      }
                      className="flex-1 h-12 text-center text-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00559c]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditQty(editQty + 1)}
                      className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </div>
                </div>

                {/* Preço Unitário Pago */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Preço Unitário Pago na Loja (R$):
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={editPrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 text-base font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00559c]"
                    />
                  </div>
                  {editPrice && editQty > 0 && (
                    <div className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                      Subtotal deste item: R${' '}
                      {formatBRL(editQty * parseCurrency(editPrice))}
                    </div>
                  )}
                </div>

                {/* Botões do Modal */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditQty(0);
                      setEditPrice('');
                    }}
                    className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    Zerar Item
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModal}
                    className="flex-[2] py-3 text-sm font-bold bg-[#00559c] hover:bg-[#00447c] text-white rounded-xl shadow-md shadow-[#00559c]/20 active:scale-[0.99] transition-all"
                  >
                    Confirmar e Salvar
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A]">
          <div className="w-10 h-10 border-4 border-[#00559c]/20 border-t-[#00559c] rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
            Carregando...
          </p>
        </div>
      }
    >
      <ListContent />
    </Suspense>
  );
}
