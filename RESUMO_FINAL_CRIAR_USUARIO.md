# 📋 Resumo: Criar Usuário de Teste

## ✅ Status Atual

- ✅ Script criado: `scripts/create-test-user.ts`
- ✅ Guias criados: `CRIAR_USUARIO_TESTE.md`, `GUIA_CRIAR_USUARIO_SUPABASE.md`
- ⚠️ Script requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`

## 🎯 Solução Recomendada

**Criar usuário manualmente no Dashboard do Supabase** (método mais simples e confiável)

### Passos Rápidos:

1. Acesse: **https://app.supabase.com**
2. Vá em: **Authentication → Users**
3. Clique em: **"Add User"**
4. Preencha:
   - Email: `admin@dudufisio.com`
   - Password: `demo123456`
   - ✅ Marque: **"Auto Confirm User?"**
5. Clique em: **"Create User"**

### Testar:

1. Acesse: **http://localhost:3000/login**
2. Login: `admin@dudufisio.com` / `demo123456`
3. Teste as funcionalidades!

---

**✅ Tudo pronto! Siga os passos acima para criar o usuário.**

