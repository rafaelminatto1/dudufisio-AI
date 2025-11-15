# ✅ Checklist de Instalação - Base de Conhecimento RAG

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📋 Pré-requisitos

- [ ] Node.js >= 18 instalado
- [ ] Conta Supabase Pro ativa
- [ ] Conta OpenAI com créditos
- [ ] 9 PDFs na pasta: `C:\Users\rafal\OneDrive\Documentos\base de conhecimento`
- [ ] Editor de código (VS Code, Cursor)
- [ ] Terminal/PowerShell

---

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] `OPENAI_API_KEY` configurado
  - Obter em: https://platform.openai.com/api-keys
  - Formato: `sk-proj-...`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
  - Obter em: Supabase Dashboard → Settings → API
  - Formato: `https://xxxxxxxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
  - Obter em: Supabase Dashboard → Settings → API → Project API keys → anon public
  - Formato: `eyJhbG...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
  - ⚠️ **ATENÇÃO:** Chave secreta! Nunca commitar!
  - Obter em: Supabase Dashboard → Settings → API → Project API keys → service_role
  - Formato: `eyJhbG...`

**Verificar:**
```bash
# No terminal, dentro do projeto
cat .env.local

# Deve mostrar todas as 4 variáveis
```

---

### 2. Dependências

- [ ] `pdf-parse` instalado
  ```bash
  npm install pdf-parse
  ```
- [ ] Verificar instalação:
  ```bash
  npm list pdf-parse
  # Deve mostrar: pdf-parse@1.x.x
  ```

---

## 🗄️ Setup do Banco de Dados

### 3. Aplicar Migration no Supabase

**Método 1: Via Dashboard (Recomendado)**

- [ ] Acessar: https://supabase.com/dashboard
- [ ] Selecionar projeto FisioFlow
- [ ] Ir em: **SQL Editor** (menu lateral)
- [ ] Clicar em: **+ New Query**
- [ ] Abrir arquivo: `supabase/migrations/20250115000001_create_knowledge_base.sql`
- [ ] Copiar **TODO** o conteúdo (Ctrl+A, Ctrl+C)
- [ ] Colar no SQL Editor (Ctrl+V)
- [ ] Clicar em: **Run** (ou Ctrl+Enter)
- [ ] Aguardar: "Success. No rows returned"

**OU Método 2: Via Script**

- [ ] Executar:
  ```bash
  npm run kb:apply-migration
  ```
- [ ] Verificar saída: "✅ Migration aplicada com sucesso!"

### 4. Verificar Migration

- [ ] No SQL Editor, executar:
  ```sql
  -- Verificar extensão pgvector
  SELECT * FROM pg_extension WHERE extname = 'vector';
  ```
  Resultado esperado: 1 linha com `vector`

- [ ] Executar:
  ```sql
  -- Verificar tabela
  SELECT count(*) FROM knowledge_base;
  ```
  Resultado esperado: `3` (documentos seed)

- [ ] Executar:
  ```sql
  -- Verificar funções
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_name LIKE '%knowledge%';
  ```
  Resultado esperado: `search_knowledge`, `hybrid_search_knowledge`, etc.

---

## 📚 Popular Base de Conhecimento

### 5. Verificar PDFs

- [ ] Abrir pasta: `C:\Users\rafal\OneDrive\Documentos\base de conhecimento`
- [ ] Confirmar que há 9 arquivos:
  - [ ] `LIVRO_UNICO.pdf`
  - [ ] `Evidence-based rehabilitation following anterior cruciate.pdf`
  - [ ] `Brosseau-L-et-al-2016-Ottawa-Panel...pdf`
  - [ ] `ijspt-11-831.pdf`
  - [ ] `nihms-1751132.pdf`
  - [ ] `ACTA-94-174.pdf`
  - [ ] `1106.full.pdf`
  - [ ] `1119.full.pdf`
  - [ ] `12890_2024_Article_3213.pdf`

### 6. Processar PDFs

- [ ] Executar no terminal:
  ```bash
  npm run kb:populate
  ```

