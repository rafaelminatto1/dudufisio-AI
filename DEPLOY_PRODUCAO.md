# 🚀 Guia de Deploy para Produção - FisioFlow API

**Data**: 2025-11-22
**Versão**: 1.0.0

---

## 📋 Checklist Pré-Deploy

### ✅ 1. Banco de Dados (Supabase)

- [ ] **Aplicar migração de audit_logs**
  ```bash
  # Via SQL Editor no Supabase Dashboard
  # Executar: supabase/migrations/20251122_create_audit_logs.sql
  ```

- [ ] **Verificar tabelas principais**
  - [ ] `patients`
  - [ ] `appointments`
  - [ ] `session_evolutions`
  - [ ] `financial_transactions`
  - [ ] `audit_logs` (nova)

- [ ] **Verificar RLS (Row Level Security)**
  ```sql
  SELECT schemaname, tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```

- [ ] **Backup do banco antes do deploy**
  ```bash
  # Via Supabase Dashboard: Database > Backups
  # Ou executar: /api/cron/backup-database
  ```

### ✅ 2. Variáveis de Ambiente

- [ ] **Copiar .env.production.example para .env.production**
  ```bash
  cp .env.production.example .env.production
  ```

- [ ] **Preencher variáveis obrigatórias**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `CRON_SECRET` (gerar senha forte)
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `WHATSAPP_API_KEY`
  - [ ] `EMAIL_API_KEY`

- [ ] **Remover/Comentar variáveis de teste**
  - [ ] `TEST_MODE=false` ou comentar
  - [ ] `TEST_API_KEY` comentar

- [ ] **Adicionar ao Vercel**
  ```bash
  # Via Vercel Dashboard: Settings > Environment Variables
  # Ou via CLI:
  vercel env add CRON_SECRET production
  vercel env add SENTRY_DSN production
  # ... adicionar todas as variáveis
  ```

### ✅ 3. Código

- [ ] **Revisar TODO comments**
  ```bash
  grep -r "TODO" src/app/api/
  ```

- [ ] **Verificar console.logs sensíveis**
  ```bash
  grep -r "console.log" src/app/api/ | grep -v "// "
  ```

- [ ] **Build local para testar**
  ```bash
  npm run build
  ```

- [ ] **TypeScript sem erros**
  ```bash
  npm run type-check
  ```

### ✅ 4. Segurança

- [ ] **Gerar CRON_SECRET forte**
  ```bash
  # PowerShell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

  # Ou online
  # https://www.random.org/passwords/
  ```

- [ ] **Verificar .gitignore**
  - [ ] `.env.local` está no .gitignore
  - [ ] `.env.production` está no .gitignore
  - [ ] Nenhum secret commitado

- [ ] **Habilitar CORS apenas para domínios permitidos**
  ```env
  CORS_ALLOWED_ORIGINS=https://moocafisio.com.br
  ```

### ✅ 5. Monitoring

- [ ] **Configurar Sentry (Opcional mas recomendado)**
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] **Habilitar Vercel Analytics**
  ```bash
  # Via Vercel Dashboard: Analytics > Enable
  ```

- [ ] **Configurar Vercel Speed Insights**
  ```bash
  npm install @vercel/speed-insights
  ```

### ✅ 6. Rate Limiting (Opcional)

- [ ] **Configurar Upstash Redis**
  ```bash
  # 1. Criar conta em upstash.com
  # 2. Criar Redis database
  # 3. Copiar URL e TOKEN
  # 4. Adicionar às variáveis de ambiente
  ```

- [ ] **Implementar middleware de rate limiting**
  ```typescript
  // src/middleware.ts
  import { Ratelimit } from '@upstash/ratelimit'
  import { Redis } from '@upstash/redis'

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  })
  ```

---

## 🚀 Deploy Step-by-Step

### Método 1: Deploy via Vercel Dashboard (Recomendado)

1. **Fazer commit das mudanças**
   ```bash
   git add .
   git commit -m "feat: adicionar API REST completa para produção"
   git push origin main
   ```

2. **Acessar Vercel Dashboard**
   - https://vercel.com/rafael-minattos-projects/dudufisio-ai

3. **Verificar variáveis de ambiente**
   - Settings > Environment Variables
   - Garantir que `TEST_MODE` não existe ou está `false`

4. **Fazer deploy manual (se necessário)**
   - Deployments > Deploy
   - Selecionar branch `main`

5. **Aguardar build completar**
   - Monitorar logs em tempo real
   - Verificar se não há erros

6. **Testar em produção**
   ```bash
   # Substituir pela URL real
   curl https://dudufisio-ai.vercel.app/api/test-fase7?test=health
   ```

### Método 2: Deploy via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link com projeto
vercel link

# 4. Deploy para produção
vercel --prod

# 5. Verificar status
vercel ls
```

---

## 🧪 Testes Pós-Deploy

### 1. Health Check
```bash
# URL de produção
curl https://moocafisio.com.br/api/test-fase7?test=health

