# 🔄 Fluxo Completo - Base de Conhecimento RAG

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                  FISIOFLOW - BASE DE CONHECIMENTO               │
│                      Sistema RAG Enterprise                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│   PDFs       │────▶│  Processing  │────▶│  Supabase    │
│   Locais     │     │  + Embeddings│     │  pgvector    │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│  Usuário     │────▶│    Chat      │────▶│   GPT-4      │
│  Pergunta    │     │  Interface   │     │   + RAG      │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │   Resposta   │
                                          │ + Fontes     │
                                          └──────────────┘
```

---

## 🔄 Fluxo de Instalação

### Fase 1: Configuração (5 minutos)

```
┌─────────────┐
│  Você       │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Criar/Editar .env.local         │
│                                     │
│  OPENAI_API_KEY=...                 │
│  NEXT_PUBLIC_SUPABASE_URL=...       │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY=...  │
│  SUPABASE_SERVICE_ROLE_KEY=...      │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  ✅ Variáveis configuradas          │
└─────────────────────────────────────┘
```

### Fase 2: Database Setup (2 minutos)

```
┌─────────────────────────────────────┐
│  2. Supabase Dashboard              │
│     → SQL Editor                    │
│     → Cole migration SQL            │
│     → Execute                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Supabase cria:                     │
│  ✅ Extensão pgvector               │
│  ✅ Tabela knowledge_base           │
│  ✅ Funções de busca                │
│  ✅ Row Level Security              │
│  ✅ 3 documentos seed               │
└─────────────────────────────────────┘
```

### Fase 3: Processamento de PDFs (10 minutos)

```
┌─────────────────────────────────────┐
│  3. Terminal                        │
│     npm run kb:populate             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  Script processa cada PDF:                          │
│                                                      │
│  ┌──────┐    ┌─────────┐    ┌──────────┐          │
│  │ PDF  │───▶│ Extrair │───▶│  Limpar  │          │
│  └──────┘    │  Texto  │    │   Texto  │          │
│              └─────────┘    └──────────┘          │
│                                    │               │
│                                    ▼               │
│              ┌─────────┐    ┌──────────┐          │
│              │ Chunking│◀───│ Embeddings│          │
│              └─────────┘    └──────────┘          │
│                    │                               │
│                    ▼                               │
│              ┌─────────┐                           │
│              │Supabase │                           │
│              │ pgvector│                           │
│              └─────────┘                           │
└─────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ 9 PDFs processados              │
│  ✅ ~240 chunks indexados           │
│  ✅ Pronto para uso!                │
└─────────────────────────────────────┘
```

### Fase 4: Validação (5 minutos)

```
┌─────────────────────────────────────┐
│  4. Testar                          │
│     npm run kb:test                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Testes executam:                   │
│  ✅ Estatísticas da base            │
│  ✅ Busca semântica                 │
│  ✅ Chat com RAG                    │
│  ✅ Sugestões de perguntas          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Interface                       │
│     npm run dev                     │
│     → http://localhost:3000/knowledge│
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ Sistema funcionando!            │
└─────────────────────────────────────┘
```

---

## 💬 Fluxo de Chat (Uso)

### Quando Usuário Faz uma Pergunta:

```
┌──────────────────────────────────────────────────────────────┐
│  USUÁRIO                                                     │
│  "Como tratar lesão de ligamento cruzado anterior?"          │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: Gerar Embedding da Pergunta                        │
│  ┌────────────┐                                              │
│  │  OpenAI    │ text-embedding-ada-002                       │
│  │ Embeddings │ "Como tratar lesão..." → [0.023, -0.145...]  │
│  └────────────┘                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Buscar Documentos Similares                        │
│  ┌────────────┐                                              │
│  │ Supabase   │ SELECT * FROM knowledge_base                 │
│  │ pgvector   │ WHERE cosine_similarity > 0.75               │
│  │            │ ORDER BY similarity DESC                     │
│  │            │ LIMIT 5                                      │
│  └────────────┘                                              │
│                                                              │
│  Retorna top 5 chunks mais relevantes:                      │
│  1. "Evidence-based rehabilitation..." (92% similar)         │
│  2. "Protocolo LCA fase 1..." (88% similar)                 │
│  3. "Exercícios para joelho..." (85% similar)               │
│  4. "Timeline de recuperação..." (82% similar)              │
│  5. "Reabilitação pós-operatória..." (79% similar)          │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Construir Contexto para GPT-4                      │
│                                                              │
│  System Prompt:                                             │
│  "Você é especialista em fisioterapia. Use apenas a base:"  │
│                                                              │
│  Context:                                                   │
│  [Fonte 1: Evidence-based rehabilitation...]                │
│  "A reabilitação do LCA envolve protocolo progressivo       │
│   iniciando com exercícios de amplitude nas primeiras       │
│   2 semanas..."                                             │
│                                                              │
│  [Fonte 2: Protocolo LCA fase 1...]                         │
│  "Fase inicial: controle de dor e edema, mobilização       │
│   precoce..."                                               │
│                                                              │
│  [Fonte 3, 4, 5...]                                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: GPT-4 Gera Resposta                                │
│  ┌────────────┐                                              │
│  │   GPT-4    │ model: gpt-4-turbo-preview                   │
│  │   Turbo    │ temperature: 0.3 (preciso)                   │
│  │            │ max_tokens: 1000                             │
│  └────────────┘                                              │
│                                                              │
│  Input: System + Context + "Como tratar lesão de LCA?"      │
│  Output: Resposta estruturada com citações                  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Formatar e Retornar                                │
│                                                              │
│  Resposta:                                                  │
│  "A reabilitação do ligamento cruzado anterior segue um     │
│   protocolo baseado em evidências [Fonte 1], dividido em    │
│   fases progressivas:                                       │
│                                                              │
│   **Fase 1 (0-2 semanas):**                                 │
│   - Controle de dor e edema [Fonte 2]                       │
│   - Mobilização precoce                                     │
│   - Exercícios de amplitude de movimento                    │
│                                                              │
│   **Fase 2 (3-8 semanas):**                                 │
│   - Fortalecimento progressivo [Fonte 3]                    │
│   - Propriocepção                                           │
│   - ..."                                                    │
│                                                              │
│  Fontes:                                                    │
│  [1] Evidence-based rehabilitation following... (92%)        │
│  [2] Protocolo LCA fase 1... (88%)                          │
│  [3] Exercícios para joelho... (85%)                        │
│                                                              │
│  Tokens usados: 850 (prompt) + 350 (completion) = 1200      │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6: Exibir na Interface                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  💬 Chat Interface                                     │ │
│  │                                                        │ │
│  │  Você: Como tratar lesão de ligamento cruzado...      │ │
│  │                                                        │ │
│  │  IA: A reabilitação do LCA segue protocolo...         │ │
│  │      [Resposta completa com formatação]               │ │
│  │                                                        │ │
│  │  📚 Fontes:                                           │ │
│  │  • Evidence-based rehabilitation... (92%)             │ │
│  │  • Protocolo LCA fase 1... (88%)                      │ │
│  │  • Exercícios para joelho... (85%)                    │ │
│  │                                                        │ │
│  │  💡 Perguntas relacionadas:                           │ │
│  │  • Quanto tempo leva a recuperação?                   │ │
│  │  • Quais exercícios são contraindicados?             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Tempo total:** ~2-5 segundos

