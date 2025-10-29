# 🐛 Bugs Pendentes - DuduFisio-AI

**Última Atualização:** 29 de Janeiro de 2025

---

## 🔴 CRÍTICO - Alta Prioridade

### 1. Quick Patient Registration + Appointment não funciona corretamente

**Descrição:**
O fluxo de criação expressa de paciente e agendamento em um único modal não está funcionando como esperado.

**Comportamento Esperado:**
1. Usuário abre modal "Novo Agendamento"
2. Digita "DEMO [Nome]" no campo de paciente
3. Sistema oferece botão "cadastrar DEMO [Nome]"
4. Usuário clica para cadastrar
5. **Paciente é criado no Supabase**
6. **Paciente é automaticamente selecionado no formulário**
7. Usuário preenche dados adicionais (data, hora, etc.)
8. Clica em "Confirmar Agendamento"
9. **Modal fecha**
10. **Appointment é criado na agenda**
11. **Dados persistem no Supabase**

**Comportamento Atual:**
- ❌ Modal não fecha após confirmar
- ❌ Appointment não é criado corretamente
- ❌ Possível problema com estado do paciente selecionado
- ❌ Validação pode estar bloqueando mesmo com paciente válido

**Arquivos Envolvidos:**
- [components/AppointmentFormModal.tsx](components/AppointmentFormModal.tsx) (linhas 288-325)
- [services/patientService.ts](services/patientService.ts) (linhas 144-191)
- [services/appointmentService.ts](services/appointmentService.ts)
- [hooks/useAppointments.ts](hooks/useAppointments.ts)

**Logs de Debug Necessários:**
```typescript
// Em AppointmentFormModal.tsx - handleSaveClick
console.log('🚀 handleSaveClick CHAMADO!');
console.log('   FormData recebido:', formData);
console.log('   selectedPatient:', selectedPatient);
console.log('   formData.patient:', formData?.patient);
```

**Correções Já Tentadas:**
- ✅ Corrigido schema do Supabase (patients table sem user_id)
- ✅ Corrigido uso de `formData.patient` em vez de `selectedPatient`
- ✅ Adicionado suporte Supabase em appointmentService
- ❌ **AINDA NÃO FUNCIONA - PRECISA INVESTIGAÇÃO ADICIONAL**

**Próximos Passos para Debug:**
1. Adicionar mais logs em `quickAddPatient()` para ver se paciente é criado
2. Verificar se `onPatientCreated` callback está sendo chamado
3. Verificar se `formData.patient` está sendo atualizado após criação
4. Verificar validação em `handleSaveClick` - pode estar bloqueando indevidamente
5. Verificar se `saveAppointment()` está sendo chamado corretamente
6. Verificar se `eventService.emit('appointments:changed')` está funcionando

**Teste Manual:**
```
1. Abrir http://localhost:5177/agenda
2. Clicar em "Novo Agendamento"
3. Digitar "DEMO Jonas"
4. Clicar em "cadastrar DEMO Jonas"
5. Aguardar 2 segundos
6. Verificar console logs
7. Preencher título: "Avaliação Inicial"
8. Clicar "Confirmar Agendamento"
9. Verificar se modal fecha
10. Verificar se appointment aparece na agenda
11. Abrir Supabase Studio → appointments table → Verificar registro
```

**Estimativa de Tempo:** 1-2 horas
**Complexidade:** Média-Alta
**Impacto:** Alto (funcionalidade principal do sistema)

---

## 🟡 MÉDIO - Média Prioridade

### 2. Testes E2E Falhando (Connection Refused)

**Descrição:**
Todos os 4 testes E2E estão falhando com `ERR_CONNECTION_REFUSED` mesmo com dev server rodando.

**Erro:**
```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/agenda
```

**Causa Provável:**
- Playwright config aponta para porta 5173
- Dev server está rodando na porta 5177
- Mismatch de portas

**Arquivos Envolvidos:**
- [playwright.config.ts](playwright.config.ts) (linha 31, 71)
- [tests/e2e/appointment-flow.spec.ts](tests/e2e/appointment-flow.spec.ts)

**Solução:**
Atualizar `playwright.config.ts` para porta dinâmica ou fixar porta do Vite.

**Estimativa:** 15 minutos
**Impacto:** Médio (bloqueia automação de testes)

---

## 🟢 BAIXO - Baixa Prioridade

### 3. Build Errors - TypeScript

**Descrição:**
Múltiplos erros TypeScript não relacionados ao fluxo principal:
- `VirtualizedPatientTable.tsx` - import `FixedSizeList` not found
- Componentes Tooltip com props incorretas
- WhatsApp e Teleconsulta com type mismatches

**Impacto:** Baixo (não afeta desenvolvimento)
**Estimativa:** 2-3 horas de refatoração
**Pode Esperar:** Sim, resolver em sprint de refatoração

---

## 📊 Status Summary

| Prioridade | Total | Status |
|------------|-------|--------|
| 🔴 Crítico | 1     | Pendente |
| 🟡 Médio   | 1     | Pendente |
| 🟢 Baixo   | 1     | Pode Esperar |

**Total de Bugs:** 3
**Bloqueando Desenvolvimento:** 1 (Quick Patient Registration)

---

## 🎯 Próxima Ação Recomendada

Resolver o bug **#1 (Quick Patient Registration)** antes de continuar com novos componentes, pois é funcionalidade crítica do sistema.

**Plan de Ação:**
1. Adicionar debug logs extensivos em todo o fluxo
2. Testar manualmente passo a passo
3. Identificar onde o fluxo quebra
4. Corrigir problema específico
5. Re-testar até funcionar 100%
6. Documentar solução

---

**Responsável:** Pendente
**Data Limite:** Antes de deploy para produção
