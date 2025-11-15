# Arquitetura de IA Enterprise - FisioFlow

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Stack de IA e LLMs](#stack-de-ia-e-llms)
3. [Sistema RAG (Retrieval-Augmented Generation)](#sistema-rag)
4. [Análise Preditiva](#análise-preditiva)
5. [Computer Vision](#computer-vision)
6. [Processamento de Linguagem Natural](#processamento-de-linguagem-natural)
7. [Fluxos de Dados](#fluxos-de-dados)
8. [Segurança e Privacy](#segurança-e-privacy)
9. [Escalabilidade e Performance](#escalabilidade-e-performance)
10. [Custos e Otimizações](#custos-e-otimizações)

---

## 🎯 Visão Geral da Arquitetura

### Princípios Fundamentais

1. **Multi-Model Approach**: Usar o modelo certo para cada tarefa
2. **Edge-First**: Processar próximo ao usuário quando possível
3. **Cost-Conscious**: Otimizar custos sem sacrificar qualidade
4. **Privacy-First**: Dados médicos nunca saem sem consentimento
5. **Fail Gracefully**: Degradação elegante quando IA não disponível

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Chat   │  │ Análise  │  │  Vídeo   │  │ Dashbd  │ │
│  │   RAG    │  │ Predict. │  │  Pose    │  │ Insights│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼───────┐
│       │             │             │             │       │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐  │
│  │            Vercel Edge Functions                   │  │
│  │  ┌────────────┐  ┌───────────┐  ┌──────────────┐ │  │
│  │  │  Routing   │  │Rate Limit │  │     Cache    │ │  │
│  │  └────────────┘  └───────────┘  └──────────────┘ │  │
│  └────┬────────────────┬──────────────┬──────────────┘  │
└───────┼────────────────┼──────────────┼─────────────────┘
        │                │              │
┌───────┼────────────────┼──────────────┼─────────────────┐
│       │                │              │                 │
│  ┌────▼──────┐    ┌────▼──────┐  ┌───▼────────┐        │
│  │  OpenAI   │    │  Gemini   │  │ MediaPipe  │        │
│  │  GPT-4    │    │    Pro    │  │   Pose     │        │
│  └────┬──────┘    └────┬──────┘  └───┬────────┘        │
│       │                │              │                 │
│  ┌────▼────────────────▼──────────────▼────────┐        │
│  │        Supabase Edge Functions              │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │        │
│  │  │ Process  │  │ Analyze  │  │  Store   │ │        │
│  │  └──────────┘  └──────────┘  └──────────┘ │        │
│  └────┬──────────────────────────────────────┘        │
└───────┼──────────────────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────────────┐
│             Supabase Database (PostgreSQL)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ knowledge_  │  │  patient_   │  │   health_   │    │
│  │    base     │  │    data     │  │   metrics   │    │
│  │  (pgvector) │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🤖 Stack de IA e LLMs

### 1. OpenAI (GPT-4 Turbo)

**Quando usar:**
- ✅ Análise preditiva complexa
- ✅ Geração de relatórios médicos
- ✅ Recomendações de tratamento
- ✅ Chatbot especializado (RAG)
- ✅ Classificação de dados

**Não usar para:**
- ❌ Tarefas simples (muito caro)
- ❌ Dados que precisam estar sempre atualizados
- ❌ Processamento de vídeo (usar Gemini)

**Modelos e Custos:**
```
GPT-4 Turbo (gpt-4-turbo-preview)
- Input: $10/1M tokens
- Output: $30/1M tokens
- Contexto: 128k tokens
- Velocidade: ~40 tokens/seg

GPT-4 (gpt-4)
- Input: $30/1M tokens
- Output: $60/1M tokens
- Contexto: 8k tokens
- Use apenas se precisar de qualidade máxima

GPT-3.5 Turbo (gpt-3.5-turbo)
- Input: $0.50/1M tokens
- Output: $1.50/1M tokens
- Contexto: 16k tokens
- Use para tarefas simples
```

**Implementação:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuração padrão para FisioFlow
const DEFAULT_CONFIG = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.3, // Baixa para respostas mais consistentes
  max_tokens: 1000,
  top_p: 0.9,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
};
```

### 2. Google Gemini Pro

**Quando usar:**
- ✅ Análise de vídeos (Gemini Pro Vision)
- ✅ RAG com contexto massivo (2M tokens)
- ✅ Multimodalidade (texto + imagem + vídeo)
- ✅ Grounding (busca em tempo real)
- ✅ Processamento de documentos longos

**Não usar para:**
- ❌ Function calling complexo (GPT-4 é melhor)
- ❌ Quando precisar de JSON estruturado garantido

**Modelos e Custos:**
```
Gemini Pro
- Input: $0.50/1M tokens
- Output: $1.50/1M tokens
- Contexto: 2M tokens (MASSIVO!)
- Velocidade: ~30 tokens/seg

Gemini Pro Vision
- Input: $7/1M tokens
- Output: $21/1M tokens
- Suporta: Imagens e vídeos
- Max 30 FPS para vídeo
```

**Implementação:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Para texto
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Para vídeo/imagem
const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
```

### 3. Perplexity Pro

**Quando usar:**
- ✅ Pesquisa de evidências científicas
- ✅ Atualização de protocolos clínicos
- ✅ Fact-checking
- ✅ Citações acadêmicas

**Custo:**
- $20/mês fixo (unlimited API calls no plano Pro)
- Excelente custo-benefício para pesquisas

**Implementação:**
```typescript
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

async function searchScientificEvidence(query: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pplx-70b-online',
      messages: [
        {
          role: 'system',
          content: 'Você é um pesquisador científico especializado em fisioterapia. Forneça respostas baseadas em evidências com citações.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    }),
  });
  
  const data = await response.json();
  return {
    answer: data.choices[0].message.content,
    citations: data.citations,
  };
}
```

### 4. Anthropic Claude

**Quando usar:**
- ✅ Análise de textos muito longos
- ✅ Revisão ética de conteúdo
- ✅ Raciocínio passo a passo
- ✅ Quando precisar de respostas mais cautelosas

**Modelos:**
```
Claude 3 Opus
- Input: $15/1M tokens
- Output: $75/1M tokens
- Contexto: 200k tokens
- Melhor qualidade

Claude 3 Sonnet
- Input: $3/1M tokens
- Output: $15/1M tokens
- Contexto: 200k tokens
- Balanceado

Claude 3 Haiku
- Input: $0.25/1M tokens
- Output: $1.25/1M tokens
- Contexto: 200k tokens
- Rápido e barato
```

---

## 🔍 Sistema RAG (Retrieval-Augmented Generation)

### Arquitetura do RAG

```
┌─────────────────────────────────────────────────────────┐
│                  1. INGESTÃO                            │
│                                                         │
│  PDF/Markdown/Web  ─► Text Extraction ─► Chunking     │
│                                               │         │
│                                               ▼         │
│                                          Embedding      │
│                                         (OpenAI ada)    │
│                                               │         │
│                                               ▼         │
│                                       Supabase pgvector │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  2. RETRIEVAL                           │
│                                                         │
│  User Query ─► Embedding ─► Vector Search ─► Top 5     │
│                (OpenAI)     (pgvector)      relevant    │
│                                             chunks      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  3. GENERATION                          │
│                                                         │
│  System Prompt + Context + Query ─► GPT-4 ─► Response  │
│                                                         │
│  Incluir metadados e citações na resposta              │
└─────────────────────────────────────────────────────────┘
```

### Pipeline Detalhado

#### 1. Document Processing

```typescript
// lib/document-processor.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function processDocument(
  content: string,
  metadata: { title: string; source: string; type: string }
) {
  // 1. Limpeza do texto
  const cleanedContent = content
    .replace(/\n{3,}/g, '\n\n') // Múltiplas quebras
    .replace(/\s+/g, ' ') // Espaços extras
    .trim();
  
  // 2. Chunking inteligente
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // ~250 palavras
    chunkOverlap: 200, // Overlap para manter contexto
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });
  
  const chunks = await splitter.splitText(cleanedContent);
  
  // 3. Processar cada chunk
  const processedChunks = chunks.map((chunk, index) => ({
    content: chunk,
    metadata: {
      ...metadata,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
  
  return processedChunks;
}
```

#### 2. Embedding Generation

```typescript
// lib/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // Mais barato e eficiente
    input: text,
    encoding_format: 'float',
  });
  
  return response.data[0].embedding;
}

// Batch processing para eficiência
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts, // Até 2048 textos por batch
  });
  
  return response.data.map(d => d.embedding);
}
```

#### 3. Vector Search

```sql
-- Otimizar busca com múltiplos filtros
CREATE OR REPLACE FUNCTION advanced_search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 10,
  filter_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 
    1 - (kb.embedding <=> query_embedding) > match_threshold
    AND (
      filter_metadata IS NULL 
      OR kb.metadata @> filter_metadata
    )
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### 4. Context Construction

```typescript
// lib/rag.ts
export async function buildContext(
  query: string,
  options: {
    maxChunks?: number;
    minSimilarity?: number;
    filters?: any;
  } = {}
) {
  // 1. Buscar chunks relevantes
  const relevantChunks = await searchDocuments(query, {
    count: options.maxChunks || 5,
    threshold: options.minSimilarity || 0.75,
    filterType: options.filters?.type,
  });
  
  // 2. Ordenar por similaridade
  const sortedChunks = relevantChunks.sort((a, b) => 
    b.similarity - a.similarity
  );
  
  // 3. Construir contexto
  const context = sortedChunks.map((chunk, index) => 
    `[Fonte ${index + 1}: ${chunk.metadata.title}]\n${chunk.content}`
  ).join('\n\n---\n\n');
  
  // 4. Incluir metadados de citação
  const sources = sortedChunks.map((chunk, index) => ({
    id: index + 1,
    title: chunk.metadata.title,
    type: chunk.metadata.type,
    url: chunk.metadata.url,
    similarity: chunk.similarity,
  }));
  
  return { context, sources };
}
```

#### 5. Response Generation

```typescript
export async function generateRAGResponse(
  userQuery: string,
  conversationHistory: Message[] = []
) {
  // 1. Buscar contexto relevante
  const { context, sources } = await buildContext(userQuery);
  
  // 2. Construir prompt
  const systemPrompt = `Você é um assistente especializado em fisioterapia, treinado para ajudar profissionais da saúde.

BASE DE CONHECIMENTO:
${context}

INSTRUÇÕES:
- Responda apenas com base nas informações fornecidas acima
- Se a informação não estiver na base de conhecimento, diga claramente
- Cite as fontes usando [Fonte X]
- Seja preciso, claro e profissional
- Use terminologia técnica quando apropriado
- Forneça exemplos práticos quando possível`;

  // 3. Chamar GPT-4
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    max_tokens: 1000,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userQuery },
    ],
  });
  
  const response = completion.choices[0].message.content;
  
  // 4. Retornar com metadados
  return {
    response,
    sources,
    tokensUsed: completion.usage,
  };
}
```

### Otimizações RAG

#### Cache de Embeddings
```typescript
// Cachear embeddings de queries comuns
const embeddingCache = new Map<string, number[]>();

export async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.toLowerCase().trim();
  
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }
  
  const embedding = await generateEmbedding(text);
  embeddingCache.set(cacheKey, embedding);
  
  return embedding;
}
```

#### Hybrid Search (Vetorial + Keyword)
```sql
-- Combinar busca vetorial com full-text search
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  weight_semantic FLOAT DEFAULT 0.7,
  weight_keyword FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  score FLOAT
)
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT 
      id,
      content,
      (1 - (embedding <=> query_embedding)) * weight_semantic AS semantic_score
    FROM knowledge_base
    ORDER BY embedding <=> query_embedding
    LIMIT 20
  ),
  keyword_search AS (
    SELECT
      id,
      content,
      ts_rank(search_vector, plainto_tsquery('portuguese', query_text)) * weight_keyword AS keyword_score
    FROM knowledge_base
    WHERE search_vector @@ plainto_tsquery('portuguese', query_text)
    ORDER BY keyword_score DESC
    LIMIT 20
  )
  SELECT
    COALESCE(s.id, k.id) AS id,
    COALESCE(s.content, k.content) AS content,
    COALESCE(s.semantic_score, 0) + COALESCE(k.keyword_score, 0) AS score
  FROM semantic_search s
  FULL OUTER JOIN keyword_search k ON s.id = k.id
  ORDER BY score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Análise Preditiva

