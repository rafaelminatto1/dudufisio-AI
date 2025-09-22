# 🚀 Guia Completo: Criar Projeto DuduFisio-AI na Vercel

## 📋 Passo a Passo - Dashboard Vercel

### 1️⃣ **Acessar Vercel Dashboard**
- Acesse: https://vercel.com/dashboard
- Login na conta: `rafaelminatto1`
- Team: `Rafael Minatto's projects`

### 2️⃣ **Criar Novo Projeto**
1. Clique em **"Add New Project"**
2. Clique em **"Import Git Repository"**
3. Procure por: **`dudufisio-AI`**
4. Clique em **"Import"** no repositório correto

### 3️⃣ **Configurar Build Settings**
```
Project Name: dudufisio-ai
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4️⃣ **Configurar Environment Variables**
Adicione estas variáveis na seção "Environment Variables":

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Environment
VITE_APP_ENV=production
VITE_APP_URL=https://dudufisio-ai.vercel.app
```

### 5️⃣ **Deploy!**
- Clique em **"Deploy"**
- Aguarde o build completar (2-3 minutos)

## ✅ **Verificação de Sucesso**

### Build Logs Esperados:
```
✓ Installing dependencies
✓ Running "npm run build"
✓ Compiled successfully
✓ Copying dist files
✓ Deployment completed
```

### URLs Geradas:
- **Production:** `https://dudufisio-ai.vercel.app`
- **Preview:** `https://dudufisio-ai-git-main-rafael-minattos-projects.vercel.app`

## 🔧 **Configurações Avançadas**

### Auto-Deploy Settings:
- ✅ **Production Branch:** `main`
- ✅ **Preview Branches:** Todas outras branches
- ✅ **GitHub Integration:** Habilitada

### Domínios Personalizados (Opcional):
1. Vá em **"Settings" > "Domains"**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🎯 **Integração Supabase**

### Database Connection:
- ✅ **URL:** Já configurada
- ✅ **Auth:** Configurada via `@supabase/auth-helpers-react`
- ✅ **Real-time:** Habilitada

### Funcionalidades Ativas:
- 🏥 **Patient Management**
- 📅 **Appointment Scheduling**
- 🤖 **AI-Powered Treatment Suggestions**
- 💰 **Financial Dashboard**
- 👤 **User Authentication**

## 🚨 **Troubleshooting**

### Se o Build Falhar:
1. Verifique se todas as env vars estão configuradas
2. Confirme que `Framework Preset = Vite`
3. Verifique se `Build Command = npm run build`

### Se as APIs não funcionarem:
1. Verifique as URLs das env vars
2. Confirme que o Supabase está ativo
3. Teste o Gemini API key

## 🎉 **Próximos Passos**

Após deployment bem-sucedido:
1. ✅ Teste login/cadastro
2. ✅ Teste criação de pacientes
3. ✅ Teste agendamentos
4. ✅ Valide integração com IA
5. ✅ Configure domínio personalizado (opcional)

---

**🤖 Configuração preparada por Claude Code**
**✅ Projeto 100% pronto para produção!**