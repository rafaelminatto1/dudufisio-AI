# 🧪 Guia de Teste - Funcionalidades Avançadas do Módulo de Evolução

**Data:** 2025-11-06  
**Status:** ✅ Migrations Aplicadas | 🚀 Pronto para Testes

## ✅ Migrations Aplicadas com Sucesso

```bash
✅ 20251106000001_evolution_templates.sql - APLICADO
✅ 20251106000002_progress_photos_bucket.sql - APLICADO
```

**Tabela criada:** `evolution_templates` ✅  
**Colunas adicionadas em `session_evolutions`:**
- `prescribed_exercises` (JSONB) ✅
- `progress_photos` (JSONB) ✅  
- `session_timer` (JSONB) ✅
- `conducts` (JSONB) ✅
- `plan_general_notes` (TEXT) ✅

## 📋 Checklist de Funcionalidades

### 1. ✅ Timer de Sessão Automático

**Como testar:**
1. Acesse uma evolução de sessão
2. O timer deve iniciar automaticamente ao carregar
3. Verificar display em tempo real (MM:SS)
4. Verificar indicador visual pulsante
5. Clicar em "Finalizar" e ver duração total
6. Verificar se os dados são salvos na evolução

**Resultado esperado:**
- ⏱️ Timer inicia automaticamente
- 🔄 Atualização em tempo real a cada segundo
- 💚 Indicador verde pulsante quando ativo
- ✅ Duração em minutos salva corretamente

---

### 2. 📊 Comparação com Sessão Anterior

**Como testar:**
1. Criar pelo menos 2 evoluções para um paciente
2. Na segunda evolução, verificar card amarelo na sidebar
3. Ver dados da sessão anterior (dor, data, condutas)
4. Verificar cálculo de tendência de dor (melhora/piora)
5. Clicar em "Ver Sessão Completa"

**Resultado esperado:**
- 📋 Card amarelo com dados da última sessão
- 📈 Tendência de dor com ícones (↓ melhora, ↑ piora, − estável)
- 👁️ Dialog com sessão completa ao clicar
- 🆕 "Primeira sessão" quando não há anterior

---

### 3. 💪 Prescrição de Exercícios

**Como testar:**
1. Na tab "Exercícios Prescritos", clicar em "Adicionar Exercícios"
2. Buscar exercícios por nome (ex: "alongamento")
3. Selecionar múltiplos exercícios
4. Editar parâmetros: séries, reps, carga, tempo
5. Adicionar observações específicas
6. Remover um exercício
7. Salvar evolução e verificar persistência

**Resultado esperado:**
- 🔍 Busca funcionando corretamente
- ☑️ Seleção múltipla com checkboxes
- ✏️ Parâmetros editáveis
- 🖼️ Thumbnails dos exercícios exibidos
- 💾 Dados salvos e recuperados corretamente

---

### 4. 📝 Templates Reutilizáveis

**Como testar:**

#### Criar Template:
1. Preencher uma evolução completa (SOAP + condutas + exercícios)
2. Clicar em "Salvar como Template"
3. Dar nome: "Lombalgia Aguda - Teste"
4. Adicionar descrição (opcional)
5. Confirmar salvamento

#### Usar Template:
1. Iniciar nova evolução
2. Clicar em "Templates" no header
3. Ver lista de templates salvos
4. Verificar contador de uso
5. Clicar em um template
6. Verificar se campos são preenchidos automaticamente

#### Deletar Template:
1. Abrir lista de templates
2. Hover sobre um template
3. Clicar no ícone de lixeira
4. Confirmar deleção

**Resultado esperado:**
- 💾 Template salvo com sucesso
- 🔢 Contador de uso incrementado ao usar
- 📋 Todos os campos preenchidos automaticamente
- 🗑️ Deleção funcionando com confirmação
- 📊 Templates ordenados por uso mais frequente

---

### 5. 📸 Upload de Fotos de Progresso

**Como testar:**

#### Upload:
1. Na tab "Resposta + Fotos"
2. Clicar em "Adicionar Fotos"
3. Selecionar múltiplas fotos (2-3 fotos de diferentes tamanhos)
4. Verificar loading durante upload
5. Adicionar legendas nas fotos
6. Verificar preview em grid

#### Compressão:
1. Fazer upload de foto > 2MB
2. Verificar se é comprimida automaticamente
3. Verificar se foto muito grande (ex: 4000x3000) é redimensionada

#### Remoção:
1. Hover sobre uma foto
2. Clicar no X no canto superior direito
3. Confirmar remoção

**Resultado esperado:**
- 📤 Upload funcionando com múltiplas fotos
- 🔄 Loading state visível durante upload
- 🗜️ Compressão automática aplicada
- 🖼️ Preview em grid responsivo (2x4)
- ✏️ Legendas editáveis
- ❌ Remoção funcionando

**NOTA:** Para que o upload funcione em produção:
- ✅ Criar bucket `progress-photos` no Supabase Dashboard
- ✅ Configurar políticas RLS (ver instruções abaixo)

---

### 6. 📄 Exportação de PDF Profissional

**Como testar:**
1. Preencher evolução completa
2. Adicionar condutas e exercícios
3. Clicar em "Exportar PDF"
4. Aguardar geração (pode levar 2-3 segundos)
5. Verificar download automático
6. Abrir PDF e verificar conteúdo