### Arquitetura

```
Dados Históricos do Paciente
        │
        ├─ Demografia (idade, sexo, etc)
        ├─ Diagnóstico e condições
        ├─ Histórico de sessões
        ├─ Progresso/evolução
        ├─ Adesão ao tratamento
        └─ Fatores de risco
        │
        ▼
Feature Engineering
        │
        ├─ Agregações temporais
        ├─ Tendências
        ├─ Padrões de comportamento
        └─ Indicadores clínicos
        │
        ▼
   GPT-4 Analysis
        │
        ├─ Contexto médico
        ├─ Dados estruturados
        ├─ Prompt especializado
        └─ JSON output
        │
        ▼
Predictions + Recommendations
```

### Tipos de Análise

#### 1. Previsão de Tempo de Recuperação

```typescript
interface RecoveryPrediction {
  estimatedWeeks: number;
  confidence: number; // 0-100
  factors: {
    positive: string[]; // Fatores que ajudam
    negative: string[]; // Fatores que atrapalham
  };
  milestones: {
    week: number;
    description: string;
    expectedProgress: string;
  }[];
  recommendations: string[];
}

async function predictRecoveryTime(
  patientId: string
): Promise<RecoveryPrediction> {
  // 1. Coletar dados
  const patientData = await fetchPatientData(patientId);
  
  // 2. Preparar prompt
  const prompt = `Analise os seguintes dados de um paciente de fisioterapia:

