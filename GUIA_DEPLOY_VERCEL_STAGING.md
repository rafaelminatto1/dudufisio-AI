# 🚀 Guia de Deploy - Vercel Staging

**Data:** 19/11/2025
**Objetivo:** Deploy seguro para ambiente de staging no Vercel

---

## 📋 PRÉ-REQUISITOS

### 1. Conta Vercel
- ✅ Ter conta no Vercel (https://vercel.com)
- ✅ Vercel CLI instalado (opcional mas recomendado)
- ✅ Projeto conectado ao GitHub

### 2. Variáveis de Ambiente
Certifique-se de ter todas as variáveis configuradas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# URLs
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_URL=

# Email (se aplicável)
RESEND_API_KEY=

# Sentry (opcional)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## 🔧 PASSO 1: INSTALAR VERCEL CLI

```bash
# Instalar globalmente
npm install -g vercel

# Fazer login
vercel login

# Verificar se está logado
vercel whoami
```

---

## 🏗️ PASSO 2: CRIAR AMBIENTE STAGING

### Opção A: Via Dashboard Vercel (Recomendado)

1. **Acesse seu projeto no Vercel**
   - https://vercel.com/dashboard

2. **Ir para Settings > Git**
   - Configure production branch: `main`
   - Configure preview branches: `staging`, `develop`

3. **Criar Branch de Staging**
   ```bash
   # No seu repositório local
   git checkout -b staging
   git push origin staging
   ```

4. **Configurar Environment Variables**
   - Settings > Environment Variables
   - Criar variáveis para "Preview" environment
   - Selecionar branch "staging"

### Opção B: Via CLI

```bash
# No diretório do projeto
vercel

# Seguir prompts:
# - Set up and deploy? Yes
# - Which scope? (selecionar sua conta/team)
# - Link to existing project? Yes
# - What's the name? dudufisio-ai
# - In which directory is your code? ./
# - Want to override settings? No
```

---

## 📁 PASSO 3: CONFIGURAR vercel.json

Já temos um `vercel.json` no projeto. Vamos garantir que está otimizado:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "app/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔐 PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Via Dashboard:

1. **Settings > Environment Variables**

2. **Adicionar para "Preview" (Staging):**
   ```
   NEXT_PUBLIC_SUPABASE_URL = sua-url-staging
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-staging
   SUPABASE_SERVICE_ROLE_KEY = sua-service-key-staging
   STRIPE_SECRET_KEY = sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
   NEXT_PUBLIC_APP_URL = https://dudufisio-ai-staging.vercel.app
   ```

3. **IMPORTANTE**: Use credenciais de **teste/staging**, nunca produção!

### Via CLI:

```bash
# Adicionar variável
vercel env add NEXT_PUBLIC_SUPABASE_URL preview

# Listar variáveis
vercel env ls

# Puxar variáveis localmente
vercel env pull .env.local
```

---

## 🚀 PASSO 5: FAZER DEPLOY STAGING

### Método 1: Push para Branch Staging (Automático)

```bash
# Fazer commit das mudanças
git add .
git commit -m "feat: implementações Next.js 16 + React 19"

# Push para staging
git checkout staging
git merge main
git push origin staging
```

**Vercel vai automaticamente:**
- Detectar o push
- Fazer build
- Fazer deploy
- Gerar URL de preview

### Método 2: Deploy Manual via CLI

```bash
# Deploy para preview/staging
vercel --env preview

# Ou especificar como production staging
vercel --prod --scope staging
```

---

## ✅ PASSO 6: VERIFICAR DEPLOY

### 1. Verificar Build

Acesse Vercel Dashboard > Deployments

Verificar:
- ✅ Build status: "Ready"
- ✅ Build time: ~2-3 minutos
- ✅ No errors no build log

### 2. Testar URL de Staging

```bash
# URL será algo como:
https://dudufisio-ai-git-staging-seu-username.vercel.app
```

**Checklist de Testes:**

```bash
# 1. Testar home page
curl -I https://sua-url-staging.vercel.app

# 2. Testar autenticação
# - Login
# - Logout
# - Criar usuário

# 3. Testar páginas principais
# - /dashboard
# - /dashboard/pacientes
# - /dashboard/agenda
# - /dashboard/tratamentos
# - /dashboard/financeiro

# 4. Testar useOptimistic
# - Criar evolução SOAP
# - Criar transação financeira
# - Verificar UI instantânea

# 5. Testar Streaming SSR
# - Verificar skeletons aparecem
# - Verificar conteúdo carrega progressivamente

# 6. Verificar Web Vitals
# - Abrir DevTools > Performance
# - Ver métricas de FCP, LCP, CLS
```

### 3. Verificar Analytics

Dashboard Vercel > Analytics

Verificar:
- Real Experience Score
- Web Vitals
- Page load times

---

## 🐛 PASSO 7: DEBUG (Se Necessário)

### Build Falhou?

```bash
# Ver logs detalhados
vercel logs deployment-url

# Testar build localmente
npm run build

# Verificar variáveis de ambiente
vercel env ls
```

### Erros Comuns:

**1. Build timeout**
```json
// vercel.json
{
  "functions": {
    "app/**/*.ts": {
      "maxDuration": 30  // Aumentar se necessário
    }
  }
}
```

**2. Variáveis faltando**
```bash
# Adicionar todas as variáveis necessárias
vercel env add NOME_DA_VARIAVEL preview
```

**3. Erro de tipo**
```bash
# Rodar type-check localmente primeiro
npm run type-check

# Fix erros antes de deploy
```

---

## 🔄 PASSO 8: CI/CD (Opcional mas Recomendado)

### Criar GitHub Actions Workflow

`.github/workflows/staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]
  pull_request:
    branches: [staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_SCOPE }}
```

---

## 📊 PASSO 9: MONITORAMENTO

### 1. Configurar Alerts

Vercel Dashboard > Settings > Notifications

Configurar alertas para:
- ❌ Build failures
- ⚠️ High error rate
- 📈 Performance degradation
- 💰 Usage limits

### 2. Verificar Web Vitals

```typescript
// Já implementado em src/components/web-vitals.tsx
// Dados vão automaticamente para Vercel Analytics
```

### 3. Sentry (Opcional)

Se configurado, verificar erros em:
- https://sentry.io

---

## 🎯 CHECKLIST FINAL

Antes de considerar staging pronto:

### Build & Deploy
- [ ] Build completa com sucesso
- [ ] Deploy URL acessível
- [ ] Sem erros no console do navegador
- [ ] Sem erros no build log

### Funcionalidades Core
- [ ] Login/Logout funcionando
- [ ] CRUD de pacientes funcionando
- [ ] Agenda com useOptimistic funcionando
- [ ] SOAP Form com useOptimistic funcionando
- [ ] Financial com useOptimistic funcionando
- [ ] Streaming SSR funcionando (ver skeletons)

### Performance
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 3.5s

### Segurança
- [ ] Variáveis de ambiente corretas (staging/test)
- [ ] HTTPS funcionando
- [ ] Headers de segurança configurados
- [ ] Auth funcionando corretamente

### Monitoramento
- [ ] Web Vitals reportando
- [ ] Vercel Analytics configurado
- [ ] Alerts configurados
- [ ] Sentry configurado (se aplicável)

---

## 🚦 PRÓXIMOS PASSOS

### Após Staging Validado:

1. **Testar Thoroughly**
   - [ ] Teste manual completo
   - [ ] Testes automatizados (se houver)
   - [ ] Performance testing
   - [ ] Security scan

2. **Coletar Feedback**
   - [ ] Team review
   - [ ] Stakeholder approval
   - [ ] Bug fixes se necessário

3. **Preparar Produção**
   - [ ] Documentar mudanças
   - [ ] Criar release notes
   - [ ] Planejar rollout

4. **Deploy Produção** (quando aprovado)
   ```bash
   git checkout main
   git merge staging
   git push origin main
   # Vercel vai automaticamente fazer deploy em produção
   ```

---

## 📞 SUPORTE

### Recursos Úteis:

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel CLI**: https://vercel.com/docs/cli
- **Troubleshooting**: https://vercel.com/docs/troubleshooting

### Comandos Úteis:

```bash
# Ver status do projeto
vercel inspect

# Ver logs em tempo real
vercel logs --follow

# Cancelar deployment
vercel remove deployment-url

# Listar todos os deployments
vercel ls

# Promover deployment para produção
vercel promote deployment-url
```

---

## 🎉 CONCLUSÃO

Seguindo este guia, você terá:

✅ Ambiente de staging configurado
✅ Deploy automatizado via Git
✅ Variáveis de ambiente seguras
✅ Monitoramento ativo
✅ CI/CD configurado (opcional)
✅ Processo de QA antes de produção

**Status:** Pronto para deploy staging! 🚀

---

**Criado por:** Claude Code
**Data:** 19/11/2025
**Versão:** 1.0
