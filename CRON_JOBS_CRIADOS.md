# ✅ Cron Jobs Criados

## 📅 Endpoints Criados

### 1. Lembretes Diários
**Arquivo:** `src/app/api/cron/lembretes-diarios/route.ts`

**Funcionalidade:**
- Processa lembretes de consultas agendadas
- Envia notificações para pacientes
- Atualiza status de lembretes enviados

**Schedule:** Segunda a Sexta às 9h (horário de Brasília)
- Configurado em `vercel.json`: `"0 9 * * 1-5"`

**Autenticação:**
- Requer `CRON_SECRET` no header `Authorization: Bearer {CRON_SECRET}`
- Verifica autenticação antes de processar

**Processamento:**
- Busca consultas agendadas para hoje e amanhã
- Filtra apenas consultas com status `scheduled` e `reminder_sent = false`
- Marca como enviado após processamento

### 2. Backup do Banco de Dados
**Arquivo:** `src/app/api/cron/backup-database/route.ts`

**Funcionalidade:**
- Cria backup incremental do banco de dados
- Registra backup na tabela `backups` (se existir)
- Coleta estatísticas do banco

**Schedule:** Diariamente às 2h (horário de Brasília)
- Configurado em `vercel.json`: `"0 2 * * *"`

**Autenticação:**
- Requer `CRON_SECRET` no header `Authorization: Bearer {CRON_SECRET}`
- Verifica autenticação antes de processar

**Processamento:**
- Coleta estatísticas das tabelas principais
- Cria registro de backup
- Calcula tamanho estimado do backup

## 🔐 Configuração Necessária

### Variável de Ambiente

Certifique-se de que `CRON_SECRET` está configurado no Vercel:

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
2. Adicione ou verifique:
   - **Nome:** `CRON_SECRET`
   - **Valor:** Uma string aleatória segura (ex: gerada com `openssl rand -hex 32`)
   - **Ambientes:** Production, Preview, Development

### Gerar CRON_SECRET

```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## ✅ Status

- ✅ Endpoint `/api/cron/lembretes-diarios` criado
- ✅ Endpoint `/api/cron/backup-database` criado
- ✅ Configuração no `vercel.json` já existe
- ⚠️ Verificar se `CRON_SECRET` está configurado no Vercel

## 🧪 Testar Manualmente

### Testar Lembretes Diários

```bash
curl -X GET \
  "https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/lembretes-diarios" \
  -H "Authorization: Bearer SEU_CRON_SECRET_AQUI"
```

### Testar Backup

```bash
curl -X GET \
  "https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/backup-database" \
  -H "Authorization: Bearer SEU_CRON_SECRET_AQUI"
```

## 📝 Próximos Passos

1. ✅ Endpoints criados
2. ⚠️ Configurar `CRON_SECRET` no Vercel (se ainda não estiver)
3. ⏳ Aguardar execução automática dos cron jobs
4. 📊 Monitorar logs no Vercel Dashboard

---

**Criado em:** 17/11/2025

