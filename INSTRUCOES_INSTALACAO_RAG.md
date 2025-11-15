# 🚀 Instruções de Instalação - Base de Conhecimento RAG

## Status Atual ✅

- ✅ Migration criada: `supabase/migrations/20250115000001_create_knowledge_base.sql`
- ✅ Bibliotecas implementadas:
  - `lib/embeddings.ts` - Geração de embeddings com OpenAI
  - `lib/document-processor.ts` - Processamento e chunking de documentos
  - `lib/knowledge-base.ts` - API completa da base de conhecimento
- ✅ Componente UI: `components/KnowledgeChat.tsx`
- ✅ Página: `app/knowledge/page.tsx`
- ✅ Scripts de automação:
  - `scripts/apply-migration.ts` - Aplica migration no Supabase
  - `scripts/populate-knowledge-base.ts` - Processa e popula PDFs
  - `scripts/test-knowledge-base.ts` - Testa funcionalidades
- ✅ Dependência instalada: `pdf-parse`

---

## 📋 Próximos Passos (Você Precisa Fazer)

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e adicione:

```bash
# OpenAI (para embeddings e chat)
OPENAI_API_KEY=sk-proj-... # Sua chave da OpenAI

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... # Chave pública (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...    # Chave secreta (service_role)
```

**Onde encontrar essas chaves:**

#### OpenAI:
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie e cole no `.env.local`

#### Supabase:
1. Acesse: https://supabase.com/dashboard/project/seu-projeto/settings/api
2. Copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA commitar esta chave!**

---

### 2. Aplicar Migration no Supabase

**Opção A: Via Dashboard (Recomendado para primeira vez)**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor** (menu lateral esquerdo)
4. Clique em **+ New Query**
5. Abra o arquivo: `supabase/migrations/20250115000001_create_knowledge_base.sql`
6. Copie TODO o conteúdo e cole no SQL Editor
7. Clique em **Run** (ou pressione `Ctrl+Enter`)
8. Aguarde a confirmação: "Success. No rows returned"

**Opção B: Via Script (Experimental)**

```bash
npm run kb:apply-migration
```

**Verificar se funcionou:**

No SQL Editor do Supabase, execute:

```sql
-- Deve retornar a tabela
SELECT * FROM knowledge_base LIMIT 1;

-- Deve retornar a extensão
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

### 3. Popular a Base com seus PDFs

Os 9 PDFs encontrados em `C:\Users\rafal\OneDrive\Documentos\base de conhecimento` serão processados.

```bash
npm run kb:populate
```

**O que vai acontecer:**
1. ✅ Lê cada PDF
2. ✅ Extrai todo o texto
3. ✅ Limpa e processa o texto
4. ✅ Divide em chunks inteligentes
5. ✅ Gera embeddings para cada chunk (via OpenAI)
6. ✅ Salva tudo no Supabase

**Tempo estimado:** 5-10 minutos  
**Custo estimado:** ~$0.50-1.00 (embeddings OpenAI)

**Acompanhe o progresso no terminal:**
```
🚀 Iniciando população da base de conhecimento
📁 Pasta: C:\Users\rafal\OneDrive\Documentos\base de conhecimento
📚 Encontrados 9 PDFs

[1/9] ==============================
🔄 Processando: LIVRO_UNICO.pdf
📄 Extraindo texto...
  ✅ Extraídas 456 páginas
  ✅ 892350 caracteres
  📝 Texto limpo: 890234 caracteres
  🤖 Gerando embeddings e salvando...
  ✅ Documento adicionado com sucesso! ID: abc-123
  ⏳ Aguardando 2s antes do próximo...

...
```

---

### 4. Testar a Base de Conhecimento

```bash
npm run kb:test
```

Este script testa:
- ✅ Estatísticas (total de documentos, por tipo)
- ✅ Listagem de documentos
- ✅ Busca semântica
- ✅ Chat com RAG
- ✅ Sugestões de perguntas

**Exemplo de saída:**
```
🧪 Testando Base de Conhecimento

