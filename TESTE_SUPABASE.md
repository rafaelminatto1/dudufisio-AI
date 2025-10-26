# 🧪 Teste de Persistência no Supabase

## ✅ Status das Migrações
**TODAS AS MIGRAÇÕES JÁ FORAM APLICADAS!**

```
Local          | Remote         | Status
---------------|----------------|--------
20250117000002 | 20250117000002 | ✅ Core tables (appointments)
20250203000006 | 20250203000006 | ✅ Fix foreign keys
20251023000939 | 20251023000939 | ✅ Enable realtime
```

## 🔍 Próximos Passos para Debug

### 1. Testar no Console do Navegador

Quando você criar um agendamento, **copie e cole aqui** as seguintes mensagens do console:

```
🔍 isSupabaseEnabled: true/false
✅ Supabase está configurado e disponível
OU
⚠️ Supabase NÃO disponível, usando mock

💾 appointmentService - Salvando no Supabase: {...}
   ID do agendamento: app_xxxxx
   Paciente: Nome do Paciente
   Horário: 2025-10-26T10:00:00
   → Criando NOVO agendamento no Supabase

✅ appointmentService - Agendamento CRIADO no Supabase com ID: uuid-xxxx
OU
❌ appointmentService - Erro ao salvar no Supabase: {...}
```

### 2. Verificar no Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Seu projeto: **urfxniitfbbvsaskicfo**
3. Menu **Table Editor** → Tabela `appointments`
4. Verifique se há agendamentos lá

### 3. Possíveis Problemas

#### Problema A: Supabase não está sendo usado
**Sintoma**: Console mostra "⚠️ Supabase NÃO disponível, usando mock"

**Solução**: Verificar se o cliente Supabase está inicializando corretamente
- Arquivo: `lib/supabaseClient.ts`
- Verificar se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas

#### Problema B: Erro ao salvar no Supabase
**Sintoma**: Console mostra "❌ Erro ao salvar no Supabase"

**Causas possíveis**:
1. **RLS (Row Level Security)** está bloqueando a inserção
   - Solução: Desabilitar RLS temporariamente ou ajustar políticas
2. **Falta de autenticação** - usuário não está logado
   - Solução: Fazer login ou desabilitar RLS
3. **Campos obrigatórios faltando**
   - Solução: Verificar quais campos são required na tabela

#### Problema C: Agendamento salva mas não aparece
**Sintoma**: Console mostra "✅ Criado" mas não aparece na agenda

**Causas possíveis**:
1. **Cache não está sendo limpo** após salvar
2. **Evento `appointments:changed` não está sendo ouvido**
3. **Filtro de data** está excluindo o agendamento
4. **RLS está bloqueando a leitura**

### 4. Teste Manual Rápido

Execute no **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Verificar se a tabela existe e tem dados
SELECT COUNT(*) FROM appointments;

-- 2. Ver últimos agendamentos criados
SELECT 
  id,
  patient_id,
  therapist_id,
  start_time,
  end_time,
  status,
  created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 5;

-- 3. Testar inserção manual
INSERT INTO appointments (
  patient_id,
  therapist_id,
  start_time,
  end_time,
  duration,
  title,
  status,
  type
) VALUES (
  (SELECT id FROM users WHERE role = 'patient' LIMIT 1),
  (SELECT id FROM users WHERE role = 'therapist' LIMIT 1),
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  60,
  'Teste Manual',
  'scheduled',
  'regular'
);

-- 4. Verificar se inseriu
SELECT * FROM appointments WHERE title = 'Teste Manual';
```

### 5. Desabilitar RLS Temporariamente (se necessário)

Se estiver dando erro de permissão, execute no **SQL Editor**:

```sql
-- APENAS PARA DESENVOLVIMENTO!
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

## 📋 Checklist de Debug

1. [ ] Abrir Console do navegador (F12)
2. [ ] Criar um agendamento
3. [ ] Copiar TODAS as mensagens do console que começam com 🔍, ✅, ❌, ⚠️, 💾
4. [ ] Verificar no Supabase Dashboard → Table Editor → appointments
5. [ ] Executar queries de teste no SQL Editor
6. [ ] Cole aqui os resultados

## 🎯 Informação Importante

O código JÁ ESTÁ INTEGRADO COM SUPABASE:
- ✅ `services/appointmentService.ts` usa `supabaseAppointmentService`
- ✅ Verifica automaticamente se Supabase está disponível
- ✅ Faz fallback para mock se houver erro
- ✅ Logs detalhados para debug

**O problema pode ser:**
1. RLS bloqueando
2. Usuário não autenticado
3. Erro de mapeamento de dados
4. Cache não atualizando

**Por favor, me envie os logs do console quando criar um agendamento!** 🚀

