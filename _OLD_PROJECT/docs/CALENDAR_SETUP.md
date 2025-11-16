## Guia passo a passo — Integração de Calendário (Google + fallback ICS)

Este guia mostra exatamente o que você precisa fazer para ativar a integração de calendário com foco em:
- Google Calendar real via Service Account (criar/atualizar/cancelar eventos automaticamente)
- Fallback ICS por e‑mail (compatível com qualquer agenda)

Com ~800 atendimentos/mês, esta configuração opera sem custos práticos (Google Calendar API gratuita e envio por Gmail dentro dos limites diários).

---

### 1) Visão geral da estratégia
- **Primário: Google Calendar (Service Account + calendário compartilhado)**
  - Melhor compatibilidade, automação total, sem billing para Calendar API.
- **Secundário (fallback): ICS por e‑mail via SMTP (Gmail)**
  - Funciona em qualquer cliente de calendário, custo zero no Gmail (limites diários).
- Outlook fica desativado por enquanto.

No código já existe detecção por variáveis de ambiente. Se Google não estiver configurado, o sistema cai no ICS automaticamente.

---

### 2) Pré‑requisitos
- Acesso a uma conta Google (para criar o projeto no Google Cloud e usar o Google Calendar alvo).
- Acesso ao calendário que receberá os eventos (pode ser o calendário de uma conta Google individual ou do Workspace).
- Acesso ao Gmail para envio de e‑mails (caso utilize o fallback ICS por e‑mail).

---

### 3) Passo a passo — Google Calendar (Service Account)

1. **Criar projeto no Google Cloud e ativar a API**
   - Acesse o Console Google Cloud.
   - Crie um projeto (ou selecione um existente).
   - Vá em “APIs e Serviços” → “Biblioteca” → ative “Google Calendar API”.

2. **Criar uma Service Account e gerar a chave JSON**
   - “IAM e Admin” → “Contas de serviço” → “Criar conta de serviço”.
   - Conclua a criação (não precisa concessão de papéis especiais para Calendar; a permissão virá via compartilhamento do calendário).
   - Após criar, “Gerenciar chaves” → “Adicionar chave” → “Criar nova chave” → JSON. Baixe o arquivo, por exemplo `key.json`.

3. **Compartilhar o calendário alvo com a Service Account** (caminho simples e recomendado)
   - Abra o Google Calendar do calendário que receberá os eventos.
   - “Configurações” (ícone de engrenagem) → selecione o calendário desejado (coluna esquerda) → “Compartilhar com pessoas e grupos”.
   - Adicione o `client_email` da Service Account (ex.: `service@project.iam.gserviceaccount.com`).
   - Permissão: “Fazer alterações em eventos”.

4. **Obter o Calendar ID**
   - Ainda nas Configurações do calendário → seção “Integrar agenda”.
   - Copie o “ID da agenda” (geralmente é um e‑mail do calendário ou um identificador longo).

5. **Definir variáveis de ambiente**
   - No arquivo `.env.local` (na raiz do projeto), defina:
   ```bash
   # Google (primário)
   GOOGLE_CALENDAR_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\\n...\\n-----END PRIVATE KEY-----\n","client_email":"service@project.iam.gserviceaccount.com","client_id":"...","token_uri":"https://oauth2.googleapis.com/token"}
   GOOGLE_CALENDAR_ID=COLE_AQUI_O_ID_DA_AGENDA
   ```
   - Dica para evitar problemas de quebra de linha da `private_key`:
     - Se você tem `key.json`, gere o JSON compacto com o `jq` e cole no `.env.local`:
     ```bash
     echo GOOGLE_CALENDAR_SERVICE_ACCOUNT="$(jq -c . < key.json)" >> .env.local
     echo GOOGLE_CALENDAR_ID="seu_calendar_id_aqui" >> .env.local
     ```

---

### 4) Passo a passo — Fallback ICS por e‑mail (SMTP Gmail)

1. **Ativar verificação em 2 etapas do Gmail** (conta que enviará os e‑mails).
2. **Criar uma “Senha de app”**
   - Conta Google → Segurança → “Senhas de app”.
   - Tipo de app: E‑mail; Dispositivo: Outro (defina um nome, ex.: `DuduFisio ICS`).
   - Guarde a senha gerada (16 caracteres).
