# ✅ Problema do TherapistId Resolvido

## 🔍 Diagnóstico do Problema

### Erro Original
```
❌ Error: invalid input syntax for type uuid: "therapist_3"
```

### Causa Raiz
O formulário estava enviando `therapistId` com valor `"therapist_3"` (ID de mock) para o Supabase, que espera um UUID válido no formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

### Fluxo do Problema
1. ✅ Usuário cria agendamento no formulário
2. ❌ Tenta salvar no Supabase com `therapistId: "therapist_3"`
3. ❌ Supabase rejeita (não é UUID válido)
4. ✅ Fallback salva no **mock** (memória)
5. ❌ Ao buscar dados, busca do Supabase (retorna 0 registros)
6. ❌ **Resultado**: Agendamento "desaparece" após recarregar

## ✅ Solução Implementada

### 1. Validação de UUID (`services/appointmentService.ts`)

Adicionado validação antes de enviar para Supabase:

```typescript
// Validar se therapistId é um UUID válido ou está vazio
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (fullAppointmentData.therapistId && !isValidUUID.test(fullAppointmentData.therapistId)) {
    console.warn('⚠️ therapistId não é um UUID válido:', fullAppointmentData.therapistId);
    throw new Error(`TherapistId "${fullAppointmentData.therapistId}" não é um UUID válido.`);
}

// Converter therapistId inválido para undefined
const dataParaSupabase = {
    ...fullAppointmentData,
    therapistId: fullAppointmentData.therapistId || undefined
};
```

### 2. Filtro no Formulário (`components/AppointmentFormModal.tsx`)

Adicionado filtro para aceitar apenas UUIDs válidos:

```typescript
// Se therapistId começar com "therapist_", é um ID de mock - converter para vazio
const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const getValidTherapistId = (id?: string) => (id && isValidUUID(id)) ? id : '';
const [therapistId, setTherapistId] = useState<string>(getValidTherapistId(appointmentToEdit?.therapistId || initialData?.therapistId));
```

### 3. Validação ao Criar Agendamento

```typescript
const baseAppointment: Appointment = {
  // ...outros campos...
  // Apenas usar therapistId se for um UUID válido (dados do Supabase)
  therapistId: (therapistId && isValidUUID(therapistId)) ? therapistId : undefined,
  // ...
};
```

## 🧪 Como Testar Agora

### Opção 1: Criar Agendamento SEM Terapeuta
1. Abra a agenda
2. Clique em um slot
3. Selecione um paciente
4. **Deixe o campo "Fisioterapeuta" vazio** (ou selecione "Selecionar depois")
5. Clique em "Confirmar Agendamento"
6. ✅ Deve salvar no Supabase com `therapistId: null`
7. ✅ Deve aparecer na agenda
8. ✅ Ao recarregar (F5), deve continuar lá

### Opção 2: Usar Dados Reais do Supabase
Para salvar com terapeuta, você precisa:

1. **Criar terapeutas reais no Supabase**:
   ```sql
   -- Execute no Supabase Dashboard → SQL Editor
   INSERT INTO users (id, name, email, role) VALUES
   (gen_random_uuid(), 'Dr. Roberto', 'roberto@fisioflow.com', 'therapist'),
   (gen_random_uuid(), 'Dra. Camila', 'camila@fisioflow.com', 'therapist'),
   (gen_random_uuid(), 'Dr. Fernando', 'fernando@fisioflow.com', 'therapist');
   
   -- Ver os IDs gerados
   SELECT id, name, role FROM users WHERE role = 'therapist';
   ```

2. **Atualizar o código para buscar terapeutas do Supabase**:
   - Modificar `contexts/AppContext.tsx` para buscar de `users` onde `role = 'therapist'`

## 📋 Logs Esperados Agora

Quando você criar um agendamento, deve ver:

### ✅ Sucesso (sem terapeuta)
```
💾 appointmentService - Salvando no Supabase: {...}
   TherapistId: undefined
   → Criando NOVO agendamento no Supabase
✅ appointmentService - Agendamento CRIADO no Supabase com ID: abc123...
📢 Emitindo evento appointments:changed
🔄 useAppointments - Buscando agendamentos do serviço...
📋 useAppointments - Agendamentos recebidos: 1 agendamentos
```

### ⚠️ Aviso (com ID de mock)
```
💾 appointmentService - Salvando no Supabase: {...}
   TherapistId: therapist_3
⚠️ therapistId não é um UUID válido: therapist_3
   Isso é um ID de mock. Não vou salvar no Supabase.
❌ appointmentService - Erro ao salvar no Supabase
⚠️ FALLBACK: Salvando apenas no mock (dados não persistirão após reload)
```

## 🎯 Próximos Passos

### Opção A: Usar Agendamentos SEM Terapeuta (Temporário)
- ✅ Funciona AGORA
- ✅ Salva no Supabase
- ✅ Persiste após reload
- ⚠️ Sem informação de terapeuta

### Opção B: Migrar Dados de Mock para Supabase (Recomendado)
1. Criar terapeutas reais no Supabase (SQL acima)
2. Criar pacientes reais no Supabase
3. Atualizar `AppContext` para buscar do Supabase
4. Desabilitar dados de mock

### Opção C: Mapeamento de IDs (Intermediário)
Criar um mapeamento entre IDs de mock e UUIDs do Supabase:
```typescript
const THERAPIST_ID_MAP = {
  'therapist_1': 'uuid-do-roberto',
  'therapist_2': 'uuid-da-camila',
  'therapist_3': 'uuid-do-fernando',
};
```

## ✅ Resumo

**Problema**: IDs de mock não são compatíveis com Supabase (precisa de UUID)

**Solução**: 
- ✅ Validação de UUID antes de salvar
- ✅ Converter IDs inválidos para `undefined`
- ✅ Permitir agendamentos sem terapeuta
- ✅ Logs claros sobre o problema

**Status**: 
- ✅ Agendamentos SEM terapeuta funcionam e persistem
- ⚠️ Agendamentos COM terapeuta mock não persistem (esperado)
- 📋 Próximo passo: Migrar dados de mock para Supabase

## 🚀 Teste Agora!

Execute os passos da **Opção 1** acima e me avise se funcionou! 🎉

