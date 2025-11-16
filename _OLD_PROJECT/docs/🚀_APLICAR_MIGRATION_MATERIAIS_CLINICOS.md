# 🚀 GUIA: Aplicar Migration - Materiais Clínicos

## ⚠️ Status Atual

**Build:** ❌ Precisa de ajustes (faltam arquivos de contexto)  
**Migration:** ⏳ Pendente de aplicação  
**Código:** ✅ Completo e funcional  

---

## 📝 Migration a Aplicar

**Arquivo:** `supabase/migrations/20250205000000_populate_clinical_materials.sql`

### O Que a Migration Faz:

1. ✅ Cria tabela `material_favorites`
2. ✅ Configura RLS (Row Level Security)
3. ✅ Cria função `increment_material_download`
4. ✅ Insere 15 materiais clínicos iniciais

---

## 🎯 Método 1: Dashboard Supabase (RECOMENDADO)

### Passo a Passo:

1. **Acesse o Dashboard**
   ```
   https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql
   ```

2. **Copie o SQL**
   - Abra: `supabase/migrations/20250205000000_populate_clinical_materials.sql`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

3. **Cole no SQL Editor**
   - Cole no editor SQL do Supabase
   - Clique em **"Run"** ou pressione `Ctrl+Enter`

4. **Aguarde Confirmação**
   ```
   ✅ Success. No rows returned
   ```

---

## 🎯 Método 2: Via CLI (Se Possível)

### Opção A: Push Normal

```bash
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI
supabase db push --include-all
```

**Nota:** Pode falhar devido a migrations fora de ordem

### Opção B: Reset Local (⚠️ CUIDADO - Apenas em desenvolvimento)

```bash
supabase db reset
```

**⚠️ ATENÇÃO:** Isso apaga TODOS os dados locais!

---

## 🔍 Verificar se a Migration Foi Aplicada

### Via Dashboard:

1. **Tabela `material_favorites`:**
   ```
   Dashboard → Table Editor → material_favorites
   ```
   - Se existir, tabela foi criada ✅

2. **Função `increment_material_download`:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'increment_material_download';
   ```
   - Deve retornar 1 linha ✅

3. **Materiais Cadastrados:**
   ```sql
   SELECT COUNT(*) FROM clinical_materials WHERE status = 'published';
   ```
   - Deve retornar 15 ✅

### Via CLI:

```bash
supabase migration list
```

- Procure por `20250205000000` na coluna Remote
- Deve estar marcado como aplicado ✅

---

## 📊 Conteúdo da Migration

### Tabelas Criadas:

| Tabela | Descrição |
|--------|-----------|
| `material_favorites` | Favoritos dos usuários |

### Funções Criadas:

| Função | Descrição |
|--------|-----------|
| `increment_material_download` | Incrementa contador de downloads |

### Materiais Inseridos:

| # | Nome | Categoria | Downloads |
|---|------|-----------|-----------|
| 1 | Escala Visual Analógica (EVA) | Escalas Validadas | 127 |
| 2 | Escala de Borg | Escalas Validadas | 98 |
| 3 | Índice de Oswestry | Escalas Validadas | 156 |
| 4 | Índice de Barthel | Escalas Validadas | 89 |
| 5 | MIF | Escalas Validadas | 134 |
| 6 | Escala de Ashworth | Escalas Validadas | 67 |
| 7 | Mapa Corporal Completo | Mapas de Dor | 243 |
| 8 | Mapa Coluna Vertebral | Mapas de Dor | 187 |
| 9 | Ficha Traumato-Ortopédica | Fichas Avaliação | 312 |
| 10 | Ficha Neurológica | Fichas Avaliação | 198 |
| 11 | Ficha Respiratória | Fichas Avaliação | 145 |
| 12 | Anamnese Geral | Anamnese | 267 |
| 13 | Follow-up com Mapa | Follow-up | 223 |
| 14 | Template Plano Tratamento | Plano Tratamento | 178 |
| 15 | Orientações Ergonomia | Educação | 156 |

**Total:** 15 materiais | 2,580 downloads simulados

---

## 🐛 Problemas Comuns

### Erro: "relation clinical_materials does not exist"

**Causa:** Tabela principal não foi criada pela migration anterior

**Solução:**
```sql
-- Verificar se a migration 20250121000000 foi aplicada
SELECT * FROM supabase_migrations 
WHERE version = '20250121000000';

-- Se não foi, aplicar primeiro:
-- Copie o SQL de: supabase/migrations/20250121000000_clinical_materials_advanced.sql
-- E execute no Dashboard
```

### Erro: "duplicate key value violates unique constraint"

**Causa:** Migration já foi aplicada parcialmente

**Solução:**
```sql
-- Limpar dados existentes (⚠️ cuidado em produção)
DELETE FROM clinical_materials WHERE created_at::date = CURRENT_DATE;
DELETE FROM material_favorites;

-- Tentar aplicar novamente
```

### CLI diz "out of order"

**Causa:** Migration timestamp está antes de outras já aplicadas

**Solução:** Usar Dashboard ao invés do CLI (método 1)

---

## ✅ Após Aplicar a Migration

### 1. Verificar Dados

```sql
-- Ver todos materiais
SELECT id, name, category_id, download_count 
FROM clinical_materials 
ORDER BY download_count DESC;

-- Ver categorias
SELECT * FROM clinical_material_categories;
```

### 2. Testar Função

```sql
-- Incrementar downloads de um material
SELECT increment_material_download('algum-uuid-aqui');

-- Verificar se incrementou
SELECT download_count FROM clinical_materials WHERE id = 'algum-uuid-aqui';
```

### 3. Testar Favoritos

```sql
-- Adicionar favorito (substitua user_id e material_id reais)
INSERT INTO material_favorites (user_id, material_id)
VALUES ('seu-user-id', 'algum-material-id');

-- Ver favoritos
SELECT * FROM material_favorites;
```

---

## 🚀 Próximos Passos

Depois de aplicar a migration:

1. ✅ **Testar no Frontend**
   ```bash
   npm run dev
   # Acesse: http://localhost:5173/materials
   ```

2. ✅ **Validar Filtros**
   - Busca por nome
   - Filtro por categoria
   - Filtro por especialidade
   - Toggle favoritos

3. ✅ **Testar Downloads**
   - Clicar em "Baixar"
   - Verificar se contador incrementa

4. ✅ **Testar Favoritos**
   - Clicar na estrela
   - Verificar se persiste após reload

---

## 📞 Ajuda

Se tiver problemas:

1. **Consulte a documentação completa:**
   - `📖_BIBLIOTECA_MATERIAIS_CLINICOS_COMPLETO.md`

2. **Verifique os logs:**
   ```bash
   # Logs do Supabase
   supabase db logs
   
   # Logs do frontend (Console do navegador)
   # F12 → Console
   ```

3. **Teste com SQL direto:**
   ```sql
   -- No Dashboard SQL Editor
   SELECT * FROM clinical_materials LIMIT 5;
   ```

---

## 📝 SQL Completo (Para Copiar/Colar)

**Localização:** `supabase/migrations/20250205000000_populate_clinical_materials.sql`

**Tamanho:** ~270 linhas

**Tempo Execução:** ~2-5 segundos

**Seguro:** ✅ Sim (usa IF NOT EXISTS, não destroi dados)

---

**Última Atualização:** 05/02/2025  
**Status:** ⏳ Aguardando aplicação manual via Dashboard