# Resposta esperada:
# {
#   "success": true,
#   "data": {
#     "overall": "healthy",
#     "checks": [...]
#   }
# }
```

### 2. Listar Rotas
```bash
curl https://moocafisio.com.br/api/test-fase7?test=routes

# Deve retornar 24 rotas
```

### 3. Testar Autenticação
```bash
# Deve REJEITAR token de teste
curl https://moocafisio.com.br/api/patients \
  -H "Authorization: Bearer test-api-key-development-only"

# Resposta esperada:
# { "error": "Não autenticado", "status": 401 }
```

### 4. Testar Login Real
```bash
curl -X POST https://moocafisio.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha-real"
  }'
```

### 5. Testar Cron Jobs
```bash
# Deve REJEITAR sem CRON_SECRET
curl https://moocafisio.com.br/api/cron/backup-database

# Deve ACEITAR com CRON_SECRET correto
curl https://moocafisio.com.br/api/cron/backup-database \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### 6. Testar Auditoria
```bash
curl https://moocafisio.com.br/api/audit \
  -H "Authorization: Bearer <token-real-do-usuario>"

# Deve retornar logs (vazio se tabela acabou de ser criada)
```

---

## 📊 Monitoring Pós-Deploy

### 1. Vercel Logs
```bash
# Via CLI
vercel logs --prod

# Ou via Dashboard
# https://vercel.com/rafael-minattos-projects/dudufisio-ai/logs
```

### 2. Sentry (se configurado)
- Acessar dashboard: https://sentry.io
- Verificar erros nas últimas 24h
- Configurar alertas para erros críticos

### 3. Uptime Monitoring
- Configurar https://uptimerobot.com
- Monitorar `/api/test-fase7?test=health`
- Alertas via email/SMS se ficar offline

### 4. Performance
- Vercel Analytics: Métricas de performance
- Speed Insights: Core Web Vitals
- Logs de latência de API

---

## 🔄 Rollback (Se necessário)

### Via Vercel Dashboard
1. Acessar Deployments
2. Encontrar deployment anterior estável
3. Clicar em "..." (três pontos)
4. Selecionar "Promote to Production"

### Via CLI
```bash
# Listar deployments
vercel ls

# Promover deployment específico
vercel promote <deployment-url>
```

---

## 🎯 Configurações Recomendadas no Vercel

### 1. Build & Development Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 2. Environment Variables

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
CRON_SECRET=<senha-forte-gerada>
STRIPE_SECRET_KEY=sk_live_...
WHATSAPP_API_KEY=...
EMAIL_API_KEY=re_...
SENTRY_DSN=https://...@sentry.io/...
CORS_ALLOWED_ORIGINS=https://moocafisio.com.br
NEXT_PUBLIC_FORCE_HTTPS=true
```

#### Preview (Staging)
```env
NODE_ENV=development
TEST_MODE=true
TEST_API_KEY=test-key-for-preview
# ... outras vars de staging
```

### 3. Cron Jobs (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/backup-database",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/lembretes-diarios",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### 4. Headers & Redirects
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Erro: "Module not found: Can't resolve"
- **Solução**: Limpar cache e rebuild
  ```bash
  rm -rf .next node_modules
  npm install
  npm run build
  ```

### Erro: "CRON_SECRET not configured"
- **Solução**: Adicionar `CRON_SECRET` nas variáveis de ambiente do Vercel

### Erro: "Não autenticado" em todas as rotas
- **Solução**: Verificar se `TEST_MODE` está desabilitado e Supabase configurado

### Erro: "Could not find table audit_logs"
- **Solução**: Aplicar migração no Supabase

### Build timeout
- **Solução**: Aumentar timeout no Vercel (Settings > Build & Development)

---

## 📞 Suporte

### Recursos Úteis
- 📚 Documentação API: [docs/API_ROUTES.md](docs/API_ROUTES.md)
- 🐛 Issues GitHub: Reportar bugs
- 💬 Vercel Support: https://vercel.com/support
- 📖 Supabase Docs: https://supabase.com/docs

### Contatos
- **Desenvolvedor**: Rafael Minatto
- **Email**: rafael@sateg.com.br
- **Projeto Vercel**: dudufisio-ai

---

## ✅ Checklist Final

Antes de marcar como concluído:

- [ ] ✅ Todos os testes passando
- [ ] ✅ Build sem erros
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ `TEST_MODE=false` em produção
- [ ] ✅ Migração `audit_logs` aplicada
- [ ] ✅ Backup do banco realizado
- [ ] ✅ Monitoring configurado
- [ ] ✅ Documentação atualizada
- [ ] ✅ Usuários notificados sobre novas APIs

---

**🤖 Gerado por Claude Code**
**Data**: 2025-11-22
**Status**: Pronto para produção ✅
