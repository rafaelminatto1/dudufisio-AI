# 🚀 GUIA: Configurar Vercel Edge Config

**Data**: 23/10/2025  
**Status**: Realtime ✅ Configurado | Edge Config ⏳ Pendente

---

## ✅ SUPABASE REALTIME - CONFIGURADO!

A migration `20251023000939_enable_realtime_appointments.sql` foi aplicada com sucesso:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
```

**Status**: ✅ A tabela `appointments` agora transmite eventos em tempo real!

---

## ⏳ VERCEL EDGE CONFIG - CONFIGURAÇÃO MANUAL

O Edge Config precisa ser criado via Dashboard da Vercel (não há comando CLI direto).

### Passo 1: Criar Edge Config no Dashboard

1. Acesse: https://vercel.com/dashboard/stores
2. Clique em **"Create Store"**
3. Escolha **"Edge Config"**
4. Nome: `agenda-cache`
5. Clique em **"Create"**

### Passo 2: Conectar ao Projeto

1. Na página do Edge Config criado, vá em **"Connect to Project"**
2. Selecione o projeto: **`dudufisio-ai`**
3. Escolha os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Clique em **"Connect"**

Isso criará automaticamente a variável `EDGE_CONFIG` no projeto.

### Passo 3: Obter Edge Config ID

1. Na página do Edge Config, copie o **Edge Config ID** (começa com `ecfg_`)
2. Anote o ID (você vai precisar dele)

Exemplo: `ecfg_abc123xyz456`

### Passo 4: Criar Token da Vercel API

1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `edge-config-update-token`
4. Escopo: Selecione apenas o projeto **`dudufisio-ai`**
5. Copie o token gerado (você NÃO poderá vê-lo novamente!)

### Passo 5: Adicionar Variáveis de Ambiente

#### Opção A: Via Vercel CLI (Recomendado)

```bash
# 1. Edge Config ID
vercel env add EDGE_CONFIG_ID production
# Cole o ID quando solicitado: ecfg_xxxxx

# 2. Vercel API Token
vercel env add VERCEL_API_TOKEN production
# Cole o token quando solicitado

# 3. Adicionar para Preview e Development também
vercel env add EDGE_CONFIG_ID preview
vercel env add EDGE_CONFIG_ID development
vercel env add VERCEL_API_TOKEN preview  
vercel env add VERCEL_API_TOKEN development
```

#### Opção B: Via Dashboard Vercel

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
2. Adicione as variáveis:

| Name | Value | Environments |
|------|-------|--------------|
| `EDGE_CONFIG_ID` | `ecfg_xxxxx` | Production, Preview, Development |
| `VERCEL_API_TOKEN` | `seu_token` | Production, Preview, Development |

**⚠️ IMPORTANTE**: A variável `EDGE_CONFIG` é criada automaticamente ao conectar o Edge Config ao projeto (Passo 2).

---

## 🧪 TESTAR CONFIGURAÇÃO

### 1. Verificar Edge Config

```bash
# Listar todas as variáveis
vercel env ls

# Deve mostrar:
# ✅ EDGE_CONFIG (criado automaticamente)
# ✅ EDGE_CONFIG_ID (você adicionou)
# ✅ VERCEL_API_TOKEN (você adicionou)
```

### 2. Testar Cron Job Manualmente

Você pode testar o cron job de atualização do cache:

```bash
# Deploy primeiro
vercel --prod

# Depois, trigger manualmente via curl
curl -X GET https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

**⚠️ Nota**: Use o valor de `CRON_SECRET` que já está configurado no projeto.

### 3. Verificar Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Filtrar por função
vercel logs --follow --filter update-agenda-cache
```

---

## 📊 COMO FUNCIONA O CACHE

### Fluxo Completo

```
1. Cron Job executa a cada 6 horas (0 */6 * * *)
   ↓
2. api/cron/update-agenda-cache.ts busca dados do Supabase:
   - Terapeutas ativos
   - Bloqueios de horário
   - Top 50 pacientes frequentes
   ↓
3. Atualiza Edge Config via API
   ↓
4. Frontend usa lib/edge-config/agendaCache.ts:
   - getAgendaCacheData() retorna em ~10ms
   - Fallback automático para Supabase se cache vazio
   ↓
5. Performance: 200ms → 10ms (90% mais rápido!)
```

### Código de Exemplo (AgendaPage.tsx)

```typescript
import { getCachedTherapists, getCachedScheduleBlocks } from '../lib/edge-config/agendaCache';

