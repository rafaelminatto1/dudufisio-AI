# 🚀 Guia Completo de Deployment

**Projeto:** dudufisio-AI  
**Criado:** 06/11/2025  
**Versão:** 1.0

---

## 📋 VISÃO GERAL

Este projeto suporta 3 ambientes:
1. **Development** - Local (localhost:3000)
2. **Staging** - Vercel Preview (staging.vercel.app)
3. **Production** - Vercel Production (app.dudufisio.com)

---

## 🛠️ SETUP INICIAL

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Linkar Projeto

```bash
vercel link
```

Siga as instruções para linkar ao projeto existente ou criar novo.

### 3. Configurar Environment Variables

**Via Vercel Dashboard:**
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Settings → Environment Variables
4. Adicione todas as variáveis do `.env.example`

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_GEMINI_API_KEY production
```

---

## 📦 DEVELOPMENT

### Executar Localmente

```bash
# Instalar dependências
npm install

# Copiar .env.example
cp .env.example .env.local

# Editar .env.local com suas credenciais
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_GEMINI_API_KEY=...

# Executar dev server
npm run dev

# Abrir: http://localhost:3000
```

### Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm run test:coverage

# CI mode
npm run test:ci
```

---

## 🎯 STAGING

### Deploy Automático (via Git)

```bash
# Qualquer push para branch que não seja main
git checkout -b feature/minha-feature
git push origin feature/minha-feature

# Vercel criará preview deployment automaticamente
```

### Deploy Manual

```bash
# Executar script de staging
chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh

# Ou via Vercel CLI
vercel --env=staging
```

### Testes em Staging

```bash
# 1. Abrir URL do staging
# 2. Executar checklist manual
# 3. Validar todas as features
# 4. Verificar performance
# 5. Aprovar para produção
```

---

## 🔴 PRODUCTION

### PRÉ-REQUISITOS

✅ **OBRIGATÓRIO antes de deploy:**

1. Todos os testes passando
2. Code review aprovado
3. Staging testado e aprovado
4. Backup do banco realizado
5. Migrations testadas
6. Changelog atualizado

### Deploy com Script Automatizado

```bash
chmod +x scripts/production-deploy.sh
./scripts/production-deploy.sh
```

O script executa:
1. ✅ Pre-deploy checks
2. ✅ Testes completos
3. ✅ Linter
4. ✅ Build
5. ✅ Validação de env vars
6. ✅ Deploy para produção
7. ✅ Smoke tests
8. ✅ Verificação final

### Deploy Manual (Alternativo)

```bash
# 1. Garantir que está no main
git checkout main
git pull origin main

# 2. Criar tag de versão
git tag v1.0.0
git push origin main --tags

# 3. Deploy
vercel --prod

# 4. Verificar
open https://app.dudufisio.com
```

---

## 🗄️ DATABASE MIGRATIONS

### Staging

```bash
# Conectar ao projeto staging
supabase link --project-ref your-staging-ref

# Aplicar migrations
supabase db push

# Verificar
supabase db diff
```

### Production

```bash
# 1. SEMPRE fazer backup primeiro!
# Ir para Supabase Dashboard → Database → Backups

# 2. Conectar ao projeto production
supabase link --project-ref your-production-ref

# 3. Aplicar migrations
supabase db push

# 4. Regenerar types
npm run supabase:types

# 5. Verificar se tudo funcionou
# Executar queries de validação
```

## ⚙️ NOTIFICATION WORKERS
- Garantir que o wrapper pgmq está habilitado antes do deploy.
- Utilizar `deploy-notification-worker.ps1` para publicar `process-notification-tasks`.
- Após o deploy, rodar `SELECT * FROM public.read_notification_tasks();` para validar acesso.
- Smoke test:
  1. `SELECT public.enqueue_notification_task('<user-id>', jsonb_build_object('title','Ping','body','Teste'));`
  2. `curl https://<project>.functions.supabase.co/process-notification-tasks -H "Authorization: Bearer <service-key>" -d '{}'`.
  3. Conferir `notification_logs` e se a fila ficou vazia (`SELECT public.complete_notification_task(<message_id>)` não deve retornar pendências).

