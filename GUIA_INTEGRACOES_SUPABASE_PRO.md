# Guia Completo de Integrações Supabase Pro para FisioFlow

## 📋 Índice

1. [Visão Geral Supabase Pro](#visão-geral-supabase-pro)
2. [pgvector: IA e Embeddings](#pgvector-ia-e-embeddings)
3. [Realtime: WebSockets](#realtime-websockets)
4. [Storage: Arquivos e Mídia](#storage-arquivos-e-mídia)
5. [Edge Functions](#edge-functions)
6. [Auth: Autenticação Avançada](#auth-autenticação-avançada)
7. [Database: PostgreSQL Otimizado](#database-postgresql-otimizado)
8. [Integrações de Parceiros](#integrações-de-parceiros)
9. [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)
10. [Security e Compliance](#security-e-compliance)

---

## 🎯 Visão Geral Supabase Pro

### Recursos Incluídos no Plano Pro

**Database:**
- 8GB RAM dedicada
- 8GB de armazenamento
- Até 500 conexões simultâneas
- Backups automáticos diários
- Point-in-Time Recovery (7 dias)

**Storage:**
- 100GB de armazenamento
- CDN global
- Transformação de imagens
- Upload resumable

**Edge Functions:**
- 500 invocações simultâneas
- 2 milhões de invocações/mês
- Custom domains

**Auth:**
- 50,000 MAUs (Monthly Active Users)
- SSO/SAML
- MFA

**Realtime:**
- 500 conexões simultâneas
- 5 milhões de mensagens/mês

**Support:**
- Email support prioritário
- SLA de 99.9%

---

## 🤖 pgvector: IA e Embeddings

### O que é pgvector?

pgvector é uma extensão PostgreSQL que permite armazenar e consultar **vetores de embeddings**, transformando o Supabase em um **banco de dados vetorial** para aplicações de IA.

### Instalação e Configuração

```sql
-- 1. Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Verificar versão
SELECT * FROM pg_available_extensions WHERE name = 'vector';
```

### Casos de Uso no FisioFlow

#### 1. Base de Conhecimento Inteligente (RAG)

```sql
-- Criar tabela para armazenar documentos e embeddings
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 embeddings
  metadata JSONB DEFAULT '{}',
  source_type TEXT, -- 'article', 'protocol', 'book', 'note'
  source_title TEXT,
  source_url TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice HNSW para busca ultra-rápida
-- HNSW é o algoritmo mais eficiente para ANN (Approximate Nearest Neighbor)
CREATE INDEX ON knowledge_base 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Criar índice para metadados
CREATE INDEX ON knowledge_base USING gin (metadata);

-- Criar índice para busca por tipo
CREATE INDEX ON knowledge_base (source_type);

-- Função de busca semântica
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_type TEXT DEFAULT NULL
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
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 
    (filter_type IS NULL OR knowledge_base.source_type = filter_type)
    AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Uso no Frontend:**

```typescript
// lib/knowledge-base.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Adicionar documento à base de conhecimento
export async function addDocument(content: string, metadata: any) {
  // 1. Gerar embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content,
  });
  
  const embedding = embeddingResponse.data[0].embedding;
  
  // 2. Salvar no Supabase
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert({
      content,
      embedding,
      metadata,
      source_type: metadata.type,
      source_title: metadata.title,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Buscar documentos similares
export async function searchDocuments(query: string, options: {
  threshold?: number;
  count?: number;
  filterType?: string;
} = {}) {
  // 1. Gerar embedding da query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Buscar no Supabase
  const { data, error } = await supabase.rpc('search_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: options.threshold || 0.7,
    match_count: options.count || 10,
    filter_type: options.filterType || null,
  });
  
  if (error) throw error;
  return data;
}

// Chatbot com RAG
export async function chatWithKnowledge(userMessage: string, conversationHistory: any[]) {
  // 1. Buscar contexto relevante
  const relevantDocs = await searchDocuments(userMessage, {
    threshold: 0.75,
    count: 5,
  });
  
  // 2. Construir contexto
  const context = relevantDocs
    .map(doc => doc.content)
    .join('\n\n');
  
  // 3. Gerar resposta com GPT-4
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente especializado em fisioterapia. Use o seguinte contexto para responder as perguntas:

${context}

Se a informação não estiver no contexto, diga que não tem certeza.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });
  
  return {
    response: completion.choices[0].message.content,
    sources: relevantDocs.map(doc => ({
      title: doc.metadata.title,
      similarity: doc.similarity,
    })),
  };
}
```

#### 2. Recomendação de Exercícios Similares

```sql
-- Criar tabela de exercícios com embeddings
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado')),
  body_parts TEXT[], -- ['ombro', 'cotovelo', 'punho']
  goals TEXT[], -- ['fortalecimento', 'alongamento', 'mobilidade']
  contraindications TEXT[],
  equipment TEXT[],
  duration_minutes INT,
  embedding VECTOR(1536), -- Embedding da descrição
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON exercises USING hnsw (embedding vector_cosine_ops);

-- Função para recomendar exercícios similares
CREATE OR REPLACE FUNCTION recommend_similar_exercises(
  exercise_id UUID,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_embedding VECTOR(1536);
BEGIN
  -- Obter embedding do exercício alvo
  SELECT embedding INTO target_embedding
  FROM exercises
  WHERE exercises.id = exercise_id;
  
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    1 - (e.embedding <=> target_embedding) AS similarity
  FROM exercises e
  WHERE e.id != exercise_id
  ORDER BY e.embedding <=> target_embedding
  LIMIT limit_count;
END;
$$;
```

#### 3. Análise de Similaridade entre Casos Clínicos

```sql
-- Tabela de casos clínicos
CREATE TABLE clinical_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  diagnosis TEXT,
  symptoms TEXT,
  treatment_plan TEXT,
  outcome TEXT,
  case_summary TEXT, -- Resumo do caso completo
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON clinical_cases USING hnsw (embedding vector_cosine_ops);

-- Encontrar casos similares (para aprendizado e referência)
CREATE OR REPLACE FUNCTION find_similar_cases(
  current_case_summary TEXT,
  current_case_embedding VECTOR(1536),
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  diagnosis TEXT,
  treatment_plan TEXT,
  outcome TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.diagnosis,
    cc.treatment_plan,
    cc.outcome,
    1 - (cc.embedding <=> current_case_embedding) AS similarity
  FROM clinical_cases cc
  ORDER BY cc.embedding <=> current_case_embedding
  LIMIT limit_count;
END;
$$;
```

### Otimizações de Performance para pgvector

```sql
-- Ajustar parâmetros do PostgreSQL para pgvector
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET work_mem = '128MB';

-- Vacuum regular para manter performance
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'vacuum-knowledge-base',
  '0 2 * * *', -- Diariamente às 2 AM
  $$ VACUUM ANALYZE knowledge_base $$
);

-- Monitorar tamanho dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('knowledge_base', 'exercises', 'clinical_cases')
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Comparação de Modelos de Embedding

| Modelo | Dimensões | Custo | Qualidade | Recomendação |
|--------|-----------|-------|-----------|--------------|
| OpenAI ada-002 | 1536 | $0.0001/1K tokens | Excelente | ✅ Recomendado |
| OpenAI text-embedding-3-small | 512-1536 | $0.00002/1K tokens | Muito boa | ✅ Melhor custo-benefício |
| OpenAI text-embedding-3-large | 256-3072 | $0.00013/1K tokens | Excepcional | Para casos críticos |
| Cohere embed-v3 | 1024 | $0.0001/1K tokens | Excelente | Alternativa |

**Recomendação para FisioFlow:** `text-embedding-3-small` (dimensão 1536) oferece o melhor custo-benefício.

---

## 🔄 Realtime: WebSockets

### Configuração Básica

```typescript
// lib/realtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Casos de Uso no FisioFlow

#### 1. Chat em Tempo Real (Fisioterapeuta ↔ Paciente)

```typescript
// components/Chat.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Chat({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Carregar mensagens existentes
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
    };
    
    loadMessages();
    
    // Subscrever a novas mensagens
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);
  
  const sendMessage = async (content: string) => {
    await supabase.from('messages').insert({
      room_id: roomId,
      user_id: userId,
      content,
    });
  };
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <input onKeyPress={(e) => {
        if (e.key === 'Enter') {
          sendMessage(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }} />
    </div>
  );
}
```

#### 2. Indicador de "Quem está online"

```typescript
// components/OnlineUsers.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function OnlineUsers({ roomId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: 'user_id' } },
    });
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Usuário entrou:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Usuário saiu:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });
    
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId]);
  
  return (
    <div>
      <h3>Online: {onlineUsers.length}</h3>
      {onlineUsers.map(user => (
        <div key={user.user_id}>
          {user.user_id} - {user.online_at}
        </div>
      ))}
    </div>
  );
}
```

#### 3. Atualização de Agenda em Tempo Real

```typescript
// hooks/useRealtimeAppointments.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeAppointments(therapistId: string) {
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    // Carregar compromissos iniciais
    const loadAppointments = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });
      
      setAppointments(data || []);
    };
    
    loadAppointments();
    
    // Subscrever a mudanças
    const channel = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `therapist_id=eq.${therapistId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [...prev, payload.new].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            ));
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => prev.map(appt =>
              appt.id === payload.new.id ? payload.new : appt
            ));
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(
              appt => appt.id !== payload.old.id
            ));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [therapistId]);
  
  return appointments;
}
```

