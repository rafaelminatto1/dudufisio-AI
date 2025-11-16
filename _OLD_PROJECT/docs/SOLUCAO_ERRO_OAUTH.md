# 🔧 SOLUÇÃO: Erro 400 no Login Google

**Data:** ${new Date().toLocaleString('pt-BR')}

---

## ❌ ERRO IDENTIFICADO

```
GET https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/authorize?provider=google 400 (Bad Request)
```

---

## 🎯 CAUSA

O provider **Google OAuth** não está configurado no Supabase Dashboard.

---

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Configurar Google OAuth (Recomendado para Produção)

1. **Acesse o Supabase Dashboard:**
   - https://app.supabase.com/project/urfxniitfbbvsaskicfo
   - Vá em **Authentication** > **Providers**
   - Procure **Google** na lista

2. **Verifique o Status:**
   - Se estiver **Disabled** → Precisa configurar
   - Se estiver **Enabled** → Verifique as credenciais

3. **Configurar (se necessário):**
   - Siga o guia completo em: **`docs/OAUTH_SETUP.md`**
   - Você precisará criar credenciais no Google Cloud Console
   - Tempo estimado: 10-15 minutos

### Opção 2: Desabilitar Login Social (Temporário para Desenvolvimento)

Se você não precisa de login social agora, pode desabilitar temporariamente:

**Arquivo:** `pages/auth/LoginPage.tsx` ou similar

Comente ou remova os botões de login social:

```typescript
{/* Desabilitado temporariamente até configurar OAuth
<button onClick={handleGoogleLogin}>
  Entrar com Google
</button>
<button onClick={handleGitHubLogin}>
  Entrar com GitHub
</button>
*/}
```

---

## 🔍 O QUE FOI FEITO

### Melhorias Implementadas:

✅ **Tratamento de Erro Melhorado**

**Arquivo:** `services/auth/supabaseAuthService.ts`

```typescript
async loginWithGoogle(): Promise<void> {
  try {
    console.log('🔵 [AUTH] Iniciando login com Google...');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ [AUTH] Erro no login Google:', error);
      
      // Mensagem de erro amigável
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        throw new Error(
          'Login com Google não está configurado. ' +
          'Por favor, configure o provider Google no Supabase Dashboard. ' +
          'Veja a documentação em docs/OAUTH_SETUP.md'
        );
      }
      
      throw error;
    }
    
    console.log('✅ [AUTH] Redirecionando para Google...');
  } catch (error: any) {
    console.error('❌ [AUTH] Erro fatal no login Google:', error);
    throw error;
  }
}
```

**Benefícios:**
- ✅ Mensagem de erro clara e amigável
- ✅ Logs detalhados para debugging
- ✅ Link para documentação de configuração
- ✅ Mesmo tratamento para GitHub OAuth

---

## 📚 DOCUMENTAÇÃO CRIADA

✅ **Guia Completo de OAuth**

**Arquivo:** `docs/OAUTH_SETUP.md`

**Conteúdo:**
- Passo a passo para configurar Google OAuth
- Passo a passo para configurar GitHub OAuth
- Troubleshooting de erros comuns
- Checklists de configuração
- Boas práticas de segurança
- Exemplos de código

---

## 🎯 PRÓXIMOS PASSOS

### Se você precisa de Login Social:

1. **Leia a documentação:**
   ```bash
   # Abrir arquivo
   code docs/OAUTH_SETUP.md
   ```

2. **Configure Google OAuth:**
   - Siga os passos no guia
   - Tempo: ~10-15 minutos
   - Requer conta Google Cloud

3. **Teste:**
   - Execute `npm run dev`
   - Clique em "Entrar com Google"
   - Deve funcionar!

### Se você NÃO precisa de Login Social agora:

1. **Desabilite os botões:**
   - Comente código dos botões sociais
   - Use apenas email/senha

2. **Configure depois:**
   - Quando precisar, siga `docs/OAUTH_SETUP.md`

---

## 🐛 OUTROS ERROS COMUNS

### Erro 401 (Unauthorized)
- **Causa:** Client Secret incorreto
- **Solução:** Verifique credenciais no Supabase

### Redirect URI Mismatch
- **Causa:** URL de callback não autorizada
- **Solução:** Adicione URLs corretas no Google Cloud Console

### "This app is blocked"
- **Causa:** App não verificado pelo Google
- **Solução:** Adicione usuários de teste (dev) ou submeta para verificação (prod)

---

## ✅ CHECKLIST

- [x] Erro identificado (400 Bad Request)
- [x] Causa identificada (OAuth não configurado)
- [x] Tratamento de erro melhorado
- [x] Documentação completa criada
- [ ] OAuth configurado no Supabase (próximo passo)
- [ ] Testado e funcionando

---

## 📞 AJUDA ADICIONAL

**Se precisar de ajuda:**

1. Leia `docs/OAUTH_SETUP.md` completo
2. Verifique logs no console: `🔵 [AUTH]` e `❌ [AUTH]`
3. Consulte documentação oficial: https://supabase.com/docs/guides/auth

---

**Status:** ⚠️ Configuração Pendente  
**Ação:** Configure OAuth seguindo `docs/OAUTH_SETUP.md`  
**Alternativa:** Desabilite login social temporariamente

