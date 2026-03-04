async function handler() {
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
    const elementsToCheck = element.querySelectorAll("p, li, h3, .avoid-break");
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
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalImgHeightInPdf);
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
}
