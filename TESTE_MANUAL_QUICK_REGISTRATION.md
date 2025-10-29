# 🧪 Guia de Teste Manual - Quick Patient Registration

**Data:** 29 de Janeiro de 2025
**Status:** ✅ Logs adicionados - Pronto para teste

---

## 🎯 OBJETIVO

Testar o fluxo completo de **Quick Patient Registration + Appointment Creation** e identificar onde o processo está quebrando através dos logs do console.

---

## ✅ PREPARAÇÃO

### 1. Dev Server
```bash
# Servidor já está rodando em: http://localhost:5177
# Se precisar reiniciar:
npm run dev
```

### 2. Console do Navegador
- Abra DevTools (F12)
- Va para aba **Console**
- Limpe o console (Ctrl + L)
- **NÃO FECHE O CONSOLE durante o teste!**

### 3. Supabase Studio (Opcional)
- Abra outra aba: https://supabase.com
- Entre no projeto
- Vá para **Table Editor** → **appointments**
- Deixe aberto para verificar se dados foram salvos

---

## 🧪 TESTE 1: Quick Registration + Appointment

### Passos:

1. **Abrir Agenda**
   ```
   Navegue para: http://localhost:5177/agenda
   ```

2. **Abrir Modal de Novo Agendamento**
   ```
   Clique no botão "Novo Agendamento" ou "+"
   ```

   **✅ VERIFICAR CONSOLE:**
   ```
   Deve aparecer logs do modal abrindo
   ```

3. **Digitar Nome do Novo Paciente**
   ```
   No campo "Digite o nome ou CPF do paciente..."
   Digite: DEMO TEST 123
   Aguarde 1 segundo
   ```

   **✅ VERIFICAR CONSOLE:**
   ```
   Deve aparecer:
   "Erro na busca de pacientes" (esperado - paciente não existe)
   ```

4. **Clicar em "Cadastrar DEMO TEST 123"**
   ```
   Clique no botão verde "cadastrar DEMO TEST 123"
   ```

   **🔍 VERIFICAR CONSOLE - CRÍTICO:**
   ```
   Sequência esperada de logs:

   1️⃣ PatientSearchInput:
   🔄 Iniciando cadastro rápido: DEMO TEST 123

   2️⃣ patientService (ver em secureLogger):
   Criando paciente na tabela patients...

   3️⃣ PatientSearchInput:
   ✅ Paciente criado: {id: "...", name: "DEMO TEST 123", ...}
   🔄 Chamando onSelectPatient com: {...}

   4️⃣ AppointmentFormModal callback:
   👤 onSelectPatient callback - Paciente recebido: {...}
   🔄 Atualizando field via field.onChange (React Hook Form)
   🔄 Atualizando selectedPatient state
   ✅ onSelectPatient callback - Sincronização completa

   5️⃣ AppointmentFormModal useEffect:
   🔍 AppointmentFormModal - selectedPatient atualizado: {...}
   ```

   **⚠️ SE FALHAR AQUI:**
   - Anotar qual log NÃO apareceu
   - Anotar qualquer erro vermelho
   - **PARAR O TESTE** e reportar

5. **Preencher Dados do Agendamento**
   ```
   - Data: Deixar padrão (hoje)
   - Horário: 10:00
   - Tipo: Sessão
   - Duração: 60 minutos
   - Terapeuta: (deixar vazio ou selecionar)
   - Observações: (opcional)
   ```

6. **Clicar em "Confirmar Agendamento"**
   ```
   Clique no botão azul "Confirmar Agendamento" ou "Salvar"
   ```

   **🔍 VERIFICAR CONSOLE - CRÍTICO:**
   ```
   Sequência esperada de logs:

   1️⃣ Validação do formulário:
   (Se houver erros, aparecerão em vermelho)

   2️⃣ AppointmentFormModal - handleSaveClick:
   🚀 handleSaveClick CHAMADO!
      FormData recebido: {...}
      patient (do formData ou estado): {id: "...", name: "DEMO TEST 123"}
      slotTime: 10:00
      therapistId: ... (ou undefined)
      appointmentType: session
      duration: 60
   ✅ Paciente válido, iniciando salvamento
   🔍 AppointmentFormModal - Gerando agendamento com ID: app_...
   🔍 AppointmentFormModal - Paciente selecionado: {...}
   📊 Verificação de capacidade: {...}
   🔄 Agendamentos gerados para salvar: [...]
   💾 Salvando agendamento via onSave: {...}

   3️⃣ AgendaPage - handleSaveAppointment:
   🔍 Salvando agendamento: {...}

   4️⃣ appointmentService (ver logs):
   (Logs do Supabase service se estiver habilitado)

   5️⃣ AgendaPage - handleSaveAppointment:
   ✅ Agendamento salvo com sucesso
   🔄 Refazendo fetch dos agendamentos

   6️⃣ AppointmentFormModal - handleSaveClick:
   ✅ Resultado do onSave: true
   🎉 Todos os agendamentos salvos com sucesso, fechando modal
   ```

   **⚠️ SE FALHAR AQUI:**
   - Anotar qual log NÃO apareceu
   - Anotar se modal fechou ou não
   - Anotar qualquer erro vermelho

