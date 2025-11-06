# 📄 Estrutura da Migration SQL - App para Pacientes

## 📊 Arquivo: APLICAR_MIGRATIONS_APP_PACIENTES.sql

**Total de linhas:** 687  
**Status:** ✅ Corrigido e pronto  
**Localização:** No clipboard + arquivo no projeto

---

## 🗂️ Estrutura do Arquivo

### PARTE 1: Tabelas (linhas 1-169)
```sql
Lines 22-23:  Extensões (uuid-ossp, pgcrypto)

Lines 26-41:  📋 patient_access_codes
              - Códigos de 6 dígitos
              - Expiração em 30 dias
              - 3 índices de performance

Lines 44-63:  🎥 exercise_videos  
              - Biblioteca de vídeos
              - YouTube, Vimeo, Storage
              - Thumbnails e categorias

Lines 66-91:  💪 patient_exercises
              - Exercícios prescritos
              - Sets, reps, duração
              - 5 índices otimizados

Lines 94-114: ✅ exercise_completions
              - Registro de conclusões
              - Feedback de dor/dificuldade
              - 5 índices de performance

Lines 117-133: 📊 patient_stats
               - Estatísticas agregadas
               - Streaks, completion rate
               - 1 índice

Lines 136-152: 💬 patient_messages
               - Chat (futuro)
               - Read/unread status
               - 4 índices

Lines 155-169: 📝 patient_access_logs
               - Auditoria de acessos
               - IP, user agent, device
               - 2 índices
```

### PARTE 2: Functions (linhas 172-310)
```sql
Lines 176-203: 🔐 generate_access_code()
               - Gera código aleatório único
               - 6 caracteres (A-Z, 2-9)
               - Loop até encontrar único

Lines 206-228: 🎫 create_patient_access_code()
               - Desativa códigos antigos
               - Cria novo código
               - Define expiração

Lines 231-279: 📈 update_patient_stats()
               - Conta exercícios
               - Calcula taxa de conclusão
               - Upsert em patient_stats

Lines 283-310: ✅ validate_access_code()
               - Valida código
               - Retorna dados do paciente
               - Atualiza último uso
               ⭐ CORRIGIDO: COALESCE(full_name, name)
```

### PARTE 3: Triggers (linhas 312-348)
```sql
Lines 316-322: ⏰ update_updated_at_column()
               - Atualiza timestamp automaticamente

Lines 324-334: 🔄 Triggers para exercise_videos e patient_exercises
               - Auto-update de updated_at

Lines 336-348: 📊 trigger_update_patient_stats()
               - Atualiza stats quando exercício concluído
```

### PARTE 4: RLS Policies (linhas 350-556)
```sql
Lines 354-360: 🔒 Enable RLS em todas as tabelas

Lines 363-391: 👨‍⚕️ Policies patient_access_codes
               - Terapeutas podem criar/ver
               - Service role pode validar

Lines 394-429: 🎥 Policies exercise_videos
               - Terapeutas podem CRUD
               - Service role pode ler

Lines 432-467: 💪 Policies patient_exercises
               - Terapeutas podem prescrever
               - Service role pode ler

Lines 470-486: ✅ Policies exercise_completions
               - Terapeutas podem ver
               - Service role pode gerenciar

Lines 489-505: 📊 Policies patient_stats
               - Terapeutas podem ver
               - Service role pode gerenciar

Lines 508-537: 💬 Policies patient_messages
               - Terapeutas podem ver/enviar
               - Service role pode gerenciar

Lines 540-556: 📝 Policies patient_access_logs
               - Service role pode gerenciar
               - Admins podem ver
```

### PARTE 5: Storage (linhas 558-618)
```sql
Lines 563-574: 📦 Bucket 'exercise-videos'
               - Público
               - 500MB limit
               - Tipos: video/image

Lines 577-618: 🔒 Storage Policies
               - Terapeutas: upload, update, delete
               - Público: view
               - Service role: all
```

### PARTE 6: Documentação (linhas 620-636)
```sql
Lines 624-630: 📖 Comments nas tabelas
Lines 632-635: 📖 Comments nas functions
```

### PARTE 7: Verificação (linhas 638-687)
```sql
Lines 646-659: ✅ Query de verificação
               - Conta tabelas criadas
               - Retorna total: 7

Lines 662-685: 🔧 Verificação da tabela patients
               ⭐ ADICIONADO NA CORREÇÃO
               - Verifica se existe
               - Cria se não existir
               - Mensagens de debug
```

---

## ⭐ CORREÇÕES APLICADAS

### Linha 295: Compatibilidade de Colunas
```sql
-- ANTES:
p.name as patient_name

-- DEPOIS:
COALESCE(p.full_name, p.name, 'Paciente') as patient_name
```

**Impacto:** Funciona com `name` ou `full_name`

### Linhas 662-685: Verificação da Tabela Patients
```sql
-- ADICIONADO:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    CREATE TABLE patients (...);
    RAISE NOTICE 'Tabela patients criada!';
  ELSE
    RAISE NOTICE 'Tabela patients já existe. OK!';
  END IF;
END $$;
```

**Impacto:** Cria tabela se não existir

---

## 📊 Estatísticas do SQL

```
Total de linhas:      687
Total de tabelas:     7 novas (+1 opcional)
Total de functions:   4
Total de triggers:    3
Total de policies:    20+
Storage buckets:      1
Índices:              17
Comentários:          11
```

---

## ✅ Tabelas Criadas

1. **patient_access_codes** - Códigos de acesso
2. **exercise_videos** - Biblioteca de vídeos
3. **patient_exercises** - Exercícios prescritos
4. **exercise_completions** - Conclusões registradas
5. **patient_stats** - Estatísticas agregadas
6. **patient_messages** - Mensagens (futuro chat)
7. **patient_access_logs** - Logs de auditoria
8. **patients** _(opcional, se não existir)_

---

## 🎯 Como Aplicar

### Opção 1: Dashboard (Recomendado)
```
1. https://supabase.com/dashboard
2. SQL Editor
3. Ctrl+V (já no clipboard!)
4. RUN
5. ✅ Sucesso!
```

### Opção 2: Por Partes
```sql
-- Parte 1: Linhas 1-169 (Tabelas)
-- Parte 2: Linhas 172-310 (Functions)
-- Parte 3: Linhas 312-618 (Triggers + Policies + Storage)
-- Parte 4: Linhas 620-687 (Docs + Verificação)
```

---

## 🔍 Destaques Importantes

### 🟢 Segurança
```sql
- RLS habilitado em TODAS as tabelas
- 20+ policies específicas por role
- Service role para APIs
- Authenticated para terapeutas
```

### 🟢 Performance
```sql
- 17 índices estratégicos
- Índices compostos onde necessário
- Partial indexes (WHERE clauses)
```

### 🟢 Manutenibilidade
```sql
- Comments em todas as tabelas/functions
- Nomes descritivos
- Estrutura organizada
- Verificações de dependências
```

### 🟢 Robustez
```sql
- IF NOT EXISTS em tudo
- DROP POLICY IF EXISTS
- ON CONFLICT clauses
- Verificação de tabela patients
- COALESCE para compatibilidade
```

---

## 🎉 STATUS

```
Arquivo:          APLICAR_MIGRATIONS_APP_PACIENTES.sql
Linhas:           687
Status:           ✅ Corrigido
No Clipboard:     ✅ SIM
Dashboard:        ✅ Aberto
Pronto:           ✅ SIM
```

---

**👉 Cole agora no Supabase Dashboard! Ctrl+V → RUN ✅**

**MoocaFisio - moocafisio.com.br** 🚀

