# ⚠️ Arquivos Deprecados - Sistema Antigo (pgvector)

Este documento lista os arquivos que faziam parte do sistema antigo de Base de Conhecimento usando pgvector. Eles foram mantidos para referência mas **NÃO são mais usados**.

## 🚨 IMPORTANTE

O sistema agora usa **Gemini File Search** que é:
- ✅ Muito mais simples
- ✅ Totalmente gerenciado pelo Google
- ✅ Sem necessidade de migrations SQL
- ✅ Sem necessidade de gerar embeddings manualmente

## 📁 Arquivos Antigos (NÃO USAR)

### Migrations SQL
- ❌ `supabase/migrations/20250115000001_create_knowledge_base.sql`
  - Migration complexa com pgvector
  - Substituída por: Gemini File Search (sem migrations!)

### Libraries
- ❌ `lib/embeddings.ts`
  - Geração manual de embeddings com OpenAI
  - Substituída por: Gemini gerencia embeddings automaticamente

- ❌ `lib/document-processor.ts`
  - Chunking manual de documentos
  - Substituída por: Gemini gerencia chunking automaticamente

- ⚠️ `lib/knowledge-base.ts`
  - Lógica complexa de RAG manual
  - Substituída por: `lib/gemini-file-search.ts` (muito mais simples!)

### Scripts
- ❌ `scripts/apply-migration.ts`
  - Aplicava migration do pgvector
  - Substituído por: Não precisa mais!

- ❌ `scripts/populate-knowledge-base.ts`
  - Upload manual com chunking e embeddings
  - Substituído por: `scripts/migrate-to-gemini-file-search.ts`

- ❌ `scripts/test-knowledge-base.ts`
  - Testes do sistema antigo
  - Substituído por: Chat direto na interface web

## 🆕 Novos Arquivos (USAR ESTES!)

### APIs
- ✅ `app/api/file-search-store/route.ts` - Gerenciar stores
- ✅ `app/api/files/route.ts` - Upload/list/delete
- ✅ `app/api/chat/route.ts` - Chat com RAG

### UI
- ✅ `app/biblioteca/page.tsx` - Gestão de arquivos
- ✅ `app/knowledge/page.tsx` - Chat inteligente
- ✅ `components/FileUpload.tsx` - Upload drag-and-drop
- ✅ `components/FileList.tsx` - Lista de arquivos
- ✅ `components/KnowledgeChat.tsx` - Chat (atualizado)

### Libraries
- ✅ `lib/gemini-file-search.ts` - Core library (500 linhas vs 2500!)

### Scripts
- ✅ `scripts/migrate-to-gemini-file-search.ts` - Migração de PDFs

### Documentação
- ✅ `GEMINI_FILE_SEARCH_README.md` - Documentação completa

## 🔄 Como Migrar

Se você ainda tem dados no sistema antigo:

1. Os documentos estão armazenados em `C:\Users\rafal\OneDrive\Documentos\base de conhecimento`
2. Execute: `npm run gemini:migrate`
3. Pronto! Gemini vai indexar tudo automaticamente

## 📊 Comparação

| Métrica | Antigo (pgvector) | Novo (Gemini FS) |
|---|---|---|
| Linhas de código | ~2500 | ~500 |
| Arquivos necessários | 8+ | 3 |
| Migrations SQL | Sim (complexas) | Não |
| Manutenção | Alta | Baixa |
| Custo operacional | ~$0.10 + manutenção | ~$0.12 one-time |

## 🗑️ Posso Deletar os Arquivos Antigos?

**NÃO recomendado por enquanto.** Mantenha por 30 dias para garantir que tudo funciona perfeitamente com o novo sistema.

Após esse período, você pode deletar:
- `supabase/migrations/20250115000001_create_knowledge_base.sql`
- `lib/embeddings.ts`
- `lib/document-processor.ts`
- `scripts/apply-migration.ts`
- `scripts/populate-knowledge-base.ts`
- `scripts/test-knowledge-base.ts`

## ❓ Dúvidas?

Consulte: `GEMINI_FILE_SEARCH_README.md`

---

**Sistema migrado com sucesso! 🎉**