**Verificar no PDF:**
- ✅ Cabeçalho com branding MoocaFisio
- ✅ Dados do paciente completos
- ✅ Informações da sessão (número, data, terapeuta)
- ✅ Seções SOAP formatadas
- ✅ Lista de condutas por categoria
- ✅ Tabela de exercícios prescritos
- ✅ Evolução da dor destacada
- ✅ Assinatura do terapeuta
- ✅ Rodapé com data de geração

**Nome do arquivo esperado:**
`evolucao_Nome_Paciente_DD-MM-AAAA.pdf`

---

## 🔧 Configuração do Storage (Para Produção)

### Criar Bucket no Supabase Dashboard

1. Acesse: [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Va para **Storage > Buckets**
4. Clique em **"Create Bucket"**
5. Configure:
   - **Name:** `progress-photos`
   - **Public:** ❌ NO (deixe desmarcado)
   - **File size limit:** `2097152` (2MB)
   - **Allowed MIME types:** 
     ```
     image/jpeg, image/png, image/webp, image/gif
     ```
6. Clique em **"Create bucket"**

### Configurar Políticas RLS

Após criar o bucket, adicione as políticas:

1. Va para **Storage > Policies**
2. Selecione o bucket `progress-photos`
3. Clique em **"New Policy"**

**Política 1: Upload**
```sql
Name: Therapists can upload progress photos
Target roles: authenticated
Operation: INSERT
Policy definition:
  bucket_id = 'progress-photos' 
  AND auth.role() = 'authenticated'
```

**Política 2: View**
```sql
Name: Therapists can view progress photos
Target roles: authenticated
Operation: SELECT
Policy definition:
  bucket_id = 'progress-photos' 
  AND auth.role() = 'authenticated'
```

**Política 3: Delete**
```sql
Name: Therapists can delete progress photos
Target roles: authenticated
Operation: DELETE
Policy definition:
  bucket_id = 'progress-photos' 
  AND auth.role() = 'authenticated'
```

---

## 🎯 Cenários de Teste Recomendados

### Cenário 1: Primeira Evolução de um Paciente Novo
1. Criar paciente novo
2. Criar primeira evolução
3. Verificar mensagem "Primeira sessão" na sidebar
4. Preencher SOAP completo
5. Adicionar 2-3 exercícios prescritos
6. Fazer upload de 1 foto
7. Salvar como template
8. Exportar PDF
9. Finalizar evolução

### Cenário 2: Evolução Usando Template
1. Abrir evolução para paciente existente
2. Clicar em "Templates"
3. Selecionar template salvo
4. Verificar preenchimento automático
5. Ajustar dados conforme necessário
6. Adicionar nova foto
7. Finalizar

### Cenário 3: Evolução com Comparação
1. Paciente com pelo menos 1 sessão anterior
2. Verificar dados da sessão anterior na sidebar
3. Ver comparação de dor (melhora/piora)
4. Clicar em "Ver Sessão Completa"
5. Preencher nova evolução
6. Exportar PDF comparativo

---

## 🐛 Troubleshooting

### ❌ Upload de Fotos Não Funciona

**Problema:** Erro ao fazer upload de fotos

**Soluções:**
1. Verificar se o bucket `progress-photos` foi criado
2. Verificar políticas RLS no bucket
3. Verificar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local
4. Ver console do navegador para erros detalhados

### ❌ Templates Não Aparecem

**Problema:** Lista de templates vazia

**Soluções:**
1. Verificar se criou pelo menos um template
2. Verificar se está logado com usuário correto
3. Verificar tabela `evolution_templates` no Supabase
4. Ver console para erros

### ❌ PDF Não Gera

**Problema:** Erro ao gerar PDF

**Soluções:**
1. Verificar se `@react-pdf/renderer` está instalado
2. Ver console do navegador para erros
3. Verificar dados do paciente e terapeuta
4. Tentar com evolução mais simples primeiro

### ❌ Timer Não Inicia

**Problema:** Timer fica em 00:00

**Soluções:**
1. Recarregar página
2. Verificar console para erros JavaScript
3. Verificar se componente SessionTimer está montado
4. Verificar estado do timerData

---

## 📊 Métricas de Sucesso

Após os testes, verifique:

- [ ] Timer funciona 100% das vezes
- [ ] Comparação exibe dados corretamente
- [ ] Exercícios são salvos e recuperados
- [ ] Templates são criados e aplicados
- [ ] Fotos são comprimidas e armazenadas
- [ ] PDF é gerado corretamente
- [ ] Todas funcionalidades integradas sem conflitos
- [ ] UX é fluida e intuitiva
- [ ] Sem erros no console do navegador
- [ ] Sem erros no servidor

---

## 📝 Relatório de Bugs

Se encontrar bugs, documente:

1. **O que aconteceu:** Descrição clara do problema
2. **O que esperava:** Comportamento esperado
3. **Passos para reproduzir:** Lista detalhada
4. **Console:** Erros no console do navegador
5. **Network:** Erros de requisição (F12 > Network)
6. **Screenshots:** Capturas de tela se possível

---

## 🎉 Conclusão

Todas as funcionalidades avançadas estão implementadas e prontas para teste!

**Próximos passos:**
1. ✅ Executar testes seguindo este guia
2. 📝 Documentar qualquer bug encontrado
3. 🚀 Deploy em staging para testes reais
4. 👥 Obter feedback dos usuários
5. 🎯 Ajustes finais antes de produção

**Desenvolvido para:** MoocaFisio  
**Data:** 2025-11-06  
**Status:** 🟢 PRONTO PARA TESTES

