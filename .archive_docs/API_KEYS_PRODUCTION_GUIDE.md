# 🔑 Guia Completo de API Keys para Produção - FisioFlow

Este guia detalha como obter todas as API keys necessárias para colocar o sistema de check-in inteligente em produção.

## 📱 1. Firebase Cloud Messaging (FCM) - Notificações Push

### Para Android e Web Push

#### **Passo 1: Acessar o Firebase Console**
```bash
1. Vá para https://console.firebase.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: "FisioFlow-CheckIn-System"
```

#### **Passo 2: Configurar FCM**
```bash
1. No painel do projeto, clique em "Cloud Messaging"
2. Vá em "Project Settings" (ícone da engrenagem)
3. Aba "Cloud Messaging"
```

#### **Passo 3: Obter as chaves (Nova API v1)**

**⚠️ IMPORTANTE: A Legacy Server Key foi DESATIVADA pelo Google!**

**FIREBASE_ADMIN_SDK (Nova chave principal):**
```bash
1. Em "Project Settings" → "Service accounts"
2. Clique "Generate new private key"
3. Baixe o arquivo JSON
4. Copie TODO o conteúdo do arquivo como string JSON
```

**FCM_PROJECT_ID:**
```bash
1. Em "Project Settings" → "General"
2. Copie o "Project ID" (ex: fisioflow-checkin-12345)
```

**VAPID_KEY:**
```bash
1. Em "Project Settings" → "Cloud Messaging"
2. Seção "Web configuration"
3. Clique em "Generate key pair"
4. Copie a "Key pair" gerada
```

#### **Arquivo de configuração Firebase (firebase-config.json):**
```bash
1. Em "Project Settings" → "General"
2. Seção "Your apps" → "Web"
3. Clique em "Add app" se não tiver
4. Baixe o arquivo de configuração
```

---

## 🍎 2. Apple Push Notification Service (APNS) - iOS

### **Passo 1: Apple Developer Account**
```bash
1. Acesse https://developer.apple.com/
2. Entre com sua conta de desenvolvedor Apple
3. Vá para "Certificates, Identifiers & Profiles"
```

### **Passo 2: Criar App ID**
```bash
1. Em "Identifiers" → "App IDs"
2. Clique no "+" para criar novo
3. Digite o Bundle ID: com.fisioflow.checkin
4. Marque "Push Notifications" nas capabilities
```

### **Passo 3: Gerar Certificado APNs**

**APNS_KEY_ID:**
```bash
1. Em "Keys" → Clique no "+"
2. Nome: "FisioFlow Push Notifications"
3. Marque "Apple Push Notifications service (APNs)"
4. Clique "Continue" → "Register"
5. Baixe o arquivo .p8
6. O Key ID está na página (ex: ABC123DEFG)
```

**APNS_TEAM_ID:**
```bash
1. No topo da página do Developer Portal
2. Ao lado do seu nome, há o Team ID (ex: 123ABC456D)
```

**APNS_BUNDLE_ID:**
```bash
1. Use o Bundle ID criado anteriormente
2. Exemplo: com.fisioflow.checkin
```

---

## 🤖 3. API de Reconhecimento Facial

### **Opção 1: Amazon Rekognition (Recomendada)**

#### **Configuração AWS:**
```bash
1. Acesse https://aws.amazon.com/console/
2. Crie uma conta ou faça login
3. Procure por "Rekognition" nos serviços
4. Ative o serviço na região us-east-1
```

#### **Criar IAM User:**
```bash
1. Vá para IAM → Users → Create User
2. Nome: "fisioflow-rekognition-user"
3. Attach policy: "AmazonRekognitionFullAccess"
4. Crie Access Key
```

**FACE_RECOGNITION_API_KEY:**
```bash
# Será o AWS Access Key ID + Secret combinados
# Formato: AWS_ACCESS_KEY_ID:AWS_SECRET_ACCESS_KEY
# Exemplo: AKIA123456789:abcdef123456789
```

#### **Configuração adicional:**
```javascript
// Adicionar no .env.local
AWS_ACCESS_KEY_ID=sua_access_key_id
AWS_SECRET_ACCESS_KEY=sua_secret_access_key
AWS_REGION=us-east-1
REKOGNITION_COLLECTION_ID=fisioflow-faces
```

### **Opção 2: Microsoft Azure Face API**

```bash
1. Acesse https://portal.azure.com/
2. Crie um "Cognitive Services" → "Face"
3. Copie a "Key" e "Endpoint"
```

**FACE_RECOGNITION_API_KEY:**
```bash
# Será a chave da API do Azure
# Formato: 32 caracteres hexadecimais
```

### **Opção 3: Google Cloud Vision AI**

```bash
1. Acesse https://console.cloud.google.com/
2. Ative "Cloud Vision API"
3. Crie credenciais de Service Account
4. Baixe o arquivo JSON das credenciais
```

**FACE_RECOGNITION_API_KEY:**
```bash
# Será o conteúdo do arquivo JSON (como string)
# Ou o caminho para o arquivo de credenciais
```

---

## 🗄️ 4. Configuração Supabase para Produção

### **Passo 1: Criar Projeto Supabase**
```bash
1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Nome: "FisioFlow Production"
4. Região: South America (São Paulo) - recomendada
5. Senha do banco: [senha forte]
```

