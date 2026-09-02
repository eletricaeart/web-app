// components/painel/orcamentos/AiBudgetImportModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkle,
  UploadSimple,
  ClipboardText,
  CheckCircle,
  CircleNotch,
  FileText,
  User,
  MapPin,
  ListNumbers,
  CurrencyCircleDollar,
  ArrowRight,
  ArrowCounterClockwise,
  Info,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatCurrency, buildInvestmentClause, buildSummaryClause } from '@/lib/types/investment';

interface AiBudgetImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyExtractedBudget: (data: any) => void;
  clientsCache?: any[];
}

export default function AiBudgetImportModal({
  isOpen,
  onOpenChange,
  onApplyExtractedBudget,
  clientsCache = [],
}: AiBudgetImportModalProps) {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'Conectando ao Gemini AI...',
    'Analisando cabeçalho, cliente e localização...',
    'Estruturando todas as cláusulas e escopos na íntegra...',
    'Consolidando quantitativos, mão de obra e cronograma financeiro...',
    'Finalizando padronização do orçamento com precisão total...',
  ];

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim().length > 0) {
          setTextInput(clipboardText);
          toast.success('Texto colado da área de transferência!');
        } else {
          toast.info('A área de transferência está vazia.');
        }
      } else {
        toast.info('Cole o texto diretamente no campo abaixo.');
      }
    } catch {
      toast.info('Permissão para área de transferência não concedida. Cole manualmente.');
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo selecionado é muito grande (máximo 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setTextInput(content);
        toast.success(`Arquivo "${file.name}" carregado com sucesso!`);
      }
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!textInput || textInput.trim().length < 20) {
      return toast.error('Por favor, cole ou carregue o texto completo da proposta.');
    }

    setLoading(true);
    setLoadingStep(0);
    setElapsedSeconds(0);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      let response: Response | null = null;
      let result: any = null;

      // 1. Tenta rota Express principal
      try {
        response = await fetch('/api/gemini/extract-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textInput }),
        });
        if (response && response.ok) {
          result = await response.json();
        }
      } catch (e) {
        console.warn('Falha na rota /api/gemini/extract-budget:', e);
      }

      // 2. Se a primeira falhou, tenta rota Next.js de contingência
      if (!result || !result.success) {
        try {
          response = await fetch('/api/ai/parse-budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput }),
          });
          if (response && response.ok) {
            result = await response.json();
          }
        } catch (e) {
          console.warn('Falha na rota /api/ai/parse-budget:', e);
        }
      }

      if (!result || !result.success || !result.data) {
        throw new Error(result?.error || 'Erro ao processar proposta com IA.');
      }

      setExtractedData(result.data);
      toast.success('Proposta analisada e estruturada com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Falha ao processar proposta com IA.');
    } finally {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (!extractedData) return;

    // Tentar cruzar com cliente existente no cache pelo nome
    let matchedClient: any = null;
    const clientName = extractedData.client?.name?.trim()?.toLowerCase() || '';

    if (clientName && clientsCache.length > 0) {
      matchedClient = clientsCache.find((c: any) => {
        const cName = (c.name || c['Nome Completo'] || '').trim().toLowerCase();
        return cName === clientName || cName.includes(clientName) || clientName.includes(cName);
      });
    }

    const mergedClient = {
      id: matchedClient?.id || '',
      name: matchedClient?.name || matchedClient?.['Nome Completo'] || extractedData.client?.name || '',
      zip: matchedClient?.zip || matchedClient?.cep || extractedData.client?.zip || '',
      street: matchedClient?.street || matchedClient?.rua || extractedData.client?.street || '',
      number: matchedClient?.number || matchedClient?.num || extractedData.client?.number || '',
      neighborhood: matchedClient?.neighborhood || matchedClient?.bairro || extractedData.client?.neighborhood || '',
      city: matchedClient?.city || matchedClient?.cidade || extractedData.client?.city || '',
      complement: matchedClient?.complement || matchedClient?.complemento || extractedData.client?.complement || '',
      document: matchedClient?.document || matchedClient?.['CPF / CNPJ'] || '',
      whatsapp: matchedClient?.whatsapp || '',
      email: matchedClient?.email || '',
      category: matchedClient?.category || '',
      photo_url: matchedClient?.photo_url || matchedClient?.photo || '',
    };

    // Formatar cláusulas (ignorando apenas "Considerações Finais", que é template padrão de rodapé)
    const rawServices = (extractedData.services || []).filter((srv: any) => {
      const title = (srv.titulo || '').toLowerCase().trim();
      return !title.includes('considerações finais') && !title.includes('consideracoes finais');
    });

    const formattedServices = rawServices.map((srv: any, srvIdx: number) => {
      const clauseId = Date.now() + srvIdx * 100;
      const items = (srv.items || []).map((it: any, itIdx: number) => ({
        id: clauseId + itIdx + 1,
        subtitulo: it.subtitulo || '',
        content: it.content || '',
        numbered: it.numbered !== false,
      }));

      return {
        id: clauseId,
        titulo: srv.titulo || `Cláusula ${srvIdx + 1}`,
        items: items.length > 0 ? items : [{ id: clauseId + 1, subtitulo: '', content: '' }],
      };
    });

    // Formatar financeiro V3 e V2
    const finV3 = extractedData.financialV3 || {};
    const finV2 = extractedData.financialV2 || {};
    
    // Obter lista consolidada de serviços/categorias
    let categories: any[] = [];
    if (finV3.servicesBreakdown && finV3.servicesBreakdown.length > 0) {
      categories = finV3.servicesBreakdown.map((s: any, idx: number) => ({
        id: `cat_ai_v3_${Date.now()}_${idx}`,
        category: s.type || 'outros',
        categoryLabel: s.name || 'Serviço',
        laborValue: Number(s.value) || 0,
        materialsValue: 0,
        totalValue: Number(s.value) || 0,
        description: s.description || (s.area_m2 ? `Área: ${s.area_m2}m²` : ''),
      }));
    } else if (finV2.categories && finV2.categories.length > 0) {
      categories = finV2.categories.map((cat: any, cIdx: number) => {
        const labor = Number(cat.laborValue) || 0;
        const materials = Number(cat.materialsValue) || 0;
        const total = Number(cat.totalValue) || (labor + materials);
        return {
          id: `cat_ai_${Date.now()}_${cIdx}`,
          category: cat.category || 'outros',
          categoryLabel: cat.categoryLabel || 'Serviço',
          laborValue: labor,
          materialsValue: materials,
          totalValue: total,
          description: cat.description || '',
        };
      });
    }

    const totalLabor = finV3.totalLabor || finV2.totalLabor || categories.reduce((acc: number, c: any) => acc + c.laborValue, 0);
    const totalMaterials = finV3.totalMaterials || finV2.totalMaterials || categories.reduce((acc: number, c: any) => acc + c.materialsValue, 0);
    const grandTotal = finV3.grandTotal || finV2.grandTotal || (totalLabor + totalMaterials);
    const paymentCond = finV3.paymentConditions || finV2.paymentConditions || '';
    const deadlineVal = finV3.deadline || finV2.deadline || '';
    const warrantyVal = finV3.warranty || finV2.warranty || '';

    const constructedFinancialV2 = {
      schemaVersion: 2,
      categories,
      totalLabor,
      totalMaterials,
      grandTotal,
      paymentConditions: paymentCond,
      deadline: deadlineVal,
      warranty: warrantyVal,
      generalNotes: [
        paymentCond ? `Condições de Pagamento: ${paymentCond}` : null,
        deadlineVal ? `Prazo de Execução: ${deadlineVal}` : null,
        warrantyVal ? `Garantia: ${warrantyVal}` : null,
      ].filter(Boolean).join(' | '),
    };

    // Usar fielmente as cláusulas extraídas do documento
    const finalServices = [...formattedServices];

    const payload = {
      schema_version: 'v3',
      documentTitle: extractedData.documentTitle || 'PROPOSTA DE SERVIÇOS',
      subtitle: extractedData.subtitle || 'PROPOSTA DE ORÇAMENTO',
      issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
      expiration: extractedData.expiration || '15 dias',
      client: mergedClient,
      services: finalServices.length > 0 ? finalServices : [
        {
          id: Date.now(),
          titulo: 'Escopo dos Serviços',
          items: [{ id: Date.now() + 1, subtitulo: '', content: '' }],
        },
      ],
      financial_v3: {
        total: grandTotal,
        servicesBreakdown: (finV3.servicesBreakdown || []).map((s: any) => ({
          name: s.name,
          value: Number(s.value) || 0,
          type: s.type || 'misto',
          description: s.description || '',
          area_m2: s.area_m2 ? Number(s.area_m2) : undefined,
          deadline_days: s.deadline_days ? Number(s.deadline_days) : undefined,
        })),
        categories: categories.map(c => ({ name: c.categoryLabel, value: c.totalValue })),
        paymentConditions: paymentCond,
        deadline: deadlineVal,
        warranty: warrantyVal,
        paymentSchedule: finV3.paymentSchedule || [],
      },
      financialV2: constructedFinancialV2,
      financial: {
        labor: totalLabor,
        materials: totalMaterials,
        discount: 0,
        total: grandTotal,
      },
    };

    onApplyExtractedBudget(payload);
    onOpenChange(false);
    toast.success('Campos do orçamento preenchidos com sucesso!');
  };

  const handleReset = () => {
    setExtractedData(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl sm:rounded-3xl z-[99999] overflow-hidden">
        {/* Header Fixo */}
        <DialogHeader className="shrink-0 p-4 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
              <Sparkle size={22} weight="fill" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Importar Proposta com IA
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Gemini
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Cole o texto da proposta ou carregue o arquivo para preencher todas as cláusulas e finanças automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Corpo Scrollável com Padding de Segurança */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {!extractedData ? (
            /* Formulário de Entrada do Texto */
            <div className="space-y-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ClipboardText size={16} className="text-indigo-600 dark:text-indigo-400" weight="bold" />
                  Texto da Proposta Comercial / WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePasteClipboard}
                    className="h-8 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 border-slate-200 dark:border-slate-700"
                  >
                    <ClipboardText size={14} className="mr-1.5" /> Colar Texto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 border-slate-200 dark:border-slate-700"
                  >
                    <UploadSimple size={14} className="mr-1.5" /> Carregar Arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {/* Área de Dropzone e Textarea */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950'
                }`}
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Cole aqui o texto integral da proposta (ex: 'PROPOSTA DE ORÇAMENTO...', '1. OBJETO...', '2. DEMOLIÇÃO...', '3. CONSTRUÇÃO...', 'VALOR GLOBAL...', etc.)"
                  rows={10}
                  disabled={loading}
                  className="w-full p-4 text-xs leading-relaxed font-mono text-slate-800 dark:text-slate-200 bg-transparent border-0 rounded-2xl focus:outline-none resize-y placeholder:text-slate-400"
                />

                {textInput.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                      <FileText size={24} weight="duotone" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Arraste um arquivo de texto ou cole a proposta
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      A IA identifica e transcreve 100% de todas as cláusulas, cliente, cronograma e valores detalhados.
                    </p>
                  </div>
                )}
              </div>

              {/* Progresso durante o loading */}
              {loading && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CircleNotch size={24} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      {loadingSteps[loadingStep]}
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(95, ((loadingStep + 1) / loadingSteps.length) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-indigo-600/90 dark:text-indigo-400 mt-2 font-medium">
                    <span>
                      {elapsedSeconds > 10
                        ? 'Processando documento técnico integral...'
                        : 'Lendo conteúdo da proposta...'}
                    </span>
                    <span className="font-mono bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-200 font-bold">
                      {elapsedSeconds}s decorridos
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tela de Prévia e Confirmação dos Dados Extraídos */
            <div className="space-y-4 pb-2 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle size={22} weight="fill" className="text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    Dados Estruturados com Sucesso!
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowCounterClockwise size={14} className="mr-1" />
                  Trocar Texto
                </Button>
              </div>

              {/* Resumo do Documento e Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Cartão Documento */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <FileText size={16} className="text-indigo-600 dark:text-indigo-400" weight="bold" />
                    Proposta Identificada
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{extractedData.subtitle || 'PROPOSTA DE ORÇAMENTO'}</span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {extractedData.documentTitle || 'Não identificado'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>
                      <strong>Emissão:</strong> {extractedData.issueDate || 'Data atual'}
                    </span>
                    <span>
                      <strong>Validade:</strong> {extractedData.expiration || '15 dias'}
                    </span>
                  </div>
                </div>

                {/* Cartão Cliente */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <User size={16} className="text-indigo-600 dark:text-indigo-400" weight="bold" />
                    Cliente & Localização
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      {extractedData.client?.name || 'Cliente a preencher'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1 mt-1">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {[
                          extractedData.client?.street,
                          extractedData.client?.number ? `nº ${extractedData.client?.number}` : null,
                          extractedData.client?.complement,
                          extractedData.client?.neighborhood,
                          extractedData.client?.city,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Endereço não informado no texto'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cartão de Cláusulas e Escopo */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <ListNumbers size={16} className="text-indigo-600 dark:text-indigo-400" weight="bold" />
                    Cláusulas Detectadas ({extractedData.services?.length || 0})
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Transcrição integral na íntegra
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {(extractedData.services || []).map((srv: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {idx + 1}. {srv.titulo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                        {srv.items?.length || 1} {srv.items?.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cartão Financeiro / Investimento */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-900 dark:text-indigo-200">
                    <CurrencyCircleDollar size={18} className="text-indigo-600 dark:text-indigo-400" weight="bold" />
                    Investimento & Valores Identificados
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block font-medium">Total Geral</span>
                    <span className="text-base sm:text-lg font-black text-indigo-950 dark:text-indigo-100">
                      {formatCurrency(extractedData.financialV2?.grandTotal || 0)}
                    </span>
                  </div>
                </div>

                {extractedData.financialV2?.categories?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 max-h-36 overflow-y-auto pr-1">
                    {extractedData.financialV2.categories.map((cat: any, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-indigo-100/80 dark:border-indigo-900/60"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cat.categoryLabel || cat.category}
                          {cat.description ? ` (${cat.description})` : ''}
                        </span>
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">
                          {formatCurrency(cat.totalValue || cat.laborValue || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                  <div>
                    <strong>Pagamento:</strong> {extractedData.financialV2?.paymentConditions || 'Conforme proposta'}
                  </div>
                  <div>
                    <strong>Prazo:</strong> {extractedData.financialV2?.deadline || 'A definir'}
                  </div>
                  <div>
                    <strong>Garantia:</strong> {extractedData.financialV2?.warranty || '3 meses'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo / Sticky com Ações e Total Visibilidade no Celular */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 z-40">
          {!extractedData ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="h-11 sm:h-10 px-5 text-xs font-bold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleProcess}
                disabled={loading || textInput.trim().length === 0}
                className="h-11 sm:h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    <span>Processando Proposta...</span>
                  </>
                ) : (
                  <>
                    <Sparkle size={18} weight="fill" />
                    <span>Analisar e Estruturar com IA</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-11 sm:h-10 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <ArrowCounterClockwise size={16} className="mr-1.5" />
                Editar / Outro Texto
              </Button>

              <Button
                type="button"
                onClick={handleConfirmApply}
                className="h-11 sm:h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                <span>Preencher Formulário de Orçamento</span>
                <ArrowRight size={18} weight="bold" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
