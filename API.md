# API Reference - Sistema de Evolução de Sessão

## Visão Geral

Este documento descreve todas as funções públicas dos 8 services principais do Sistema de Evolução de Sessão.

---

## 1. surgeryService.ts

### Gerenciamento de Cirurgias

#### `getSurgeriesByPatientId(patientId: string): Promise<Surgery[]>`

Busca todas as cirurgias de um paciente.

```typescript
const surgeries = await surgeryService.getSurgeriesByPatientId('patient_123');
// Retorna: Surgery[]
```

#### `addSurgery(patientId: string, surgery: Omit<Surgery, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<Surgery>`

Adiciona nova cirurgia ao histórico do paciente.

```typescript
const newSurgery = await surgeryService.addSurgery('patient_123', {
  name: 'Reconstrução de LCA',
  date: '2024-10-01',
  surgeon: 'Dr. Roberto Silva',
  hospital: 'Hospital Sírio-Libanês',
  description: 'Reconstrução do ligamento cruzado anterior com tendão patelar',
  recoveryTimeDays: 180,
  complications: 'Nenhuma',
  notes: 'Cirurgia sem intercorrências',
});
// Retorna: Surgery
```

**Validações**:
- `date` não pode ser no futuro
- `name` é obrigatório

#### `updateSurgery(surgeryId: string, data: Partial<Surgery>): Promise<Surgery>`

Atualiza dados de uma cirurgia existente.

```typescript
const updated = await surgeryService.updateSurgery('surgery_456', {
  complications: 'Edema leve na primeira semana',
  notes: 'Paciente respondendo bem à fisioterapia',
});
```

#### `deleteSurgery(surgeryId: string): Promise<void>`

Remove uma cirurgia do histórico.

```typescript
await surgeryService.deleteSurgery('surgery_456');
```

#### `calculateTimeSinceSurgery(surgeryDate: string): string`

Calcula tempo decorrido desde a cirurgia em formato legível.

```typescript
const timeSince = surgeryService.calculateTimeSinceSurgery('2024-10-01');
// Retorna: "há 23 dias" | "há 3 meses" | "há 1 ano e 2 meses"
```

#### `formatSurgeryInfo(surgery: Surgery): { timeSince, phase, phaseColor, isCritical, daysPostOp }`

Formata informações da cirurgia incluindo fase pós-operatória.

```typescript
const info = surgeryService.formatSurgeryInfo(surgery);
// Retorna:
{
  timeSince: "há 23 dias",
  phase: "Subaguda",
  phaseColor: "bg-orange-100 text-orange-800",
  isCritical: true, // se < 60 dias
  daysPostOp: 23
}
```

**Fases Pós-Operatórias**:
- **Aguda**: 0-14 dias (vermelho)
- **Subaguda**: 15-42 dias (laranja)
- **Crônica**: 43+ dias (azul)

#### `getRecentSurgeries(patientId: string, daysThreshold = 60): Promise<Surgery[]>`

Busca cirurgias recentes (útil para alertas críticos).

```typescript
const recentSurgeries = await surgeryService.getRecentSurgeries('patient_123', 90);
// Retorna apenas cirurgias dos últimos 90 dias
```

---

## 2. patientGoalsService.ts

### Gerenciamento de Objetivos/Metas

#### `getGoalsByPatientId(patientId: string): Promise<PatientGoal[]>`

Busca todos os objetivos de um paciente.

```typescript
const goals = await patientGoalsService.getGoalsByPatientId('patient_123');
```

#### `getActiveGoals(patientId: string): Promise<PatientGoal[]>`

Busca apenas objetivos ativos (não completados/cancelados).

```typescript
const activeGoals = await patientGoalsService.getActiveGoals('patient_123');
```

#### `addGoal(patientId: string, goal: Omit<PatientGoal, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<PatientGoal>`

Adiciona novo objetivo.

```typescript
const newGoal = await patientGoalsService.addGoal('patient_123', {
  title: 'Correr 1km em menos de 2 minutos',
  description: 'Preparação para TAF da polícia',
  category: 'performance',
  targetDate: '2025-03-15',
  targetValue: '2:00',
  currentValue: '2:45',
  currentProgress: 60,
  unit: 'minutos',
  priority: 'high',
  status: 'active',
});
```

