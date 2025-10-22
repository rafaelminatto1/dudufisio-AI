# 🚀 Setup do Deploy Automático

## ✅ O que já está configurado

- ✅ GitHub Actions workflows criados
- ✅ Supabase CLI configurado
- ✅ Projeto linkado: `urfxniitfbbvsaskicfo`
- ✅ Scripts de deploy removidos (agora é automático!)

## ⚙️ O que você precisa fazer AGORA

### Opção 1: Script Automático (Recomendado) ⚡

Execute no PowerShell:

```powershell
.\setup-github-secrets.ps1
```

O script irá:
1. Abrir o Supabase Dashboard
2. Pedir para você colar o token
3. Configurar tudo automaticamente

### Opção 2: Comandos Manuais 🔧

1. **Obter token do Supabase**:
   - Acesse: https://supabase.com/dashboard/account/tokens
   - Gere um novo token
   - Copie o token

2. **Configurar secrets no GitHub**:
   ```powershell
   # Substitua SEU_TOKEN pelo token copiado
   echo "SEU_TOKEN" | gh secret set SUPABASE_ACCESS_TOKEN --repo rafaelminatto1/dudufisio-AI
   echo "urfxniitfbbvsaskicfo" | gh secret set SUPABASE_PROJECT_REF --repo rafaelminatto1/dudufisio-AI
   ```

3. **Verificar**:
   ```powershell
   gh secret list --repo rafaelminatto1/dudufisio-AI
   ```

### Opção 3: Interface Web do GitHub 🌐

1. Acesse: https://github.com/rafaelminatto1/dudufisio-AI/settings/secrets/actions
2. Adicione os 2 secrets:
   - `SUPABASE_ACCESS_TOKEN`: token do Supabase
   - `SUPABASE_PROJECT_REF`: `urfxniitfbbvsaskicfo`

## 🧪 Testar

Depois de configurar:

```powershell
git add .
git commit -m "test: Deploy automático"
git push origin main
```

Verifique em: https://github.com/rafaelminatto1/dudufisio-AI/actions

## 📚 Documentação Completa

- **Instruções detalhadas**: [CONFIGURAR_SECRETS.md](./CONFIGURAR_SECRETS.md)
- **Resumo completo**: [DEPLOY_AUTOMATICO_RESUMO.md](./DEPLOY_AUTOMATICO_RESUMO.md)
- **Setup dos secrets**: [.github/SETUP_SECRETS.md](./.github/SETUP_SECRETS.md)

## 🎯 Como Funciona

```
Push no GitHub → Workflow executa → Conecta Supabase → Aplica migrations → Deploy concluído ✅
```

**Sem necessidade de scripts manuais!** 🎉



