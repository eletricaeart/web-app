const handleShareServerPDF = async () => {
  if (!budgetRef.current) return;

  // Clona o HTML do orçamento
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          ${document.querySelector("style")?.innerHTML || ""}
        </style>
      </head>
      <body>
        ${budgetRef.current.outerHTML}
      </body>
    </html>
  `;

  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html: htmlContent }),
  });

  const blob = await response.blob();

  const file = new File([blob], `Orcamento_${clientName}.pdf`, {
    type: "application/pdf",
  });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Orçamento",
      text: `Olá! Segue o orçamento.`,
    });
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url);
  }
};
