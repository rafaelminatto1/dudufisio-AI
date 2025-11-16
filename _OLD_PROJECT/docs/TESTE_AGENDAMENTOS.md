# Guia de Testes - Sistema de Agendamentos

## 🚀 Como Iniciar

```bash
npm run dev
```

Aguarde o servidor iniciar e acesse: `http://localhost:5173`

---

## ✅ Testes Implementados

### 1. Teste: Criar Agendamento e Verificar na Agenda

**Objetivo**: Verificar se agendamentos criados aparecem imediatamente na agenda

**Passos**:
1. Navegue para `/agenda`
2. Clique no botão "Agendar" ou "Novo"
3. Preencha o formulário:
   - **Paciente**: Selecione qualquer paciente
   - **Fisioterapeuta**: DEIXE VAZIO (testar campo opcional)
   - **Data/Hora**: Selecione um horário futuro (ex: 10:00)
   - **Tipo**: Sessão
   - **Duração**: 60 min
4. Clique em "Confirmar Agendamento"
5. **Verifique**:
   - ✅ Toast de sucesso aparece
   - ✅ Modal fecha
   - ✅ Agendamento aparece IMEDIATAMENTE na agenda
   - ✅ No console do navegador (F12), veja os logs:
     ```
     🔍 Salvando agendamento: {...}
     💾 mockDb.saveAppointment - Recebendo: {...}
     📊 Total de agendamentos após salvar: X
     📢 Emitindo evento appointments:changed
     🔄 Buscando agendamentos do serviço...
     ```

**Resultado Esperado**: 
- Agendamento aparece na agenda sem precisar recarregar a página
- Campo fisioterapeuta mostra "Selecionar depois (na evolução)"

---

### 2. Teste: Hora Correta no Modal (Bug Corrigido)

**Objetivo**: Verificar se a hora clicada aparece corretamente no modal

**Passos**:
1. Na agenda semanal, clique diretamente em um slot de horário (ex: 14:00)
2. O modal de agendamento abre
3. **Verifique**:
   - ✅ Campo de hora mostra "14:00" (e NÃO "00:00")
   - ✅ No console, veja o log:
     ```
     🔍 handleSlotClick chamado
        hour: 14
        minute: 0
        clickedDate.getHours(): 14
     ```

**Resultado Esperado**: 
- Hora correta exibida no modal
- Se fosse 00:00, o sistema usa 09:00 como padrão

---

### 3. Teste: Validação de Limites de Capacidade

**Objetivo**: Verificar se o sistema avisa quando excede o limite de profissionais por horário

#### 3.1 Teste de Limite - Período da Manhã (7h-13h = 3 profissionais)

**Passos**:
1. Crie 3 agendamentos para **segunda-feira às 10:00**:
   - Agendamento 1: Paciente A, 10:00
   - Agendamento 2: Paciente B, 10:00
   - Agendamento 3: Paciente C, 10:00
2. Tente criar o **4º agendamento** para 10:00
3. **Verifique**:
   - ✅ Dialog de aviso aparece:
     - Título: "Atenção: Limite de Capacidade"
     - Mensagem: "O horário 10:00 já possui 3 paciente(s) agendado(s)"
     - "A capacidade máxima para este horário é de 3 profissional(is)"
     - Botão: "Cancelar" e "Agendar Mesmo Assim"
   - ✅ No console:
     ```
     📊 Verificação de capacidade: {
       patientCount: 3,
       patientLimit: 3,
       isPatientLimitFull: true
     }
     ```
4. Clique em "Agendar Mesmo Assim"
5. **Verifique**:
   - ✅ Agendamento é criado
   - ✅ Toast amarelo: "Agendamento criado com aviso de sobrecarga"
   - ✅ Agendamento aparece na agenda com ⚠️ (indicador de conflito)

#### 3.2 Teste de Limite - Período de Almoço (13h-15h = 1 profissional)

**Passos**:
1. Crie 1 agendamento para **terça-feira às 14:00**
2. Tente criar o **2º agendamento** para 14:00
3. **Verifique**:
   - ✅ Dialog de aviso aparece informando limite de 1 profissional
   - ✅ Permite agendar com confirmação

#### 3.3 Teste de Limite - Período da Tarde (15h-21h = 4 profissionais)

**Passos**:
1. Crie 4 agendamentos para **quarta-feira às 16:00**
2. Tente criar o **5º agendamento** para 16:00
3. **Verifique**:
   - ✅ Dialog de aviso aparece informando limite de 4 profissionais

#### 3.4 Teste de Limite - Sábado (7h-13h = 3 profissionais)

**Passos**:
1. Crie 3 agendamentos para **sábado às 09:00**
2. Tente criar o **4º agendamento** para 09:00
3. **Verifique**:
   - ✅ Dialog de aviso aparece

---

### 4. Teste: Horário Estendido até 21h

**Objetivo**: Verificar se a agenda mostra horários até 21h

**Passos**:
1. Visualize a agenda semanal
2. Role até o final da agenda
3. **Verifique**:
   - ✅ Última linha de horário mostra "21:00"
   - ✅ É possível criar agendamento às 20:00, 20:30, 21:00
   - ✅ Não existe "22:00" ou horários posteriores

**Resultado Esperado**: 
- Agenda vai de 7:00 até 21:00 (antes ia só até 18:00)

---

