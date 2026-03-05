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
