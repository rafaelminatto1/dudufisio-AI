# ✅ Instruções para Criar Usuário de Teste

## 🎯 Método Recomendado: Dashboard do Supabase

Como o script requer configuração adicional, a forma mais simples é criar o usuário diretamente no dashboard do Supabase.

---

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard

👉 **https://app.supabase.com**

### 2. Faça Login

- Use suas credenciais do Supabase
- Selecione seu projeto

### 3. Vá para Authentication → Users

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique na aba **"Users"**

### 4. Clique em "Add User"

- Botão geralmente no canto superior direito
- Pode aparecer como "Invite User" ou "Add User"

### 5. Preencha o Formulário

**Email**: `admin@dudufisio.com`  
**Password**: `demo123456`  
**Auto Confirm User?**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)

### 6. Clique em "Create User"

- Aguarde a confirmação
- O usuário deve aparecer na lista

---

## ✅ Após Criar

### Testar Login

1. Acesse: **http://localhost:3000/login**
2. Faça login com:
   - Email: `admin@dudufisio.com`
   - Senha: `demo123456`

### Testar Funcionalidades

Após login, teste:
- ✅ Cadastro de paciente: `/dashboard/pacientes/novo`
- ✅ Agenda: `/dashboard/agenda`
- ✅ Financeiro: `/dashboard/financeiro/pagamentos`

---

## 📚 Documentação Criada

Guias detalhados foram criados:
- `CRIAR_USUARIO_TESTE.md` - Guia completo com 3 métodos
- `GUIA_CRIAR_USUARIO_SUPABASE.md` - Passo a passo detalhado

---

## 🐛 Problemas?

### "User already exists"
- ✅ O usuário já existe, você pode fazer login diretamente

### "Email not confirmed"
- ✅ Marque "Auto Confirm User?" ao criar
- ✅ Ou confirme manualmente no dashboard

### "Cannot login"
- ✅ Verifique email e senha
- ✅ Verifique se email está confirmado

---

**✅ Pronto! Siga os passos acima para criar o usuário e começar a testar o sistema.**

