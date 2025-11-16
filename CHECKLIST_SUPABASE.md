# ✅ Checklist de Configuração do Supabase + Prisma

## 🔍 Problema Atual

A conexão com o banco de dados do Supabase está falhando. Vamos verificar passo a passo:

## 📋 Checklist

### 1. ✅ Verificar se o Projeto está Ativo

- [ ] Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- [ ] Verifique se o projeto está **ACTIVE** (não pausado)
- [ ] Se estiver pausado, clique em **"Restore project"**

> ⚠️ **Importante**: Projetos do Supabase Free Tier podem ser pausados após 7 dias de inatividade

### 2. 🔐 Verificar Configurações de Rede

#### Opção A: Permitir Todas as Conexões (Desenvolvimento)

- [ ] Vá para: **Settings** → **Database** → **Connection Pooling**
- [ ] Em **"Network restrictions"**, adicione: `0.0.0.0/0`
- [ ] Salve as alterações

#### Opção B: Adicionar IP Específico

- [ ] Descubra seu IP público: https://whatismyipaddress.com/
- [ ] Adicione seu IP na whitelist do Supabase
- [ ] Formato: `SEU.IP.AQUI.XXX/32`

### 3. 📝 Copiar a String de Conexão Correta

- [ ] Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/database
- [ ] Role até **"Connection string"**
- [ ] Clique na aba **"URI"**
- [ ] Copie a string completa (ela já vem com o formato correto)
- [ ] **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` por: `cFfS1GEwkj2fOAE2`

### 4. 🔄 Atualizar o Arquivo .env

Edite o arquivo `.env` na raiz do projeto:

```bash
# Cole a string de conexão que você copiou do dashboard
DATABASE_URL=postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres
```

### 5. 🧪 Testar a Conexão

Execute no terminal:

```bash
# Testar conexão
npm run prisma:pull

# Se funcionar, você verá:
# ✔ Introspected X models and Y enums from the database
```

### 6. 🎯 Alternativa: Usar Connection Pooler

Se a conexão direta (porta 5432) não funcionar, tente com o pooler (porta 6543):

```bash
# No .env, use:
DATABASE_URL=postgresql://postgres.urfxniitfbbvsaskicfo:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

> **Nota**: Substitua `[PASSWORD]` pela senha real e verifique a região correta no dashboard

### 7. 🔐 Segredos para WhatsApp + Firebase (sem SMS)

- [ ] Regra permanente: **não habilitar canal SMS**. Todos os envs devem operar apenas com Push, WhatsApp e Email.
- [ ] Via CLI, aplicar credenciais reais (exemplo abaixo considera projeto `urfxniitfbbvsaskicfo`):

```bash
supabase secrets set \
  WHATSAPP_API_URL="https://graph.facebook.com/v20.0" \
  WHATSAPP_PHONE_NUMBER_ID="XXXXXX" \
  WHATSAPP_ACCESS_TOKEN="EAA..." \
  FIREBASE_SERVICE_ACCOUNT="$(cat firebase-service-account.json)" \
  FIREBASE_PROJECT_ID="seu-projeto-firebase" \
  --project-ref urfxniitfbbvsaskicfo
```

- [ ] Confirmar no Dashboard → Project Settings → API → Secrets que `send-whatsapp` não está mais em modo mock (logs devem mostrar `sent > 0`).
- [ ] Registrar o comando utilizado neste checklist para facilitar futuros replays.

### 8. ⏱️ Cron + Settings remotos

- [x] Validar se o job do pg_cron está ativo (job `process_appointment_reminders_every_5m` recriado localmente em 15/11/2025):

```sql
SELECT * FROM cron.job WHERE jobname = 'process_appointment_reminders_every_5m';
```

- [x] Confirmar que `app.settings.functions_base_url` e `app.supabase_service_role_key` apontam para o ambiente correto:

```sql
SELECT current_setting('app.settings.functions_base_url', true);
SELECT current_setting('app.supabase_service_role_key', true);
```

- [x] Ajustar se necessário:

```sql
ALTER DATABASE postgres SET app.settings.functions_base_url = 'https://<novo-ref>.functions.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = '<service-role-key-do-ambiente>';
```

### 9. 💳 Stripe, Resend e demais integrações

