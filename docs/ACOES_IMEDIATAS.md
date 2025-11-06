# ⚡ Ações Imediatas Necessárias

## 🔴 CRÍTICO - Configurar Variáveis na Vercel

O deploy está feito, mas **o app não funcionará** até você configurar as variáveis de ambiente.

### Passo a Passo:

1. **Acesse:** https://vercel.com/dashboard
2. **Clique** no projeto `dudufisio-ai`
3. **Vá em:** Settings → Environment Variables
4. **Adicione** estas variáveis **uma por uma**:

```
VITE_SUPABASE_URL
Valor: https://urfxniitfbbvsaskicfo.supabase.co
Aplicar a: Production, Preview, Development

VITE_SUPABASE_ANON_KEY  
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
Aplicar a: Production, Preview, Development

VITE_GEMINI_API_KEY
Valor: AIzaSyBE4SDwk03LO-IMsJ63NfK764GSbAw72to
Aplicar a: Production, Preview, Development

VITE_FALLBACK_TO_MOCK
Valor: false
Aplicar a: Production, Preview, Development

VITE_LOG_LEVEL
Valor: error
Aplicar a: Production, Preview, Development
```

5. **Ao terminar:** Clique em "Save"
6. **Redeploy:** Deployments → Mais recente → "..." → Redeploy

### ⏱️ Tempo estimado: 5 minutos

---

## 🟡 IMPORTANTE - Testar Produção

Após configurar as env vars e redeploy:

1. **Acesse:** https://dudufisio-ai-rafael-minattos-projects.vercel.app
2. **Faça login** com:
   - Email: `admin@dudufisio.com`
   - Senha: `demo123456`
3. **Verifique:**
   - [ ] Login funciona
   - [ ] Dashboard carrega
   - [ ] Dados aparecem
   - [ ] F5 mantém sessão

### ⏱️ Tempo estimado: 5 minutos

---

## 🟢 OPCIONAL - Implementar RLS

Se tudo estiver funcionando, implemente RLS para maior segurança.

Veja instruções em: `APRIMORAMENTOS_FINAIS.md`

### ⏱️ Tempo estimado: 15 minutos

---

## ✅ Resumo

**Ação crítica agora:** Configurar env vars na Vercel

Sem isso, o app não funcionará em produção.

**Após configurar:** Testar e verificar se tudo funciona.

**Depois:** Implementar RLS para segurança extra.

---

**Status atual:** 90% completo - falta apenas configurar env vars! 🚀

