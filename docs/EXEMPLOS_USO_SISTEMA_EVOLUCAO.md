# 📚 Exemplos de Uso - Sistema de Evolução de Atendimento

## 1. Iniciar Atendimento e Ver Dados do Paciente

### Fluxo Completo

```typescript
// 1. Na Agenda, clicar em um agendamento
// 2. Clicar em "Iniciar Atendimento"
// 3. Sistema navega para /atendimento/{appointmentId}
// 4. SessionFormPage carrega com layout 3 colunas

// Coluna 1: Formulário SOAP
// Coluna 2: PatientContextPanel com:
//   - Tempo de tratamento: "3 meses"
//   - Cirurgia: "Reconstrução de LCA - 45 dias atrás"
//     Fase: "Reabilitação" (azul)
//   - Patologias: 
//     • Em tratamento: LCA (severidade: moderada)
//     • Resolvidas: Entorse tornozelo
//   - Metas:
//     • Retornar ao futebol - 30 dias restantes
//     • Correr 5km - 45 dias restantes
//   - Alertas: "Medir amplitude do joelho (obrigatório)"

// Coluna 3: PatientOverview + PatientMetrics
```

---

## 2. Replicar Conduta de Sessão Anterior

### Exemplo de Uso

```typescript
// 1. No formulário SOAP, clicar em "Replicar Conduta"
// 2. Modal abre com lista de sessões anteriores

// Sessão selecionada: Sessão 5 (15/01/2025)
// Preview:
//   Subjetivo: "Paciente relata melhora da dor..."
//   Objetivo: "Amplitude de flexão: 120°..."
//   Plano: "Continuar exercícios de fortalecimento..."

// 3. Selecionar campos para replicar:
//   ✅ Técnicas Aplicadas (3 encontradas)
//      • Mobilização articular
//      • Crioterapia
//      • TENS
//   ✅ Exercícios Prescritos (5 encontrados)
//      • Agachamento assistido
//      • Extensão de joelho
//      • Flexão de joelho
//      • Elevação de perna
//      • Caminhada
//   ❌ Equipamentos Utilizados
//   ✅ Exercícios Domiciliares (3 encontrados)
//   ✅ Recomendações
//   ❌ Duração da Sessão
//   ❌ Frequência de Retorno

// 4. Clicar em "Aplicar Conduta"
// 5. Campos são preenchidos automaticamente no formulário
```

---

## 3. Sistema de Alertas de Medição

### Cenário: Pós-operatório de LCA

```typescript
// Configuração do teste obrigatório (já feito no sistema)
{
  testName: "Amplitude do Joelho",
  testType: "amplitude",
  frequencyType: "every_session",
  isMandatory: true
}

// Durante a sessão:

// NÍVEL A: Alerta Visual (sempre visível)
<MandatoryMeasurementAlert>
  ⚠️ Medição Obrigatória Pendente
  • Amplitude do Joelho (Obrigatória)
  [Registrar] [Dispensar]
</MandatoryMeasurementAlert>

// Ao tentar salvar a sessão:

// NÍVEL B: Bloqueio de Salvamento
<SaveBlockingDialog>
  ❌ Medições Obrigatórias Pendentes
  
  Você não pode salvar esta sessão sem registrar:
  
  • Amplitude do Joelho
    Tipo: amplitude
    Última medição: 08/01/2025
  
  [Cancelar] [Salvar Mesmo Assim]
</SaveBlockingDialog>

// Se clicar em "Salvar Mesmo Assim":

// NÍVEL C: Registro de Não Conformidade
await logNonCompliance(
  patientId: "patient-123",
  sessionId: "session-456",
  tests: [{
    testName: "Amplitude do Joelho",
    testType: "amplitude",
    testConfigId: "test-config-789"
  }],
  recordedBy: "therapist-abc",
  skipReason: "Profissional optou por salvar sem realizar medições obrigatórias"
);

// Toast: "Sessão salva sem medições obrigatórias. Não conformidade registrada."
```

---

## 4. Visualizar Gráfico de Evolução

### Exemplo: Evolução da Dor

```typescript
<PainEvolutionChart
  patientId="patient-123"
  showComparison={true}
  highlightThreshold={7}
  showInterventions={true}
  onExport={() => exportChart('pdf')}
/>

// Resultado:
// Métricas principais:
//   Redução Total: 67% (de 9 para 3)
//   Redução/Sessão: 1.2 EVA
//   Dor Alta: 2 sessões (≥ 7 EVA)

// Gráfico mostra:
//   - Linha vermelha: Dor antes da sessão
//   - Linha verde: Dor depois da sessão
//   - Área vermelha: Zona de dor alta (≥ 7)
//   - Linha tracejada: Threshold de alerta
//   - Badges: Intervenções (Crioterapia, TENS, etc.)
```

