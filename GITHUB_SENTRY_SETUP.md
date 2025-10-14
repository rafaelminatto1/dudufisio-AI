# 🛡️ Configuração do Sentry no GitHub Actions

## 📋 **Secrets Necessárias**

Você precisa configurar as seguintes secrets no seu repositório GitHub:

### 🔐 **Secrets para Configurar:**

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VITE_SENTRY_DSN` | `https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504` | DSN do Sentry |
| `SENTRY_AUTH_TOKEN` | `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` | Token de autenticação |
| `SENTRY_ORG` | `activity-fisioterapia` | Organização no Sentry |
| `SENTRY_PROJECT` | `dudufisio-ai` | Nome do projeto |

---

## 🚀 **Como Configurar Manualmente:**

### **Passo 1: Acessar o Repositório**
1. Vá para: https://github.com/rafaelminatto1/dudufisio-AI
2. Clique na aba **"Settings"**

### **Passo 2: Configurar Secrets**
1. No menu lateral, clique em **"Secrets and variables"**
2. Clique em **"Actions"**
3. Clique no botão **"New repository secret"**

### **Passo 3: Adicionar Cada Secret**
Para cada secret da tabela acima:

1. **Name:** Digite o nome (ex: `VITE_SENTRY_DSN`)
2. **Secret:** Cole o valor correspondente
3. Clique em **"Add secret"**

---

## 📁 **Arquivos Criados:**

✅ **`.github/workflows/sentry-deploy.yml`** - Workflow com configuração do Sentry
✅ **`setup-github-secrets.ps1`** - Script para automação (requer GitHub CLI)

---

## 🔄 **Workflow Criado:**

O workflow `sentry-deploy.yml` irá:

1. ✅ **Fazer checkout** do código
2. ✅ **Instalar dependências** 
3. ✅ **Executar testes**
4. ✅ **Fazer build** com source maps
5. ✅ **Upload source maps** para o Sentry
6. ✅ **Deploy** para Vercel
7. ✅ **Criar release** no Sentry

---

## 🎯 **Como Testar:**

### **Opção 1: Push Manual**
```bash
git add .
git commit -m "feat: adicionar configuração Sentry no CI"
git push origin main
```

### **Opção 2: Workflow Dispatch**
1. Vá para **Actions** no GitHub
2. Clique em **"🛡️ Sentry Deploy with Source Maps"**
3. Clique em **"Run workflow"**

---

## 📊 **Verificar Resultado:**

1. **GitHub Actions:** Verifique se o workflow executou com sucesso
2. **Sentry.io:** Confirme que os source maps foram enviados
3. **Vercel:** Verifique se o deploy foi realizado

---

## 🛠️ **Comandos Úteis:**

### **Verificar Secrets (GitHub CLI):**
```bash
gh secret list --repo rafaelminatto1/dudufisio-AI
```

### **Testar Localmente:**
```bash
npm run build
npx @sentry/cli releases files upload-sourcemaps ./dist
```

---

## ⚠️ **Importante:**

- As secrets são **sensíveis** e não devem ser compartilhadas
- O workflow só executa após configurar **todas** as secrets
- Os source maps são essenciais para debug no Sentry
- Cada deploy criará uma nova release no Sentry

---

## 🎉 **Resultado Esperado:**

Após configurar as secrets e executar o workflow:

✅ **Source maps** enviados para o Sentry  
✅ **Release** criada automaticamente  
✅ **Deploy** realizado na Vercel  
✅ **Erros** com stack trace completo no Sentry  

---

**🚀 Pronto! Seu CI/CD está configurado com Sentry!**
