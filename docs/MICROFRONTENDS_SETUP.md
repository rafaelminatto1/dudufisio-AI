# MoocaFisio - Microfrontends Setup Guide

## Arquitetura

Este projeto foi reestruturado em uma arquitetura de microfrontends usando Vite Module Federation:

```
├── packages/
│   ├── host/              → Shell principal (Auth + Rotas)
│   ├── agenda-pacientes/  → Agenda + Gestão de Pacientes
│   ├── tratamentos/       → Acompanhamento + Tratamentos
│   └── financeiro/        → Dashboard Financeiro + Analytics
└── shared/                → Código compartilhado
```

## Desenvolvimento Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Todos os Microfrontends

Em terminais separados, execute:

```bash
# Terminal 1 - Host (porta 5173)
cd packages/host
npm run dev

# Terminal 2 - Agenda & Pacientes (porta 5174)
cd packages/agenda-pacientes
npm run dev

# Terminal 3 - Tratamentos (porta 5175)
cd packages/tratamentos
npm run dev

# Terminal 4 - Financeiro (porta 5176)
cd packages/financeiro
npm run dev
```

### 3. Acessar a Aplicação

Abra http://localhost:5173 no navegador (host).

## Deploy no Vercel

### Opção 1: Via Vercel Dashboard

1. Acesse https://vercel.com e faça login
2. Para cada package, crie um novo projeto:
   - **moocafisio-host** → `/packages/host`
   - **moocafisio-agenda** → `/packages/agenda-pacientes`
   - **moocafisio-tratamentos** → `/packages/tratamentos`
   - **moocafisio-financeiro** → `/packages/financeiro`

3. Configure as seguintes settings para cada projeto:
   - Root Directory: `packages/[nome-do-package]`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Opção 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy cada package
cd packages/host
vercel --prod

cd ../agenda-pacientes
vercel --prod

cd ../tratamentos
vercel --prod

cd ../financeiro
vercel --prod
```

### Configurar URLs de Produção

Após o deploy, você receberá as URLs de cada microfrontend. Configure no projeto host:

1. No Vercel Dashboard do projeto **moocafisio-host**
2. Vá em Settings → Environment Variables
3. Adicione:
   - `VITE_AGENDA_PACIENTES_URL` = https://moocafisio-agenda.vercel.app
   - `VITE_TRATAMENTOS_URL` = https://moocafisio-tratamentos.vercel.app
   - `VITE_FINANCEIRO_URL` = https://moocafisio-financeiro.vercel.app

4. Redeploy o host para aplicar as mudanças

### Atualizar vite.config.ts do Host

Edite `packages/host/vite.config.ts` para usar variáveis de ambiente em produção:

```typescript
remotes: {
  agendaPacientes: import.meta.env.PROD 
    ? process.env.VITE_AGENDA_PACIENTES_URL + '/assets/remoteEntry.js'
    : 'http://localhost:5174/assets/remoteEntry.js',
  // ... etc
}
```

## Estrutura de Builds

Cada microfrontend:
- Build independente (paralelizável)
- Deploy independente
- Cache independente
- Versionamento independente

## Benefícios

✅ Build 4x mais rápido (paralelo)
✅ Deploy por módulo (sem rebuild completo)
✅ Equipes podem trabalhar isoladamente
✅ Melhor cache e lazy loading
✅ Bundle size inicial menor

## Troubleshooting

### Erro CORS

Se houver erros de CORS, verifique que os remotes têm headers corretos no `vercel.json`.

### Remote não carrega

Certifique-se que todos os remotes estão rodando localmente ou deployed em produção.

### Build Failure

Execute `npm install` na raiz e em cada package individual.

## Scripts Úteis

```bash
# Instalar todas as dependências
npm install

# Build de todos os packages
npm run build:all

# Limpar node_modules
npm run clean
```

