# Relatório Técnico & Análise Crítica: Calculadora de Drywall (Versão Completa)

---

## 1. Visão Geral da Arquitetura e Estrutura

A **Calculadora de Drywall (Versão Completa)** foi concebida com base em um fluxo estruturado por **Ambientes (Cômodos)** e **Serviços Individuais (Paredes e Forros)**, separando o cálculo por seções e consolidando a lista de compras final.

### Estrutura de Arquivos e Componentes:

- **Interface Principal**: `components/painel/ferramentas/DrywallPainel.tsx`
- **Mecanismo de Parede**: `utils/calculators/drywallWall.ts`
- **Mecanismo de Forro**: `utils/calculators/drywallCeiling.ts`
- **Estilização**: `components/painel/ferramentas/Drywall.css` e classes utilitárias do Tailwind CSS.
- **Exportação/Compartilhamento**: Gerador de relatório em texto puro formatado para WhatsApp (`wa.me`) e Web Share API.

---

## 2. Recepção pela Comunidade (Gesseiros, Empreiteiros e Montadores)

### Pontos Fortes (Prós)

1. **Estrutura por Cômodos/Ambientes (Fluxo Real de Obra)**:
   - Profissionais de obra orçam por cômodo (ex: _Sala de Estar_, _Suíte_, _Corredor_). Ter a separação de materiais por ambiente facilita a conferência da entrega e o controle de estoque em campo.
2. **Consolidação Automática da Lista de Compras**:
   - Ao invés de somar no papel o que cada cômodo gasta, o sistema gera a **Lista Geral Unificada**, somando barras e caixas de parafusos arredondadas para cima com margem de segurança.
3. **Desconto Real de Vãos (Portas e Janelas)**:
   - A inclusão de aberturas desconta a área de placas e adiciona os montantes adicionais de reforço/emolduramento nos batentes (+2 montantes por vão).
4. **Isolamento Termoacústico (Lã de Vidro / Lã de PET)**:
   - O toggle rápido adiciona o quantitativo exato de m² de isolamento para paredes com tratamento acústico.
5. **Compartilhamento Rápido no WhatsApp**:
   - Gera uma mensagem limpa com quebras de linha e negritos corretos (`*ITEM*`), pronta para envio ao distribuidor ou cliente final.

---

### ⚠️ Pontos Fracos (Contras)

1. **Falta de Seleção do Tipo de Chapa (ST / RU / RF)**:
   - O cálculo assume sempre chapa **ST (Standard)**. Em banheiros e cozinhas o gesseiro precisa de chapa **RU (Verde - Resistente à Umidade)** e em áreas de proteção contra incêndio chapa **RF (Rosa)**.
2. **Estrutura Metálica Fixa em 48mm**:
   - Apenas menciona Guia/Montante de 48mm. Obras corporativas e divisórias acústicas utilizam frequentemente perfis de **70mm** e **90mm**.
3. **Falta de Configuração do Espaçamento dos Montantes (40cm vs 60cm)**:
   - O padrão está fixado em 60cm. Paredes que receberão revestimento cerâmico pesado ou pé-direito elevado exigem espaçamento de **40cm** (ou 30cm) conforme a NBR 15758.
4. **Inexistência de Opção de Chapeamento Duplo (W112 / W115)**:
   - Não há suporte nativo para paredes com 2 chapas por face (isolamento acústico de alto desempenho).
5. **Sem Conversão para Valores Financeiros (R$)**:
   - Não calcula estimativa de custo nem gera botão de "Gerar Orçamento / Ordem de Serviço" integrada ao sistema principal.

---

## 3. Bugs, Defeitos e Inconsistências Técnicas Encontradas

### 🐛 Bug 1: Aberturas Hardcoded no Primeiro Elemento de Medidas

- **Local**: `DrywallPainel.tsx` linhas 96-105 e 804-856.
- **Problema**: A função `addOpening(measureIndex, type)` possui `newMeasures[0].openings.push(...)` com o índice `0` fixo em código. Se o usuário adicionar uma segunda medida para paredes irregulares, as portas e janelas são adicionadas e alteradas apenas na primeira medida.

