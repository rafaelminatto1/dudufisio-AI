# 🔐 Configuração dos Secrets do GitHub

Para que o deploy automático funcione, você precisa configurar os secrets no GitHub.

## 📋 Secrets Necessários

### 1. `SUPABASE_ACCESS_TOKEN`
- **O que é**: Token de acesso do Supabase
- **Como obter**:
  1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
  2. Vá em **Settings** → **Access Tokens**
  3. Clique em **Generate new token**
  4. Dê um nome (ex: "GitHub Actions")
  5. Copie o token gerado

### 2. `SUPABASE_PROJECT_REF`
- **O que é**: ID do seu projeto Supabase
- **Como obter**:
  1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
  2. Selecione seu projeto
  3. Vá em **Settings** → **General**
  4. Copie o **Reference ID** (algo como `abcdefghijklmnop`)

## 🛠️ Como Configurar no GitHub

### Método 1: Via Interface Web
1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret:
   - **Name**: `SUPABASE_ACCESS_TOKEN`
   - **Secret**: `seu_token_aqui`
5. Repita para `SUPABASE_PROJECT_REF`

### Método 2: Via GitHub CLI
```bash
# Instalar GitHub CLI se não tiver
# https://cli.github.com/

# Configurar os secrets
gh secret set SUPABASE_ACCESS_TOKEN --body "seu_token_aqui"
gh secret set SUPABASE_PROJECT_REF --body "seu_project_ref_aqui"
```

## 🔍 Verificar se Está Funcionando

1. Faça um push para o branch `main`
2. Vá em **Actions** no seu repositório GitHub
3. Verifique se o workflow `Sync Supabase` está rodando
4. Se der erro, verifique os logs na aba **Actions**

## 🚨 Troubleshooting

### Erro: "Invalid access token"
- Verifique se o token está correto
- Certifique-se de que o token tem permissões adequadas

### Erro: "Project not found"
- Verifique se o `SUPABASE_PROJECT_REF` está correto
- Certifique-se de que o projeto existe no Supabase

### Erro: "Permission denied"
- Verifique se o token tem permissão para fazer deploy
- Certifique-se de que o projeto está ativo

## 📝 Exemplo de Configuração

```bash
# Secrets configurados no GitHub:
SUPABASE_ACCESS_TOKEN = "sbp_1234567890abcdef..."
SUPABASE_PROJECT_REF = "abcdefghijklmnop"
```

## ✅ Checklist de Configuração

- [ ] Token de acesso do Supabase obtido
- [ ] Project Reference ID obtido
- [ ] Secrets configurados no GitHub
- [ ] Teste de push realizado
- [ ] Workflow executado com sucesso

## 🎯 Próximos Passos

Após configurar os secrets:

1. **Teste o workflow**:
   ```bash
   git add .
   git commit -m "test: Testar deploy automático"
   git push origin main
   ```

2. **Verifique as Actions**:
   - Vá em **Actions** no GitHub
   - Veja se o workflow `Sync Supabase` executou
   - Verifique se não há erros

3. **Confirme o deploy**:
   - Acesse seu projeto no Supabase Dashboard
   - Verifique se as migrations foram aplicadas
   - Teste a aplicação

## 🔄 Como Funciona

1. **Push no GitHub** → Trigger do workflow
2. **Workflow executa** → Instala dependências
3. **Link com Supabase** → Conecta ao projeto
4. **Verifica migrations** → Checa se há mudanças
5. **Aplica mudanças** → Executa migrations/seed
6. **Notifica resultado** → Mostra status no GitHub

## 💡 Dicas

- **Sempre teste localmente** antes de fazer push
- **Use branches** para testar mudanças
- **Monitore os logs** das Actions para debug
- **Mantenha os secrets seguros** - nunca os commite no código