### **Passo 2: Obter URLs e Keys**
```bash
1. No dashboard do projeto
2. Vá em Settings → API
3. Copie as informações:
```

#### **Para .env.local:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
```

### **Passo 3: Aplicar Migrations**
```bash
# Conectar ao projeto
supabase link --project-ref [seu-project-id]

# Aplicar as migrations do check-in
supabase db push

# Ou aplicar migration específica
supabase migration up --file 20250924000000_create_checkin_system_schema.sql
```

---

## 🛠️ 5. Configuração Completa no Vercel

### **Variáveis de Ambiente de Produção:**

```bash
# No Vercel Dashboard → Project Settings → Environment Variables
```

#### **Adicionar as seguintes variáveis:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

# Reconhecimento Facial (escolha uma opção)
FACE_RECOGNITION_API_KEY=sua_api_key_escolhida
FACE_RECOGNITION_PROVIDER=aws_rekognition
# OU
# FACE_RECOGNITION_PROVIDER=azure_face
# OU
# FACE_RECOGNITION_PROVIDER=google_vision

# Firebase Cloud Messaging
FCM_SERVER_KEY=AAAAxxxxxxxxxxxxxxxxxxxxxxx
FCM_PROJECT_ID=fisioflow-checkin-12345
VAPID_KEY=sua_vapid_key_gerada

# Apple Push Notifications (iOS)
APNS_KEY_ID=ABC123DEFG
APNS_TEAM_ID=123ABC456D
APNS_BUNDLE_ID=com.fisioflow.checkin
APNS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...

# Sistema
NODE_ENV=production
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=sua_secret_key_segura
```

---

## 📊 6. Monitoramento e Logs

### **Configurar Sentry (Opcional mas Recomendado):**

```bash
1. Acesse https://sentry.io/
2. Crie um novo projeto
3. Selecione "React" como plataforma
4. Copie o DSN
```

```env
# Adicionar no Vercel
SENTRY_DSN=sua_sentry_dsn
SENTRY_ORG=sua_organizacao
SENTRY_PROJECT=fisioflow-checkin
```

---

## 🧪 7. Testes das API Keys

### **Script de Teste (criar em `scripts/test-api-keys.js`):**

```javascript
// Testar todas as API keys configuradas
const testApiKeys = async () => {
  // Teste Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { data } = await supabase.from('patients').select('count');
    console.log('✅ Supabase: OK');
  } catch (error) {
    console.log('❌ Supabase: Erro', error.message);
  }

  // Teste FCM
  // ... implementar testes para cada serviço
};

testApiKeys();
```

### **Executar teste:**
```bash
node scripts/test-api-keys.js
```

---

## 🚀 8. Deploy Final

### **Comandos para deploy completo:**

```bash
# 1. Build local para testar
npm run build

# 2. Deploy para Vercel
vercel --prod

# 3. Verificar deployment
vercel inspect [url-do-deployment] --logs
```

---

## 🔒 9. Segurança em Produção

### **Checklist de Segurança:**

```bash
✅ Todas as API keys são diferentes das de desenvolvimento
✅ Chaves sensíveis estão apenas em variáveis de ambiente
✅ CORS configurado corretamente no Supabase
✅ RLS (Row Level Security) ativo em todas as tabelas
✅ Rate limiting configurado nas APIs
✅ Logs de auditoria ativos
✅ Backup automático do banco configurado
✅ SSL/TLS em todos os endpoints
```

### **Rotação de Chaves (Fazer mensalmente):**

```bash
1. Gerar novas chaves em cada serviço
2. Atualizar variáveis no Vercel
3. Testar em staging primeiro
4. Deploy para produção
5. Revogar chaves antigas após 24h
```

---

## 📞 10. Suporte e Troubleshooting

### **Em caso de problemas:**

1. **Logs do Vercel:**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Logs do Supabase:**
   - Dashboard → Logs → selecionar tipo de log

3. **Teste individual de cada API:**
   - Use Postman ou curl para testar endpoints

### **Contatos de Suporte:**
- **Vercel:** https://vercel.com/support
- **Supabase:** https://supabase.com/support
- **Firebase:** https://firebase.google.com/support

---

## ✅ Resumo das Variáveis Finais

```env
# === BANCO DE DADOS ===
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# === RECONHECIMENTO FACIAL ===
FACE_RECOGNITION_API_KEY=[aws-key OU azure-key OU google-key]
FACE_RECOGNITION_PROVIDER=[aws_rekognition OU azure_face OU google_vision]

# === NOTIFICAÇÕES PUSH ===
FCM_SERVER_KEY=AAAAxxxxxxxxxxxxxxxxxxxxxxx
FCM_PROJECT_ID=fisioflow-checkin-12345
VAPID_KEY=[vapid-key]

# === iOS PUSH ===
APNS_KEY_ID=ABC123DEFG
APNS_TEAM_ID=123ABC456D
APNS_BUNDLE_ID=com.fisioflow.checkin

# === SISTEMA ===
NODE_ENV=production
NEXTAUTH_URL=https://moocafisio.com.br
NEXTAUTH_SECRET=[secret-key-segura]
```

**🎉 Sistema pronto para produção!**