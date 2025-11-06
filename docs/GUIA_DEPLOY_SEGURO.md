# 🚀 Guia de Deploy Seguro - Correções de Auditoria

**Versão:** 1.0  
**Data:** 27 de Outubro de 2025  
**Objetivo:** Aplicar correções de segurança de forma segura em produção

---

## ⚠️ PRÉ-REQUISITOS

Antes de começar, certifique-se de que:

- [x] Todas as mudanças foram revisadas e aceitas
- [x] Scripts de validação foram executados
- [x] Backup do banco de dados foi realizado
- [x] Equipe foi notificada sobre o deploy
- [ ] Janela de manutenção foi agendada (se necessário)

---

## 📋 CHECKLIST DE DEPLOY

### FASE 1: Preparação (30 min)

#### 1.1. Backup Completo
```bash
# Backup do Supabase (via Dashboard)
# 1. Acessar: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/storage
# 2. Criar backup manual
# 3. Download do backup

# Ou via CLI:
npx supabase db dump -f backup-pre-audit-fix-$(Get-Date -Format "yyyyMMdd-HHmmss").sql
```

#### 1.2. Validar Ambiente Local
```bash
# 1. Validar correções
powershell -ExecutionPolicy Bypass -File scripts/validate-security-fixes.ps1

# 2. Type-check
npm run type-check

# 3. Lint
npm run lint

# 4. Testes E2E críticos
npm run test:critical
```

#### 1.3. Documentar Estado Atual
```bash
# Capturar snapshot de políticas RLS atuais
psql $SUPABASE_DB_URL -c "\
  SELECT tablename, policyname, cmd, qual \
  FROM pg_policies \
  WHERE schemaname = 'public' \
  ORDER BY tablename;" > rls-policies-before.txt
```

---

### FASE 2: Deploy em Staging (1 hora)

#### 2.1. Revogar API Key Antiga
```
Google Cloud Console:
https://console.cloud.google.com/apis/credentials

Chave a revogar: AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM

Passos:
1. Fazer login
2. Selecionar projeto correto
3. APIs & Services > Credentials
4. Encontrar a key
5. Click em Delete/Revoke
6. Confirmar revogação
```

#### 2.2. Gerar Nova API Key
```
1. No Google Cloud Console
2. Create Credentials > API Key
3. Restrict key:
   - Application restrictions: None (ou HTTP referrers se aplicável)
   - API restrictions: Generative Language API
4. Copiar nova key
5. Adicionar em .env.local:
   VITE_GEMINI_API_KEY=<nova_key>
```

#### 2.3. Aplicar Migration RLS em Staging
```bash
# 1. Definir URL de staging
export STAGING_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# 2. Aplicar migration
npx supabase db push --db-url $STAGING_URL

# 3. Verificar políticas aplicadas
psql $STAGING_URL -c "\
  SELECT tablename, policyname \
  FROM pg_policies \
  WHERE schemaname = 'public' \
  AND tablename IN ('suppliers', 'supplies', 'stock_movements');"
```

#### 2.4. Testar em Staging
```bash
# 1. Apontar frontend para staging
# No .env.local:
VITE_SUPABASE_URL=https://[staging-project].supabase.co
VITE_SUPABASE_ANON_KEY=[staging-anon-key]

# 2. Executar testes E2E
npm run test:e2e:complete

# 3. Teste manual de cada role
npm run dev
# Login como: admin@test.com, therapist@test.com, patient@test.com
```

**Validações Manuais:**

- [ ] **Admin:**
  - [ ] Acessa dashboard de insumos
  - [ ] Vê lista completa de fornecedores
  - [ ] Consegue criar pedido de compra
  - [ ] Consegue aprovar pedidos

- [ ] **Therapist:**
  - [ ] Vê lista de insumos
  - [ ] Registra uso de insumo em sessão
  - [ ] NÃO consegue deletar fornecedores
  - [ ] NÃO consegue aprovar pedidos de compra

- [ ] **Patient:**
  - [ ] Acessa apenas portal do paciente
  - [ ] NÃO acessa módulo de insumos
  - [ ] Vê apenas seus próprios dados

---

### FASE 3: Deploy em Produção (2 horas)

#### 3.1. Preparação Final
```bash
# 1. Criar tag de release
git tag -a v1.0.1-security-audit -m "Security audit fixes - Phase 1 & 2"

# 2. Push para repositório
git push origin v1.0.1-security-audit

# 3. Notificar equipe
# Enviar mensagem: "Deploy de correções de segurança em 15 minutos"
```

