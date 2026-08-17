// components/painel/ferramentas/ShareDrywallMenu.tsx
'use client';

import React, { useState, useRef } from 'react';
import { domToBlob } from 'modern-screenshot';
import {
  ImageIcon,
  FilePdf,
  SpinnerGap,
  Printer,
  ShareNetwork,
} from '@phosphor-icons/react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import View from '@/components/layout/View';
import { toast } from 'sonner';
import { styles4send } from '@/components/orcamentos/styles4send';
import { prestyle } from '@/components/orcamentos/prestyle';
import { EACardStyles } from '@/components/orcamentos/EACardStylesheet';
import { TextStylesheet } from '@/components/orcamentos/TextStylesheet';

interface Material {
  item: string;
  qtd: number;
  unit: string;
}

interface Room {
  id: string;
  name: string;
  materials: Material[];
}

interface ShareDrywallMenuProps {
  listRef: React.RefObject<HTMLDivElement | null>; // Ref para o elemento que contém a lista
  rooms: Room[];
  consolidated: Material[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string; // Ex: "Lista de Materiais" ou "Blueprint"
}

export default function ShareDrywallMenu({
  listRef,
  rooms,
  consolidated,
  open,
  onOpenChange,
  title = 'Documento Drywall',
}: ShareDrywallMenuProps) {
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Gera o HTML completo a partir dos dados, para enviar ao servidor
   */
  const buildHtmlFromData = (): string => {
    const roomListHtml = rooms
      .map(
        (room) => `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #4338ca; text-transform: uppercase; margin-bottom: 8px;">
            ${room.name}
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${room.materials
              .map(
                (m) => `
                <li style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
                  <span>${m.item}</span>
                  <span style="font-weight: 600;">${m.qtd} ${m.unit}</span>
                </li>
              `,
              )
              .join('')}
          </ul>
        </div>
      `,
      )
      .join('');

    const consolidatedHtml = `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #818cf8;">
        <h3 style="font-size: 18px; font-weight: 700; color: #4338ca; text-transform: uppercase; margin-bottom: 8px;">
          Total Geral
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${consolidated
            .map(
              (m) => `
              <li style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
                <span>${m.item}</span>
                <span style="font-weight: 600;">${m.qtd} ${m.unit}</span>
              </li>
            `,
            )
            .join('')}
        </ul>
      </div>
    `;

    const now = new Date().toLocaleDateString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            ${prestyle}
            ${styles4send}
            ${EACardStyles}
            ${TextStylesheet}
            body { font-family: 'Inter', sans-serif; padding: 40px; background: white; }
            .header { text-align: center; margin-bottom: 32px; }
            .header h1 { font-size: 28px; font-weight: 800; color: #1e1b4b; letter-spacing: 2px; }
            .header h2 { font-size: 18px; font-weight: 600; color: #334155; margin-top: 4px; }
            .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ELÉTRICA & ART</h1>
            <h2>${title}</h2>
          </div>
          ${roomListHtml}
          ${consolidatedHtml}
          <div class="footer">Gerado em ${now}</div>
        </body>
      </html>
    `;
  };

  /**
   * Gera PDF no servidor (mesmo método do BudgetShareMenu)
   */
  const generatePdfOnServerAndReturnIt = async () => {
    if (rooms.length === 0) {
      toast.warning('Não há dados para gerar o documento.');
      return;
    }

    setIsGenerating(true);
    setGeneratedFile(null);

    try {
      const html = buildHtmlFromData();
      const baseUrl = window.location.origin;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error('Erro no servidor ao gerar PDF');

      const blob = await response.blob();
      const file = new File([blob], `${title.replace(/\s/g, '_')}.pdf`, {
        type: 'application/pdf',
      });

      setGeneratedFile(file);
      setPdfUrl(URL.createObjectURL(blob));
      toast.success('PDF gerado com sucesso! Clique em "Compartilhar PDF".');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Compartilha o PDF gerado (via Web Share ou download)
   */
  const handleSharePdf = async () => {
    if (!generatedFile) {
      toast.warning('Gere o PDF primeiro.');
      return;
    }

    try {
      if (navigator.share && navigator.canShare({ files: [generatedFile] })) {
        await navigator.share({
          files: [generatedFile],
          title: title,
          text: `Confira o documento: ${title}`,
        });
      } else {
        // Fallback: download
        const a = document.createElement('a');
        a.href = pdfUrl!;
        a.download = generatedFile.name;
        a.click();
      }
      // Limpa o estado após compartilhar
      setTimeout(() => setGeneratedFile(null), 2000);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  /**
   * Compartilhar como imagem (usa modern-screenshot)
   */
  const handleShareAsImage = async () => {
    if (!listRef.current) {
      toast.warning('Elemento não encontrado para capturar.');
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await domToBlob(listRef.current, { scale: 2 });
      if (!blob) throw new Error('Falha ao gerar blob');

      const file = new File([blob], `${title.replace(/\s/g, '_')}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar imagem');
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  /**
   * Imprimir (nativo do navegador)
   */
  const handlePrint = () => {
    onOpenChange(false);
    setTimeout(() => window.print(), 500);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-10 bg-white rounded-[2rem_2rem_0_0_!important] border-none">
        <DrawerHeader>
          <DrawerTitle className="text-center text-slate-800 text-xl font-geist-mono capitalize tracking-widest font-semibold">
            Compartilhar {title}
          </DrawerTitle>
        </DrawerHeader>

        <View className="grid grid-cols-3 gap-2 min-h-40 p-4">
          {/* Imagem */}
          <View
            onClick={handleShareAsImage}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <ImageIcon size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imagem
            </span>
          </View>

          {/* Imprimir */}
          <View
            onClick={handlePrint}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-sky-100 p-3 rounded-2xl text-sky-600">
              <Printer size={24} weight="duotone" />
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imprimir
            </span>
          </View>

          {/* Gerar PDF / Compartilhar PDF (toggle) */}
          {!generatedFile ? (
            <View
              onClick={generatePdfOnServerAndReturnIt}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
            >
              <View className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                {isGenerating ? (
                  <SpinnerGap className="animate-spin" size={24} />
                ) : (
                  <FilePdf size={24} weight="duotone" />
                )}
              </View>
              <span className="text-[10px] font-bold text-slate-700 text-center">
                Gerar PDF
              </span>
            </View>
          ) : (
            <View
              onClick={handleSharePdf}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
            >
              <View className="bg-indigo-600 p-3 rounded-2xl text-indigo-100">
                <ShareNetwork size={24} weight="duotone" />
              </View>
              <span className="text-[10px] font-bold text-slate-700 text-center">
                Compartilhar PDF
              </span>
            </View>
          )}
        </View>
      </DrawerContent>
    </Drawer>
  );
}