DADOS DEMOGRÁFICOS:
- Idade: ${patientData.age}
- Sexo: ${patientData.gender}
- Condições pré-existentes: ${patientData.conditions}

DIAGNÓSTICO:
- Principal: ${patientData.diagnosis}
- Gravidade: ${patientData.severity}
- Data do início: ${patientData.startDate}

HISTÓRICO DE TRATAMENTO:
- Sessões realizadas: ${patientData.sessionsCompleted}
- Adesão: ${patientData.adherence}%
- Progresso atual: ${patientData.currentProgress}
- Exercícios realizados: ${patientData.exercises}

Com base nesses dados e em evidências científicas de fisioterapia, forneça:
1. Estimativa de tempo para recuperação completa (em semanas)
2. Nível de confiança (0-100)
3. Fatores positivos e negativos que influenciam
4. Marcos esperados ao longo da recuperação
5. Recomendações específicas

Responda em JSON no seguinte formato:
{
  "estimatedWeeks": number,
  "confidence": number,
  "factors": { "positive": [...], "negative": [...] },
  "milestones": [...],
  "recommendations": [...]
}`;

  // 3. Chamar GPT-4
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    temperature: 0.2, // Baixa para ser mais consistente
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Você é um fisioterapeuta experiente com 20 anos de prática clínica.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  
  // 4. Parsear e retornar
  return JSON.parse(completion.choices[0].message.content);
}
```