**Validações**:
- `targetDate` não pode ser no passado
- `currentProgress` deve estar entre 0-100

#### `updateGoalProgress(goalId: string, progress: number, currentValue?: string): Promise<PatientGoal>`

Atualiza progresso de um objetivo.

```typescript
const updated = await patientGoalsService.updateGoalProgress(
  'goal_789',
  85, // 85% de progresso
  '2:10' // valor atual
);
```

#### `markGoalCompleted(goalId: string): Promise<PatientGoal>`

Marca objetivo como completado.

```typescript
const completed = await patientGoalsService.markGoalCompleted('goal_789');
// Define: status = 'completed', achievedAt = now, currentProgress = 100
```

#### `calculateCountdown(targetDate: string): { days: number; formatted: string }`

Calcula countdown até data alvo.

```typescript
const countdown = patientGoalsService.calculateCountdown('2025-03-15');
// Retorna:
{
  days: 45,
  formatted: "45 dias restantes"
}
```

#### `formatGoalProgress(goal: PatientGoal): { progressText, progressColor, daysRemaining, urgency }`

Formata informações de progresso do objetivo.

```typescript
const formatted = patientGoalsService.formatGoalProgress(goal);
// Retorna:
{
  progressText: "75% concluído",
  progressColor: "text-green-600",
  daysRemaining: 45,
  urgency: "medium" // low | medium | high | critical
}
```

---

## 3. pathologyService.ts

### Gerenciamento de Patologias

#### `getPathologiesByPatientId(patientId: string): Promise<Pathology[]>`

Busca todas as patologias.

```typescript
const pathologies = await pathologyService.getPathologiesByPatientId('patient_123');
```

#### `getActivePathologies(patientId: string): Promise<Pathology[]>`

Busca patologias em tratamento.

```typescript
const active = await pathologyService.getActivePathologies('patient_123');
// Retorna: status = 'active' | 'chronic' | 'monitoring'
```

#### `getResolvedPathologies(patientId: string): Promise<Pathology[]>`

Busca patologias resolvidas.

```typescript
const resolved = await pathologyService.getResolvedPathologies('patient_123');
// Retorna: status = 'resolved'
```

#### `addPathology(patientId: string, pathology: Omit<Pathology, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<Pathology>`

Adiciona nova patologia.

```typescript
const newPathology = await pathologyService.addPathology('patient_123', {
  name: 'Lesão do Ligamento Cruzado Anterior',
  icdCode: 'S83.5',
  diagnosisDate: '2024-09-15',
  status: 'active',
  severity: 'severe',
  affectedRegion: 'Joelho direito',
  description: 'Lesão completa do LCA durante partida de futebol',
  treatmentPlan: 'Cirurgia + fisioterapia pós-operatória',
});
```

**Validações**:
- `diagnosisDate` não pode ser no futuro

#### `markAsResolved(pathologyId: string): Promise<Pathology>`

Marca patologia como resolvida.

```typescript
const resolved = await pathologyService.markAsResolved('pathology_101');
```

#### `markAsActive(pathologyId: string): Promise<Pathology>`

Marca patologia como ativa novamente.

```typescript
const active = await pathologyService.markAsActive('pathology_101');
```

#### `requiresMandatoryTests(pathology: Pathology): boolean`

Verifica se patologia requer testes obrigatórios.

```typescript
const requires = pathologyService.requiresMandatoryTests(pathology);
// Retorna true para: LCA, AVC, Menisco, Artrose, Fratura
```

#### `suggestMandatoryTests(pathology: Pathology): string[]`

Sugere testes obrigatórios baseado na patologia.

```typescript
const tests = pathologyService.suggestMandatoryTests(pathology);
// Para LCA retorna:
// ['Amplitude de movimento do joelho', 'Teste de Lachman', 'Força do quadríceps']
```

#### `formatPathologyInfo(pathology: Pathology): { statusText, statusColor, severityText, severityColor, timeSinceDiagnosis }`

Formata informações da patologia.

```typescript
const info = pathologyService.formatPathologyInfo(pathology);
// Retorna:
{
  statusText: "Em Tratamento",
  statusColor: "bg-red-100 text-red-800",
  severityText: "Grave",
  severityColor: "bg-orange-100 text-orange-800",
  timeSinceDiagnosis: "há 1 mês"
}
```

---

## 4. testEvolutionService.ts

