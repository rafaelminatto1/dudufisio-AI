# 📋 CHECKLIST DE PRODUÇÃO - dudufisio-AI

**Versão:** 1.0  
**Criado:** 06/11/2025  
**Status:** Pronto para uso

---

## ✅ PRÉ-DEPLOY

### 1. Código e Testes
- [ ] Todos os testes passando (`npm test`)
- [ ] Coverage >= 70% (`npm run test:coverage`)
- [ ] Linter sem erros (`npm run lint`)
- [ ] Build bem-sucedido (`npm run build`)
- [ ] Type-check sem erros (`npm run type-check` ou `tsc --noEmit`)

### 2. Segurança
- [ ] Nenhuma senha ou secret em código
- [ ] `.env.local` no `.gitignore`
- [ ] API keys configuradas como secrets no Vercel
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Input validation com Zod
- [ ] SQL injection prevenido (usando Supabase client)

### 3. Performance
- [ ] Bundle size < 500KB (verificar com `npm run build:analyze`)
- [ ] Lighthouse score > 90
- [ ] Lazy loading implementado
- [ ] Imagens otimizadas
- [ ] Código minificado

### 4. Banco de Dados
- [ ] Backup do banco realizado
- [ ] Migrations testadas em staging
- [ ] Índices aplicados
- [ ] RLS policies validadas
- [ ] Queries otimizadas (< 500ms)

### 5. Documentação
- [ ] README atualizado
- [ ] API documentation completa
- [ ] User guides criados
- [ ] Changelog atualizado

---

## 🚀 DEPLOY

### 1. Configuração Vercel
- [ ] Projeto criado no Vercel
- [ ] Environment variables configuradas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_GEMINI_API_KEY`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `JWT_SECRET`
- [ ] Domain configurado
- [ ] SSL ativo
- [ ] Regiões otimizadas (gru1, iad1)

### 2. Deploy Steps
```bash
# 1. Commit final
git add .
git commit -m "chore: prepare for production deployment"

# 2. Tag version
git tag v1.0.0
git push origin main --tags

# 3. Deploy via Vercel CLI
vercel --prod

# Ou via Git (automático)
git push origin main
```

### 3. Supabase
- [ ] Migrations aplicadas:
  ```bash
  supabase db push
  ```
- [ ] Types regenerados:
  ```bash
  npm run supabase:types
  ```
- [ ] Row Level Security habilitada
- [ ] Backups automáticos configurados

---

## 🔍 PÓS-DEPLOY

### 1. Validação Imediata (primeiros 15 minutos)
- [ ] Homepage carrega corretamente
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] API endpoints respondem
- [ ] WebSockets conectam (se aplicável)

### 2. Smoke Tests (primeira hora)
- [ ] Criar paciente
- [ ] Agendar consulta
- [ ] Registrar evolução
- [ ] Testar features IA:
  - [ ] AI Insights Dashboard
  - [ ] Voice Notes
  - [ ] Smart Scheduler
  - [ ] Movement Analysis

### 3. Monitoramento (primeiras 24h)
- [ ] Verificar Vercel Analytics
- [ ] Monitorar Sentry (erros)
- [ ] Verificar Supabase Performance
- [ ] Checar logs de API
- [ ] Validar métricas:
  - [ ] Response time < 200ms
  - [ ] Error rate < 1%
  - [ ] Uptime > 99.9%

---

## 📊 MÉTRICAS DE SUCESSO

### Performance
- [ ] Lighthouse Performance: > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s
- [ ] Cumulative Layout Shift: < 0.1

### Availability
- [ ] Uptime: > 99.9%
- [ ] Response time (p95): < 500ms
- [ ] Error rate: < 1%

### User Experience
- [ ] Page load time: < 3s
- [ ] API response time: < 200ms
- [ ] Zero critical bugs

---

## 🚨 ROLLBACK PLAN

### Se algo der errado:

**1. Rollback imediato via Vercel:**
```bash
vercel rollback
```

**2. Rollback de migrations SQL:**
```sql
-- Ver arquivo: rollback-migration.sql
-- Executar via Supabase Dashboard
```

**3. Comunicação:**
- [ ] Avisar stakeholders
- [ ] Atualizar status page
- [ ] Documentar incidente

---

## 📞 CONTATOS DE EMERGÊNCIA

**Dev Team:**
- Developer: [seu email]
- DevOps: [email]

**Serviços:**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support

**Monitoramento:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Sentry: https://sentry.io

---

## 🎯 CHECKLIST FINAL

### Antes de marcar como PRONTO:

- [ ] ✅ Todos os itens de PRÉ-DEPLOY completos
- [ ] ✅ Deploy realizado com sucesso
- [ ] ✅ Todos os smoke tests passaram
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Backup realizado
- [ ] ✅ Rollback plan testado
- [ ] ✅ Documentação atualizada
- [ ] ✅ Stakeholders informados

### Assinatura
- [ ] **Product Owner:** ______________ Data: ____/____/____
- [ ] **Tech Lead:** _________________ Data: ____/____/____
- [ ] **QA:** _______________________ Data: ____/____/____

---

## 📝 NOTAS

**Data do Deploy:** ____________________  
**Versão:** v1.0.0  
**Responsável:** ____________________  
**Observações:** 

---

**Última atualização:** 06/11/2025  
**Próxima revisão:** Após primeiro deploy

