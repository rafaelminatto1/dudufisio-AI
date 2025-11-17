# 🔧 Correção: vercel.json - Propriedade Inválida

## ❌ Erro Identificado

```
The `vercel.json` schema validation failed with the following message: 
should NOT have additional property `rootDirectory`
```

## ✅ Correção Aplicada

**Removido `rootDirectory` do `vercel.json`**

O `rootDirectory` **NÃO** é uma propriedade válida no `vercel.json`. Essa configuração deve ser feita **apenas no painel da Vercel**, não no arquivo JSON.

## 📝 Configuração Correta

### No `vercel.json` (arquivo):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

### No Painel da Vercel:
- **Root Directory:** Deve estar **vazio** (usa a raiz do projeto)
- Isso é configurado em: Settings → Build and Deployment → Root Directory

## ✅ Status

- ✅ Propriedade inválida removida do `vercel.json`
- ✅ Commit realizado
- ⏳ Push pendente (tentando novamente)

## 🔍 Verificação

Após o push, o novo deploy deve:
- [ ] Validar o `vercel.json` sem erros
- [ ] Encontrar o `package.json` na raiz
- [ ] Executar `npm install` com sucesso
- [ ] Executar `npm run build` com sucesso

---

**Nota:** O Root Directory no painel da Vercel já está configurado como `null` (vazio), o que está correto para usar a raiz do projeto.