### Evolução de Testes ao Longo do Tempo

#### `getTestEvolutionData(patientId: string, testName: string): Promise<TestEvolutionData[]>`

Busca evolução de um teste específico.

```typescript
const evolution = await testEvolutionService.getTestEvolutionData(
  'patient_123',
  'Amplitude de movimento do joelho'
);
// Retorna:
[
  {
    sessionNumber: 1,
    sessionDate: '2024-10-01',
    testName: 'Amplitude de movimento do joelho',
    value: 80,
    unit: 'graus',
    side: 'right',
    variation: 0,
    percentChange: 0,
  },
  {
    sessionNumber: 2,
    sessionDate: '2024-10-03',
    value: 95,
    variation: 15, // +15 graus
    percentChange: 18.75, // +18.75%
  },
  // ...
]
```

#### `getTestHistory(patientId: string): Promise<Map<string, TestEvolutionData[]>>`

Busca histórico completo de todos os testes.

```typescript
const history = await testEvolutionService.getTestHistory('patient_123');
// Retorna Map:
{
  'Amplitude de movimento do joelho' => [TestEvolutionData[]],
  'Força do quadríceps' => [TestEvolutionData[]],
  'Escala de dor (EVA)' => [TestEvolutionData[]],
}
```

#### `getTestStatistics(patientId: string, testName: string): Promise<TestStatistics>`

Calcula estatísticas completas de um teste.

```typescript
const stats = await testEvolutionService.getTestStatistics(
  'patient_123',
  'Amplitude de movimento do joelho'
);
// Retorna:
{
  testName: 'Amplitude de movimento do joelho',
  unit: 'graus',
  totalMeasurements: 8,
  firstValue: 80,
  lastValue: 130,
  minValue: 80,
  maxValue: 130,
  averageValue: 105,
  totalImprovement: 50,
  percentImprovement: 62.5,
  trend: 'improving', // 'improving' | 'stable' | 'declining'
  lastMeasuredAt: '2024-11-15',
}
```

#### `getMandatoryTests(patientId: string, sessionNumber: number): Promise<AssessmentTestConfig[]>`

Busca testes obrigatórios para uma sessão específica.

```typescript
const mandatory = await testEvolutionService.getMandatoryTests('patient_123', 5);
// Retorna testes configurados para serem realizados na sessão 5
```

#### `checkMandatoryTestsCompleted(patientId: string, sessionId: string): Promise<boolean>`

Verifica se todos os testes obrigatórios foram realizados.

```typescript
const allCompleted = await testEvolutionService.checkMandatoryTestsCompleted(
  'patient_123',
  'session_789'
);
// Retorna: true ou false
```

#### `getBilateralComparison(patientId: string, testName: string): Promise<{ left, right, difference }>`

Compara resultados bilaterais (esquerda vs direita).

```typescript
const comparison = await testEvolutionService.getBilateralComparison(
  'patient_123',
  'Amplitude de movimento do joelho'
);
// Retorna:
{
  left: [TestEvolutionData[]],
  right: [TestEvolutionData[]],
  difference: [5, 8, 3, 2], // Diferença absoluta em cada sessão
}
```

#### `formatForChart(data: TestEvolutionData[]): { labels, values, sessionNumbers }`

Formata dados para uso em gráficos.

```typescript
const chartData = testEvolutionService.formatForChart(evolutionData);
// Retorna:
{
  labels: ['01/10', '03/10', '05/10', ...],
  values: [80, 95, 110, 125, 130],
  sessionNumbers: [1, 2, 3, 4, 5],
}
```

#### `exportToCSV(data: TestEvolutionData[], testName: string): string`

Exporta dados para formato CSV.

```typescript
const csv = testEvolutionService.exportToCSV(evolutionData, 'Amplitude do Joelho');
// Retorna string CSV pronta para download
```

---

## 5. conductReplicationService.ts

### Replicação de Condutas

#### `getSavedConducts(patientId: string): Promise<ConductTemplate[]>`

Busca templates de conduta salvos.

```typescript
const templates = await conductReplicationService.getSavedConducts('patient_123');
// Retorna apenas condutas com isTemplate = true
```

#### `saveConductAsTemplate(patientId: string, conduct: { subjective?, objective?, assessment?, plan?, tests? }, name: string, sourceSessionId?: string): Promise<ConductTemplate>`

