// app/visualizar-materiais/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ShareNetwork, FilePdf, SpinnerGap } from '@phosphor-icons/react';
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

export default function VisualizarMateriais() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{
    rooms: Room[];
    consolidated: Material[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const encoded = searchParams.get('data');
    if (encoded) {
      try {
        const decoded = JSON.parse(decodeURIComponent(encoded));
        setData(decoded);
      } catch (e) {
        toast.error('Erro ao carregar dados');
      }
    }
    setLoading(false);
  }, [searchParams]);

  const handleGenerateAndShare = async () => {
    if (!data) return;
    setGenerating(true);

    try {
      // Obter o HTML do conteúdo renderizado
      const htmlContent = contentRef.current?.innerHTML || '';
      // Construir HTML completo com estilos
      const styles = Array.from(document.querySelectorAll('style'))
        .map((s) => s.innerHTML)
        .join('\n');

      const htmlFull = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Lista de Materiais - Drywall</title>
            <style>${styles}\n${prestyle}\n${styles4send}\n${EACardStyles}\n${TextStylesheet}</style>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; background: white; }
              .header { text-align: center; margin-bottom: 32px; }
              .header h1 { font-size: 28px; font-weight: 800; color: #1e1b4b; letter-spacing: 2px; }
              .header h2 { font-size: 18px; font-weight: 600; color: #334155; margin-top: 4px; }
              .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; }
              .material-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlFull }),
      });

      if (!response.ok) throw new Error('Erro ao gerar PDF');

      const blob = await response.blob();
      const file = new File([blob], 'Lista_Materiais_Drywall.pdf', {
        type: 'application/pdf',
      });

      // Compartilhar ou baixar
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Lista de Materiais - Drywall',
          text: 'Confira a lista de materiais para drywall',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Lista_Materiais_Drywall.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar ou compartilhar PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!data || data.rooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Nenhum dado disponível.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-900">
              ELÉTRICA & ART
            </h1>
            <h2 className="text-lg font-semibold text-slate-700">
              Lista de Materiais - Drywall
            </h2>
          </div>
          <Button
            onClick={handleGenerateAndShare}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6 flex items-center gap-2"
          >
            {generating ? (
              <SpinnerGap className="animate-spin" size={18} />
            ) : (
              <ShareNetwork size={18} weight="bold" />
            )}
            {generating ? 'Gerando...' : 'Compartilhar PDF'}
          </Button>
        </div>

        {/* Conteúdo que será capturado para o PDF */}
        <div ref={contentRef} className="space-y-6">
          {data.rooms.map((room) => (
            <div key={room.id} className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-indigo-700 uppercase mb-2">
                {room.name}
              </h3>
              <ul className="space-y-1">
                {room.materials.map((mat, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700">{mat.item}</span>
                    <span className="font-mono font-semibold">
                      {mat.qtd} {mat.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-8 pt-4 border-t-2 border-indigo-300">
            <h3 className="text-lg font-bold text-indigo-700 uppercase mb-2">
              Total Geral
            </h3>
            <ul className="space-y-1">
              {data.consolidated.map((mat, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-700">{mat.item}</span>
                  <span className="font-mono font-semibold">
                    {mat.qtd} {mat.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            Gerado em {new Date().toLocaleDateString('pt-BR')} às{' '}
            {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
}
