# 💻 Exemplos de Código - Sistema de Acompanhamento

## 📝 Exemplos Práticos de Uso

### 1. Adicionar Observação Simples

```typescript
import { addObservation } from './services/patientTrackingService';

// Observação geral
await addObservation('patient-id', {
  observationType: 'general',
  content: 'Paciente relatou melhora significativa na dor',
  timing: 'after',
  tags: ['melhora', 'dor'],
  isImportant: false,
  isPinned: false
});

// Observação importante/fixada
await addObservation('patient-id', {
  observationType: 'alert',
  content: 'ATENÇÃO: Paciente com histórico de hipertensão. Monitorar PA.',
  timing: 'independent',
  tags: ['alerta', 'hipertensão'],
  isImportant: true,
  isPinned: true
});
```

### 2. Adicionar Avaliação Individual

```typescript
import { addAssessment } from './services/patientTrackingService';

// Medição numérica (ângulo)
await addAssessment('patient-id', {
  sessionId: 'session-id',
  templateId: 'template-flexao-joelho',
  fieldName: 'Ângulo de Flexão do Joelho',
  fieldValue: 120,
  unit: 'graus',
  assessmentTiming: 'pre_session',
  notes: 'Medição com goniômetro'
});

// Avaliação tipo select
await addAssessment('patient-id', {
  sessionId: 'session-id',
  templateId: 'template-lachman',
  fieldName: 'Teste de Lachman',
  fieldText: 'negative',
  assessmentTiming: 'post_session'
});
```

### 3. Adicionar Múltiplas Avaliações de Uma Vez

```typescript
import { addMultipleAssessments } from './services/patientTrackingService';

const assessments = [
  {
    sessionId: 'session-1',
    templateId: 'template-flexao',
    fieldName: 'Ângulo de Flexão',
    fieldValue: 120,
    unit: 'graus',
    assessmentTiming: 'pre_session' as const
  },
  {
    sessionId: 'session-1',
    templateId: 'template-dor',
    fieldName: 'Dor (EVA)',
    fieldValue: 3,
    unit: 'pontos',
    assessmentTiming: 'pre_session' as const
  },
  {
    sessionId: 'session-1',
    templateId: 'template-forca',
    fieldName: 'Força de Quadríceps',
    fieldValue: 4,
    unit: 'grau',
    assessmentTiming: 'post_session' as const
  }
];

await addMultipleAssessments('patient-id', assessments);
```

### 4. Configurar Teste Obrigatório

```typescript
import { configureMandatoryAssessment } from './services/patientTrackingService';

// Teste em milestones (sessões específicas)
await configureMandatoryAssessment('patient-id', {
  categoryId: 'category-lca-id',
  templateId: 'template-flexao-id',
  frequencyType: 'milestones',
  milestoneSessions: [1, 5, 10, 20, 30],
  assessmentTiming: ['pre_session', 'post_session'],
  isActive: true,
  startDate: '2025-10-10'
});

// Teste toda sessão
await configureMandatoryAssessment('patient-id', {
  templateId: 'template-dor-id',
  frequencyType: 'every_session',
  assessmentTiming: ['pre_session', 'post_session'],
  isActive: true
});

// Teste a cada N sessões
await configureMandatoryAssessment('patient-id', {
  templateId: 'template-forca-id',
  frequencyType: 'every_n_sessions',
  frequencyValue: 5,
  assessmentTiming: ['post_session'],
  isActive: true
});
```

### 5. Buscar Observações com Filtros

```typescript
import { getPatientObservations } from './services/patientTrackingService';

// Todas as observações
const all = await getPatientObservations('patient-id');

// Apenas clínicas
const clinical = await getPatientObservations('patient-id', {
  type: 'clinical'
});

// Apenas importantes
const important = await getPatientObservations('patient-id', {
  important: true
});

// Por período
const lastMonth = await getPatientObservations('patient-id', {
  dateFrom: '2025-09-10',
  dateTo: '2025-10-10'
});

// Com tags específicas
const withTags = await getPatientObservations('patient-id', {
  tags: ['melhora', 'dor']
});
```

### 6. Buscar Histórico de Avaliações

```typescript
import { getAssessmentHistory } from './services/patientTrackingService';

// Todas as avaliações do paciente
const all = await getAssessmentHistory('patient-id');

// Apenas um template específico
const flexion = await getAssessmentHistory('patient-id', 'template-flexao-id');

// Com filtros
const preSession = await getAssessmentHistory('patient-id', undefined, {
  timing: 'pre_session',
  dateFrom: '2025-09-01'
});
```

### 7. Gerar Dados para Gráfico

