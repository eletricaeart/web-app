"use client";

import React, { useState } from "react";
import { domToBlob } from "modern-screenshot";
import {
  ShareNetwork,
  Image as ImageIcon,
  FilePdf,
  SpinnerGap,
} from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  data,
  open,
  onOpenChange,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Compartilhar como Imagem (Rápido/Local)
  const handleShareAsImg = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await domToBlob(budgetRef.current, { scale: 2 });
      const file = new File([blob!], `Orcamento_${clientName}.png`, {
        type: "image/png",
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
        });
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

      if (navigator.share) {
        await navigator.share({ files: [file], title: "Orçamento PDF" });
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.pdf`;
        a.click();
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