- [ ] Acompanhar progresso (deve aparecer):
  ```
  🚀 Iniciando população da base de conhecimento
  📁 Pasta: C:\Users\rafal\OneDrive\Documentos\base de conhecimento
  📚 Encontrados 9 PDFs
  
  [1/9] ==============================
  🔄 Processando: LIVRO_UNICO.pdf
  📄 Extraindo texto...
    ✅ Extraídas X páginas
    ...
  ```

- [ ] Aguardar conclusão (5-10 minutos)

- [ ] Verificar resumo final:
  ```
  📊 ===== RESUMO =====
  ✅ Processados com sucesso: 9
  ❌ Erros: 0
  📚 Total de PDFs: 9
  ```

### 7. Verificar População

- [ ] No SQL Editor do Supabase, executar:
  ```sql
  SELECT count(*) FROM knowledge_base;
  ```
  Resultado esperado: `240+` (muito mais que 3)

- [ ] Executar:
  ```sql
  SELECT source_type, count(*) 
  FROM knowledge_base 
  GROUP BY source_type;
  ```
  Resultado esperado: Vários tipos (book, article, protocol, etc.)

- [ ] Executar:
  ```sql
  SELECT source_title, created_at 
  FROM knowledge_base 
  ORDER BY created_at DESC 
  LIMIT 5;
  ```
  Resultado esperado: 5 documentos recentes

---

## 🧪 Testes

### 8. Executar Suite de Testes

- [ ] Executar:
  ```bash
  npm run kb:test
  ```

- [ ] Verificar saída esperada:
  ```
  🧪 Testando Base de Conhecimento

  📊 1. Estatísticas da Base
  ================================
  Total de documentos: 243
  Por tipo: { book: 45, article: 198 }
  
  🔍 3. Teste de Busca Semântica
  ================================
  Query: "reabilitação de ligamento cruzado anterior"
  Encontrados 3 resultados:
  1. Evidence-based rehabilitation...
     Similaridade: 92.3%
  
  💬 4. Teste de Chat com RAG
  ================================
  Pergunta: "Como tratar lesão de LCA?"
  Resposta:
  ---
  [resposta da IA com fontes]
  ---
  
  ✅ Todos os testes passaram!
  ```

- [ ] **Todos os testes passaram?**
  - ✅ Sim → Prosseguir para #9
  - ❌ Não → Ver seção "Troubleshooting"

---

## 🌐 Interface Web

### 9. Iniciar Servidor de Desenvolvimento

- [ ] Executar:
  ```bash
  npm run dev
  ```

- [ ] Aguardar:
  ```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  ✓ Ready in X.Xs
  ```

### 10. Testar Interface

- [ ] Abrir navegador
- [ ] Acessar: http://localhost:3000/knowledge
- [ ] Verificar elementos na página:
  - [ ] Título: "Base de Conhecimento"
  - [ ] 3 cards de features (Busca Semântica, RAG com GPT-4, Fontes Citadas)
  - [ ] Área de chat
  - [ ] Campo de input de mensagem

### 11. Testar Chat

- [ ] Digitar no chat: "Como tratar lesão de LCA?"
- [ ] Pressionar Enter ou clicar em enviar
- [ ] Aguardar resposta (5-10 segundos)
- [ ] Verificar:
  - [ ] Resposta apareceu
  - [ ] Resposta é relevante e profissional
  - [ ] Fontes são citadas (ex: [Fonte 1], [Fonte 2])
  - [ ] Lista de fontes aparece abaixo da resposta

- [ ] Testar mais perguntas:
  - [ ] "Quais são os protocolos para osteoartrite de quadril?"
  - [ ] "Exercícios para reabilitação pós-operatória"
  - [ ] "Evidências sobre fisioterapia esportiva"

### 12. Testar Upload de Documentos

- [ ] Clicar em área de upload (ou sidebar)
- [ ] Selecionar um arquivo de teste (TXT ou PDF pequeno)
- [ ] Aguardar processamento
- [ ] Verificar:
  - [ ] Documento apareceu na lista
  - [ ] Mensagem de sucesso apareceu
  - [ ] É possível fazer perguntas sobre o documento

---

## ✨ Validação Final

### 13. Checklist de Funcionalidades