### Exemplo: Pós-operatório de LCA

```typescript
<PostOpLCAChart
  surgeryDate={new Date('2024-12-01')}
  data={[
    { date: '2024-12-08', kneeFlexion: 90, kneeExtension: -10 },
    { date: '2024-12-15', kneeFlexion: 105, kneeExtension: -5 },
    { date: '2024-12-22', kneeFlexion: 120, kneeExtension: -2 },
    { date: '2024-12-29', kneeFlexion: 130, kneeExtension: 0 }
  ]}
  onExport={() => exportChart('png')}
/>

// Resultado:
// Fase Atual: Reabilitação (43-90 dias)
// Progresso: 45 dias pós-operatório
// Flexão: 130° / 135° (96% da meta)

// Gráfico mostra:
//   - Áreas coloridas por fase (aguda, subaguda, etc.)
//   - Linha azul: Evolução da flexão
//   - Linha verde tracejada: Meta (135°)
//   - Marcadores: Cirurgia, Primeira Carga, Retirada Muletas
//   - Timeline: Todas as fases do protocolo
```

---

## 5. Gerar Relatório Médico

### Exemplo de Uso

```typescript
// 1. Gerar sugestões automáticas
const suggestions = generateReportSuggestions(patient, pathologies);

// Resultado:
[
  {
    metric: "kneeFlexion",
    insight: "Amplitude de flexão do joelho é crítica para retorno funcional",
    relevance: "high",
    chartRecommendation: {
      type: "line",
      metrics: ["kneeFlexion"],
      annotations: true
    },
    normativeComparison: {
      metric: "kneeFlexion",
      expectedRange: [0, 135],
      unit: "graus"
    }
  },
  {
    metric: "painLevel",
    insight: "Evolução da dor guia progressão do protocolo",
    relevance: "high"
  }
]

// 2. Comparar com valores normativos
const comparison = compareToNormative(120, "kneeFlexion", 28, "M");

// Resultado:
{
  status: "normal",
  percentile: 75,
  interpretation: "Valor dentro da faixa de normalidade (0-135).",
  deviation: -11.1,
  recommendation: "Manter exercícios de manutenção para kneeFlexion."
}

// 3. Gerar relatório
<MedicalReportTemplate
  data={{
    patient: patient,
    period: { start: startDate, end: endDate },
    summary: {
      totalSessions: 12,
      painReduction: 67,
      functionalGain: 45,
      compliance: 95
    },
    keyMetrics: [
      {
        name: "Amplitude de Flexão do Joelho",
        initial: 90,
        current: 130,
        change: 40,
        unit: "graus",
        status: "improved"
      },
      {
        name: "Escala de Dor (EVA)",
        initial: 9,
        current: 3,
        change: -6,
        unit: "0-10",
        status: "improved"
      }
    ],
    clinicalNotes: "Paciente apresenta evolução excelente...",
    recommendations: "Continuar com protocolo de reabilitação..."
  }}
  onExport={(format) => exportReport(format)}
/>

// 4. Exportar relatório
await exportReport('pdf');
// Gera: relatorio_paciente_joao_silva_2025-01-25.pdf
```

---

## 6. Indicador de Fase Pós-Cirúrgica

### Exemplo: LCA Reconstruction

```typescript
<SurgeryPhaseIndicator
  surgery={{
    id: "surgery-123",
    name: "Reconstrução de LCA",
    date: "2024-12-01",
    patientId: "patient-123"
  }}
  currentDate={new Date()}
  protocol="LCA_Reconstruction"
  showRecommendations={true}
/>

// Resultado: Fase de Reabilitação (43-90 dias)
// Progresso na fase: 65%

// Objetivos:
//   ✓ Ganho completo de amplitude
//   ✓ Fortalecimento avançado
//   ✓ Preparação para retorno ao esporte

// Próximos Marcos:
//   • Amplitude de flexão > 135°
//   • Força do quadríceps > 80% do contralateral

// Restrições Atuais:
//   ⚠️ Evitar esportes de contato
//   ⚠️ Progredir gradualmente

// Exercícios Recomendados:
//   • Exercícios pliométricos
//   • Treino de agilidade
//   • Exercícios funcionais específicos do esporte

// Timeline:
//   ✓ Fase Aguda (0-14 dias) - Concluída
//   ✓ Fase Subaguda (15-42 dias) - Concluída
//   🕐 Fase de Reabilitação (43-90 dias) - Em andamento
//   ⏳ Fase de Retorno (90+ dias) - Futura
```

---

## 7. Exportar Gráficos

### Exemplo: Exportar Gráfico Único

