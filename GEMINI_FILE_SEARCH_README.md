# 🚀 Base de Conhecimento com Gemini File Search

## ✨ O que é?

Sistema de **RAG (Retrieval-Augmented Generation)** completamente gerenciado pelo Google, usando **Gemini File Search API**. Zero configuração, 100% automático!

## 🎯 Arquitetura

```
Usuario → Upload PDF → Gemini File Search (Google)
                              ↓
                     Indexação Automática
                     (chunking + embeddings)
                              ↓
Usuario → Pergunta → Chat API → Gemini 1.5 Pro
                              ↓
                     Resposta + Citações
```

## 🌟 Vantagens

### Vs Abordagem Anterior (pgvector)

| Característica | pgvector (Antigo) | Gemini File Search (Novo) |
|---|---|---|
| **Linhas de código** | ~2500 | ~500 |
| **Complexidade** | Alta | Baixa |
| **Migrations SQL** | Complexas | Não precisa |
| **Chunking** | Manual | Automático |
| **Embeddings** | Manual | Automático |
| **Indexação** | Manual | Automática |
| **Manutenção** | Alta | Baixa |
| **Custo setup** | ~$0.10 | $0 (grátis) |

### Por que é Melhor?

1. ✅ **Plug-and-play**: Só fazer upload e pronto
2. ✅ **Zero manutenção**: Google gerencia tudo
3. ✅ **Gratuito**: 1GB storage grátis
4. ✅ **Escalável**: Google cuida da performance
5. ✅ **Citações automáticas**: Gemini cita as fontes

## 📁 Estrutura de Arquivos

```
app/
├── api/
│   ├── file-search-store/route.ts  # Gerenciar stores
│   ├── files/route.ts              # Upload/list/delete
│   └── chat/route.ts               # Chat com RAG
├── biblioteca/page.tsx             # Gestão de arquivos
└── knowledge/page.tsx              # Chat inteligente

components/
├── FileUpload.tsx                  # Upload drag-and-drop
├── FileList.tsx                    # Lista de arquivos
└── KnowledgeChat.tsx               # Interface de chat

lib/
└── gemini-file-search.ts           # Core library

scripts/
└── migrate-to-gemini-file-search.ts  # Migração de PDFs
```

## 🚀 Como Usar

### 1. Fazer Upload de Documentos

**Via Interface Web:**
```
http://localhost:3000/biblioteca
```

**Via Script (Migração em Massa):**
```bash
npm run gemini:migrate
```

### 2. Usar o Chat

```
http://localhost:3000/knowledge
```

Faça perguntas e receba respostas baseadas nos seus documentos!

## 💻 APIs Disponíveis

### 1. Gerenciar Stores

```typescript
// Listar stores
GET /api/file-search-store

// Criar novo store
POST /api/file-search-store
{
  "displayName": "Minha Biblioteca"
}

// Deletar store
DELETE /api/file-search-store?name=fileSearchStores/xxx
```

### 2. Gerenciar Arquivos

```typescript
// Listar arquivos
GET /api/files?storeName=fileSearchStores/xxx

// Upload arquivo
POST /api/files
FormData:
  - file: File
  - displayName: string
  - storeName?: string

// Deletar arquivo
DELETE /api/files?documentName=xxx&storeName=yyy
```

### 3. Chat com RAG

```typescript
POST /api/chat
{
  "question": "Como tratar tendinite no ombro?",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

// Resposta:
{
  "success": true,
  "answer": "Para tratar tendinite no ombro...",
  "sources": [
    {
      "documentName": "protocolo-ombro.pdf",
      "chunkText": "..."
    }
  ]
}
```

## 📦 Custos e Limites (Tier Gratuito)

### Gemini API (Tier Gratuito)

- **Storage**: 1 GB grátis
- **Indexação**: $0.15/1M tokens (one-time)
- **Queries**: Grátis! (tokens recuperados = contexto normal)
- **Requests/dia**: 1500

### Para seus 9 PDFs (~800k tokens):
- **Custo de indexação**: ~$0.12 (pagamento único)
- **Uso contínuo**: GRÁTIS até 1500 queries/dia

## 🔧 Configuração

### Variáveis de Ambiente (.env.local)

```env
GEMINI_API_KEY=AIzaSyC...  # Sua chave do Gemini API
```

### Obter Chave da API

1. Acesse: https://ai.google.dev/
2. Crie um projeto
3. Gere uma API key
4. Adicione no `.env.local`

## 📚 Tipos de Arquivo Suportados

✅ **Suportados:**
- PDF (`.pdf`)
- Text (`.txt`)
- Markdown (`.md`)
- Word (`.doc`, `.docx`)

⚠️ **Limites:**
- Tamanho máximo: **100 MB** por arquivo
- Storage total: **1 GB** (tier gratuito)

## 🎨 Componentes Reutilizáveis

### FileUpload

```tsx
import { FileUpload } from '@/components/FileUpload';

<FileUpload 
  onUploadComplete={() => {
    // Callback após upload bem-sucedido
  }} 
/>
```

### FileList

```tsx
import { FileList } from '@/components/FileList';

<FileList 
  refreshTrigger={refreshCounter}  // Incrementar para recarregar
/>
```

### KnowledgeChat

```tsx
import { KnowledgeChat } from '@/components/KnowledgeChat';

<KnowledgeChat />
```

## 🔍 Funcionalidades

### ✅ Implementado

- [x] Upload de arquivos (drag-and-drop)
- [x] Indexação automática
- [x] Chat com RAG
- [x] Citação de fontes
- [x] Histórico de conversação
- [x] Interface responsiva
- [x] Script de migração em massa
- [x] Tratamento de erros

### 🚧 Melhorias Futuras

- [ ] Filtros avançados (por data, tipo, etc)
- [ ] Busca full-text nos documentos
- [ ] Export de conversas
- [ ] Anotações em documentos
- [ ] Compartilhamento de stores
- [ ] Analytics de uso

## 🐛 Troubleshooting

### "GEMINI_API_KEY não está configurada"

Solução: Adicione a chave no `.env.local`

### "Arquivo muito grande"

Solução: Máximo é 100MB. Divida o arquivo ou comprima.

### "Limite de API atingido"

Solução: Aguarde 24h (tier gratuito = 1500 requests/dia) ou faça upgrade.

### "Store não encontrado"

Solução: Faça upload de pelo menos 1 documento primeiro.

## 📖 Documentação Oficial

- Gemini API: https://ai.google.dev/gemini-api/docs
- File Search: https://ai.google.dev/gemini-api/docs/file-search

## 🎉 Pronto!

Agora você tem um sistema RAG profissional, totalmente gerenciado, com **MUITO menos código** e **zero manutenção**!

---

**Desenvolvido com ❤️ usando Gemini File Search**