7. **Verificar Resultado Visual**
   ```
   ✅ Modal deve fechar automaticamente
   ✅ Toast verde "Consulta salva com sucesso!" deve aparecer
   ✅ Appointment deve aparecer na grade da agenda
   ```

8. **Verificar no Supabase (Opcional)**
   ```
   - Ir para Supabase Studio
   - Table Editor → appointments
   - Procurar por patient_name = "DEMO TEST 123"
   - Deve ter 1 registro criado
   ```

---

## 🧪 TESTE 2: Paciente Existente (Controle)

Para garantir que o problema é específico do quick registration:

1. **Abrir "Novo Agendamento"**
2. **Selecionar paciente existente** (da lista dropdown)
3. **Preencher dados**
4. **Confirmar**

**✅ SE TESTE 2 FUNCIONA mas TESTE 1 não:**
→ Problema está no quick registration ou callback

**❌ SE AMBOS NÃO FUNCIONAM:**
→ Problema está no handleSaveClick ou saveAppointment

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### ✅ Sucesso Completo
- [ ] Paciente criado no Supabase (ver log "Paciente criado")
- [ ] onSelectPatient callback executado (ver log "👤 onSelectPatient callback")
- [ ] field.onChange executado (ver log "🔄 Atualizando field")
- [ ] selectedPatient atualizado (ver log "selectedPatient atualizado")
- [ ] handleSaveClick executou (ver log "🚀 handleSaveClick CHAMADO")
- [ ] patient é válido (ver log "✅ Paciente válido")
- [ ] onSave retornou true (ver log "✅ Resultado do onSave: true")
- [ ] Modal fechou (ver log "🎉 Todos os agendamentos salvos com sucesso, fechando modal")
- [ ] Toast de sucesso apareceu
- [ ] Appointment apareceu na agenda

### ⚠️ Pontos de Falha Possíveis

#### Falha 1: Paciente não é criado
**Logs Ausentes:** "✅ Paciente criado"
**Causa Provável:** Erro no patientService.quickAddPatient
**Verificar:** Erro vermelho no console após clicar "cadastrar"

#### Falha 2: Callback não executado
**Logs Ausentes:** "👤 onSelectPatient callback"
**Causa Provável:** onSelectPatient não está conectado corretamente
**Verificar:** Após criar paciente, callback não é chamado

#### Falha 3: Estado não sincroniza
**Logs Ausentes:** "🔍 AppointmentFormModal - selectedPatient atualizado"
**Causa Provável:** setSelectedPatient não atualiza
**Verificar:** selectedPatient continua null

#### Falha 4: handleSaveClick não executa
**Logs Ausentes:** "🚀 handleSaveClick CHAMADO"
**Causa Provável:** form.handleSubmit não está funcionando
**Verificar:** Erro de validação do React Hook Form

#### Falha 5: Validação falha
**Logs Visíveis:** "❌ Erros de validação do formulário"
**Causa Provável:** Schema Zod rejeitando dados
**Verificar:** Erros de validação no console

#### Falha 6: onSave retorna false
**Logs Visíveis:** "✅ Resultado do onSave: false"
**Causa Provável:** Erro ao salvar no Supabase
**Verificar:** Erro no appointmentService.saveAppointment

#### Falha 7: Modal não fecha
**Logs Visíveis:** Todos aparecem mas modal não fecha
**Causa Provável:** onClose() não está funcionando
**Verificar:** "🎉 Todos os agendamentos salvos" aparece mas modal continua aberto

---

## 📝 FORMATO DE REPORTE

Se encontrar problema, reporte assim:

```markdown
### Bug Encontrado

**Último log que apareceu:**
[Cole o último log que apareceu no console]

**Primeiro log que NÃO apareceu:**
[Cole qual log deveria aparecer mas não apareceu]

**Erros no console (se houver):**
[Cole qualquer erro vermelho]

**Comportamento visual:**
- Modal fechou? [Sim/Não]
- Toast apareceu? [Sim/Não]
- Appointment apareceu na agenda? [Sim/Não]

**Screenshot do console:**
[Tirar print do console com todos os logs]
```

---

## 🎯 PRÓXIMA AÇÃO APÓS TESTE

1. **Se tudo funcionar:** ✅ Bug resolvido! Fechar issue.
2. **Se falhar:** Reportar logs e eu aplico correção cirúrgica baseado no ponto de falha exato.

---

**Preparado por:** Claude
**Data:** 29 de Janeiro de 2025
**Estimativa de Teste:** 5-10 minutos
**Dev Server:** http://localhost:5177