### 🐛 Bug 2: Ausência de Persistência Local (LocalStorage ou Banco)

- **Problema**: O estado dos ambientes (`rooms`) reside unicamente no `useState` da memória RAM. Se o usuário fechar a aba, recarregar o navegador ou alternar rotas, perde todo o levantamento de múltiplos cômodos já cadastrados.

### ⚠️ Bug 3: Cálculo Linear vs. Desperdício em Alturas Maiores que 3,00m

- **Local**: `drywallWall.ts` linhas 56 e 65.
- **Problema**: A fórmula soma metros lineares totais e divide por 3m: `(totalStudsLinearMeters / 3) * 1.05`. Se o pé-direito for de 3,20m, uma barra de 3,00m não alcança o teto sem emenda de montante (tala de união). Uma barra de 3m geraria 0,20m de perda se não houver emenda, tornando a margem de 5% insuficiente em pés-direitos altos.

### ⚠️ Bug 4: Forro — Fixações e Espaçamento de Reguladores

- **Local**: `drywallCeiling.ts` linhas 28-33 e 52-54.
- **Problema**:
  - Para o perfil F530, calcula `maiorLado / 0.60`. Porém, tirantes e reguladores de forro estruturado são calculados pela norma a cada 1,20m de distância entre pontos de sustentação ao longo do perfil F530 (~1,2 a 1,5 unidades por m²). O multiplicador `totalArea * 2` pode superestimar tirantes em grandes vãos.
  - Não inclui **Emenda para Perfil F530** (conector longitudinal para barras de 3m).

### 📝 Bug 5: Terminologia Técnica no Relatório

- **Parafuso Lentilha**: No padrão ABNT / Drywall brasileiro, o nome normativo é **Parafuso LB 9,5 (ou ponta broca/agulha)**.
- **Fita Banda Acústica**: A norma NBR 15758 exige fita banda acústica em todo o perímetro de guias em contato com piso, teto e alvenaria; este item não é listado na lista completa de materiais.

---

## 4. Análise de Design, UI e Experiência do Usuário (UX)

| Aspecto                   | Avaliação  | Diagnóstico                                                                                                |
| :------------------------ | :--------: | :--------------------------------------------------------------------------------------------------------- |
| **Hierarquia Visual**     | ⭐⭐⭐⭐☆  | Cards claros, separação por cores de ícones (Laranja para portas, Azul para janelas, Índigo para medidas). |
| **Responsividade Mobile** | ⭐⭐⭐⭐☆  | Drawer SPA fullscreen funciona de forma fluida no celular com teclado aberto.                              |
| **Feedback de Ações**     | ⭐⭐⭐⭐⭐ | Toasts descritivos para adição, edição e exclusão de ambientes e serviços.                                 |
| **Acessibilidade do FAB** | ⭐⭐⭐⭐⭐ | FAB elevado livre da Bottom Navigation Dock após a correção do `hasBottomNav`.                             |
| **Visor em Tempo Real**   | ⭐⭐⭐⭐⭐ | Visor dinâmico de m² líquido com atualização instantânea ao digitar medidas.                               |

---

## 5. Recomendações e Próximos Passos de Evolução

1. **Correção Imediata do Bug de Vãos**: Parametrizar `openings` com o índice real da medida selecionada (`measureIndex`).
2. **Adicionar Persistência com LocalStorage**: Salvar automaticamente o rascunho de `rooms` para evitar perda de dados.
3. **Seletor de Tipo de Placa (ST / RU / RF)**: Permitir que cada serviço escolha a chapa correta (separando na lista de materiais: ex. 12x Placas ST e 6x Placas RU).
4. **Seletor de Espaçamento dos Montantes**: Opção entre **400mm** (para cerâmica/revestimentos pesados) e **600mm** (padrão).
5. **Botão de Exportar para Orçamento**: Integrar diretamente com a aba de _Orçamentos_ do aplicativo, transformando a lista de materiais em itens de proposta com 1 clique.
