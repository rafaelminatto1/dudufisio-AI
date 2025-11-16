# 📋 Funcionalidades do Projeto Antigo - A Implementar

## 🎯 Visão Geral

Baseado no código do projeto antigo (Vite + React), identifiquei **TODAS** as funcionalidades que precisam ser portadas para o novo projeto Next.js.

---

## 1. 📅 MÓDULO DE AGENDA (Alta Prioridade)

### Funcionalidades Core
- ✅ CRUD completo de agendamentos
- ✅ 4 visualizações: Diária, Semanal, Mensal, Lista
- ✅ Drag & Drop com snap-to-grid (30min)
- ✅ Sistema de Detecção de Conflitos
- ✅ Agendamentos Recorrentes
- ✅ Lista de Espera Inteligente
- ✅ Bloqueios de Agenda (férias, almoço)
- ✅ Atalhos de Teclado (13+)
- ✅ Filtros Avançados
- ✅ Estatísticas em Tempo Real

### Regras de Negócio
```typescript
// RN-010: Prevenção de Conflitos
- Mesmo terapeuta: máx 1 agendamento por horário
- Mesmo paciente: máx 1 agendamento por horário
- Intervalo mínimo: 0min (podem ser sequenciais)
- Duração mínima: 30min
- Duração máxima: 4 horas
- Snap-to-grid: 30 minutos

// RN-011: Horário Comercial
- Segunda-Sexta: 07:00 - 20:00
- Sábado: 08:00 - 14:00
- Domingo: Fechado

// RN-012: Sistema de Conflitos
- 5 tipos de conflito detectados:
  1. Bloqueio de agenda
  2. Mesmo paciente sobreposto
  3. Mesmo terapeuta sobreposto
  4. Intervalo mínimo não respeitado
  5. Carga horária excedida (8h/dia, 40h/semana)

// RN-013: Capacidade por Horário
- Limite configurável de pacientes por slot
- Limite de avaliações por slot
- Sugestão de horários alternativos
```

### Componentes a Implementar
```typescript
- AgendaCalendar (4 views)
- AppointmentFormModal (CRUD)
- ConflictDetectionService
- WaitlistManager
- ScheduleBlocksManager
- RecurrenceSelector
- AgendaStats
- QuickActionsPanel
- SmartSearch
- AdvancedFilters
```

---

## 2. 🏥 MÓDULO DE TRATAMENTOS / EVOLUÇÃO

### Sistema de Evolução de Sessão (SOAP)

**Layout de 4 Colunas:**

#### Coluna 1 (30%): Formulário SOAP
```typescript
interface SOAPData {
  subjective: string      // Queixas do paciente
  objective: string       // Avaliação do profissional  
  assessment: string      // Diagnóstico cinesiofuncional
  plan: string           // Próximos passos
  conducts: Conduct[]    // Condutas estruturadas
}

// Auto-save a cada 2.5 segundos
// Validações inline
// Botão "Replicar Conduta Anterior"
```

#### Coluna 2 (25%): Histórico & Cirurgias
```typescript
// Últimas 10 sessões com preview
// Timeline de cirurgias com fases:
- 🔴 Fase Aguda (0-14 dias)
- 🟡 Fase Subaguda (15-42 dias)
- 🔵 Reabilitação (43-90 days)
- 🟢 Retorno ao Esporte (90+ dias)

// CRUD completo de cirurgias
// Tempo de tratamento total
```

#### Coluna 3 (25%): Testes & Evolução
```typescript
// Sistema de Alertas de Testes Obrigatórios
- Crítico: Bloqueia salvamento
- Importante: Aviso destacado
- Leve: Notificação

// Gráficos de evolução:
- Barras, Linha, Área, Radar
- Métricas: Amplitude, Dor, Força, Equilíbrio
- Export PNG/SVG/CSV

// Gerenciador de Patologias
- Em Tratamento vs Resolvidas
- CRUD completo
```

#### Coluna 4 (20%): Resumo & Objetivos
```typescript
// Objetivos com Countdown
interface PatientGoal {
  title: string
  deadline: Date
  progress: number (0-100)
  // Countdown automático: "X dias restantes"
}

// Timer automático de sessão
// Prescrição de exercícios
// Upload de fotos de progresso
// Templates reutilizáveis
```

