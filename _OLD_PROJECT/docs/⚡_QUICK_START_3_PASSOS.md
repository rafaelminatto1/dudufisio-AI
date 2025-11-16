# ⚡ QUICK START - 3 PASSOS SIMPLES

**Tempo Total:** 10 minutos ⏱️  
**Dificuldade:** 🟢 FÁCIL

---

## 🎯 3 PASSOS PARA TER TUDO FUNCIONANDO

```
┌──────────────────────────────────────┐
│  PASSO 1: Aplicar SQL (3 min)       │
│  ↓                                   │
│  PASSO 2: Configurar Keys (2 min)   │
│  ↓                                   │
│  PASSO 3: Testar (5 min)            │
│  ↓                                   │
│  🎉 FUNCIONANDO!                     │
└──────────────────────────────────────┘
```

---

## 🚀 PASSO 1: APLICAR SQL (3 minutos)

### 1.1 Abrir SQL Editor

Clique neste link:
**https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new** 🔗

### 1.2 Copiar Migration

Abra o arquivo:
```
supabase/migrations/20251009_complete_patients_management_system.sql
```

Selecione tudo: **Ctrl+A**  
Copie: **Ctrl+C**

### 1.3 Colar e Executar

No SQL Editor:
- Cole: **Ctrl+V**
- Clique em: **Run** ▶️
- Aguarde: ~10 segundos
- Veja: **Success** ✅

### 1.4 Configurar Storage

No mesmo SQL Editor, execute isto:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('patient-documents', 'patient-documents', true, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Authenticated upload" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-documents');

CREATE POLICY IF NOT EXISTS "Authenticated download" ON storage.objects 
FOR SELECT TO authenticated USING (bucket_id = 'patient-documents');
```

Clique em **Run** ▶️ novamente

**✅ PASSO 1 COMPLETO!**

---

## 🔑 PASSO 2: CONFIGURAR KEYS (2 minutos)

### 2.1 Pegar as Keys

Clique neste link:
**https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api** 🔗

Copie:
- **URL:** `https://urfxniitfbbvsaskicfo.supabase.co`
- **anon public:** Clique em **Copy** ao lado
- **service_role:** Clique em **Reveal**, depois **Copy**

### 2.2 Criar .env.local

Na raiz do projeto, crie o arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_a_anon_key
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_a_service_role_key
```

**Substitua** as keys pelas que você copiou!

**✅ PASSO 2 COMPLETO!**

---

## 🧪 PASSO 3: TESTAR (5 minutos)

### 3.1 Testar Conexão

Execute no terminal:

```bash
npx tsx scripts/test-supabase-connection.ts
```

**Resultado esperado:**
```
🧪 TESTE DE CONEXÃO SUPABASE
============================

📡 TESTE 1: Conexão Básica
   ✅ Conectado ao Supabase!

📊 TESTE 2: Verificar Tabelas
   ✅ patients
   ✅ patient_documents
   ✅ patient_timeline
   ✅ patient_audit_log
   ✅ patient_notes
   ✅ Todas as 5 tabelas criadas!

⚙️  TESTE 3: Verificar Funções SQL
   ✅ calculate_patient_kpis existe
   ✅ search_patients existe

🗄️  TESTE 4: Verificar Storage
   ✅ Bucket patient-documents criado!

🔒 TESTE 5: Verificar RLS
   ✅ RLS está ativo e funcionando!

==================================================

📊 RESULTADO: 5/5 testes passaram

🎉 TUDO FUNCIONANDO PERFEITAMENTE!
```

### 3.2 Testar na Interface

```bash
# Iniciar servidor
npm run dev
```

Abra: http://localhost:5176

1. Faça login
2. Vá em **Pacientes**
3. Você deve ver **3 pacientes** de demonstração!

### 3.3 Testar Funcionalidades

- [ ] ✅ Ver lista de pacientes
- [ ] ✅ Buscar por nome
- [ ] ✅ Filtrar por status
- [ ] ✅ Clicar em um paciente
- [ ] ✅ Ver detalhes com tabs
- [ ] ✅ Ver timeline de eventos
- [ ] ✅ Ver KPIs calculados

**✅ PASSO 3 COMPLETO!**

---

## 🎉 PARABÉNS!

Se você chegou até aqui, você tem:

```
┌──────────────────────────────────────┐
│  ✅ Database Profissional            │
│  ✅ 5 Tabelas Criadas                │
│  ✅ 4 Funções SQL                    │
│  ✅ Storage Configurado              │
│  ✅ Hooks React Query                │
│  ✅ Componentes Modernos             │
│  ✅ Sistema Funcionando!             │
│                                      │
│  🎊 TUDO PRONTO PARA USAR! 🎊        │
└──────────────────────────────────────┘
```

---

## 🎯 PRÓXIMAS AÇÕES

Agora que está funcionando, você pode:

1. **Criar pacientes reais** na interface
2. **Upload de documentos** (exames, laudos)
3. **Ver evolução** dos pacientes
4. **Exportar dados** para Excel
5. **Começar a usar** no dia a dia!

---

## 📚 DOCUMENTAÇÃO DISPONÍVEL

Se precisar de mais detalhes:

- 🔥 **Solução Rápida:** `🔥_SOLUCAO_RAPIDA_MIGRATION.md`
- 📝 **Checklist Completo:** `📝_CHECKLIST_IMPLEMENTACAO_FINAL.md`
- 🎉 **Resumo Visual:** `🎉_TUDO_IMPLEMENTADO_RESUMO_VISUAL.md`
- 📊 **Plano Estratégico:** `📊_PLANO_MELHORIAS_COMPLETO_SISTEMA.md`

---

## 🆘 PROBLEMAS?

### Teste não passou?

**Execute novamente o Passo 1** - A migration pode não ter sido aplicada completamente.

### Pacientes não aparecem?

**Verifique:**
1. `.env.local` existe e tem as keys corretas?
2. QueryClientProvider está no App.tsx?
3. Você fez login no sistema?

### Erro de import?

**Instale as dependências:**
```bash
npm install @tanstack/react-query @supabase/supabase-js sonner
```

---

## 💡 DICA PRO

Abra **3 abas** no navegador para facilitar:

1. **SQL Editor** - https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
2. **API Settings** - https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api
3. **Table Editor** - https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor

E **1 janela** do VSCode com a migration aberta!

---

## ⏱️ CRONÔMETRO

```
Passo 1: ⏱️ 3 minutos
Passo 2: ⏱️ 2 minutos
Passo 3: ⏱️ 5 minutos
────────────────────────
TOTAL:   ⏱️ 10 minutos
```

**Você consegue! 💪**

---

## 🎯 RESULTADO ESPERADO

Após completar os 3 passos:

```
✅ Pacientes aparecem na lista
✅ Busca funciona
✅ Criar/Editar/Excluir funciona
✅ Timeline mostra eventos
✅ Upload de documentos funciona
✅ KPIs são calculados
✅ Tudo sincronizado com Supabase
✅ Performance excelente
✅ UI moderna e bonita
✅ Sistema pronto para uso real!
```

---

**Bora começar?** Execute o **PASSO 1** agora! 🚀

**Tempo restante:** 10 minutos  
**Dificuldade:** 🟢 Muito Fácil  
**Resultado:** 🔥 Sistema Completo

**GO! GO! GO!** 🏃‍♂️💨