- [x] Verificar se as variáveis `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` e `WHATSAPP_*` estão cadastradas no Supabase e Vercel.
- [x] Configurado em 15/11/2025 via `vercel env add` e `supabase secrets set`:
  - ✅ `STRIPE_SECRET_KEY` configurado no Vercel (Production) e Supabase
  - ✅ `STRIPE_WEBHOOK_SECRET` configurado no Vercel (Production) e Supabase
  - ✅ `WHATSAPP_ACCESS_TOKEN` configurado no Vercel (Production) e Supabase
  - ✅ `WHATSAPP_PHONE_NUMBER_ID` configurado no Supabase
  - ✅ `WHATSAPP_BUSINESS_ACCOUNT_ID` configurado no Supabase
  - ✅ `WHATSAPP_API_URL` configurado no Supabase
  - ✅ `WHATSAPP_DEFAULT_NUMBER` configurado no Vercel (Production) e Supabase
  - ✅ `OPENAI_API_KEY` configurado no Vercel (Production) e Supabase
  - ✅ `GEMINI_API_KEY` configurado no Vercel (Production) e Supabase
  - ✅ `WHATSAPP_METRICS_BYPASS_TOKEN` configurado no Vercel (Production)
  - ℹ️ `RESEND_API_KEY` já estava configurada anteriormente no Vercel (Production, Preview, Development) e Supabase (52 dias atrás)
- [ ] Após atualizar credenciais, executar:

```bash
supabase db push --project-ref urfxniitfbbvsaskicfo
```

- [ ] Testar o wrapper chamando o serviço diretamente:

```ts
await fetchStripeCustomerPayments({ patientId: '<uuid>' });
```

- [ ] Conferir resultados na view `vw_stripe_customer_payments`:

```sql
SELECT * FROM vw_stripe_customer_payments LIMIT 20;
```

- [ ] Documentar eventuais ajustes na migration se o schema do wrapper não for `stripe`.

## 🔧 Comandos Úteis

```bash
# Verificar conexão
npm run prisma:pull

# Gerar Prisma Client
npm run prisma:generate

# Abrir interface visual
npm run prisma:studio

# Ver informações do Prisma
npx prisma --version
```

## ❓ Troubleshooting Comum

### Erro: "Can't reach database server"

**Causas possíveis:**
1. ✅ Projeto pausado no Supabase
2. ✅ IP bloqueado (não está na whitelist)
3. ✅ Firewall/proxy corporativo bloqueando porta 5432
4. ✅ String de conexão incorreta

**Soluções:**
- Ative o projeto no dashboard
- Adicione `0.0.0.0/0` nas configurações de rede
- Tente usar VPN se estiver em rede corporativa
- Use o connection pooler (porta 6543) em vez da porta 5432

### Erro: "Tenant or user not found"

**Causas possíveis:**
1. ✅ Formato do username incorreto
2. ✅ Senha incorreta

**Solução:**
- Use o formato: `postgres:senha@host` (não `postgres.projeto:senha@host`)
- Verifique se a senha está correta no dashboard

### Erro: "Authentication failed"

**Causas possíveis:**
1. ✅ Senha incorreta

**Solução:**
- Vá para: **Settings** → **Database** → **Database password**
- Resete a senha se necessário
- Atualize o `.env` com a nova senha

## 📞 Próximos Passos

Após conseguir conectar:

1. **Gerar o Client:**
   ```bash
   npm run prisma:generate
   ```

2. **Explorar o banco:**
   ```bash
   npm run prisma:studio
   ```

3. **Sincronizar schema:**
   ```bash
   npm run prisma:pull
   ```

## 📚 Links Úteis

- [Dashboard do Projeto](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo)
- [Configurações do Banco](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/database)
- [Documentação Supabase + Prisma](https://supabase.com/docs/guides/integrations/prisma)
- [Documentação Prisma](https://www.prisma.io/docs)

---

## 🆘 Precisa de Ajuda?

Se ainda não conseguir conectar:

1. Verifique se o projeto está ACTIVE
2. Adicione `0.0.0.0/0` na whitelist
3. Copie a connection string EXATAMENTE do dashboard
4. Tente usar o connection pooler (porta 6543)

---

**Configurado em**: 06/11/2025  
**Projeto**: dudufisio-AI (urfxniitfbbvsaskicfo)

