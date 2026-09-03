// components/orcamentos/modelo-novo/geradorNovoPdf.ts
import { toast } from 'sonner';
import { OrcamentoModeloNovoStyles } from './OrcamentoModeloNovoStyles';
import { EACardStyles } from '../EACardStylesheet';
import { TextStylesheet } from '../TextStylesheet';

/**
 * Dispara a impressão nativa / exportação para PDF utilizando as regras
 * unificadas e padronizadas do NOVO MODELO de orçamento.
 *
 * Garante a limpeza total de overlays, gavetas (vaul drawers), toasters e backdrops
 * para que nenhuma película escura ou notificação seja impressa no documento.
 */
export function imprimirNovoModeloPdf(onAfterPrint?: () => void) {
  // 1. Fecha qualquer notificação do Sonner
  try {
    toast.dismiss();
  } catch {
    // Silencioso
  }

  // 2. Remove/oculta imediatamente qualquer overlay, backdrop, appbar ou toast residual no DOM
  const overlays = document.querySelectorAll(
    'header[data-slot="painel-appbar"], header.sticky, .no-print, [data-vaul-overlay], [data-slot="drawer-overlay"], [data-slot="drawer-portal"], [data-vaul-drawer], [data-radix-portal], [role="dialog"], [data-sonner-toaster], [data-sonner-toast], .toaster',
  );
  overlays.forEach((el) => {
    (el as HTMLElement).style.setProperty('display', 'none', 'important');
    (el as HTMLElement).style.setProperty('opacity', '0', 'important');
    (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
  });

  // 3. Remove folhas de estilo antigas injetadas anteriormente
  const oldStyle = document.getElementById('ea-novo-modelo-print-rules');
  if (oldStyle) oldStyle.remove();

  // 4. Injeta a folha de estilo unificada
  const styleEl = document.createElement('style');
  styleEl.id = 'ea-novo-modelo-print-rules';
  styleEl.innerHTML = OrcamentoModeloNovoStyles;
  document.head.appendChild(styleEl);

  // 5. Aguarda 450ms para que o navegador processe as alterações de estilo e o fechamento do modal
  setTimeout(() => {
    window.print();
    if (onAfterPrint) onAfterPrint();

    setTimeout(() => {
      const el = document.getElementById('ea-novo-modelo-print-rules');
      if (el) el.remove();
    }, 2000);
  }, 450);
}

/**
 * Envia o HTML estilizado do Novo Modelo ao backend Puppeteer (/api/generate-pdf)
 * e retorna o File gerado e a URL Blob para download ou compartilhamento.
 */
export async function gerarPdfPuppeteerBackend(
  contentElement: HTMLElement,
  clientName: string = 'Cliente',
): Promise<{ file: File; url: string } | null> {
  try {
    const contentHtml = contentElement.innerHTML;
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.innerHTML)
      .join('\n');

    const htmlFull = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      ${inlineStyles}
    </style>
    <style id="ea-novo-modelo-complete-styles">
      ${OrcamentoModeloNovoStyles}
      ${TextStylesheet}
      ${EACardStyles}

      @page {
        size: A4 portrait;
        margin: 8mm 6mm 8mm 6mm;
      }

      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      body {
        background-color: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .no-print, [data-vaul-overlay], [data-slot="drawer-overlay"], .toaster, [data-sonner-toaster] {
        display: none !important;
      }
    </style>
  </head>
  <body class="bg-white">
    <div class="ea-modelo-novo-root">
      ${contentHtml}
    </div>
  </body>
</html>`;

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: htmlFull }),
    });

    if (!response.ok) {
      throw new Error('Falha na resposta do servidor ao gerar PDF');
    }

    const blob = await response.blob();
    const safeName = clientName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const file = new File([blob], `Orcamento_${safeName}_NovoModelo.pdf`, {
      type: 'application/pdf',
    });

    const url = URL.createObjectURL(blob);
    return { file, url };
  } catch (err) {
    console.error('[gerarPdfPuppeteerBackend]', err);
    return null;
  }
}