### Funcionalidades Avançadas
```typescript
// 1. Seletor de Exercícios
- Busca inteligente
- Seleção múltipla
- Parâmetros (séries, reps, carga, tempo)
- Thumbnails

// 2. Templates Reutilizáveis
- CRUD completo
- Contador de uso
- Aplicação com 1 clique

// 3. Timer Automático
- Inicialização automática
- Display em tempo real
- Controles: Iniciar, Parar, Resetar

// 4. Upload de Fotos
- Múltiplas fotos
- Compressão automática
- Legendas editáveis
- Supabase Storage

// 5. Sistema de Feedback com Emojis
- Avaliação do paciente (1-5)
- Avaliação do profissional (1-5)
- Comentários
```

---

## 3. 💰 MÓDULO FINANCEIRO

### Funcionalidades
```typescript
// 1. Dashboard Financeiro
- Receita Total
- Inscrições/Vendas
- Gráficos de evolução
- Comparativo mensal

// 2. Transações
interface FinancialTransaction {
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  payment_method: 'cash' | 'credit_card' | 'pix' | 'boleto'
  payment_status: 'pending' | 'paid' | 'failed'
  due_date: Date
}

// 3. Sistema de Pagamentos Multi-Provider
- Stripe (internacional)
- Mercado Pago (Brasil)
- Métodos: PIX, Boleto, Cartão
- Webhooks para confirmação
- Reembolsos

// 4. Pacotes de Sessões
interface PatientPackage {
  total_sessions: number
  used_sessions: number
  expires_at: Date
  price: number
}

// 5. Relatórios Financeiros
- Consolidado mensal
- Por terapeuta
- Por tipo de atendimento
- Export CSV/PDF
```

---

## 4. 👥 GESTÃO DE PACIENTES

### Funcionalidades Já Implementadas ✅
- CRUD básico
- Lista com tabela
- Formulário de cadastro

### A Adicionar
```typescript
// Ficha Completa do Paciente
interface PatientDetails {
  // Dados Pessoais
  personal_data: PersonalData
  
  // Histórico Médico
  medical_history: {
    surgeries: Surgery[]
    pathologies: Pathology[]
    medications: Medication[]
    allergies: Allergy[]
  }
  
  // Tratamento Atual
  current_treatment: {
    status: 'active' | 'inactive'
    start_date: Date
    sessions_count: number
    next_appointment: Appointment
  }
  
  // Documentos
  documents: Document[] // RG, CPF, Atestados, Exames
  
  // Objetivos
  goals: PatientGoal[]
  
  // Comunicação
  communication: {
    preferred_channel: 'whatsapp' | 'email' | 'sms'
    phone: string
    email: string
  }
}

// Timeline de Eventos
- Criado em
- Primeiro atendimento
- Cirurgias
- Alta/Retorno
- Mudanças de status

// Gráficos de Evolução do Paciente
- Frequência de sessões
- Nívelis de dor ao longo do tempo
- Progresso em testes
```

---

## 5. 🎮 SISTEMA DE GAMIFICAÇÃO

### Funcionalidades
```typescript
// 1. Dashboard de Gamificação
interface GamificationDashboard {
  // Progresso do Usuário
  level: number
  current_xp: number
  xp_to_next_level: number
  
  // Conquistas
  badges: Badge[]
  achievements: Achievement[]
  
  // Sequência
  current_streak: number // dias consecutivos
  longest_streak: number
  
  // Leaderboard
  user_rank: number
  top_users: User[]
}

// 2. Sistema de Pontos (XP)
- Sessão realizada: +10 XP
- Meta atingida: +50 XP
- Exercícios realizados: +5 XP
- Feedback dado: +5 XP

// 3. Badges/Conquistas
- "Primeira Sessão"
- "10 Sessões Completas"
- "Meta Alcançada"
- "Feedback Exemplar"
- "Sem Faltas"

// 4. Sistema de Vouchers
- Criar vouchers
- Redimir vouchers
- Loja de recompensas
- Histórico de transações
```

---

## 6. 📊 RELATÓRIOS & ANALYTICS

### Tipos de Relatórios
```typescript
// 1. Relatórios Médicos
- Laudo fisioterapêutico
- Evolução de tratamento
- Alta/Encaminhamento

// 2. Relatórios de Avaliação
- Avaliação inicial
- Reavaliações periódicas
- Comparativo de testes

// 3. Relatórios Consolidados
- Resumo do paciente
- Histórico completo
- Progressos e objetivos

// 4. Analytics
- Taxa de ocupação
- Taxa de conversão
- Pacientes ativos/inativos
- Receita por período
- Performance por terapeuta
```

