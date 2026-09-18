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
  Printer 
} from '@phosphor-icons/react';

interface MaterialItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
  description?: string;
  unitPrice?: string;
}

interface MaterialList {
  id: string;
  title: string;
  items: MaterialItem[];
  createdAt: number;
  clientName?: string;
  orcamentoName?: string;
}

function ListContent() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<MaterialList | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const d = searchParams.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d))) as MaterialList;
        
        // Carrega o estado de marcação do cliente localmente no celular dele
        const localCheckedKey = `@ea:public-list-checked:${decoded.id}`;
        const localCheckedRaw = localStorage.getItem(localCheckedKey);
        if (localCheckedRaw) {
          const checkedMap = JSON.parse(localCheckedRaw);
          decoded.items = decoded.items.map(item => ({
            ...item,
            checked: checkedMap[item.id] === true
          }));
        }
        
        setList(decoded);
      } catch (e) {
        console.error('Erro ao decodificar lista:', e);
        setError(true);
      }
    }
  }, [searchParams]);

  const toggleItem = (itemId: string) => {
    if (!list) return;
    const newItems = list.items.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedList = { ...list, items: newItems };
    setList(updatedList);
    
    // Salva localmente no dispositivo do cliente
    const checkedMap: Record<string, boolean> = {};
    newItems.forEach(i => {
      if (i.checked) checkedMap[i.id] = true;
    });
    localStorage.setItem(`@ea:public-list-checked:${list.id}`, JSON.stringify(checkedMap));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: list?.title || 'Lista de Materiais',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A] p-4 text-center">
        <div className="bg-white dark:bg-[#1C1F26] p-8 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} weight="duotone" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">Erro ao carregar lista</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">O link fornecido pode estar quebrado, incompleto ou expirado.</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#13151A]">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">Carregando lista de materiais...</p>
      </div>
    );
  }

  const total = list.items.length;
  const checked = list.items.filter(i => i.checked).length;
  const progress = total === 0 ? 0 : Math.round((checked / total) * 100);
  const isComplete = total > 0 && checked === total;

  return (
    <>
      {/* 1. VISUALIZAÇÃO DE IMPRESSÃO / SALVAR COMO PDF */}
      <div className="hidden print:block w-full text-slate-900 bg-white" id="public-print-view">
        <style dangerouslySetInnerHTML={{ __html: `
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
        `}} />

        {/* EACard Oficial Elétrica & Art */}
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
            backgroundColor: '#0a0f19',
            backgroundImage: "url('https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
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
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', padding: '0 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <img
                src="https://res.cloudinary.com/dyycxyttb/image/upload/v1772753359/ea-Name_iq49ju.png"
                alt="Elétrica & Art"
                style={{ maxWidth: '270px', width: '100%', height: 'auto', objectFit: 'contain', marginBottom: '2px', display: 'block' }}
              />
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, display: 'block' }}>
              CNPJ 32.858.892/0001-52 - IM 67358/0001
            </span>
            <p style={{ fontSize: '9.5px', color: '#f1f5f9', lineHeight: 1.25, margin: '2px 0' }}>
              Rua José Alves Maciel, 40 - Aviação<br />
              Praia Grande - São Paulo - SP - Cep 11702-440
            </p>
            <div style={{ fontSize: '9.5px', color: '#f8fafc', lineHeight: 1.25 }}>
              <strong style={{ color: '#ffffff' }}>Fone </strong> ( 13 ) 99768-5853 &bull; 
              <strong style={{ color: '#ffffff' }}> Whatsapp </strong> ( 13 ) 99768-5853<br />
              <strong style={{ color: '#ffffff' }}>E-mail </strong> eletrica.art.ltda@gmail.com
            </div>
          </div>
        </div>

        {/* Card Informativo do Documento */}
        <div style={{ border: '1px solid rgba(0, 85, 156, 0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #00559c', paddingBottom: '6px', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#00559c', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Documento de Quantitativos</span>
              <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{list.title || 'Lista de Materiais'}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Data de Emissão</span>
              <strong style={{ fontSize: '12px', color: '#0f172a' }}>{new Date(list.createdAt || Date.now()).toLocaleDateString('pt-BR')}</strong>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Cliente</span>
              <strong style={{ color: '#1e293b', fontSize: '12px' }}>{list.clientName || 'Não especificado'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Orçamento / Obra Ref.</span>
              <strong style={{ color: '#1e293b', fontSize: '12px' }}>{list.orcamentoName || 'Geral'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Progresso da Compra</span>
              <strong style={{ color: '#00559c', fontSize: '12px' }}>{checked} de {total} itens ({progress}%)</strong>
            </div>
          </div>
        </div>

        {/* Tabela com Head #00559c e Linhas Intercaladas */}
        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '8px' }}>
          <thead>
            <tr style={{ backgroundColor: '#00559c', color: '#ffffff' }}>
              <th style={{ width: '38px', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>Material / Descrição</th>
              <th style={{ width: '85px', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>Quantidade</th>
              <th style={{ width: '90px', padding: '8px 10px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>Preço Unit.</th>
              <th style={{ width: '90px', padding: '8px 10px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total</th>
              <th style={{ width: '48px', padding: '8px', textAlign: 'center', fontWeight: 800 }}>Check</th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const rowBg = isEven ? '#edf4fa' : '#fafafa';
              let unitPriceStr = '-';
              let totalItemStr = '-';
              if (item.unitPrice) {
                const p = parseFloat(item.unitPrice.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
                const q = parseFloat((item.quantity || '1').replace(/[^\d.]/g, '')) || 1;
                if (!isNaN(p) && p > 0) {
                  unitPriceStr = `R$ ${p.toFixed(2).replace('.', ',')}`;
                  totalItemStr = `R$ ${(p * q).toFixed(2).replace('.', ',')}`;
                } else {
                  unitPriceStr = item.unitPrice;
                }
              }

              return (
                <tr 
                  key={item.id} 
                  style={{ 
                    backgroundColor: rowBg, 
                    borderBottom: '1px solid rgba(0, 85, 156, 0.12)',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 700, color: '#00559c', borderRight: '1px solid rgba(0,85,156,0.08)' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid rgba(0,85,156,0.08)' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1.5px' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid rgba(0,85,156,0.08)' }}>
                    {item.quantity || '1 un'}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569', borderRight: '1px solid rgba(0,85,156,0.08)' }}>
                    {unitPriceStr}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#00559c', borderRight: '1px solid rgba(0,85,156,0.08)' }}>
                    {totalItemStr}
                  </td>
                  <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: `1.5px solid ${item.checked ? '#10b981' : '#94a3b8'}`,
                      borderRadius: '3px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: item.checked ? '#10b981' : '#ffffff',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      {item.checked ? '✓' : ''}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Rodapé do PDF */}
        <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
          <span>Elétrica & Art &bull; Soluções em Engenharia e Instalações Elétricas</span>
          <strong style={{ color: '#00559c' }}>{list.items.length} itens listados</strong>
        </div>
      </div>

      {/* 2. VISUALIZAÇÃO INTERATIVA EM TELA (Mobile & Desktop) */}
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#13151A] text-slate-800 dark:text-slate-100 font-sans pb-28 selection:bg-teal-500/30 print:hidden">
        
        {/* Top Header */}
        <div className="bg-white dark:bg-[#1C1F26] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] pt-safe">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50">
             <motion.div 
               className="h-full bg-gradient-to-r from-teal-500 to-emerald-400" 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ type: "spring", bounce: 0, duration: 0.8 }}
             />
          </div>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
             <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                      <ShoppingCart size={14} weight="bold" />
                      Lista de Compras
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {checked} de {total} itens
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate leading-tight">{list.title}</h1>
                  
                  {(list.clientName || list.orcamentoName) && (
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {list.clientName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                          <Users size={14} />
                          <span className="truncate max-w-[120px]">{list.clientName}</span>
                        </span>
                      )}
                      {list.orcamentoName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                          <Receipt size={14} />
                          <span className="truncate max-w-[150px]">{list.orcamentoName}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="block text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter leading-none">
                    {progress}<span className="text-lg text-slate-400">%</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Concluído</span>
                </div>
             </div>
          </div>
        </div>

        {/* Action Bar: Botões de Imprimir / PDF e Compartilhar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer size={16} weight="bold" className="text-teal-600 dark:text-teal-400" />
            <span>Imprimir / Salvar PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-bold text-xs active:scale-[0.98] transition-all shadow-sm"
            title="Compartilhar Link"
          >
            <ShareNetwork size={16} weight="bold" />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* Itens da Lista */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          
          <AnimatePresence>
            {isComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 mb-6 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-black mb-0.5">Tudo Pronto! 🎉</h2>
                  <p className="text-emerald-50 font-medium text-xs">Você marcou todos os itens desta lista.</p>
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
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} weight="duotone" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum material adicionado.</p>
                </motion.div>
              ) : (
                [...list.items].sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1)).map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer active:scale-[0.98] transition-all overflow-hidden ${
                      item.checked 
                        ? 'bg-slate-100/50 dark:bg-slate-800/30 border-transparent shadow-none' 
                        : 'bg-white dark:bg-[#1C1F26] border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-teal-200 dark:hover:border-teal-900/50'
                    }`}
                  >
                    <button 
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        item.checked 
                          ? 'bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-500/30' 
                          : 'border-[2px] border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <CheckCircle size={18} weight="bold" className={item.checked ? 'opacity-100' : 'opacity-0'} />
                    </button>
                    
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-2">
                        {item.quantity && (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-md shrink-0 ${
                            item.checked 
                              ? 'bg-slate-200/60 dark:bg-slate-800 text-slate-400' 
                              : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40'
                          }`}>
                            {item.quantity}
                          </span>
                        )}
                        <span className={`font-semibold text-[14.5px] truncate transition-all duration-300 ${
                          item.checked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-100'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      
                      {(item.unitPrice || item.description) && (
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          {item.description && <span className="truncate">{item.description}</span>}
                          {item.unitPrice && <span className="text-teal-600 dark:text-teal-400 font-medium">R$ {item.unitPrice}</span>}
                        </div>
                      )}
                    </div>

                    {item.checked && (
                       <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl pointer-events-none" />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Floating Actions na parte inferior direita */}
        <div className="fixed bottom-6 right-6 flex items-center gap-3 z-40">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handlePrint}
            title="Imprimir Lista"
            className="w-12 h-12 bg-white dark:bg-[#1E222B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <Printer size={22} weight="bold" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={handleShare}
            title="Compartilhar Link"
            className="w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform shadow-teal-600/30"
          >
            <ShareNetwork size={24} weight="fill" />
          </motion.button>
        </div>
      </div>
    </>
  );
}

export default function PublicListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#181b20]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ListContent />
    </Suspense>
  );
}
