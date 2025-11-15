# Guia de Instalação - Base de Conhecimento com RAG

## 📋 Pré-requisitos

1. **Node.js** >= 18
2. **Conta Supabase Pro** configurada
3. **Chave OpenAI API** com créditos
4. **9 PDFs** na pasta: `C:\Users\rafal\OneDrive\Documentos\base de conhecimento`

---

## 🚀 Passo a Passo

### 1. Instalar Dependências

Precisamos adicionar algumas dependências para processar PDFs:

```bash
npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

### 2. Configurar Variáveis de Ambiente

Crie/atualize o arquivo `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...  # Sua chave da OpenAI

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Chave pública
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Chave secreta (para scripts)
```

**⚠️ IMPORTANTE:** Nunca commite o `.env.local`! Está no `.gitignore`.

### 3. Aplicar Migration no Supabase

Você tem **2 opções**:

#### Opção A: Via Script (Recomendado)

```bash
npm run kb:apply-migration
```

#### Opção B: Manualmente no Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo de `supabase/migrations/20250115000001_create_knowledge_base.sql`
5. Clique em **Run**

### 4. Verificar Migration

No SQL Editor do Supabase, execute:

```sql
-- Verificar extensão pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verificar tabela
SELECT count(*) FROM knowledge_base;

-- Deve retornar 3 (documentos seed)
```

✅ Se tudo funcionou, você verá:
- Extensão `vector` instalada
- Tabela `knowledge_base` criada
- 3 documentos de exemplo

### 5. Popular com seus PDFs

```bash
npm run kb:populate
```

Este script vai:
1. ✅ Ler os 9 PDFs da pasta
2. ✅ Extrair texto de cada PDF
3. ✅ Limpar e processar o texto
4. ✅ Dividir em chunks inteligentes
5. ✅ Gerar embeddings com OpenAI
6. ✅ Salvar no Supabase

**⏱️ Tempo estimado:** 5-10 minutos (depende do tamanho dos PDFs e da API)

**💰 Custo estimado:** ~$0.50-1.00 (embeddings OpenAI)

### 6. Testar a Base de Conhecimento

```bash
npm run kb:test
```

Este script testa:
- ✅ Estatísticas da base
- ✅ Listagem de documentos
- ✅ Busca semântica
- ✅ Chat com RAG
- ✅ Sugestões de perguntas

### 7. Testar a Interface

Adicione o componente em uma página:

```tsx
// app/knowledge/page.tsx
import { KnowledgeChat } from '@/components/KnowledgeChat';

export default function KnowledgePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Base de Conhecimento
      </h1>
      <KnowledgeChat />
    </div>
  );
}
```

Acesse: http://localhost:3000/knowledge

---

## 🧪 Comandos Disponíveis

```bash
# Aplicar migration
npm run kb:apply-migration

# Popular base com PDFs
npm run kb:populate

# Limpar base e repopular
npm run kb:populate:clear

# Testar funcionalidades
npm run kb:test
```

---

## 📊 Estrutura dos PDFs Encontrados

Seus 9 PDFs serão processados assim:

1. **LIVRO_UNICO.pdf** → Livro de referência completo
2. **Evidence-based rehabilitation following anterior cruciate.pdf** → Protocolo LCA
3. **Brosseau-L-et-al-2016-Ottawa-Panel...pdf** → Guidelines osteoartrite
4. **ijspt-11-831.pdf** → Journal esportivo
5. **nihms-1751132.pdf** → Pesquisa NIH
6. **ACTA-94-174.pdf** → Artigo científico
7. **1106.full.pdf** → Estudo clínico
8. **1119.full.pdf** → Estudo clínico
9. **12890_2024_Article_3213.pdf** → Artigo 2024

---

## 🐛 Troubleshooting

### Erro: "Extensão vector não encontrada"

**Solução:**
```sql
-- Execute no SQL Editor do Supabase
CREATE EXTENSION IF NOT EXISTS vector;
```

### Erro: "Failed to generate embedding"

**Possíveis causas:**
1. Chave OpenAI inválida ou sem créditos
2. Rate limit atingido
3. Texto muito grande

**Solução:**
- Verifique sua chave em https://platform.openai.com/api-keys
- Adicione delay entre requests (já implementado no script)

### Erro: "Cannot find module 'pdf-parse'"

**Solução:**
```bash
npm install pdf-parse @types/pdf-parse
```

### PDFs não sendo processados

**Verificar:**
1. Caminho da pasta está correto?
2. PDFs são legíveis (não escaneados sem OCR)?
3. Tamanho dos PDFs (muito grandes podem falhar)?

**Testar um PDF individual:**
```typescript
import pdf from 'pdf-parse';
import fs from 'fs';

const dataBuffer = fs.readFileSync('caminho/do/arquivo.pdf');
pdf(dataBuffer).then(data => {
  console.log('Páginas:', data.numpages);
  console.log('Texto:', data.text.substring(0, 500));
});
```

---

## 📈 Monitoramento

### Ver uso da OpenAI

https://platform.openai.com/usage

### Ver dados no Supabase

```sql
-- Total de documentos
SELECT count(*) FROM knowledge_base;

-- Documentos por tipo
SELECT source_type, count(*) 
FROM knowledge_base 
GROUP BY source_type;

-- Últimos 10 documentos adicionados
SELECT source_title, created_at 
FROM knowledge_base 
ORDER BY created_at DESC 
LIMIT 10;

-- Estatísticas de queries
SELECT 
  count(*) as total_queries,
  avg(avg_similarity) as avg_similarity,
  avg(results_count) as avg_results
FROM knowledge_base_queries;
```

---

## 🎯 Próximos Passos

Após instalar e testar:

1. ✅ **Deploy**: Fazer deploy da aplicação com Vercel
2. ✅ **Feedback**: Coletar feedback dos usuários
3. ✅ **Continuar**: Implementar próximas funcionalidades:
   - Análise Preditiva
   - Computer Vision
   - Gamificação
   - Wearables

---

## 📞 Suporte

**Problemas?** Verifique:
1. Logs do console (`npm run kb:populate`)
2. Logs do Supabase (Dashboard > Logs)
3. Documentação completa em:
   - `RELATORIO_ANALISE_ENTERPRISE.md`
   - `GUIA_INTEGRACOES_SUPABASE_PRO.md`
   - `PROMPTS_CURSOR_IMPLEMENTACAO.md`

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2025

