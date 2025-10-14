
# 🎯 CONFIGURAÇÃO SENTRY NO VERCEL DASHBOARD

## 📋 Variáveis de Ambiente para Adicionar

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

### Adicione as seguintes variáveis:

```
Nome: VITE_SENTRY_DSN
Valor: https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SENTRY_AUTH_TOKEN  
Valor: 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
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SENTRY_ORG
Valor: activity-fisioterapia
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SENTRY_PROJECT
Valor: dudufisio-ai
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SENTRY_ENVIRONMENT
Valor: production
Ambientes: ✅ Production ✅ Preview ✅ Development
```

## 🚀 Após configurar:

1. **Save** as variáveis
2. **Redeploy** o projeto
3. **Teste** o Sentry

## 🧪 Como testar:

1. Acesse sua aplicação em produção
2. Abra console (F12)
3. Execute: `throw new Error('🧪 Teste Sentry!');`
4. Verifique no Sentry.io → Issues

## 📊 Informações do Projeto:

- **Organização:** activity-fisioterapia
- **Projeto:** dudufisio-ai
- **DSN:** https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504