```typescript
import { exportChart } from '../services/chartExportService';

const handleExport = async (format: 'png' | 'pdf' | 'svg') => {
  const chartElement = document.getElementById('chart-container');
  
  if (!chartElement) return;

  await exportChart(chartElement, {
    format,
    filename: `evolucao_paciente_${patient.name}_${format}`,
    quality: 1.0
  });
};

// Resultado:
// PNG: evolucao_paciente_joao_silva_png.png (download automático)
// PDF: evolucao_paciente_joao_silva_pdf.pdf
// SVG: evolucao_paciente_joao_silva_svg.svg
```

### Exemplo: Exportar Múltiplos Gráficos

```typescript
import { exportMultipleChartsAsPDF } from '../services/chartExportService';

const handleExportReport = async () => {
  const charts = [
    document.getElementById('pain-chart'),
    document.getElementById('amplitude-chart'),
    document.getElementById('strength-chart')
  ];

  await exportMultipleChartsAsPDF(charts, {
    filename: 'relatorio_completo.pdf',
    title: 'Relatório de Evolução - João Silva',
    pageSize: 'a4'
  });
};

// Resultado:
// PDF com 3 páginas, uma para cada gráfico
// Título em todas as páginas
// Formato A4 landscape
```

---

## 8. Calcular Conformidade

### Exemplo: Taxa de Conformidade

```typescript
import { calculatePatientComplianceRate } from '../services/complianceService';

const stats = await calculatePatientComplianceRate(
  patientId,
  startDate,
  endDate
);

// Resultado:
{
  totalRequired: 20,
  totalMeasured: 18,
  complianceRate: 90.0,
  skippedTests: ["Amplitude do Joelho", "Y-Balance"]
}

// Interpretação:
// Paciente realizou 18 de 20 medições obrigatórias
// Taxa de conformidade: 90%
// Testes não realizados: Amplitude do Joelho, Y-Balance
```

### Exemplo: Relatório de Conformidade

```typescript
import { getComplianceReport } from '../services/complianceService';

const report = await getComplianceReport(
  new Date('2025-01-01'),
  new Date('2025-01-31'),
  'amplitude'
);

// Resultado:
[
  {
    patient_id: "patient-123",
    patient_name: "João Silva",
    test_name: "Amplitude do Joelho",
    total_required: 8,
    total_measured: 7,
    compliance_rate: 87.5,
    most_common_skip_reason: "Paciente não compareceu"
  }
]
```

---

## 9. Comparação Normativa

### Exemplo: Amplitude de Flexão

```typescript
import { compareToNormative } from '../services/normativeDataService';

// Paciente: 28 anos, masculino
// Amplitude atual: 120 graus

const result = compareToNormative(120, "kneeFlexion", 28, "M");

// Resultado:
{
  status: "normal",
  percentile: 75,
  interpretation: "Valor dentro da faixa de normalidade (0-135).",
  deviation: -11.1,
  recommendation: "Manter exercícios de manutenção para kneeFlexion."
}

// Interpretação:
// ✅ Valor NORMAL (dentro da faixa 0-135)
// 📊 Percentil 75 (melhor que 75% da população)
// 📉 11% abaixo do valor ideal (135°)
// 💡 Recomendação: Manter exercícios de manutenção
```

### Exemplo: Múltiplas Métricas

```typescript
import { compareMultipleMetrics, calculateOverallFunctionalityScore } 
  from '../services/normativeDataService';

const metrics = [
  { name: "kneeFlexion", value: 120 },
  { name: "kneeExtension", value: -2 },
  { name: "quadricepsStrength", value: 75 },
  { name: "painLevel", value: 3 }
];

const comparisons = compareMultipleMetrics(metrics, 28, "M");

const overall = calculateOverallFunctionalityScore(comparisons);

// Resultado:
{
  score: 72.5,
  level: "bom",
  interpretation: "Funcionalidade boa. Paciente dentro da faixa de normalidade."
}

// Interpretação:
// ✅ Funcionalidade BOM
// 📊 Escore geral: 72.5/100
// 💪 Paciente dentro da faixa de normalidade
```

---

## 10. Fluxo Completo de Atendimento

### Passo a Passo

