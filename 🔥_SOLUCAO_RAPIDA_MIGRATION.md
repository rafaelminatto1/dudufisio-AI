# 🔥 SOLUÇÃO RÁPIDA: APLICAR MIGRATION

**Situação:** Conflito entre migrations locais e remotas  
**Solução:** Aplicar via SQL diretamente no Dashboard  

---

## ⚡ SOLUÇÃO MAIS RÁPIDA (3 minutos)

### Passo 1: Copiar SQL

Abra o arquivo: `supabase/migrations/20251009_complete_patients_management_system.sql`

Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)

### Passo 2: Aplicar no Dashboard

1. Acesse: https://supabase.com/dashboard/project/**urfxniitfbbvsaskicfo**/sql/new

2. Cole o SQL no editor (Ctrl+V)

3. Clique em **Run** ▶️

### Passo 3: Configurar Storage

Cole e execute este SQL também:

```sql
-- Criar bucket para documentos de pacientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents', 
  'patient-documents', 
  true, 
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Upload (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

-- Policy: Download (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated users can download documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

-- Policy: Delete (apenas owner ou admin)
CREATE POLICY IF NOT EXISTS "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (auth.uid() = owner OR 
   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'Admin'))
);
```

### Passo 4: Verificar

Execute para confirmar que tudo foi criado:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'patient%'
ORDER BY table_name;

-- Ver funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('search_patients', 'calculate_patient_kpis', 'get_patient_summary', 'generate_patient_code');

-- Ver views criadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'patient%';
```

**Resultado esperado:**
- ✅ 5 tabelas: patients, patient_documents, patient_timeline, patient_audit_log, patient_notes
- ✅ 4 funções: search_patients, calculate_patient_kpis, get_patient_summary, generate_patient_code
- ✅ 2 views: patients_with_kpis, active_patients_summary

---

## 🎯 DEPOIS DE APLICAR

### 1. Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# .env.local

# Supabase Cloud - Projeto: dudufisio-AI
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PEGAR_NA_DASHBOARD]
SUPABASE_SERVICE_ROLE_KEY=[PEGAR_NA_DASHBOARD]
```

**Para pegar as keys:**
1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api
2. Copie `URL` e `anon key`
3. Copie `service_role key` (revelar primeiro)

### 2. Criar arquivo .env.local automaticamente

Ou execute este comando (cole as keys quando solicitado):

```powershell
# PowerShell
@"
# Supabase Cloud - Projeto: dudufisio-AI
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

### 3. Testar Conexão

```typescript
// Criar arquivo: test-supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  console.log('🧪 Testando conexão Supabase...\n');
  
  // 1. Testar conexão
  const { data, error } = await supabase
    .from('patients')
    .select('count');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('✅ Conectado ao Supabase!');
  console.log(`📊 Tabela patients acessível`);
  
  // 2. Testar função
  const { data: kpis, error: kpiError } = await supabase
    .rpc('calculate_patient_kpis', { 
      patient_uuid: '00000000-0000-0000-0000-000000000000' 
    });
  
  if (!kpiError || kpiError.message.includes('not found')) {
    console.log('✅ Função calculate_patient_kpis funcionando!');
  }
  
  // 3. Testar Storage
  const { data: buckets, error: bucketError } = await supabase
    .storage
    .listBuckets();
  
  if (!bucketError) {
    const hasPatientDocs = buckets.some(b => b.name === 'patient-documents');
    console.log(`✅ Storage configurado! Bucket patient-documents: ${hasPatientDocs ? '✓' : '✗'}`);
  }
  
  console.log('\n🎉 Tudo funcionando!\n');
}

testConnection();
```

Execute:
```bash
npx tsx test-supabase.ts
```

---

## 🚀 COMEÇAR A USAR

Agora você pode usar os hooks React Query:

```typescript
// Em qualquer componente
import { usePatients, useCreatePatient } from '@/hooks/usePatients.query';

function MinhaPage() {
  const { data, isLoading } = usePatients();
  const createMutation = useCreatePatient();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>Pacientes: {data?.total}</h1>
      {/* ... */}
    </div>
  );
}
```

---

## ✅ CHECKLIST FINAL

- [ ] SQL aplicado no Dashboard
- [ ] Storage configurado
- [ ] Tabelas verificadas (5 tabelas)
- [ ] Funções verificadas (4 funções)
- [ ] Views verificadas (2 views)
- [ ] `.env.local` criado com keys
- [ ] Teste de conexão passou
- [ ] Hooks React Query funcionando

---

## 🎯 LINKS ÚTEIS

**Seu Projeto:**
- Dashboard: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- SQL Editor: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
- API Settings: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api
- Table Editor: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
- Storage: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/storage/buckets

---

**Status:** ⏳ AGUARDANDO VOCÊ APLICAR O SQL NO DASHBOARD

**Tempo estimado:** 3-5 minutos

**Próximo passo:** Abra o SQL Editor e cole a migration! 🚀

