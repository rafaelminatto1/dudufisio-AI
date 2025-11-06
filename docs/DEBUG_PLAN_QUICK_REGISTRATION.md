# 🐛 Plano de Debug - Quick Patient Registration + Appointment

**Data:** 29 de Janeiro de 2025
**Bug:** Quick patient registration + agendamento não funciona completamente

---

## 📋 SINTOMAS REPORTADOS

1. ⚠️ Modal não fecha após "Confirmar Agendamento"
2. ⚠️ Appointment pode não ser criado corretamente
3. ⚠️ Estado do paciente selecionado pode ficar inconsistente

---

## 🔍 FLUXO ESPERADO

```
1. Usuário abre "Novo Agendamento"
2. Digita "DEMO [Nome]" no PatientSearchInput
3. Sistema oferece botão "cadastrar DEMO [Nome]"
4. Usuário clica → quickAddPatient() é chamado
5. ✅ Paciente criado no Supabase (patients table)
6. ✅ onPatientCreated() callback é chamado
7. ✅ selectedPatient é atualizado
8. ✅ form.setValue('patient', newPatient) é chamado
9. Usuário preenche dados adicionais (hora, tipo, etc.)
10. Clica "Confirmar Agendamento"
11. ✅ handleSaveClick() é chamado via form.handleSubmit
12. ✅ formData.patient OU selectedPatient é válido
13. ✅ Validações passam
14. ✅ onSave(appointment) é chamado
15. ✅ appointmentService.saveAppointment() persiste no Supabase
16. ✅ event 'appointments:changed' é emitido
17. ✅ success = true
18. ✅ onClose() é chamado → modal fecha
19. ✅ Appointment aparece na agenda
```

---

## 🎯 PONTOS CRÍTICOS PARA DEBUG

### Ponto 1: PatientSearchInput - Quick Registration
**Arquivo:** `components/agenda/PatientSearchInput.tsx`

**Verificar:**
- [ ] `quickAddPatient()` está sendo chamado?
- [ ] Paciente é criado no Supabase? (logs do patientService)
- [ ] `onPatientCreated()` callback é chamado?
- [ ] `formValue` é atualizado corretamente?

**Logs Necessários:**
```typescript
console.log('🆕 Quick Add - Input:', nome);
console.log('📞 Quick Add - Chamando quickAddPatient...');
console.log('✅ Quick Add - Paciente criado:', newPatient);
console.log('📢 Quick Add - Chamando onPatientCreated callback');
console.log('🔄 Quick Add - Atualizando formValue:', formValue);
```

---

### Ponto 2: Callback onPatientCreated
**Arquivo:** `components/AppointmentFormModal.tsx`

**Verificar:**
- [ ] `handlePatientSelect()` é chamado após quick registration?
- [ ] `setSelectedPatient()` atualiza o estado?
- [ ] `form.setValue('patient', patient)` sincroniza o React Hook Form?

**Logs Necessários:**
```typescript
console.log('👤 handlePatientSelect - Patient recebido:', patient);
console.log('🔄 handlePatientSelect - Atualizando selectedPatient');
console.log('📝 handlePatientSelect - Sincronizando form.setValue');
```

---

### Ponto 3: handleSaveClick - Validação
**Arquivo:** `components/AppointmentFormModal.tsx` (linhas 288-430)

**Verificar:**
- [x] Já tem logs ✅
- [ ] `formData.patient` está populado?
- [ ] Validação passa?
- [ ] `onSave()` retorna `true`?

**Logs Existentes:**
```typescript
✅ '🚀 handleSaveClick CHAMADO!'
✅ '   FormData recebido:', formData
✅ '   patient (do formData ou estado):', patient
✅ '💾 Salvando agendamento via onSave:', app
✅ '✅ Resultado do onSave:', result
```

---

### Ponto 4: onSave Callback
**Arquivo:** Provavelmente em `pages/AgendaPage.tsx`

**Verificar:**
- [ ] `handleSaveAppointment()` está correto?
- [ ] `appointmentService.saveAppointment()` é chamado?
- [ ] Retorna `true` em caso de sucesso?
- [ ] Event 'appointments:changed' é emitido?

