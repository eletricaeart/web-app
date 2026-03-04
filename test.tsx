"use client";

// ... other imports
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas-pro"; // Import the PRO version!

// ... inside the component

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