### 5. Teste: Fisioterapeuta Opcional com CREFITO

**Objetivo**: Verificar que é possível criar agendamento sem fisioterapeuta e ver CREFITO

**Passos**:
1. Abra o modal de agendamento
2. **Verifique o campo Fisioterapeuta**:
   - ✅ Label mostra: "Fisioterapeuta (opcional)"
   - ✅ Primeira opção: "Selecionar depois (na evolução)"
   - ✅ Opções de terapeutas mostram CREFITO:
     - "Dr. Roberto - CREFITO-3/123456-F"
     - "Dra. Camila - CREFITO-3/234567-F"
     - "Dr. Fernando - CREFITO-3/345678-F"
   - ✅ Texto de ajuda: "Deixe vazio para definir o profissional após o atendimento"
3. Crie agendamento SEM selecionar fisioterapeuta
4. **Verifique**:
   - ✅ Agendamento é criado com sucesso
   - ✅ Não aparece erro de validação

---

### 6. Teste: Domingo Não Aparece

**Objetivo**: Verificar que domingo não aparece na agenda semanal

**Passos**:
1. Visualize a agenda semanal
2. **Verifique**:
   - ✅ Agenda mostra 6 colunas: Segunda, Terça, Quarta, Quinta, Sexta, Sábado
   - ✅ Domingo NÃO aparece
   - ✅ Grade tem 6 colunas (não 7)

---

### 7. Teste: Logs no Console

**Objetivo**: Verificar se logs de debug estão funcionando

**Passos**:
1. Abra o DevTools (F12) → Aba Console
2. Crie um novo agendamento
3. **Verifique os logs na ordem**:
   ```
   🔍 AppointmentFormModal - useEffect executado
   🔍 Validando agendamento - Paciente selecionado: {...}
   ✅ Paciente válido, iniciando salvamento
   🔄 Agendamentos gerados para salvar: [...]
   📊 Verificação de capacidade: {...}
   🔍 appointmentService.saveAppointment - Dados recebidos: {...}
   💾 mockDb.saveAppointment - Recebendo: {...}
   📊 Total de agendamentos após salvar: X
   📢 Emitindo evento appointments:changed
   📢 Evento appointments:changed recebido, limpando cache e refazendo fetch
   🔄 Buscando agendamentos do serviço...
   📚 mockDb.getAppointments - Total de agendamentos: X
   📋 Agendamentos recebidos: [...]
   🎉 Todos os agendamentos salvos com sucesso, fechando modal
   ```

---

## 🎯 Configurações de Agenda

**Testar página de configurações**:

1. Navegue para `/agenda-settings` (ou encontre no menu)
2. **Verifique as configurações padrão**:

### Segunda a Sexta:
- ✅ 07:00 - 13:00: Limite 3 pacientes
- ✅ 13:00 - 15:00: Limite 1 paciente
- ✅ 15:00 - 21:00: Limite 4 pacientes

### Sábado:
- ✅ 07:00 - 13:00: Limite 3 pacientes

### Regras Globais:
- ✅ Máximo de Avaliações por Horário: 1

**Teste de Modificação**:
1. Altere um limite (ex: manhã de 3 para 5 profissionais)
2. Clique em "Salvar Alterações"
3. ✅ Toast de sucesso
4. Volte para a agenda e tente criar agendamentos
5. ✅ Nova regra é aplicada (permite 5 agendamentos no horário)

---

## 📊 Resumo das Correções

✅ **Bug da hora 00:00** → Corrigido
✅ **Horário até 21h** → Implementado
✅ **Fisioterapeuta opcional** → Implementado
✅ **CREFITO visível** → Implementado
✅ **Validação de limites** → Implementado com dialog
✅ **Logs de debug** → Implementados
✅ **Domingo excluído** → Verificado (já estava correto)

---

## 🐛 Se Encontrar Problemas

### Agendamento não aparece:
1. Verifique console para erros
2. Verifique se evento `appointments:changed` foi emitido
3. Verifique se cache foi limpo
4. Recarregue a página (F5)

### Dialog de capacidade não aparece:
1. Verifique se está testando no horário correto
2. Verifique no console se `getSlotOccupancy()` está sendo chamado
3. Verifique se as configurações em `/agenda-settings` estão corretas

### Hora aparece 00:00:
1. Verifique se você está clicando diretamente no slot
2. Verifique logs no console para ver o horário detectado
3. Se aparecer 00:00, o sistema deve usar 09:00 como padrão

---

## 🎉 Teste Final de Integração

**Cenário completo**:
1. Configure limites em `/agenda-settings`
2. Crie 3 agendamentos para segunda às 10:00 (dentro do limite)
3. Tente criar o 4º → deve mostrar aviso
4. Confirme mesmo assim → agendamento criado com ⚠️
5. Verifique que todos aparecem na agenda
6. Todos os logs aparecem no console
7. Horários até 21h estão disponíveis
8. Fisioterapeuta é opcional

Se todos os passos funcionarem, a integração está completa! ✅

---

## 📝 Notas Técnicas

- **Porta do servidor**: 5173 (Vite padrão)
- **Arquivos modificados**: 7 arquivos + 1 novo
- **Logs**: Prefixados com emojis para fácil identificação
- **Cache**: SessionStorage limpo automaticamente após mudanças
- **Eventos**: Sistema de eventos assíncronos para atualização em tempo real

