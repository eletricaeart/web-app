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
}