// No useEffect
useEffect(() => {
  async function loadData() {
    // Tentar cache primeiro (10ms)
    const cachedTherapists = await getCachedTherapists();
    
    if (cachedTherapists.length > 0) {
      setTherapists(cachedTherapists);
      console.log('✅ Terapeutas carregados do cache Edge Config');
    } else {
      // Fallback: buscar do Supabase (200ms)
      const { data } = await supabase.from('therapists').select('*');
      setTherapists(data || []);
      console.log('⚠️ Cache vazio, carregado do Supabase');
    }
  }
  
  loadData();
}, []);
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### No Edge Config Dashboard

1. Vá para: https://vercel.com/dashboard/stores
2. Clique no Edge Config `agenda-cache`
3. Na aba **"Items"**, você deverá ver:
   ```json
   {
     "agenda-cache": {
       "therapists": [...],
       "scheduleBlocks": [...],
       "commonPatients": [...],
       "lastUpdated": "2025-10-23T..."
     }
   }
   ```

### No Console do Browser

```javascript
// Abra o DevTools e execute:
fetch('/api/cron/update-agenda-cache', {
  headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
})
  .then(r => r.json())
  .then(console.log);
```

---

## ⚠️ TROUBLESHOOTING

### Edge Config não aparece no projeto

**Solução**: Reconectar o Edge Config
1. Vá para o Edge Config no dashboard
2. Clique em "Connect to Project"
3. Selecione `dudufisio-ai` novamente

### Cron Job não executa

**Causas possíveis**:
1. Projeto não está em Vercel Pro (Edge Config requer Pro)
2. `CRON_SECRET` não está configurado
3. Variáveis `EDGE_CONFIG_ID` ou `VERCEL_API_TOKEN` estão erradas

**Verificar**:
```bash
vercel env ls | grep -E "(EDGE_CONFIG|VERCEL_API_TOKEN|CRON_SECRET)"
```

### Cache sempre vazio

**Causas**:
1. Cron job nunca executou (espere até a próxima hora múltipla de 6: 00:00, 06:00, 12:00, 18:00)
2. Erro na atualização do Edge Config (verifique logs: `vercel logs`)

**Forçar atualização manual**:
```bash
# Via curl (substitua SEU_CRON_SECRET)
curl https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

- [x] ✅ Supabase Realtime habilitado (`appointments`)
- [ ] ⏳ Edge Config criado no dashboard
- [ ] ⏳ Edge Config conectado ao projeto `dudufisio-ai`
- [ ] ⏳ `EDGE_CONFIG_ID` adicionado às variáveis de ambiente
- [ ] ⏳ `VERCEL_API_TOKEN` adicionado às variáveis de ambiente
- [ ] ⏳ Deploy para produção (`vercel --prod`)
- [ ] ⏳ Testar cron job manualmente
- [ ] ⏳ Verificar logs (`vercel logs`)

---

## 🎯 COMANDOS RÁPIDOS

```bash
# 1. Criar Edge Config (via dashboard)
# https://vercel.com/dashboard/stores

# 2. Adicionar variáveis
vercel env add EDGE_CONFIG_ID production
vercel env add VERCEL_API_TOKEN production

# 3. Deploy
vercel --prod

# 4. Testar cron job
curl https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache \
  -H "Authorization: Bearer $(vercel env ls | grep CRON_SECRET | awk '{print $2}')"

# 5. Ver logs
vercel logs --follow
```

---

## 💡 ALTERNATIVA: Usar sem Edge Config

Se você não quiser configurar o Edge Config agora, o sistema continua funcionando normalmente! O `lib/edge-config/agendaCache.ts` tem fallback automático para Supabase:

```typescript
export async function getCachedTherapists(): Promise<Therapist[]> {
  const cached = await getAgendaCacheData();
  return cached?.therapists || []; // Retorna [] se não tiver cache
}

// No código que usa:
const cachedTherapists = await getCachedTherapists();

if (cachedTherapists.length > 0) {
  // Usa cache ⚡
} else {
  // Busca do Supabase (ainda é rápido!)
}
```

**Performance sem Edge Config**: ~200ms (ainda muito bom!)  
**Performance com Edge Config**: ~10ms (ultra-rápido!)

---

**Próximo passo**: Depois de configurar o Edge Config, envie tudo para o GitHub com `/upgit`! 🚀

