// components/painel/orcamentos/OrcamentoVerPainelNovo.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import AppBar from '@/components/layout/AppBar';
import {
  FilePdf,
  ArrowLeft,
  ArrowCounterClockwise,
  Sparkle,
  Eye,
  SpinnerGap,
  CheckCircle,
} from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import BudgetSkeleton from './BudgetSkeleton';
import OrcamentoModeloNovoView from '@/components/orcamentos/modelo-novo/OrcamentoModeloNovoView';
import {
  imprimirNovoModeloPdf,
  gerarPdfPuppeteerBackend,
} from '@/components/orcamentos/modelo-novo/geradorNovoPdf';
import { toast } from 'sonner';

export default function OrcamentoVerPainelNovo() {
  const router = usePainelRouter();
  const id = router.params.id;

  const { data: orcamentos } = useEASyncSupabase<any>('orcamentos');
  const { data: clientes } = useEASyncSupabase<any>('clientes');

  const budgetRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPuppeteer, setIsGeneratingPuppeteer] = useState(false);
  const [puppeteerPdfUrl, setPuppeteerPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (orcamentos && id) {
      const found = orcamentos.find((o: any) => String(o.id) === String(id));
      if (found) {
        setData(found);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [orcamentos, id]);

  const displayData = useMemo(() => {
    if (!data) return null;

    const clienteBase = clientes?.find(
      (c: any) =>
        c.id === data.client_id ||
        c.name?.trim().toLowerCase() ===
          (data.client_name_manual || data.clientName || data.cliente?.name)
            ?.trim()
            .toLowerCase(),
    );

    const ref = clienteBase || data;

    const financial = data.financial_json ||
      data.financial || {
        labor: 0,
        materials: 0,
        discount: 0,
        total: 0,
      };

    const servicesRaw = (() => {
      const raw =
        data.services_json ||
        data.services ||
        data.servicos ||
        data['Serviços JSON'];
      if (!raw) return [];
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
      return Array.isArray(raw) ? raw : [];
    })();

    return {
      clientName:
        data.client_name_manual ||
        data.clientName ||
        data.cliente?.name ||
        data['Nome Cliente'] ||
        'Cliente',
      documentTitle:
        data.document_title ||
        data.documentTitle ||
        data.docTitle?.text ||
        data['Título Doc'] ||
        'Orçamento',
      issueDate:
        data.issue_date ||
        data.issueDate ||
        data.docTitle?.emissao ||
        data['Emissão'] ||
        data.created_at ||
        '',
      expiration:
        data.expiration ||
        data.docTitle?.validade ||
        data['Validade'] ||
        '15 dias',
      subtitle:
        data.subtitle ||
        data.docTitle?.subtitle ||
        data['Subtítulo'] ||
        'PROPOSTA DE ORÇAMENTO',
      financial,
      services: servicesRaw,
      address: {
        street:
          ref.street ||
          ref.clientAddress?.street ||
          ref.cliente?.rua ||
          data.street ||
          data.financial_json?.address?.street ||
          '',
        number:
          ref.number ||
          ref.clientAddress?.number ||
          ref.cliente?.num ||
          data.number ||
          data.financial_json?.address?.number ||
          '',
        neighborhood:
          ref.neighborhood ||
          ref.clientAddress?.neighborhood ||
          ref.cliente?.bairro ||
          data.neighborhood ||
          data.financial_json?.address?.neighborhood ||
          '',
        city:
          ref.city ||
          ref.clientAddress?.city ||
          ref.cliente?.cidade ||
          data.city ||
          data.financial_json?.address?.city ||
          '',
        complement:
          ref.complement ||
          ref.complemento ||
          data.complement ||
          data.financial_json?.address?.complement ||
          '',
      },
    };
  }, [data, clientes]);

  const handleImprimir = () => {
    toast.dismiss();
    imprimirNovoModeloPdf();
  };

  const handleGerarPuppeteer = async () => {
    if (!budgetRef.current) {
      toast.error('Elemento do orçamento não carregado para renderização.');
      return;
    }
    setIsGeneratingPuppeteer(true);
    toast.loading('Renderizando PDF no servidor via Puppeteer...', {
      id: 'puppeteer-toast',
    });

    try {
      const result = await gerarPdfPuppeteerBackend(
        budgetRef.current,
        displayData?.clientName || 'Cliente',
      );

      if (result) {
        setPuppeteerPdfUrl(result.url);
        toast.success('PDF gerado com sucesso via Puppeteer!', {
          id: 'puppeteer-toast',
        });
        // Abre o PDF gerado em nova aba ou inicia download
        const a = document.createElement('a');
        a.href = result.url;
        a.target = '_blank';
        a.download = result.file.name;
        a.click();
      } else {
        toast.error('Falha ao gerar PDF no backend. Verifique o servidor.', {
          id: 'puppeteer-toast',
        });
      }
    } catch (e) {
      toast.error('Erro na requisição ao Puppeteer.', {
        id: 'puppeteer-toast',
      });
    } finally {
      setIsGeneratingPuppeteer(false);
    }
  };

  const handleVoltarAoClassico = () => {
    router.push('orcamentos.ver', { id });
  };

  if (loading) {
    return (
      <>
        <AppBar backAction={() => router.back()} />
        <BudgetSkeleton />
      </>
    );
  }

  if (!data || !displayData) {
    return (
      <>
        <AppBar backAction={() => router.back()} />
        <div className="p-10 text-center text-slate-500">
          Orçamento não encontrado no Modelo de Teste.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="no-print print:hidden">
        <AppBar
          backAction={() => router.back()}
          title="Novo Modelo (Teste)"
          options={
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoltarAoClassico}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                title="Voltar ao modelo clássico"
              >
                <ArrowCounterClockwise size={14} />
                <span className="hidden sm:inline">Modelo Clássico</span>
              </button>
              <button
                onClick={() => router.push('orcamentos.previa-pdf', { id })}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                title="Visualizar exatamente como sairá no PDF impresso"
              >
                <Eye size={16} weight="bold" />
                <span>Prévia do PDF</span>
              </button>
              <button
                onClick={handleImprimir}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                title="Imprimir direto pelo navegador"
              >
                <FilePdf size={16} weight="duotone" />
                <span>Imprimir Direto</span>
              </button>
              <button
                onClick={handleGerarPuppeteer}
                disabled={isGeneratingPuppeteer}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Gerar PDF no backend com Puppeteer"
              >
                {isGeneratingPuppeteer ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    <span>Gerando Puppeteer...</span>
                  </>
                ) : (
                  <>
                    <FilePdf size={16} weight="fill" />
                    <span>Testar Puppeteer</span>
                  </>
                )}
              </button>
            </div>
          }
        />
      </div>

      {/* Banner de Ambiente de Teste */}
      <div className="no-print bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-900">
        <div className="flex items-center gap-2 font-medium">
          <Sparkle
            size={16}
            className="text-indigo-600 shrink-0"
            weight="fill"
          />
          <span>
            <b>Ambiente de Teste & Validação:</b> Este é o novo modelo
            unificado.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGerarPuppeteer}
            disabled={isGeneratingPuppeteer}
            className="text-indigo-700 font-bold hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
          >
            <FilePdf size={14} weight="fill" />
            <span>
              {isGeneratingPuppeteer
                ? 'Gerando no Puppeteer...'
                : 'Testar Gerar PDF no Backend (Puppeteer)'}
            </span>
          </button>
          <span className="text-indigo-300">•</span>
          <button
            onClick={() => router.push('orcamentos.previa-pdf', { id })}
            className="text-emerald-700 font-bold hover:text-emerald-800 underline flex items-center gap-1"
          >
            <Eye size={14} weight="bold" />
            <span>Ver como sai no PDF (Página de Prévia)</span>
          </button>
          <span className="text-indigo-300">•</span>
          <button
            onClick={handleVoltarAoClassico}
            className="underline font-semibold hover:text-indigo-700"
          >
            Ir para Original
          </button>
        </div>
      </div>

      {/* Exibição do Orçamento com o Novo Modelo */}
      <main className="min-h-screen bg-slate-100/70 py-6 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <OrcamentoModeloNovoView
            data={data}
            displayData={displayData}
            containerRef={budgetRef}
          />
        </div>
      </main>
    </>
  );
}