```typescript
// 1. AGENDA
//    - Clicar em agendamento do paciente
//    - Clicar em "Iniciar Atendimento"

// 2. PÁGINA DE EVOLUÇÃO (SessionFormPage)
//    - Layout 3 colunas carregado
//    - Dados do paciente visíveis na coluna central

// 3. VER CONTEXTO DO PACIENTE
//    - Tempo de tratamento: "3 meses"
//    - Cirurgia: "LCA - 45 dias atrás (Fase: Reabilitação)"
//    - Patologias: 1 ativa, 2 resolvidas
//    - Metas: 2 ativas com countdown
//    - Alerta: "Medir amplitude do joelho"

// 4. REPLICAR CONDUTA (opcional)
//    - Clicar em "Replicar Conduta"
//    - Selecionar sessão anterior
//    - Selecionar campos: técnicas, exercícios, recomendações
//    - Clicar em "Aplicar"

// 5. PREENCHER FORMULÁRIO SOAP
//    - Subjetivo: "Paciente relata..."
//    - Objetivo: "Amplitude de flexão: 130°..."
//    - Avaliação: "Paciente evoluindo bem..."
//    - Plano: "Continuar exercícios..."

// 6. SALVAR SESSÃO
//    - Sistema verifica medições obrigatórias
//    - Se houver pendências: mostra diálogo de bloqueio
//    - Opção 1: Registrar medições
//    - Opção 2: Salvar mesmo assim (registra não conformidade)

// 7. VER GRÁFICOS DE EVOLUÇÃO
//    - PainEvolutionChart: Dor de 9 para 3 EVA
//    - PostOpLCAChart: Flexão de 90° para 130°
//    - Comparação com valores normativos

// 8. GERAR RELATÓRIO MÉDICO
//    - Clicar em "Gerar Relatório"
//    - Sistema sugere métricas relevantes (baseado em LCA)
//    - Compara valores com normativos
//    - Gera relatório profissional
//    - Exporta em PDF/Word

// 9. ENVIAR PARA MÉDICO
//    - Relatório pronto em < 10 segundos
//    - Inclui gráficos, tabelas, comparações
//    - Formato profissional
```

---

## 🎯 Casos de Uso Reais

### Caso 1: Paciente Pós-LCA

**Situação:**
- Paciente 28 anos, masculino
- Cirurgia de LCA há 45 dias
- 8 sessões realizadas
- Meta: Retornar ao futebol em 30 dias

**Sistema mostra:**
- ✅ Fase atual: Reabilitação (43-90 dias)
- ✅ Progresso: 65% na fase
- ✅ Flexão: 130° (96% da meta de 135°)
- ✅ Dor: 3/10 (redução de 67%)
- ⚠️ Alerta: Medir amplitude (obrigatório)
- 📊 Gráfico: Evolução da flexão com fases coloridas

**Ações:**
1. Replicar conduta da sessão anterior
2. Preencher SOAP
3. Registrar amplitude: 130°
4. Salvar sessão
5. Gerar relatório para médico do esporte

---

### Caso 2: Paciente com Lombalgia

**Situação:**
- Paciente 45 anos, feminina
- Lombalgia crônica
- 12 sessões realizadas
- Meta: Correr maratona em 60 dias

**Sistema mostra:**
- ✅ Tempo de tratamento: 2 meses
- ✅ Patologia: Lombalgia (ativa)
- ✅ Meta: Maratona - 45 dias restantes
- 📊 Métricas sugeridas: EVA, Schober, dedo-chão
- 📈 Gráfico: Evolução da dor (9 → 4 EVA)

**Ações:**
1. Ver sugestões de métricas (Schober, dedo-chão)
2. Preencher SOAP com dados objetivos
3. Comparar Schober (4.5 cm) com normal (5.0 cm)
4. Gerar relatório com comparação normativa
5. Enviar para ortopedista

---

### Caso 3: Paciente com Múltiplas Patologias

**Situação:**
- Paciente 35 anos, masculino
- Cirurgia de ombro há 60 dias
- Entorse de tornozelo (resolvida)
- 15 sessões realizadas

**Sistema mostra:**
- ✅ Ombro: Fase de Reabilitação
- ✅ Tornozelo: Resolvido (verde)
- ✅ Metas: 3 ativas
- 📊 Gráficos: Flexão ombro, dor, amplitude tornozelo
- 💡 Insights: "Intervalo médio entre sessões: 5 dias"

**Ações:**
1. Ver indicador de fase do ombro
2. Ver exercícios recomendados
3. Replicar conduta focada no ombro
4. Preencher SOAP
5. Gerar relatório completo

---

## 🔍 Dicas de Uso

### Para Fisioterapeutas

1. **Sempre verifique os alertas vermelhos** antes de salvar
2. **Use a replicação de conduta** para sessões similares
3. **Acompanhe o countdown das metas** para ajustar tratamento
4. **Exporte gráficos** para mostrar evolução ao paciente
5. **Gere relatórios mensais** para o médico

### Para Gestão

1. **Monitore a taxa de conformidade** por fisioterapeuta
2. **Analise relatórios de conformidade** mensalmente
3. **Use insights automáticos** para identificar problemas
4. **Compare resultados** com valores normativos
5. **Ajuste protocolos** baseado em dados reais

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação técnica
- Verifique os exemplos acima
- Entre em contato com o suporte

---

**Sistema implementado com sucesso! 🎉**