---

## 7. 🤖 FERRAMENTAS DE IA

### OpenAI / Anthropic Integration
```typescript
// 1. Geração de Laudos
- Input: Dados da avaliação
- Output: Laudo profissional completo

// 2. Geração de Evolução
- Input: Dados da sessão
- Output: Texto de evolução estruturado

// 3. Gerador de HEP (Home Exercise Program)
- Input: Condição + Objetivos
- Output: 5-7 exercícios personalizados

// 4. Análise de Risco
- Input: Histórico médico + Sinais vitais
- Output: Nível de risco + Precauções

// 5. Body Map IA
- Mapeamento corporal inteligente
- Identificação de regiões de dor
- Sugestões de tratamento

// 6. Analytics IA
- Predição de abandono
- Sugestão de pacientes para contato
- Otimização de agendas
```

---

## 8. 💬 COMUNICAÇÃO & CRM

### WhatsApp Integration
```typescript
// Funcionalidades
- Envio de lembretes
- Confirmação de agendamentos
- Mensagens personalizadas
- Templates salvos
- Histórico de conversas
```

### Email Automation
```typescript
// Campanhas
- Pacientes inativos (30+ dias)
- Aniversário
- Feedback pós-sessão
- Lembrete de retorno
```

### CRM
```typescript
// Pipeline de Pacientes
- Lead
- Prospect
- Ativo
- Inativo
- Perdido

// Atividades
- Ligações
- Emails
- WhatsApp
- Notas
```

---

## 9. ⚙️ SISTEMA & CONFIGURAÇÕES

### Configurações de Agenda
```typescript
interface AgendaSettings {
  // Horários
  business_hours: BusinessHours[]
  
  // Limites
  max_patients_per_slot: number
  max_evaluations_per_slot: number
  min_interval_minutes: number
  
  // Bloqueios
  default_blocks: ScheduleBlock[] // Almoço, etc
  
  // Notificações
  send_reminders: boolean
  reminder_hours_before: number
}
```

### Gestão de Usuários
```typescript
// Roles & Permissions
- Admin: Acesso total
- Therapist: Acesso clínico
- Receptionist: Agenda + Pacientes
- Patient: Portal do paciente

// CRUD de usuários
// Gestão de permissões
// Log de auditoria
```

### Integrações
```typescript
// Calendário (Google, Outlook)
// BI (Power BI, Looker)
// CRM Externo
// WhatsApp Business API
// Mercado Pago / Stripe
```

---

## 10. 📱 PORTAL DO PACIENTE

### Funcionalidades
```typescript
// Dashboard do Paciente
- Próximos agendamentos
- Exercícios prescritos
- Progresso/Metas
- Documentos
- Vouchers disponíveis

// Autoagendamento
- Ver horários disponíveis
- Agendar sessão
- Cancelar (com antecedência)

// Exercícios
- Ver vídeos
- Marcar como feito
- Registrar dor/feedback

// Gamificação
- Ver XP e level
- Ver badges
- Resgatar vouchers
```

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 Alta Prioridade (Semanas 1-2)
1. ✅ Agenda completa com conflitos
2. ✅ Sistema de Tratamentos/Evolução
3. ✅ Dashboard Financeiro básico
4. Gestão de Pacientes completa

### 🟡 Média Prioridade (Semanas 3-4)
5. Relatórios IA (Laudos, HEP)
6. Sistema de Pagamentos
7. Gamificação básica
8. WhatsApp Integration

### 🟢 Baixa Prioridade (Mês 2+)
9. Analytics Avançado
10. CRM Completo
11. Portal do Paciente
12. Integrações externas

---

## 🎯 Próximos Passos Imediatos

1. **Criar migrations Supabase** para todas as tabelas
2. **Implementar Services** para cada módulo
3. **Criar Componentes Reutilizáveis** avançados
4. **Implementar Páginas Funcionais** uma por uma
5. **Testes E2E** para cada módulo
6. **Deploy e Monitoramento**

---

**Documento criado em:** 16/11/2025  
**Base:** Análise completa do projeto Vite antigo  
**Total de Funcionalidades:** 100+  
**Páginas a Implementar:** 54