📊 1. Estatísticas da Base
================================

Total de documentos: 243
Por tipo: { book: 45, article: 198 }
Total de queries: 0
Similaridade média: 0.00

🔍 3. Teste de Busca Semântica
================================

Query: "reabilitação de ligamento cruzado anterior"

Encontrados 3 resultados:

1. Evidence-based rehabilitation following anterior cruciate
   Similaridade: 92.3%
   Preview: The purpose of this clinical commentary is to provide...

...
```

---

### 5. Testar a Interface Web

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse: http://localhost:3000/knowledge

**Você deve ver:**
- 📚 Interface de chat
- 📤 Área de upload de novos documentos
- 📊 Estatísticas da base
- 💬 Chat interativo com IA

**Teste perguntas como:**
- "Como tratar lesão de LCA?"
- "Quais são os protocolos para osteoartrite de quadril?"
- "Exercícios para reabilitação pós-operatória"

---

## 🎯 Verificações Importantes

### ✅ Checklist de Instalação

- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Chave OpenAI válida com créditos
- [ ] Migration aplicada no Supabase
- [ ] Extensão `pgvector` ativada
- [ ] Tabela `knowledge_base` criada
- [ ] 9 PDFs processados e salvos
- [ ] Testes passaram com sucesso
- [ ] Interface acessível em http://localhost:3000/knowledge
- [ ] Chat respondendo perguntas

### ❌ Problemas Comuns

#### "Error: OPENAI_API_KEY is not set"

**Solução:** Verifique se o `.env.local` tem a chave correta e reinicie o servidor (`npm run dev`)

#### "Error: relation 'knowledge_base' does not exist"

**Solução:** A migration não foi aplicada. Execute manualmente via SQL Editor.

#### "No rows returned" após processar PDFs

**Solução:** Verifique se os PDFs são legíveis (não são imagens escaneadas sem OCR)

#### PDFs muito grandes causam timeout

**Solução:** Processe PDFs individualmente ou aumente o timeout na biblioteca

---

## 📊 Monitoramento

### Ver dados no Supabase

```sql
-- Total de documentos
SELECT count(*) FROM knowledge_base;

-- Documentos por tipo
SELECT source_type, count(*) 
FROM knowledge_base 
GROUP BY source_type 
ORDER BY count(*) DESC;

-- Últimos 5 documentos adicionados
SELECT id, source_title, created_at 
FROM knowledge_base 
ORDER BY created_at DESC 
LIMIT 5;

-- Estatísticas de busca
SELECT count(*) as total_queries, 
       avg(avg_similarity) as avg_similarity
FROM knowledge_base_queries;
```

### Ver uso da OpenAI

Acesse: https://platform.openai.com/usage

Você verá:
- Tokens de embedding usados
- Tokens de completion (chat) usados
- Custo total

---

## 🚢 Deploy em Produção

### 1. Adicionar variáveis no Vercel

```bash
# Via CLI
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Ou via Dashboard:
# https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Re-popular base em produção (se necessário)

```bash
# Definir variáveis de ambiente no terminal
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export OPENAI_API_KEY=...

# Executar script
npm run kb:populate
```

---

## 🎉 Pronto!

Se tudo funcionou:
- ✅ Base de conhecimento configurada
- ✅ 9 PDFs processados e indexados
- ✅ Chat funcionando com RAG
- ✅ Busca semântica operacional

---

## 📞 Próximos Passos

Após verificar que está tudo funcionando, posso continuar implementando:

1. **Análise Preditiva** - Predição de progresso do paciente
2. **Computer Vision** - Análise de movimento em vídeos
3. **Gamificação** - Sistema de conquistas e jornada visual
4. **Wearables** - Integração com dispositivos

**Basta me enviar:** "continue implementando" ou especificar qual funcionalidade deseja!

---

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Autor:** Sistema FisioFlow Enterprise