```typescript
import { getAssessmentChartData } from './services/patientTrackingService';

// Dados de evolução de um campo
const chartData = await getAssessmentChartData(
  'patient-id',
  'Ângulo de Flexão do Joelho',
  '2025-09-01',
  '2025-10-10'
);

// Resultado:
// [
//   { date: '2025-09-01', value: 45, sessionNumber: 1, timing: 'pre_session' },
//   { date: '2025-09-05', value: 95, sessionNumber: 5, timing: 'pre_session' },
//   { date: '2025-09-10', value: 120, sessionNumber: 10, timing: 'pre_session' }
// ]

// Usar no gráfico:
<LineChart data={chartData}>
  <Line dataKey="value" />
  <XAxis dataKey="date" />
</LineChart>
```

### 8. Calcular Estatísticas

```typescript
import { calculateAssessmentStatistics } from './services/patientTrackingService';

const stats = await calculateAssessmentStatistics(
  'patient-id',
  'Ângulo de Flexão do Joelho'
);

// Resultado:
// {
//   fieldName: 'Ângulo de Flexão do Joelho',
//   unit: 'graus',
//   count: 10,
//   min: 45,
//   max: 130,
//   average: 95.5,
//   latest: 130,
//   percentChange: 188.9,
//   trend: 'improving'
// }
```

### 9. Gerar Relatório Completo

```typescript
import { generateEvolutionReport } from './services/patientTrackingService';

const report = await generateEvolutionReport(
  'patient-id',
  '2025-09-01',
  '2025-10-10'
);

// Resultado completo:
// {
//   patientId: 'patient-id',
//   period: { start: '2025-09-01', end: '2025-10-10' },
//   assessments: [ ... dados de gráfico ... ],
//   statistics: [ ... stats de cada métrica ... ],
//   observations: [ ... observações do período ... ],
//   totalSessions: 10
// }
```

### 10. Verificar Testes Pendentes em Sessão

```typescript
import { getMandatoryAssessmentsForSession } from './services/patientTrackingService';

// Verificar testes pendentes para sessão 5, pré-sessão
const pending = await getMandatoryAssessmentsForSession(
  'patient-id',
  5,  // número da sessão
  'pre_session'
);

// Resultado:
// [
//   {
//     mandatory_id: 'uuid',
//     template_id: 'template-flexao-id',
//     template_name: 'Ângulo de Flexão do Joelho',
//     field_type: 'angle',
//     is_required: true
//   },
//   ...
// ]
```

### 11. Usar Hook de Alertas

```typescript
import { usePatientAlerts } from './hooks/usePatientAlerts';

function MyComponent() {
  const { alerts, loading, refreshAlerts, dismissAlert } = usePatientAlerts(
    'patient-id',
    currentSessionNumber
  );

  if (loading) return <div>Carregando alertas...</div>;

  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id} className={`alert-${alert.severity}`}>
          <h4>{alert.title}</h4>
          <p>{alert.message}</p>
          <button onClick={() => dismissAlert(alert.id)}>Fechar</button>
        </div>
      ))}
    </div>
  );
}
```

### 12. Exportar Relatório

```typescript
import {
  exportAssessmentsToExcel,
  exportStatisticsToExcel,
  exportReportToPDF,
  copyReportToClipboard
} from './utils/exportUtils';

// Export para Excel (dados brutos)
exportAssessmentsToExcel(reportData, 'João Silva');
// Gera: relatorio_joao_silva_1728578400000.csv

// Export estatísticas
exportStatisticsToExcel(reportData.statistics, 'João Silva');
// Gera: estatisticas_joao_silva_1728578400000.csv

// Export PDF
exportReportToPDF(reportData, 'João Silva');
// Abre janela de impressão com HTML formatado

// Copiar para clipboard
await copyReportToClipboard(reportData);
// Texto formatado na área de transferência
```

### 13. Criar Categoria Customizada

```typescript
import { createCategory } from './services/clinicalCategoriesService';

const newCategory = await createCategory({
  name: 'Reabilitação Cardíaca',
  specialty: 'cardiorespiratory',
  description: 'Protocolos para reabilitação cardiovascular',
  isSystemDefault: false
});

console.log(newCategory.id); // UUID da categoria criada
```

### 14. Criar Template de Avaliação Customizado

```typescript
import { createAssessmentTemplate } from './services/clinicalCategoriesService';

// Template numérico simples
await createAssessmentTemplate('category-id', {
  name: 'Frequência Cardíaca de Repouso',
  fieldType: 'number',
  unit: 'bpm',
  minValue: 40,
  maxValue: 120,
  isRequired: true,
  displayOrder: 1,
  helpText: 'Medir após 5 minutos de repouso'
});

// Template com opções (select)
await createAssessmentTemplate('category-id', {
  name: 'Classificação NYHA',
  fieldType: 'select',
  options: [
    { label: 'Classe I', value: 'class_1' },
    { label: 'Classe II', value: 'class_2' },
    { label: 'Classe III', value: 'class_3' },
    { label: 'Classe IV', value: 'class_4' }
  ],
  isRequired: true,
  displayOrder: 2,
  helpText: 'Classificação funcional NYHA'
});

// Template com escala
await createAssessmentTemplate('category-id', {
  name: 'Dispneia (Borg)',
  fieldType: 'scale',
  minValue: 0,
  maxValue: 10,
  isRequired: false,
  displayOrder: 3,
  helpText: 'Escala de Borg modificada'
});
```

