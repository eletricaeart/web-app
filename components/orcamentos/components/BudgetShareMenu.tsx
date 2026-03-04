"use client";

import React, { useState } from "react";
import { domToBlob } from "modern-screenshot";
import { ImageIcon, FilePdf, SpinnerGap, Printer } from "@phosphor-icons/react"; // Added Printer icon
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import html2pdf from "html2pdf.js"; // Import the power!
import html2canvas from "html2canvas-pro"; // Import the PRO version!


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
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Share as Image (Existing)
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

  // 2. NEW: Local PDF (Captures the current view)
  const handleShareAsPdfLocal = async () => {
  if (!budgetRef.current) return;
  setIsGenerating(true);

  const element = budgetRef.current;

  // Configuration using the Pro engine
  const opt = {
    margin: [10, 5],
    filename: `Orcamento_${clientName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      // We pass the PRO instance here
      canvas: await html2canvas(element, { useCORS: true, scale: 2 })
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    // 💡 The "Pro" way: We generate the canvas first, then the PDF
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");

    const file = new File([pdfBlob], `Orcamento_${clientName}.pdf`, { type: "application/pdf" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Orçamento Elétrica & Art",
      });
    } else {
      pdf.save(`Orcamento_${clientName}.pdf`);
    }
  } catch (err) {
    console.error("PDF Pro Error:", err);
    toast.error("Erro ao gerar PDF com motor Pro.");
  } finally {
    setIsGenerating(false);
    onOpenChange(false);
  }
  };

  // try 

  const handleShareAsPdfLocalTest = async () => {
if (!budgetRef.current) return;
setIsGenerating(true);

const element = budgetRef.current;

const opt = {
  margin: [10, 5],
  filename: `Orcamento_${clientName}.pdf`,

  image: {
    type: "jpeg",
    quality: 0.98,
  },

  html2canvas: {
    scale: 2,
    useCORS: true,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  },

  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  },

  pagebreak: {
    mode: ["css", "legacy"], // ⚠ removido avoid-all
    before: ".page-break",
    avoid: ".avoid",
  },
};

try {
  const worker = html2pdf().set(opt).from(element);

  // 👇 MUITO IMPORTANTE
  const pdfBlob = await worker.toPdf().output("blob");

  const file = new File([pdfBlob], opt.filename, {
    type: "application/pdf",
  });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Orçamento Elétrica & Art",
      text: `Olá! Segue o orçamento de ${clientName}.`,
    });
  } else {
    await worker.save();
  }
} catch (err) {
  console.error(err);
  toast.error("Erro ao gerar PDF local");
} finally {
  setIsGenerating(false);
  onOpenChange(false);
}  };

  // 3. Print Backend (Existing)
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
      <DrawerContent className="pb-10 bg-white">
        <DrawerHeader>
          <DrawerTitle className="text-center text-slate-500 uppercase text-xs tracking-widest font-thunder">
            Opções de Compartilhamento
          </DrawerTitle>
        </DrawerHeader>

        {/* Changed grid-cols-2 to grid-cols-3 to fit all options */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {/* Option: Image */}
          <button
            type="button"
            onClick={handleShareAsImg}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <ImageIcon size={24} weight="duotone" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imagem
            </span>
          </button>

          {/* Option: Local PDF (The new one!) */}
          <button
            type="button"
            onClick={handleShareAsPdfLocal}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              PDF Rápido
            </span>
          </button>

          {/* Option: Backend PDF */}
          <button
            type="button"
            onClick={handlePrintBackend}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <FilePdf size={24} weight="duotone" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              PDF Elite
            </span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
