# 🚀 Firebase Cloud Messaging v1 - Setup Atualizado

## ⚠️ Legacy API Desativada - Nova Configuração

O Google desativou a Legacy Server Key. Agora usamos a **Firebase Admin SDK v1**.

## 📋 Passos Atualizados:

### 1. Criar Projeto Firebase
```bash
1. https://console.firebase.google.com/
2. Criar projeto: "FisioFlow-CheckIn-System"
3. Plano Spark (gratuito)
```

### 2. Configurar Admin SDK (Substitui Server Key)
```bash
1. Project Settings → Service accounts
2. Clique "Generate new private key"
3. Baixe o arquivo JSON
4. Renomeie para: fisioflow-firebase-adminsdk.json
```

### 3. Obter Chaves Necessárias

**FCM_PROJECT_ID:**
```bash
Local: Project Settings → General → Project ID
Exemplo: fisioflow-checkin-12345
```

**VAPID_KEY (Para Web Push):**
```bash
Local: Project Settings → Cloud Messaging → Web Push certificates
Ação: Generate key pair (se não existir)
Exemplo: BCd1234567890abcdef...
```

**FIREBASE_ADMIN_SDK (Nova chave principal):**
```bash
Local: Conteúdo do arquivo JSON baixado
Formato: String JSON completa
```

### 4. Configurar no Vercel

#### Variáveis de Ambiente:
```env
# Firebase v1 (Nova API)
FCM_PROJECT_ID=fisioflow-checkin-12345
VAPID_KEY=BCd1234567890abcdef...
FIREBASE_ADMIN_SDK={"type":"service_account","project_id":"fisioflow-checkin-12345",...}

# OU usando arquivo (mais seguro)
FIREBASE_ADMIN_SDK_PATH=/path/to/fisioflow-firebase-adminsdk.json
```

### 5. Implementação no Código

O sistema já está preparado para a nova API! Apenas configure as variáveis.

#### Exemplo de uso:
```javascript
// Sistema já implementado com nova API v1
await checkInSystem.sendCustomNotification(
  'patient-123',
  'Check-in Realizado',
  'Bem-vindo ao FisioFlow!',
  { deepLink: '/dashboard' }
);
```

## ✅ Vantagens da Nova API:

- ✅ Mais segura (OAuth2)
- ✅ Melhor performance
- ✅ Suporte a recursos avançados
- ✅ Não será descontinuada
- ✅ CONTINUA 100% GRATUITA

## 🔒 Segurança:

A chave do Admin SDK é mais segura que a Legacy. Use apenas em servidor (Vercel), nunca no frontend.

## 📱 Funcionalidades Mantidas:

- ✅ Notificações ilimitadas
- ✅ Android, iOS, Web
- ✅ Agendamento
- ✅ Targeting
- ✅ Analytics

## 🎯 Resultado:

Sistema de notificações push ainda mais robusto e seguro, mantendo-se 100% gratuito!