Salva conduta como template reutilizável.

```typescript
const template = await conductReplicationService.saveConductAsTemplate(
  'patient_123',
  {
    subjective: 'Paciente relata melhora da dor...',
    objective: 'ROM: 120° flexão...',
    assessment: 'Evolução positiva...',
    plan: 'Continuar fortalecimento...',
    tests: [
      { testName: 'Amplitude joelho', testType: 'amplitude', unit: 'graus' }
    ],
  },
  'Conduta Padrão - Pós LCA Semana 4',
  'session_456' // opcional
);
```

#### `replicateConduct(conductId: string): Promise<ConductTemplate>`

Replica conduta (incrementa contador de uso).

```typescript
const replicated = await conductReplicationService.replicateConduct('conduct_789');
// Incrementa timesUsed++
```

#### `deleteConduct(conductId: string): Promise<void>`

Remove template.

```typescript
await conductReplicationService.deleteConduct('conduct_789');
```

#### `getRecentConducts(patientId: string, limit = 10): Promise<ConductTemplate[]>`

Busca condutas de sessões anteriores (não templates).

```typescript
const recent = await conductReplicationService.getRecentConducts('patient_123', 5);
// Retorna últimas 5 condutas (de sessões reais)
```

#### `applyTemplate(template: ConductTemplate): { subjective?, objective?, assessment?, plan?, tests? }`

Extrai dados de um template para aplicação.

```typescript
const data = conductReplicationService.applyTemplate(template);
// Use para preencher formulário SOAP
```

#### `applyPartialTemplate(template: ConductTemplate, fields: { includeSubjective?, includeObjective?, ... }): { ... }`

Aplica apenas campos selecionados.

```typescript
const data = conductReplicationService.applyPartialTemplate(template, {
  includeSubjective: true,
  includePlan: true,
  includeObjective: false, // não inclui
  includeAssessment: false,
});
```

---

## 6. sessionEvolutionService.ts

### Evolução de Sessões

#### `getSessionEvolution(sessionId: string): Promise<SessionEvolution | null>`

Busca evolução de uma sessão específica.

```typescript
const session = await sessionEvolutionService.getSessionEvolution('session_456');
```

#### `saveSessionEvolution(data: Omit<SessionEvolution, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionEvolution>`

Salva evolução completa da sessão.

```typescript
const saved = await sessionEvolutionService.saveSessionEvolution({
  sessionId: 'appointment_123',
  patientId: 'patient_456',
  sessionNumber: 5,
  sessionDate: '2024-11-15',
  therapistId: 'therapist_789',
  therapistName: 'Dr. Roberto',
  subjective: 'Paciente relata...',
  objective: 'Avaliação mostra...',
  assessment: 'Diagnóstico...',
  plan: 'Conduta...',
  testsPerformed: [
    { testName: 'Amplitude', value: 120, unit: 'graus', testType: 'amplitude' },
  ],
  painLevel: 3,
  satisfactionLevel: 8,
  duration: 50, // minutos
});
```

#### `getEvolutionsByPatientId(patientId: string): Promise<SessionEvolution[]>`

Busca todas as evoluções de um paciente.

```typescript
const evolutions = await sessionEvolutionService.getEvolutionsByPatientId('patient_123');
// Ordenadas por data (mais recente primeiro)
```

#### `getRecentSessions(patientId: string, limit = 10): Promise<SessionEvolution[]>`

Busca sessões recentes.

```typescript
const recent = await sessionEvolutionService.getRecentSessions('patient_123', 5);
```

#### `getSessionSummary(patientId: string): Promise<SessionSummary>`

Resumo estatístico de todas as sessões.

```typescript
const summary = await sessionEvolutionService.getSessionSummary('patient_123');
// Retorna:
{
  totalSessions: 12,
  firstSessionDate: '2024-09-01',
  lastSessionDate: '2024-11-15',
  averagePainLevel: 3.5,
  averageSatisfaction: 8.2,
  totalDuration: 600, // minutos
}
```

---

## 7. mandatoryTestAlertService.ts

### Sistema de Alertas Obrigatórios

#### `generateMandatoryTestAlerts(patientId: string, sessionNumber: number): Promise<MandatoryTestAlert[]>`

Gera alertas para uma sessão.