#### 2. Risco de Abandono

```typescript
interface DropoutRisk {
  riskLevel: 'baixo' | 'médio' | 'alto';
  probability: number; // 0-100
  riskFactors: {
    factor: string;
    impact: 'alto' | 'médio' | 'baixo';
    description: string;
  }[];
  interventions: {
    intervention: string;
    priority: 'alta' | 'média' | 'baixa';
    description: string;
  }[];
}

async function predictDropoutRisk(
  patientId: string
): Promise<DropoutRisk> {
  // Similar ao anterior, mas focado em fatores de abandono:
  // - Padrão de faltas
  // - Engajamento com exercícios
  // - Feedback de sessões
  // - Fatores socioeconômicos
  // - Distância da clínica
  // - Satisfação com tratamento
}
```

---

## 👁️ Computer Vision

### MediaPipe Pose Detection

```typescript
// lib/pose-detection.ts
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export class PoseAnalyzer {
  private detector: poseDetection.PoseDetector | null = null;
  
  async initialize() {
    const model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
      runtime: 'tfjs',
      modelType: 'full',
      enableSmoothing: true,
    };
    
    this.detector = await poseDetection.createDetector(
      model,
      detectorConfig
    );
  }
  
  async detectPose(videoElement: HTMLVideoElement) {
    if (!this.detector) {
      throw new Error('Detector not initialized');
    }
    
    const poses = await this.detector.estimatePoses(videoElement);
    
    if (poses.length === 0) {
      return null;
    }
    
    return poses[0]; // Primeira pessoa detectada
  }
  
  calculateAngle(
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
    pointC: { x: number; y: number }
  ): number {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }
  
  analyzeExerciseExecution(
    pose: poseDetection.Pose,
    exerciseType: string
  ): ExerciseAnalysis {
    const keypoints = pose.keypoints;
    
    // Exemplo: Agachamento
    if (exerciseType === 'squat') {
      const leftHip = keypoints.find(kp => kp.name === 'left_hip');
      const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
      const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
      
      if (leftHip && leftKnee && leftAnkle) {
        const kneeAngle = this.calculateAngle(
          { x: leftHip.x, y: leftHip.y },
          { x: leftKnee.x, y: leftKnee.y },
          { x: leftAnkle.x, y: leftAnkle.y }
        );
        
        // Avaliação
        const analysis: ExerciseAnalysis = {
          score: 0,
          feedback: [],
          metrics: { kneeAngle },
        };
        
        if (kneeAngle < 70) {
          analysis.feedback.push('⚠️ Joelhos flexionados demais');
          analysis.score = 60;
        } else if (kneeAngle > 120) {
          analysis.feedback.push('⚠️ Desça um pouco mais');
          analysis.score = 70;
        } else {
          analysis.feedback.push('✅ Amplitude correta!');
          analysis.score = 95;
        }
        
        return analysis;
      }
    }
    
    return { score: 0, feedback: ['Exercício não reconhecido'], metrics: {} };
  }
}
```

