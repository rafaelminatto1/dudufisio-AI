# 🎯 APLICAR MIGRATIONS AGORA - Guia Passo-a-Passo

## ⚡ MIGRATION SQL JÁ ESTÁ NO SEU CLIPBOARD!

✅ **Arquivo consolidado pronto:** `APLICAR_MIGRATIONS_APP_PACIENTES.sql`  
✅ **Já copiado para clipboard** - Basta colar!

---

## 🚀 Passo-a-Passo (5 minutos)

### 1️⃣ Abrir Dashboard do Supabase

**Clique aqui ou cole no navegador:**
```
https://supabase.com/dashboard
```

### 2️⃣ Selecionar Projeto

- Faça login (se necessário)
- Selecione o projeto **MoocaFisio**
- Aguarde carregar

### 3️⃣ Ir para SQL Editor

**Navegação:**
```
Dashboard → SQL Editor (menu lateral esquerdo)
```

Ou clique em **"New Query"** ou **"SQL"**

### 4️⃣ Colar a Migration

1. Clique na área de texto do editor SQL
2. **Ctrl+V** (ou Cmd+V no Mac) para colar
3. Você verá ~350 linhas de SQL

### 5️⃣ Executar

1. Clique no botão **"RUN"** (canto inferior direito)
2. Aguarde a execução (~10 segundos)
3. Veja mensagem de sucesso

### 6️⃣ Verificar

Você deve ver no resultado:
```
status            | total
------------------+-------
Tabelas criadas   |     7
```

Se aparecer **7**, está tudo certo! ✅

---

## 📋 O Que Será Criado

### Tabelas (7)
```
✅ patient_access_codes     - Códigos de acesso
✅ exercise_videos          - Biblioteca de vídeos
✅ patient_exercises        - Exercícios prescritos
✅ exercise_completions     - Registro de conclusões
✅ patient_stats            - Estatísticas dos pacientes
✅ patient_messages         - Chat (futuro)
✅ patient_access_logs      - Logs de auditoria
```

### Functions (4)
```
✅ generate_access_code()           - Gera código único
✅ create_patient_access_code()     - Cria código para paciente
✅ update_patient_stats()           - Atualiza estatísticas
✅ validate_access_code()           - Valida código na login
```

### Triggers (3)
```
✅ update_exercise_videos_updated_at
✅ update_patient_exercises_updated_at
✅ after_exercise_completion (atualiza stats)
```

### RLS Policies (20+)
```
✅ Segurança completa
✅ Paciente vê apenas seus dados
✅ Terapeuta vê todos os dados
✅ Service role para APIs
```

### Storage (1 bucket + 5 policies)
```
✅ Bucket 'exercise-videos' (público, 500MB)
✅ Policies de upload/view/update/delete
```

---

## ✅ Após Aplicar

### Próximo Passo Automático:

```bash
# Terminal
npm run seed:patient
```

Isso irá:
1. ✅ Criar paciente de teste
2. ✅ Criar 3 vídeos de exercícios
3. ✅ Prescrever exercícios
4. ✅ Gerar código de acesso
5. ✅ Salvar em `CODIGO_ACESSO_TESTE.txt`

### Depois:

```bash
# Iniciar tudo
npm run start:patient-app
```

---

## 🐛 Se der erro na Migration

### Erro: "relation patients does not exist"
**Solução:** A tabela `patients` precisa existir primeiro.

Verifique se existe:
```sql
SELECT COUNT(*) FROM patients;
```

Se não existir, crie antes:
```sql
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  photo_url TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Erro: "relation users does not exist"
**Solução:** A tabela `users` precisa existir primeiro.

Verifique:
```sql
SELECT COUNT(*) FROM users;
```

### Erro: "storage.buckets permission denied"
**Solução:** Execute a parte 1 primeiro (tabelas), depois a parte 2 (storage) separadamente.

**Parte 1 (Tabelas):**
- Cole apenas até a linha que diz `-- PARTE 2: STORAGE`

**Parte 2 (Storage):**
- Cole apenas de `-- PARTE 2: STORAGE` em diante

---

## 🎯 Checklist de Aplicação

- [ ] ✅ Abrir Supabase Dashboard
- [ ] ✅ Selecionar projeto MoocaFisio
- [ ] ✅ Ir para SQL Editor
- [ ] ✅ Colar migration (Ctrl+V)
- [ ] ✅ Clicar RUN
- [ ] ✅ Ver "7 tabelas criadas"
- [ ] ✅ Executar `npm run seed:patient`
- [ ] ✅ Ver arquivo `CODIGO_ACESSO_TESTE.txt`
- [ ] ✅ Executar `npm run start:patient-app`
- [ ] ✅ Acessar http://localhost:5173/patient/login
- [ ] ✅ Usar código do arquivo

---

## 🌐 Links Úteis

**Supabase Dashboard:**
https://supabase.com/dashboard

**SQL Editor direto:**
https://supabase.com/dashboard/project/_/sql/new

**Storage:**
https://supabase.com/dashboard/project/_/storage/buckets

---

## ⚡ Atalho Rápido

Se você tem acesso direto ao SQL do Supabase:

```bash
# Via psql (se configurado)
psql $DATABASE_URL < APLICAR_MIGRATIONS_APP_PACIENTES.sql
```

Ou:

```bash
# Via Supabase CLI (quando conectividade voltar)
npx supabase db push
```

---

## 🎉 Após Aplicar com Sucesso

Você verá no Supabase:

### Tables (7)
✅ patient_access_codes  
✅ exercise_videos  
✅ patient_exercises  
✅ exercise_completions  
✅ patient_stats  
✅ patient_messages  
✅ patient_access_logs  

### Storage
✅ exercise-videos bucket

### Policies
✅ 20+ policies ativas

---

## 📞 Próxima Ação

**DEPOIS de aplicar a migration:**

```bash
# 1. Popular dados de teste
npm run seed:patient

# 2. Iniciar sistema
npm run start:patient-app

# 3. Testar
# Abrir: http://localhost:5173/patient/login
# Código em: CODIGO_ACESSO_TESTE.txt
```

---

## ✅ Status

```
Migration SQL:  ✅ PRONTA (no clipboard)
Destino:        Supabase Dashboard > SQL Editor
Ação:           Ctrl+V → RUN
Tempo:          ~5 minutos
Resultado:      7 tabelas + functions + policies + storage
```

---

**🚀 Cole agora e vamos testar! A migration está no seu clipboard!**

**Ctrl+V → RUN → Sucesso! ✅**

