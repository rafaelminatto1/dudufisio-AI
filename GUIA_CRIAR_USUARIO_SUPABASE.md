# 📋 Guia Passo a Passo: Criar Usuário no Supabase Dashboard

## 🎯 Objetivo

Criar o usuário de teste `admin@dudufisio.com` no Supabase para poder fazer login e testar o sistema.

---

## 📝 Passo a Passo Detalhado

### 1️⃣ Acessar o Supabase Dashboard

1. Abra seu navegador
2. Acesse: **https://app.supabase.com**
3. Faça login na sua conta do Supabase

### 2️⃣ Selecionar o Projeto

1. Se você tem múltiplos projetos, selecione o projeto correto
2. Aguarde o dashboard carregar completamente

### 3️⃣ Navegar para Authentication

1. No menu lateral esquerdo, procure por **"Authentication"**
2. Clique em **"Authentication"**
3. Você verá várias abas: **Users**, **Policies**, **Providers**, etc.
4. Clique na aba **"Users"** (ou já estará selecionada)

### 4️⃣ Criar Novo Usuário

1. No canto superior direito, procure pelo botão **"Add User"** ou **"Invite User"**
2. Clique no botão
3. Um modal/formulário aparecerá

### 5️⃣ Preencher o Formulário

Preencha os seguintes campos:

- **Email**: `admin@dudufisio.com`
- **Password**: `demo123456`
- **Auto Confirm User?**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)

**⚠️ IMPORTANTE**: 
- Marque "Auto Confirm User?" para que o email seja confirmado automaticamente
- Isso permite fazer login imediatamente sem precisar confirmar email

### 6️⃣ Criar o Usuário

1. Clique no botão **"Create User"** ou **"Add User"**
2. Aguarde a confirmação
3. O usuário deve aparecer na lista de usuários

### 7️⃣ Verificar Criação

1. Procure pelo email `admin@dudufisio.com` na lista
2. Verifique se a coluna **"Email Confirmed"** mostra ✅ (check)
3. Se não estiver confirmado:
   - Clique no usuário para abrir os detalhes
   - Procure pela opção para confirmar o email
   - Ou marque "Email Confirmed" manualmente

---

## ✅ Após Criar o Usuário

### Testar Login

1. Acesse: **http://localhost:3000/login**
2. Preencha:
   - **Email**: `admin@dudufisio.com`
   - **Senha**: `demo123456`
3. Clique em **"Entrar"**
4. Você deve ser redirecionado para o dashboard

### Testar Funcionalidades

Após login bem-sucedido, teste:

1. **Cadastro de Paciente**
   - URL: http://localhost:3000/dashboard/pacientes/novo
   - Teste criar um novo paciente

2. **Agenda**
   - URL: http://localhost:3000/dashboard/agenda
   - Teste visualizar e criar agendamentos

3. **Financeiro**
   - URL: http://localhost:3000/dashboard/financeiro/pagamentos
   - Teste criar transações

---

## 🐛 Problemas e Soluções

### Problema: "User already exists"

**Solução**: 
- O usuário já foi criado anteriormente
- Você pode fazer login diretamente
- Ou atualizar a senha no dashboard

### Problema: "Email not confirmed"

**Solução**:
- No dashboard, clique no usuário
- Marque "Email Confirmed" manualmente
- Ou recrie o usuário marcando "Auto Confirm User?"

### Problema: "Cannot login"

**Solução**:
1. Verifique se o email está correto: `admin@dudufisio.com`
2. Verifique se a senha está correta: `demo123456`
3. Verifique se o email está confirmado no dashboard
4. Limpe o cache do navegador e tente novamente

---

## 📸 Screenshots de Referência

### Localização do Botão "Add User"
- Geralmente no canto superior direito da página Users
- Pode aparecer como "Invite User" ou "Add User"

### Formulário de Criação
- Email: Campo de texto
- Password: Campo de senha
- Auto Confirm User?: Checkbox (IMPORTANTE marcar!)

---

## 🎯 Resumo Rápido

1. ✅ Acesse: https://app.supabase.com
2. ✅ Vá em: Authentication → Users
3. ✅ Clique em: "Add User"
4. ✅ Preencha:
   - Email: `admin@dudufisio.com`
   - Password: `demo123456`
   - ✅ Marque: "Auto Confirm User?"
5. ✅ Clique em: "Create User"
6. ✅ Teste login em: http://localhost:3000/login

---

**✅ Pronto! Após seguir estes passos, você terá um usuário de teste funcional.**

