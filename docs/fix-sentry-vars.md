# 🔧 VARIÁVEIS SENTRY QUE PRECISAM SER ATUALIZADAS

## 📊 Status Atual vs Correto:

| Variável | Status Atual | Deveria Ser |
|----------|--------------|-------------|
| `VITE_SENTRY_DSN` | ✅ Correto | `https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504` |
| `SENTRY_DSN` | ❌ Antigo | `https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504` |
| `SENTRY_ORG` | ❌ Antigo | `activity-fisioterapia` |
| `SENTRY_PROJECT` | ❌ Antigo | `dudufisio-ai` |
| `SENTRY_AUTH_TOKEN` | ✅ Correto | `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` |

## 🎯 Ações Necessárias:

### 1. Atualizar SENTRY_DSN
```bash
vercel env rm SENTRY_DSN
vercel env add SENTRY_DSN
# Valor: https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504
```

### 2. Atualizar SENTRY_ORG  
```bash
vercel env rm SENTRY_ORG
vercel env add SENTRY_ORG
# Valor: activity-fisioterapia
```

### 3. Atualizar SENTRY_PROJECT
```bash
vercel env rm SENTRY_PROJECT
vercel env add SENTRY_PROJECT
# Valor: dudufisio-ai
```

## 🚀 Após atualizar:
1. **Redeploy** o projeto
2. **Teste** o Sentry
3. **Verifique** no dashboard Sentry.io
