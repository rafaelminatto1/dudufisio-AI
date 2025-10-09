// Mock service for build purposes - Complete function list
export const generateTreatmentProtocol = () => Promise.resolve('');
export const generateSoapNote = () => Promise.resolve('');
export const analyzePainPatterns = () => Promise.resolve('');
export const parseProtocolForTreatmentPlan = () => Promise.resolve({
    treatmentGoals: [],
    exercises: []
});
export const generateClinicalInsights = () => Promise.resolve('');
export const generatePatientReport = () => Promise.resolve('');
export const generateRiskAnalysis = () => Promise.resolve('');
export const generatePainDiaryAnalysis = () => Promise.resolve('');
export const generateEducationalContent = () => Promise.resolve('');
export const generateRetentionSuggestion = () => Promise.resolve('');
export const generateEvaluationReport = () => Promise.resolve('');
export const generateSessionEvolution = () => Promise.resolve('');
export const generateHep = () => Promise.resolve('');
export const generatePatientProgressSummary = () => Promise.resolve('');
export const generateAppointmentReminder = () => Promise.resolve('');
export const generateInactivePatientEmail = () => Promise.resolve('');
export const generateClinicalMaterialContent = async (data) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { nome_material, tipo_material } = data;
    // Conteúdo mock baseado no tipo de material
    switch (tipo_material) {
        case 'Escala de Avaliação':
            return `# ${nome_material}

## Descrição
Esta é uma escala de avaliação clínica utilizada para mensurar aspectos específicos da condição do paciente.

## Como Utilizar
1. **Aplicação**: Aplique a escala conforme as instruções específicas
2. **Pontuação**: Registre os pontos obtidos em cada item
3. **Interpretação**: Consulte a tabela de referência para interpretação dos resultados

## Critérios de Interpretação
- **0-25 pontos**: Baixo risco/severidade
- **26-50 pontos**: Risco moderado
- **51-75 pontos**: Alto risco
- **76-100 pontos**: Risco muito alto

## Observações Clínicas
- Sempre considere o contexto clínico do paciente
- Documente as condições de aplicação da escala
- Reavalie periodicamente conforme protocolo

## Referências
- Baseado em evidências científicas atuais
- Validação clínica em população brasileira
- Atualização: 2024`;
        case 'Protocolo Clínico':
            return `# ${nome_material}

## Objetivo
Protocolo clínico baseado em evidências científicas para o tratamento de condições específicas.

## Indicações
- Pacientes com diagnóstico confirmado
- Idade: 18-65 anos
- Ausência de contraindicações específicas

## Contraindicações
- Processos inflamatórios agudos
- Fraturas não consolidadas
- Instabilidade articular severa

## Fases do Tratamento

### Fase 1: Aguda (0-2 semanas)
- **Objetivo**: Controle da dor e inflamação
- **Intervenções**:
  - Crioterapia
  - Repouso relativo
  - Medicação prescrita pelo médico

### Fase 2: Subaguda (2-6 semanas)
- **Objetivo**: Restauração da amplitude de movimento
- **Intervenções**:
  - Mobilização passiva
  - Exercícios de alongamento
  - Fortalecimento isométrico

### Fase 3: Crônica (6+ semanas)
- **Objetivo**: Fortalecimento e retorno às atividades
- **Intervenções**:
  - Exercícios de fortalecimento
  - Treinamento funcional
  - Retorno gradual às atividades

## Critérios de Progressão
- Redução da dor < 3/10
- Melhora da amplitude de movimento
- Ausência de sinais inflamatórios

## Monitoramento
- Avaliação semanal
- Registro de progresso
- Ajustes conforme necessário

## Evidências Científicas
Baseado em estudos de nível de evidência A e B, com resultados significativos em população similar.`;
        default:
            return `# ${nome_material}

## Introdução
Material de orientação clínica para profissionais de fisioterapia.

## Conteúdo Principal
Este material contém informações essenciais para a prática clínica baseada em evidências.

### Pontos Importantes
1. **Aplicação Clínica**: Utilize conforme protocolos estabelecidos
2. **Documentação**: Registre todas as aplicações e resultados
3. **Atualização**: Mantenha-se atualizado com as últimas evidências

## Orientações de Uso
- Leia atentamente todas as instruções
- Consulte a bibliografia recomendada
- Em caso de dúvidas, consulte um especialista

## Considerações Especiais
- Adapte conforme as necessidades individuais do paciente
- Considere fatores culturais e sociais
- Mantenha confidencialidade dos dados

## Referências
- Baseado em evidências científicas atuais
- Revisão sistemática da literatura
- Consenso de especialistas

---
*Material atualizado em 2024 - DuduFisio-AI*`;
    }
};
export const generatePatientClinicalSummary = (_patient, _notes) => Promise.resolve('');
