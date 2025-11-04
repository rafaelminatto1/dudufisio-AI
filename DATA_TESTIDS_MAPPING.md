# 🏷️ Mapeamento de Data-TestIDs - MoocaFisio

## 📋 Componentes Principais

### AgendaPage.tsx

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Botão Novo Agendamento | `btn-new-appointment` | Abre modal de criação |
| Botão Anterior (semana) | `btn-prev-period` | Navega para período anterior |
| Botão Hoje | `btn-today` | Volta para hoje |
| Botão Próximo (semana) | `btn-next-period` | Navega para próximo período |
| Campo de busca | `input-search-agenda` | Busca por paciente/terapeuta |
| Filtro de terapeuta | `filter-therapist` | Dropdown de terapeutas |
| Filtro de status | `filter-status` | Dropdown de status |
| Calendário semanal | `weekly-calendar` | Container da agenda |
| Slot de horário | `time-slot-{hour}-{minute}` | Slot clicável |
| Card de agendamento | `appointment-card-{id}` | Card de agendamento |
| Modal de detalhes | `appointment-detail-modal` | Modal de visualização |
| Modal de formulário | `appointment-form-modal` | Modal de criação/edição |

### AppointmentFormModal (Dentro de AgendaPage)

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Select de paciente | `select-patient` | Dropdown de pacientes |
| Select de terapeuta | `select-therapist` | Dropdown de terapeutas |
| Input de data | `input-appointment-date` | Campo de data |
| Input de hora | `input-appointment-time` | Campo de hora |
| Input de duração | `input-appointment-duration` | Campo de duração |
| Select de tipo | `select-appointment-type` | Tipo de consulta |
| Textarea de notas | `textarea-appointment-notes` | Observações |
| Checkbox recorrente | `checkbox-recurrent` | Agendamento recorrente |
| Botão salvar | `btn-save-appointment` | Salva agendamento |
| Botão cancelar | `btn-cancel-appointment-form` | Fecha modal |
| Mensagem de erro | `error-conflict` | Erro de conflito |

### AcompanhamentoPage.tsx (Session Evolution)

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Textarea Subjetivo (S) | `textarea-soap-subjective` | SOAP - Subjetivo |
| Textarea Objetivo (O) | `textarea-soap-objective` | SOAP - Objetivo |
| Textarea Avaliação (A) | `textarea-soap-assessment` | SOAP - Avaliação |
| Textarea Plano (P) | `textarea-soap-plan` | SOAP - Plano |
| Botão adicionar conduta | `btn-add-conduct` | Nova conduta |
| Select de conduta | `select-conduct-template` | Template de conduta |
| Input de tempo sessão | `input-session-duration` | Duração da sessão |
| Botão anexar arquivo | `btn-attach-file` | Upload de anexo |
| Botão auto-save | `indicator-autosave` | Indicador de salvamento |
| Botão finalizar | `btn-finalize-session` | Finaliza e assina |
| Botão gerar PDF | `btn-generate-pdf` | Exporta para PDF |
| Lista de histórico | `list-session-history` | Histórico de evoluções |

### ExerciseLibraryPage.tsx

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Campo de busca | `input-search-exercises` | Busca por nome |
| Filtro de categoria | `filter-exercise-category` | Dropdown de categorias |
| Filtro de dificuldade | `filter-exercise-difficulty` | Nível de dificuldade |
| Filtro de região | `filter-body-region` | Parte do corpo |
| Grid de exercícios | `grid-exercises` | Lista de exercícios |
| Card de exercício | `exercise-card-{id}` | Card individual |
| Botão visualizar | `btn-view-exercise-{id}` | Ver detalhes |
| Modal de detalhes | `exercise-detail-modal` | Modal com vídeo |
| Vídeo do exercício | `video-exercise` | Player de vídeo |
| Botão criar protocolo | `btn-create-protocol` | Novo protocolo |
| Botão adicionar ao protocolo | `btn-add-to-protocol-{id}` | Adiciona exercício |

### ProtocolFormModal

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Input nome protocolo | `input-protocol-name` | Nome do protocolo |
| Select paciente | `select-protocol-patient` | Paciente destinatário |
| Input frequência | `input-protocol-frequency` | Ex: 3x/semana |
| Input duração | `input-protocol-duration` | Ex: 4 semanas |
| Lista de exercícios | `list-protocol-exercises` | Exercícios selecionados |
| Input séries | `input-exercise-sets-{id}` | Número de séries |
| Input repetições | `input-exercise-reps-{id}` | Número de repetições |
| Input descanso | `input-exercise-rest-{id}` | Tempo de descanso |
| Textarea instruções | `textarea-exercise-instructions-{id}` | Observações |
| Botão salvar protocolo | `btn-save-protocol` | Salva protocolo |
| Botão remover exercício | `btn-remove-exercise-{id}` | Remove do protocolo |

