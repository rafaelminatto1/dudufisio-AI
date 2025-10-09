# Guia de Configuração das Integrações

Este documento descreve como configurar as integrações com Sentry, Checkly, Clerk e Groq no projeto DuduFisio AI.

## 📋 Pré-requisitos

1. Contas criadas nos serviços:
   - [Sentry](https://sentry.io)
   - [Checkly](https://checkly.com)
   - [Clerk](https://clerk.com)
   - [Groq](https://console.groq.com)

2. Vercel CLI instalado e logado:
   ```bash
   npm i -g vercel
   vercel login
   ```

## 🔧 Configuração das Variáveis de Ambiente

### 1. Arquivo Local (.env.local)

Copie o arquivo `.env.example` para `.env.local` e preencha as variáveis:

```bash
cp .env.example .env.local
```

### 2. Sentry

1. Crie um projeto no Sentry
2. Obtenha o DSN do projeto
3. Configure as variáveis:
   - `VITE_SENTRY_DSN`: DSN do projeto
   - `VITE_SENTRY_ORG`: Nome da organização
   - `VITE_SENTRY_PROJECT`: Nome do projeto
   - `SENTRY_AUTH_TOKEN`: Token de autenticação

### 3. Clerk

1. Crie uma aplicação no Clerk
2. Configure as variáveis:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Chave pública
   - `CLERK_SECRET_KEY`: Chave secreta

### 4. Groq

1. Obtenha uma API key no console do Groq
2. Configure:
   - `VITE_GROQ_API_KEY`: Sua API key

### 5. Checkly

1. Crie uma conta no Checkly
2. Obtenha as credenciais:
   - `CHECKLY_API_KEY`: API key
   - `CHECKLY_ACCOUNT_ID`: ID da conta

## 🚀 Deploy no Vercel

### Configuração Automática

Execute o script para configurar as variáveis no Vercel:

```bash
npm run setup-vercel-env
```

### Configuração Manual

Acesse o painel do Vercel e configure as variáveis de ambiente manualmente:

1. Vá para o projeto no Vercel Dashboard
2. Acesse Settings > Environment Variables
3. Adicione todas as variáveis necessárias

## 🔍 Testando as Integrações

### Sentry
- Erros serão automaticamente reportados
- Acesse o dashboard do Sentry para ver os relatórios

### Clerk
- Use o componente `UserButton` para testar a autenticação
- Importe: `import { UserButton } from '@/components/auth/UserButton'`

### Groq
- Use o componente `GroqChat` para testar a API
- Importe: `import { GroqChat } from '@/components/ai/GroqChat'`

### Checkly
- Execute os testes localmente:
  ```bash
  npm run checkly:test
  ```
- Deploy dos checks:
  ```bash
  npm run checkly:deploy
  ```

## 📁 Estrutura dos Arquivos

```
├── lib/
│   ├── sentry.ts          # Configuração do Sentry
│   └── clerk.ts           # Configuração do Clerk
├── services/
│   └── groqService.ts     # Serviço do Groq
├── components/
│   ├── auth/
│   │   ├── ClerkWrapper.tsx
│   │   └── UserButton.tsx
│   └── ai/
│       └── GroqChat.tsx
├── checkly/
│   ├── api.check.ts       # Checks de API
│   ├── browser.check.ts   # Checks de browser
│   ├── homepage.spec.ts   # Teste da homepage
│   └── login.spec.ts      # Teste de login
└── checkly.config.ts      # Configuração do Checkly
```

## 🛠️ Comandos Úteis

```bash
# Configurar variáveis no Vercel
npm run setup-vercel-env

# Testar Checkly localmente
npm run checkly:test

# Deploy dos checks do Checkly
npm run checkly:deploy

# Build com Sentry
npm run build

# Deploy completo
npm run deploy
```

## 🔧 Troubleshooting

### Sentry não está capturando erros
- Verifique se `VITE_SENTRY_DSN` está configurado
- Confirme se o domínio está na lista de origens permitidas

### Clerk não carrega
- Verifique se `VITE_CLERK_PUBLISHABLE_KEY` está correto
- Confirme se o domínio está configurado no Clerk Dashboard

### Groq retorna erro
- Verifique se `VITE_GROQ_API_KEY` está válida
- Confirme se há créditos disponíveis na conta

### Checkly falha nos testes
- Verifique se as URLs estão acessíveis
- Confirme se as variáveis de ambiente estão configuradas

## 📚 Documentação Adicional

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Clerk React Documentation](https://clerk.com/docs/quickstarts/react)
- [Groq API Documentation](https://console.groq.com/docs)
- [Checkly Documentation](https://www.checklyhq.com/docs/)
