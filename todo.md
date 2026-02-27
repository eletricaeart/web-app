# 📋 Checklist de Migração: Elétrica & Art (Next.js Edition)

### 🟢 Etapa 1: Setup e Infraestrutura

<!-- - [ ] Criar novo repositório no GitHub. -->
<!-- - [ ] Inicializar projeto Next.js com `pnpm` e TypeScript. -->
<!-- - [ ] Configurar variáveis de ambiente (`.env.local`) para proteger o GAS. -->
<!-- - [ ] Configurar Absolute Imports e Path Aliases (`@/*`). -->
<!-- - [ ] Integrar Shadcn/UI (versão oficial para Next.js). -->

### 🟡 Etapa 2: Core de Autenticação (Server Side)

<!-- - [ ] Criar API Route para Login (`/api/auth`). -->
<!-- - [ ] Implementar Middleware de proteção de rotas. -->
<!-- - [ ] Configurar sessão segura (JWT ou Cookies persistentes). -->

### 🟡 Etapa 3: Camada de Dados (O novo "EASync")

<!-- - [ ] Criar Route Handlers genéricos para as entidades (Orçamentos, Clientes, Notas). -->
<!-- - [ ] Implementar validação de esquemas com **Zod** (para aproveitar o TypeScript). -->

### 🔴 Etapa 4: Migração de Telas (UI/UX)

<!-- - [ ] Refatorar Dashboard (Home). -->

- [ ] Migrar Fluxo de Clientes.
- [ ] Migrar Fluxo de Orçamentos.
- [ ] Migrar Fluxo de Notas.

### 🔴 Etapa 5: O Motor de PDF (Puppeteer)

- [ ] Criar rota exclusiva para renderização de impressão.
- [ ] Implementar Server Action para gerar PDF via Puppeteer.
- [ ] Configurar fluxo de compartilhamento.

---

### 🚀 Mão na Massa: Passo 1

Abra seu terminal na pasta onde ficam seus projetos e execute o comando abaixo com `pnpm`:

Bash

`pnpm create next-app@latest eletrica-art-next`

**Configurações para o Prompt:**

1. **TypeScript?** Yes (Com certeza!)
2. **ESLint?** Yes
3. **Tailwind CSS?** Yes
4. **`src/` directory?** Yes
5. **App Router?** Yes
6. **Customize import alias?** Yes (Deixe `@/*`)

---

### 🔐 Passo 2: Protegendo os Segredos

Dentro da raiz do projeto, crie o arquivo `.env.local`. Nele, vamos colocar a URL da sua nova planilha (o clone que você vai fazer agora).

Snippet de código

`# .env.local

# O Next.js NÃO envia essas variáveis para o navegador se não tiver NEXT*PUBLIC*

GAS_MASTER_URL="SUA_URL_DO_GOOGLE_SCRIPT_AQUI"
APP_URL="http://localhost:3000"`
