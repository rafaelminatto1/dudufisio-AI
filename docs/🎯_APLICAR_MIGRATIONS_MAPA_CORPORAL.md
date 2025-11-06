# 🎯 Instruções: Aplicar Migrations do Mapa Corporal

## ✅ O Que Foi Implementado

1. ✅ **Persistência de sessão mock** - Sessions agora persistem no localStorage
2. ✅ **Script de validação Supabase** - Para testar conexão
3. ✅ **RLS policies permissivas** - Para desenvolvimento
4. ✅ **Rota corrigida** - `/patients/PAT-001` agora funciona
5. ✅ **Fallback mock** - Se Supabase falhar, usa mock data
6. ✅ **Dados seed** - 3 sessões de teste para PAT-001
7. ✅ **Error handling melhorado** - Loading states e mensagens de erro

## 📋 Passos para Aplicar

### 1. Aplicar Migration de RLS (IMPORTANTE!)

Abra o **Supabase Dashboard** → **SQL Editor** → **New Query**

Cole e execute:

```sql
-- Migration: Fix RLS for Body Map
-- Desabilitar RLS para desenvolvimento
ALTER TABLE body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_regions_reference DISABLE ROW LEVEL SECURITY;

-- Garantir permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO anon;
GRANT SELECT ON body_regions_reference TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO authenticated;
GRANT SELECT ON body_regions_reference TO authenticated;

-- Confirmação
SELECT '✅ RLS policies configuradas para desenvolvimento' as status;
```

### 2. Aplicar Dados de Teste (OPCIONAL)

Se quiser dados de exemplo para testar:

```sql
-- Inserir sessões de teste
INSERT INTO body_map_sessions (
  id,
  patient_id,
  session_date,
  main_complaint_region,
  main_complaint_description,
  overall_pain_level,
  pain_free,
  notes,
  created_by,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'patient-1',
  NOW() - INTERVAL '7 days',
  'lombar',
  'Dor lombar após exercício de levantamento de peso',
  6,
  false,
  'Paciente relata dor intensa ao realizar movimentos de flexão.',
  'mock-admin-1',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),
(
  gen_random_uuid(),
  'patient-1',
  NOW() - INTERVAL '2 days',
  'lombar',
  'Melhora significativa da dor lombar',
  3,
  false,
  'Paciente apresenta evolução positiva. Dor diminuiu consideravelmente.',
  'mock-admin-1',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'patient-1',
  NOW(),
  NULL,
  'Paciente relata ausência completa de dor',
  0,
  true,
  'Excelente evolução! Paciente sem queixas álgicas.',
  'mock-admin-1',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Confirmação
SELECT '✅ Dados de teste inseridos' as status;
SELECT COUNT(*) as total_sessions FROM body_map_sessions WHERE patient_id = 'patient-1';
```

### 3. Reiniciar o Servidor de Desenvolvimento

```powershell
# Parar servidor se estiver rodando (Ctrl+C no terminal)
# Depois reiniciar:
npm run dev
```

### 4. Testar no Navegador

1. Acesse: `http://localhost:5175/patients/PAT-001`
2. Faça login com: **admin@dudufisio.com** / **demo123456**
3. A aplicação deve redirecionar automaticamente para `/patients/PAT-001`
4. Clique na aba **"Mapa de Dor"**
5. Deve aparecer:
   - ✅ Formulário para criar nova sessão
   - ✅ Histórico com 3 sessões (se aplicou dados seed)
   - ✅ Timeline de evolução da dor

## 🔍 Validar Conexão Supabase (Opcional)

Para validar se a conexão está OK:

```powershell
npx tsx scripts/validate-supabase.ts
```

Este script vai testar:
- ✅ Variáveis de ambiente
- ✅ Formato da URL
- ✅ Conexão com banco
- ✅ Tabelas do body map
- ✅ Autenticação

## 🎉 Resultado Esperado

### ✅ O que deve funcionar agora:

1. **Sessão persiste** - Não perde login ao navegar
2. **Rota PAT-001** - Funciona diretamente
3. **Aba Mapa de Dor** - Aparece e é clicável
4. **Criar sessões** - Pode salvar novas sessões
5. **Ver histórico** - Lista sessões anteriores
6. **Timeline** - Mostra evolução da dor
7. **Loading states** - Mostra spinner ao carregar
8. **Mensagens de erro** - Informa se algo falhar
9. **Fallback mock** - Funciona mesmo se Supabase falhar

### ⚠️ Se ainda não funcionar:

1. Verifique no console do navegador (F12):
   - Procure por erros em vermelho
   - Verifique se aparece "✅ Sessão mock persistida"
   - Verifique se aparece "✅ Supabase Client inicializado"

2. Verifique o arquivo `.env.local`:
   - Deve conter `VITE_SUPABASE_URL`
   - Deve conter `VITE_SUPABASE_ANON_KEY`

3. Limpe o cache do navegador:
   - Pressione `Ctrl+Shift+Delete`
   - Selecione "Cache" e "Cookies"
   - Clique em "Limpar dados"
   - Recarregue a página

## 📊 Logs Úteis

Ao navegar, você deve ver no console:

```
💾 Sessão mock persistida após login: admin@dudufisio.com
✅ Supabase Client inicializado
📍 URL: https://urfxniitfbbvsaskicfo.supabase.co
📊 Carregando histórico de mapa corporal para paciente: patient-1
✅ Sessões carregadas: 3
```

## 🚀 Próximos Passos (Futuro)

Para produção, lembre-se de:
- [ ] Habilitar RLS policies com regras adequadas
- [ ] Remover dados seed de teste
- [ ] Configurar autenticação real do Supabase
- [ ] Adicionar validações mais rigorosas
- [ ] Implementar auditoria de alterações

---

**🎯 Status:** Todas as mudanças foram aplicadas no código!
**⚠️ Falta:** Aplicar migrations no banco de dados via Dashboard

