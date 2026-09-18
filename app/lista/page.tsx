'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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
} from '@phosphor-icons/react';

interface MaterialItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
  description?: string;
  unitPrice?: string;
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
  clientName?: string;
  orcamentoName?: string;
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

  // Customizações do cliente (quantidade comprada, preço pago real, check)
  const [itemEdits, setItemEdits] = useState<Record<string, ClientItemEdit>>(
    {},
  );

  // Item selecionado para edição detalhada no Modal
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [editPrice, setEditPrice] = useState<string>('');

  useEffect(() => {
    const d = searchParams.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d))) as MaterialList;
        setList(decoded);

        // Carrega edição do cliente gravada localmente no navegador
        const editsKey = `@ea:public-list-edits:${decoded.id}`;
        const storedEdits = localStorage.getItem(editsKey);

        if (storedEdits) {
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
            const legacyMap = JSON.parse(legacyRaw) as Record<string, boolean>;
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
    }
  }, [searchParams]);

  // Salva no localStorage sempre que itemEdits mudar
  const saveEdits = (newEdits: Record<string, ClientItemEdit>) => {
    setItemEdits(newEdits);
    if (list?.id) {
      localStorage.setItem(
        `@ea:public-list-edits:${list.id}`,
        JSON.stringify(newEdits),
      );
    }
  };

  // Toggle simples ao clicar na caixa circular de check
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

  // Máscara brasileira de digitação de valores monetários (ex: 1050 -> 10,50 / 150 -> 1,50)
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

  // Abrir Modal de Edição da Quantidade / Preço
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

  // Salvar alterações do Modal
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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: list?.title || 'Lista de Materiais',
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Enviar Resumo no WhatsApp para o Eletricista ou Fornecedor
  const handleSendWhatsappSummary = () => {
    if (!list) return;

    let totalGasto = 0;
    let itensCompletos = 0;
    let itensParciais: string[] = [];
    let itensNaoComprados: string[] = [];

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

    msg += `\nLink da lista atualizada: ${window.location.href}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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

        {/* EACard Oficial Elétrica & Art com degradê azul */}
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
                <div className="flex items-center gap-2 mb-1">
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

        {/* Card Resumo Financeiro da Compra (Totalizador) */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-[#00559c] dark:bg-[#1C1F26] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#58a6ff] dark:bg-[#00559c]/20 text-[#00559c] dark:text-[#58a6ff] flex items-center justify-center shrink-0 border border-[#00559c]/20">
                <Coins size={22} weight="duotone" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Total Gasto Comprado
                </span>
                <span className="text-xl sm:text-2xl font-black text-white dark:text-[#58a6ff] tabular-nums">
                  R$ {formatBRL(totalGastoCliente)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider block">
                Total Estimado
              </span>
              <span className="text-xs font-semibold text-[#f5f5f5] dark:text-slate-300">
                R$ {formatBRL(totalEstimadoLista)}
              </span>
              {partialPurchasedCount > 0 && (
                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                  <Warning size={12} weight="bold" />
                  {partialPurchasedCount} parcial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botões Rápidos de Ação: Imprimir / PDF & Enviar WhatsApp & Compartilhar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-slate-800 hover:border-[#00559c]/50 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer
              size={16}
              weight="bold"
              className="text-[#00559c] dark:text-[#58a6ff]"
            />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleSendWhatsappSummary}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Enviar resumo das compras via WhatsApp"
          >
            <WhatsappLogo
              size={17}
              weight="fill"
              className="text-emerald-600 dark:text-emerald-400"
            />
            <span>Enviar</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#edf4fa] dark:bg-[#00559c]/20 border border-[#00559c]/30 hover:bg-[#00559c]/15 text-[#00559c] dark:text-[#58a6ff] font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Compartilhar Link"
          >
            <ShareNetwork size={16} weight="bold" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        {/* Dica amigável para o cliente */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3">
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/50 py-1.5 px-3 rounded-lg">
            <PencilSimple size={13} className="text-[#00559c] shrink-0" />
            <span>
              Toque em qualquer material para ajustar a{' '}
              <strong>quantidade comprada</strong> e o{' '}
              <strong>preço pago</strong>.
            </span>
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
                  const edit = itemEdits[item.id];
                  const req = parseQuantity(item.quantity);
                  const isChecked = edit?.checked ?? false;
                  const purchased =
                    edit?.purchasedQty !== undefined
                      ? edit.purchasedQty
                      : isChecked
                        ? req.number
                        : 0;
                  const isPartial = isChecked && purchased < req.number;
                  const unitP = parseCurrency(
                    edit?.actualUnitPrice || item.unitPrice,
                  );
                  const totalItem = purchased > 0 ? purchased * unitP : 0;

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
                      className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer active:scale-[0.99] transition-all overflow-hidden ${
                        isChecked
                          ? isPartial
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40 shadow-none'
                            : 'bg-slate-100/50 dark:bg-slate-800/30 border-transparent shadow-none'
                          : `${isEven ? 'bg-[#edf4fa]/40 dark:bg-[#1C1F26]' : 'bg-white dark:bg-[#181a20]'} border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-[#00559c]/50`
                      }`}
                    >
                      {/* Botão de Checkbox Direto */}
                      <button
                        type="button"
                        onClick={(e) => toggleItemCheck(item, e)}
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isChecked
                            ? isPartial
                              ? 'bg-amber-500 text-white scale-105 shadow-sm shadow-amber-500/30'
                              : 'bg-[#00559c] text-white scale-105 shadow-sm shadow-[#00559c]/30'
                            : 'border-[2px] border-slate-300 dark:border-slate-600 hover:border-[#00559c] text-transparent'
                        }`}
                        title={
                          isChecked ? 'Desmarcar item' : 'Marcar como comprado'
                        }
                      >
                        <CheckCircle
                          size={18}
                          weight="bold"
                          className={isChecked ? 'opacity-100' : 'opacity-0'}
                        />
                      </button>

                      {/* Conteúdo do Item */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge de Quantidade - sem palavra 'necessário' */}
                          {isChecked ? (
                            isPartial ? (
                              <span className="px-2 py-0.5 text-xs font-bold rounded-md shrink-0 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                Comprou {purchased} de {req.number} {req.unit}{' '}
                                (Falta {req.number - purchased})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-bold rounded-md shrink-0 bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {purchased} {req.unit} atendidos
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-md shrink-0 bg-[#edf4fa] dark:bg-[#00559c]/20 text-[#00559c] dark:text-[#58a6ff] border border-[#00559c]/20">
                              {req.number} {req.unit}
                            </span>
                          )}

                          <span
                            className={`font-semibold text-[14.5px] truncate transition-all duration-300 ${
                              isChecked && !isPartial
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-700 dark:text-slate-100'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1 text-xs text-slate-400">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.description && (
                              <span className="truncate">
                                {item.description}
                              </span>
                            )}
                            {unitP > 0 && (
                              <span className="text-slate-500 dark:text-slate-400">
                                Unit:{' '}
                                <strong className="text-slate-700 dark:text-slate-200">
                                  R$ {formatBRL(unitP)}
                                </strong>
                              </span>
                            )}
                          </div>

                          {isChecked && totalItem > 0 && (
                            <span className="text-[#00559c] dark:text-[#58a6ff] font-bold shrink-0">
                              Total: R$ {formatBRL(totalItem)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botão de Editar visível */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#00559c] hover:bg-[#edf4fa] dark:hover:bg-[#00559c]/20 transition-all shrink-0"
                        title="Editar quantidade ou preço"
                      >
                        <PencilSimple size={16} />
                      </button>

                      {isChecked && !isPartial && (
                        <div className="absolute inset-0 border-2 border-[#00559c]/15 rounded-2xl pointer-events-none" />
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL DE EDIÇÃO DO ITEM (Mobile Bottom Sheet / Desktop Modal) */}
        <AnimatePresence>
          {editingItem &&
            (() => {
              const req = parseQuantity(editingItem.quantity);
              const unitVal = parseCurrency(editPrice || editingItem.unitPrice);
              const subtotal = editQty * unitVal;
              const diff = req.number - editQty;

              return (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="bg-white dark:bg-[#1C1F26] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-[#00559c] dark:text-[#58a6ff] uppercase tracking-widest block">
                          Ajuste de Compra
                        </span>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-snug">
                          {editingItem.name}
                        </h3>
                        {editingItem.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {editingItem.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-[.75rem] rounded-[1.1rem] bg-[#ff999930] text-red-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X size={20} weight="bold" />
                      </button>
                    </div>

                    <div className="py-5 space-y-5">
                      {/* Alerta da Quantidade Original Solicitada */}
                      <div className="bg-[#edf4fa] dark:bg-[#00559c]/20 p-3.5 rounded-2xl border border-[#00559c]/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Quantidade Solicitada na Lista
                          </span>
                          <span className="text-base font-extrabold text-[#00559c] dark:text-[#58a6ff]">
                            {req.number} {req.unit}
                          </span>
                        </div>
                      </div>

                      {/* Stepper de Quantidade Comprada */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Quanto você comprou na loja?
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditQty(Math.max(0, editQty - 1))}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 transition-transform hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <Minus size={20} weight="bold" />
                          </button>

                          <div className="flex-1 relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={editQty}
                              onChange={(e) =>
                                setEditQty(
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                )
                              }
                              className="w-full text-center text-2xl font-black py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00559c]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              {req.unit}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditQty(editQty + 1)}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 transition-transform hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <Plus size={20} weight="bold" />
                          </button>
                        </div>

                        {/* Botões de Atalho */}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setEditQty(req.number)}
                            className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg bg-[#edf4fa] dark:bg-[#00559c]/20 text-[#00559c] dark:text-[#58a6ff] hover:bg-[#00559c]/15 transition-colors"
                          >
                            Comprei Tudo ({req.number} {req.unit})
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditQty(0)}
                            className="py-1.5 px-3 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                          >
                            Não encontrei (0)
                          </button>
                        </div>

                        {/* Feedback Dinâmico da Quantidade */}
                        {diff > 0 && editQty > 0 && (
                          <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-900/40">
                            <Warning
                              size={15}
                              weight="bold"
                              className="shrink-0 text-amber-600"
                            />
                            <span>
                              Falta comprar{' '}
                              <strong>
                                {diff} {req.unit}
                              </strong>{' '}
                              para completar a solicitação do projeto.
                            </span>
                          </div>
                        )}
                        {diff < 0 && (
                          <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900/40">
                            <span>
                              Você comprou{' '}
                              <strong>
                                {Math.abs(diff)} {req.unit} a mais
                              </strong>{' '}
                              do que o especificado.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Preço Unitário Pago Real com máscara brasileira */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Preço Unitário Pago na Loja (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0,00"
                            value={editPrice}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="w-full pl-[40px_!important] pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-[#00559c]"
                          />
                        </div>
                      </div>

                      {/* Totalizador do Item no Modal */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Deste Item
                          </span>
                          <span className="text-xs text-slate-500">
                            {editQty} {req.unit} &times; R$ {formatBRL(unitVal)}
                          </span>
                        </div>
                        <span className="text-xl font-black text-[#00559c] dark:text-[#58a6ff]">
                          R$ {formatBRL(subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Ações do Modal */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveModal}
                        className="flex-1 py-3 rounded-xl bg-[#00559c] hover:bg-[#004785] text-white font-bold text-sm shadow-lg shadow-[#00559c]/30 transition-all"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            })()}
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