### Análise com Gemini Pro Vision

```typescript
async function analyzeVideoWithGemini(
  videoUrl: string,
  exerciseType: string
): Promise<VideoAnalysis> {
  // 1. Download do vídeo
  const videoBlob = await downloadVideo(videoUrl);
  
  // 2. Converter para base64
  const base64Video = await blobToBase64(videoBlob);
  
  // 3. Preparar prompt
  const prompt = `Analise este vídeo de um paciente executando o exercício: ${exerciseType}

Avalie os seguintes aspectos:

1. POSTURA E ALINHAMENTO:
   - Alinhamento da coluna
   - Posição do quadril
   - Posição dos ombros
   - Posição da cabeça

2. EXECUÇÃO DO MOVIMENTO:
   - Amplitude de movimento (ROM)
   - Velocidade e controle
   - Fluidelz do movimento
   - Fase concêntrica e excêntrica

3. SIMETRIA:
   - Equilíbrio entre lados
   - Compensações

4. SEGURANÇA:
   - Riscos de lesão observados
   - Pontos de atenção

Forneça:
- Score geral (0-100)
- 3-5 pontos positivos
- 3-5 pontos de melhoria
- Recomendações específicas
- Nível de risco (baixo/médio/alto)

Responda em JSON estruturado.`;

  // 4. Chamar Gemini Pro Vision
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'video/mp4',
        data: base64Video,
      },
    },
    prompt,
  ]);
  
  const response = await result.response;
  const analysis = JSON.parse(response.text());
  
  return analysis;
}
```

---

## 💰 Custos e Otimizações

### Estimativa de Custos Mensais

```
BASE (100 usuários ativos/dia):

1. RAG (Base de Conhecimento):
   - Embeddings: 50 docs/dia × 1000 tokens × $0.00002 = $0.03/dia = $0.90/mês
   - Queries: 500/dia × 100 tokens × $0.00002 = $0.10/dia = $3/mês
   - GPT-4 responses: 500/dia × 500 tokens × $0.03 = $7.50/dia = $225/mês
   TOTAL RAG: ~$229/mês

2. Análise Preditiva:
   - 50 análises/dia × 2000 tokens × $0.03 = $3/dia = $90/mês
   
3. Análise de Vídeo:
   - 20 vídeos/dia × $0.30/vídeo = $6/dia = $180/mês
   
4. Perplexity (pesquisas):
   - $20/mês (unlimited)

TOTAL ESTIMADO: ~$519/mês (100 usuários ativos)

POR USUÁRIO: ~$5.19/mês
```

