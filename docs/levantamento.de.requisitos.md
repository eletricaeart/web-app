# Levantamento de Requisitos e Análise de Mercado

Este documento tem como objetivo analisar o posicionamento do sistema **Elétrica & Art (E&A) - Gestão e Orçamentos** em relação aos principais aplicativos e sistemas do mercado nacional voltados para eletricistas, empreiteiros e prestadores de serviços.

Através da pesquisa e validação com soluções como _Voltix Pro_, _Meu Ajudante_, _ConstruFácil_ e _MeuTrampo_, levantamos os pontos fortes do nosso aplicativo, bem como as necessidades latentes desse público que devemos priorizar nas próximas atualizações.

---

## 1. Análise Comparativa do Nosso Sistema (Elétrica & Art)

### ✅ Pontos Positivos (O que o nosso app já faz bem e o público ama)

- **Editor de Texto Rico (TipTap)**: Diferente da maioria dos apps que oferecem apenas campos de texto simples para descrições, nosso aplicativo fornece um editor visual robusto, permitindo formatações avançadas, negrito, listas e estruturação de cláusulas impecáveis para propostas comerciais.
- **Sincronização em Nuvem e Equipe (Supabase)**: A arquitetura baseada no `useEASyncSupabase` e o gerenciamento de múltiplos usuários na seção "Equipe" são diferenciais enormes. Muitos apps concorrentes são _offline-first_ restritos a um único dispositivo ou exigem planos caríssimos para acesso multi-usuário.
- **UI/UX Moderna e Fluida**: O uso de componentes modernos, painel interativo (ex: _Drawer_ de investimentos que bloqueia scroll), botões de ação flutuantes e interface limpa diminuem a curva de aprendizado e passam uma imagem extremamente profissional.
- **Ferramentas Técnicas Integradas**: A iniciativa de ter a calculadora de _Drywall_ no mesmo app de gestão mostra um potencial gigante de reter o profissional que não quer usar 3 ou 4 apps diferentes no dia a dia.

### ❌ Pontos Negativos / Dores Atuais (O que nos falta no momento)

- **Falta de Exportação Nativa Rápida**: Eletricistas precisam fechar orçamentos no local da obra. O aplicativo precisa urgentemente de um botão de 1 clique para "Gerar PDF Profissional" e "Enviar por WhatsApp".
- **Integração do Catálogo com o Orçamento**: A seção de "Serviços e Insumos" foi criada, mas a montagem do orçamento ainda precisa da funcionalidade de "Puxar" do catálogo, calculando totais automaticamente.
- **Falta de Organização por Cômodos**: Na área elétrica, a precificação frequentemente se dá por ambiente (Sala, Cozinha, Quarto). Atualmente a estrutura é puramente por seções genéricas.

---

## 2. Requisitos e Funcionalidades que Precisamos Implementar

Para dominar o nicho de instalações elétricas e obras, os fóruns e a concorrência indicam que as seguintes _features_ são cruciais:

### Prioridade Alta (Imediato)

1. **Importação do Catálogo para o Orçamento**:
   - Possibilidade de selecionar múltiplos itens da nova tela de "Serviços e Insumos" diretamente no painel de criação do orçamento.
   - Cálculo automático de Custos Base x Margem de Lucro.
2. **Geração de PDF Personalizado**:
   - Layout customizável onde o logotipo da empresa ("Elétrica & Art") fique no topo.
   - Assinatura digital do cliente e do eletricista no rodapé do documento.
3. **Botão Compartilhar via WhatsApp**:
   - Gerar um resumo em texto e anexar o link/PDF da proposta enviando diretamente para o número do cliente cadastrado.

### Prioridade Média (Diferenciais Competitivos)

4. **Calculadoras Elétricas Técnicas**:
   - Adicionar ao menu "Ferramentas Técnicas" utilitários como: _Cálculo de Queda de Tensão_, _Dimensionamento de Disjuntores e Condutores_ e _Cálculo de Iluminância_. Isso fideliza o eletricista ao app.
5. **Orçamentação "Por Ponto" ou "Por Metro Quadrado"**:
   - Permitir a criação de um serviço chamado "Instalação de Tomada Simples" cobrado _por ponto_. O profissional só insere "15 pontos" e o app calcula material + mão de obra necessários.
6. **Agrupamento de Materiais por Cômodo**:
   - Na listagem de insumos, permitir dividir por "Quarto 1", "Quadro de Distribuição", "Jardim", evitando confusão na hora de executar a obra ou entregar materiais.

### Prioridade Baixa (Fidelização e Expansão)

7. **Fotos e Evidências da Obra no Orçamento**:
   - Os clientes aprovam mais rápido orçamentos que mostram o problema. O app poderia permitir tirar uma foto do "Quadro de força antigo" e incluir no documento como "Situação Atual".
8. **Controle Simplificado de Estoque**:
   - Ao aprovar um orçamento que consome 100m de cabo 2.5mm, descontar de um "Estoque Virtual" ou gerar uma "Lista de Compras" separada automaticamente para o profissional levar à loja de material de construção.

---

## 3. Conclusão

A base do aplicativo Elétrica & Art é tecnologicamente superior à média do mercado devido à stack moderna e sincronização real-time. A introdução da área de **Serviços e Insumos** (Catálogo Base) foi o passo fundamental.

