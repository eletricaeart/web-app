// components/orcamentos/modelo-novo/geradorNovoPdf.ts
import { toast } from 'sonner';
import { OrcamentoModeloNovoStyles } from './OrcamentoModeloNovoStyles';

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
