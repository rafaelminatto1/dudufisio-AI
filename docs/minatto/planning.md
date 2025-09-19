# Planejamento de Funcionalidades - Módulo de Agenda

Este documento delineia o plano para aprimorar o módulo de agendamento do FisioFlow, introduzindo novas funcionalidades, visualizações e melhorias de usabilidade.

## Fase 1: Fundamentos e Melhorias Essenciais (Concluída)

- [x] **Refatoração da Estrutura da Agenda:**
    - [x] Centralizar a lógica de busca e estado dos agendamentos no `AgendaPage.tsx`.
    - [x] Otimizar a renderização dos componentes para melhor performance.
    - [x] Criar componentes específicos para a agenda na pasta `components/agenda/`.

- [x] **Implementar Drag and Drop para Reagendamento:**
    - [x] Permitir que usuários arrastem e soltem agendamentos para alterar o horário e/ou o fisioterapeuta.
    - [x] Atualizar o estado e persistir a alteração no backend.
    - [x] Fornecer feedback visual claro durante o arraste.

- [x] **Detecção de Conflitos:**
    - [x] Criar um serviço (`services/scheduling/conflictDetection.ts`) para verificar sobreposições de horários para um mesmo fisioterapeuta.
    - [x] Impedir a criação ou movimentação de agendamentos que resultem em conflito, exibindo um toast de erro.

- [x] **Agendamentos Recorrentes:**
    - [x] Criar um componente de UI (`RecurrenceSelector.tsx`) para definir regras de repetição (semanal, dias da semana, data de término).
    - [x] Desenvolver um serviço (`services/scheduling/recurrenceService.ts`) para gerar as múltiplas ocorrências de um agendamento recorrente.
    - [x] Modificar o `appointmentService` e o `mockDb` para lidar com a criação e exclusão de séries de agendamentos.

- [x] **Configurações da Agenda:**
    - [x] Criar uma nova página (`/agenda-settings`) para configurações avançadas.
    - [x] Desenvolver um serviço (`services/schedulingSettingsService.ts`) para gerenciar limites de agendamentos por faixa de horário e outras regras.
    - [x] Adicionar link para a nova página no Sidebar.

## Fase 2: Novas Visualizações (Próximos Passos)

- [ ] **Implementar Visão Diária:**
    - [ ] Criar um modo de visualização que foca em um único dia, com colunas para cada fisioterapeuta.
    - [ ] Permitir a navegação entre dias.

- [ ] **Implementar Visão Mensal:**
    - [ ] Desenvolver uma visualização de calendário mensal de alto nível.
    - [ ] Exibir um resumo do número de agendamentos por dia.
    - [ ] Permitir clicar em um dia para navegar para a Visão Diária.

- [ ] **Implementar Visão de Lista (Agenda):**
    - [ ] Criar uma visualização em formato de lista cronológica.
    - [ ] Incluir filtros por data, fisioterapeuta e status.

- [ ] **Adicionar Seletor de Visualização:**
    - [ ] Implementar um componente de UI (botões Dia/Semana/Mês) no cabeçalho da agenda para alternar entre as visualizações.

## Fase 3: Melhorias de Usabilidade e UX (Futuro)

- [ ] **Menu de Contexto (Botão Direito):**
    - [ ] Adicionar um menu de contexto ao clicar com o botão direito em um agendamento.
    - [ ] Incluir ações rápidas como "Marcar como Realizado", "Marcar como Pago", "Excluir".

- [ ] **Blocos de Indisponibilidade:**
    - [ ] Permitir que fisioterapeutas bloqueiem horários para almoço, reuniões, etc.
    - [ ] Visualizar esses blocos na agenda de forma distinta dos agendamentos de pacientes.
    - [ ] Impedir agendamentos sobre esses blocos.

- [ ] **Tooltip de Informações Rápidas:**
    - [ ] Exibir um tooltip com detalhes do paciente (telefone, alertas médicos) ao passar o mouse sobre um agendamento.

- [ ] **Motor de Regras de Agendamento:**
    - [ ] Ao criar um agendamento, exibir avisos (ex: "Paciente com pagamentos pendentes").
    - [ ] Sugerir tipos de agendamento com base no histórico (ex: "Sugerir Avaliação para primeiro agendamento").
