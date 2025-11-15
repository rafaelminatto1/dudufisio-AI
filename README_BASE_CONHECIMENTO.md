# 🧠 Base de Conhecimento com RAG - FisioFlow Enterprise

## 🎯 O que é?

Sistema de **Retrieval-Augmented Generation (RAG)** que permite:
- 📚 Upload e indexação de artigos científicos, protocolos e livros
- 🔍 Busca semântica em toda a base de conhecimento
- 💬 Chat com IA treinada em literatura científica de fisioterapia
- 📊 Respostas baseadas em evidências com citação de fontes

---

## ✨ Features Implementadas

### 🏗️ Infraestrutura Enterprise

- **Supabase Pro + pgvector**: Banco vetorial para busca semântica
- **OpenAI Embeddings**: `text-embedding-ada-002` para vetorização
- **GPT-4 Turbo**: Chat contextualizado com RAG
- **Row Level Security**: Isolamento de dados por usuário
- **Edge Functions**: Processamento serverless
- **Realtime**: Updates em tempo real

### 🤖 Funcionalidades de IA

- **Busca Vetorial Pura**: Similaridade coseno com threshold configurável
- **Busca Híbrida**: Combinação de vetorial + keyword
- **Context Window Optimization**: Chunks inteligentes com overlap
- **Source Attribution**: Citação automática de fontes
- **Related Questions**: IA sugere perguntas relacionadas
- **Analytics**: Tracking de queries e métricas de qualidade

### 💻 Interface do Usuário

- **Chat Interface**: Design moderno e responsivo
- **Document Upload**: Suporta PDF, TXT, MD
- **Document Library**: Lista e gerencia documentos
- **Source Viewer**: Visualiza fontes citadas
- **Dark Mode**: Suporte completo a tema escuro
- **Real-time Typing**: Indicador de processamento

---

## 📁 Estrutura de Arquivos

```
dudufisio-AI/
├── supabase/
│   └── migrations/
│       └── 20250115000001_create_knowledge_base.sql
│
├── lib/
│   ├── embeddings.ts             # OpenAI embeddings + cache
│   ├── document-processor.ts     # Chunking inteligente
│   └── knowledge-base.ts         # API completa RAG
│
├── components/
│   └── KnowledgeChat.tsx         # Interface de chat
│
├── app/
│   └── knowledge/
│       └── page.tsx              # Página principal
│
├── scripts/
│   ├── apply-migration.ts        # Aplica migration
│   ├── populate-knowledge-base.ts # Processa PDFs
│   └── test-knowledge-base.ts    # Suite de testes
│
└── docs/
    ├── INSTRUCOES_INSTALACAO_RAG.md
    ├── GUIA_INSTALACAO_RAG.md
    ├── RESUMO_IMPLEMENTACAO.md
    └── RESUMO_PROGRESSO.md
```

---

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
npm install
# pdf-parse já foi instalado!
```

### 2. Configurar Variáveis de Ambiente

Crie/edite `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Aplicar Migration

**Via Supabase Dashboard:**
1. Acesse: SQL Editor
2. Cole o conteúdo de: `supabase/migrations/20250115000001_create_knowledge_base.sql`
3. Execute

**Ou via script:**
```bash
npm run kb:apply-migration
```

### 4. Popular Base com PDFs

```bash
npm run kb:populate
```

Isso vai processar os 9 PDFs em:  
`C:\Users\rafal\OneDrive\Documentos\base de conhecimento`

### 5. Testar

```bash
# Rodar testes
npm run kb:test

# Iniciar dev server
npm run dev

# Acessar: http://localhost:3000/knowledge
```

---

## 📚 Base de Dados

### PDFs Identificados (9 arquivos)

1. **LIVRO_UNICO.pdf** → Livro completo de fisioterapia
2. **Evidence-based rehabilitation following anterior cruciate.pdf** → Protocolo LCA
3. **Brosseau-L-et-al-2016-Ottawa-Panel...pdf** → Guidelines OA quadril
4. **ijspt-11-831.pdf** → Journal esportivo
5. **nihms-1751132.pdf** → Pesquisa NIH
6. **ACTA-94-174.pdf** → Artigo científico
7. **1106.full.pdf** → Estudo clínico
8. **1119.full.pdf** → Estudo clínico
9. **12890_2024_Article_3213.pdf** → Artigo 2024

**Estimativa após processamento:**
- ~800k tokens de texto
- ~240+ chunks indexados
- ~$0.10 custo de embeddings (one-time)

---

## 🎯 Como Usar

### Upload de Documentos

```tsx
// Via interface web
// 1. Acesse /knowledge
// 2. Clique em "Enviar Documento"
// 3. Selecione PDF, TXT ou MD
// 4. Aguarde processamento

// Ou via API
import { addDocument } from '@/lib/knowledge-base';

await addDocument(documentText, {
  title: 'Protocolo de Reabilitação',
  type: 'protocol',
  source: 'https://example.com/doc.pdf',
  author: 'Dr. Silva',
  description: 'Protocolo para lesões de joelho',
});
```

### Busca Semântica

```typescript
import { searchDocuments } from '@/lib/knowledge-base';

const results = await searchDocuments('reabilitação de LCA', {
  threshold: 0.75,  // Similaridade mínima (0-1)
  count: 5,         // Número de resultados
  filterType: 'protocol', // Opcional: filtrar por tipo
  useHybridSearch: true,  // Vetorial + keyword
});

results.forEach(doc => {
  console.log(`${doc.source_title}: ${doc.similarity}`);
  console.log(doc.content);
});
```

