# ⚡ EXECUTAR MIGRATIONS - Método Console (5 minutos)

**Projeto:** urfxniitfbbvsaskicfo  
**Método:** Console Web (Mais Fácil e Confiável)  

---

## 🎯 PASSO A PASSO SIMPLES

### 1️⃣ Abrir SQL Editor (1 min)

**Clicar aqui:**
👉 https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

---

### 2️⃣ Migration 1: Sistema de Risco (2 min)

1. **Abrir arquivo:** `supabase/migrations/20251008_risk_stratification_system.sql`
2. **Selecionar tudo:** Ctrl+A
3. **Copiar:** Ctrl+C
4. **Colar no SQL Editor** do Supabase
5. **Clicar em "Run"** (botão verde inferior direito)
6. **Aguardar:** ✅ "Success. No rows returned"

**✅ Pronto! 9 tabelas criadas**

---

### 3️⃣ Migration 2: Reabilitação Esportiva (2 min)

1. **Clicar em "+ New query"** (canto superior direito)
2. **Abrir arquivo:** `supabase/migrations/20251008_sports_rehabilitation_system.sql`
3. **Selecionar tudo:** Ctrl+A
4. **Copiar:** Ctrl+C
5. **Colar no SQL Editor** do Supabase
6. **Clicar em "Run"**
7. **Aguardar:** ✅ "Success. No rows returned"

**✅ Pronto! 20 tabelas criadas**

---

### 4️⃣ Verificar (1 min)

Executar esta query no SQL Editor:

```sql
SELECT COUNT(*) as total_novas_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'risk_%' 
    OR table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
    OR table_name LIKE 'return_to%'
    OR table_name LIKE '%wellness%'
    OR table_name LIKE 'load_monitoring'
    OR table_name IN ('injury_history', 'functional_tests', 'strength_tests')
  );
```

**Resultado esperado:** `29`

---

## ✅ SUCESSO!

Se viu `29`, está tudo pronto! 🎉

### Agora você tem:

✅ 29 novas tabelas no banco  
✅ Sistema de Estratificação de Risco completo  
✅ Módulo de Reabilitação Esportiva estruturado  
✅ Enums, Views, Functions e Triggers ativos  

---

## 🚀 PRÓXIMO PASSO

### Testar o Sistema:

```bash
npm run dev
```

Acessar: http://localhost:5173/risk-stratification/1

---

**⚡ É ISSO! Simples e rápido! ⚡**

**URL:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

