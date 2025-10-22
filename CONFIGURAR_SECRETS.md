# 🔐 Como Configurar os Secrets (Passo-a-Passo)

## Método Rápido: Usar o Script Automático

Execute o seguinte comando no PowerShell:

```powershell
.\setup-github-secrets.ps1
```

O script irá:
1. Abrir o Supabase Dashboard automaticamente
2. Solicitar que você cole o token
3. Configurar ambos os secrets automaticamente no GitHub

---

## Método Manual: Comandos Diretos

Se preferir fazer manualmente, siga estes passos:

### Passo 1: Obter o Token do Supabase

1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em **"Generate new token"**
3. Dê um nome: **"GitHub Actions"**
4. **Copie o token gerado** (ex: `sbp_abc123...`)

### Passo 2: Configurar o Secret SUPABASE_ACCESS_TOKEN

No PowerShell, execute:

```powershell
# Substitua SEU_TOKEN_AQUI pelo token que você copiou
echo "SEU_TOKEN_AQUI" | gh secret set SUPABASE_ACCESS_TOKEN --repo rafaelminatto1/dudufisio-AI
```

### Passo 3: Configurar o Secret SUPABASE_PROJECT_REF

No PowerShell, execute:

```powershell
echo "urfxniitfbbvsaskicfo" | gh secret set SUPABASE_PROJECT_REF --repo rafaelminatto1/dudufisio-AI
```

### Passo 4: Verificar se Funcionou

```powershell
gh secret list --repo rafaelminatto1/dudufisio-AI
```

Você deve ver:
```
SUPABASE_ACCESS_TOKEN   Updated 2025-10-22
SUPABASE_PROJECT_REF    Updated 2025-10-22
```

---

## Método Alternativo: Via Interface Web do GitHub

Se os comandos acima não funcionarem:

1. Acesse: https://github.com/rafaelminatto1/dudufisio-AI/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Adicione o primeiro secret:
   - **Name**: `SUPABASE_ACCESS_TOKEN`
   - **Secret**: Cole o token do Supabase
4. Clique em **"Add secret"**
5. Adicione o segundo secret:
   - **Name**: `SUPABASE_PROJECT_REF`
   - **Secret**: `urfxniitfbbvsaskicfo`
6. Clique em **"Add secret"**

---

## Testar o Deploy Automático

Após configurar os secrets:

```powershell
# 1. Fazer commit das alterações
git add .
git commit -m "test: Testar deploy automático"

# 2. Push para o GitHub
git push origin main

# 3. Verificar as Actions
start https://github.com/rafaelminatto1/dudufisio-AI/actions
```

---

## Troubleshooting

### Erro: "authentication required"
- Verifique se você está autenticado no GitHub CLI: `gh auth status`
- Se não estiver, execute: `gh auth login`

### Erro: "repository not found"
- Certifique-se de que o repositório existe
- Verifique se você tem permissões de admin no repositório

### Secrets não aparecem
- Aguarde alguns segundos e verifique novamente
- Os secrets são criptografados e não mostram os valores

---

## 🎯 Resumo dos Valores

- **SUPABASE_PROJECT_REF**: `urfxniitfbbvsaskicfo` ✅ (já identificado)
- **SUPABASE_ACCESS_TOKEN**: Você precisa gerar em https://supabase.com/dashboard/account/tokens

---

**✨ Depois de configurar, seu deploy será automático a cada push!**



