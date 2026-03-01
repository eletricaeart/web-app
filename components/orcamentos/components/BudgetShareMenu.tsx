"use client";

import React, { useState } from "react";
import { domToBlob } from "modern-screenshot";
import { ImageIcon, FilePdf, SpinnerGap } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

// Interfaces para garantir a tipagem estrita
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
  budgetTitle?: string; // Prop opcional baseada no uso anterior
}

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  data,
  open,
  onOpenChange,
}: BudgetShareMenuProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Compartilhar como Imagem (Rápido/Local)
  const handleShareAsImg = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await domToBlob(budgetRef.current, { scale: 2 });
      if (!blob) throw new Error("Falha ao gerar blob");

      const file = new File([blob], `Orcamento_${clientName}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
        });
      } else {
        // Fallback: Download se não houver suporte a share de arquivos
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.png`;
        a.click();
      }
    } catch (err) {
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  // 2. Gerar PDF de Elite (Backend / Navegador Invisível)
  const handlePrintBackend = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/print/${data.id}`);
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Orçamento PDF" });
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast.error("Erro ao gerar PDF no servidor");
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-10">
        <DrawerHeader>
          <DrawerTitle className="text-center text-slate-500 uppercase text-xs tracking-widest font-thunder">
            Opções de Compartilhamento
          </DrawerTitle>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          <button
            type="button"
            onClick={handleShareAsImg}
            disabled={isGenerating}
            className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={32} />
              ) : (
                <ImageIcon size={32} weight="duotone" />
              )}
            </div>
            <span className="text-sm font-bold text-slate-700">
              Como Imagem
            </span>
          </button>

          <button
            type="button"
            onClick={handlePrintBackend}
            disabled={isGenerating}
            className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={32} />
              ) : (
                <FilePdf size={32} weight="duotone" />
              )}
            </div>
            <span className="text-sm font-bold text-slate-700">
              PDF de Elite
            </span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
