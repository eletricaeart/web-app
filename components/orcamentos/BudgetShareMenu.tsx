// components/orcamentos/BudgetShareMenu.tsx
'use client';

import React, { useState } from 'react';
import { domToBlob } from 'modern-screenshot';
import {
  ImageIcon,
  FilePdf,
  SpinnerGap,
  Printer,
  SlidersHorizontal,
  CheckCircle,
} from '@phosphor-icons/react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import View from '../layout/View';
import { toast } from 'sonner';
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
}

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  data,
  open,
  onOpenChange,
}: BudgetShareMenuProps) {
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      @media print, all {
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

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }

        html, body {
          background: #ffffff !important;
          color: #0f172a !important;
          font-size: ${baseFontSize} !important;
          line-height: 1.45 !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
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
        subclause,
        .avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
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
          orphans: 3 !important;
          widows: 3 !important;
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
   * --- [ handle native browser print ]
   * */
  const handleNativePrint = () => {
    const styleEl = document.createElement('style');
    styleEl.id = 'ea-print-custom-rules';
    styleEl.innerHTML = getPdfCustomStyles();
    document.head.appendChild(styleEl);

    onOpenChange(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        const el = document.getElementById('ea-print-custom-rules');
        if (el) el.remove();
      }, 2000);
    }, 500);
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

        {/* Botões de Ação */}
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
