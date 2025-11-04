# 🚀 Guia Rápido de Deploy - Microfrontends

## Deploy Imediato (5 minutos)

### Pré-requisitos
- Vercel CLI instalado: `npm i -g vercel`
- Estar autenticado: `vercel login`

### Passo 1: Deploy Agenda-Pacientes

```bash
cd packages/agenda-pacientes
vercel --prod --yes
```

Anote a URL: `https://agenda-pacientes-xxxxx.vercel.app`

### Passo 2: Deploy Tratamentos

```bash
cd ../tratamentos
vercel --prod --yes
```

Anote a URL: `https://tratamentos-xxxxx.vercel.app`

### Passo 3: Deploy Financeiro

```bash
cd ../financeiro
vercel --prod --yes
```

Anote a URL: `https://financeiro-xxxxx.vercel.app`

### Passo 4: Configurar Host

Edite `packages/host/vite.config.ts`:

```typescript
remotes: {
  agendaPacientes: 'https://agenda-pacientes-xxxxx.vercel.app/assets/remoteEntry.js',
  tratamentos: 'https://tratamentos-xxxxx.vercel.app/assets/remoteEntry.js',
  financeiro: 'https://financeiro-xxxxx.vercel.app/assets/remoteEntry.js',
}
```

### Passo 5: Deploy Host

```bash
cd ../host
vercel --prod --yes
```

### Passo 6: Testar

Acesse a URL do host e verifique:
- ✅ Host carrega
- ✅ Rotas funcionam
- ✅ Remotes carregam dinamicamente
- ✅ Não há erros de CORS no console

## ✅ Pronto!

Sua arquitetura de microfrontends está no ar! 🎉

