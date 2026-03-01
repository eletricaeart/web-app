// app/orcamentos/components/BudgetShareMenu.tsx
"use client";

import React, { useState } from "react";
import { domToBlob, domToCanvas } from "modern-screenshot";
import { jsPDF } from "jspdf";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import { pdf } from "@react-pdf/renderer";
import { BudgetPDFTemplate } from "./BudgetPDFTemplate";
import {
  ShareNetwork,
  Image as ImageIcon,
  FilePdf,
  Files,
  SpinnerGap,
  Printer,
  FileCode,
} from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// 1. DEFINIÇÃO DA INTERFACE (O segredo para passar no Build)
interface BudgetShareMenuProps {
  budgetRef: React.RefObject<HTMLDivElement | null>;
  clientName: string;
  budgetTitle: string;
  data: any; // Se você tiver o tipo do orçamento, substitua aqui
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  budgetTitle,
  data,
  open,
  onOpenChange,
}: BudgetShareMenuProps) {
  // 2. Aplicamos a interface aqui
  const [isGenerating, setIsGenerating] = useState(false);
  const fileNameBase = `Orcamento_${clientName?.replace(/\s+/g, "_")}`;

  // Helper para disparar a Share API
  const handleShare = async (blob: Blob, fileName: string, type: string) => {
    const file = new File([blob], fileName, { type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
          text: `Olá ${clientName}, segue o orçamento: ${budgetTitle}`,
        });
      } catch (err) {
        console.error("Compartilhamento cancelado ou falhou", err);
      }
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };

  // 1. PDF CONTÍNUO
  const shareContinuousPDF = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await domToCanvas(budgetRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        height: budgetRef.current.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdfDoc = new jsPDF("p", "mm", [imgWidth, imgHeight]);
      pdfDoc.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      await handleShare(
        pdfDoc.output("blob"),
        `${fileNameBase}_continuo.pdf`,
        "application/pdf",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (As outras funções handleShareIMGPDF, shareAsImage seguem a mesma lógica)
  // Certifique-se de adicionar verificações de 'if (!budgetRef.current) return;'
  // no início de cada função para o TS não reclamar.

  // 4. SHARE VIA REACT-TO-PRINT
  const sharePrintPDF = useReactToPrint({
    contentRef: budgetRef,
    documentTitle: fileNameBase,
    onBeforeGetContent: async () => {
      setIsGenerating(true);
    },
    onAfterPrint: () => setIsGenerating(false),
    print: async (iframe) => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      const printable = iframeDoc?.querySelector("body");
      if (!printable) return;

      const canvas = await domToCanvas(printable as HTMLElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      // ... lógica do jsPDF que você já tem ...
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfDoc = new jsPDF("p", "mm", "a4");
      // (seu código de paginação aqui)
      await handleShare(
        pdfDoc.output("blob"),
        `${fileNameBase}_print.pdf`,
        "application/pdf",
      );
    },
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* ... Seu JSX do Drawer igual ao que você enviou ... */}
      <DrawerContent
        style={{
          paddingTop: "1rem",
          paddingBottom: "2rem",
          borderRadius: "2rem 2rem 0 0",
          zIndex: "30000",
        }}
        className="w-full items-center p-2 bg-white pt-4 shadow-2xl border-none"
      >
        {/* Mantenha seus botões de menu aqui */}
        <div className="flex w-full flex-col gap-1 p-4">
          <button
            onClick={() => {
              shareContinuousPDF();
              onOpenChange(false);
            }}
            className="share-menu-item flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"
          >
            <div className="icon-box bg-blue-50 text-blue-600 p-2 rounded-lg">
              <Files size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm">PDF Contínuo</span>
              <small className="text-[10px] text-slate-500">
                Ideal para WhatsApp
              </small>
            </div>
          </button>
          {/* Repita para os outros botões... */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
