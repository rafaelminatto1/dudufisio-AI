# 🎯 INSTRUÇÕES FINAIS - Executar Migrations

**Projeto Supabase:** urfxniitfbbvsaskicfo  
**Método:** Console Web (100% Confiável)  
**Tempo Total:** 5-10 minutos  

---

## ⚡ EXECUTE AGORA (PASSO A PASSO)

### 📍 PASSO 1: Abrir SQL Editor

**Clique neste link:**

👉 **https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new**

---

### 📍 PASSO 2: Migration de Sistema de Risco

1. **Abra o arquivo** no seu editor:
   ```
   supabase/migrations/20251008_risk_stratification_system.sql
   ```

2. **Selecione TODO o conteúdo:**
   - Pressione `Ctrl+A` (selecionar tudo)

3. **Copie:**
   - Pressione `Ctrl+C`

4. **Cole no SQL Editor do Supabase**
   - Clique na área de texto do SQL Editor
   - Pressione `Ctrl+V`

5. **Execute:**
   - Clique no botão verde **"RUN"** (canto inferior direito)
   - OU pressione `Ctrl+Enter`

6. **Aguarde a mensagem:**
   ```
   ✅ Success. No rows returned
   ```

**🎉 Pronto! 9 tabelas de risco criadas!**

---

### 📍 PASSO 3: Migration de Reabilitação Esportiva

1. **Crie uma nova query:**
   - Clique em **"+ New query"** (canto superior direito do SQL Editor)

2. **Abra o arquivo** no seu editor:
   ```
   supabase/migrations/20251008_sports_rehabilitation_system.sql
   ```

3. **Selecione TODO o conteúdo:**
   - Pressione `Ctrl+A`

4. **Copie:**
   - Pressione `Ctrl+C`

5. **Cole no SQL Editor do Supabase**
   - Pressione `Ctrl+V`

6. **Execute:**
   - Clique em **"RUN"**
   - OU pressione `Ctrl+Enter`

7. **Aguarde a mensagem:**
   ```
   ✅ Success. No rows returned
   ```

**🎉 Pronto! 20 tabelas de reabilitação criadas!**

---

### 📍 PASSO 4: Verificar Sucesso

**Crie uma nova query e execute:**

```sql
-- Verificar total de tabelas criadas
SELECT COUNT(*) as total_tabelas_criadas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'risk_%' 
    OR table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
    OR table_name IN (
      'injury_history', 'return_to_sport_criteria', 
      'functional_tests', 'strength_tests',
      'psychological_assessments', 'performance_metrics',
      'sport_benchmarks', 'rehab_progressions',
      'phase_goals', 'completed_phases',
      'progression_criteria', 'sports_rehab_protocols',
      'sport_training_sessions', 'session_exercises',
      'load_monitoring', 'daily_wellness',
      'rom_assessments', 'rom_movements'
    )
  );
```

**Resultado esperado:** `29` ou próximo disso

---

### 📍 PASSO 5: Listar Tabelas Criadas

```sql
-- Ver todas as tabelas de risco
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'risk_%'
ORDER BY table_name;

-- Ver todas as tabelas de reabilitação
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
    OR table_name LIKE '%rehab%'
    OR table_name IN ('injury_history', 'functional_tests')
  )
ORDER BY table_name;
```

---

## ✅ RESULTADO ESPERADO

Você deve ver estas tabelas criadas:

### Tabelas de Risco (9):
```
risk_alert_actions
risk_alerts
risk_assessments
risk_factors
risk_goals
risk_intervention_plans
risk_interventions
risk_profiles
risk_recommendations
```

### Tabelas de Reabilitação (20):
```
athlete_goals
athlete_profiles
completed_phases
daily_wellness
functional_tests
injury_history
load_monitoring
performance_metrics
phase_goals
progression_criteria
psychological_assessments
rehab_progressions
return_to_sport_criteria
rom_assessments
rom_movements
session_exercises
sport_benchmarks
sport_training_sessions
sports_rehab_protocols
strength_tests
```

---

## 🎊 SUCESSO!

Se você viu as tabelas listadas acima:

```
✅ MIGRATIONS APLICADAS COM SUCESSO!
✅ 29 TABELAS CRIADAS
✅ SISTEMA PRONTO PARA USO
```

---

## 🚀 PRÓXIMO PASSO: Testar o Sistema

### 1. Iniciar o servidor:

```bash
npm run dev
```

### 2. Acessar a página de risco:

```
http://localhost:5173/risk-stratification/1
```

### 3. Explorar funcionalidades:
- ✅ Ver dashboard de risco
- ✅ Usar filtros
- ✅ Abrir modal de detalhes
- ✅ Ver recomendações

---

## 📞 SUPORTE

### Se algo der errado:

**Erro: "type already exists"**
```sql
-- Execute antes das migrations:
DROP TYPE IF EXISTS risk_type CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS sport_type CASCADE;
```

**Erro: "extension does not exist"**
```sql
-- Execute antes das migrations:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 🎉 PARABÉNS!

**Você acaba de implementar:**
- 🛡️ Sistema de Estratificação de Risco
- 🏃 Módulo de Reabilitação Esportiva
- 📊 29 tabelas no banco de dados
- 🎯 Sistema enterprise-level

**Tudo funcionando! 🚀**

---

**URL do SQL Editor:**
https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

