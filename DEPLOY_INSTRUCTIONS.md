# 🚀 Deploy de Microfrontends no Vercel

## Instruções de Deploy

### Informações do Projeto
- **Team ID:** team_RWPxV6A0gp02a6FO7Ghf2YSV
- **Team Name:** Rafael Minatto's projects
- **Projeto Principal:** dudufisio-ai (prj_lJT0yis7pFVJASeoHaykO6A1U7kz)

### Estrutura a Deployar

```
packages/
├── host/              → moocafisio-host
├── agenda-pacientes/  → moocafisio-agenda  
├── tratamentos/       → moocafisio-tratamentos
└── financeiro/        → moocafisio-financeiro
```

### Passo 1: Deploy do Host (Principal)

```bash
cd packages/host
vercel --prod
```

Configurações:
- Project Name: `moocafisio-host`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Passo 2: Deploy Agenda-Pacientes

```bash
cd packages/agenda-pacientes
vercel --prod
```

Configurações:
- Project Name: `moocafisio-agenda`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Passo 3: Deploy Tratamentos

```bash
cd packages/tratamentos
vercel --prod
```

Configurações:
- Project Name: `moocafisio-tratamentos`
- Framework: Vite  
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Passo 4: Deploy Financeiro

```bash
cd packages/financeiro
vercel --prod
```

Configurações:
- Project Name: `moocafisio-financeiro`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Passo 5: Configurar Environment Variables no Host

Após o deploy de todos os remotes, você receberá URLs como:
- https://moocafisio-agenda-xyz.vercel.app
- https://moocafisio-tratamentos-xyz.vercel.app
- https://moocafisio-financeiro-xyz.vercel.app

Adicione no projeto HOST (moocafisio-host):

```bash
vercel env add VITE_AGENDA_PACIENTES_URL production
# Cole: https://moocafisio-agenda-xyz.vercel.app

vercel env add VITE_TRATAMENTOS_URL production
# Cole: https://moocafisio-tratamentos-xyz.vercel.app

vercel env add VITE_FINANCEIRO_URL production
# Cole: https://moocafisio-financeiro-xyz.vercel.app
```

### Passo 6: Atualizar vite.config.ts do Host

Edite `packages/host/vite.config.ts`:

```typescript
remotes: {
  agendaPacientes: import.meta.env.PROD 
    ? `${process.env.VITE_AGENDA_PACIENTES_URL}/assets/remoteEntry.js`
    : 'http://localhost:5174/assets/remoteEntry.js',
  tratamentos: import.meta.env.PROD 
    ? `${process.env.VITE_TRATAMENTOS_URL}/assets/remoteEntry.js`
    : 'http://localhost:5175/assets/remoteEntry.js',
  financeiro: import.meta.env.PROD 
    ? `${process.env.VITE_FINANCEIRO_URL}/assets/remoteEntry.js`
    : 'http://localhost:5176/assets/remoteEntry.js',
}
```

### Passo 7: Redeploy do Host

```bash
cd packages/host
vercel --prod
```

## Verificação

Após o deploy, verifique:
1. Host carrega sem erros
2. Remotes são carregados dinamicamente
3. Navegação entre páginas funciona
4. Não há erros de CORS no console

## Troubleshooting

### Erro de CORS
Verifique que cada remote tem headers CORS no `vercel.json`

### Remote não carrega
Verifique que as URLs estão corretas nas environment variables

### Build Error
Execute `npm install` em cada package antes do deploy

