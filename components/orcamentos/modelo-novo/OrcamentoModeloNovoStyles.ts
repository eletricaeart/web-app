// components/orcamentos/modelo-novo/OrcamentoModeloNovoStyles.ts
/**
 * Folha de estilos unificada exportada como string para impressão dinâmica e exportação de PDF.
 * Inclui proteção rigorosa contra overlays, backdrops escuros, gavetas e mensagens do Sonner.
 */
export const OrcamentoModeloNovoStyles = `
  :root {
    --ea-bg: #f5f5f5;
    --ea-ceo-golden: #daa520;
    --ea-ceo-amber: #ffab00;
    --ea-ceo-blue: #2277ff;
    --ea-sv-calopsita: rgb(219, 218, 215);
    --ea-sv-cromio: rgb(209, 208, 202);
    --ea-sv-azul-bebe: rgb(183, 213, 229);
    --ea-sv-marine: rgb(125, 136, 187);
    --ea-sv-beija-flor: rgb(61, 88, 132);
    --ea-sv-sodalita: rgb(86, 108, 155);
    --ea-sv-sombra-azul: rgb(21, 74, 143);
    --ea-blue-dark: #003b6b;
    --ea-blue-accent: #00559c;
  }

  @media print {
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

    /* 1. ELIMINAR PELÍCULAS ESCURAS, GAVETAS, OVERLAYS E DIÁLOGOS */
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
    .drawer-overlay {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      background: transparent !important;
      pointer-events: none !important;
    }

    /* 2. ELIMINAR SONNER TOASTER (MENSAGENS FLUTUANTES) */
    [data-sonner-toaster],
    [data-sonner-toast],
    .toaster,
    #sonner-toaster,
    [data-sonner-toaster] *,
    div[data-sonner-toaster] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* 3. ELIMINAR ELEMENTOS DA INTERFACE DA APLICAÇÃO (APPBAR, MENUS, BOTÕES) */
    .no-print,
    .print\\:hidden,
    [class*="no-print"],
    [class*="print:hidden"],
    header[data-slot="painel-appbar"],
    header.sticky,
    header[class*="sticky"],
    header[class*="backdrop-blur"],
    header.fixed,
    .app-bar,
    app-bar,
    nav.bottom-nav,
    .fab-container,
    button,
    .toast {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      top: -99999px !important;
      left: -99999px !important;
      pointer-events: none !important;
    }

    /* 4. LIMPEZA TOTAL DE FUNDO E FILTROS DO CORPO */
    html,
    body,
    [data-vaul-drawer-wrapper],
    #root,
    main {
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-size: 13px !important;
      line-height: 1.45 !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
      filter: none !important;
      transform: none !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }

    .ea-modelo-novo-root,
    budget-page {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 0 10px 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      display: block !important;
      overflow: visible !important;
    }

    /* 5. ESTRUTURA DO CABEÇALHO (EACARD E DOC-ID) */
    page-header {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 0.8rem !important;
    }

    /* Novo Card de Cabeçalho (altura reduzida em 25% e logo proporcional) */
    ea-card-novo,
    .ea_card_novo {
      display: grid !important;
      grid-template-columns: 0.26fr 0.74fr !important;
      width: 100% !important;
      aspect-ratio: 5.07 / 1 !important;
      min-height: 135px !important;
      max-height: 155px !important;
      padding: 1cqw 2cqw !important;
      margin: 0 !important;
      margin-bottom: 0 !important;
      box-sizing: border-box !important;
      background-image: url('https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png') !important;
      background-color: rgba(10, 15, 25, 0.9) !important;
      background-size: cover !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      border-radius: 1rem 1rem 0.25rem 0.25rem !important;
      color: #f5f5f5 !important;
      overflow: hidden !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
    }

    .logoAreaNovo {
      display: flex !important;
      height: 100% !important;
      aspect-ratio: 1 !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0.5cqw !important;
    }

    .logoImgNovo {
      height: 86% !important;
      width: auto !important;
      max-width: 90% !important;
      aspect-ratio: 1 !important;
      border-radius: 100vw !important;
      object-fit: contain !important;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) !important;
    }

    .descriptionNovo {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      color: #f5f5f5 !important;
      padding: 0 4px !important;
    }

    .eaNameNovo {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
    }

    .nameImgNovo {
      width: 100% !important;
      max-width: 300px !important;
      height: auto !important;
      object-fit: contain !important;
      margin-bottom: 2px !important;
      display: block !important;
    }

    .cnpjTextNovo {
      font-size: 11px !important;
      font-weight: bold !important;
      color: #ffffff !important;
      display: block !important;
      line-height: 1.2 !important;
    }

    .addressTextNovo {
      font-size: 10px !important;
      margin: 1.5px 0 !important;
      color: #f1f5f9 !important;
      line-height: 1.2 !important;
    }

    .contactsAreaNovo,
    .contactLinkNovo {
      font-size: 10px !important;
      color: #f8fafc !important;
      line-height: 1.22 !important;
      text-decoration: none !important;
    }

    .contactLinkNovo strong {
      color: #ffffff !important;
    }

    ea-card,
    .ea_card,
    .card {
      display: grid !important;
      grid-template-columns: 0.30fr 0.70fr !important;
      width: 100% !important;
      aspect-ratio: 3.8 / 1 !important;
      padding: 1.5cqw 2cqw !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      background-image: url('https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png') !important;
      background-color: rgba(10, 15, 25, 0.9) !important;
      background-size: cover !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      border-radius: 1rem !important;
      color: #f5f5f5 !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
    }

    .logoArea {
      display: flex !important;
      height: 100% !important;
      aspect-ratio: 1 !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 1cqw !important;
    }

    .logoImg {
      width: 100% !important;
      aspect-ratio: 1 !important;
      border-radius: 100vw !important;
      object-fit: contain !important;
    }

    .description {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      color: #f5f5f5 !important;
      font-size: 13px !important;
      line-height: 1.2 !important;
      padding: 0 4px !important;
    }

    .description span {
      font-size: 11.5px !important;
      font-weight: bold !important;
      color: #ffffff !important;
      display: block !important;
      line-height: 1.2 !important;
    }

    .description p {
      font-size: 11px !important;
      margin: 2px 0 !important;
      color: #f1f5f9 !important;
      line-height: 1.2 !important;
    }

    .description div,
    .contactLink {
      font-size: 11px !important;
      color: #f8fafc !important;
      line-height: 1.25 !important;
      text-decoration: none !important;
    }

    .contactLink strong {
      color: #ffffff !important;
    }

    .eaName {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
    }

    .nameImg {
      width: 100% !important;
      max-width: 360px !important;
      height: auto !important;
      object-fit: contain !important;
      margin-bottom: 4px !important;
      display: block !important;
    }

    /* Identificador do documento (Emissão e Validade) - Colado diretamente sob o card */
    doc-id {
      background: #ffffff !important;
      width: calc(100% - 1.5rem) !important;
      padding: 0.35em 1em !important;
      margin: -1px auto 0 auto !important;
      border-radius: 0 0 1rem 1rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 1em !important;
      border-left: 5px solid #e2e8f0 !important;
      border-right: 5px solid #e2e8f0 !important;
      border-bottom: 1px solid #e2e8f0 !important;
      border-top: none !important;
      text-transform: uppercase !important;
      color: #003b6b !important;
      box-sizing: border-box !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
      position: relative !important;
      z-index: 2 !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    doc-id span {
      display: flex !important;
      align-items: center !important;
      gap: 0.4rem !important;
      font-size: 0.68rem !important;
      color: #003b6b !important;
    }

    doc-id b {
      font-size: 0.68rem !important;
      font-weight: 700 !important;
      color: #0f172a !important;
    }

    /* Seções que não devem quebrar internamente */
    cliente-section,
    doc-title,
    tagb,
    tagc,
    .tagc,
    blockquote,
    signatures,
    signature,
    footer-content_top,
    footer-content_bottom,
    .avoid-page-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }

    /* 6. CORPO DAS CLÁUSULAS E SUBCLÁUSULAS (PERMITE QUEBRA SUAVE SEM EMPURRAR BLOCOS INTEIROS) */
    clause,
    clause > ui,
    clause-content,
    subclause,
    subclause > ui {
      display: block !important;
      width: 100% !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
      overflow: visible !important;
    }

    /* Títulos de cláusulas e subcláusulas: nunca ficam sozinhos no fim da folha */
    clause-header,
    subclause-header {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    subclause-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 4px !important;
    }

    /* O corpo da subcláusula pode começar logo abaixo do subtítulo e quebrar páginas naturalmente */
    subclause-body,
    .markdown-rendered-content {
      display: block !important;
      width: 100% !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    /* 7. LISTAS (UL, OL) E ITENS (LI) - QUEBRA NATURAL ENTRE ITENS */
    ul,
    subclause-body ul,
    .markdown-rendered-content ul {
      display: block !important;
      list-style: none !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
      margin-top: 6px !important;
      margin-bottom: 6px !important;
      padding-left: 0 !important;
    }

    ol,
    subclause-body ol,
    .markdown-rendered-content ol {
      display: block !important;
      list-style: none !important;
      counter-reset: ea-ol-counter !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
      margin-top: 6px !important;
      margin-bottom: 6px !important;
      padding-left: 0 !important;
    }

    ul > li,
    subclause-body ul > li,
    .markdown-rendered-content ul > li {
      display: block !important;
      position: relative !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-before: auto !important;
      break-after: auto !important;
      margin-bottom: 4px !important;
      padding-left: 1.4rem !important;
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
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-before: auto !important;
      break-after: auto !important;
      margin-bottom: 4px !important;
      padding-left: 1.6rem !important;
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

    /* Parágrafos e divs de texto dentro do markdown */
    subclause-body p,
    subclause-body > div:not(.tagc),
    .markdown-rendered-content p,
    .markdown-rendered-content > div:not(.tagc) {
      break-inside: auto !important;
      page-break-inside: auto !important;
      orphans: 2 !important;
      widows: 2 !important;
    }

    footer-content {
      height: auto !important;
      min-height: auto !important;
      display: block !important;
      break-before: auto !important;
      page-break-before: auto !important;
      margin-top: 10px !important;
      padding: 0 !important;
      overflow: visible !important;
    }

    signatures {
      margin-top: 1.2cm !important;
      padding: 0.5cm 1cm !important;
    }
  }
`;
