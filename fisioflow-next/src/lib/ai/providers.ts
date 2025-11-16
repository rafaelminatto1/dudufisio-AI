import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

export type AIProvider = 'openai' | 'anthropic'

export interface AIConfig {
  provider: AIProvider
  model: string
  temperature?: number
  maxTokens?: number
}

const defaultConfig: AIConfig = {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
}

export function getAIModel(config: Partial<AIConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  switch (finalConfig.provider) {
    case 'openai':
      return openai(finalConfig.model)
    case 'anthropic':
      return anthropic(finalConfig.model)
    default:
      return openai(finalConfig.model)
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateCompletion(
  messages: ChatMessage[],
  config?: Partial<AIConfig>
) {
  const model = getAIModel(config)
  
  // Implementação usando Vercel AI SDK
  // const result = await generateText({
  //   model,
  //   messages,
  // })
  
  // Placeholder para implementação real
  return {
    text: 'Resposta gerada pela IA',
    usage: {
      promptTokens: 100,
      completionTokens: 200,
    },
  }
}

// Funções específicas para fisioterapia
export async function generateClinicalReport(
  patientData: unknown,
  config?: Partial<AIConfig>
) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'Você é um assistente especializado em fisioterapia. Gere relatórios clínicos detalhados e profissionais.',
    },
    {
      role: 'user',
      content: `Gere um relatório clínico baseado nos seguintes dados: ${JSON.stringify(
        patientData
      )}`,
    },
  ]

  return generateCompletion(messages, config)
}

export async function suggestTreatmentPlan(
  diagnosis: string,
  patientHistory: unknown,
  config?: Partial<AIConfig>
) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'Você é um fisioterapeuta experiente. Sugira planos de tratamento baseados em evidências.',
    },
    {
      role: 'user',
      content: `Diagnóstico: ${diagnosis}. Histórico: ${JSON.stringify(
        patientHistory
      )}. Sugira um plano de tratamento.`,
    },
  ]

  return generateCompletion(messages, config)
}

