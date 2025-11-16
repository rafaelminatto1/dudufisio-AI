# 🚀 Vercel Deployment Guide - DuduFisio AI

**Data**: 11 de Janeiro de 2025
**Versão**: 1.0.0

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Deploy Staging](#deploy-staging)
5. [Deploy Production](#deploy-production)
6. [Verificação Pós-Deploy](#verificação-pós-deploy)
7. [Rollback](#rollback)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### 1. Ferramentas Necessárias
- ✅ Node.js 18+ instalado
- ✅ npm ou yarn instalado
- ✅ Git instalado e configurado
- ✅ Conta Vercel ativa
- ✅ Vercel CLI instalado: `npm install -g vercel`

### 2. Acessos Necessários
- ✅ Acesso ao repositório GitHub
- ✅ Acesso ao projeto Vercel
- ✅ Variáveis de ambiente configuradas (Supabase, APIs, etc.)

### 3. Verificações Pré-Deploy
```bash
# 1. Verificar branch atual
git branch --show-current

# 2. Garantir que está atualizado
git pull origin main

# 3. Rodar testes locais
npm run build
npm run validate

# 4. Verificar bundle size
npm run build:analyze
```

---

## ⚙️ Configuração Inicial

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Login na Vercel
```bash
vercel login
```

### 3. Linkar Projeto
```bash
# Na raiz do projeto
vercel link
```

Selecione:
- **Team**: DuduFisio (ou sua team)
- **Project**: dudufisio-ai

### 4. Verificar Configuração
```bash
# Ver configuração atual
vercel inspect

# Listar projetos
vercel ls
```

---

## 🔐 Variáveis de Ambiente

### 1. Variáveis Necessárias

#### Supabase
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Firebase (opcional)
```bash
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

#### APIs Externas
```bash
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_GEMINI_API_KEY=AI...
```

#### Outros
```bash
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### 2. Configurar Variáveis na Vercel

#### Via CLI:
```bash
# Staging
vercel env add VITE_SUPABASE_URL preview

# Production
vercel env add VITE_SUPABASE_URL production
```

#### Via Dashboard:
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **dudufisio-ai**
3. Vá em **Settings** > **Environment Variables**
4. Adicione cada variável selecionando o environment (Preview/Production)

### 3. Verificar Variáveis
```bash
# Listar variáveis do projeto
vercel env ls
```

---

## 🧪 Deploy Staging (Preview)

### Método 1: Deploy Automático (Recomendado)

Todo push em branches **diferentes de `main`** gera automaticamente um preview deploy:

```bash
# 1. Criar branch de feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças e commit
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 3. Push para GitHub
git push origin feature/nova-funcionalidade

# 4. Vercel vai automaticamente criar preview deploy
# URL será algo como: https://dudufisio-ai-git-feature-nova-funcionalidade.vercel.app
```

### Método 2: Deploy Manual via CLI

```bash
# Deploy para staging/preview
vercel

# Ou com mais controle
vercel --prod=false --env preview
```

### 3. Verificar Deploy Staging

1. **Via Dashboard**:
   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Vá para o projeto
   - Veja os deployments em "Deployments"

2. **Via CLI**:
```bash
# Ver últimos deploys
vercel ls

# Ver logs do último deploy
vercel logs
```

3. **Testes Manuais**:
   - ✅ Abrir URL do preview
   - ✅ Testar login/autenticação
   - ✅ Verificar funcionalidades principais
   - ✅ Testar dark mode
   - ✅ Verificar responsividade mobile

---

## 🚀 Deploy Production

### Método 1: Deploy Automático via GitHub (Recomendado)

Todo push/merge para `main` gera automaticamente um production deploy:

```bash
# 1. Garantir que está na main
git checkout main
git pull origin main

# 2. Merge da feature branch
git merge feature/nova-funcionalidade

# 3. Push para GitHub
git push origin main

# 4. Vercel vai automaticamente fazer deploy para production
# URL: https://dudufisio-ai.vercel.app
```

### Método 2: Deploy Manual via CLI

```bash
# Deploy para production
vercel --prod

# Ou com confirmação explícita
vercel --prod --yes
```

### 3. Deploy com Build Otimizado

```bash
# 1. Build local primeiro
npm run build

# 2. Verificar se build passou
npm run validate

# 3. Deploy para production
vercel --prod --force
```

### 4. Checklist Pré-Deploy Production

- [ ] ✅ Todos os testes passando
- [ ] ✅ Build local sucesso (sem warnings críticos)
- [ ] ✅ Bundle size dentro do limite (< 12MB)
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Preview deploy testado e aprovado
- [ ] ✅ Changelog atualizado
- [ ] ✅ Versão atualizada no `package.json`
- [ ] ✅ Commit message clara
- [ ] ✅ PR aprovado (se aplicável)

---

## ✅ Verificação Pós-Deploy

### 1. Verificações Automáticas

Após deploy, executar:

```bash
# Verificar status do deploy
vercel inspect

# Ver logs de build
vercel logs --since 10m

# Verificar se está rodando
curl -I https://dudufisio-ai.vercel.app
```

### 2. Testes Manuais (Production)

#### Funcionalidades Críticas:
- [ ] ✅ **Autenticação**: Login/Logout funcionando
- [ ] ✅ **Dashboard**: Carregamento correto de dados
- [ ] ✅ **Agenda**: CRUD de consultas
- [ ] ✅ **Pacientes**: Listagem e detalhes
- [ ] ✅ **Dark Mode**: Toggle funcionando
- [ ] ✅ **Responsividade**: Mobile/tablet/desktop
- [ ] ✅ **Performance**: Lighthouse score > 80

#### APIs e Integrações:
- [ ] ✅ **Supabase**: Conexão ativa
- [ ] ✅ **Firebase**: Auth funcionando
- [ ] ✅ **OpenAI**: API respondendo
- [ ] ✅ **Sentry**: Erros sendo capturados

### 3. Performance Checks

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://dudufisio-ai.vercel.app

# WebPageTest
# https://www.webpagetest.org/
# Teste com: "duluth, Minnesota - Chrome - 3G"

# Vercel Analytics
# Acesse: https://vercel.com/[team]/dudufisio-ai/analytics
```

### 4. Monitoring

- **Vercel Dashboard**: Monitorar métricas em tempo real
- **Sentry**: Verificar se há novos erros
- **Google Analytics**: Verificar tráfego
- **Supabase Dashboard**: Verificar queries

---

## ⏮️ Rollback

### Rollback via Vercel Dashboard (Recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá para o projeto **dudufisio-ai**
3. Clique em **Deployments**
4. Encontre o deployment anterior estável
5. Clique nos 3 pontos (**...**) > **Promote to Production**

### Rollback via CLI

```bash
# 1. Listar deployments
vercel ls

# 2. Promover deployment anterior
vercel promote [deployment-url]

# Exemplo:
vercel promote https://dudufisio-ai-abc123.vercel.app
```

### Rollback via Git Revert

```bash
# 1. Reverter commit problemático
git revert HEAD

# 2. Push para main
git push origin main

# 3. Vercel vai automaticamente fazer novo deploy
```

### Verificação Pós-Rollback

```bash
# Verificar versão atual
curl https://dudufisio-ai.vercel.app/version.json

# Ver logs
vercel logs --since 5m
```

---

## 🔧 Troubleshooting

### Problema 1: Build Falhou

**Sintomas**: Deploy failed with exit code 1

**Soluções**:
```bash
# 1. Verificar logs
vercel logs

# 2. Testar build local
npm run build

# 3. Limpar cache
rm -rf node_modules .vercel
npm install
npm run build

# 4. Verificar variáveis de ambiente
vercel env ls
```

### Problema 2: Variáveis de Ambiente Não Carregam

**Sintomas**: API errors, undefined variables

**Soluções**:
```bash
# 1. Verificar se variáveis existem
vercel env ls

# 2. Adicionar variáveis faltantes
vercel env add VITE_SUPABASE_URL production

# 3. Re-deploy forçado
vercel --prod --force
```

### Problema 3: Deploy Muito Lento

**Sintomas**: Build takes > 5 minutes

**Soluções**:
```bash
# 1. Verificar bundle size
npm run build:analyze

# 2. Implementar code splitting
# Ver: vite.config.ts > build.rollupOptions.output.manualChunks

# 3. Otimizar dependências
npm run build -- --analyze
```

### Problema 4: 404 em Rotas SPA

**Sintomas**: Refresh retorna 404

**Solução**: Criar/verificar `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Problema 5: Memory Limit Exceeded

**Sintomas**: Build fails with "JavaScript heap out of memory"

**Solução**: Adicionar em `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

### Problema 6: Supabase Connection Failed

**Sintomas**: "Failed to fetch" errors

**Soluções**:
1. Verificar Supabase service status
2. Verificar CORS settings no Supabase
3. Verificar variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

---

## 📊 Métricas de Deploy

### Performance Targets

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Build Time** | < 3min | < 5min |
| **Bundle Size** | < 8MB | < 12MB |
| **FCP** | < 1.8s | < 3s |
| **LCP** | < 2.5s | < 4s |
| **TTI** | < 3.8s | < 7.3s |
| **CLS** | < 0.1 | < 0.25 |

### Deploy Frequency

- **Staging**: Múltiplos por dia (feature branches)
- **Production**: 1-2x por semana (main branch)
- **Hotfix**: Imediato quando necessário

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Project URL (Production)**: https://dudufisio-ai.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/your-org/dudufisio-ai

---

## 📝 Changelog de Deploys

### 2025-01-11 - v1.2.0
- ✅ Implementação completa de Dark Mode
- ✅ PatientDetailPage com Monday.com design
- ✅ FeatureCard component com dark mode
- ✅ Documentação de páginas atualizada

### 2025-01-10 - v1.1.0
- ✅ Monday.com design system completo
- ✅ 6 páginas principais atualizadas
- ✅ Components com dark mode

---

## 💡 Melhores Práticas

### 1. Antes de Deploy
- ✅ Sempre testar build local
- ✅ Rodar validações (`npm run validate`)
- ✅ Verificar bundle size
- ✅ Testar em staging primeiro
- ✅ Commit messages claros

### 2. Durante Deploy
- ✅ Monitorar logs em tempo real
- ✅ Verificar build time
- ✅ Conferir warnings

### 3. Depois de Deploy
- ✅ Testes manuais imediatos
- ✅ Verificar Sentry para erros
- ✅ Monitorar performance
- ✅ Documentar mudanças

### 4. Segurança
- ✅ Nunca commitar variáveis sensíveis
- ✅ Usar `.env.example` como template
- ✅ Rotacionar keys regularmente
- ✅ Auditar permissões

---

## 🆘 Suporte

**Em caso de problemas críticos**:

1. **Rollback imediato** (ver seção Rollback)
2. **Notificar equipe** via Slack/Teams
3. **Criar issue** no GitHub
4. **Documentar** o problema e solução

**Contatos**:
- **Tech Lead**: [nome@empresa.com]
- **DevOps**: [devops@empresa.com]
- **Vercel Support**: support@vercel.com

---

**Gerado com ❤️ usando Claude Code**
**Última atualização**: 11 de Janeiro de 2025
