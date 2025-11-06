# 🔧 GUIA: APLICAR MIGRATIONS NO SUPABASE

**Data:** 09 de Outubro de 2025  
**Status:** 📋 INSTRUÇÕES

---

## 🎯 SITUAÇÃO ATUAL

✅ **Migration criada:** `supabase/migrations/20251009_complete_patients_management_system.sql`

❌ **Docker não está rodando** - Necessário para Supabase local

---

## 📊 VOCÊ TEM 2 OPÇÕES

### OPÇÃO 1: 🏠 USAR SUPABASE LOCAL (Recomendado para desenvolvimento)

#### Pré-requisitos:
- Docker Desktop instalado e rodando
- Supabase CLI instalado

#### Passo a Passo:

```bash
# 1. Iniciar Docker Desktop
# Abra Docker Desktop manualmente ou via comando:
# Windows: start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2. Aguardar Docker iniciar (pode demorar 1-2 minutos)

# 3. Iniciar Supabase local
supabase start

# 4. Aplicar migrations
supabase db push

# 5. Verificar se foi aplicado
supabase db diff

# 6. Ver tabelas criadas
supabase db list
```

**URLs após iniciar:**
- Studio: http://localhost:54323
- API: http://localhost:54321
- DB: postgresql://postgres:postgres@localhost:54322/postgres

---

### OPÇÃO 2: ☁️ USAR SUPABASE CLOUD (Recomendado para produção)

Se você já tem um projeto Supabase na cloud, pode aplicar diretamente lá.

#### Passo a Passo:

**A. Via Supabase Dashboard (Mais Fácil):**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo de `supabase/migrations/20251009_complete_patients_management_system.sql`
5. Clique em **Run**

**B. Via CLI (Conectando ao projeto remoto):**

```bash
# 1. Login no Supabase
supabase login

# 2. Linkar com projeto remoto
supabase link --project-ref [SEU_PROJECT_REF]

# Encontre seu PROJECT_REF em:
# https://supabase.com/dashboard/project/[PROJECT_REF]/settings/general

# 3. Aplicar migrations
supabase db push

# 4. Verificar
supabase db remote commit
```

---

## 🚀 OPÇÃO 3: APLICAR MANUALMENTE VIA SQL

Se preferir, pode copiar e colar o SQL diretamente:

1. Abra: `supabase/migrations/20251009_complete_patients_management_system.sql`
2. Copie TODO o conteúdo
3. Acesse seu Supabase:
   - **Local:** http://localhost:54323 (se Docker estiver rodando)
   - **Cloud:** https://supabase.com/dashboard → seu projeto → SQL Editor
4. Cole o SQL
5. Execute

---

## 📋 CHECKLIST APÓS APLICAR MIGRATION

Verifique se tudo foi criado corretamente:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'patient_documents', 'patient_timeline', 'patient_audit_log', 'patient_notes');

-- Deve retornar 5 tabelas

-- 2. Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('search_patients', 'calculate_patient_kpis', 'get_patient_summary', 'generate_patient_code');

-- Deve retornar 4 funções

-- 3. Verificar views criadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('patients_with_kpis', 'active_patients_summary');

-- Deve retornar 2 views

-- 4. Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'patient%';

-- Todas devem ter rowsecurity = true

-- 5. Verificar policies criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'patient%';

-- Deve retornar várias policies
```

---

## ⚙️ CONFIGURAR STORAGE (NECESSÁRIO PARA UPLOAD DE DOCUMENTOS)

Após aplicar a migration, configure o Storage:

```sql
-- 1. Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('patient-documents', 'patient-documents', true, 52428800); -- 50MB limit

-- 2. Policy para upload (apenas autenticados)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

-- 3. Policy para download (apenas autenticados)
CREATE POLICY "Authenticated users can download documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

-- 4. Policy para delete (apenas owner ou admin)
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (auth.uid() = owner OR 
   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'Admin'))
);
```

---

## 🔑 CONFIGURAR ENV VARIABLES

Após ter o Supabase rodando, crie `.env.local`:

```bash
# .env.local