#### 4. Broadcast: Compartilhamento de Tela/Exercício

```typescript
// Fisioterapeuta compartilha exercício com paciente em tempo real
export function ExerciseBroadcast({ sessionId }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  
  useEffect(() => {
    const channel = supabase.channel(`session:${sessionId}`);
    
    channel
      .on('broadcast', { event: 'exercise-change' }, ({ payload }) => {
        setCurrentExercise(payload);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);
  
  // Fisioterapeuta envia exercício
  const broadcastExercise = async (exercise) => {
    const channel = supabase.channel(`session:${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'exercise-change',
      payload: exercise,
    });
  };
  
  return (
    <div>
      {currentExercise && (
        <ExercisePlayer exercise={currentExercise} />
      )}
    </div>
  );
}
```

### Limites e Otimizações

**Supabase Pro Limits:**
- 500 conexões simultâneas
- 5 milhões de mensagens/mês

**Otimizações:**
```typescript
// Usar throttling para eventos frequentes
import { throttle } from 'lodash';

const sendPosition = throttle((position) => {
  channel.send({
    type: 'broadcast',
    event: 'cursor-move',
    payload: position,
  });
}, 100); // Máximo 10 atualizações/segundo

// Cleanup adequado
useEffect(() => {
  const channel = supabase.channel('my-channel');
  // ...
  
  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 📦 Storage: Arquivos e Mídia

### Estrutura de Buckets Recomendada

```typescript
// Criar buckets (fazer via Dashboard ou migration)
/*
1. patient-documents (privado)
   - Documentos médicos, exames, laudos
   
2. exercise-videos (público)
   - Vídeos de exercícios para todos
   
3. patient-videos (privado)
   - Vídeos de pacientes executando exercícios
   
4. profile-pictures (público)
   - Fotos de perfil de usuários
   
5. clinic-assets (público)
   - Logos, imagens institucionais
*/
```

### Upload de Arquivos

```typescript
// lib/storage.ts
import { supabase } from './supabase';

export async function uploadPatientDocument(
  patientId: string,
  file: File,
  documentType: string
) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${patientId}/${documentType}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('patient-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  // Salvar referência no banco
  const { data: docRecord } = await supabase
    .from('patient_documents')
    .insert({
      patient_id: patientId,
      document_type: documentType,
      file_path: data.path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();
  
  return docRecord;
}

// Upload com progress bar
export async function uploadWithProgress(
  bucket: string,
  path: string,
  file: File,
  onProgress: (progress: number) => void
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      onUploadProgress: (progress) => {
        const percentage = (progress.loaded / progress.total) * 100;
        onProgress(percentage);
      },
    });
  
  if (error) throw error;
  return data;
}
```

### Resumable Uploads (Arquivos Grandes)

```typescript
// Para vídeos grandes (> 5MB)
export async function resumableUpload(
  bucket: string,
  path: string,
  file: File,
  onProgress: (progress: number) => void
) {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  let uploadedBytes = 0;
  
  // Iniciar upload resumable
  const { data: { session_id }, error: startError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  
  if (startError) throw startError;
  
  // Upload em chunks
  for (let start = 0; start < file.size; start += chunkSize) {
    const chunk = file.slice(start, start + chunkSize);
    
    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, session_id, chunk, {
        offset: start,
      });
    
    if (error) throw error;
    
    uploadedBytes += chunk.size;
    onProgress((uploadedBytes / file.size) * 100);
  }
}
```

### Transformação de Imagens

```typescript
// Obter imagem redimensionada
export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'webp';
  } = {}
) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      transform: {
        width: options.width || 800,
        height: options.height || 600,
        resize: 'cover',
        quality: options.quality || 80,
        format: options.format || 'webp',
      },
    });
  
  return data.publicUrl;
}

// Exemplo: foto de perfil
const avatarUrl = getOptimizedImageUrl('profile-pictures', userPath, {
  width: 200,
  height: 200,
  quality: 90,
});

// Exemplo: thumbnail de vídeo
const thumbnailUrl = getOptimizedImageUrl('exercise-videos', videoThumbnailPath, {
  width: 400,
  height: 225,
  quality: 70,
});
```

### Políticas de Segurança (RLS no Storage)

```sql
-- Pacientes podem ver apenas seus próprios documentos
CREATE POLICY "Pacientes veem seus documentos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Pacientes podem fazer upload apenas nos seus folders
CREATE POLICY "Pacientes fazem upload em seus folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fisioterapeutas veem documentos de seus pacientes
CREATE POLICY "Fisioterapeutas veem docs de pacientes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-documents' AND
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id::text = (storage.foldername(name))[1]
    AND patients.therapist_id = auth.uid()
  )
);

-- Vídeos de exercícios são públicos
CREATE POLICY "Vídeos de exercícios públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-videos');
```

### CDN e Performance

```typescript
// Configurar cache headers
const { data } = await supabase.storage
  .from('exercise-videos')
  .upload(path, file, {
    cacheControl: '31536000', // 1 ano (conteúdo imutável)
  });

// Para conteúdo que muda
const { data: profilePic } = await supabase.storage
  .from('profile-pictures')
  .upload(path, file, {
    cacheControl: '3600', // 1 hora
    upsert: true, // Substituir se existir
  });
```

---

## ⚡ Edge Functions

### Estrutura de Edge Functions

```bash
supabase/
  functions/
    analyze-exercise/
      index.ts
    generate-report/
      index.ts
    send-notification/
      index.ts
    process-payment/
      index.ts
```

### Exemplo 1: Análise de Exercício com IA

```typescript
// supabase/functions/analyze-exercise/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY')!);

serve(async (req) => {
  try {
    const { videoUrl, patientId, exerciseId } = await req.json();
    
    // 1. Baixar vídeo do Storage
    const { data: videoData } = await supabase.storage
      .from('patient-videos')
      .download(videoUrl);
    
    // 2. Analisar com Gemini Pro Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'video/mp4',
          data: await videoData.arrayBuffer(),
        },
      },
      `Analise este vídeo de um paciente executando um exercício de fisioterapia.
       Avalie:
       1. Postura e alinhamento corporal
       2. Amplitude de movimento
       3. Velocidade e controle
       4. Possíveis compensações
       5. Risco de lesão
       
       Forneça feedback construtivo e sugestões de melhoria.`
    ]);
    
    const analysis = result.response.text();
    
    // 3. Salvar resultado
    const { data: analysisRecord } = await supabase
      .from('exercise_analyses')
      .insert({
        patient_id: patientId,
        exercise_id: exerciseId,
        video_url: videoUrl,
        ai_analysis: analysis,
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    // 4. Notificar fisioterapeuta
    await supabase.from('notifications').insert({
      user_id: await getTherapistId(patientId),
      type: 'exercise_analyzed',
      title: 'Exercício analisado',
      message: `Análise de exercício do paciente disponível`,
      data: { analysis_id: analysisRecord.id },
    });
    
    return new Response(JSON.stringify({
      success: true,
      analysis,
      analysisId: analysisRecord.id,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Exemplo 2: Geração de Relatório em PDF

```typescript
// supabase/functions/generate-report/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsPDF } from 'https://esm.sh/jspdf';

serve(async (req) => {
  const { patientId, dateFrom, dateTo } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Buscar dados do paciente
  const { data: patient } = await supabase
    .from('patients')
    .select('*, sessions(*), exercises(*)')
    .eq('id', patientId)
    .gte('sessions.date', dateFrom)
    .lte('sessions.date', dateTo)
    .single();
  
  // Gerar PDF
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório de Evolução', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Paciente: ${patient.name}`, 20, 40);
  doc.text(`Período: ${dateFrom} a ${dateTo}`, 20, 50);
  
  // Adicionar gráficos e análises
  // ...
  
  const pdfBytes = doc.output('arraybuffer');
  
  // Salvar no Storage
  const fileName = `reports/${patientId}_${Date.now()}.pdf`;
  await supabase.storage
    .from('patient-documents')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
    });
  
  return new Response(JSON.stringify({
    success: true,
    fileUrl: fileName,
  }));
});
```

### Exemplo 3: Webhook Processor

```typescript
// supabase/functions/webhook-processor/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const signature = req.headers.get('webhook-signature');
  
  // Verificar assinatura
  if (!verifySignature(signature, await req.text())) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const payload = await req.json();
  
  // Processar diferentes tipos de eventos
  switch (payload.type) {
    case 'appointment.created':
      await handleAppointmentCreated(payload.data);
      break;
    case 'payment.succeeded':
      await handlePaymentSucceeded(payload.data);
      break;
    case 'exercise.completed':
      await handleExerciseCompleted(payload.data);
      break;
  }
  
  return new Response('OK');
});
```

### Deploy de Edge Functions

```bash
# Deploy single function
supabase functions deploy analyze-exercise

