# 🔐 Configuração de OAuth - DuduFisio-AI

Este guia mostra como configurar login social (Google, GitHub) no Supabase.

---

## ⚠️ Erro Comum

Se você está vendo este erro:

```
GET https://[projeto].supabase.co/auth/v1/authorize?provider=google 400 (Bad Request)
```

**Causa:** O provider OAuth não está configurado no Supabase.

**Solução:** Siga os passos abaixo para configurar.

---

## 📋 Pré-requisitos

- Conta no Supabase (já criada)
- Projeto Supabase (já existe)
- Conta Google Developers (para Google OAuth)
- Conta GitHub (para GitHub OAuth)

---

## 🔧 Configuração do Google OAuth

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: "DuduFisio-AI"

### Passo 2: Configurar Tela de Consentimento OAuth

1. Vá em **APIs & Services** > **OAuth consent screen**
2. Escolha **External** (ou Internal se for G Workspace)
3. Preencha:
   - **App name:** DuduFisio-AI
   - **User support email:** seu-email@exemplo.com
   - **Developer contact:** seu-email@exemplo.com
4. Clique em **Save and Continue**
5. Em **Scopes**, não precisa adicionar nada (padrão é suficiente)
6. Clique em **Save and Continue**
7. Em **Test users**, adicione seu email
8. Clique em **Save and Continue**

### Passo 3: Criar Credenciais OAuth

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Selecione **Web application**
4. Preencha:
   - **Name:** DuduFisio-AI Web
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5176
     http://localhost:5175
     http://localhost:5173
     https://seu-dominio.com (se em produção)
     ```
   - **Authorized redirect URIs:**
     ```
     https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/callback
     http://localhost:5176/auth/callback
     http://localhost:5175/auth/callback
     http://localhost:5173/auth/callback
     ```
5. Clique em **Create**
6. **COPIE** o **Client ID** e **Client Secret** (você vai precisar)

### Passo 4: Configurar no Supabase

1. Acesse: https://app.supabase.com/project/urfxniitfbbvsaskicfo
2. Vá em **Authentication** > **Providers**
3. Encontre **Google** na lista
4. Clique em **Enable**
5. Cole:
   - **Client ID:** (copiado do passo anterior)
   - **Client Secret:** (copiado do passo anterior)
6. Clique em **Save**

### Passo 5: Testar

1. Execute a aplicação: `npm run dev`
2. Vá para a página de login
3. Clique em **Entrar com Google**
4. Deve redirecionar para tela de login do Google
5. Após autorizar, deve voltar logado na aplicação

---

## 🔧 Configuração do GitHub OAuth

### Passo 1: Criar OAuth App no GitHub

1. Acesse: https://github.com/settings/developers
2. Clique em **OAuth Apps** > **New OAuth App**
3. Preencha:
   - **Application name:** DuduFisio-AI
   - **Homepage URL:** `http://localhost:5176` (dev) ou `https://seu-dominio.com` (prod)
   - **Authorization callback URL:** 
     ```
     https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/callback
     ```
4. Clique em **Register application**
5. **COPIE** o **Client ID**
6. Clique em **Generate a new client secret**
7. **COPIE** o **Client Secret** (só aparece uma vez!)

### Passo 2: Configurar no Supabase

1. Acesse: https://app.supabase.com/project/urfxniitfbbvsaskicfo
2. Vá em **Authentication** > **Providers**
3. Encontre **GitHub** na lista
4. Clique em **Enable**
5. Cole:
   - **Client ID:** (copiado do passo anterior)
   - **Client Secret:** (copiado do passo anterior)
6. Clique em **Save**

### Passo 3: Testar

1. Execute a aplicação: `npm run dev`
2. Vá para a página de login
3. Clique em **Entrar com GitHub**
4. Deve redirecionar para autorização do GitHub
5. Após autorizar, deve voltar logado na aplicação

---

## 🐛 Troubleshooting

### Erro 400 (Bad Request)

**Problema:** Provider não configurado ou credenciais inválidas

**Solução:**
1. Verifique se o provider está **enabled** no Supabase
2. Confirme que Client ID e Secret estão corretos
3. Verifique se a URL de callback está correta

### Erro 401 (Unauthorized)

**Problema:** Client Secret incorreto

**Solução:**
1. Gere um novo Client Secret no Google/GitHub
2. Atualize no Supabase

### Redirect URI Mismatch

**Problema:** URL de callback não autorizada

**Solução:**
1. No Google Cloud Console, adicione todas as URLs possíveis:
   - `http://localhost:5176/auth/callback`
   - `http://localhost:5175/auth/callback`
   - `http://localhost:5173/auth/callback`
   - `https://seu-dominio.com/auth/callback`
2. No Supabase, a callback URL é sempre:
   - `https://[seu-projeto].supabase.co/auth/v1/callback`

### "This app is blocked"

**Problema:** App não verificado pelo Google

**Solução:**
1. Para desenvolvimento: Adicione usuários de teste
2. Para produção: Submeta app para verificação do Google

---

## 📝 Checklist de Configuração

### Google OAuth:
- [ ] Projeto criado no Google Cloud Console
- [ ] Tela de consentimento configurada
- [ ] Credenciais OAuth criadas
- [ ] Authorized redirect URIs adicionadas
- [ ] Client ID e Secret copiados
- [ ] Provider habilitado no Supabase
- [ ] Credenciais coladas no Supabase
- [ ] Testado e funcionando

### GitHub OAuth:
- [ ] OAuth App criado no GitHub
- [ ] Homepage URL configurada
- [ ] Callback URL configurada
- [ ] Client ID e Secret copiados
- [ ] Provider habilitado no Supabase
- [ ] Credenciais coladas no Supabase
- [ ] Testado e funcionando

---

## 🔒 Segurança

### Boas Práticas:

1. **NUNCA** commite Client Secrets no Git
2. Use variáveis de ambiente para credenciais
3. Rotacione secrets periodicamente
4. Limite scopes ao mínimo necessário
5. Em produção, use HTTPS sempre

### Variáveis de Ambiente:

Não é necessário no código (Supabase gerencia), mas para referência:

```env
# .env.local (NÃO commitar!)
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
# Client Secret fica APENAS no Supabase Dashboard
```

---

## 🚀 Uso no Código

### Login com Google:

```typescript
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

function LoginButton() {
  const { loginWithGoogle } = useSupabaseAuth();
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirecionamento automático para Google
    } catch (error) {
      console.error('Erro no login:', error);
      alert(error.message);
    }
  };
  
  return (
    <button onClick={handleGoogleLogin}>
      Entrar com Google
    </button>
  );
}
```

### Login com GitHub:

```typescript
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

function LoginButton() {
  const { loginWithGitHub } = useSupabaseAuth();
  
  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
      // Redirecionamento automático para GitHub
    } catch (error) {
      console.error('Erro no login:', error);
      alert(error.message);
    }
  };
  
  return (
    <button onClick={handleGitHubLogin}>
      Entrar com GitHub
    </button>
  );
}
```

---

## 📚 Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Developer Settings](https://github.com/settings/developers)

---

## ❓ Suporte

Se ainda tiver problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs no Supabase Dashboard
3. Consulte a documentação oficial do Supabase
4. Abra uma issue no repositório

---

**Última Atualização:** ${new Date().toLocaleString('pt-BR')}  
**Versão do Supabase:** v2.x  
**Projeto:** urfxniitfbbvsaskicfo

