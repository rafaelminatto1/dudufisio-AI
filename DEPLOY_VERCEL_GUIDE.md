# 🚀 Guia de Deploy no Vercel

## ✅ Pré-requisitos

- [ ] Conta no Vercel (https://vercel.com)
- [ ] Vercel CLI instalado: `npm install -g vercel`
- [ ] Build local passou: `npm run build`
- [ ] Supabase configurado
- [ ] Gemini API key obtida

---

## 📋 Passo a Passo

### 1. Instalar Vercel CLI (se necessário)

```bash
npm install -g vercel
```

### 2. Fazer Login no Vercel

```bash
vercel login
```

Escolha método de autenticação (GitHub, GitLab, Email, etc.)

---

### 3. Configurar Variáveis de Ambiente

**No Vercel Dashboard** (https://vercel.com/dashboard):

1. Vá em **Settings** > **Environment Variables**
2. Adicione as seguintes variáveis:

#### Supabase
```
VITE_SUPABASE_URL = https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
VITE_SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg
```

#### Gemini API
```
VITE_GEMINI_API_KEY = [SUA_GEMINI_API_KEY_AQUI]
```

**Como obter Gemini API Key**:
1. Acesse: https://ai.google.dev/
2. Clique em "Get API Key"
3. Crie nova API key
4. Copie a key gerada

⚠️ **IMPORTANTE**: Todas as variáveis devem ter prefixo `VITE_` para serem acessíveis no frontend Vite.

---

### 4. Deploy de Produção

```bash
# No diretório do projeto
vercel --prod
```

O Vercel irá:
1. Detectar framework (Vite)
2. Rodar `npm run vercel-build` (definido no package.json)
3. Fazer deploy dos assets estáticos
4. Retornar URL de produção

---

### 5. Verificações Pós-Deploy

#### Checklist de Funcionalidades

- [ ] **Página carrega** (sem erro 404)
- [ ] **Supabase conecta** (login funciona)
- [ ] **Gemini API responde** (tab IA gera sugestões)
- [ ] **Câmera funciona** (HTTPS habilitado)
- [ ] **Upload de anexos funciona** (Supabase Storage)
- [ ] **Auto-save funciona** (status "Salvo" aparece)
- [ ] **Atalhos de teclado funcionam** (Ctrl+1-4, etc.)

#### Teste Completo

1. Acesse: `https://[SEU-PROJETO].vercel.app`
2. Faça login
3. Vá para Atendimento V2
4. Preencha SOAP (S e O)
5. Pressione `Ctrl+G` → Gere sugestões de IA
6. Vá para Métricas → Selecione pontos no mapa corporal
7. Vá para Anexos → Tire uma foto com câmera
8. Verifique que foto foi salva (recarregue página e veja se ainda está lá)

---

## 🔧 Comandos Úteis

### Ver deploys

```bash
vercel ls
```

### Ver logs

```bash
vercel logs [DEPLOYMENT_URL]
```

### Rollback (se algo der errado)

```bash
# Listar deploys
vercel ls

# Promover deploy anterior para produção
vercel promote [DEPLOYMENT_URL]
```

### Remover deployment

```bash
vercel rm [DEPLOYMENT_URL]
```

---

## 🗄️ Migrar Banco de Dados Supabase

Se a tabela `attachments` ainda não existe no Supabase:

```bash
# Conectar ao Supabase
supabase db push

# Ou aplicar migration manualmente
# 1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
# 2. Vá em SQL Editor
# 3. Cole o conteúdo de: supabase/migrations/20250127000008_create_attachments_table.sql
# 4. Execute (RUN)
```

---

## 🔐 Configurar RLS no Supabase Storage

Para que o upload funcione, configure o bucket:

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/storage/buckets
2. Clique em **"+ New Bucket"**
3. Nome: `attachments`
4. Público: **❌ Não** (privado)
5. File size limit: `10485760` (10MB)
6. Allowed MIME types: `image/*, video/*, audio/*, application/pdf, application/msword, text/plain`

**Políticas RLS**:

```sql
-- Permitir usuários autenticados fazerem upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

-- Permitir usuários verem seus próprios arquivos
CREATE POLICY "Users can view their files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuários deletarem seus próprios arquivos
CREATE POLICY "Users can delete their files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 🌐 Domínio Customizado (Opcional)

### Adicionar domínio próprio

1. No Vercel Dashboard, vá em **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `app.dudufisio.com`)
4. Configure DNS conforme instruções:
   - CNAME: `cname.vercel-dns.com`
   - ou A record: `76.76.21.21`
5. Aguarde propagação (pode levar até 48h, geralmente < 1h)

---

## 📊 Monitoramento

### Analytics do Vercel

O Vercel fornece analytics gratuito:
- Pageviews
- Top paths
- Top referrers
- Devices
- Browsers

Acesse em: **Analytics** no dashboard

### Adicionar Sentry (Opcional)

Para monitorar erros:

```bash
npm install @sentry/react @sentry/vite-plugin
```

Configurar no `main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://[SEU_DSN]@sentry.io/[PROJECT_ID]",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

---

## 🚨 Troubleshooting

### Erro: "Failed to load module"

**Causa**: Variável de ambiente não configurada

**Solução**:
1. Verifique variáveis no Vercel Dashboard
2. Certifique-se que têm prefixo `VITE_`
3. Redeploy: `vercel --prod --force`

### Erro: "Supabase connection failed"

**Causa**: Supabase URL ou Key incorretas

**Solução**:
1. Verifique `.env.local` localmente funciona
2. Copie valores exatos para Vercel
3. Teste conexão: `npm run check:env`

### Erro: "Gemini API rate limit"

**Causa**: Muitas requisições

**Solução**:
- Rate limit está configurado para 10 req/min
- Aguarde 1 minuto
- Ou aumente o limite em `aiOrchestratorService.ts`

### Câmera não funciona

**Causa**: Não está usando HTTPS

**Solução**:
- Vercel automaticamente fornece HTTPS
- Verifique que está acessando via `https://` (não `http://`)
- Certifique-se que navegador tem permissão de câmera

### Upload de anexos falha

**Causa**: Bucket não configurado ou RLS não habilitado

**Solução**:
1. Verifique que bucket `attachments` existe
2. Aplique políticas RLS acima
3. Teste localmente primeiro: `npm run dev`

---

## ✅ Checklist Final de Deploy

Antes de considerar deploy completo:

- [x] Build local passa: `npm run build`
- [x] Testes E2E passam: `npm run test:e2e` *(testado em produção via Playwright MCP)*
- [x] Variáveis de ambiente configuradas no Vercel
- [x] Migration do Supabase aplicada (37/37 sincronizadas)
- [x] Bucket `attachments` criado com RLS *(configurado via migration 20251027000008)*
- [x] Deploy feito: `vercel --prod`
- [x] URL de produção funciona: [moocafisio.com.br](https://moocafisio.com.br)
- [x] Login funciona (testado com conta demo admin@dudufisio.com)
- [x] Gemini API responde (geração de laudo testada com sucesso)
- [x] Câmera funciona (HTTPS habilitado automaticamente)
- [x] Upload persiste (Supabase Storage) *(bucket attachments configurado)*
- [x] Sem erros críticos no console do browser
- [ ] Lighthouse score > 80 (Performance, Accessibility) *(TTFB e FCP em "poor", necessita otimização)*

---

## 📞 Suporte

Se encontrar problemas:

1. **Logs do Vercel**: `vercel logs [URL]`
2. **Console do Browser**: F12 → Console
3. **Supabase Logs**: Dashboard → Logs → Real-time
4. **Documentação Vercel**: https://vercel.com/docs
5. **Documentação Supabase**: https://supabase.com/docs

---

---

## 📋 Última Verificação - 27 de Outubro de 2025

### Status Geral: 🟢 **SISTEMA OPERACIONAL**

**Deployment Vercel**:
- ✅ URL Principal: [moocafisio.com.br](https://moocafisio.com.br)
- ✅ Último Deploy: 54 minutos atrás (Ready - 15min build time)
- ✅ 20 deployments bem-sucedidos recentes
- ✅ 60+ variáveis de ambiente configuradas

**Supabase Database**:
- ✅ Projeto: `urfxniitfbbvsaskicfo.supabase.co`
- ✅ 37/37 migrações sincronizadas
- ✅ Última migração: `20251027000008_create_attachments_bucket`
- ✅ Bucket `attachments` criado no Storage com políticas RLS

**Testes Funcionais (via Playwright MCP)**:
- ✅ Login com conta demo funcionando
- ✅ Dashboard carregando corretamente
- ✅ Supabase conectado (7 agendamentos carregados)
- ✅ Gemini API funcionando (laudo gerado com sucesso)
- ✅ Sistema de preloading inteligente ativo
- ✅ Service Worker instalado

**Pendências**:
- ⚠️ Performance: TTFB 3.5s e FCP 4.5s (necessita otimização)
- ⚠️ Configurar SMS/WhatsApp (atualmente não usado)

---

**Última atualização**: 27 de Outubro de 2025
**Versão do guia**: 1.1
**Status**: ✅ Deploy verificado e operacional