- [ ] ✅ Base de dados configurada (Supabase + pgvector)
- [ ] ✅ Extensão vector habilitada
- [ ] ✅ Tabela knowledge_base criada
- [ ] ✅ 9 PDFs processados e indexados (240+ chunks)
- [ ] ✅ Busca semântica funcionando
- [ ] ✅ Chat com RAG funcionando
- [ ] ✅ Fontes sendo citadas corretamente
- [ ] ✅ Interface web acessível e responsiva
- [ ] ✅ Upload de documentos funcionando

### 14. Métricas de Qualidade

- [ ] Tempo de resposta do chat: **< 10 segundos** ✅
- [ ] Similaridade média dos resultados: **> 75%** ✅
- [ ] Fontes citadas em: **100% das respostas** ✅
- [ ] Documentos processados: **9/9** ✅

---

## 🎉 Conclusão

Se todos os itens acima estão marcados:

### ✅ Parabéns! Base de Conhecimento RAG está 100% funcional!

**Você agora tem:**
- 🧠 IA treinada em 9 documentos científicos de fisioterapia
- 📚 240+ chunks indexados e pesquisáveis
- 💬 Chat inteligente com citação de fontes
- 🔍 Busca semântica de alta qualidade
- 📊 Analytics e métricas em tempo real

---

## 🚀 Próximos Passos

### Opção 1: Deploy em Produção

- [ ] Configurar variáveis no Vercel
- [ ] Fazer deploy: `vercel --prod`
- [ ] Testar em produção
- [ ] Compartilhar com usuários

### Opção 2: Continuar Implementação

Próximas features do roadmap:

1. **Análise Preditiva**
   - Predição de evolução do paciente
   - Alertas inteligentes
   - ML com histórico

2. **Computer Vision**
   - Análise de movimento em vídeos
   - Detecção de postura
   - Feedback visual

3. **Gamificação**
   - Sistema de conquistas
   - Jornada visual
   - Recompensas inteligentes

4. **Wearables**
   - Integração HealthKit/Health Connect
   - Monitoramento em tempo real
   - Dashboard de métricas

**Para continuar:** Me envie "continue implementando" ou especifique a funcionalidade!

---

## 🐛 Troubleshooting

### ❌ Migration não aplica

**Sintoma:** Erro ao executar SQL
**Solução:**
1. Verificar se está no projeto correto no Supabase
2. Verificar permissões do usuário
3. Tentar executar em partes menores
4. Contatar suporte do Supabase

### ❌ PDFs não processam

**Sintoma:** Erro "Failed to extract text"
**Solução:**
1. Verificar se PDFs são legíveis (não imagens sem OCR)
2. Testar com um PDF menor primeiro
3. Verificar permissões da pasta
4. Verificar logs: `npm run kb:populate`

### ❌ OpenAI API error

**Sintoma:** Erro "Invalid API key" ou "Insufficient quota"
**Solução:**
1. Verificar chave em `.env.local`
2. Verificar créditos em: https://platform.openai.com/usage
3. Adicionar créditos se necessário
4. Verificar rate limits

### ❌ Chat não responde

**Sintoma:** Timeout ou erro
**Solução:**
1. Verificar conexão com internet
2. Verificar logs do console (F12)
3. Verificar se documentos foram indexados
4. Diminuir threshold de busca (ex: 0.65)
5. Usar `useHybridSearch: true`

### ❌ Interface não carrega

**Sintoma:** Erro 404 ou página em branco
**Solução:**
1. Verificar se dev server está rodando
2. Verificar porta 3000 está livre
3. Limpar cache do navegador
4. Reiniciar dev server

---

## 📞 Contato e Suporte

**Documentação Completa:**
- 📖 `README_BASE_CONHECIMENTO.md` - Overview completo
- 📘 `INSTRUCOES_INSTALACAO_RAG.md` - Passo a passo detalhado
- 📗 `GUIA_INSTALACAO_RAG.md` - Guia técnico
- 📕 `RESUMO_PROGRESSO.md` - Status do projeto

**Precisa de ajuda?**
- Revise esta checklist do início
- Consulte documentação acima
- Verifique logs e erros
- Me envie detalhes do problema!

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2025  
**Status:** Pronto para teste ✅