#### 3.2. Aplicar Migration em Produção
```bash
# 1. Backup final (via Supabase Dashboard)
# Dashboard > Settings > Database > Create Backup

# 2. Aguardar confirmação de backup
# Verificar: Dashboard > Settings > Database > Backups

# 3. Aplicar migration
npx supabase db push

# 4. Verificar logs
# Dashboard > Database > Logs
```

#### 3.3. Deploy do Frontend
```bash
# 1. Build local para validar
npm run build

# 2. Testar build local
npm run start
# Acessar: http://localhost:4173

# 3. Deploy via Vercel
git push origin main
# Vercel fará deploy automático

# Ou manual:
npm run vercel:deploy
```

#### 3.4. Validação Pós-Deploy
```bash
# 1. Smoke tests
npm run test:e2e:critical

# 2. Verificar logs do Sentry
# https://sentry.io/organizations/activity-fisioterapia/projects/dudu-aiok/

# 3. Monitorar performance
npm run perf:prod

# 4. Verificar RLS em produção
psql $PRODUCTION_URL -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
# Resultado esperado: 20+ políticas
```

---

### FASE 4: Monitoring (24 horas)

#### 4.1. Monitoramento Ativo
```bash
# 1. Monitorar logs (primeira hora)
# Sentry: https://sentry.io
# Vercel: https://vercel.com/dashboard

# 2. Verificar métricas
# - Erro rate < 0.1%
# - Response time < 200ms
# - Availability > 99.9%

# 3. Monitorar RLS performance
# Verificar slow queries no Supabase Dashboard
```

#### 4.2. Testes de Regressão
```bash
# Executar suite completa de testes
npm run test:full

# Testes de segurança
npm run test:security
```

---

## 🔄 ROLLBACK (Se Necessário)

### Se algo der errado:

#### Rollback da Migration
```bash
# 1. Conectar ao banco
psql $PRODUCTION_URL

# 2. Desabilitar RLS temporariamente
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplies DISABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

# 3. Restaurar do backup
# Via Supabase Dashboard: Settings > Database > Restore from backup
```

#### Rollback do Frontend
```bash
# 1. Reverter deploy no Vercel
# Dashboard > Deployments > [Previous Deployment] > Promote to Production

# 2. Ou via git:
git revert HEAD
git push origin main
```

---

## 🚨 CONTINGÊNCIA

### Problemas Conhecidos e Soluções

#### Problema: RLS bloqueia operações válidas
**Solução:**
```sql
-- Adicionar política temporária mais permissiva
CREATE POLICY "temporary_admin_access" ON [table]
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);
```

#### Problema: Performance degradada com RLS
**Solução:**
```sql
-- Adicionar índices
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_id_role ON users(id, role);

-- Verificar query plan
EXPLAIN ANALYZE SELECT * FROM supplies WHERE ...;
```

#### Problema: Frontend não conecta após deploy
**Solução:**
```bash
# 1. Verificar variáveis de ambiente no Vercel
# Dashboard > Settings > Environment Variables

# 2. Verificar CORS no Supabase
# Dashboard > Authentication > URL Configuration

# 3. Limpar cache do CDN
# Vercel: Dashboard > Deployments > [Latest] > Clear Cache
```

---

## ✅ CRITÉRIOS DE SUCESSO

O deploy é considerado bem-sucedido quando:

- [ ] 0 API keys hardcoded detectadas
- [ ] RLS habilitado em 11+ tabelas
- [ ] 20+ políticas RLS ativas
- [ ] Erro rate < 0.1%
- [ ] Response time < 200ms
- [ ] Todos os fluxos de usuário funcionando
- [ ] Testes E2E passando (100%)
- [ ] Sem reclamações de usuários (24h)

---

## 📞 CONTATOS DE EMERGÊNCIA

**Em caso de incidente de segurança:**
1. Desativar aplicação imediatamente
2. Notificar responsável de segurança
3. Iniciar procedimento de incident response
4. Documentar tudo

---

## 📚 REFERÊNCIAS

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Deployment Best Practices](https://vercel.com/docs/deployments/overview)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

**✅ SIGA ESTE GUIA PASSO A PASSO PARA UM DEPLOY SEGURO!**

*Guia criado em 27/10/2025*

