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

    try {
      // 1. Capture the WHOLE element as one high-res canvas
      // This avoids the "lab" color error because we are just taking a "photo"
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // 2. Calculations for the "Slicer"
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight(); // A4 Height (~297mm)

      // How tall the image will be when scaled to the PDF width
      const totalImgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = totalImgHeightInPdf;
      let position = 0; // Current vertical position in the PDF

      // 3. The "Loop": Slice the image until there's nothing left
      // Page 1
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalImgHeightInPdf);
      heightLeft -= pdfHeight;

      // Extra Pages (if the budget is long)
      while (heightLeft > 0) {
        position = heightLeft - totalImgHeightInPdf; // Move the "camera" down
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          pdfWidth,
          totalImgHeightInPdf,
        );
        heightLeft -= pdfHeight;
      }

      // 4. Share or Save
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
        });
      } else {
        pdf.save(`Orcamento_${clientName}.pdf`);
      }
    } catch (err) {
      console.error("PDF Multipage Error:", err);
      toast.error("Erro ao gerar as páginas do PDF.");
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  // try

  const handleShareAsPdfLocalTest = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);

    // 1. CLONE the element so we don't mess up the screen
    const element = budgetRef.current.cloneNode(true) as HTMLElement;
    element.style.width = "210mm"; // Force A4 width
    element.style.position = "fixed";
    element.style.left = "-9999px";
    element.style.top = "0";
    document.body.appendChild(element);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;

      // 2. THE SMART SPACER: Find every ".avoid" or "p", "li"
      // and check if they are crossing the "cut line" (297mm, 594mm, etc.)
      const elementsToCheck = element.querySelectorAll(
        "p, li, h3, .avoid-break",
      );
      const pxToMm = 0.264583; // Standard conversion

      elementsToCheck.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const bottomMm = rect.bottom * pxToMm;
        const topMm = rect.top * pxToMm;

        // Check if the element is being "strangled" by the page end
        const currentPageEnd = Math.ceil(topMm / pdfHeight) * pdfHeight;

        if (bottomMm > currentPageEnd - 5) {
          // 5mm safety margin
          const gap = currentPageEnd - topMm;
          (el as HTMLElement).style.marginTop = `${gap + 10}px`; // Push to next page
        }
      });

      // 3. Now take the "Clean Photo" of the adjusted layout
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const totalImgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = totalImgHeightInPdf;
      let position = 0;

      // 4. Slice it! (Now it will cut on the white spaces we created)
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalImgHeightInPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          pdfWidth,
          totalImgHeightInPdf,
        );
        heightLeft -= pdfHeight;
      }

      // 5. Share
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({ files: [file], title: "Orçamento E&A" });
      } else {
        pdf.save(`Orcamento_${clientName}.pdf`);
      }
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error("Erro no corte das páginas.");
    } finally {
      document.body.removeChild(element);
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

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

          {/* Option: Local PDF (The new one!) */}
          <button
            type="button"
            onClick={handleShareAsPdfLocalTest}
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
              PDF Rápido Teste
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