### 15. Usar no Componente React

```tsx
import React, { useState, useEffect } from 'react';
import { ObservationFeed } from './components/patient/ObservationFeed';
import { NewObservationModal } from './components/patient/NewObservationModal';
import { AssessmentPanel } from './components/patient/AssessmentPanel';
import { MetricsDashboard } from './components/patient/MetricsDashboard';
import { EvolutionReport } from './components/patient/EvolutionReport';
import { MandatoryTestsConfig } from './components/patient/MandatoryTestsConfig';
import { PatientAlerts } from './components/patient/PatientAlerts';

function PatientPage() {
  const patientId = 'patient-123';
  const patientName = 'João Silva';
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {/* Alertas no topo */}
      <PatientAlerts 
        patientId={patientId}
        currentSessionNumber={12}
      />

      {/* Tabs */}
      <Tabs>
        {/* Tab Acompanhamento */}
        <TabsContent value="observations">
          <ObservationFeed
            patientId={patientId}
            onAddObservation={() => setShowModal(true)}
          />
        </TabsContent>

        {/* Tab Avaliações */}
        <TabsContent value="assessments">
          <MetricsDashboard patientId={patientId} />
          <AssessmentPanel patientId={patientId} sessionId="session-id" />
          <MandatoryTestsConfig patientId={patientId} />
        </TabsContent>

        {/* Tab Relatórios */}
        <TabsContent value="reports">
          <EvolutionReport
            patientId={patientId}
            patientName={patientName}
          />
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <NewObservationModal
        patientId={patientId}
        sessionId="session-id"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(obs) => {
          console.log('Observação criada:', obs);
          setShowModal(false);
        }}
      />
    </div>
  );
}
```

---

## 🎯 Casos de Uso Reais

### Caso A: Configuração Inicial - LCA Pós-op

```typescript
// 1. Buscar categoria LCA
const categories = await getCategories();
const lcaCategory = categories.find(c => c.name === 'Pós-operatório LCA');

// 2. Configurar testes obrigatórios
await configureMandatoryAssessment('patient-id', {
  categoryId: lcaCategory.id,
  templateId: 'template-flexao-id',
  frequencyType: 'milestones',
  milestoneSessions: [1, 5, 10, 20],
  assessmentTiming: ['pre_session', 'post_session'],
  isActive: true
});

await configureMandatoryAssessment('patient-id', {
  templateId: 'template-dor-id',
  frequencyType: 'every_session',
  assessmentTiming: ['pre_session', 'post_session'],
  isActive: true
});
```

### Caso B: Fluxo de Sessão Completo

```typescript
// ANTES DA SESSÃO (Checklist automático)
const pendingTests = await getMandatoryAssessmentsForSession(
  'patient-id',
  5, // sessão número 5
  'pre_session'
);
// Renderizar checklist...

// MEDIÇÕES PRÉ-SESSÃO
await addMultipleAssessments('patient-id', [
  {
    sessionId: 'session-5',
    templateId: 'template-flexao',
    fieldName: 'Ângulo de Flexão',
    fieldValue: 95,
    unit: 'graus',
    assessmentTiming: 'pre_session'
  },
  {
    sessionId: 'session-5',
    templateId: 'template-dor',
    fieldName: 'Dor (EVA)',
    fieldValue: 3,
    unit: 'pontos',
    assessmentTiming: 'pre_session'
  }
]);

// DURANTE A SESSÃO
await addObservation('patient-id', {
  sessionId: 'session-5',
  observationType: 'clinical',
  content: 'Paciente executou exercícios de fortalecimento sem compensações',
  timing: 'during',
  tags: ['execução-correta']
});

// APÓS A SESSÃO
await addMultipleAssessments('patient-id', [
  {
    sessionId: 'session-5',
    templateId: 'template-flexao',
    fieldName: 'Ângulo de Flexão',
    fieldValue: 100,
    unit: 'graus',
    assessmentTiming: 'post_session'
  },
  {
    sessionId: 'session-5',
    templateId: 'template-dor',
    fieldName: 'Dor (EVA)',
    fieldValue: 2,
    unit: 'pontos',
    assessmentTiming: 'post_session'
  }
]);

await addObservation('patient-id', {
  sessionId: 'session-5',
  observationType: 'evolution',
  content: 'Evolução positiva. Ganho de 5° na flexão e redução da dor.',
  timing: 'after',
  tags: ['melhora', 'progressão'],
  isImportant: true
});
```

