# Como Aplicar a Migration do Body Map

## ✅ Migration Criada
**Arquivo**: `20251029000001_create_body_map_tables.sql`

Esta migration cria as tabelas necessárias para o sistema de Body Map (Mapa Corporal de Dor):
- `body_map_sessions` - Sessões de registro do mapa
- `body_map_pain_regions` - Regiões específicas de dor

## 📋 O que a Migration Faz

### 1. Tabelas Criadas
- ✅ `body_map_sessions` com soft delete, triggers e índices
- ✅ `body_map_pain_regions` com relacionamento CASCADE
- ✅ Foreign keys para `patients`, `users` (therapist), e `appointments`
- ✅ Constraints de validação (intensidade 0-10, session_number > 0)

### 2. Segurança (RLS)
- ✅ Row Level Security habilitado
- ✅ Políticas para terapeutas (CRUD completo)
- ✅ Políticas para pacientes (apenas leitura dos próprios dados)
- ✅ Políticas para admins (acesso total)

### 3. Performance
- ✅ 8 índices otimizados
- ✅ Índices parciais (WHERE deleted_at IS NULL)
- ✅ Triggers automáticos para updated_at

## 🚀 Como Aplicar

### Opção 1: Via Supabase CLI (Recomendado para Produção)

```bash
# 1. Certifique-se de estar logado no Supabase CLI
npx supabase login

# 2. Link com seu projeto (se ainda não estiver linkado)
npx supabase link --project-ref urfxniitfbbvsaskicfo

# 3. Aplicar a migration
npx supabase db push

# 4. Verificar se foi aplicada
npx supabase db remote commit list
```

### Opção 2: Via Supabase Dashboard (Manual)

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Vá para **SQL Editor**
3. Abra o arquivo `20251029000001_create_body_map_tables.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**
7. Verifique se apareceu "Success" sem erros

### Opção 3: Via psql (Para Desenvolvedores)

```bash
# Conectar ao banco
psql "postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres"

# Executar a migration
\i supabase/migrations/20251029000001_create_body_map_tables.sql

# Verificar tabelas criadas
\dt body_map*
```

## ✅ Verificação

Após aplicar, verifique se as tabelas foram criadas:

### Via SQL Editor do Supabase:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'body_map%';

-- Verificar estrutura
\d body_map_sessions
\d body_map_pain_regions

-- Verificar RLS
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('body_map_sessions', 'body_map_pain_regions');

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('body_map_sessions', 'body_map_pain_regions');
```

### Via Aplicação:

1. Inicie o servidor: `npm run dev`
2. Vá para `/agenda`
3. Clique em um agendamento
4. Clique em **"Iniciar Atendimento"**
5. Verifique que **NÃO** aparece mais o erro 404:
   ```
   GET .../body_map_sessions?... 404 (Not Found)
   ```
6. O modal deve abrir sem erros
7. O Body Map deve estar funcional

## 🧪 Teste Manual das Tabelas

Após aplicar, você pode testar inserindo dados:

```sql
-- 1. Criar uma sessão de body map
INSERT INTO body_map_sessions (
  patient_id,
  session_number,
  session_date,
  pain_free
) VALUES (
  (SELECT id FROM patients LIMIT 1), -- Pegar ID de um paciente existente
  1,
  NOW(),
  false
) RETURNING id;

-- 2. Copie o ID retornado e use para criar regiões de dor
INSERT INTO body_map_pain_regions (
  session_id,
  region_id,
  body_region,
  intensity,
  type,
  notes
) VALUES (
  'ID_DA_SESSAO_AQUI', -- Cole o ID retornado acima
  'front-lower-back',
  'spine',
  7,
  'sharp',
  'Dor aguda ao inclinar'
);

-- 3. Consultar dados
SELECT 
  s.id,
  s.session_number,
  s.session_date,
  p.full_name as patient_name,
  COUNT(r.id) as pain_regions_count
FROM body_map_sessions s
JOIN patients p ON s.patient_id = p.id
LEFT JOIN body_map_pain_regions r ON s.id = r.session_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.session_number, s.session_date, p.full_name
ORDER BY s.session_date DESC;
```

## 🔒 Segurança

A migration inclui Row Level Security (RLS) configurado:

### Para Terapeutas:
- ✅ Podem criar, ler, atualizar sessões
- ✅ Podem gerenciar regiões de dor das suas sessões

### Para Pacientes:
- ✅ Podem apenas visualizar suas próprias sessões
- ✅ Não podem editar ou criar

### Para Admins:
- ✅ Acesso total a todas as operações

## 📊 Próximos Passos

Após aplicar esta migration:

1. ✅ Reinicie a aplicação (`npm run dev`)
2. ✅ Teste o Body Map no modal de evolução
3. ✅ Verifique que dados são salvos corretamente
4. ✅ Teste a comparação entre sessões
5. ✅ Verifique os alertas de piora de dor

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Solução**: A tabela já existe. Verifique se a migration já foi aplicada.

```sql
SELECT * FROM body_map_sessions LIMIT 1;
```

### Erro: "permission denied"
**Solução**: Certifique-se de estar usando a role service_role ou postgres.

### Erro: "foreign key constraint"
**Solução**: Verifique se as tabelas `patients`, `users` e `appointments` existem.

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('patients', 'users', 'appointments');
```

## 📝 Rollback (Se Necessário)

Se precisar reverter a migration:

```sql
-- ATENÇÃO: Isso vai deletar TODOS os dados do body map!
DROP TABLE IF EXISTS body_map_pain_regions CASCADE;
DROP TABLE IF EXISTS body_map_sessions CASCADE;
DROP FUNCTION IF EXISTS update_body_map_sessions_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_body_map_pain_regions_updated_at CASCADE;
```

## ✨ Resultado Esperado

Após aplicar com sucesso:
- ✅ Erro 404 eliminado
- ✅ Body Map funcional no modal de evolução
- ✅ Histórico de sessões sendo salvo
- ✅ Comparação entre sessões funcionando
- ✅ Alertas de piora de dor operacionais

