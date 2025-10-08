# ✅ EXECUTAR MIGRATIONS - Método Console (RECOMENDADO)

**Projeto:** urfxniitfbbvsaskicfo  
**Método:** Console Web (100% Confiável)  
**Tempo:** 5 minutos  

---

## 🎯 MÉTODO MAIS FÁCIL E RÁPIDO

### 📍 PASSO 1: Abrir SQL Editor

**Clique aqui:**
👉 https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

---

### 📍 PASSO 2: Migration 1 - Sistema de Risco

1. **Abra:** `supabase/migrations/20251008_risk_stratification_system.sql`
2. **Ctrl+A** (selecionar tudo)
3. **Ctrl+C** (copiar)
4. **Cole no SQL Editor** do Supabase
5. **Clique "RUN"** (ou Ctrl+Enter)
6. **Aguarde:** ✅ "Success"

**✅ 9 tabelas criadas!**

---

### 📍 PASSO 3: Migration 2 - Reabilitação Esportiva

1. **Clique "+ New query"** (canto superior)
2. **Abra:** `supabase/migrations/20251008_sports_rehabilitation_system.sql`
3. **Ctrl+A** (selecionar tudo)
4. **Ctrl+C** (copiar)
5. **Cole no SQL Editor**
6. **Clique "RUN"**
7. **Aguarde:** ✅ "Success"

**✅ 20 tabelas criadas!**

---

### 📍 PASSO 4: Verificar

Execute esta query:

```sql
SELECT COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'risk_%' 
    OR table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
  );
```

**Resultado esperado:** `29`

---

## 🎊 PRONTO!

Se viu `29`, **TUDO FOI APLICADO COM SUCESSO!**

### Você agora tem:
✅ 29 novas tabelas  
✅ Sistema de Risco completo  
✅ Módulo de Reabilitação estruturado  
✅ Pronto para usar!  

---

## 🚀 PRÓXIMO PASSO

```bash
npm run dev
```

Acessar: http://localhost:5173/risk-stratification/1

---

**É ISSO! Simples e rápido! ⚡**

**URL:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