### Caso C: Gerar e Exportar Relatório

```typescript
import { generateEvolutionReport } from './services/patientTrackingService';
import { exportReportToPDF } from './utils/exportUtils';

// Gerar relatório do último mês
const report = await generateEvolutionReport(
  'patient-id',
  '2025-09-10',
  '2025-10-10'
);

console.log('Total de sessões:', report.totalSessions);
console.log('Métricas monitoradas:', report.statistics.length);
console.log('Observações:', report.observations.length);

// Verificar tendências
report.statistics.forEach(stat => {
  console.log(`${stat.fieldName}:`, stat.trend, `(${stat.percentChange}%)`);
});

// Exportar
exportReportToPDF(report, 'João Silva Santos');
```

### Caso D: Verificar Alertas Programaticamente

```typescript
import { usePatientAlerts } from './hooks/usePatientAlerts';

function SessionPage({ patientId, sessionNumber }) {
  const { alerts, loading } = usePatientAlerts(patientId, sessionNumber);

  useEffect(() => {
    // Verificar se há alertas de alta prioridade
    const criticalAlerts = alerts.filter(a => a.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      // Mostrar modal ou notificação
      console.warn('Alertas críticos:', criticalAlerts);
    }

    // Verificar se é milestone
    const milestones = alerts.filter(a => a.type === 'milestone');
    if (milestones.length > 0) {
      // Destacar testes obrigatórios
      console.info('Sessão com avaliações obrigatórias');
    }
  }, [alerts]);

  return <div>{/* Render alerts */}</div>;
}
```

---

## 🔧 Customizações Avançadas

### Criar Template com Validação Complexa

```typescript
// Template de amplitude com validação bilateral
await createAssessmentTemplate(categoryId, {
  name: 'Amplitude de Flexão - Joelho Direito',
  fieldType: 'angle',
  unit: 'graus',
  minValue: 0,
  maxValue: 140,
  isRequired: true,
  displayOrder: 1,
  helpText: 'Medir com goniômetro em decúbito dorsal. Comparar com lado contralateral.'
});

await createAssessmentTemplate(categoryId, {
  name: 'Amplitude de Flexão - Joelho Esquerdo',
  fieldType: 'angle',
  unit: 'graus',
  minValue: 0,
  maxValue: 140,
  isRequired: false,
  displayOrder: 2,
  helpText: 'Lado contralateral (comparação)'
});
```

### Filtros Avançados

```typescript
// Buscar observações de evolução importantes do último mês
const evolutionNotes = await getPatientObservations('patient-id', {
  type: 'evolution',
  important: true,
  dateFrom: '2025-09-10',
  dateTo: '2025-10-10'
});

// Buscar avaliações pós-sessão do template específico
const postAssessments = await getAssessmentHistory('patient-id', 'template-id', {
  timing: 'post_session',
  dateFrom: '2025-09-01'
});
```

---

## 📚 Bibliotecas Utilizadas

### Recharts (Gráficos)
```tsx
import {
  LineChart, Line,
  BarChart, Bar,
  ComposedChart,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

### date-fns (Datas)
```typescript
import { format, parseISO, subMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formattedDate = format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
const oneMonthAgo = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
const daysSince = differenceInDays(new Date(), parseISO(dateString));
```

---

## 🎓 Padrões de Código

### Nomenclatura
```typescript
// Serviços: camelCase + sufixo Service
patientTrackingService.ts

// Componentes: PascalCase
ObservationFeed.tsx

// Hooks: camelCase + prefixo use
usePatientAlerts.ts

// Tipos: PascalCase
SessionObservation

// Funções: camelCase (verbos)
addObservation()
getPatientObservations()
```

### Estrutura de Componente
```tsx
import React, { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { Card } from '../ui/card';
import type { MyType } from '../../types';
import { myService } from '../../services/myService';

interface MyComponentProps {
  patientId: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ patientId }) => {
  const [data, setData] = useState<MyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await myService.getData(patientId);
      setData(result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return <div>{/* Render */}</div>;
};

export default MyComponent;
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

Para integrar em nova página:

- [ ] Importar componentes necessários
- [ ] Importar serviços
- [ ] Adicionar PatientAlerts no topo
- [ ] Criar estrutura de Tabs
- [ ] Adicionar ObservationFeed em tab
- [ ] Adicionar AssessmentPanel em tab
- [ ] Adicionar EvolutionReport em tab
- [ ] Configurar modals (NewObservationModal)
- [ ] Passar props corretas (patientId, patientName)
- [ ] Testar fluxo completo

---

**🎯 Com esses exemplos, você tem tudo para usar e customizar o sistema!**




