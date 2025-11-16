import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMedicalReport(patientData: {
  name: string
  complaint: string
  examination: string
  diagnosis?: string
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Você é um fisioterapeuta experiente especializado em criar laudos médicos detalhados e profissionais. 
          Seu objetivo é gerar um laudo fisioterapêutico completo com base nas informações fornecidas.`,
        },
        {
          role: 'user',
          content: `Crie um laudo fisioterapêutico para o paciente:
          
Nome: ${patientData.name}
Queixa Principal: ${patientData.complaint}
Exame Físico: ${patientData.examination}
${patientData.diagnosis ? `Diagnóstico: ${patientData.diagnosis}` : ''}

O laudo deve incluir:
1. Identificação do paciente
2. Anamnese e queixa principal
3. Exame físico detalhado
4. Diagnóstico fisioterapêutico
5. Objetivos do tratamento
6. Plano de tratamento proposto
7. Prognóstico`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return {
      success: true,
      report: completion.choices[0].message.content,
      usage: completion.usage,
    }
  } catch (error) {
    console.error('Error generating medical report:', error)
    return {
      success: false,
      error: 'Erro ao gerar laudo. Tente novamente.',
    }
  }
}

export async function generateSessionEvolution(sessionData: {
  patientName: string
  sessionNumber: number
  exercises: string[]
  patientResponse: string
  painLevel?: number
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um fisioterapeuta criando uma evolução de sessão clara e profissional.',
        },
        {
          role: 'user',
          content: `Crie uma evolução para a sessão #${sessionData.sessionNumber} do paciente ${sessionData.patientName}:

Exercícios realizados: ${sessionData.exercises.join(', ')}
Resposta do paciente: ${sessionData.patientResponse}
${sessionData.painLevel ? `Nível de dor (0-10): ${sessionData.painLevel}` : ''}

A evolução deve ser objetiva e incluir:
- Procedimentos realizados
- Resposta ao tratamento
- Observações relevantes
- Plano para próxima sessão`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    })

    return {
      success: true,
      evolution: completion.choices[0].message.content,
    }
  } catch (error) {
    console.error('Error generating session evolution:', error)
    return {
      success: false,
      error: 'Erro ao gerar evolução.',
    }
  }
}

export async function generateHEP(patientData: {
  name: string
  condition: string
  limitations?: string
  goals: string
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um fisioterapeuta criando um Programa de Exercícios Domiciliares (HEP) personalizado.',
        },
        {
          role: 'user',
          content: `Crie um HEP para:

Paciente: ${patientData.name}
Condição: ${patientData.condition}
${patientData.limitations ? `Limitações: ${patientData.limitations}` : ''}
Objetivos: ${patientData.goals}

O HEP deve incluir:
- 5-7 exercícios específicos
- Descrição clara de cada exercício
- Repetições e séries
- Frequência (dias por semana)
- Precauções e orientações
- Progressão sugerida`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    return {
      success: true,
      hep: completion.choices[0].message.content,
    }
  } catch (error) {
    console.error('Error generating HEP:', error)
    return {
      success: false,
      error: 'Erro ao gerar HEP.',
    }
  }
}

export async function analyzeRisk(patientData: {
  age: number
  conditions: string[]
  medications: string[]
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
  }
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um fisioterapeuta realizando análise de risco clínico para tratamento fisioterapêutico.',
        },
        {
          role: 'user',
          content: `Realize uma análise de risco para:

Idade: ${patientData.age} anos
Condições médicas: ${patientData.conditions.join(', ')}
Medicações: ${patientData.medications.join(', ')}
${patientData.vitalSigns ? `Sinais vitais: PA: ${patientData.vitalSigns.bloodPressure}, FC: ${patientData.vitalSigns.heartRate}bpm` : ''}

Forneça:
1. Nível de risco (Baixo/Moderado/Alto)
2. Principais fatores de risco identificados
3. Contraindicações para tratamento
4. Precauções necessárias
5. Recomendações para segurança do tratamento`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    })

    return {
      success: true,
      analysis: completion.choices[0].message.content,
    }
  } catch (error) {
    console.error('Error analyzing risk:', error)
    return {
      success: false,
      error: 'Erro ao analisar risco.',
    }
  }
}

