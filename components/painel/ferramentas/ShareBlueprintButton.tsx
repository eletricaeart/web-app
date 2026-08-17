// components/painel/ferramentas/ShareBlueprintButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareNetwork, Download } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ShareBlueprintButtonProps {
  rooms: any[];
  consolidatedMaterials: any[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children?: React.ReactNode;
}

export function ShareBlueprintButton({
  rooms,
  consolidatedMaterials,
  variant = 'default',
  size = 'default',
  children,
}: ShareBlueprintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (rooms.length === 0) {
      toast.warning('Adicione ao menos um ambiente antes de compartilhar.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        rooms: rooms.map((room) => ({
          id: room.id,
          name: room.name,
          materials: room.materials || [],
        })),
        consolidated: consolidatedMaterials,
      };

      const response = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro ao gerar imagem: ${response.status} - ${errorText}`,
        );
      }

      const blob = await response.blob();

      // Tenta compartilhar via Web Share API
      if (
        navigator.share &&
        navigator.canShare?.({
          files: [new File([blob], 'blueprint.png', { type: 'image/png' })],
        })
      ) {
        await navigator.share({
          files: [new File([blob], 'blueprint.png', { type: 'image/png' })],
          title: 'Blueprint Drywall',
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blueprint-drywall.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Imagem baixada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        'Gerando...'
      ) : (
        <>
          <ShareNetwork size={18} weight="bold" />
          {children || 'Compartilhar Blueprint'}
        </>
      )}
    </Button>
  );
}