```typescript
const alerts = await mandatoryTestAlertService.generateMandatoryTestAlerts(
  'patient_123',
  5
);
// Retorna:
[
  {
    id: 'alert_1',
    testName: 'Amplitude de movimento do joelho',
    testType: 'amplitude',
    severity: 'critical',
    reason: 'Pós-operatório de LCA requer monitoramento rigoroso',
    message: '🚨 OBRIGATÓRIO: Medição de amplitude em toda sessão pós-op LCA',
    dueAt: '2024-11-15T10:00:00Z',
    isCompleted: false,
    canSkip: false,
  },
  // ...
]
```

#### `checkCriticalAlertsCompleted(patientId: string, sessionId: string, sessionNumber: number): Promise<{ allCompleted, pendingCritical, pendingImportant }>`

Verifica status de alertas.

```typescript
const status = await mandatoryTestAlertService.checkCriticalAlertsCompleted(
  'patient_123',
  'session_456',
  5
);
// Retorna:
{
  allCompleted: false,
  pendingCritical: [MandatoryTestAlert[]],
  pendingImportant: [MandatoryTestAlert[]],
}
```

#### `formatAlertMessage(alert: MandatoryTestAlert): { icon, color, bgColor, borderColor, title, canBypass }`

Formata alerta para exibição.

```typescript
const formatted = mandatoryTestAlertService.formatAlertMessage(alert);
// Retorna configuração de UI baseada na severidade
```

#### `logTestException(patientId: string, sessionId: string, alert: MandatoryTestAlert, reason: string, userId: string): Promise<void>`

Registra exceção de teste não realizado.

```typescript
await mandatoryTestAlertService.logTestException(
  'patient_123',
  'session_456',
  alert,
  'Paciente com dor intensa, teste adiado para próxima sessão',
  'user_789'
);
// Registra no audit log
```

#### `calculateComplianceRate(patientId: string): Promise<{ totalAlerts, completedAlerts, complianceRate, criticalCompliance, importantCompliance }>`

Calcula taxa de compliance geral.

```typescript
const compliance = await mandatoryTestAlertService.calculateComplianceRate('patient_123');
// Retorna:
{
  totalAlerts: 50,
  completedAlerts: 45,
  complianceRate: 90, // 90%
  criticalCompliance: 100, // 100% dos críticos
  importantCompliance: 85, // 85% dos importantes
}
```

---

## 8. medicalReportSuggestionsService.ts

### Insights Automáticos para Laudos

#### `generateMedicalInsights(patientId: string): Promise<MedicalInsight[]>`

Gera todos os insights disponíveis.

```typescript
const insights = await medicalReportSuggestionsService.generateMedicalInsights('patient_123');
// Retorna:
[
  {
    id: 'insight_1',
    patientId: 'patient_123',
    type: 'pain_reduction',
    title: 'Redução Significativa da Dor',
    description: 'Paciente apresentou redução de 7.0 pontos',
    data: {
      metric: 'Dor (EVA)',
      initialValue: 9,
      currentValue: 2,
      improvement: 7,
      percentImprovement: 77.8,
      sessions: 5,
    },
    severity: 'success',
    suggestedText: 'O paciente apresentou evolução positiva...',
    generatedAt: '2024-11-15T10:00:00Z',
  },
  // ...
]
```

**Tipos de Insights**:
- `pain_reduction`: Redução de dor
- `range_improvement`: Melhora de amplitude
- `strength_gain`: Ganho de força
- `functional_progress`: Progresso funcional
- `milestone`: Marcos importantes
- `alert`: Alertas relevantes

#### `generateFullMedicalReport(patientId: string): Promise<string>`

Gera relatório médico completo em texto.

```typescript
const report = await medicalReportSuggestionsService.generateFullMedicalReport('patient_123');
// Retorna texto formatado pronto para laudo
```

#### `generateExecutiveSummary(patientId: string): Promise<string>`

Gera resumo executivo curto.

```typescript
const summary = await medicalReportSuggestionsService.generateExecutiveSummary('patient_123');
```

#### `filterInsightsByType(insights: MedicalInsight[], types: MedicalInsight['type'][]): MedicalInsight[]`

Filtra insights por tipo.

```typescript
const painInsights = medicalReportSuggestionsService.filterInsightsByType(
  allInsights,
  ['pain_reduction', 'functional_progress']
);
```

