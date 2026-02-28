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

export default function BudgetShareMenu({
  budgetRef,
  clientName,
  budgetTitle,
  data,
  open, // Recebe o estado de abertura
  onOpenChange, // Recebe a função para fechar
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const fileNameBase = `Orcamento_${clientName?.replace(/\s+/g, "_")}`;

  // Helper para disparar a Share API
  const handleShare = async (blob, fileName, type) => {
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

  // 1. PDF CONTÍNUO (PÁGINA ÚNICA / ROLO)
  const shareContinuousPDF = async () => {
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
      const pdf = new jsPDF("p", "mm", [imgWidth, imgHeight]);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      await handleShare(
        pdf.output("blob"),
        `${fileNameBase}_continuo.pdf`,
        "application/pdf",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. COMPARTILHAR COMO IMAGEM (PNG)
  const shareAsImage = async () => {
    setIsGenerating(true);
    try {
      const blob = await domToBlob(budgetRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      await handleShare(blob, `${fileNameBase}.png`, "image/png");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. PDF MULTIPÁGINA (IMG BASED)
  const handleShareIMGPDF = async () => {
    setIsGenerating(true);
    try {
      const canvas = await domToCanvas(budgetRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      await handleShare(
        pdf.output("blob"),
        `${fileNameBase}_A4.pdf`,
        "application/pdf",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. SHARE VIA REACT-TO-PRINT (CAPTURA O IFRAME DE IMPRESSÃO)
  const sharePrintPDF = useReactToPrint({
    contentRef: budgetRef,
    documentTitle: fileNameBase,
    onBeforeGetContent: () => setIsGenerating(true),
    onAfterPrint: () => setIsGenerating(false),
    print: async (iframe) => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      const printable = iframeDoc.querySelector("body");
      const canvas = await domToCanvas(printable, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      await handleShare(
        pdf.output("blob"),
        `${fileNameBase}_print.pdf`,
        "application/pdf",
      );
    },
  });

  // 5. HTML 2 PDF (VERSÃO LEGADA)
  const handleShareHTML2PDF = useReactToPrint({
    contentRef: budgetRef,
    documentTitle: fileNameBase,
    print: async (iframe) => {
      const printDoc = iframe.contentDocument || iframe.contentWindow.document;
      const printRoot = printDoc.querySelector("[tag='budget-page']");
      const opt = {
        margin: 0,
        filename: `${fileNameBase}_legacy.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };
      const worker = html2pdf().set(opt).from(printRoot);
      const pdfBlob = await worker.outputPdf("blob");
      await handleShare(
        pdfBlob,
        `${fileNameBase}_legacy.pdf`,
        "application/pdf",
      );
    },
  });

  /* @react-pdf/renderer */
  const shareVectorPDF = async () => {
    setIsGenerating(true);
    try {
      // 1. Gera o blob usando o motor do react-pdf (Independente do que está na tela!)
      const blob = await pdf(<BudgetPDFTemplate data={data} />).toBlob();

      const fileName = `Orcamento_Oficial_${clientName.replace(/\s+/g, "_")}.pdf`;
      await handleShare(blob, fileName, "application/pdf");
    } catch (error) {
      console.error("Erro no PDF Vetorial:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button
          className="fab-sub-action"
          disabled={isGenerating}
          style={{ display: "none" }}
        >
          {isGenerating ? (
            <SpinnerGap size={28} className="animate-spin text-indigo-600" />
          ) : (
            <ShareNetwork size={0} weight="duotone" />
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent
        style={{
          paddingTop: "1rem",
          paddingBottom: "2rem",
          borderRadius: "2rem 2rem 0 0",
          zIndex: "30000",
        }}
        className="w-full items-center p-2 bg-white pt-4 shadow-2xl border-none rounded-xl"
        align="end"
        side="top"
        sideOffset={15}
      >
        <div className="flex w-100 flex-col gap-1">
          {/* ... Seus botões de menu (shareContinuousPDF, handleShareIMGPDF, etc) ... */}

          {isGenerating && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
              <SpinnerGap size={32} className="animate-spin text-indigo-600" />
            </div>
          )}

          <DrawerHeader className="p-0 mb-4">
            <DrawerTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Compartilhar
            </DrawerTitle>
          </DrawerHeader>

          <button
            onClick={() => {
              shareContinuousPDF();
              onOpenChange(false);
            }}
            className="share-menu-item"
          >
            <div className="icon-box bg-blue-50 text-blue-600">
              <Files size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">PDF Contínuo</span>
              <small className="text-[10px] text-slate-500">
                Ideal para WhatsApp (Sem quebras)
              </small>
            </div>
          </button>

          <button
            onClick={() => {
              handleShareIMGPDF();
              onOpenChange(false);
            }}
            className="share-menu-item"
          >
            <div className="icon-box bg-indigo-50 text-indigo-600">
              <FilePdf size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">PDF Multipáginas</span>
              <small className="text-[10px] text-slate-500">
                Formato A4 clássico
              </small>
            </div>
          </button>

          <button
            onClick={() => {
              sharePrintPDF();
              onOpenChange(false);
            }}
            className="share-menu-item"
          >
            <div className="icon-box bg-emerald-50 text-emerald-600">
              <Printer size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">Captura de Impressão</span>
              <small className="text-[10px] text-slate-500">
                Usa o motor window.print
              </small>
            </div>
          </button>

          <button
            onClick={() => {
              shareAsImage();
              onOpenChange(false);
            }}
            className="share-menu-item"
          >
            <div className="icon-box bg-orange-50 text-orange-600">
              <ImageIcon size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">Enviar como Imagem</span>
              <small className="text-[10px] text-slate-500">
                Máxima compatibilidade
              </small>
            </div>
          </button>

          <button
            onClick={() => {
              handleShareHTML2PDF();
              onOpenChange(false);
            }}
            className="share-menu-item opacity-60"
          >
            <div className="icon-box bg-slate-100 text-slate-600">
              <FileCode size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">HTML2PDF (Legado)</span>
              <small className="text-[10px] text-slate-500">Motor antigo</small>
            </div>
          </button>

          <button
            onClick={() => {
              shareVectorPDF();
              onOpenChange(false);
            }}
            className="share-menu-item opacity-100"
          >
            <div className="icon-box bg-slate-100 text-slate-600">
              <FileCode size={20} weight="duotone" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">@react-pdf/renderer</span>
              <small className="text-[10px] text-slate-500">Motor antigo</small>
            </div>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * saver for inside share functions of Budget.jsx 
 *

const handleShareAsImg = async () => {
    const element = budgetRef.current;
    if (!element) return;

    try {
      // 1. Converte o DOM para Blob (suporta as cores do Tailwind v4)
      const blob = await domToBlob(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      // 2. Criamos um arquivo de Imagem (PNG) ou PDF
      // Nota: Compartilhar como PNG é mais rápido e garante 100% de fidelidade no WhatsApp
      const file = new File([blob], `Orcamento_${data.cliente.name}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento Elétrica & Art",
          text: `Olá ${data.cliente.name}, segue o orçamento conforme conversamos.`,
        });
      } else {
        // Se não puder compartilhar, faz o download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Orcamento_${data.cliente.name}.png`;
        link.click();
      }
    } catch (error) {
      console.error("Erro ao gerar imagem para compartilhamento:", error);
      alert("Erro ao processar documento. Tente usar a opção de Imprimir PDF.");
    }
  };

  const handleShareIMGPDF = async () => {
    const element = budgetRef.current;
    if (!element) return;

    try {
      console.log("Gerando PDF multipágina...");

      const canvas = await domToCanvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);

      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Primeira página
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Páginas adicionais
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Orcamento_${data.cliente.name.replace(/\s+/g, "_")}.pdf`;

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: `Olá ${data.cliente.name}, segue o orçamento em PDF.`,
        });
      } else {
        pdf.save(fileName);
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF.");
    }
  };

  const handleSharePDF = useReactToPrint({
    contentRef: budgetRef,
    // documentTitle: `Orcamento_${data.cliente.name}`,
    documentTitle: `Orcamento_${"data.cliente.name"}`,
    preserveAfterPrint: true,

    print: async (iframe) => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) return;

      // ⏳ Aguarda o CSS de print ser aplicado
      await new Promise((r) => setTimeout(r, 1000));

      // Clona o conteúdo já tratado pelo @media print
      const printable = iframeDoc.querySelector("body");

      const canvas = await domToCanvas(printable, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);

      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Orcamento_${data.cliente.name.replace(/\s+/g, "_")}.pdf`;

      const blob = pdf.output("blob");
      const file = new File([blob], fileName, {
        type: "application/pdf",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: `Olá ${data.cliente.name}, segue o orçamento em PDF.`,
        });
      } else {
        pdf.save(fileName);
      }
    },
  });

  const handleShareHTML2PDF = useReactToPrint({
    contentRef: budgetRef,
    documentTitle: `Orcamento_${data?.cliente?.name}`,
    preserveAfterPrint: true,

    print: async (iframe) => {
      const printDoc = iframe.contentDocument || iframe.contentWindow.document;

      const printRoot = printDoc.querySelector("[tag='budget-page']");

      if (!printRoot) {
        alert("Erro ao localizar conteúdo para impressão.");
        return;
      }

      await new Promise((r) => setTimeout(r, 500));

      const opt = {
        margin: 0,
        filename: `Orcamento_${data.cliente.name.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
        },
      };

      const worker = html2pdf().set(opt).from(printRoot);

      const pdfBlob = await worker.outputPdf("blob");

      const file = new File([pdfBlob], `Orcamento_${data.cliente.name}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Orçamento",
          text: `Olá ${data.cliente.name}, segue o orçamento conforme conversamos.`,
        });
      } else {
        worker.save();
      }
    },
  });

  // Configuração do FAB
  const fabActions = [
    {
      icon: <Pen size={28} weight="duotone" />,
      label: "Editar",
      action: () => {
        handleEdit();
      },
    },
    {
      icon: <ShareNetwork size={28} weight="duotone" />,
      label: "Enviar Imagem",
      action: () => handleShareAsImg(),
    },
    {
      icon: <ShareNetwork size={28} weight="duotone" />, // Novo botão de compartilhar
      label: "HTML 2 PDF",
      action: () => handleShareHTML2PDF(),
    },
    {
      icon: <ShareNetwork size={28} weight="duotone" />, // Novo botão de compartilhar
      label: "Compartilhar PDF",
      action: () => handleSharePDF(),
    },
    {
      // Passamos o componente como ícone ou criamos uma ação customizada no FAB
      icon: <BudgetShareMenu 
              budgetRef={budgetRef} 
              clientName={data?.cliente?.name} 
              budgetTitle={data?.docTitle?.text} 
            />,
      label: "Compartilhar",
      action: () => {}, // O Popover cuida da ação
    },
    {
      icon: <FilePdf size={28} weight="duotone" />,
      label: "Imprimir PDF",
      action: () => window.print(),
    },
  ];

*/
