// components/orcamentos/modelo-novo/OrcamentoModeloNovoStyles.ts
/**
 * Folha de estilos unificada exportada como string para impressão nativa do navegador e geração de PDF no backend (Puppeteer).
 * Contém TODAS as cores institucionais da Elétrica & Art, estilização completa de cláusulas, cartões, tipografia,
 * proteções anti-quebra de página e garantia de preservação das cores de fundo (-webkit-print-color-adjust: exact).
 */
export const OrcamentoModeloNovoStyles = `
  :root,
  body,
  .ea-modelo-novo-root,
  #print-root {
    /* Cores Institucionais Elétrica & Art */
    --ea-bg: #f5f5f5;
    --ea-ceo-golden: #daa520;
    --ea-ceo-amber: #ffab00;
    --ea-ceo-blue: #2277ff;

    /* Cores Suvinil / Identidade Visual */
    --ea-sv-calopsita: rgb(219, 218, 215);
    --ea-sv-cromio: rgb(209, 208, 202);
    --ea-sv-azul-bebe: rgb(183, 213, 229);
    --ea-sv-marine: rgb(125, 136, 187);
    --ea-sv-beija-flor: rgb(61, 88, 132);
    --ea-sv-sodalita: rgb(86, 108, 155);
    --ea-sv-sombra-azul: rgb(21, 74, 143);

    /* Aliases Legados para Compatibilidade Total */
    --sv-calopsita: rgb(219, 218, 215);
    --sv-cromio: rgb(209, 208, 202);
    --sv-azul-bebe: rgb(183, 213, 229);
    --sv-marine: rgb(125, 136, 187);
    --sv-beija-flor: rgb(61, 88, 132);
    --sv-sodalita: rgb(86, 108, 155);
    --sv-sombra-azul: rgb(21, 74, 143);

    --ea-blue-dark: #003b6b;
    --ea-blue-accent: #00559c;

    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* FORÇAR RENDERIZAÇÃO DE CORES DE FUNDO E BORDAS NO CHROME / PUPPETEER */
  *,
  *::before,
  *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
    box-sizing: border-box;
  }

  /* ==========================================================================
     REGRAS GERAIS DE PÁGINA (A4)
     ========================================================================== */
  @page {
    size: A4 portrait;
    margin: 8mm 6mm 8mm 6mm;
    @bottom-right {
      content: "Pág. " counter(page) " de " counter(pages);
      font-size: 8.5pt;
      color: #64748b;
      padding-bottom: 4px;
      padding-right: 4px;
    }
  }

  /* ==========================================================================
     ESTILOS BASE DO NOVO MODELO (SEMPRE APLICADOS, SCREEN E PRINT)
     ========================================================================== */

  .ea-modelo-novo-root,
  #print-root {
    width: 100%;
    margin: 0 auto;
    background: transparent;
    color: #1e293b;
  }

  budget-page,
  [data-tag="budget-page"],
  [tag="budget-page"] {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: transparent;
  }

  page-header,
  [data-tag="page-header"],
  [tag="page-header"] {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* --- [ DOC-ID ] --- */
  doc-id,
  [data-tag="doc-id"],
  [tag="doc-id"] {
    background: #ffffff !important;
    width: calc(100% - 1.5rem);
    padding: 0.35em 1em;
    margin: 0 auto;
    border-radius: 0 0 1rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
    border-left: 5px solid #e2e8f0;
    border-right: 5px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    color: var(--ea-blue-dark, #003b6b) !important;
    font-size: 0.75rem;
    box-sizing: border-box;
  }

  doc-id span,
  [data-tag="doc-id"] span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  doc-id b,
  [data-tag="doc-id"] b {
    color: var(--ea-blue-accent, #00559c);
    font-weight: 700;
  }

  /* --- [ EACARD NOVO (CABEÇALHO OFICIAL COM ALTURA REDUZIDA EM 25%) ] --- */
  ea-card-novo,
  .ea_card_novo,
  [data-tag="ea-card-novo"],
  [tag="ea-card-novo"] {
    display: grid !important;
    grid-template-columns: 0.26fr 0.74fr !important;
    width: 100% !important;
    min-height: 125px !important;
    padding: 8px 16px !important;
    box-sizing: border-box !important;
    color: #f8fafc !important;
    margin: 0 !important;
    overflow: hidden !important;
    border-radius: 1rem 1rem 0.25rem 0.25rem !important;
    background-color: #0a0f19 !important;
    background-image: url("https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png") !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .logoAreaNovo {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
  }

  .logoImgNovo {
    max-height: 100px !important;
    width: auto !important;
    max-width: 90% !important;
    object-contain: contain !important;
  }

  .descriptionNovo {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
    padding: 0 4px !important;
  }

  .nameImgNovo {
    max-width: 270px !important;
    height: auto !important;
    object-contain: contain !important;
    margin-bottom: 2px !important;
  }

  .cnpjTextNovo {
    font-size: 10.5px !important;
    font-weight: bold !important;
    color: #ffffff !important;
    line-height: 1.2 !important;
    display: block !important;
  }

  .addressTextNovo {
    font-size: 9.5px !important;
    color: #f1f5f9 !important;
    line-height: 1.25 !important;
    margin: 2px 0 !important;
  }

  .contactsAreaNovo {
    font-size: 9.5px !important;
    color: #f8fafc !important;
    line-height: 1.25 !important;
  }

  .contactLinkNovo {
    color: inherit !important;
    text-decoration: none !important;
  }

  /* --- [ DOC TITLE (TÍTULO DO ORÇAMENTO) ] --- */
  doc-title,
  [data-tag="doc-title"],
  [tag="doc-title"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    margin: 12px 0 8px !important;
    width: 100% !important;
  }

  doc-title_type,
  [data-tag="doc-title_type"],
  [tag="doc-title_type"],
  .tag-doc-title_type {
    font-size: 1.15rem !important;
    font-weight: 700 !important;
    color: var(--ea-sv-sombra-azul, #154a8f) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
    margin-bottom: 4px !important;
  }

  doc-title_title,
  [data-tag="doc-title_title"],
  [tag="doc-title_title"],
  .tag-doc-title_title {
    background: var(--ea-sv-sombra-azul, rgb(21, 74, 143)) !important;
    background-color: rgb(21, 74, 143) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    font-size: 1.05rem !important;
    padding: 0.4rem 1.2rem !important;
    border-radius: 8px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.02em !important;
    display: inline-block !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* --- [ CLIENTE SECTION ] --- */
  cliente-section,
  [data-tag="cliente-section"],
  [tag="cliente-section"] {
    display: block !important;
    width: 100% !important;
    margin: 8px 0 14px !important;
  }

  cliente-section > ui,
  cliente-section > [data-tag="ui"],
  cliente-section > div,
  [data-tag="cliente-section"] > div {
    display: flex !important;
    flex-direction: column !important;
    background: #ffffff !important;
    width: 100% !important;
    border-radius: 1rem !important;
    overflow: hidden !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #e2e8f0 !important;
  }

  cliente-section header,
  cliente-section [data-tag="header"],
  [data-tag="cliente-section"] header {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    text-align: center !important;
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    padding: 0.4em 0.5em !important;
    background: var(--ea-sv-sombra-azul, rgb(21, 74, 143)) !important;
    background-color: rgb(21, 74, 143) !important;
    border-radius: 1rem 1rem 0 0 !important;
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  cliente-section header > ui,
  cliente-section header > [data-tag="ui"],
  cliente-section header > div,
  [data-tag="cliente-section"] header > div {
    height: 26px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 auto !important;
    padding: 0 1.5rem !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 0.95em !important;
    background: var(--ea-sv-sodalita, rgb(86, 108, 155)) !important;
    background-color: rgb(86, 108, 155) !important;
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    text-transform: uppercase !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  cliente-section content,
  cliente-section [data-tag="content"],
  cliente-section [tag="content"],
  [data-tag="cliente-section"] [data-tag="content"] {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    padding: 0.8em !important;
    box-sizing: border-box !important;
  }

  cliente-section card,
  cliente-section [data-tag="card"],
  [data-tag="cliente-section"] [data-tag="card"] {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    border-radius: 0.8em !important;
    background: #bdcfea !important;
    background-color: #bdcfea !important;
    overflow: hidden !important;
    padding: 2px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  cliente-section card > ui,
  cliente-section card > [data-tag="ui"],
  cliente-section card > div,
  [data-tag="cliente-section"] [data-tag="card"] > div {
    padding: 0.8em 1em !important;
    background: #ffffff !important;
    border-radius: 0.7em !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.35rem !important;
    font-size: 0.95rem !important;
  }

  /* ==========================================================================
     CLÁUSULAS DO ORÇAMENTO (CABEÇALHOS COLORIDOS E CONTEÚDO)
     ========================================================================== */

  budget-body,
  [data-tag="budget-body"],
  [tag="budget-body"] {
    display: block !important;
    width: 100% !important;
  }

  clause,
  [data-tag="clause"],
  [tag="clause"],
  .tag-clause {
    display: block !important;
    width: 100% !important;
    margin: 12px 0 !important;
    background: transparent !important;
    border-radius: 12px !important;
  }

  clause > ui,
  clause > [data-tag="ui"],
  clause > div,
  [data-tag="clause"] > div,
  .tag-clause > div {
    display: flex !important;
    flex-direction: column !important;
    background: #ffffff !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  }

  /* --- [ BANNER EXTERNO DO CABEÇALHO DA CLÁUSULA (AZUL SODALITA) ] --- */
  clause-header,
  [data-tag="clause-header"],
  [tag="clause-header"],
  .tag-clause-header,
  .clause-header {
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    width: 100% !important;
    padding: 0.4em 0.5em !important;
    background: var(--ea-sv-sodalita, rgb(86, 108, 155)) !important;
    background-color: rgb(86, 108, 155) !important;
    border-radius: 11px 11px 0 0 !important;
    display: flex !important;
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* --- [ PÍLULA INTERNA DO CABEÇALHO DA CLÁUSULA (AZUL SOMBRA AZUL) ] --- */
  clause-header > ui,
  clause-header > [data-tag="ui"],
  clause-header > [tag="ui"],
  clause-header > div,
  [data-tag="clause-header"] > [data-tag="ui"],
  [data-tag="clause-header"] > [tag="ui"],
  [data-tag="clause-header"] > div,
  .tag-clause-header > div,
  .clause-header > div {
    display: flex !important;
    width: 100% !important;
    height: 28px !important;
    min-height: 28px !important;
    border-radius: 8px !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: 700 !important;
    font-size: 0.95em !important;
    background: var(--ea-sv-sombra-azul, rgb(21, 74, 143)) !important;
    background-color: rgb(21, 74, 143) !important;
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.02em !important;
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Texto dentro do cabeçalho da cláusula */
  clause-header t,
  clause-header [data-tag="t"],
  clause-header [tag="t"],
  clause-header span,
  [data-tag="clause-header"] [data-tag="t"],
  [data-tag="clause-header"] span,
  .tag-clause-header span {
    font-family: 'Montserrat', 'Inter', 'Roboto', sans-serif !important;
    font-weight: 700 !important;
    font-size: 0.95em !important;
    text-transform: uppercase !important;
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    display: block !important;
    text-align: center !important;
  }

  /* --- [ CONTEÚDO DA CLÁUSULA ] --- */
  clause-content,
  [data-tag="clause-content"],
  [tag="clause-content"],
  .tag-clause-content {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    padding: 1em 1.25em !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    border-radius: 0 0 12px 12px !important;
    box-sizing: border-box !important;
  }

  subclause,
  [data-tag="subclause"],
  [tag="subclause"],
  .tag-subclause {
    display: block !important;
    width: 100% !important;
    margin: 4px 0 !important;
  }

  subclause-header,
  [data-tag="subclause-header"],
  [tag="subclause-header"],
  .tag-subclause-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.5em 0.2em !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
    font-weight: bold !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  subclause-header t6,
  subclause-header [data-tag="t6"],
  subclause-header [tag="t6"],
  subclause-header div,
  [data-tag="subclause-header"] div {
    font-family: 'Montserrat', sans-serif !important;
    font-weight: bold !important;
    font-size: 0.98rem !important;
    color: #1e293b !important;
  }

  subclause-body,
  [data-tag="subclause-body"],
  [tag="subclause-body"],
  .tag-subclause-body,
  .markdown-rendered-content {
    display: block !important;
    width: 100% !important;
    padding: 0.5em 0.2em !important;
    font-size: 0.95rem !important;
    line-height: 1.55 !important;
    color: #334155 !important;
  }

  /* --- [ LISTAS (UL, OL) E BULLETS CUSTOMIZADOS ] --- */
  ul,
  subclause-body ul,
  .markdown-rendered-content ul {
    list-style: none !important;
    padding-left: 0 !important;
    margin: 6px 0 !important;
  }

  ol,
  subclause-body ol,
  .markdown-rendered-content ol {
    list-style: none !important;
    counter-reset: ea-ol-counter !important;
    padding-left: 0 !important;
    margin: 6px 0 !important;
  }

  ul > li,
  subclause-body ul > li,
  .markdown-rendered-content ul > li {
    display: block !important;
    position: relative !important;
    padding-left: 1.4rem !important;
    margin-bottom: 4px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  ul > li::before,
  subclause-body ul > li::before,
  .markdown-rendered-content ul > li::before {
    content: "•" !important;
    position: absolute !important;
    left: 0.35rem !important;
    top: 0 !important;
    color: #0075bd !important;
    font-weight: 900 !important;
    font-size: 1.25em !important;
    line-height: 1.2 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  ol > li,
  subclause-body ol > li,
  .markdown-rendered-content ol > li {
    display: block !important;
    position: relative !important;
    counter-increment: ea-ol-counter !important;
    padding-left: 1.6rem !important;
    margin-bottom: 4px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  ol > li::before,
  subclause-body ol > li::before,
  .markdown-rendered-content ol > li::before {
    content: counter(ea-ol-counter) "." !important;
    position: absolute !important;
    left: 0.15rem !important;
    top: 0 !important;
    color: #0075bd !important;
    font-weight: 700 !important;
    font-size: 0.95em !important;
    line-height: inherit !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* --- [ DESTAQUES / BLOCOS TAGC / BLOCKQUOTES ] --- */
  blockquote,
  tagc,
  .tagc,
  [data-tag="tagc"],
  [tag="tagc"] {
    display: block !important;
    padding: 10px 14px !important;
    background: #e8f1ff !important;
    background-color: #e8f1ff !important;
    color: #0075bd !important;
    border-radius: 12px !important;
    margin: 8px 0 !important;
    border-left: 4px solid #2277ff !important;
    font-size: 0.95rem !important;
    line-height: 1.5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* --- [ RODAPÉ E ASSINATURAS ] --- */
  footer-content,
  [data-tag="footer-content"],
  [tag="footer-content"] {
    display: block !important;
    width: 100% !important;
    margin-top: 15px !important;
  }

  footer-content_bottom header,
  footer-content_bottom [data-tag="header"],
  [data-tag="footer-content_bottom"] header {
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    width: 100% !important;
    padding: 0.4em 0.5em !important;
    background: var(--ea-sv-sodalita, rgb(86, 108, 155)) !important;
    background-color: rgb(86, 108, 155) !important;
    border-radius: 12px 12px 0 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  footer-content_bottom header > ui,
  footer-content_bottom header > [data-tag="ui"],
  footer-content_bottom header > div,
  [data-tag="footer-content_bottom"] header > div {
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: 700 !important;
    font-size: 0.95em !important;
    background: var(--ea-sv-sombra-azul, rgb(21, 74, 143)) !important;
    background-color: rgb(21, 74, 143) !important;
    color: var(--ea-sv-azul-bebe, rgb(183, 213, 229)) !important;
    border-radius: 8px !important;
    text-transform: uppercase !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  signatures,
  [data-tag="signatures"],
  [tag="signatures"] {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: flex-end !important;
    gap: 2rem !important;
    padding: 2.5rem 2rem 1.5rem !important;
    width: 100% !important;
  }

  signature,
  [data-tag="signature"],
  [tag="signature"] {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    border-top: 1px solid #94a3b8 !important;
    padding-top: 0.5rem !important;
  }

  sig-name,
  [data-tag="sig-name"],
  [tag="sig-name"] {
    font-size: 0.85rem !important;
    font-weight: 700 !important;
    color: #1e293b !important;
  }

  /* ==========================================================================
     REGRAS ESPECÍFICAS DE IMPRESSÃO (@media print)
     ========================================================================== */
  @media print {
    /* 1. ELIMINAR INTERFACE, OVERLAYS, GAVETAS E TOASTERS */
    [data-vaul-overlay],
    [data-slot="drawer-overlay"],
    [data-vaul-drawer],
    [data-slot="drawer-content"],
    [data-slot="drawer-portal"],
    [data-radix-portal],
    [data-radix-overlay],
    [role="dialog"],
    [role="alertdialog"],
    .fixed.inset-0,
    div[class*="bg-black"],
    div[class*="backdrop"],
    .drawer-overlay,
    [data-sonner-toaster],
    [data-sonner-toast],
    .toaster,
    #sonner-toaster,
    .no-print,
    .print\\:hidden,
    [class*="no-print"],
    [class*="print:hidden"],
    header[data-slot="painel-appbar"],
    header.sticky,
    nav.bottom-nav,
    .fab-container,
    button:not(.allow-print),
    .toast {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      top: -99999px !important;
      left: -99999px !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
    }

    body {
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #000000 !important;
      font-size: 10pt !important;
      line-height: 1.4 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* PREVENÇÃO DE QUEBRA NO MEIO DE BLOCOS INDIVISÍVEIS */
    page-header,
    ea-card-novo,
    .ea_card_novo,
    doc-title,
    cliente-section,
    clause-header,
    subclause-header,
    signatures,
    signature,
    .avoid-page-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Cabeçalhos de cláusulas e subcláusulas nunca devem ficar sozinhos no fim da folha */
    clause-header,
    subclause-header {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    /* Permite quebra suave do corpo das cláusulas entre páginas */
    budget-body,
    clause,
    clause-content,
    subclause,
    subclause-body,
    .markdown-rendered-content {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    /* Assinaturas sempre juntas */
    signatures {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`;
