"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";

interface Props {
  data: any;
  clientName: string;
}

export default function BudgetShareLogic({ data, clientName }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  // 1. This function handles the PDF generation
  const handleGeneratePdf = async () => {
    const element = printRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 10],
      filename: `Orcamento_${clientName.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      // This is the MAGIC part for your page breaks!
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate PDF and get the blob to share
    const pdfBlob = await html2pdf().from(element).set(opt).output("blob");

    // 2. Share via Web Share API (WhatsApp/Email)
    if (navigator.share) {
      const file = new File([pdfBlob], opt.filename, {
        type: "application/pdf",
      });
      try {
        await navigator.share({
          files: [file],
          title: "Orçamento - Elétrica & Art",
          text: `Olá! Segue o orçamento de ${clientName}.`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Just download if sharing is not supported
      html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <div>
      <button
        onClick={handleGeneratePdf}
        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all"
      >
        Gerar e Compartilhar PDF
      </button>

      {/* 3. The Hidden Template (The one we will print) */}
      <div style={{ display: "none" }}>
        <div
          ref={printRef}
          className="print-container p-8 bg-white text-slate-900"
        >
          {/* Your Budget Template goes here */}
          <h1>Orçamento: {data.docTitle.text}</h1>
          <p>Cliente: {clientName}</p>
          {/* ... use the CSS break rules we discussed here ... */}
        </div>
      </div>
    </div>
  );
}
