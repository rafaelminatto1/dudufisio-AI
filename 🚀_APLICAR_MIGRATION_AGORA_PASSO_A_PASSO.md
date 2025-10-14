# 🚀 APLICAR MIGRATION - PASSO A PASSO FINAL

## ✅ SITUAÇÃO ATUAL

1. **✅ `.env.local` criado** com as chaves corretas do Supabase
2. **✅ Servidor reiniciou automaticamente** e detectou as variáveis
3. **⏭️ FALTA APENAS:** Aplicar a migration do body map no banco

---

## 🎯 APLICAR A MIGRATION (ESCOLHA UMA OPÇÃO)

### 🥇 OPÇÃO 1: Via Supabase Dashboard (MAIS SIMPLES - 2 MINUTOS)

**PASSO 1:** Acesse o Supabase Dashboard
- URL: https://app.supabase.com/project/urfxniitfbbvsaskicfo
- Ou: https://app.supabase.com → Selecione projeto "dudufisio-AI"

**PASSO 2:** Vá para SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique no botão **"+ New query"** (Nova consulta)

**PASSO 3:** Copie a Migration
- Abra o arquivo: `supabase/migrations/20251013_body_map_system.sql`
- Selecione TUDO (Ctrl+A)
- Copie (Ctrl+C)

**PASSO 4:** Execute
- Cole no SQL Editor (Ctrl+V)
- Clique no botão **"Run"** (ou pressione Ctrl+Enter)
- Aguarde alguns segundos

**RESULTADO ESPERADO:**
```
✅ Success. No rows returned
```

---

### 🥈 OPÇÃO 2: Via CLI do Supabase

```bash
npx supabase db push
```

**Se aparecer erro de histórico de migrations:**

Execute este comando para aplicar apenas a migration do body map:

```bash
# No PowerShell:
Get-Content supabase/migrations/20251013_body_map_system.sql | npx supabase db execute
```

---

## ✅ VERIFICAR SE FUNCIONOU

### PASSO 1: Verificar Tabelas Criadas

No SQL Editor do Supabase, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'body_map%'
ORDER BY table_name;
```

**Deve retornar 4 tabelas:**
```
body_map_analytics_cache
body_map_pain_regions
body_map_sessions
body_regions_reference
```

### PASSO 2: Verificar na Aplicação

1. Acesse: http://localhost:5177/patients/PAT-001
2. **A aba "Mapa de Dor" deve aparecer agora! 🎉**
3. Clique nela para testar

### PASSO 3: Verificar Console do Navegador

**Não deve mais aparecer:**
```
❌ VITE_SUPABASE_URL não está definida
```

**Deve aparecer:**
```
✅ [config] supabase.config.loaded {
  hasValidCredentials: true,
  url: https://urfxniitfbbvsaskicfo.supabase.co
}
```

---

## 📊 CHECKLIST FINAL

- [x] Arquivo `.env.local` criado com chaves corretas
- [x] Servidor reiniciou e carregou as variáveis
- [ ] **Migration aplicada no Supabase** ← VOCÊ ESTÁ AQUI
- [ ] Tabelas `body_map_*` criadas
- [ ] Aba "Mapa de Dor" aparece na página do paciente
- [ ] Sistema funciona completamente

---

## 🎉 APÓS APLICAR A MIGRATION

**O sistema de Mapa Corporal estará 100% funcional com:**

✅ 4 tipos de visualização diferentes
✅ Registro de múltiplos pontos de dor
✅ Queixa principal destacada
✅ Histórico de evolução
✅ Gráficos e analytics
✅ Exportação PDF
✅ Comparação antes/depois

---

## 🆘 SE HOUVER ALGUM PROBLEMA

### Erro: "relation does not exist"
- A migration não foi aplicada
- Siga a Opção 1 (Dashboard) novamente

### Aba ainda não aparece
1. Limpe cache do navegador (Ctrl+Shift+Del)
2. Recarregue a página (Ctrl+F5)
3. Verifique se as tabelas foram criadas (query acima)

### Erro no console sobre Supabase
1. Verifique se o servidor reiniciou após criar `.env.local`
2. Confirme que as chaves no `.env.local` estão corretas
3. Reinicie manualmente se necessário:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

---

## 📝 INFORMAÇÕES DO PROJETO

```
Project Name: dudufisio-AI
Project ID: urfxniitfbbvsaskicfo
Dashboard: https://app.supabase.com/project/urfxniitfbbvsaskicfo
Region: South America (São Paulo)
```

---

**🚀 Você está a 1 passo de ter o Mapa Corporal funcionando!**

**Escolha a Opção 1 (Dashboard) - é a mais rápida e segura!**
