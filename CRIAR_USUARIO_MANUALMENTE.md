# 👤 Criar Usuário de Teste - Instruções Manuais

## ⚠️ Situação Atual

O Supabase requer autenticação (login) antes de acessar o dashboard. Como não posso fazer login automaticamente, você precisa fazer login manualmente primeiro.

---

## 📋 Passo a Passo Completo

### 1️⃣ Fazer Login no Supabase

1. **Acesse**: https://app.supabase.com
2. **Faça login** usando uma das opções:
   - GitHub (recomendado)
   - Email e senha
   - SSO

### 2️⃣ Selecionar o Projeto

1. Após login, selecione o projeto: **dudufisio-AI**
2. Ou acesse diretamente: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo

### 3️⃣ Navegar para Authentication → Users

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique na aba **"Users"** (ou já estará selecionada)

### 4️⃣ Criar Novo Usuário

1. No canto superior direito, clique no botão **"Add User"** ou **"Invite User"**
2. Um modal/formulário aparecerá

### 5️⃣ Preencher o Formulário

Preencha os seguintes campos:

- **Email**: `admin@dudufisio.com`
- **Password**: `demo123456`
- ✅ **Marque**: **"Auto Confirm User?"** (MUITO IMPORTANTE!)

### 6️⃣ Criar o Usuário

1. Clique no botão **"Create User"** ou **"Add User"**
2. Aguarde a confirmação
3. O usuário deve aparecer na lista

### 7️⃣ Verificar Criação

1. Procure pelo email `admin@dudufisio.com` na lista
2. Verifique se a coluna **"Email Confirmed"** mostra ✅ (check)
3. Se não estiver confirmado, clique no usuário e confirme manualmente

---

## ✅ Após Criar o Usuário

### Testar Login no Sistema

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

## 🎯 Resumo Rápido

1. ✅ Faça login em: https://app.supabase.com
2. ✅ Vá em: Authentication → Users
3. ✅ Clique em: "Add User"
4. ✅ Preencha:
   - Email: `admin@dudufisio.com`
   - Password: `demo123456`
   - ✅ Marque: "Auto Confirm User?"
5. ✅ Clique em: "Create User"
6. ✅ Teste login em: http://localhost:3000/login

---

## 📝 Credenciais do Usuário

**Email**: `admin@dudufisio.com`  
**Senha**: `demo123456`  
**Role**: `Admin`

---

**✅ Após seguir estes passos, você terá um usuário de teste funcional e poderá testar todas as funcionalidades do sistema!**