#### `filterInsightsBySeverity(insights: MedicalInsight[], severities: MedicalInsight['severity'][]): MedicalInsight[]`

Filtra insights por severidade.

```typescript
const successInsights = medicalReportSuggestionsService.filterInsightsBySeverity(
  allInsights,
  ['success']
);
```

---

## Tipos TypeScript

### Surgery

```typescript
interface Surgery {
  id: string;
  patientId: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  recoveryTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### PatientGoal

```typescript
interface PatientGoal {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  category: 'performance' | 'recovery' | 'fitness' | 'lifestyle' | 'medical' | 'mobility' | 'strength' | 'pain_reduction' | 'functional';
  targetDate?: string; // YYYY-MM-DD
  targetValue?: string;
  currentValue?: string;
  currentProgress?: number; // 0-100
  unit?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'archived';
  achievedAt?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Pathology

```typescript
interface Pathology {
  id: string;
  patientId: string;
  name: string;
  icdCode?: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  affectedRegion?: string;
  description?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### TestEvolutionData

```typescript
interface TestEvolutionData {
  sessionNumber: number;
  sessionDate: string;
  testName: string;
  value: number;
  unit: string;
  side?: 'left' | 'right' | 'bilateral';
  variation?: number;
  percentChange?: number;
  notes?: string;
}
```

### TestStatistics

```typescript
interface TestStatistics {
  testName: string;
  unit: string;
  totalMeasurements: number;
  firstValue: number;
  lastValue: number;
  minValue: number;
  maxValue: number;
  averageValue: number;
  totalImprovement: number;
  percentImprovement: number;
  trend: 'improving' | 'stable' | 'declining';
  lastMeasuredAt: string;
}
```

### ConductTemplate

```typescript
interface ConductTemplate {
  id: string;
  patientId: string;
  name: string;
  description?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  tests?: Array<{ testName: string; testType: string; unit: string }>;
  sourceSessionId?: string;
  sourceSessionDate?: string;
  timesUsed: number;
  createdAt: string;
  createdBy?: string;
  isTemplate: boolean;
}
```

### SessionEvolution

```typescript
interface SessionEvolution {
  id: string;
  sessionId: string;
  patientId: string;
  sessionNumber: number;
  sessionDate: string;
  therapistId: string;
  therapistName: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  testsPerformed: TestResult[];
  painLevel?: number; // 0-10
  satisfactionLevel?: number; // 0-10
  duration?: number; // minutos
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
```

### MandatoryTestAlert

```typescript
interface MandatoryTestAlert {
  id: string;
  testConfigId: string;
  testName: string;
  testType: 'amplitude' | 'strength' | 'balance' | 'functional' | 'pain';
  severity: 'critical' | 'important' | 'low';
  reason: string;
  message: string;
  dueAt: string;
  isCompleted: boolean;
  completedAt?: string;
  canSkip: boolean;
}
```

### MedicalInsight

```typescript
interface MedicalInsight {
  id: string;
  patientId: string;
  type: 'pain_reduction' | 'range_improvement' | 'strength_gain' | 'functional_progress' | 'milestone' | 'alert';
  title: string;
  description: string;
  data: {
    metric?: string;
    initialValue?: number;
    currentValue?: number;
    improvement?: number;
    percentImprovement?: number;
    sessions?: number;
    timeframe?: string;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
  suggestedText?: string;
  generatedAt: string;
}
```

---

## Exemplos de Uso Completos

### Exemplo 1: Criar Sessão Completa

```typescript
// 1. Buscar dados do paciente
const patient = await patientService.getPatientById('patient_123');
const notes = await soapNoteService.getNotesByPatientId('patient_123');
const sessionNumber = notes.length + 1;

// 2. Verificar alertas obrigatórios
const alerts = await mandatoryTestAlertService.generateMandatoryTestAlerts(
  'patient_123',
  sessionNumber
);

// 3. Preencher formulário SOAP
const soapData = {
  subjective: 'Paciente relata melhora...',
  objective: 'ROM: 120°...',
  assessment: 'Evolução positiva...',
  plan: 'Continuar fortalecimento...',
  painScale: 3,
};

// 4. Verificar se pode salvar
const { allCompleted, pendingCritical } = await mandatoryTestAlertService.checkCriticalAlertsCompleted(
  'patient_123',
  'session_new',
  sessionNumber
);

if (!allCompleted) {
  // Mostrar modal de bloqueio
  console.warn('Testes críticos pendentes:', pendingCritical);
  // User pode registrar exceção
}

// 5. Salvar sessão
const savedNote = await soapNoteService.addNote('patient_123', soapData);

// 6. Gerar insights
const insights = await medicalReportSuggestionsService.generateMedicalInsights('patient_123');
console.log('Insights gerados:', insights);
```

### Exemplo 2: Replicar Conduta com Customização

```typescript
// 1. Buscar condutas recentes
const recent = await conductReplicationService.getRecentConducts('patient_123', 10);

// 2. Usuário seleciona uma
const selectedConduct = recent[2]; // Sessão #10

// 3. Aplicar apenas campos selecionados
const data = conductReplicationService.applyPartialTemplate(selectedConduct, {
  includeSubjective: false, // Não replica subjetivo
  includeObjective: true,   // Replica objetivo
  includeAssessment: true,  // Replica avaliação
  includePlan: true,        // Replica plano
  includeTests: false,      // Não replica testes
});

// 4. Preencher formulário
setFormData({
  subjective: '', // Vazio
  objective: data.objective,
  assessment: data.assessment,
  plan: data.plan,
});

// 5. Incrementar contador de uso
await conductReplicationService.replicateConduct(selectedConduct.id);
```

### Exemplo 3: Análise Completa de Evolução

```typescript
// 1. Estatísticas de dor
const painStats = await testEvolutionService.getTestStatistics(
  'patient_123',
  'Escala de dor (EVA)'
);

console.log(`Dor inicial: ${painStats.firstValue}/10`);
console.log(`Dor atual: ${painStats.lastValue}/10`);
console.log(`Melhora: ${painStats.percentImprovement.toFixed(1)}%`);
console.log(`Tendência: ${painStats.trend}`);

// 2. Gerar insights
const insights = await medicalReportSuggestionsService.generateMedicalInsights('patient_123');
const painInsights = insights.filter(i => i.type === 'pain_reduction');

// 3. Gerar relatório completo
const report = await medicalReportSuggestionsService.generateFullMedicalReport('patient_123');

// 4. Exportar dados para análise externa
const evolutionData = await testEvolutionService.getTestEvolutionData(
  'patient_123',
  'Escala de dor (EVA)'
);
const csv = testEvolutionService.exportToCSV(evolutionData, 'Dor EVA');
// Download CSV
```

---

## Tratamento de Erros

### Padrão de Tratamento

Todos os services seguem o padrão:

```typescript
try {
  // Tentar Supabase
  if (shouldUseSupabase()) {
    return await fetchFromSupabase();
  }
  // Fallback para Mock
  return await fetchFromMock();
} catch (error) {
  console.error('Erro descritivo:', error);
  
  // Opções:
  // 1. Retornar array vazio (para listas)
  return [];
  
  // 2. Retornar null (para item único)
  return null;
  
  // 3. Re-throw (para erros críticos)
  throw error;
}
```

### Tratamento no Frontend

```typescript
// Em componentes React
try {
  await someService.someFunction();
  showToast('Sucesso!', 'success');
} catch (error) {
  console.error('Erro:', error);
  showToast('Erro ao processar. Tente novamente.', 'error');
}
```

---

## Configurações Avançadas

### Personalizar Validações

```typescript
// config/sessionEvolutionConfig.ts

export const VALIDATION_CONFIG = {
  soap: {
    subjectiveMinLength: 20, // Alterar de 10 para 20
    objectiveMinLength: 20,
    assessmentMinLength: 20,
    planMinLength: 20,
  },
  // ...
};
```

### Personalizar Features

```typescript
export const FEATURES_CONFIG = {
  mandatoryTestAlerts: {
    enabled: false, // Desabilitar alertas
    blockSaveOnCritical: false, // Não bloquear salvamento
  },
  // ...
};
```

### Personalizar UI

```typescript
export const UI_CONFIG = {
  animations: {
    enabled: false, // Desabilitar animações
    duration: 200,
  },
  toast: {
    duration: 5000, // Toasts ficam 5 segundos
  },
  // ...
};
```

---

**Versão da API**: 1.0.0  
**Última atualização**: 24/10/2025  
**Compatibilidade**: React 19, TypeScript 5.x

