# Guia de Configuração OAuth - Google e GitHub

Este guia explica como configurar a autenticação OAuth com Google e GitHub no sistema Dudufisio.

## 📋 Pré-requisitos

- Conta no Google Cloud Console
- Conta no GitHub
- Projeto Supabase configurado

## 🔧 Configuração do Google OAuth

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (ou Google Identity)

### 2. Configurar OAuth Consent Screen

1. Vá para "APIs & Services" > "OAuth consent screen"
2. Escolha "External" para usuários externos
3. Preencha as informações obrigatórias:
   - App name: `Dudufisio AI`
   - User support email: seu email
   - Developer contact information: seu email

### 3. Criar Credenciais OAuth

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Escolha "Web application"
4. Configure os URIs:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:54321/auth/v1/callback` (desenvolvimento local)
     - `https://seu-projeto.supabase.co/auth/v1/callback` (produção)

### 4. Obter Credenciais

1. Após criar, copie o **Client ID** e **Client Secret**
2. Adicione ao seu arquivo `.env`:

```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=seu_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=seu_google_client_secret
```

## 🐙 Configuração do GitHub OAuth

### 1. Criar GitHub App

1. Acesse [GitHub Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha as informações:
   - **Application name**: `Dudufisio AI`
   - **Homepage URL**: `http://localhost:3000` (ou seu domínio)
   - **Authorization callback URL**: 
     - `http://localhost:54321/auth/v1/callback` (desenvolvimento)
     - `https://seu-projeto.supabase.co/auth/v1/callback` (produção)

### 2. Obter Credenciais

1. Após criar, copie o **Client ID** e **Client Secret**
2. Adicione ao seu arquivo `.env`:

```env
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=seu_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=seu_github_client_secret
```

## ⚙️ Configuração do Supabase

### 1. Configurar Providers no Supabase

O arquivo `supabase/config.toml` já está configurado com:

```toml
# Google OAuth Configuration
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = ""
url = ""
skip_nonce_check = true

# GitHub OAuth Configuration
[auth.external.github]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET)"
redirect_uri = ""
url = ""
```

### 2. Configurar URLs de Redirecionamento

No painel do Supabase:

1. Vá para "Authentication" > "URL Configuration"
2. Adicione as URLs permitidas:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://seu-dominio.com/auth/callback`

### 3. Configurar Providers

1. Vá para "Authentication" > "Providers"
2. Ative **Google** e **GitHub**
3. Adicione as credenciais obtidas anteriormente

## 🚀 Testando a Configuração

### 1. Iniciar o Supabase Local

```bash
supabase start
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sua_anon_key_local
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=seu_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=seu_google_client_secret
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=seu_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=seu_github_client_secret
```

### 3. Testar Login

1. Acesse `http://localhost:3000`
2. Clique em "Login com Google" ou "Login com GitHub"
3. Complete o fluxo OAuth
4. Verifique se o usuário é redirecionado corretamente

## 🔍 Troubleshooting

### Problemas Comuns

1. **"Redirect URI mismatch"**
   - Verifique se as URLs de callback estão corretas
   - Certifique-se de que o domínio corresponde exatamente

2. **"Invalid client"**
   - Verifique se as credenciais estão corretas
   - Certifique-se de que o app OAuth está ativo

3. **"Access denied"**
   - Verifique se o OAuth consent screen está configurado
   - Certifique-se de que os scopes necessários estão habilitados

4. **Usuário não é criado**
   - Verifique se a tabela `user_profiles` existe
   - Verifique os logs do Supabase para erros

### Logs Úteis

```bash
# Ver logs do Supabase
supabase logs

# Ver logs de autenticação
supabase logs --filter auth
```

## 📝 Estrutura do Banco de Dados

Certifique-se de que a tabela `user_profiles` existe:

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'patient', 'educador_fisico')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Segurança

1. **Nunca commite credenciais** no código
2. Use variáveis de ambiente para todas as credenciais
3. Configure HTTPS em produção
4. Monitore logs de autenticação
5. Configure rate limiting se necessário

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

## ✅ Checklist de Configuração

- [ ] Projeto Google Cloud criado
- [ ] OAuth consent screen configurado
- [ ] Credenciais Google criadas
- [ ] GitHub OAuth app criado
- [ ] Credenciais GitHub obtidas
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase providers habilitados
- [ ] URLs de redirecionamento configuradas
- [ ] Teste de login realizado
- [ ] Tabela user_profiles criada
- [ ] Logs verificados