# Supabase LOCAL (se usar Docker)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[pegar no supabase status]
SUPABASE_SERVICE_ROLE_KEY=[pegar no supabase status]

# Supabase CLOUD (se usar projeto remoto)
# NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[da dashboard]
# SUPABASE_SERVICE_ROLE_KEY=[da dashboard]
```

**Para obter as keys:**

**Local:**
```bash
supabase status
```

**Cloud:**
1. https://supabase.com/dashboard/project/[PROJECT_REF]/settings/api
2. Copie `URL` e `anon/public` key

---

## 🧪 TESTAR SE FUNCIONOU

```typescript
// test/supabase-connection.test.ts

import { supabase } from '@/lib/supabaseClient';

async function testConnection() {
  // 1. Testar conexão
  const { data, error } = await supabase
    .from('patients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Erro ao conectar:', error);
    return false;
  }
  
  console.log('✅ Conectado ao Supabase!');
  
  // 2. Testar função
  const { data: kpis, error: kpiError } = await supabase
    .rpc('calculate_patient_kpis', { 
      patient_uuid: '00000000-0000-0000-0000-000000000000' 
    });
  
  if (kpiError && !kpiError.message.includes('not found')) {
    console.error('❌ Erro na função KPI:', kpiError);
    return false;
  }
  
  console.log('✅ Funções SQL funcionando!');
  
  // 3. Testar busca
  const { data: searchResult, error: searchError } = await supabase
    .rpc('search_patients', { 
      search_query: 'test',
      max_results: 10 
    });
  
  if (searchError) {
    console.error('❌ Erro na busca:', searchError);
    return false;
  }
  
  console.log('✅ Busca full-text funcionando!');
  
  return true;
}

testConnection();
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Docker not running"
**Solução:** Inicie o Docker Desktop e aguarde 1-2 minutos

### Erro: "relation does not exist"
**Solução:** A migration não foi aplicada. Execute `supabase db push`

### Erro: "permission denied for schema public"
**Solução:** RLS está ativo. Certifique-se de estar autenticado ou desabilite temporariamente para testes

### Erro: "function does not exist"
**Solução:** Verifique se a migration completa foi executada. Rode novamente

### Storage não funciona
**Solução:** Execute os comandos SQL de configuração do Storage acima

---

## 📞 COMANDOS ÚTEIS

```bash
# Ver status do Supabase
supabase status

# Ver logs
supabase logs

# Resetar database (CUIDADO! Apaga tudo)
supabase db reset

# Criar nova migration
supabase migration new nome_da_migration

# Ver diferenças
supabase db diff

# Parar Supabase local
supabase stop

# Ver projetos remotos
supabase projects list

# Link com projeto remoto
supabase link --project-ref [REF]

# Push para remoto
supabase db push
```

---

## ✅ PRÓXIMOS PASSOS APÓS MIGRATION

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Configurar Storage bucket
3. ✅ Criar `.env.local` com as keys
4. ✅ Testar conexão com `test/supabase-connection.test.ts`
5. ✅ Atualizar `PatientContext.tsx` para usar os hooks
6. ✅ Testar CRUD na interface
7. ✅ Testar upload de documentos
8. ✅ Popular com dados de teste (opcional)

---

## 🎯 DECISÃO RÁPIDA

**Para Desenvolvimento Local:**
```bash
# Iniciar Docker Desktop (manualmente)
# Depois:
supabase start
supabase db push
```

**Para Produção/Cloud:**
```bash
supabase login
supabase link --project-ref [SEU_REF]
supabase db push
```

**Sem Docker (Alternativa):**
- Use Supabase Cloud via Dashboard
- Cole o SQL manualmente no SQL Editor

---

**Recomendação:** Se Docker já está instalado, use **Opção 1 (Local)** para desenvolvimento e depois faça deploy para cloud quando estiver pronto.

**Status:** ⏳ AGUARDANDO APLICAÇÃO DA MIGRATION

Escolha uma opção e siga o passo a passo! 🚀

