// components/orcamentos/BudgetShareMenu.tsx
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { domToBlob } from 'modern-screenshot';
import {
  ImageIcon,
  FilePdf,
  SpinnerGap,
  Printer,
  SlidersHorizontal,
  CheckCircle,
  Sparkle,
  ArrowSquareOut,
  Eye,
} from '@phosphor-icons/react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import View from '../layout/View';
import { toast } from 'sonner';
import { useOptionalPainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { imprimirNovoModeloPdf } from './modelo-novo/geradorNovoPdf';
import OrcamentoModeloNovoView from './modelo-novo/OrcamentoModeloNovoView';
import { OrcamentoModeloNovoStyles } from './modelo-novo/OrcamentoModeloNovoStyles';
import { styles4send } from './styles4send';
import { prestyle } from './prestyle';
import { EACardStyles } from './EACardStylesheet';
import { TextStylesheet } from './TextStylesheet';

interface BudgetShareData {
  id: string | number;
  [key: string]: any;
}

interface BudgetShareMenuProps {
  budgetRef: React.RefObject<HTMLDivElement | null>;
  clientName: string;
  data: BudgetShareData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetTitle?: string;
  displayData?: any;
}

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  data,
  open,
  onOpenChange,
  budgetTitle,
  displayData,
}: BudgetShareMenuProps) {
  const router = useOptionalPainelRouter();

  // Estados do gerador clássico de PDF
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estados do NOVO gerador de PDF (Backend Puppeteer + Novo Modelo)
  const [isGeneratingNovoPdf, setIsGeneratingNovoPdf] = useState(false);
  const [generatedNovoFile, setGeneratedNovoFile] = useState<File | null>(null);
  const [novoPdfUrl, setNovoPdfUrl] = useState<string | null>(null);
  const novoModeloRef = useRef<HTMLDivElement | null>(null);

  const navigateToSection = (
    section: string,
    params: Record<string, string>,
  ) => {
    if (router?.push) {
      router.push(section, params);
    } else if (typeof window !== 'undefined') {
      const qs = new URLSearchParams({ s: section, ...params });
      window.location.search = `?${qs.toString()}`;
    }
  };

  // Montagem segura e consistente dos dados do Novo Modelo
  const effectiveDisplayData = useMemo(() => {
    if (displayData) return displayData;
    if (!data) {
      return {
        clientName: clientName || 'Cliente',
        documentTitle: budgetTitle || 'ORÇAMENTO',
        issueDate: new Date().toISOString(),
        expiration: '15 dias',
        subtitle: 'PROPOSTA DE ORÇAMENTO',
        services: [],
        address: {},
      };
    }

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
        clientName ||
        'Cliente',
      documentTitle:
        data.docTitle?.title ||
        data.title ||
        data['Título do Documento'] ||
        budgetTitle ||
        'ORÇAMENTO',
      issueDate:
        data.issueDate ||
        data.data ||
        data.created_at ||
        new Date().toISOString(),
      expiration: data.expiration || data.validade || '15 dias',
      subtitle:
        data.subtitle ||
        data.docTitle?.subtitle ||
        data['Subtítulo'] ||
        'PROPOSTA DE ORÇAMENTO',
      financial,
      services: servicesRaw,
      address: {
        street:
          data.street ||
          data.clientAddress?.street ||
          data.cliente?.rua ||
          data.financial_json?.address?.street ||
          '',
        number:
          data.number ||
          data.clientAddress?.number ||
          data.cliente?.num ||
          data.financial_json?.address?.number ||
          '',
        neighborhood:
          data.neighborhood ||
          data.clientAddress?.neighborhood ||
          data.cliente?.bairro ||
          data.financial_json?.address?.neighborhood ||
          '',
        city:
          data.city ||
          data.clientAddress?.city ||
          data.cliente?.cidade ||
          data.financial_json?.address?.city ||
          '',
        complement:
          data.complement ||
          data.clientAddress?.complement ||
          data.cliente?.complemento ||
          data.financial_json?.address?.complement ||
          '',
      },
    };
  }, [data, clientName, budgetTitle, displayData]);

  // Estados de teste e otimização configuráveis
  const [density, setDensity] = useState<'compact' | 'standard' | 'minimal'>(
    'compact',
  );
  const [antiCutsEnabled, setAntiCutsEnabled] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const getPdfCustomStyles = () => {
    const baseFontSize =
      density === 'minimal' ? '12px' : density === 'compact' ? '13px' : '14px';

    if (!antiCutsEnabled) {
      return `
        @media print {
          @page {
            size: A4;
            margin: 5mm 0 5mm 0;
            @bottom-right {
              content: "Pág. " counter(page) " de " counter(pages);
              font-size: 9pt;
              padding-bottom: 5px;
              padding-right: 5px;
            }
          }
        }
      `;
    }

    return `
      @media print {
        @page {
          size: A4 portrait;
          margin: 8mm 6mm 8mm 6mm;
          @bottom-right {
            content: "Pág. " counter(page) " de " counter(pages);
            font-size: 8.5pt;
            color: #64748b;
            padding-bottom: 4px;
            padding-right: 4px;
          }
        }

        /* Eliminar gavetas, modais, overlays e toasters na impressão */
        [data-vaul-overlay],
        [data-slot="drawer-overlay"],
        [data-vaul-drawer],
        [data-slot="drawer-content"],
        [data-slot="drawer-portal"],
        [data-radix-portal],
        [data-radix-overlay],
        [role="dialog"],
        [role="alertdialog"],
        .fixed.inset-0,
        div[class*="bg-black"],
        div[class*="backdrop"],
        .drawer-overlay,
        [data-sonner-toaster],
        [data-sonner-toast],
        .toaster,
        #sonner-toaster,
        [data-sonner-toaster] *,
        div[data-sonner-toaster],
        .no-print,
        .print\:hidden,
        [class*="no-print"],
        [class*="print:hidden"],
        header[data-slot="painel-appbar"],
        header.sticky,
        header[class*="sticky"],
        header[class*="backdrop-blur"],
        header.fixed,
        .app-bar,
        app-bar,
        nav.bottom-nav,
        .fab-container,
        button,
        .toast {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          top: -99999px !important;
          left: -99999px !important;
          background: transparent !important;
          pointer-events: none !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }

        html, body, [data-vaul-drawer-wrapper], #root, main {
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          font-size: ${baseFontSize} !important;
          line-height: 1.45 !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
          filter: none !important;
          transform: none !important;
        }

        /* Isolação dos textos e layout do EACard para não sofrerem alterações de densidade/fonte do documento */
        ea-card,
        .ea_card,
        .card {
          font-size: 15px !important;
          line-height: 1.18 !important;
          color: #f5f5f5 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          grid-template-columns: 0.30fr 0.70fr !important;
        }

        ea-card .description,
        .ea_card .description,
        .card .description {
          font-size: 13.5px !important;
          line-height: 1.18 !important;
          color: #f5f5f5 !important;
        }

        ea-card .description span,
        .ea_card .description span,
        .card .description span {
          font-size: 12.5px !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
          color: #f5f5f5 !important;
          display: block !important;
        }

        ea-card .description p,
        .ea_card .description p,
        .card .description p {
          font-size: 12px !important;
          line-height: 1.2 !important;
          margin: 2.5px 0 !important;
          color: #f5f5f5 !important;
        }

        ea-card .description div,
        .ea_card .description div,
        .card .description div,
        ea-card .description a,
        .ea_card .description a,
        .card .description a,
        ea-card .contactLink,
        .ea_card .contactLink,
        .card .contactLink {
          font-size: 12px !important;
          line-height: 1.25 !important;
          color: #f5f5f5 !important;
        }

        ea-card .eaName,
        .ea_card .eaName,
        .card .eaName,
        .eaName {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
        }

        ea-card .nameImg,
        .ea_card .nameImg,
        .card .nameImg,
        .nameImg {
          width: 100% !important;
          max-width: 370px !important;
          height: auto !important;
          object-fit: contain !important;
          margin-bottom: 4px !important;
          display: block !important;
        }

        budget-page {
          padding: 0 0 12px 0 !important;
          margin: 0 !important;
          background: transparent !important;
          height: auto !important;
          min-height: auto !important;
          display: block !important;
          overflow: visible !important;
        }

        /* Anti-cortes em cards, blocos, cabeçalhos e cláusulas */
        clause-header,
        subclause-header,
        cliente-section,
        doc-header,
        .ea-card,
        .card,
        tagb,
        tagc,
        .tagc,
        blockquote,
        table,
        tr,
        tbody,
        signatures,
        signature,
        .signatures,
        footer-content_bottom,
        footer-content_top,
        footer-content,
        .avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          overflow: visible !important;
        }

        subclause,
        [data-tag="subclause"],
        subclause-body,
        [data-tag="subclause-body"] {
          break-inside: auto !important;
          page-break-inside: auto !important;
          overflow: visible !important;
        }

        budget-body > clause {
          break-inside: auto !important;
          page-break-inside: auto !important;
          overflow: visible !important;
          padding: 4px 0 !important;
          margin: 4px 0 !important;
          background: transparent !important;
        }

        budget-body > clause > ui {
          overflow: visible !important;
          background: transparent !important;
        }

        clause-content {
          overflow: visible !important;
          background: #ffffff !important;
          padding: 8px 12px !important;
        }

        clause-header,
        subclause-header {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }

        p, li {
          orphans: 2 !important;
          widows: 2 !important;
        }

        ul, ol, subclause-body ul, subclause-body ol {
          display: block !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        li, subclause-body li {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          break-before: auto !important;
          break-after: auto !important;
        }

        /* Rodapé sem quebra forçada para evitar página 9 em branco */
        footer-content {
          height: auto !important;
          min-height: auto !important;
          display: block !important;
          break-before: auto !important;
          page-break-before: auto !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin: 10px 0 0 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }

        footer-content_top {
          display: block !important;
          padding: 4px 0 !important;
          background: transparent !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        footer-content_bottom {
          display: block !important;
          padding: 4px 0 0 0 !important;
          background: transparent !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        signatures {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: flex-end !important;
          gap: 1.5cm !important;
          margin-top: 1.5cm !important;
          padding: 0.5cm 1cm !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        signature {
          flex: 1 !important;
          font-size: 0.95rem;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      }
    `;
  };

  /**
   * --- [ generate pdf on server and return it to front ]
   *  */
  const generatePdfOnServerAndReturnIt = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    setGeneratedFile(null);

    try {
      const budgetHtml = budgetRef.current.innerHTML;
      const styles = Array.from(document.querySelectorAll('style'))
        .map((s) => s.innerHTML)
        .join('\n');

      const customStyles = getPdfCustomStyles();

      const htmlFull = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${styles}\n${prestyle}\n${styles4send}\n${EACardStyles}\n${TextStylesheet}</style>
          <style>${customStyles}</style>
        </head>
        <body class="p-4">${budgetHtml}</body>
      </html>
    `;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlFull }),
      });

      if (!response.ok) throw new Error('Erro no servidor');

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: 'application/pdf',
      });

      setGeneratedFile(file);
      setPdfUrl(window.URL.createObjectURL(blob));

      toast.success(
        'PDF gerado com sucesso! Clique para compartilhar ou baixar.',
      );
    } catch (err: any) {
      toast.error('Erro ao gerar PDF no servidor');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * --- [ handle the pdf file after the front receive it from the server ]
   * */
  const handleShareFileAfterServerGenerateTheFile = async () => {
    if (!generatedFile) return;

    try {
      if (navigator.share && navigator.canShare({ files: [generatedFile] })) {
        await navigator.share({
          files: [generatedFile],
          title: 'Orçamento Elétrica & Art',
          text: `Olá! Segue o orçamento de ${clientName}.`,
        });
      } else {
        const a = document.createElement('a');
        a.href = pdfUrl!;
        a.download = generatedFile.name;
        a.click();
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  /**
   * --- [ handle native browser print (utiliza o NOVO MODELO definitivamente) ]
   * */
  const handleNativePrint = () => {
    onOpenChange(false);
    toast.dismiss();
    setTimeout(() => {
      imprimirNovoModeloPdf();
    }, 300);
  };

  /**
   * --- [ GERAÇÃO DO NOVO MODELO NO BACKEND COM PUPPETEER ]
   */
  const generateNovoPdfOnServerAndReturnIt = async () => {
    if (!novoModeloRef.current) return;
    setIsGeneratingNovoPdf(true);
    setGeneratedNovoFile(null);

    try {
      const contentHtml = novoModeloRef.current.innerHTML;
      const inlineStyles = Array.from(document.querySelectorAll('style'))
        .map((s) => s.innerHTML)
        .join('\n');

      const htmlFull = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${effectiveDisplayData.documentTitle || 'Orçamento Elétrica & Art'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      ${inlineStyles}
    </style>
    <style id="ea-novo-modelo-complete-styles">
      ${OrcamentoModeloNovoStyles}
      ${TextStylesheet}
      ${EACardStyles}

      @page {
        size: A4 portrait;
        margin: 8mm 6mm 8mm 6mm;
      }

      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      body {
        background-color: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .no-print, [data-vaul-overlay], [data-slot="drawer-overlay"], .toaster, [data-sonner-toaster] {
        display: none !important;
      }
    </style>
  </head>
  <body class="ea-modelo-novo-root is-print-mode is-print-preview bg-white">
    <div id="print-root" class="w-full">
      ${contentHtml}
    </div>
  </body>
</html>`;

      const safeName = (clientName || 'Cliente').replace(
        /[^a-zA-Z0-9_\-]/g,
        '_',
      );
      const filename = `Orcamento_${safeName}_NovoModelo.pdf`;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlFull, filename }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro no servidor ao gerar PDF');
      }

      const blob = await response.blob();
      const file = new File([blob], filename, {
        type: 'application/pdf',
      });

      setGeneratedNovoFile(file);
      setNovoPdfUrl(window.URL.createObjectURL(blob));

      toast.success('PDF do Novo Modelo gerado com sucesso via Puppeteer!');
    } catch (err: any) {
      console.error('[Puppeteer Novo Modelo]', err);
      toast.error(
        err.message || 'Erro ao gerar PDF do Novo Modelo no servidor',
      );
    } finally {
      setIsGeneratingNovoPdf(false);
    }
  };

  /**
   * --- [ Compartilha ou baixa o PDF gerado pelo Puppeteer no Novo Modelo ]
   */
  const handleShareNovoPdf = async () => {
    if (!generatedNovoFile || !novoPdfUrl) return;

    try {
      if (
        navigator.share &&
        navigator.canShare({ files: [generatedNovoFile] })
      ) {
        await navigator.share({
          files: [generatedNovoFile],
          title:
            effectiveDisplayData.documentTitle || 'Orçamento Elétrica & Art',
          text: `Olá! Segue o orçamento de ${clientName} gerado com o novo modelo.`,
        });
      } else {
        const a = document.createElement('a');
        a.href = novoPdfUrl;
        a.download = generatedNovoFile.name;
        a.click();
        toast.info('Download do PDF iniciado!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const a = document.createElement('a');
        a.href = novoPdfUrl;
        a.download = generatedNovoFile.name;
        a.click();
      }
    }
  };

  /**
   * --- [ Share as Image ]
   *  */
  const handleShareAsImg = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await domToBlob(budgetRef.current, { scale: 2 });
      if (!blob) throw new Error('Falha ao gerar blob');

      const file = new File([blob], `Orcamento_${clientName}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Orçamento Elétrica & Art',
        });
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orcamento_${clientName}.png`;
        a.click();
      }
    } catch (err) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="pb-8 bg-white rounded-[2rem_2rem_0_0_!important] border-none"
        style={{ borderTopWidth: '0 !important' }}
      >
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-slate-800 text-lg font-bold tracking-tight">
            Opções de Compartilhamento
          </DrawerTitle>
        </DrawerHeader>

        {/* Configurações de Densidade e Teste do PDF */}
        <div className="px-5 mb-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Otimizador Anti-Cortes & Paginação
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
              >
                {showConfig ? 'Ocultar' : 'Ajustar'}
              </button>
            </div>

            {showConfig && (
              <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1.5">
                    Tamanho do texto no documento:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDensity('minimal')}
                      className={`text-[11px] py-1.5 px-2 rounded-xl font-medium border transition-all ${
                        density === 'minimal'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Muito Compacto (12px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensity('compact')}
                      className={`text-[11px] py-1.5 px-2 rounded-xl font-medium border transition-all ${
                        density === 'compact'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Compacto (13px) ★
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensity('standard')}
                      className={`text-[11px] py-1.5 px-2 rounded-xl font-medium border transition-all ${
                        density === 'standard'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Padrão (14px)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-600">
                    Evitar quebra de cláusulas e página vazia
                  </span>
                  <button
                    type="button"
                    onClick={() => setAntiCutsEnabled(!antiCutsEnabled)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      antiCutsEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {antiCutsEnabled
                      ? 'Ativado (Recomendado)'
                      : 'Desativado (Clássico)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contêiner invisível para renderização em memória do Novo Modelo (usado pelo Puppeteer) */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-99999px',
            top: 0,
            width: '794px',
            pointerEvents: 'none',
            opacity: 0,
            zIndex: -9999,
          }}
        >
          <div
            ref={novoModeloRef}
            className="ea-modelo-novo-root is-print-mode is-print-preview bg-white"
          >
            <OrcamentoModeloNovoView
              data={data}
              displayData={effectiveDisplayData}
              isPrintMode={true}
            />
          </div>
        </div>

        {/* Seção Novo Modelo (Teste e Validação) */}
        <div className="px-4 mb-3">
          <div className="p-3 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-100 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <Sparkle size={15} weight="fill" className="text-indigo-600" />
                <span>Novo Modelo de PDF</span>
                <span className="bg-indigo-600 text-[9px] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Beta
                </span>
              </div>
              {data?.id && (
                <button
                  onClick={() => {
                    onOpenChange(false);
                    navigateToSection('orcamentos.ver-teste', {
                      id: String(data.id),
                    });
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  <span>Abrir na Tela</span>
                  <ArrowSquareOut size={12} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Estrutura com cabeçalho compacto, sem sobreposições e anti-quebra
              de páginas testado e validado.
            </p>

            {/* Ações do Novo Modelo */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenChange(false);
                    if (data?.id) {
                      navigateToSection('orcamentos.previa-pdf', {
                        id: String(data.id),
                      });
                    }
                  }}
                  className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Eye size={15} weight="bold" />
                  <span>Prévia do PDF</span>
                </button>
                <button
                  onClick={() => {
                    onOpenChange(false);
                    toast.dismiss();
                    setTimeout(() => {
                      imprimirNovoModeloPdf();
                    }, 300);
                  }}
                  className="py-2 px-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  title="Abre a janela de impressão nativa do navegador com o Novo Modelo"
                >
                  <Printer size={15} weight="bold" />
                  <span>Imprimir Direto</span>
                </button>
              </div>

              {/* Botão de Testes Solicitado: Gerar PDF no Backend com Puppeteer */}
              {!generatedNovoFile ? (
                <button
                  onClick={generateNovoPdfOnServerAndReturnIt}
                  disabled={isGeneratingNovoPdf}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  title="Gera o arquivo PDF no backend utilizando Puppeteer e a estrutura do Novo Modelo"
                >
                  {isGeneratingNovoPdf ? (
                    <>
                      <SpinnerGap
                        className="animate-spin text-white"
                        size={16}
                      />
                      <span>Renderizando no Servidor (Puppeteer)...</span>
                    </>
                  ) : (
                    <>
                      <FilePdf size={16} weight="fill" />
                      <span>Testar Gerar PDF no Backend (Puppeteer)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareNovoPdf}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    title="Compartilhar ou baixar o PDF gerado pelo Puppeteer"
                  >
                    <CheckCircle size={16} weight="fill" />
                    <span>Compartilhar / Baixar PDF Novo</span>
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedNovoFile(null);
                      setNovoPdfUrl(null);
                    }}
                    className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                    title="Gerar novamente"
                  >
                    Gerar Outro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Opções Clássicas
          </span>
        </div>

        {/* Botões de Ação Originais */}
        <View className="grid grid-cols-3 gap-3 px-4">
          {/* Opção: Gerar PDF */}
          {!generatedFile ? (
            <View
              onClick={generatePdfOnServerAndReturnIt}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl active:scale-95 transition-all cursor-pointer hover:bg-slate-100/80"
            >
              <View className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                {isGenerating ? (
                  <SpinnerGap className="animate-spin" size={22} />
                ) : (
                  <FilePdf size={22} weight="duotone" />
                )}
              </View>
              <span className="text-[10px] font-bold text-slate-700 text-center">
                Gerar PDF
              </span>
            </View>
          ) : (
            <View
              onClick={() => {
                handleShareFileAfterServerGenerateTheFile();
                setTimeout(() => {
                  setGeneratedFile(null);
                }, 3000);
              }}
              className="flex flex-col items-center gap-1.5 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              <View className="bg-indigo-600 p-2.5 rounded-xl text-white">
                <CheckCircle size={22} weight="fill" />
              </View>
              <span className="text-[10px] font-bold text-indigo-700 text-center">
                Compartilhar
              </span>
            </View>
          )}

          {/* Opção: Imprimir */}
          <View
            onClick={handleNativePrint}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl active:scale-95 transition-all cursor-pointer hover:bg-slate-100/80"
          >
            <View className="bg-sky-100 p-2.5 rounded-xl text-sky-600">
              <Printer size={22} weight="duotone" />
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imprimir
            </span>
          </View>

          {/* Opção: Imagem */}
          <View
            onClick={handleShareAsImg}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl active:scale-95 transition-all cursor-pointer hover:bg-slate-100/80"
          >
            <View className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={22} />
              ) : (
                <ImageIcon size={22} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imagem
            </span>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
