# 🚀 GUIA RÁPIDO: Aplicar Migration do Body Map

## ⚡ Aplicação Rápida (5 minutos)

### Passo 1: Acessar Supabase Dashboard
1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Faça login se necessário
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Executar Migration
1. Clique em **New Query**
2. Copie TODO o conteúdo do arquivo `APLICAR_BODY_MAP_SIMPLES.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou Ctrl+Enter)
5. Aguarde aparecer "Success" ✅

### Passo 3: Verificar se Funcionou
Execute esta query para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'body_map%';
```

**Resultado esperado:**
```
table_name
body_map_sessions
body_map_pain_regions
```

### Passo 4: Testar na Aplicação
1. Reinicie o servidor: `npm run dev`
2. Vá para `/agenda`
3. Clique em um agendamento
4. Clique em **"Iniciar Atendimento"**
5. ✅ **NÃO deve mais aparecer erro 404!**

## 🔍 Verificação Completa

Se quiser verificar tudo está funcionando:

```sql
-- 1. Verificar estrutura das tabelas
\d body_map_sessions
\d body_map_pain_regions

-- 2. Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('body_map_sessions', 'body_map_pain_regions');

-- 3. Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('body_map_sessions', 'body_map_pain_regions');

-- 4. Testar inserção (opcional)
INSERT INTO body_map_sessions (
  patient_id,
  session_number,
  session_date,
  pain_free
) VALUES (
  (SELECT id FROM patients LIMIT 1),
  1,
  NOW(),
  false
) RETURNING id;
```

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Solução**: As tabelas já existem. Pule para o Passo 4.

### Erro: "permission denied"
**Solução**: Certifique-se de estar logado como admin no Supabase.

### Erro: "foreign key constraint"
**Solução**: Verifique se as tabelas `patients`, `users` e `appointments` existem:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('patients', 'users', 'appointments');
```

## ✅ Resultado Final

Após aplicar com sucesso:
- ✅ Erro 404 eliminado
- ✅ Body Map funcional no modal
- ✅ Histórico sendo salvo no banco
- ✅ Comparação entre sessões funcionando
- ✅ Alertas de piora de dor operacionais

## 📞 Suporte

Se algo der errado:
1. Copie a mensagem de erro completa
2. Verifique se está no projeto correto: `urfxniitfbbvsaskicfo`
3. Tente executar apenas a primeira parte (CREATE TABLE) primeiro

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil
**Impacto**: Alto (resolve erro 404 crítico)