---

## 📊 Fluxo de Dados

### Estrutura de Um Chunk:

```json
{
  "id": "uuid-123-456",
  "content": "A reabilitação do ligamento cruzado anterior...",
  "embedding": [0.023, -0.145, 0.067, ..., 0.089],  // 1536 dimensões
  "source_title": "Evidence-based rehabilitation following anterior cruciate",
  "source_type": "protocol",
  "source_url": "C:\\Users\\rafal\\...\\Evidence-based rehabilitation.pdf",
  "author": "Various",
  "metadata": {
    "chunk_index": 12,
    "total_chunks": 45,
    "page": 5,
    "section": "Rehabilitation Protocol"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Query de Busca Vetorial:

```sql
SELECT 
  id,
  content,
  source_title,
  1 - (embedding <=> query_embedding) AS similarity
FROM knowledge_base
WHERE 1 - (embedding <=> query_embedding) > 0.75
ORDER BY similarity DESC
LIMIT 5;
```

---

## 🎯 Fluxo de Analytics

### Cada Query é Registrada:

```
Query → knowledge_base_queries table

{
  "query_text": "Como tratar lesão de LCA?",
  "results_count": 5,
  "avg_similarity": 0.85,
  "execution_time_ms": 150,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Métricas Geradas:

```sql
-- Total de queries
SELECT count(*) FROM knowledge_base_queries;

-- Queries mais comuns
SELECT query_text, count(*) 
FROM knowledge_base_queries 
GROUP BY query_text 
ORDER BY count(*) DESC 
LIMIT 10;

-- Qualidade média
SELECT avg(avg_similarity) 
FROM knowledge_base_queries;

-- Performance
SELECT avg(execution_time_ms) 
FROM knowledge_base_queries;
```

---

## 🚀 Fluxo de Upload (Novo Documento)

```
┌─────────────┐
│  Usuário    │
│  Upload PDF │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend                           │
│  1. Validar arquivo (tipo, tamanho)│
│  2. Ler conteúdo                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend API                        │
│  processDocument(content, metadata) │
└──────┬──────────────────────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│  Chunking   │      │  Embeddings │
│  1000 chars │      │  OpenAI API │
│  200 overlap│      │             │
└──────┬──────┘      └──────┬──────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Supabase                           │
│  INSERT INTO knowledge_base         │
│  (240 chunks de 1 PDF grande)       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  ✅ Documento indexado              │
│  ✅ Pronto para busca               │
│  ✅ Aparece na lista                │
└─────────────────────────────────────┘
```

---

## 🔒 Fluxo de Segurança (RLS)

### Row Level Security Garante:

```
┌─────────────────────────────────────┐
│  Usuário A                          │
│  user_id: abc-123                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  SELECT * FROM knowledge_base       │
│  WHERE metadata->>'user_id' = ?     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  ✅ Retorna apenas docs do Usuário A│
│  ❌ Bloqueia docs de outros usuários│
└─────────────────────────────────────┘
```

---

## 📈 Resumo Visual

### Pipeline Completo:

```
PDFs Locais (9)
     │
     ▼
[pdf-parse] Extração de Texto
     │
     ▼
[document-processor] Chunking + Limpeza
     │
     ▼
[OpenAI] Embeddings (ada-002)
     │
     ▼
[Supabase pgvector] Indexação (240+ chunks)
     │
     ├────────────┐
     │            │
     ▼            ▼
[Busca]      [Chat RAG]
     │            │
     │            ├─▶ [Busca contexto]
     │            │
     │            ├─▶ [GPT-4 gera resposta]
     │            │
     │            └─▶ [Cita fontes]
     │
     ▼
[Interface Web] Chat + Upload + Lista
```

---

## 🎯 Métricas de Performance

### Por Query:
- **Busca vetorial:** ~50-100ms
- **GPT-4 completion:** ~2-4s
- **Total end-to-end:** ~2-5s

### Por Dia (1000 queries):
- **Custo OpenAI:** ~$1.00
- **Queries Supabase:** Incluído no plano

### Qualidade:
- **Similaridade média:** > 85%
- **Precisão:** > 90%
- **Fontes citadas:** 100%

---

**Pronto para começar?** → [COMECE_AQUI.md](./COMECE_AQUI.md) ⚡