3. **Definir variáveis de ambiente** (no `.env.local`):
   ```bash
   # ICS por e‑mail (fallback)
   CALENDAR_FROM_EMAIL=noreply@dudufisio.com
   CALENDAR_FROM_NAME=DuduFisio
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=senha_de_app_gerada
   ```
   Observação: Gmail costuma permitir ~500 envios/dia, suficiente para 800/mês.

---

### 5) Dependências (caso falte alguma)
```bash
npm install googleapis ics bull nodemailer @types/nodemailer redis
```

> O projeto já inclui a maior parte dessas libs. Se o `npm install` não adicionar nada, está tudo certo.

---

### 6) Migração de banco (Supabase)
Há uma migração criada para o schema de integração de calendário:
- `supabase/migrations/20250102000000_create_calendar_integration_schema.sql`

Para aplicar:
```bash
npm run db:migrate
```

---

### 7) Reiniciar a aplicação
Após configurar o `.env.local`, reinicie o servidor para carregar as novas variáveis.

---

### 8) Como o sistema decide o provider
- Se existir `GOOGLE_CALENDAR_SERVICE_ACCOUNT` e `GOOGLE_CALENDAR_ID`, o sistema usa **Google**.
- Caso contrário, usa **ICS** automaticamente como fallback.

As variáveis são lidas em `lib/integrations/calendar/index.ts`:
```251:257:lib/integrations/calendar/index.ts
      serviceAccount: process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT
        ? JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT)
        : null,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary'
```

---

### 9) Validação rápida (opcional)
Após definir as variáveis, você pode validar a conexão Google com um teste simples (por exemplo, em um script temporário):
```ts
import { CalendarFactory } from '@/lib/integrations/calendar';

async function main() {
  const config = {
    serviceAccount: JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT!),
    calendarId: process.env.GOOGLE_CALENDAR_ID
  } as any;

  const res = await CalendarFactory.testProvider('google', config);
  console.log(res);
}

main().catch(console.error);
```
Se preferir, eu adiciono um script pronto no repositório para você rodar com um comando.

---

### 10) Operação e métricas
Você pode consultar métricas e health checks expostos pelo manager:
```ts
import { calendarManager } from '@/lib/integrations/calendar';

const metrics = calendarManager.getMetrics();
const health = calendarManager.getHealthStatus();
console.log(metrics, health);
```

---

### 11) Custos e limites
- **Google Calendar API**: gratuita para este caso de uso (sem billing), sujeita a quotas padrão.
- **Gmail (SMTP)**: gratuito com limites (típico ~500 e‑mails/dia).
- **Redis**: local é gratuito; serviços gerenciados podem ser pagos (opcional).

---

### 12) Checklist final
- [ ] Criei o projeto no Google Cloud e ativei a Google Calendar API
- [ ] Criei a Service Account e baixei `key.json`
- [ ] Compartilhei o calendário alvo com o `client_email` da Service Account (perm.: “Fazer alterações”)
- [ ] Copiei o Calendar ID (Configurações → Integrar agenda)
- [ ] Preenchi `.env.local` com `GOOGLE_CALENDAR_SERVICE_ACCOUNT` e `GOOGLE_CALENDAR_ID`
- [ ] Configurei o fallback ICS por e‑mail (opcional, recomendado)
- [ ] Rodei `npm run db:migrate`
- [ ] Reiniciei a aplicação

Se marcou tudo e quiser, me envie as chaves (sem publicar em repositórios) que eu ativo os testes e, se desejar, troco o driver Google do modo mock para o `googleapis` real.

---

### 13) Troubleshooting rápido
- **Google 403 (Permission denied)**: verifique se o calendário foi compartilhado com o `client_email` da Service Account com permissão de alteração.
- **Google 404 (Calendar not found)**: confirme o `GOOGLE_CALENDAR_ID` (copiado da seção “Integrar agenda”).
- **Falha ao parsear `GOOGLE_CALENDAR_SERVICE_ACCOUNT`**: garanta que o JSON está em **uma linha** (use `jq -c`).
- **ICS não envia e‑mail**: confira `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (senha de app) e conectividade SMTP.


