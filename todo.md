🚀 Plano de Voo: Elétrica & Art
🏁 Fase 1: Finalização do Módulo Financeiro (Prioridade Atual)
Essencial para o app começar a gerar orçamentos profissionais.

[ ] Visualização de Preços (PDF/Web): Ajustar a página orcamentos/[id] para ler os campos price e o objeto financial.

[ ] Componente de Tabela de Preços: Criar a UI que decide se mostra o preço por item ou apenas o total no final.

👥 Fase 2: Gestão de Clientes & CRM
Melhorando a experiência de quem usa o app no dia a dia.

[ ] Perfil Detalhado: Adicionar histórico de orçamentos e notas dentro da página do cliente.

[ ] Atalhos de Criação: Implementar o botão "Novo Orçamento" e "Nova Nota" direto do perfil do cliente (passando os dados via URL/Estado).

[ ] Refino Visual: Corrigir a sombra superior do card principal.

📝 Fase 3: Notas Técnicas & Documentação
Expandindo as funcionalidades para além do financeiro.

[ ] Nova Nota: Criar o formulário (reutilizando o nosso TipTapEditor e ClientForm).

[ ] View da Nota: Criar a página de leitura e compartilhamento da nota técnica.

🔐 Fase 4: Autenticação, Equipe & Segurança (O "Cérebro" Administrativo)
Aqui o app deixa de ser local e vira uma plataforma de empresa.

[ ] Sistema de Login/Signup: Fluxo de registro com aprovação pendente (Admin precisa dar o "OK").

[ ] Integração Social: Cadastro via Google/Facebook/E-mail.

[ ] Gestão de Equipe: Página de listagem de membros com controle de cargos (admin, tecnico).

[ ] Permissões (Roles): Bloquear funções específicas (ex: excluir orçamento) apenas para admins.

⚙️ Fase 5: Configurações & UX Final
O toque final de profissionalismo.

[ ] Temas: Implementar Dark/Light mode com persistência.

[ ] AppBar Reutilizável: Ajustar botões para terem fundo em telas claras/transparentes.

[ ] Mensagens Internas: Sistema de comunicação entre membros da equipe.

🛠️ Passo a Passo para Hoje
Como ontem terminamos o Passo 1 e o Passo 2 do plano de precificação (inputs e painel financeiro), o nosso próximo passo imediato é:

Próxima Tarefa: Ajustar a Visualização (Página do Orçamento)
Precisamos fazer com que os valores apareçam no "PDF" (a página de visualização).

O que faremos:

Atualizar o mapeamento de dados na página de visualização para identificar os novos campos.

Criar uma lógica de "Tabela de Itens" onde, se houver preço, ele aparece alinhado à direita.

Exibir o Resumo Financeiro (Subtotal, Desconto e Total) de forma elegante no rodapé do documento.
