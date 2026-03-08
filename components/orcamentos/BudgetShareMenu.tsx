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
import { styles4send } from "./styles4send";
import { prestyle } from "./prestyle";
import { EACardStyles } from "./EACardStylesheet";
import { TextStylesheet } from "./TextStylesheet";

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

  /**
   * --- [ generate pdf on server and return it to front ]
   *  */
  const generatePdfOnServerAndReturnIt = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);
    setGeneratedFile(null); // Limpa anterior

    try {
      // Pegamos a origem do site (ex: https://eletrica-e-art.vercel.app)
      const baseUrl = window.location.origin;

      const budgetHtml = budgetRef.current.innerHTML;
      const styles = Array.from(document.querySelectorAll("style"))
        .map((s) => s.innerHTML)
        .join("\n");

      const htmlFull = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${styles}\n${prestyle}\n${styles4send}\n${EACardStyles}\n${TextStylesheet}</style>
          <style>
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
          </style>
        </head>
        <body class="p-10">${budgetHtml}</body>
      </html>
    `;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlFull }),
      });

      if (!response.ok) throw new Error("Erro no servidor");

      const blob = await response.blob();
      const file = new File([blob], `Orcamento_${clientName}.pdf`, {
        type: "application/pdf",
      });

      // GUARDAMOS O ARQUIVO NO ESTADO
      setGeneratedFile(file);
      setPdfUrl(window.URL.createObjectURL(blob));

      toast.success("PDF gerado com sucesso! Clique em compartilhar.");
    } catch (err: any) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  };
  /* --- */

  /**
   * --- [ handle the pdf file after the front receive it from the server ]
   * */
  const handleShareFileAfterServerGenerateTheFile = async () => {
    if (!generatedFile) return;

    try {
      if (navigator.share && navigator.canShare({ files: [generatedFile] })) {
        await navigator.share({
          files: [generatedFile],
          title: "Orçamento Elétrica & Art",
          text: `Olá! Segue o orçamento de ${clientName}.`,
        });
      } else {
        // Fallback: Download
        const a = document.createElement("a");
        a.href = pdfUrl!;
        a.download = generatedFile.name;
        a.click();
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };
  /* --- */

  /**
   * --- [ handle native browser print ]
   * */
  const handleNativePrint = () => {
    async function load() {
      onOpenChange(false);
    }
    load().then(() => {
      onOpenChange(false);
      setTimeout(() => {
        window.print();
      }, 1000);
    });
  };

  /**
   * --- [ Share as Image (Existing) ]
   *  */
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

  /**
   * --- [ Testing: Local PDF with html2pdf (Captures the current view) ]
   *  */
  const handleShareAsPdfWithHTML2PDF = async () => {
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
  /* --- */

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="pb-10 bg-white rounded-[2rem_2rem_0_0_!important] border-none"
        style={{ bordeTopWidth: "0 !important" }}
      >
        <DrawerHeader>
          <DrawerTitle className="text-center text-slate-800 text-xl font-geist-mono capitalize tracking-widest font-semibold">
            Opções de Compartilhamento
          </DrawerTitle>
        </DrawerHeader>

        {/* Changed grid-cols-2 to grid-cols-3 to fit all options */}
        <View className="grid grid-cols-3 gap-2 min-h-40 p-4">
          {/* Option: Image */}
          <View
            onClick={handleShareAsImg}
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

          {/* print the pdf */}
          <View
            onClick={handleNativePrint}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
          >
            <View className="bg-sky-100 p-3 rounded-2xl text-sky-600">
              {isGenerating ? (
                <SpinnerGap className="animate-spin" size={24} />
              ) : (
                <Printer size={24} weight="duotone" />
              )}
            </View>
            <span className="text-[10px] font-bold text-slate-700 text-center">
              Imprimir
            </span>
          </View>

          {/* generate pdf file on the server and share it on frontend */}
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
              onClick={() => {
                handleShareFileAfterServerGenerateTheFile();
                setTimeout(() => {
                  setGeneratedFile(null);
                }, 2000);
              }}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl active:scale-95 transition-all"
            >
              <View className="bg-indigo-600 p-3 rounded-2xl text-indigo-100">
                {isGenerating ? (
                  <SpinnerGap className="animate-spin" size={24} />
                ) : (
                  <FilePdf size={24} weight="duotone" />
                )}
              </View>
              <span className="text-[10px] font-bold text-slate-700 text-center">
                Compartilhar o PDF
              </span>
            </View>
          )}

          {/* Testing: Local PDF (With HTML2PDF) */}
          <View
            onClick={handleShareAsPdfWithHTML2PDF}
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
              PDF (Teste)
            </span>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
