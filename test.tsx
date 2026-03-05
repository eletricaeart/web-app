const test3 = async () => {
  if (!budgetRef.current) return;
  setIsGenerating(true);

  try {
    // 1. Capturamos o HTML exato que está na tela
    const budgetHtml = budgetRef.current.innerHTML;

    // 1. Captura os estilos da página atual
    const styles = Array.from(document.querySelectorAll("style"))
      .map((s) => s.innerHTML)
      .join("\n");

    // 2. Monta o HTML com o Tailwind injetado via CDN para garantir
    const htmlFull = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${styles}</style>
          <style>
            body { background: white !important; font-family: sans-serif; }
            * { -webkit-print-color-adjust: exact !important; }
          </style>
        </head>
        <body class="p-10">
          ${budgetRef.current.innerHTML}
        </body>
      </html>
    `;

    const response = await fetch("/api/generate-pdf", {
      // Ajuste para a sua rota
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: htmlFull }),
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