### Estratégias de Otimização

#### 1. Cache Inteligente

```typescript
// lib/ai-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedAIResponse(
  cacheKey: string,
  generator: () => Promise<any>,
  ttl: number = 3600 // 1 hora
): Promise<any> {
  // 1. Tentar buscar do cache
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    console.log('Cache HIT:', cacheKey);
    return cached;
  }
  
  console.log('Cache MISS:', cacheKey);
  
  // 2. Gerar novo
  const result = await generator();
  
  // 3. Cachear
  await redis.setex(cacheKey, ttl, JSON.stringify(result));
  
  return result;
}

// Uso
const response = await getCachedAIResponse(
  `rag:${query}`,
  () => generateRAGResponse(query),
  3600
);
```

#### 2. Batch Processing

```typescript
// Processar múltiplos embeddings de uma vez
const texts = [doc1, doc2, doc3, ...];
const embeddings = await generateEmbeddingsBatch(texts);
// Economiza ~50% de tempo e custo vs. individual
```

#### 3. Modelo Cascata

```typescript
// Começar com modelo mais barato
async function smartCompletion(prompt: string, complexity: 'simple' | 'medium' | 'complex') {
  if (complexity === 'simple') {
    return await gpt35Completion(prompt); // $0.001/1K tokens
  } else if (complexity === 'medium') {
    return await gpt4Completion(prompt); // $0.03/1K tokens
  } else {
    return await gpt4TurboCompletion(prompt); // $0.01/1K tokens
  }
}
```

#### 4. Limites por Usuário

```typescript
// lib/usage-limits.ts
export async function checkUsageLimit(
  userId: string,
  feature: 'rag' | 'prediction' | 'video_analysis'
): Promise<boolean> {
  const limits = {
    rag: 50, // 50 queries/dia
    prediction: 10, // 10 análises/dia
    video_analysis: 5, // 5 vídeos/dia
  };
  
  const count = await redis.incr(`usage:${userId}:${feature}:${todayKey()}`);
  
  if (count === 1) {
    await redis.expire(`usage:${userId}:${feature}:${todayKey()}`, 86400);
  }
  
  return count <= limits[feature];
}
```

---

## 🔒 Segurança e Privacy

### Princípios

1. **Anonimização**: Remover PII antes de enviar para LLMs
2. **Criptografia**: Dados em trânsito e em repouso
3. **Consentimento**: Usuário deve consentir uso de IA
4. **Auditoria**: Log de todas interações com IA
5. **Compliance**: LGPD, HIPAA-ready

### Implementação

```typescript
// lib/data-anonymization.ts
export function anonymizePatientData(data: PatientData): AnonymizedData {
  return {
    age: data.age,
    gender: data.gender,
    diagnosis: data.diagnosis,
    // Remover:
    // - Nome
    // - CPF
    // - Endereço
    // - Telefone
    // - Email
    
    // Generalizar datas
    treatmentDuration: calculateDuration(data.startDate, new Date()),
    
    // Hash IDs
    patientId: hashId(data.id),
  };
}
```

---

## 📈 Métricas e Monitoramento

### KPIs de IA

```typescript
interface AIMetrics {
  // Performance
  averageResponseTime: number; // ms
  p95ResponseTime: number;
  cacheHitRate: number; // %
  
  // Qualidade
  userSatisfactionScore: number; // 1-5
  accuracyRate: number; // %
  halluccinationRate: number; // %
  
  // Custo
  dailyCost: number; // USD
  costPerUser: number;
  costPerQuery: number;
  
  // Uso
  totalQueries: number;
  uniqueUsers: number;
  mostUsedFeatures: string[];
}
```

---

**Elaborado em:** Janeiro 2025  
**Próxima Revisão:** Abril 2025  
**Versão:** 1.0