### PatientListPage.tsx (Já tem alguns)

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Campo de busca | `search-input` | ✅ JÁ EXISTE |
| Filtro de status | `status-filter` | ✅ JÁ EXISTE |
| Botão novo paciente | `btn-new-patient` | ✅ JÁ EXISTE |
| Tabela de pacientes | `table-patients` | ✅ JÁ EXISTE |
| Row de paciente | `patient-row-{id}` | ✅ JÁ EXISTE |
| Botão visualizar | `btn-view-patient-{id}` | ✅ JÁ EXISTE |
| Botão editar | `btn-edit-patient-{id}` | ✅ JÁ EXISTE |

### PatientDetailPage.tsx

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Container principal | `patient-detail-container` | Página inteira |
| Botão voltar | `btn-back-to-list` | Volta para lista |
| Botão editar paciente | `btn-edit-patient` | Abre formulário |
| Tab informações | `tab-patient-info` | Aba de dados |
| Tab evoluções | `tab-patient-evolutions` | Aba de histórico |
| Tab exercícios | `tab-patient-exercises` | Aba de protocolos |
| Tab métricas | `tab-patient-metrics` | Aba de gráficos |
| Tab objetivos | `tab-patient-goals` | Aba de metas |
| Grid de gráficos | `grid-patient-charts` | Container de charts |

### LoginPage.tsx

| Elemento | data-testid | Descrição |
|----------|-------------|-----------|
| Input email | `input-login-email` | Campo de email |
| Input senha | `input-login-password` | Campo de senha |
| Botão entrar | `btn-login-submit` | Submeter login |
| Link esqueci senha | `link-forgot-password` | Recuperar senha |
| Mensagem de erro | `error-login-message` | Erro de autenticação |

---

## 🎯 Prioridades de Implementação

### Alta Prioridade (Crítico para E2E)
- ✅ PatientListPage (já implementado)
- 🔴 AgendaPage - Botões principais
- 🔴 AppointmentFormModal - Todos os campos
- 🔴 AcompanhamentoPage - SOAP e condutas
- 🔴 ExerciseLibraryPage - Busca e filtros

### Média Prioridade
- 🟡 ProtocolFormModal
- 🟡 PatientDetailPage - Tabs e navegação
- 🟡 LoginPage

### Baixa Prioridade
- ⚪ Componentes de UI genéricos
- ⚪ Modais secundários

---

## 💡 Convenções de Nomenclatura

### Padrão Geral
```
{tipo}-{ação}-{contexto}-{id}
```

### Exemplos
- `btn-save-appointment` - Botão para salvar agendamento
- `input-patient-name` - Input de nome do paciente
- `select-therapist` - Dropdown de terapeuta
- `card-exercise-123` - Card do exercício com ID 123

### Tipos Comuns
- `btn` - Botão
- `input` - Campo de texto
- `select` - Dropdown/Select
- `checkbox` - Checkbox
- `textarea` - Campo de texto multilinha
- `modal` - Modal/Dialog
- `tab` - Aba de navegação
- `grid` - Grid/Container
- `list` - Lista
- `card` - Card
- `table` - Tabela
- `row` - Linha de tabela
- `filter` - Filtro
- `indicator` - Indicador de estado
- `error` - Mensagem de erro

---

## 📝 Notas de Implementação

1. **IDs Dinâmicos**: Use template literals para IDs dinâmicos
   ```tsx
   data-testid={`card-exercise-${exercise.id}`}
   ```

2. **Condicionais**: Mantenha data-testid mesmo em elementos condicionais
   ```tsx
   {showModal && <Modal data-testid="appointment-modal">...</Modal>}
   ```

3. **Listas**: Use IDs únicos para itens de lista
   ```tsx
   {items.map(item => (
     <div key={item.id} data-testid={`item-${item.id}`}>
   ))}
   ```

4. **Formulários**: Todos os campos de formulário devem ter data-testid
   ```tsx
   <input data-testid="input-patient-name" />
   <select data-testid="select-therapist" />
   <textarea data-testid="textarea-notes" />
   ```

5. **Botões de Ação**: Prefixo `btn-` + ação clara
   ```tsx
   <Button data-testid="btn-save-appointment">Salvar</Button>
   <Button data-testid="btn-cancel-form">Cancelar</Button>
   ```

---

**Última atualização:** 04 de Novembro de 2025  
**Versão:** 1.0.0

