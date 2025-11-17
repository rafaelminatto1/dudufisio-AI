# ❌ Erro no Deploy: NÃO RESOLVIDO

**Data:** 17 de Novembro de 2025

## 🚨 Erro Identificado

O deploy está falhando com o seguinte erro:

```
npm error code ETARGET
npm error notarget No matching version found for tailwindcss@^3.4.19.
npm error notarget In most cases you or one of your dependencies are requesting
npm error notarget a package version that doesn't exist.
```

## 🔍 Análise

1. **Problema Principal:**
   - O Vercel está tentando instalar `tailwindcss@^3.4.19` (versão que não existe)
   - O `package.json` atual tem `tailwindcss@^4.1.17` (correto)
   - O erro mostra que está processando arquivos do `_OLD_PROJECT/`

2. **Possíveis Causas:**
   - Há um `package.json` ou `package-lock.json` no `_OLD_PROJECT/` com Tailwind CSS v3
   - O Vercel está lendo arquivos do `_OLD_PROJECT/` apesar do `.vercelignore`
   - Pode haver um `package-lock.json` na raiz com referências antigas

3. **Logs do Deploy Mostram:**
   - Processando arquivos do `_OLD_PROJECT/`:
     - `/_OLD_PROJECT/__tests__/features/AIInsightsDashboard.test.tsx`
     - `/_OLD_PROJECT/.eslintrc.json`
   - Isso indica que o `.vercelignore` pode não estar funcionando corretamente

## ✅ Soluções Possíveis

### Solução 1: Verificar e Limpar package-lock.json

1. Verificar se há referências ao Tailwind CSS v3 no `package-lock.json`
2. Se houver, regenerar o `package-lock.json`:
   ```bash
   rm package-lock.json
   npm install
   ```

### Solução 2: Garantir que _OLD_PROJECT está sendo ignorado

1. Verificar se `.vercelignore` está correto (já está com `_OLD_PROJECT/`)
2. Verificar se não há um `.vercelignore` no `_OLD_PROJECT/` que possa estar sobrescrevendo

### Solução 3: Remover package.json do _OLD_PROJECT (se existir)

Se houver um `package.json` no `_OLD_PROJECT/`, ele pode estar causando conflito.

### Solução 4: Configurar Root Directory no Vercel

No dashboard da Vercel:
1. Settings → Build and Deployment
2. **Root Directory:** Deixe vazio (raiz do projeto)
3. Isso garante que o Vercel não processe subdiretórios desnecessários

## 📝 Status

- ❌ **Erro:** `tailwindcss@^3.4.19` não encontrado
- ❌ **Causa:** Vercel processando arquivos do `_OLD_PROJECT/` ou referências antigas
- ✅ **`.vercelignore`:** Já tem `_OLD_PROJECT/` configurado
- ❓ **Próximo passo:** Verificar se há `package.json` ou `package-lock.json` no `_OLD_PROJECT/`

---

**Status:** ❌ **NÃO RESOLVIDO** - Investigação necessária

