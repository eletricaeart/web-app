# 📋 Checklist

### clientes

- [ ] preencher com mais detalhes a pagina de perfil do cliente
- [ ] corrigir a sombra na parte de cima do card principal
- [ ] testar e implementar as funções de criar novos orçamentos e notas pela pagina de perfil do cliente

### orçamentos

### notas

- [ ] implementar a pagina de nova nota
- [ ] criar a pagina de visualização da nota

### equipe

- [ ] criar a pagina de criação de novo membro, o membro será adicionado na aba de usuarios em gs e terá um login baseado na propriedade "role"
- [ ] implementar a pagina de listagem de membros da equipe com funcionalidades de banimento, deletar, editar, dar permissões e seguir os padrões do que já existe comercialmente por ai na industria

### login/signup

- [ ] criar a pagina e o sistema de resgistrar um login com paginas e rotas especificas, o novo login criado será enviado para o aceite para os usuarios com "role" admin, e só após o aceite o novo login de usuario será cadastrado na aba de usuarios em gs e só funcionará de forma efetiva para se logar ao sistema após o aceite, o registro pode ser feito por formas modernas como cadastrar uma conta atraves do facebook ou google ou email ou telefone

### pagina de configurações

- [ ] criar a pagina, deve ter opções de modo escuro e modo claro com suport para temas

### mensagens

- [ ] criar a pagina de mensagem para cada usuario, seguindo o padrão que ha por aí

### componentes

- [ ] ajustar os botões da appbar para terem um fundo e dar mais visibilidade para os botões em telas onde a appbar não tiver fundo

---
# O Plano de Implementação para precificar o orçamento
--- Para não bagunçar seu código de uma vez, vamos fazer em 3 passos:

### Passo 1: Atualizar o ClauseManager
- [ ] Vou te ajudar a adicionar um pequeno input de "Valor (R$)" em cada item que você cria. Assim, enquanto você descreve o serviço, já pode colocar o preço ali do lado.

### Passo 2: Criar o "Painel Financeiro" no final da página
- [ ] Um componente bonito, estilo card, que fica fixo antes do botão "Salvar". Ele vai mostrar o subtotal automático e o campo de desconto.

### Passo 3: Ajustar a Visualização (Página do Orçamento)
- [ ] Vamos configurar o PDF para que, se houver valores nos itens, ele crie uma coluninha de preços organizada.
