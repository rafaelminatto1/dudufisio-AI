import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateClinicalAnalysis(data: {
  patientHistory: string
  currentSymptoms: string
  examFindings: string
}) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Como fisioterapeuta experiente, analise o caso clínico:

Histórico: ${data.patientHistory}
Sintomas Atuais: ${data.currentSymptoms}
Achados do Exame: ${data.examFindings}

Forneça uma análise clínica detalhada incluindo:
1. Raciocínio clínico
2. Hipóteses diagnósticas
3. Recomendações de avaliação adicional
4. Proposta de intervenção fisioterapêutica
5. Prognóstico esperado`,
        },
      ],
    })

    return {
      success: true,
      analysis: message.content[0].type === 'text' ? message.content[0].text : '',
    }
  } catch (error) {
    console.error('Error generating clinical analysis:', error)
    return {
      success: false,
      error: 'Erro ao gerar análise clínica.',
    }
  }
}

export async function generateTreatmentPlan(data: {
  diagnosis: string
  patientGoals: string
  availableResources: string
  sessionFrequency: string
}) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Crie um plano de tratamento fisioterapêutico detalhado:

Diagnóstico: ${data.diagnosis}
Objetivos do Paciente: ${data.patientGoals}
Recursos Disponíveis: ${data.availableResources}
Frequência de Sessões: ${data.sessionFrequency}

O plano deve incluir:
1. Objetivos de curto, médio e longo prazo (SMART)
2. Intervenções por fase do tratamento
3. Técnicas e modalidades específicas
4. Critérios de progressão
5. Indicadores de alta
6. Orientações para o paciente`,
        },
      ],
    })

    return {
      success: true,
      plan: message.content[0].type === 'text' ? message.content[0].text : '',
    }
  } catch (error) {
    console.error('Error generating treatment plan:', error)
    return {
      success: false,
      error: 'Erro ao gerar plano de tratamento.',
    }
  }
}

export async function analyzeProgressNotes(notes: string[]) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Analise as seguintes evoluções de sessões de fisioterapia:

${notes.map((note, i) => `Sessão ${i + 1}: ${note}`).join('\n\n')}

Forneça:
1. Resumo da progressão do paciente
2. Tendências identificadas (melhora, estagnação, piora)
3. Fatores que podem estar influenciando o progresso
4. Recomendações para ajuste do tratamento
5. Indicadores de eficácia da intervenção`,
        },
      ],
    })

    return {
      success: true,
      analysis: message.content[0].type === 'text' ? message.content[0].text : '',
    }
  } catch (error) {
    console.error('Error analyzing progress notes:', error)
    return {
      success: false,
      error: 'Erro ao analisar evoluções.',
    }
  }
}

