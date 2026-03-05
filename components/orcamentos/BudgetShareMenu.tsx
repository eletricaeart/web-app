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
import View from "../layout/View";
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

  /** --- [ share srverPDF ]
   * */
  const handleShareServerPDF = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);

    try {
      // Captura os estilos atuais para enviar junto
      const styles = Array.from(document.querySelectorAll("style"))
        .map((s) => s.innerHTML)
        .join("\n");

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${styles}</style>
        </head>
        <body style="background: white;">
          ${budgetRef.current.outerHTML}
        </body>
      </html>
    `;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlContent }),
      });

      if (!response.ok) throw new Error("Erro na API");

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      // Compartilhamento Nativo (Perfeito para o WhatsApp do Rafael)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento E&A",
          text: "Segue o orçamento solicitado.",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.pdf`;
        a.click();
      }
    } catch (err) {
      toast.error("Erro no servidor de PDF");
      console.error(err);
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  /**
   * --- server test 2
   *  */
  const handleShareServerPDF2 = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);

    try {
      // Captura os estilos atuais para enviar junto
      const styles = Array.from(document.querySelectorAll("style"))
        .map((s) => s.innerHTML)
        .join("\n");

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${styles}</style>
        </head>
        <body style="background: white;">
          ${budgetRef.current.outerHTML}
        </body>
      </html>
    `;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlContent }),
      });

      if (!response.ok) throw new Error("Erro na API");

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      // Compartilhamento Nativo (Perfeito para o WhatsApp do Rafael)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento E&A",
          text: "Segue o orçamento solicitado.",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.pdf`;
        a.click();
      }
    } catch (err) {
      toast.error("Erro no servidor de PDF");
      console.error(err);
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };
  /**
   * --- server teste A
   *  */
  /**
   * --- server teste B
   *  */
  const handleShareServerPDFB = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Capturamos o HTML exato que está na tela
      const budgetHtml = budgetRef.current.innerHTML;

      // 2. Capturamos todos os estilos (Tailwind e globais) para o PDF não virar "texto puro"
      const styles = Array.from(document.querySelectorAll("style"))
        .map((s) => s.innerHTML)
        .join("\n");

      // 3. Montamos o "pacote" completo
      const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${styles}
            body { background: white !important; padding: 40px !important; }
            /* Garante que cores de fundo apareçam no PDF */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${budgetHtml}
        </body>
      </html>
    `;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: fullHtml }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na geração do PDF");
      }

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
          text: `Olá! Segue o orçamento de ${clientName}.`,
        });
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Orcamento_${clientName}.pdf`;
        a.click();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar PDF no servidor");
      console.error("Erro PDF:", err);
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
        <View className="grid grid-cols-3 gap-2 p-4">
          {/* Option: Image */}
          <View
            onClick={handleShareAsImg}
            disabled={isGenerating}
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

          {/* Option: Local PDF (The new one!) */}
          <View
            onClick={handleShareAsPdfLocal}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              PDF Rápido
            </span>
          </View>

          {/* Option: Local PDF (The new one!) */}
          <View
            onClick={handleShareAsPdfLocalTest}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              PDF Rápido Teste
            </span>
          </View>

          {/* Option: Local PDF (The new one!) */}
          <View
            onClick={handleShareServerPDF}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              serverPDF
            </span>
          </View>

          {/* Option: Local PDF (The new one!) */}
          <View
            onClick={handleShareServerPDF2}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              serverPDF2
            </span>
          </View>

          {/* Option: Local PDF (The new one!) */}
          <View
            onClick={handleShareServerPDFB}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              serverTesteB
            </span>
          </View>

          {/* Option: Backend PDF */}
          <View
            onClick={handlePrintBackend}
            disabled={isGenerating}
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
              PDF Elite
            </span>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