O próximo grande salto será **amarrar** esse catálogo ao gerador de orçamentos e implementar a exportação/compartilhamento rápido, transformando o sistema em uma ferramenta imbatível para fechamento de obras _on-the-go_.

---

## 4. Validação de Novas Ideias (Brainstorming)

Durante o planejamento, levantamos 3 ideias fortes de inovação. Abaixo está a validação (Pontos Fortes, Fracos e Recepção do Público):

### Ideia 1: Geração de Orçamentos via IA (Inteligência Artificial)

- **O que é**: O usuário fornece um input (texto livre ou áudio/voz, ex: "Refazer toda a elétrica de um apê de 2 quartos") e a IA monta o orçamento completo com base na estrutura real do sistema.
- **Especificações Validadas**:
  - **Persona Técnica**: A IA atua como um técnico especialista em instalações e projetos elétricos da empresa cadastrada (ex: Elétrica & Art ou marca personalizada).
  - **Conhecimento da Estrutura**: A IA gera dados estruturados (JSON) compatíveis com o modelo do app (Categorias de Investimento, Cláusulas TipTap, Subcláusulas, Itens com quantidade, unidade e valor).
  - **Grounded no Catálogo**: A IA utiliza exclusivamente os _Serviços e Insumos_ previamente cadastrados no app (ou detalhados pelo usuário), evitando precificações irrealistas ou inventadas.
- **Pontos Fortes**: Funcionalidade "Killer" (diferencial absoluto). Economiza horas de digitação pós-obra. O profissional pode literalmente falar o que viu na visita e o app gera a estrutura comercial.
- **Pontos Fracos / Desafios**: Risco de "alucinação" da IA (inventar preços ou materiais que não existem). Mitigado com _Schema Enforcement_ e injeção do catálogo base no prompt.
- **Recepção do Público**: **Altíssima**. O eletricista odeia burocracia. Entregar o orçamento rápido é o que faz ele ganhar a obra. Uma IA que automatiza isso será vista como "mágica".

### Ideia 2: Tabelas, Imagens e Layouts de Colunas no Editor TipTap

- **O que é**: Recursos avançados de edição visual direto nas cláusulas e propostas comerciais.
- **Especificações Validadas**:
  - **Imagens com Menu Flutuante**: Imagens salvas via Cloudinary; ao clicar na imagem, abre um menu flutuante sobreposto permitindo substituir a imagem, redimensionar e alinhar (esquerda, centro, direita).
  - **Tabelas Seguras (2 a 3 colunas)**: Regras e limites para não contorcer o layout no mobile, ideais para quadros de cargas, cronogramas e quantitativos.
  - **Seções em 2 Colunas**: Blocos de layout lado a lado para apresentar propostas comparativas (ex: Opção Básica vs. Opção Premium com cabeamento antichama).
- **Pontos Fortes**: Eleva o nível técnico da proposta. Permite inserir evidências fotográficas do local da obra e opções comparativas que aumentam o ticket médio.
- **Pontos Fracos / Desafios**: Manipulação mobile de tabelas. Exigirá controles simplificados e botões de ação touch-friendly.
- **Recepção do Público**: **Muito Alta** (especialmente para eletricistas comerciais/prediais e propostas de alto padrão).

### Ideia 3: Componentização Global do Editor TipTap

- **O que é**: Padronizar o uso do componente TipTapEditor em todo o app (Anotações de Clientes, Descrição de Serviços no Catálogo, Termos de Recibo, etc).
- **Pontos Fortes**: Manutenibilidade de código excelente. O usuário tem a mesma experiência de formatação rica (negrito, listas) em qualquer lugar que exija texto longo.
- **Pontos Fracos / Desafios**: Ocupa mais espaço em tela do que um simples campo de texto (textarea) e pode ser "exagero" para anotações muito curtas.
- **Recepção do Público**: **Positiva (Transparente)**. O usuário não sabe o que é "componentização", mas ele sente que o app é "Premium" e consistente em todas as telas, aumentando a percepção de valor da ferramenta.

---

## 5. Padrão Visual e Arquitetura de Layout (Modernização UI/UX)

- **AppBar Unificada (Estilo Home)**:
  - Todas as páginas agora adotam a barra superior moderna (fundo suave translúcido `bg-slate-50/90 backdrop-blur-md`, bordas sutis).
  - Suporte inteligente a botão de voltar (`backAction`) com ícone elegante quando a tela não for a Home.
  - **Avatar com Menu Dropdown**: Ao clicar no avatar do usuário no topo da AppBar, abre um menu flutuante (Popover/Dropdown) com acesso a: _Meu Perfil_, _Configurações_, _Alternar Modo_ e _Sair da Conta_.
- **Título da Página no Corpo**:
  - O título da tela agora fica posicionado no topo esquerdo do corpo da página (tipografia de destaque, subtítulo contextual e hierarquia limpa).
- **Ações e Menu Kebab (3 Pontos)**:
  - O menu kebab de ações específicas da página fica posicionado à direita da linha do título da própria página, criando uma relação direta de contexto (ex: "Excluir", "Duplicar", "Imprimir" ao lado do título daquele documento).
