# 🐛 Bugs Pendentes - DuduFisio-AI

**Última Atualização:** 29 de Janeiro de 2025 - 16:30 UTC

---

## 🔴 CRÍTICO - Alta Prioridade

### 1. Quick Patient Registration + Appointment não funciona corretamente

**Status:** 🔧 CORREÇÃO APLICADA - Aguardando Teste Manual (29/01/2025 16:50 UTC)

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
- [components/AppointmentFormModal.tsx](components/AppointmentFormModal.tsx) (linhas 288-325, 633-643)
- [components/agenda/PatientSearchInput.tsx](components/agenda/PatientSearchInput.tsx) (linhas 83-90)
- [pages/AgendaPage.tsx](pages/AgendaPage.tsx) (linhas 322-354)
- [services/patientService.ts](services/patientService.ts) (linhas 144-191)
- [services/appointmentService.ts](services/appointmentService.ts)
- [hooks/useAppointments.ts](hooks/useAppointments.ts)

**Debug Logs Adicionados:**
✅ Debug logs extensivos adicionados em todos os pontos críticos do fluxo

**Correções Aplicadas (29/01 16:50 UTC):**
- ✅ Corrigido schema do Supabase (patients table sem user_id)
- ✅ Corrigido uso de `formData.patient` em vez de `selectedPatient`
- ✅ Adicionado suporte Supabase em appointmentService
- ✅ Debug logs adicionados em PatientSearchInput.tsx
- ✅ Debug logs adicionados em AppointmentFormModal.tsx
- ✅ Debug logs adicionados em AgendaPage.tsx
- ✅ **NOVO: Validação forçada após seleção de paciente com `form.trigger('patient')`**
- ✅ **NOVO: Triplo fallback robusto para garantir paciente não-null**
- ✅ **NOVO: Logs extensivos de erro de validação com detalhes específicos**
- ⏳ **AGUARDANDO TESTE MANUAL PARA VALIDAR CORREÇÃO**

**Bloqueio Atual:**
- Testes E2E não conseguem autenticar (demo accounts podem não existir em Supabase)
- Necessário teste manual para identificar problema específico

**Próximos Passos - TESTE MANUAL:**

1. **Acesse a aplicação:**
   ```
   http://localhost:5177/agenda
   ```

2. **Faça login** (use uma das opções):
   - Login sem senha (OTP)
   - Conta demo (se disponível)
   - Conta real do Supabase

3. **Execute o fluxo completo:**
   - Clicar em "Novo Agendamento"
   - Digitar "DEMO TesteBug" no campo paciente
   - Clicar em "cadastrar DEMO TesteBug"
   - Aguardar 2 segundos
   - Preencher título: "Avaliação Inicial"
   - Selecionar data/hora
   - Clicar "Confirmar Agendamento"

4. **Observe os console logs:**
   - Abra DevTools (F12)
   - Monitore tab Console
   - Procure por logs com emojis: 🔄, ✅, ❌, 🔍, 👤
   - Identifique onde o fluxo quebra

5. **Verifique resultados:**
   - Modal fechou?
   - Appointment aparece na agenda?
   - Supabase Studio → appointments table → Registro existe?

**Estimativa de Tempo:** 2-3 horas (incluindo debug manual)
**Complexidade:** Média-Alta
**Impacto:** Alto (funcionalidade principal do sistema)

---

## 🟡 MÉDIO - Média Prioridade

### 2. Testes E2E Bloqueados por Autenticação

**Descrição:**
Testes E2E não conseguem completar login com contas demo.

**Erro:**
- Login aparenta sucesso no código
- Mas screenshot mostra ainda na tela de login
- `waitForURL` pode estar falhando silenciosamente

**Causa Provável:**
- Contas demo não existem no Supabase
- Redirect após login pode estar falhando
- Playwright não detecta mudança de URL corretamente

**Arquivos Envolvidos:**
- [tests/e2e/appointment-flow.spec.ts](tests/e2e/appointment-flow.spec.ts)
- [tests/e2e/helpers/auth.ts](tests/e2e/helpers/auth.ts)
- [pages/auth/LoginPage.tsx](pages/auth/LoginPage.tsx) (linhas 39-44, 74-100)

**Solução Temporária:**
- Usar teste manual enquanto E2E não funciona
- Considerar criar contas demo reais no Supabase
- Ou usar mecanismo de auth bypass para testes

**Estimativa:** 1 hora
**Impacto:** Médio (bloqueia automação mas não funcionalidade)

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
| 🔴 Crítico | 1     | Em Investigação |
| 🟡 Médio   | 1     | Pendente |
| 🟢 Baixo   | 1     | Pode Esperar |

**Total de Bugs:** 3
**Bloqueando Desenvolvimento:** 1 (Quick Patient Registration)

---

## 🎯 Próxima Ação Recomendada

**EXECUTAR TESTE MANUAL DO BUG #1**

Como os testes E2E estão bloqueados por problemas de autenticação, a próxima ação é:

1. Abrir aplicação em http://localhost:5177
2. Fazer login manualmente
3. Testar fluxo de quick patient registration
4. Monitorar console logs
5. Identificar ponto exato de falha
6. Aplicar correção específica

**Preparação Completa:**
- ✅ Dev server rodando (porta 5177)
- ✅ Debug logs em todos os pontos críticos
- ✅ Guia de teste manual criado
- ✅ Documentação atualizada
- ⏳ **AGUARDANDO EXECUÇÃO MANUAL**

---

**Responsável:** Pendente
**Data Limite:** Antes de deploy para produção
**Documentos Relacionados:**
- [DEBUG_PLAN_QUICK_REGISTRATION.md](DEBUG_PLAN_QUICK_REGISTRATION.md)
- [TESTE_MANUAL_QUICK_REGISTRATION.md](TESTE_MANUAL_QUICK_REGISTRATION.md)
- [STATUS_DESENVOLVIMENTO_ATUAL.md](STATUS_DESENVOLVIMENTO_ATUAL.md)
