# Prompts para Implementação no Cursor IDE - FisioFlow Enterprise

## 📋 Índice de Prompts

1. [Base de Conhecimento com RAG](#1-base-de-conhecimento-com-rag)
2. [Análise Preditiva com GPT-4](#2-análise-preditiva-com-gpt-4)
3. [Análise de Movimento por Vídeo](#3-análise-de-movimento-por-vídeo)
4. [Sistema de Gamificação](#4-sistema-de-gamificação)
5. [Integração com Wearables](#5-integração-com-wearables)
6. [Otimizações Enterprise](#6-otimizações-enterprise)
7. [Edge Functions](#7-edge-functions)
8. [Realtime Features](#8-realtime-features)

---

## Como Usar Este Guia

1. **Copie o prompt completo** da funcionalidade desejada
2. **Cole no Cursor IDE** (Ctrl+L ou Cmd+L)
3. **Revise** as variáveis de ambiente necessárias
4. **Execute** e valide a implementação
5. **Teste** conforme o checklist fornecido

---

## 1. Base de Conhecimento com RAG

### Prompt 1.1: Criar Migration para pgvector

```
Crie uma migration do Supabase para implementar a base de conhecimento com pgvector.

Requisitos:
- Habilitar extensão vector
- Criar tabela knowledge_base com:
  * id (UUID, primary key)
  * content (TEXT, conteúdo do documento)
  * embedding (VECTOR(1536), para embeddings OpenAI)
  * metadata (JSONB, metadados flexíveis)
  * source_type (TEXT, tipo: 'article', 'protocol', 'book', 'note')
  * source_title (TEXT)
  * source_url (TEXT, opcional)
  * author (TEXT, opcional)
  * created_at e updated_at (TIMESTAMPTZ)

- Criar índice HNSW para busca vetorial eficiente
- Criar função search_knowledge(query_embedding, match_threshold, match_count, filter_type)
- Adicionar RLS policies:
  * Fisioterapeutas podem inserir documentos
  * Fisioterapeutas veem documentos próprios ou da clínica
  * Admins veem todos

Arquivo de saída: supabase/migrations/[timestamp]_create_knowledge_base.sql
```

### Prompt 1.2: Implementar Biblioteca de Gerenciamento

```typescript
Crie a biblioteca completa de gerenciamento da base de conhecimento em TypeScript.

Arquivo: lib/knowledge-base.ts

Funções necessárias:
1. addDocument(content: string, metadata: any): Promise<KnowledgeDoc>
   - Gerar embedding com OpenAI text-embedding-3-small
   - Salvar no Supabase
   - Retornar documento criado

2. searchDocuments(query: string, options?: SearchOptions): Promise<SearchResult[]>
   - Gerar embedding da query
   - Buscar no Supabase usando função search_knowledge
   - Retornar documentos ordenados por similaridade

3. chatWithKnowledge(userMessage: string, conversationHistory: Message[]): Promise<ChatResponse>
   - Buscar contexto relevante (top 5 docs)
   - Construir prompt com contexto
   - Gerar resposta com GPT-4 Turbo
   - Incluir fontes na resposta

4. updateDocument(id: string, updates: Partial<KnowledgeDoc>): Promise<KnowledgeDoc>
   - Se content mudou, regenerar embedding
   - Atualizar no Supabase

5. deleteDocument(id: string): Promise<void>

Tipos TypeScript:
- KnowledgeDoc
- SearchOptions
- SearchResult
- ChatResponse
- Message

Variáveis de ambiente necessárias:
- OPENAI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Prompt 1.3: Criar Interface de Chat

```typescript
Crie o componente React de chat inteligente para a base de conhecimento.

Arquivo: components/KnowledgeChat.tsx

Funcionalidades:
- Input de mensagem com textarea expansível
- Histórico de mensagens (usuário e assistente)
- Indicador de "digitando..." enquanto processa
- Exibir fontes dos documentos usados
- Botões para ações rápidas:
  * "Explicar de forma mais simples"
  * "Mostrar exemplo prático"
  * "Citar referências"
- Scrollar automaticamente para nova mensagem
- Salvam histórico no localStorage
- Botão para limpar conversa

UI/UX:
- Use shadcn/ui components (Card, Button, ScrollArea)
- Markdown rendering para respostas formatadas
- Syntax highlighting para código
- Loading skeleton enquanto carrega

Estado:
- Usar useState para mensagens
- Usar useEffect para scroll automático
- Tratar erros graciosamente

Integrar com lib/knowledge-base.ts
```

### Checklist de Validação 1:
- [ ] Migration aplicada com sucesso no Supabase
- [ ] Função search_knowledge testada diretamente no SQL
- [ ] addDocument criando embeddings corretamente
- [ ] searchDocuments retornando resultados relevantes
- [ ] Chat interface responsiva e funcional
- [ ] Fontes sendo exibidas corretamente

---

## 2. Análise Preditiva com GPT-4

### Prompt 2.1: Criar Edge Function de Análise

```
Crie uma Supabase Edge Function para análise preditiva de pacientes usando GPT-4.

Arquivo: supabase/functions/predict-outcome/index.ts

Input esperado:
{
  patientId: string,
  analysisType: 'recovery_time' | 'dropout_risk' | 'treatment_effectiveness'
}

Lógica:
1. Buscar dados históricos do paciente:
   - Informações demográficas
   - Diagnóstico e condições
   - Histórico de sessões (últimos 3 meses)
   - Progresso e evolução
   - Adesão ao tratamento

2. Preparar prompt estruturado para GPT-4:
   - Contexto: especialista em fisioterapia
   - Dados do paciente (anonimizados)
   - Pergunta específica baseada em analysisType

3. Chamar GPT-4 Turbo:
   - model: "gpt-4-turbo-preview"
   - temperature: 0.3 (mais determinístico)
   - max_tokens: 1000
   - response_format: { type: "json_object" }

4. Parsear resposta JSON com:
   - prediction: string (texto da predição)
   - confidence: number (0-100, confiança da análise)
   - factors: string[] (fatores considerados)
   - recommendations: string[] (recomendações)
   - timeframe: string (prazo estimado, se aplicável)

5. Salvar resultado em tabela predictive_analyses

6. Criar notificação para o fisioterapeuta

7. Retornar resultado formatado

Error handling robusto com try-catch
Logging adequado para debugging

Variáveis de ambiente:
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
```

### Prompt 2.2: Criar Dashboard de Insights

```typescript
Crie um dashboard React para exibir insights preditivos dos pacientes.

Arquivo: components/PredictiveInsightsDashboard.tsx

Seções do dashboard:
1. Overview Cards:
   - Total de pacientes analisados
   - Risco médio de abandono
   - Taxa de precisão das predições
   - Tempo médio de recuperação previsto

2. Tabela de Pacientes:
   - Nome do paciente
   - Risco de abandono (badge colorido)
   - Tempo estimado de recuperação
   - Última análise
   - Ação: "Ver detalhes" e "Nova análise"

3. Gráficos:
   - Distribuição de riscos (pie chart)
   - Evolução de predições ao longo do tempo (line chart)
   - Comparação predição vs. resultado real (accuracy)

4. Filtros:
   - Por fisioterapeuta
   - Por período
   - Por tipo de análise
   - Por nível de risco

Funcionalidades:
- Atualização em tempo real (Supabase Realtime)
- Export para PDF/Excel
- Drill-down em análises individuais
- Botão "Gerar nova análise" que chama Edge Function

UI:
- Use Recharts para gráficos
- shadcn/ui para componentes
- Skeleton loading
- Empty states elegantes

Estado:
- React Query para fetching e cache
- Filtros com URL query params (persistência)

Integração:
- Buscar de: predictive_analyses table
- Chamar: predict-outcome Edge Function
```

### Checklist de Validação 2:
- [ ] Edge Function deployada com sucesso
- [ ] Análise preditiva retornando JSON válido
- [ ] Resultados sendo salvos corretamente
- [ ] Dashboard carregando dados em tempo real
- [ ] Gráficos renderizando corretamente
- [ ] Filtros funcionando
- [ ] Export funcionando

---

## 3. Análise de Movimento por Vídeo

### Prompt 3.1: Integrar MediaPipe

```typescript
Crie um componente React que usa MediaPipe para análise de pose em tempo real.

Arquivo: components/PoseAnalysis.tsx

Funcionalidades:
1. Captura de webcam com react-webcam
2. Detecção de pose com @mediapipe/pose
3. Desenhar skeleton sobre o vídeo (canvas overlay)
4. Calcular ângulos de articulações em tempo real
5. Detectar erros comuns:
   - Postura incorreta
   - Amplitude de movimento insuficiente
   - Velocidade inadequada
   - Compensações

6. Feedback visual:
   - Verde: execução correta
   - Amarelo: atenção necessária
   - Vermelho: erro crítico

7. Feedback sonoro (opcional):
   - Beep para correções

8. Gravar vídeo e enviar para análise IA (Gemini Pro Vision)

Interface:
- Webcam feed principal
- Painel lateral com métricas:
  * Ângulo do ombro
  * Ângulo do cotovelo
  * Ângulo do joelho
  * Score de qualidade (0-100)
- Botões:
  * Iniciar gravação
  * Parar gravação
  * Enviar para análise
- Lista de erros detectados (em tempo real)

Integração MediaPipe:
- Usar modelo Pose Landmark
- Processar a 30 FPS
- Smooth landmarks (filtro de Kalman básico)

Variáveis de ambiente:
- NEXT_PUBLIC_MEDIAPIPE_MODEL_PATH
```

### Prompt 3.2: Criar Edge Function de Análise de Vídeo

```
Crie uma Supabase Edge Function que analisa vídeos de exercício com Gemini Pro Vision.

Arquivo: supabase/functions/analyze-video/index.ts

Input:
{
  videoUrl: string, // URL do vídeo no Supabase Storage
  patientId: string,
  exerciseId: string,
  exerciseType: string
}

Lógica:
1. Download do vídeo do Supabase Storage
2. Upload para Gemini Pro Vision (ou processar frames)
3. Prompt especializado:
   ```
   Analise este vídeo de um paciente executando o exercício [exerciseType].
   
   Avalie:
   1. Postura e alinhamento corporal (coluna, quadril, ombros)
   2. Amplitude de movimento (ROM)
   3. Velocidade e controle do movimento
   4. Simetria bilateral
   5. Possíveis compensações musculares
   6. Riscos de lesão
   
   Forneça:
   - Score geral (0-100)
   - Pontos positivos (3-5)
   - Pontos de melhoria (3-5)
   - Recomendações específicas
   - Risco de lesão (baixo/médio/alto)
   
   Formato: JSON estruturado
   ```

4. Parsear resposta do Gemini
5. Salvar análise em exercise_video_analyses
6. Gerar thumbnail do vídeo
7. Criar notificação para fisioterapeuta
8. Retornar análise completa

Otimizações:
- Processar apenas frames-chave (não todo o vídeo)
- Cache de análises similares
- Timeout de 30s

Variáveis:
- GOOGLE_AI_API_KEY (Gemini)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
```

### Checklist de Validação 3:
- [ ] MediaPipe detectando pose corretamente
- [ ] Skeleton desenhado sobre vídeo
- [ ] Ângulos calculados em tempo real
- [ ] Feedback visual funcionando
- [ ] Gravação de vídeo funcionando
- [ ] Upload para Supabase Storage
- [ ] Edge Function processando vídeos
- [ ] Análise do Gemini retornando insights úteis

---

## 4. Sistema de Gamificação

### Prompt 4.1: Criar Schema de Gamificação

```sql
Crie as migrations do Supabase para o sistema completo de gamificação.

Tabelas necessárias:

1. achievements (conquistas/badges)
   - id, name, description, icon_url
   - category (milestone, streak, challenge)
   - points, rarity (common, rare, epic, legendary)
   - criteria (JSONB, condições para desbloquear)

2. user_achievements (conquistas do usuário)
   - user_id, achievement_id
   - unlocked_at, progress (0-100)

3. journeys (trilhas de tratamento)
   - id, name, description
   - patient_id, therapist_id
   - total_steps, completed_steps
   - start_date, estimated_end_date

4. journey_steps (passos da jornada)
   - journey_id, step_number
   - title, description
   - type (exercise, milestone, evaluation)
   - status (locked, unlocked, in_progress, completed)
   - points_reward
   - completed_at

5. user_points (sistema de pontos)
   - user_id, total_points
   - weekly_points, monthly_points
   - level (calculado), next_level_points

6. leaderboard (ranking opcional e anônimo)
   - user_id (anonimizado)
   - period (week, month, all_time)
   - points, rank

7. rewards (recompensas desbloqueáveis)
   - id, name, description
   - type (content, discount, certificate)
   - points_cost, availability

8. user_rewards (recompensas do usuário)
   - user_id, reward_id
   - claimed_at, redeemed (boolean)

RLS Policies para cada tabela
Índices para performance
Triggers para atualizar pontos automaticamente
```

### Prompt 4.2: Implementar Lógica de Gamificação

```typescript
Crie o sistema completo de gamificação em TypeScript.

Arquivo: lib/gamification.ts

Classes/Funções principais:

1. calculateLevel(totalPoints: number): { level: number, progress: number }
   - Fórmula: level = floor(sqrt(points / 100))
   - progress = % para próximo nível

2. checkAchievements(userId: string): Promise<Achievement[]>
   - Verificar todas as conquistas disponíveis
   - Comparar criteria com dados do usuário
   - Desbloquear novas conquistas
   - Retornar conquistas desbloqueadas

3. awardPoints(userId: string, points: number, reason: string): Promise<void>
   - Adicionar pontos
   - Registrar em histórico
   - Verificar se subiu de nível
   - Criar notificação se level up

4. createJourney(patientId: string, treatmentPlan: any): Promise<Journey>
   - Analisar plano de tratamento
   - Gerar passos da jornada automaticamente
   - Definir marcos (milestones)
   - Calcular pontos de cada passo

5. completeJourneyStep(stepId: string): Promise<CompletionResult>
   - Marcar passo como completo
   - Dar pontos ao usuário
   - Desbloquear próximo passo
   - Verificar conquistas relacionadas
   - Retornar feedback visual

6. getLeaderboard(period: 'week' | 'month' | 'all_time'): Promise<LeaderboardEntry[]>
   - Buscar top 100
   - Anonimizar nomes
   - Incluir posição do usuário atual

7. claimReward(userId: string, rewardId: string): Promise<void>
   - Verificar pontos suficientes
   - Deduzir pontos
   - Marcar recompensa como claimed
   - Gerar código/voucher se aplicável

Tipos TypeScript completos
Error handling robusto
```

### Prompt 4.3: Criar Interface de Jornada

```typescript
Crie componente React para visualização da jornada de tratamento.

Arquivo: components/JourneyVisualization.tsx

Layout:
- Trilha visual (roadmap) com passos conectados
- Cada passo é um card com:
  * Ícone do tipo (exercício, avaliação, marco)
  * Título e descrição
  * Status (locked, in progress, completed)
  * Pontos recompensa
  * Progresso (se in progress)
  * Botão de ação contextual

Estados visuais:
- Locked: cinza, com cadeado
- Unlocked: azul, pulsando
- In Progress: amarelo, com progress bar
- Completed: verde, com check

Animações:
- Transição suave entre estados
- Confetti quando completar passo
- Level up animation quando subir nível

Painel lateral:
- Perfil do paciente
- Nível atual e progresso
- Pontos totais
- Próximas conquistas
- Recompensas disponíveis

Interações:
- Click em passo para ver detalhes
- Arrastar timeline (se muitos passos)
- Botão "Concluir" que chama completeJourneyStep

Use framer-motion para animações
shadcn/ui para componentes base
```

### Checklist de Validação 4:
- [ ] Todas as tabelas criadas
- [ ] Sistema de pontos funcionando
- [ ] Conquistas desbloqueando automaticamente
- [ ] Jornadas sendo criadas corretamente
- [ ] Interface visual atraente
- [ ] Animações suaves
- [ ] Leaderboard atualizando

---

## 5. Integração com Wearables

### Prompt 5.1: Integrar HealthKit (iOS)

```typescript
Crie a integração com Apple HealthKit para coleta de dados de saúde.

Arquivo: lib/healthkit-integration.ts

Usando: react-native-health (se React Native) ou capacitor-health-kit

Dados a coletar:
1. Passos diários (HKQuantityTypeIdentifierStepCount)
2. Frequência cardíaca (HKQuantityTypeIdentifierHeartRate)
3. Variabilidade cardíaca - HRV (HKQuantityTypeIdentifierHeartRateVariabilitySDNN)
4. Calorias queimadas (HKQuantityTypeIdentifierActiveEnergyBurned)
5. Distância caminhada (HKQuantityTypeIdentifierDistanceWalkingRunning)
6. Tempo de exercício (HKQuantityTypeIdentifierAppleExerciseTime)
7. Minutos em pé (HKCategoryTypeIdentifierAppleStandHour)
8. Sono (HKCategoryTypeIdentifierSleepAnalysis)

Funções:
1. requestAuthorization(): Promise<boolean>
   - Solicitar permissões ao usuário
   
2. fetchDailyMetrics(date: Date): Promise<HealthMetrics>
   - Buscar dados de um dia específico
   - Agregar métricas
   
3. fetchWeeklyMetrics(): Promise<HealthMetrics[]>
   - Últimos 7 dias
   
4. syncToSupabase(userId: string, metrics: HealthMetrics): Promise<void>
   - Salvar em tabela health_metrics
   - Detectar anomalias
   - Gerar alertas se necessário
   
5. setupBackgroundSync(): void
   - Configurar sincronização automática
   - A cada 6 horas ou quando app abre

Tipos:
interface HealthMetrics {
  date: Date;
  steps: number;
  heartRate: { min: number; max: number; avg: number };
  hrv: number;
  calories: number;
  distance: number;
  exerciseMinutes: number;
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

Error handling para permissões negadas
```

### Prompt 5.2: Integrar Health Connect (Android)

```typescript
Crie a integração com Google Health Connect para Android.

Arquivo: lib/health-connect-integration.ts

Similar ao HealthKit mas usando Health Connect API

Dados a coletar (equivalentes):
- Steps (TYPE_STEPS)
- Heart Rate (TYPE_HEART_RATE)
- Heart Rate Variability (TYPE_HEART_RATE_VARIABILITY_RMSSD)
- Calories (TYPE_TOTAL_CALORIES_BURNED)
- Distance (TYPE_DISTANCE)
- Exercise Sessions (TYPE_EXERCISE_SESSION)
- Sleep Sessions (TYPE_SLEEP_SESSION)

Mesmas funções que HealthKit
Adaptar tipos conforme Health Connect API
```

### Prompt 5.3: Dashboard de Métricas de Saúde

```typescript
Crie dashboard para visualizar métricas de wearables.

Arquivo: components/HealthMetricsDashboard.tsx

Seções:
1. Overview Cards (hoje):
   - Passos (com meta e %)
   - Calorias
   - Minutos de exercício
   - Qualidade do sono

2. Gráficos Semanais:
   - Line chart: Passos ao longo da semana
   - Bar chart: Calorias por dia
   - Line chart: Frequência cardíaca média
   - Sleep quality chart

3. Tendências:
   - Comparação com semana anterior
   - Setas indicando melhora/piora
   - Insights automáticos:
     * "Você está 15% mais ativo esta semana!"
     * "Sua qualidade de sono melhorou"

4. Correlações (IA):
   - "Dias com mais passos = melhor qualidade de sono"
   - "Exercícios pela manhã = melhor disposição"

5. Recomendações:
   - Baseadas em dados
   - Personalizadas pelo fisioterapeuta

Funcionalidades:
- Refresh manual
- Sincronização automática
- Export de dados
- Compartilhar com fisioterapeuta

Realtime:
- Atualização automática quando novos dados chegam
- Usar Supabase Realtime

Gráficos: Recharts
UI: shadcn/ui
```

### Checklist de Validação 5:
- [ ] Permissões solicitadas corretamente
- [ ] Dados sendo coletados
- [ ] Sincronização com Supabase funcionando
- [ ] Dashboard exibindo dados
- [ ] Gráficos renderizando
- [ ] Tendências calculadas
- [ ] Alertas funcionando

---

## 6. Otimizações Enterprise

### Prompt 6.1: Implementar Edge Middleware

```typescript
Crie Edge Middleware para otimizações e segurança.

Arquivo: middleware.ts

Funcionalidades:
1. Geolocalização e personalização:
   - Detectar país/cidade do usuário
   - Redirecionar para domínio regional (se aplicável)
   - Definir moeda local
   - Ajustar timezone

2. Rate Limiting:
   - Limitar requests por IP
   - Limitar por usuário autenticado
   - Diferentes limites por rota:
     * /api/* : 100 req/min
     * /api/ai/* : 10 req/min (custoso)
     * Public routes: 300 req/min
   - Usar Upstash Redis para contador

3. Autenticação e autorização:
   - Verificar token JWT do Supabase
   - Extrair role do usuário
   - Proteger rotas sensíveis:
     * /dashboard/* : authenticated
     * /admin/* : admin only
   - Redirecionar se não autorizado

4. A/B Testing:
   - Ler feature flags de Edge Config
   - Atribuir variant aleatoriamente
   - Persistir em cookie
   - Passar para página via header

5. Bot Protection:
   - Detectar user agents suspeitos
   - Challenge com captcha se necessário
   - Bloquear IPs maliciosos

6. Performance:
   - Adicionar cache headers
   - Comprimir responses
   - Preload critical resources

7. Logging:
   - Log de todas requests
   - Métricas de latência
   - Enviar para Datadog/Axiom

Exemplo de configuração:
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};

Usar @vercel/edge para utilities
Error handling robusto
```

### Prompt 6.2: Configurar Edge Config

```typescript
Configure Edge Config para feature flags e configuração dinâmica.

Arquivo: lib/edge-config.ts

Usando: @vercel/edge-config

Configurações a gerenciar:
1. Feature Flags:
   - ai_analysis_enabled: boolean
   - gamification_enabled: boolean
   - wearables_sync_enabled: boolean
   - new_ui_variant: boolean
   - maintenance_mode: boolean

2. Rate Limits dinâmicos:
   - api_rate_limit: number
   - ai_rate_limit: number

3. A/B Tests:
   - experiment_dashboard_v2: { enabled: boolean, variants: string[] }

4. Configurações de negócio:
   - max_patients_per_therapist: number
   - max_file_upload_size_mb: number

Funções:
1. getConfig<T>(key: string, defaultValue: T): Promise<T>
2. isFeatureEnabled(feature: string): Promise<boolean>
3. getABTestVariant(experiment: string, userId: string): Promise<string>

Uso no middleware e componentes:
- Verificar flags antes de executar features
- Habilitar/desabilitar sem deploy
- Rollback instantâneo se bug

Setup no Vercel Dashboard:
1. Criar Edge Config store
2. Adicionar items
3. Configurar EDGE_CONFIG env var
```

### Prompt 6.3: Otimizar Imagens

```typescript
Implemente otimização avançada de imagens.

Arquivo: components/OptimizedImage.tsx

Wrapper do Next.js Image com otimizações extras:

Features:
1. Lazy loading com placeholder blur
2. Responsive images (srcset automático)
3. Formato moderno (WebP/AVIF) com fallback
4. Prioridade para above-the-fold images
5. Error boundary com fallback image
6. Loading skeleton

Props:
- src: string
- alt: string
- width/height ou fill
- priority?: boolean
- quality?: number (default 80)
- placeholder?: 'blur' | 'empty'
- blurDataURL?: string
- sizes?: string (para responsive)

Integração com Vercel Image Optimization:
- Usar domínio otimizado
- Cache headers adequados
- Compression automática

Exemplo de uso:
<OptimizedImage
  src="/exercises/squat.jpg"
  alt="Agachamento correto"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false}
/>

Para imagens do Supabase Storage:
<OptimizedImage
  src={getOptimizedSupabaseImage(path, { width: 800 })}
  alt="Foto do paciente"
  width={800}
  height={600}
/>
```

### Checklist de Validação 6:
- [ ] Middleware funcionando
- [ ] Rate limiting efetivo
- [ ] Edge Config respondendo < 10ms
- [ ] Feature flags funcionando
- [ ] Imagens carregando otimizadas
- [ ] WebP sendo servido para navegadores compatíveis
- [ ] Cache headers corretos

---

## 7. Edge Functions

### Template Geral de Edge Function

```typescript
Crie uma Supabase Edge Function genérica seguindo este template:

Arquivo: supabase/functions/[function-name]/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Interfaces
interface RequestBody {
  // Definir estrutura do request
}

interface ResponseBody {
  // Definir estrutura da response
}

// Cliente Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Parsear request
    const body: RequestBody = await req.json();
    
    // Validação
    if (!body.requiredField) {
      throw new Error('Missing required field');
    }

    // Lógica principal
    // ... seu código aqui ...

    // Response
    const response: ResponseBody = {
      success: true,
      data: result,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
```

### Arquivo Compartilhado de CORS

```typescript
Crie arquivo compartilhado para CORS headers.

Arquivo: supabase/functions/_shared/cors.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 8. Realtime Features

### Prompt 8.1: Chat em Tempo Real

```typescript
Implemente chat em tempo real entre fisioterapeuta e paciente.

Arquivo: components/RealtimeChat.tsx

Funcionalidades:
1. Listar conversas do usuário
2. Abrir conversa específica
3. Exibir mensagens em ordem cronológica
4. Input para enviar mensagem
5. Indicador "digitando..." quando outro usuário está digitando
6. Indicador "online/offline" do outro usuário
7. Notificações de novas mensagens
8. Marcar mensagens como lidas
9. Scroll automático para última mensagem

Realtime:
- Usar Supabase Realtime
- Subscribe a nova mensagens
- Subscribe a presence (online/offline)
- Subscribe a typing indicators

Tabelas:
- conversations (id, participant_1_id, participant_2_id)
- messages (id, conversation_id, sender_id, content, read_at)

Hooks:
useRealtimeChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  // Subscribe logic
  // ...
  
  return { messages, sendMessage, isTyping, isOnline };
}

UI: shadcn/ui components
Scroll container: react-scroll-to-bottom
```

---

## 🎯 Variáveis de Ambiente Necessárias

Criar arquivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Google AI (Gemini)
GOOGLE_AI_API_KEY=AI...

# Vercel (automáticas)
VERCEL_URL
VERCEL_ENV
VERCEL_GIT_COMMIT_SHA

# Edge Config
EDGE_CONFIG=https://edge-config.vercel.com/...

# Upstash Redis (opcional, para rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Datadog (opcional)
NEXT_PUBLIC_DATADOG_APP_ID=...
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend (Email)
RESEND_API_KEY=re_...

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## ✅ Checklist Geral de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] pgvector habilitado no Supabase
- [ ] Todas variáveis de ambiente configuradas
- [ ] Edge Middleware implementado
- [ ] Edge Config configurado
- [ ] Logging e monitoring configurados

### Fase 2: IA (Semana 3-4)
- [ ] Base de conhecimento com RAG funcionando
- [ ] Chat interface completo
- [ ] Análise preditiva implementada
- [ ] Dashboard de insights criado

### Fase 3: Computer Vision (Semana 5-6)
- [ ] MediaPipe integrado
- [ ] Análise de pose em tempo real
- [ ] Edge Function de análise de vídeo
- [ ] Interface de gravação e feedback

### Fase 4: Gamificação (Semana 7-8)
- [ ] Schema completo de gamificação
- [ ] Lógica de pontos e níveis
- [ ] Sistema de conquistas
- [ ] Interface de jornada
- [ ] Leaderboard

### Fase 5: Wearables (Semana 9-10)
- [ ] HealthKit integrado (iOS)
- [ ] Health Connect integrado (Android)
- [ ] Sincronização automática
- [ ] Dashboard de métricas

### Fase 6: Otimizações (Semana 11-12)
- [ ] Todas imagens otimizadas
- [ ] Cache strategies implementadas
- [ ] Rate limiting ativo
- [ ] Performance > 95 no Lighthouse

---

## 📝 Notas Finais

- **Sempre teste** cada funcionalidade isoladamente antes de integrar
- **Monitore custos** de APIs (OpenAI, Gemini) com alertas
- **Documente** decisões técnicas importantes
- **Faça backups** regulares do banco de dados
- **Use feature flags** para rollout gradual de funcionalidades
- **Colete feedback** dos usuários continuamente

---

**Elaborado em:** Janeiro 2025  
**Atualizado por:** Equipe de Engenharia FisioFlow