### Chat com RAG

```typescript
import { chatWithKnowledge } from '@/lib/knowledge-base';

const response = await chatWithKnowledge(
  'Como tratar lesão de ligamento cruzado anterior?',
  [], // Histórico de conversação (opcional)
  { threshold: 0.75, count: 5 }
);

console.log('Resposta:', response.response);
console.log('Fontes:', response.sources);
console.log('Tokens:', response.tokensUsed);
```

### Sugestões de Perguntas

```typescript
import { suggestRelatedQuestions } from '@/lib/knowledge-base';

const suggestions = await suggestRelatedQuestions(
  'reabilitação pós-operatória',
  3 // Número de sugestões
);

console.log('Perguntas relacionadas:', suggestions);
```

---

## 🔧 Scripts Disponíveis

```bash
# Aplicar migration no Supabase
npm run kb:apply-migration

# Popular base com PDFs
npm run kb:populate

# Limpar base e repopular
npm run kb:populate:clear

# Rodar suite de testes
npm run kb:test
```

---

## 📊 Métricas e Monitoramento

### Supabase Dashboard

```sql
-- Total de documentos
SELECT count(*) FROM knowledge_base;

-- Documentos por tipo
SELECT source_type, count(*) 
FROM knowledge_base 
GROUP BY source_type;

-- Queries recentes
SELECT query_text, results_count, avg_similarity 
FROM knowledge_base_queries 
ORDER BY created_at DESC 
LIMIT 10;

-- Top documentos mais relevantes
SELECT source_title, count(*) as citations
FROM knowledge_base
JOIN knowledge_base_queries ON true
WHERE similarity > 0.8
GROUP BY source_title
ORDER BY citations DESC;
```

### OpenAI Dashboard

Acesse: https://platform.openai.com/usage

Monitore:
- Tokens de embedding
- Tokens de completion
- Custo por dia/mês

---

## 💰 Custos

### One-time (Setup)

- Embeddings de 9 PDFs: **~$0.10**

### Recorrente (por mês)

**Cenário Base (1000 queries/mês):**
- Embeddings: ~$0.50
- GPT-4 Completions: ~$30
- **Total:** ~$30/mês

**Cenário Alto (10k queries/mês):**
- Embeddings: ~$5
- GPT-4 Completions: ~$300
- **Total:** ~$305/mês

---

## 🐛 Troubleshooting

### Erro: "Extension vector not found"

```sql
-- Execute no SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### PDFs não processando

- Verifique se não são imagens escaneadas
- Teste com um PDF menor primeiro
- Verifique logs: `npm run kb:populate`

### Chat não respondendo

- Verifique chave OpenAI em `.env.local`
- Confirme créditos disponíveis
- Verifique logs do console

### Busca retornando poucos resultados

- Diminua o `threshold` (ex: 0.65)
- Use `useHybridSearch: true`
- Verifique se documentos foram indexados

---

## 🚢 Deploy em Produção

### 1. Configurar Vercel

```bash
# Adicionar variáveis de ambiente
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### 2. Popular base em produção

```bash
# Definir variáveis
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export OPENAI_API_KEY=...

# Executar
npm run kb:populate
```

### 3. Configurar Edge Config (Cache)

```bash
# Criar Edge Config no Vercel
vercel edge-config create knowledge-cache

# Adicionar ao projeto
vercel env add EDGE_CONFIG
```

---

## 🎓 Documentação Completa

- 📖 [Instruções de Instalação](./INSTRUCOES_INSTALACAO_RAG.md)
- 📘 [Guia de Instalação Detalhado](./GUIA_INSTALACAO_RAG.md)
- 📗 [Resumo de Implementação](./RESUMO_IMPLEMENTACAO.md)
- 📕 [Progresso do Projeto](./RESUMO_PROGRESSO.md)
- 📙 [Arquitetura de IA Enterprise](./ARQUITETURA_IA_ENTERPRISE.md)
- 📔 [Roadmap Detalhado](./ROADMAP_IMPLEMENTACAO_DETALHADO.md)

---

## 🔄 Próximas Fases

Após testar e validar a Base de Conhecimento:

1. ✅ **Análise Preditiva** - ML para predição de evolução
2. ✅ **Computer Vision** - Análise de movimento em vídeos
3. ✅ **Gamificação** - Sistema de conquistas e jornada
4. ✅ **Wearables** - Integração HealthKit/Health Connect

**Para continuar:** Basta dizer "continue implementando"!

---

## 📞 Suporte

**Problemas?**
1. Verifique logs: `npm run kb:test`
2. Consulte troubleshooting acima
3. Revise documentação completa

**Dúvidas técnicas?**
- Leia `ARQUITETURA_IA_ENTERPRISE.md`
- Veja exemplos em `scripts/test-knowledge-base.ts`

---

**Versão:** 1.0  
**Status:** ✅ Implementado e pronto para teste  
**Última atualização:** Janeiro 2025

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Configure .env.local com suas chaves

# 2. Aplique migration (SQL Editor do Supabase)

# 3. Processe PDFs
npm run kb:populate

# 4. Teste
npm run kb:test

# 5. Veja funcionando
npm run dev
# → http://localhost:3000/knowledge
```

🎉 **Pronto! Base de Conhecimento com RAG funcionando!**

