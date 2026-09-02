// components/painel/orcamentos/OrcamentoPreviaPdfPainel.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import {
  FilePdf,
  ArrowLeft,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CornersOut,
  ArrowsInSimple,
  Printer,
  Sparkle,
  SlidersHorizontal,
  Eye,
  CheckCircle,
  Question,
} from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import BudgetSkeleton from './BudgetSkeleton';
import OrcamentoModeloNovoView from '@/components/orcamentos/modelo-novo/OrcamentoModeloNovoView';
import { imprimirNovoModeloPdf } from '@/components/orcamentos/modelo-novo/geradorNovoPdf';
import '@/components/orcamentos/modelo-novo/OrcamentoPreviaPdf.css';

export default function OrcamentoPreviaPdfPainel() {
  const router = usePainelRouter();
  const id = router.params.id;

  const { data: orcamentos } = useEASyncSupabase<any>('orcamentos');
  const { data: clientes } = useEASyncSupabase<any>('clientes');

  const budgetRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de controle do visualizador
  const [zoom, setZoom] = useState(100);
  const [showPageGuides, setShowPageGuides] = useState(true);
  const [pageCount, setPageCount] = useState(1);

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

  // Ajuste inicial para telas menores
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      // 210mm equivale aproximadamente a 794px a 96DPI
      if (screenWidth < 850) {
        const calculatedZoom = Math.max(
          45,
          Math.floor(((screenWidth - 24) / 794) * 100),
        );
        setZoom(calculatedZoom);
      }
    }
  }, []);

  // Monitora a altura da folha para calcular a quantidade de páginas A4 (297mm cada)
  useEffect(() => {
    const updatePageCount = () => {
      if (!sheetRef.current) return;
      const heightPx = sheetRef.current.offsetHeight;
      // A4 height em px (297mm a 96DPI = ~1122.5px)
      // Usamos a proporção baseada na largura de 210mm (793.7px)
      const a4HeightPx = (sheetRef.current.offsetWidth * 297) / 210;
      if (a4HeightPx > 0) {
        const pages = Math.ceil(heightPx / a4HeightPx);
        setPageCount(Math.max(1, pages));
      }
    };

    updatePageCount();
    const timer = setTimeout(updatePageCount, 600);
    window.addEventListener('resize', updatePageCount);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePageCount);
    };
  }, [data, zoom]);

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

  const handleZoomIn = () => setZoom((prev) => Math.min(180, prev + 15));
  const handleZoomOut = () => setZoom((prev) => Math.max(40, prev - 15));
  const handleResetZoom = () => setZoom(100);

  const handleFitWidth = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      // Largura da folha A4 com margens de workspace
      const targetZoom = Math.min(
        130,
        Math.max(40, Math.floor(((screenWidth - 32) / 794) * 100)),
      );
      setZoom(targetZoom);
    }
  };

  const handleImprimir = () => {
    imprimirNovoModeloPdf();
  };

  const handleVoltar = () => {
    router.push('orcamentos.modelo-novo', { id });
  };

  if (loading) {
    return (
      <div className="p-6">
        <BudgetSkeleton />
      </div>
    );
  }

  if (!data || !displayData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-slate-400 mb-4">Orçamento não encontrado.</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* 1. Barra Superior de Controle do PDF (Acrobat / Chrome PDF Style) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-md">
        {/* Esquerda: Voltar e Título */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoltar}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Voltar ao modo de edição / tela"
          >
            <ArrowLeft size={16} weight="bold" />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <FilePdf size={18} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Prévia do PDF Final
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                  <CheckCircle size={10} weight="fill" />
                  100% Estilos de Impressão Ativos
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Formato A4 (210mm × 297mm) • Margens 8mm / 6mm
              </p>
            </div>
          </div>
        </div>

        {/* Centro / Direita: Controles de Zoom e Guias */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alternador de Guias de Quebra A4 */}
          <button
            onClick={() => setShowPageGuides(!showPageGuides)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-all ${
              showPageGuides
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostrar ou ocultar linhas onde as folhas A4 cortam (297mm)"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden lg:inline">Guias A4</span>
            <span className="text-[10px] font-bold opacity-80">
              {showPageGuides ? 'Ligadas' : 'Desligadas'}
            </span>
          </button>

          {/* Grupo de Zoom */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Diminuir Zoom"
            >
              <MagnifyingGlassMinus size={15} />
            </button>

            <button
              onClick={handleResetZoom}
              className="text-xs font-semibold px-2 py-0.5 text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Restaurar para 100%"
            >
              {zoom}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Aumentar Zoom"
            >
              <MagnifyingGlassPlus size={15} />
            </button>

            <button
              onClick={handleFitWidth}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded border-l border-slate-700 ml-0.5 transition-colors hidden sm:block"
              title="Ajustar à largura da tela"
            >
              <CornersOut size={15} />
            </button>
          </div>

          {/* Botão Primário: Imprimir / Exportar PDF */}
          <button
            onClick={handleImprimir}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            title="Disparar impressão oficial em PDF"
          >
            <Printer size={16} weight="fill" />
            <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            <span className="sm:hidden">Imprimir</span>
          </button>
        </div>
      </header>

      {/* 2. Barra de Alerta Informativo / Boas Práticas */}
      <div className="bg-slate-800/80 border-b border-slate-700/60 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkle
            size={14}
            weight="fill"
            className="text-amber-400 shrink-0"
          />
          <span>
            <b>Fidelidade Visual do PDF:</b> Esta folha branca representa
            exatamente as dimensões e proporções da folha A4 física que sairá na
            impressora ou no PDF baixado.
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 mt-1 sm:mt-0 font-medium">
          <span>
            Documento estimado em:{' '}
            <strong className="text-indigo-300">
              {pageCount} {pageCount === 1 ? 'página' : 'páginas'} A4
            </strong>
          </span>
          {showPageGuides && (
            <span className="text-rose-400 flex items-center gap-1">
              <span className="inline-block w-2 h-0.5 bg-rose-500"></span>
              Linhas vermelhas indicam as quebras de 297mm
            </span>
          )}
        </div>
      </div>

      {/* 3. Área de Trabalho / Workspace com a Folha A4 Centralizada */}
      <main className="ea-pdf-workspace">
        {/* Container escalonável pelo zoom */}
        <div
          className="ea-a4-sheet-container"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            marginBottom: zoom > 100 ? `${(zoom - 100) * 12}px` : '20px',
          }}
        >
          {/* Folha A4 Física Real */}
          <div ref={sheetRef} className="ea-a4-sheet">
            {/* Linhas Guia de Quebra de Página A4 (se ativadas) */}
            {showPageGuides &&
              Array.from({ length: Math.max(1, pageCount - 1) }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  // Cada página A4 tem exatamente 297mm de altura
                  const topOffset = `${pageNumber * 297}mm`;

                  return (
                    <div
                      key={pageNumber}
                      className="ea-a4-page-guide"
                      style={{ top: topOffset }}
                    >
                      <span className="ea-a4-page-guide-badge">
                        Fim da Pág. {pageNumber} (297mm)
                      </span>
                      <span className="ea-a4-page-guide-badge">
                        Início da Pág. {pageNumber + 1}
                      </span>
                    </div>
                  );
                },
              )}

            {/* Renderização do Orçamento aplicando todos os estilos de impressão */}
            <OrcamentoModeloNovoView
              data={data}
              displayData={displayData}
              containerRef={budgetRef}
              isPrintMode={true}
            />
          </div>
        </div>
      </main>

      {/* 4. Rodapé Fixo de Navegação e Informações */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoltar}
            className="text-slate-300 hover:text-white font-medium hover:underline flex items-center gap-1"
          >
            ← Voltar ao Modelo de Edição
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-[11px]">
            Cliente: <b className="text-slate-200">{displayData.clientName}</b>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] hidden md:inline text-slate-500">
            Dica: Ao clicar em "Imprimir / Salvar PDF", selecione o destino como{' '}
            <b>Salvar como PDF</b> e margens <b>Padrão</b>.
          </span>
          <button
            onClick={handleImprimir}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <Printer size={14} weight="bold" />
            <span>Imprimir PDF Agora</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
