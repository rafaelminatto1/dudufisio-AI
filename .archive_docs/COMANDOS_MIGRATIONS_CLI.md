# 🔧 Comandos para Migrations via CLI do Supabase

**Projeto:** urfxniitfbbvsaskicfo  
**Data:** 08/10/2025  

---

## ⚡ MÉTODO 1: Supabase Local + Push Remoto

### 1. Iniciar Supabase Local (já em execução)

```bash
# Já iniciado em background, aguardar finalizar
npx supabase start
```

### 2. Aguardar Supabase estar pronto

```bash
# Verificar status
npx supabase status

# Quando estiver pronto, você verá:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Status: running
```

### 3. Aplicar Migrations Localmente

```bash
# Aplicar todas as migrations pendentes
npx supabase db reset

# OU aplicar apenas as novas
npx supabase migration up
```

### 4. Verificar Migrations Aplicadas

```bash
# Listar migrations
npx supabase migration list

# Ver diferenças
npx supabase db diff
```

### 5. Push para Projeto Remoto (com token)

```bash
# Configurar token
$env:SUPABASE_ACCESS_TOKEN = "sbp_0d653de913f27ebb2b17f48494f799cacb9f2e7f"

# Fazer push das migrations
npx supabase db push --linked
```

---

## ⚡ MÉTODO 2: Push Direto (Requer senha do BD)

Se você tiver a senha do banco de dados:

```bash
npx supabase db push --db-url "postgresql://postgres.urfxniitfbbvsaskicfo:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Para obter a senha:**
- https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/database

---

## ⚡ MÉTODO 3: Console Web (MAIS FÁCIL)

**Recomendado se o CLI estiver com problemas**

Seguir: `🎯_INSTRUCOES_FINAIS_MIGRATIONS.md`

URL: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

---

## 🔍 VERIFICAR APÓS APLICAR

```bash
# Se aplicou localmente, conectar ao BD local
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Verificar tabelas
\dt risk_*
\dt *athlete*
```

```sql
-- OU via SQL
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE 'risk_%' OR table_name LIKE '%athlete%');
-- Deve retornar ~29
```

---

## 📋 MIGRATIONS A SEREM APLICADAS

1. ✅ `20251008_risk_stratification_system.sql` - 9 tabelas
2. ✅ `20251008_sports_rehabilitation_system.sql` - 20 tabelas

**Total:** 29 novas tabelas

---

## 🎯 STATUS ATUAL

```
Supabase Local: 🔄 Iniciando (background)
Migrations Criadas: ✅ Sim
Código no GitHub: ✅ Sim
Documentação: ✅ Completa
Próximo passo: Aplicar migrations
```

---

**Aguarde o Supabase local terminar de iniciar, então execute os comandos acima!**

**OU use o método do Console (mais rápido):** `🎯_INSTRUCOES_FINAIS_MIGRATIONS.md`

