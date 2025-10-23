# 🔧 EDGE CONFIG - CONFIGURAÇÃO MANUAL NECESSÁRIA

**Status**: ⚠️ A Vercel CLI não possui comando para criar Edge Config  
**Solução**: Configuração via Dashboard Web

---

## ⚠️ IMPORTANTE

O comando `vercel edge-config create` **NÃO EXISTE** na CLI atual (v48.2.9).

Edge Configs precisam ser criados via **Dashboard Web da Vercel**.

---

## 📝 PASSO A PASSO DETALHADO

### 1. Acessar Dashboard de Stores

🔗 **Link direto**: https://vercel.com/rafael-minattos-projects/stores

Ou navegue:
1. https://vercel.com/dashboard
2. Selecione seu team: `rafael-minattos-projects`
3. Clique em "Storage" no menu lateral
4. Clique em "Create Store"

### 2. Criar Edge Config

1. **Tipo**: Selecione "Edge Config"
2. **Name**: `agenda-cache`
3. **Region**: Auto (global distribution)
4. Clique em **"Create Store"**

### 3. Conectar ao Projeto

1. Na página do Edge Config criado, clique em **"Connect to Project"**
2. Selecione o projeto: **`dudufisio-ai`**
3. Marque os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)
4. Clique em **"Connect"**

✅ Isso criará automaticamente a variável `EDGE_CONFIG` em todas as envs.

### 4. Copiar Edge Config ID

Na página do Edge Config:
1. Procure por **"Edge Config ID"**
2. Copie o ID (formato: `ecfg_xxxxxxxxxxxxxx`)
3. Guarde este ID, você vai precisar dele!

### 5. Criar Token da API Vercel

🔗 **Link direto**: https://vercel.com/account/tokens

1. Clique em **"Create Token"**
2. **Token Name**: `dudufisio-edge-config-token`
3. **Scope**:
   - Selecione apenas o projeto `dudufisio-ai`
   - Permissions: Full Access (ou no mínimo Read/Write)
4. Clique em **"Create Token"**
5. **⚠️ COPIE O TOKEN IMEDIATAMENTE** (você não poderá vê-lo novamente!)

### 6. Adicionar Variáveis de Ambiente

Use a CLI para adicionar as variáveis:

```bash
# 1. Edge Config ID
vercel env add EDGE_CONFIG_ID

# Quando solicitado:
# - Name: EDGE_CONFIG_ID
# - Value: ecfg_xxxxxxxxxxxxxx (cole o ID copiado)
# - Environments: Production, Preview, Development
```

```bash
# 2. Vercel API Token
vercel env add VERCEL_API_TOKEN

# Quando solicitado:
# - Name: VERCEL_API_TOKEN
# - Value: (cole o token copiado)
# - Environments: Production, Preview, Development
```

### 7. Verificar Configuração

```bash
vercel env ls | grep -E "(EDGE_CONFIG|VERCEL_API_TOKEN)"
```

Deve mostrar:
```
✅ EDGE_CONFIG (criado automaticamente ao conectar)
✅ EDGE_CONFIG_ID (você adicionou)
✅ VERCEL_API_TOKEN (você adicionou)
```

---

## 🧪 TESTE RÁPIDO (Após Deploy)

### Testar Cron Job

```bash
# 1. Deploy primeiro
vercel --prod

# 2. Pegar URL de produção
PROD_URL=$(vercel ls | grep dudufisio-ai | head -1 | awk '{print $2}')

# 3. Pegar CRON_SECRET
CRON_SECRET=$(vercel env ls | grep CRON_SECRET | awk '{print $2}')

# 4. Testar endpoint
curl -X GET https://$PROD_URL/api/cron/update-agenda-cache \
  -H "Authorization: Bearer $CRON_SECRET"
```

Resposta esperada:
```json
{
  "success": true,
  "cached": true,
  "data": {
    "therapists": [...],
    "scheduleBlocks": [...],
    "commonPatients": [...],
    "lastUpdated": "2025-10-23T..."
  }
}
```

### Verificar Edge Config

1. Vá para: https://vercel.com/rafael-minattos-projects/stores
2. Clique em `agenda-cache`
3. Aba **"Items"**
4. Deve aparecer:
   ```json
   {
     "agenda-cache": {
       "therapists": [...],
       "scheduleBlocks": [...],
       "lastUpdated": "..."
     }
   }
   ```

---

## 🎯 POR QUE EDGE CONFIG?

### Sem Edge Config (Atual)
- Carregamento: ~200ms (Supabase query)
- Latência: Depende da região do Supabase
- Requests: 1 por página load

### Com Edge Config (Otimizado)
- Carregamento: ~10ms (cache distribuído globalmente)
- Latência: <10ms de qualquer lugar do mundo
- Requests: 0 ao Supabase (reduz custos)
- Cache: Atualizado a cada 6h automaticamente

### Diferença Visual
- **Sem**: Agenda demora 200-300ms para carregar terapeutas
- **Com**: Agenda aparece instantaneamente (<10ms)

---

## ⚠️ OBSERVAÇÃO IMPORTANTE

O sistema **FUNCIONA PERFEITAMENTE SEM EDGE CONFIG**!

O código em `lib/edge-config/agendaCache.ts` tem **fallback automático**:

```typescript
export async function getCachedTherapists(): Promise<Therapist[]> {
  const cached = await getAgendaCacheData(); // Tenta Edge Config
  return cached?.therapists || []; // Retorna [] se não tiver
}

// No código que usa:
const cachedTherapists = await getCachedTherapists();

if (cachedTherapists.length > 0) {
  setTherapists(cachedTherapists); // ⚡ Ultra-rápido
} else {
  // Busca do Supabase normalmente (ainda é rápido!)
  const { data } = await supabase.from('therapists').select('*');
  setTherapists(data || []);
}
```

**Conclusão**: Edge Config é uma **otimização de performance**, não um requisito funcional.

---

## 📋 CHECKLIST

- [ ] Acessar https://vercel.com/rafael-minattos-projects/stores
- [ ] Criar Edge Config com nome `agenda-cache`
- [ ] Conectar ao projeto `dudufisio-ai`
- [ ] Copiar Edge Config ID
- [ ] Criar token em https://vercel.com/account/tokens
- [ ] Executar `vercel env add EDGE_CONFIG_ID`
- [ ] Executar `vercel env add VERCEL_API_TOKEN`
- [ ] Fazer deploy: `vercel --prod`
- [ ] Testar cron job manualmente
- [ ] Verificar Items no Edge Config dashboard

**Tempo estimado**: 5-10 minutos

---

**Pronto para configurar!** 🚀

