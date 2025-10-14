# 🔧 CONFIGURAR SUPABASE - SOLUÇÃO DO ERRO 401

## ❌ Problema Identificado

**Erro:** `Failed to load resource: the server responded with a status of 401`
**Causa:** Chave da API do Supabase não configurada

---

## ✅ SOLUÇÃO RÁPIDA

### 1. Criar arquivo `.env.local`

Crie um arquivo chamado `.env.local` na raiz do projeto com este conteúdo:

```env
# ============================================================================
# SUPABASE CONFIGURATION - DUDUFISIO-AI
# ============================================================================

VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MjQ4MDAsImV4cCI6MjA1MDAwMDgwMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

# Service Role Key (para operações administrativas)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQyNDgwMCwiZXhwIjoyMDUwMDAwODAwfQ.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

# Application Configuration
NODE_ENV=development
VITE_APP_ENV=development
```

### 2. Obter as chaves reais do Supabase

1. **Acesse:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api

2. **Copie as chaves:**
   - **Project URL:** `https://urfxniitfbbvsaskicfo.supabase.co`
   - **anon public:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Substitua** no arquivo `.env.local` pelas chaves reais

### 3. Reiniciar o servidor

```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

---

## 🎯 CHAVES CORRETAS DO SEU PROJETO

**URL do Projeto:**
```
https://urfxniitfbbvsaskicfo.supabase.co
```

**Para pegar as chaves:**
1. Vá em: Supabase Dashboard
2. Selecione o projeto: `urfxniitfbbvsaskicfo`
3. Vá em: Settings → API
4. Copie:
   - `anon` `public` key
   - `service_role` key

---

## 🔍 VERIFICAR SE FUNCIONOU

Após criar o `.env.local` e reiniciar:

1. **Console do navegador** deve mostrar:
   ```
   ✅ Supabase Client inicializado
   📍 URL: https://urfxniitfbbvsaskicfo.supabase.co
   🔑 Key: eyJhbGciOiJIUzI1NiIs...
   ```

2. **Erro 401 deve desaparecer**

3. **Dados dos pacientes devem carregar**

---

## ⚠️ IMPORTANTE

- **Nunca faça commit** do arquivo `.env.local`
- Use as chaves **reais** do seu projeto Supabase
- Reinicie o servidor após criar o arquivo

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar `.env.local` com as chaves
2. ✅ Reiniciar `npm run dev`
3. ✅ Acessar `http://localhost:5176/patients/22e518b6-814f-4ea3-ad18-ce0c130f3005`
4. ✅ Ver o Body Map funcionando!

---

## 📞 SUPORTE

Se ainda der erro 401:
1. Verifique se as chaves estão corretas
2. Confirme que o arquivo está na raiz do projeto
3. Reinicie o servidor completamente
4. Limpe o cache do navegador (Ctrl+Shift+R)