---

## 📊 MONITORAMENTO

### Vercel Analytics

1. Acessar: https://vercel.com/dashboard
2. Analytics tab
3. Monitorar:
   - Page views
   - Response times
   - Error rates
   - Geographic distribution

### Supabase Performance

1. Acessar: https://supabase.com/dashboard
2. Performance tab
3. Monitorar:
   - Slow queries (> 500ms)
   - Cache hit rate
   - Active connections
   - Table sizes

### Sentry (Errors)

```bash
# Configurar Sentry
npm install @sentry/nextjs

# Seguir wizard
npx @sentry/wizard@latest -i nextjs
```

### Logs

```bash
# Ver logs em tempo real
vercel logs

# Ver logs de função específica
vercel logs [deployment-url] --function=api/webhooks/whatsapp-edge
```

---

## 🔄 ROLLBACK

### Rollback Rápido (Vercel)

```bash
# Listar deployments
vercel ls

# Rollback para deployment anterior
vercel rollback [deployment-url]
```

### Rollback de Database

```sql
-- 1. Restaurar backup via Supabase Dashboard
-- Database → Backups → Restore

-- 2. Ou executar rollback SQL
-- Ver: rollback-migration.sql
```

### Comunicação de Rollback

1. **Avisar imediatamente:**
   - Stakeholders
   - Usuários (se necessário)
   - Time de desenvolvimento

2. **Documentar:**
   - O que deu errado
   - Por que foi necessário rollback
   - Plano de correção

3. **Post-mortem:**
   - Analisar causa raiz
   - Prevenir reincidência
   - Atualizar checklist

---

## 📈 GRADUAL ROLLOUT

### Estratégia Recomendada

**Fase 1: Canary (5%)** 
```bash
# Deploy para 5% dos usuários
vercel --prod --target=canary

# Monitorar por 2 horas
# Se OK → próxima fase
```

**Fase 2: Beta (25%)**
```bash
# Aumentar para 25%
# Monitorar por 6 horas
```

**Fase 3: Full (100%)**
```bash
# Release completo
# Monitorar por 24 horas
```

---

## 🎯 CHECKLIST POR AMBIENTE

### Development ✅
- [x] .env.local configurado
- [x] Supabase local running (opcional)
- [x] Hot reload funcionando
- [x] Console sem erros críticos

### Staging ✅
- [x] Vercel preview deployment
- [x] Env vars de staging configuradas
- [x] Database de staging separado
- [x] Testes manuais completados
- [x] Performance validada

### Production 🔴
- [ ] Vercel production deployment
- [ ] Env vars de production configuradas
- [ ] Database de production com backup
- [ ] Migrations aplicadas
- [ ] Monitoramento ativo
- [ ] Smoke tests passaram
- [ ] Stakeholders aprovaram

---

## 🆘 TROUBLESHOOTING

### Build Falha

```bash
# Limpar cache
rm -rf .next
npm run build

# Se continuar falhando
rm -rf node_modules
npm install
npm run build
```

### Migrations Falham

```bash
# Verificar conexão
supabase status

# Reset local (CUIDADO!)
supabase db reset

# Aplicar manualmente via Dashboard
```

### Deploy Falha

```bash
# Ver logs
vercel logs

# Deploy com debug
vercel --prod --debug

# Verificar env vars
vercel env ls
```

---

## 📞 SUPPORT

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://vercel-status.com

### Supabase
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support
- Status: https://status.supabase.com

### Internal
- Documentation: /docs
- Runbook: PRODUCTION_CHECKLIST.md
- Issues: GitHub Issues

---

**Criado por:** AI Assistant  
**Data:** 06/11/2025  
**Revisão:** Antes de cada deploy major