**Logs Necessários:**
```typescript
console.log('💾 AgendaPage - handleSaveAppointment chamado:', appointment);
console.log('🔄 AgendaPage - Chamando appointmentService.saveAppointment');
console.log('✅ AgendaPage - Salvamento concluído, retornando true');
```

---

### Ponto 5: appointmentService.saveAppointment
**Arquivo:** `services/appointmentService.ts` (linhas 90-144)

**Verificar:**
- [x] Já integrado com Supabase ✅
- [ ] `isSupabaseEnabled()` retorna `true`?
- [ ] UUID do therapistId é válido ou undefined?
- [ ] `supabaseAppointmentService.createAppointment()` sucesso?
- [ ] Event emitido corretamente?

**Logs Existentes (verificar no secureLogger):**
```typescript
secureLogger.info('Criando novo appointment', ...)
secureLogger.error('Erro ao criar appointment', ...)
```

---

## 🧪 TESTES MANUAIS

### Teste 1: Quick Registration Isolado
1. Abrir http://localhost:5177/agenda
2. Clicar "Novo Agendamento"
3. Digitar "DEMO Debug Test"
4. Clicar "cadastrar"
5. **VERIFICAR CONSOLE:**
   - Paciente criado?
   - Callback chamado?
   - selectedPatient atualizado?

### Teste 2: Agendamento Com Paciente Existente
1. Selecionar paciente existente (não quick add)
2. Preencher dados
3. Confirmar
4. **VERIFICAR:**
   - Modal fecha?
   - Appointment aparece?
   - Persiste no Supabase?

**Se Teste 2 funciona mas Teste 1 não:**
→ Problema está no quick registration ou callback

**Se ambos não funcionam:**
→ Problema está no handleSaveClick ou onSave

---

## 🔧 CORREÇÕES POTENCIAIS

### Correção 1: Sincronização de Estado
**Problema:** `selectedPatient` não atualiza a tempo

**Solução:**
```typescript
// Em handlePatientSelect
setSelectedPatient(patient);
form.setValue('patient', patient, { shouldValidate: true, shouldDirty: true });
```

### Correção 2: Validação React Hook Form
**Problema:** Schema Zod pode estar rejeitando paciente quick-add

**Solução:** Verificar schema em `lib/validators/appointmentFormSchema.ts`

### Correção 3: Callback não Conectado
**Problema:** `onPatientCreated` não está vinculado corretamente

**Solução:** Verificar props do `<PatientSearchInput>` no JSX

### Correção 4: onSave Não Retorna True
**Problema:** `handleSaveAppointment` pode não estar retornando booleano

**Solução:** Garantir `return true` após sucesso

---

## 📊 CHECKLIST DE DEBUG

### Fase 1: Adicionar Logs
- [x] Logs em `handleSaveClick` (já existem)
- [ ] Logs em `PatientSearchInput.quickAddPatient`
- [ ] Logs em `handlePatientSelect`
- [ ] Logs em `onSave callback` (AgendaPage)
- [ ] Logs em `appointmentService.saveAppointment`

### Fase 2: Teste Manual
- [ ] Executar Teste 1 (quick registration)
- [ ] Executar Teste 2 (paciente existente)
- [ ] Anotar resultados dos logs

### Fase 3: Identificar Ponto de Quebra
- [ ] Onde o fluxo para de funcionar?
- [ ] Qual log não aparece?
- [ ] Qual erro é lançado?

### Fase 4: Aplicar Correção
- [ ] Implementar fix específico
- [ ] Re-testar
- [ ] Validar 100% funcional

---

## 🎯 PRÓXIMA AÇÃO

1. **Adicionar logs em PatientSearchInput**
2. **Adicionar logs em handlePatientSelect**
3. **Adicionar logs no onSave callback**
4. **Executar teste manual com console aberto**
5. **Analisar sequência de logs**
6. **Identificar ponto de quebra**
7. **Aplicar correção cirúrgica**

---

**Status:** 🔄 EM PROGRESSO
**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 1-2 horas
