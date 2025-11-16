# Regras de Negócio - DuduFisio-AI

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Regras de Validação de Dados](#regras-de-validação-de-dados)
- [Regras de Agendamentos](#regras-de-agendamentos)
- [Regras de Permissões (RBAC)](#regras-de-permissões-rbac)
- [Regras de Segurança e LGPD](#regras-de-segurança-e-lgpd)
- [Regras Clínicas](#regras-clínicas)
- [Regras Financeiras](#regras-financeiras)
- [Regras de Integração](#regras-de-integração)
- [Regras de Performance](#regras-de-performance)
- [Fluxos de Negócio](#fluxos-de-negócio)

---

## Visão Geral

Este documento define as regras de negócio que regem o sistema DuduFisio-AI. Todas as funcionalidades devem respeitar estas regras para garantir consistência, segurança e conformidade legal.

---

## Regras de Validação de Dados

### RN-001: Validação de CPF

**Regra:** Todo CPF deve ser válido segundo algoritmo de dígitos verificadores.

**Formato:** `000.000.000-00`

**Validação:**
```typescript
// Regex para formato
/^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Validação de dígitos verificadores
function validateCPF(cpf: string): boolean {
  // Remove pontos e hífen
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Rejeita CPFs conhecidos como inválidos
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  // [Algoritmo completo implementado em lib/validators/]
  
  return true;
}
```

**Casos Especiais:**
- CPFs com todos os dígitos iguais são inválidos (ex: 000.000.000-00)
- CPF é único por paciente no sistema
- Não pode haver duplicatas

### RN-002: Validação de Telefone

**Regra:** Telefone deve estar no formato brasileiro válido.

**Formatos Aceitos:**
- Celular: `(00) 00000-0000`
- Fixo: `(00) 0000-0000`

**Validação:**
```typescript
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// DDD válidos: 11 a 99
// Celular: 9 dígitos (primeiro dígito deve ser 9)
// Fixo: 8 dígitos
```

**Regras:**
- DDD deve ser válido (11 a 99)
- Celulares devem começar com 9
- Telefone é obrigatório para pacientes
- Permite múltiplos telefones (residencial, celular, recado)

### RN-003: Validação de Email

**Regra:** Email deve ser válido e único por usuário.

**Validação:**
```typescript
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
```

**Regras:**
- Email é obrigatório para usuários do sistema
- Email é opcional para pacientes
- Deve ser único por usuário
- Case-insensitive (usuario@email.com === USUARIO@EMAIL.COM)

### RN-004: Validação de Data de Nascimento

**Regra:** Data de nascimento deve ser válida e realista.

**Validação:**
```typescript
const birthDateSchema = z.date()
  .max(new Date(), 'Data não pode ser no futuro')
  .refine((date) => {
    const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return age <= 150; // Idade máxima realista
  }, 'Data de nascimento inválida');
```

**Regras:**
- Não pode ser no futuro
- Idade máxima: 150 anos
- Idade mínima: 0 anos (recém-nascidos)
- Formato: DD/MM/YYYY ou ISO 8601

### RN-005: Validação de Senha

**Regra:** Senha deve ser forte e segura.

**Requisitos:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (@$!%*?&)

**Validação:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[a-z]/, 'Deve conter letra minúscula')
  .regex(/[0-9]/, 'Deve conter número')
  .regex(/[@$!%*?&]/, 'Deve conter caractere especial');
```

---

## Regras de Agendamentos

### RN-010: Prevenção de Conflitos de Horários

**Regra:** Não pode haver sobreposição de agendamentos para o mesmo profissional ou paciente.

**Validação:**
```typescript
function hasConflict(
  newAppointment: { start: Date; end: Date; therapistId: string; patientId: string },
  existingAppointments: Appointment[]
): boolean {
  return existingAppointments.some(existing => {
    // Mesmo terapeuta ou mesmo paciente
    const sameResource = 
      existing.therapist_id === newAppointment.therapistId ||
      existing.patient_id === newAppointment.patientId;
    
    // Verifica sobreposição de horários
    const hasOverlap = 
      (newAppointment.start < existing.end && newAppointment.end > existing.start);
    
    return sameResource && hasOverlap;
  });
}
```

**Regras Específicas:**
- Um terapeuta só pode ter 1 agendamento por vez
- Um paciente só pode ter 1 agendamento por vez
- Intervalo mínimo entre agendamentos: 0 minutos (podem ser sequenciais)
- Sistema deve alertar sobre conflitos antes de confirmar

### RN-011: Duração de Agendamentos

**Regra:** Agendamentos devem ter duração mínima e máxima definidas.

**Limites:**
- Duração mínima: 30 minutos
- Duração máxima: 4 horas
- Duração padrão: 60 minutos
- Incrementos: 15 minutos

**Validação:**
```typescript
function validateDuration(start: Date, end: Date): boolean {
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  
  return durationMinutes >= 30 && durationMinutes <= 240;
}
```

### RN-012: Horário Comercial

**Regra:** Agendamentos só podem ser feitos em horário comercial.

**Horários:**
- Segunda a Sexta: 07:00 - 20:00
- Sábado: 08:00 - 14:00
- Domingo: Fechado (exceções podem ser configuradas)
- Feriados: Fechado (com exceções configuráveis)

**Validação:**
```typescript
function isBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  const day = date.getDay(); // 0=Domingo, 6=Sábado
  
  // Domingo
  if (day === 0) return false;
  
  // Sábado
  if (day === 6) return hour >= 8 && hour < 14;
  
  // Segunda a Sexta
  return hour >= 7 && hour < 20;
}
```

### RN-013: Agendamentos Recorrentes

**Regra:** Sistema deve suportar agendamentos recorrentes com padrões definidos.

**Padrões Suportados:**
- Diário: Todos os dias
- Semanal: Mesmo dia da semana
- Quinzenal: A cada 2 semanas
- Mensal: Mesmo dia do mês
- Personalizado: Dias específicos da semana

**Regras:**
- Máximo 52 ocorrências (1 ano)
- Sistema deve verificar conflitos em todas as ocorrências
- Pode editar série completa ou ocorrência individual
- Exclusão pode ser individual ou série completa

**Validação:**
```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  interval: number;  // Ex: a cada 2 semanas
  count: number;     // Número de ocorrências (máx 52)
  daysOfWeek?: number[];  // Para custom: [1, 3, 5] = Seg, Qua, Sex
  endDate?: Date;    // Data final da recorrência
}
```

### RN-014: Cancelamento de Agendamentos

**Regra:** Cancelamentos devem seguir política de antecedência.

**Política:**
- Cancelamento com 24h de antecedência: Sem cobrança
- Cancelamento com menos de 24h: 50% do valor
- Não comparecimento (no-show): 100% do valor
- Cancelamento pelo profissional: Sem cobrança para paciente

**Estados de Agendamento:**
```typescript
enum AppointmentStatus {
  Scheduled = 'scheduled',      // Agendado
  Confirmed = 'confirmed',      // Confirmado pelo paciente
  InProgress = 'in_progress',   // Em atendimento
  Completed = 'completed',      // Concluído
  Canceled = 'canceled',        // Cancelado
  NoShow = 'no_show'           // Falta
}
```

### RN-015: Reagendamento

**Regra:** Reagendamento deve seguir mesmas regras de novo agendamento.

**Regras:**
- Mesmas validações de conflito
- Mesmas validações de horário
- Histórico de reagendamentos mantido para auditoria
- Limite de 3 reagendamentos por agendamento original

---

## Regras de Permissões (RBAC)

### RN-020: Roles de Usuário

**Regra:** Sistema suporta 4 níveis de acesso.

**Roles:**

#### 1. Admin (Administrador)
```typescript
const adminPermissions = [
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'patients.all',
  'appointments.all',
  'financial.all',
  'reports.all',
  'settings.all',
  'audit.view'
];
```

#### 2. Therapist (Fisioterapeuta)
```typescript
const therapistPermissions = [
  'patients.view',
  'patients.create',
  'patients.edit',
  'appointments.view',
  'appointments.create',
  'appointments.edit',
  'soap_notes.all',
  'exercises.view',
  'exercises.prescribe',
  'reports.view_own'
];
```

#### 3. Educator (Educador Físico)
```typescript
const educatorPermissions = [
  'patients.view_assigned',
  'exercises.view',
  'exercises.prescribe',
  'appointments.view_own',
  'progress.view_assigned'
];
```

#### 4. Patient (Paciente)
```typescript
const patientPermissions = [
  'profile.view_own',
  'profile.edit_own',
  'appointments.view_own',
  'appointments.request',
  'exercises.view_own',
  'progress.view_own',
  'communication.send'
];
```

### RN-021: Hierarquia de Permissões

**Regra:** Permissões seguem hierarquia estrita.

**Hierarquia:**
```
Admin > Therapist > Educator > Patient
```

**Regras:**
- Admin pode fazer tudo
- Therapist pode gerenciar seus pacientes
- Educator pode apenas visualizar e prescrever exercícios
- Patient só acessa seus próprios dados

### RN-022: Proteção de Rotas

**Regra:** Rotas devem ser protegidas por guards de permissão.

**Implementação:**
```typescript
// lib/guards/RoleGuard.tsx
<RoleGuard requiredRole="therapist">
  <PatientEditPage />
</RoleGuard>

// lib/guards/AuthGuard.tsx
<AuthGuard>
  <DashboardPage />
</AuthGuard>
```

---

## Regras de Segurança e LGPD

### RN-030: Conformidade com LGPD

**Regra:** Sistema deve estar 100% conforme com Lei Geral de Proteção de Dados.

**Requisitos:**

#### 1. Consentimento
- Paciente deve consentir com coleta de dados
- Consentimento deve ser explícito e documentado
- Pode ser revogado a qualquer momento

#### 2. Direitos do Titular
```typescript
// Direitos LGPD que devem ser implementados:
- Acesso aos dados
- Correção de dados
- Exclusão de dados (direito ao esquecimento)
- Portabilidade de dados
- Informação sobre compartilhamento
- Revogação de consentimento
```

#### 3. Dados Sensíveis
```typescript
// Dados de saúde são sensíveis e requerem:
- Criptografia em trânsito (HTTPS/TLS)
- Criptografia em repouso (Supabase encryption)
- Acesso restrito por permissões
- Logs de auditoria de todos os acessos
```

### RN-031: Auditoria de Acesso

**Regra:** Todo acesso a dados sensíveis deve ser registrado.

**Dados Auditados:**
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export';
  entity: 'patient' | 'appointment' | 'soap_note' | 'exercise';
  entityId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}
```

**Implementação:**
```typescript
// services/auditService.ts
export const auditService = {
  log(action: string, entity: string, entityId: string, metadata?: any) {
    // Registra ação no banco
  },
  
  getEntityHistory(entity: string, entityId: string) {
    // Retorna histórico de acessos
  },
  
  getUserHistory(userId: string) {
    // Retorna histórico do usuário
  }
};
```

### RN-032: Expiração de Sessão

**Regra:** Sessões devem expirar por inatividade.

**Política:**
- Timeout de inatividade: 30 minutos
- Sessão máxima: 8 horas
- Renovação automática ao interagir
- Logout ao fechar navegador (opcional)

**Implementação:**
```typescript
// Supabase Auth configurado com:
{
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  expiryMargin: 60  // segundos antes de expirar
}
```

### RN-033: Backup e Recuperação

**Regra:** Dados devem ter backup automático diário.

**Política:**
- Backup diário automático (03:00 UTC)
- Retenção: 30 dias
- Backup incremental a cada 6 horas
- Teste de recuperação mensal
- Criptografia de backups

---

## Regras Clínicas

### RN-040: Documentação SOAP

**Regra:** Toda consulta deve ter nota SOAP completa.

**Estrutura SOAP:**
```typescript
interface SoapNote {
  subjective: string;    // Subjetivo: Queixa do paciente
  objective: string;     // Objetivo: Observações do terapeuta
  assessment: string;    // Avaliação: Diagnóstico/análise
  plan: string;         // Plano: Tratamento proposto
  
  // Metadados
  patientId: string;
  therapistId: string;
  appointmentId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Regras:**
- Todos os campos são obrigatórios
- Auto-save a cada 30 segundos
- Histórico de versões mantido
- Não pode editar após 24 horas (apenas adicionar adendos)

### RN-041: Prescrição de Exercícios

**Regra:** Exercícios devem ser prescritos com parâmetros específicos.

**Estrutura:**
```typescript
interface ExercisePrescription {
  exerciseId: string;
  patientId: string;
  therapistId: string;
  
  // Parâmetros
  sets: number;           // Séries (1-10)
  reps: number;           // Repetições (1-100)
  duration?: number;      // Duração em segundos (para isométricos)
  frequency: string;      // Ex: "3x por semana"
  notes?: string;         // Observações específicas
  
  // Contraindicações
  contraindications?: string[];
  
  // Datas
  startDate: Date;
  endDate?: Date;
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'canceled';
}
```

**Validações:**
- Séries: 1-10
- Repetições: 1-100
- Frequência obrigatória
- Contraindicações devem ser verificadas

### RN-042: Avaliação Funcional

**Regra:** Avaliação funcional inicial é obrigatória para novos pacientes.

**Componentes:**
- Anamnese completa
- Mapa corporal de dor
- Testes funcionais específicos
- Objetivos de tratamento
- Prognóstico

**Prazo:**
- Deve ser feita na primeira consulta
- Reavaliação a cada 10 sessões ou 30 dias

---

## Regras Financeiras

### RN-050: Formas de Pagamento

**Regra:** Sistema suporta múltiplas formas de pagamento.

**Formas Aceitas:**
```typescript
enum PaymentMethod {
  Cash = 'cash',              // Dinheiro
  DebitCard = 'debit_card',   // Cartão de débito
  CreditCard = 'credit_card', // Cartão de crédito
  PIX = 'pix',               // PIX
  BankTransfer = 'bank_transfer', // Transferência
  HealthInsurance = 'health_insurance' // Convênio
}
```

**Regras:**
- PIX deve gerar QR Code automaticamente
- Convênio requer número de carteirinha
- Pagamento pode ser parcelado (cartão de crédito)
- Máximo 12 parcelas

### RN-051: Controle de Inadimplência

**Regra:** Sistema deve monitorar pagamentos em atraso.

**Políticas:**
- Alerta automático após 7 dias de atraso
- Bloqueio de novos agendamentos após 30 dias
- Cobrança automática via WhatsApp
- Relatório mensal de inadimplência

**Status de Pagamento:**
```typescript
enum PaymentStatus {
  Pending = 'pending',        // Pendente
  Paid = 'paid',             // Pago
  Overdue = 'overdue',       // Vencido
  Canceled = 'canceled'      // Cancelado
}
```

### RN-052: Descont os e Promoções

**Regra:** Descontos podem ser aplicados com aprovação.

**Tipos:**
- Desconto fixo (R$)
- Desconto percentual (%)
- Primeira consulta (configur ável)
- Pacote de sessões (5% desconto para 10+ sessões)

**Validações:**
- Desconto máximo: 50%
- Desconto requer justificativa
- Desconto > 20% requer aprovação de admin

---

## Regras de Integração

### RN-060: Integração com IA (Gemini)

**Regra:** IA deve ser usada com responsabilidade e supervisão.

**Uso Permitido:**
- Geração de laudos (com revisão obrigatória)
- Sugestões de protocolos
- Análise de risco de abandono
- Consultas clínicas

**Uso Proibido:**
- Decisões clínicas autônomas
- Diagnósticos sem supervisão
- Prescrições automáticas

**Validação:**
```typescript
// Todo output da IA deve:
1. Ter disclamer de que é gerado por IA
2. Requerer revisão do profissional
3. Não conter informações médicas sensíveis sem contexto
4. Ter limite de taxa (rate limiting)
```

### RN-061: Integração WhatsApp

**Regra:** Notificações WhatsApp devem respeitar opt-in e horários.

**Políticas:**
- Paciente deve consentir com notificações
- Horário comercial apenas (08:00 - 20:00)
- Máximo 3 mensagens por dia
- Opt-out a qualquer momento

**Tipos de Mensagens:**
```typescript
- Confirmação de agendamento
- Lembrete (24h antes)
- Cancelamento
- Resultados de exames
- Lembretes de exercícios
```

---

## Regras de Performance

### RN-070: Tempo de Carregamento

**Regra:** Páginas devem carregar em menos de 2 segundos.

**Métricas:**
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2s
- Time to Interactive (TTI): < 3s
- Cumulative Layout Shift (CLS): < 0.1

**Estratégias:**
- Code splitting por rota
- Lazy loading de componentes
- Imagens otimizadas (WebP, lazy load)
- Cache agressivo

### RN-071: Tamanho de Bundle

**Regra:** Bundle JavaScript não deve exceder limites.

**Limites:**
- Bundle inicial: < 200KB (gzipped)
- Bundle total: < 1MB
- Chunks individuais: < 500KB

**Monitoramento:**
```bash
npm run build:analyze  # Analisa tamanho do bundle
```

---

## Fluxos de Negócio

### Fluxo 1: Cadastro de Novo Paciente

```
1. Admin/Therapist acessa página de pacientes
2. Clica em "Novo Paciente"
3. Preenche formulário em 6 abas:
   - Dados Pessoais (nome, CPF, contato)
   - Endereço
   - Histórico Médico
   - Documentos/Fotos
   - Observações
   - Consentimento LGPD
4. Sistema valida dados:
   - CPF válido e não duplicado
   - Email válido (se fornecido)
   - Telefone no formato correto
5. Sistema salva paciente
6. Sistema registra log de auditoria
7. Paciente pode agendar consultas
```

### Fluxo 2: Agendamento de Consulta

```
1. Usuário acessa agenda
2. Seleciona horário disponível
3. Seleciona paciente
4. Seleciona profissional
5. Define duração (padrão 60min)
6. Sistema valida:
   - Não há conflito de horários
   - Horário está em horário comercial
   - Duração é válida (30min - 4h)
7. Sistema cria agendamento
8. Sistema envia notificações:
   - WhatsApp para paciente (se opt-in)
   - Email para profissional
9. Agendamento confirmado
```

### Fluxo 3: Atendimento e Documentação

```
1. Profissional inicia atendimento
2. Status do agendamento muda para "Em Progresso"
3. Profissional preenche nota SOAP:
   - Subjetivo: Queixa do paciente
   - Objetivo: Observações
   - Avaliação: Diagnóstico
   - Plano: Tratamento
4. Sistema faz auto-save a cada 30s
5. Profissional pode usar IA para gerar laudo
6. Profissional revisa e aprova laudo
7. Profissional prescreve exercícios
8. Profissional finaliza consulta
9. Status muda para "Concluído"
10. Sistema registra auditoria
11. Paciente recebe notificação com exercícios prescritos
```

### Fluxo 4: Cancelamento de Agendamento

```
1. Usuário acessa agendamento
2. Clica em "Cancelar"
3. Sistema verifica antecedência:
   - > 24h: Sem cobrança
   - < 24h: Cobrança de 50%
4. Sistema solicita confirmação e motivo
5. Usuário confirma cancelamento
6. Sistema:
   - Atualiza status para "Cancelado"
   - Libera horário
   - Envia notificações
   - Registra motivo de cancelamento
   - Registra auditoria
7. Se houver cobrança, gera cobrança no financeiro
```

---

## Validações Globais

### Validações de Entrada

```typescript
// Sempre validar entrada do usuário
1. Validação de formato (regex, zod)
2. Sanitização de HTML (DOMPurify)
3. Validação de tamanho (strings, files)
4. Validação de tipo (TypeScript)
5. Validação de negócio (regras específicas)
```

### Tratamento de Erros

```typescript
// Sempre tratar erros
try {
  // Operação
} catch (error) {
  // 1. Log do erro (console.error)
  // 2. Registro de auditoria
  // 3. Notificação ao usuário (toast)
  // 4. Fallback/estado de erro
}
```

---

## Exceções e Casos Especiais

### Exceção 1: Atendimento de Emergência

**Regra:** Agendamentos de emergência podem violar algumas regras.

**Permissões:**
- Pode agendar fora do horário comercial (com aprovação admin)
- Pode criar conflito (com remanejamento)
- Prazo de cancelamento não se aplica

### Exceção 2: Paciente VIP

**Regra:** Pacientes VIP podem ter tratamento diferenciado.

**Benefícios:**
- Prioridade em agendamentos
- Lembretes adicionais
- Desconto automático em pacotes

### Exceção 3: Convênios

**Regra:** Convênios seguem tabela própria.

**Regras:**
- Valor fixo por procedimento
- Prazo de pagamento estendido (45 dias)
- Requer autorização prévia
- Documentação específica obrigatória

---

## Referências

### Legislação
- Lei Nº 13.709/2018 (LGPD)
- Resolução COFFITO Nº 465/2016
- Código de Ética Profissional da Fisioterapia

### Padrões
- ISO 13485 (Dispositivos Médicos)
- HL7 FHIR (Interoperabilidade)
- ICD-10 (Classificação de Doenças)

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe DuduFisio-AI

---

## Glossário

- **SOAP:** Subjective, Objective, Assessment, Plan (método de documentação clínica)
- **LGPD:** Lei Geral de Proteção de Dados
- **RBAC:** Role-Based Access Control (controle de acesso baseado em papéis)
- **No-Show:** Falta sem aviso prévio
- **Opt-in:** Consentimento explícito
- **Opt-out:** Cancelamento de consentimento
- **RLS:** Row Level Security (segurança em nível de linha no Supabase)