# Deploy all functions
supabase functions deploy

# Ver logs
supabase functions logs analyze-exercise

# Invocar localmente para teste
supabase functions serve analyze-exercise
```

---

## 🔐 Auth: Autenticação Avançada

### Configurar Provedores Sociais

```typescript
// Sign in com Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});

// Sign in com Apple
await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### Multi-Factor Authentication (MFA)

```typescript
// Habilitar MFA para um usuário
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'FisioFlow App',
});

// QR Code para o usuário escanear
const qrCode = data.totp.qr_code;
const secret = data.totp.secret;

// Verificar código
const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: challenge.id,
  code: userInputCode,
});
```

### Server-Side Auth

```typescript
// middleware.ts (Next.js)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Proteger rotas
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Verificar role
  const userRole = session?.user?.user_metadata?.role;
  if (req.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## 🗄️ Database: PostgreSQL Otimizado

### Índices Recomendados

```sql
-- Índices para queries frequentes
CREATE INDEX idx_patients_therapist ON patients(therapist_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_therapist_date ON appointments(therapist_id, date);
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_date ON sessions(date);

-- Índices compostos para filtros complexos
CREATE INDEX idx_appointments_therapist_status_date 
ON appointments(therapist_id, status, date);

-- Índice parcial (apenas appointments futuros)
CREATE INDEX idx_future_appointments 
ON appointments(therapist_id, date)
WHERE date >= CURRENT_DATE;

-- Índice GIN para busca em JSON
CREATE INDEX idx_metadata_gin ON patients USING gin(metadata);

-- Índice para busca full-text
ALTER TABLE patients ADD COLUMN search_vector tsvector;

CREATE INDEX idx_patients_search ON patients USING gin(search_vector);

-- Trigger para atualizar search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.email, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.phone, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_search_update
BEFORE INSERT OR UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### Views Materializadas

```sql
-- View materializada para dashboard de estatísticas
CREATE MATERIALIZED VIEW therapist_stats AS
SELECT
  t.id AS therapist_id,
  t.name AS therapist_name,
  COUNT(DISTINCT p.id) AS total_patients,
  COUNT(DISTINCT CASE WHEN a.date >= CURRENT_DATE THEN a.id END) AS upcoming_appointments,
  COUNT(DISTINCT CASE WHEN a.date < CURRENT_DATE THEN a.id END) AS completed_appointments,
  AVG(CASE WHEN s.rating IS NOT NULL THEN s.rating END) AS avg_rating,
  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_revenue
FROM therapists t
LEFT JOIN patients p ON p.therapist_id = t.id
LEFT JOIN appointments a ON a.therapist_id = t.id
LEFT JOIN sessions s ON s.therapist_id = t.id
LEFT JOIN invoices i ON i.therapist_id = t.id
GROUP BY t.id, t.name;

-- Criar índice na view
CREATE UNIQUE INDEX ON therapist_stats(therapist_id);

-- Refresh automático (usar pg_cron)
SELECT cron.schedule(
  'refresh-therapist-stats',
  '0 * * * *', -- A cada hora
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY therapist_stats $$
);
```

### Particionamento de Tabelas

```sql
-- Particionar tabela de sessions por data
CREATE TABLE sessions_partitioned (
  id UUID DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (date);

-- Criar partições por mês
CREATE TABLE sessions_2024_01 PARTITION OF sessions_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE sessions_2024_02 PARTITION OF sessions_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Automatizar criação de partições futuras
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP -- Próximos 12 meses
    start_date := date_trunc('month', CURRENT_DATE) + (i || ' month')::interval;
    end_date := start_date + '1 month'::interval;
    partition_name := 'sessions_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF sessions_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar mensalmente
SELECT cron.schedule(
  'create-partitions',
  '0 0 1 * *', -- Primeiro dia de cada mês
  $$ SELECT create_monthly_partitions() $$
);
```

---

## 🔗 Integrações de Parceiros Supabase

### 1. Vercel (JÁ INTEGRADA)

Sincronização automática de variáveis de ambiente.

### 2. Resend (Email)

```bash
# Instalar
npm install resend

# Configurar
RESEND_API_KEY=re_...
```

```typescript
// lib/email.ts
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(url, key);

// Trigger: enviar email quando appointment é criado
export async function sendAppointmentConfirmation(appointmentId: string) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, patient:patients(*), therapist:therapists(*)')
    .eq('id', appointmentId)
    .single();
  
  await resend.emails.send({
    from: 'FisioFlow <noreply@moocafisio.com.br>',
    to: appointment.patient.email,
    subject: 'Consulta confirmada',
    html: `
      <h1>Consulta confirmada!</h1>
      <p>Sua consulta com ${appointment.therapist.name} está agendada para ${appointment.date}.</p>
    `,
  });
}
```

### 3. Stripe (JÁ INTEGRADA)

Webhooks automáticos para eventos de pagamento.

### 4. Zapier

Criar automações no-code:
- Novo paciente → Enviar SMS de boas-vindas
- Pagamento recebido → Atualizar planilha Google Sheets
- Sessão concluída → Enviar pesquisa de satisfação

---

## 🛠️ Ferramentas de Desenvolvimento

### Supabase CLI

```bash
# Iniciar projeto local
supabase init
supabase start

# Criar migration
supabase migration new add_pgvector

# Aplicar migrations
supabase db push

# Reset database
supabase db reset

# Gerar types TypeScript
supabase gen types typescript --local > types/supabase.ts
```

### Database Branching

```bash
# Criar branch
supabase branches create feature-gamification

# Listar branches
supabase branches list

# Fazer merge
supabase branches merge feature-gamification
```

---

## 🔒 Security e Compliance

### Auditoria de RLS

```sql
-- Ver todas as policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Testar RLS
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-id-aqui';

SELECT * FROM patients; -- Ver o que esse usuário pode ver
```

### Compliance LGPD

```sql
-- Função para anonimizar dados de paciente
CREATE OR REPLACE FUNCTION anonymize_patient(patient_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE patients
  SET
    name = 'Paciente Anônimo',
    email = 'anonimizado@moocafisio.com.br',
    phone = NULL,
    cpf = NULL,
    address = NULL,
    metadata = jsonb_build_object('anonymized_at', NOW())
  WHERE id = patient_id;
END;
$$ LANGUAGE plpgsql;

-- Deletar dados após período de retenção
CREATE OR REPLACE FUNCTION delete_old_data()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE date < CURRENT_DATE - INTERVAL '5 years';
  
  DELETE FROM messages
  WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza
SELECT cron.schedule(
  'data-retention',
  '0 0 1 1 *', -- Anualmente, 1º de janeiro
  $$ SELECT delete_old_data() $$
);
```

---

## 📊 Monitoramento e Métricas

### Queries Lentas

```sql
-- Ver queries lentas (ativar pg_stat_statements)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Tamanho de Tabelas

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Checklist de Implementação

### Imediato
- [x] Supabase Pro ativado
- [ ] pgvector habilitado
- [ ] RLS policies auditadas
- [ ] Backups configurados

### 30 dias
- [ ] Base de conhecimento com RAG implementada
- [ ] Realtime em funcionalidades críticas
- [ ] Edge Functions em produção
- [ ] Monitoramento configurado

### 60-90 dias
- [ ] Storage otimizado com transformações
- [ ] Database branching em uso
- [ ] Compliance LGPD 100%
- [ ] Integrações de parceiros ativas

---

**Elaborado em:** Janeiro 2025  
**Próxima Revisão:** Abril 2025

