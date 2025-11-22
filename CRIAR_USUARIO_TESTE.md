# 👤 Como Criar Usuário de Teste no Supabase

## 🎯 Método 1: Via Dashboard do Supabase (Recomendado)

### Passo 1: Acessar o Dashboard

1. Acesse: **https://app.supabase.com**
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Ir para Authentication

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Users"** (ou vá direto para a aba Users)

### Passo 3: Criar Usuário

1. Clique no botão **"Add User"** (canto superior direito)
2. Preencha o formulário:
   - **Email**: `admin@dudufisio.com`
   - **Password**: `demo123456`
   - ✅ **Marque**: "Auto Confirm User?" (IMPORTANTE!)
3. Clique em **"Create User"**

### Passo 4: Verificar Criação

1. O usuário deve aparecer na lista
2. Verifique se o email está confirmado (coluna "Email Confirmed")
3. Se não estiver, clique no usuário e marque como confirmado

---

## 🎯 Método 2: Via API (Script)

Se preferir usar o script, certifique-se de que o `.env.local` está configurado:

```bash
# Executar o script
npx tsx scripts/create-test-user.ts
```

**Requisitos:**
- Arquivo `.env.local` na raiz do projeto
- Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` configuradas

---

## 🎯 Método 3: Via SQL (Alternativo)

Se os métodos acima não funcionarem, você pode criar via SQL Editor:

1. Acesse: **SQL Editor** no dashboard do Supabase
2. Execute o seguinte SQL:

```sql
-- Criar usuário via SQL (requer service_role_key)
-- NOTA: Este método requer acesso direto à API do Supabase Auth
-- É mais fácil usar o Dashboard ou o script
```

**Recomendação**: Use o **Método 1 (Dashboard)** que é o mais simples e confiável.

---

## ✅ Após Criar o Usuário

### 1. Atualizar Perfil (Opcional)

Se quiser atualizar o perfil na tabela `profiles`, execute no SQL Editor:

```sql
-- Atualizar role do Admin
UPDATE profiles 
SET role = 'Admin', 
    name = 'Administrador', 
    specialty = 'Gestão' 
WHERE email = 'admin@dudufisio.com';
```

**Nota**: O perfil pode ser criado automaticamente por um trigger, mas se não for, execute o SQL acima.

### 2. Testar Login

1. Acesse: **http://localhost:3000/login**
2. Faça login com:
   - **Email**: `admin@dudufisio.com`
   - **Senha**: `demo123456`

### 3. Testar Funcionalidades

Após login, teste:
- ✅ Cadastro de paciente: `/dashboard/pacientes/novo`
- ✅ Agenda: `/dashboard/agenda`
- ✅ Financeiro: `/dashboard/financeiro/pagamentos`

---

## 🐛 Problemas Comuns

### "User already exists"
- ✅ O usuário já foi criado anteriormente
- ✅ Você pode fazer login diretamente
- ✅ Ou atualizar a senha no dashboard

### "Email not confirmed"
- ✅ Marque "Auto Confirm User?" ao criar
- ✅ Ou confirme manualmente no dashboard

### "Cannot login"
- ✅ Verifique se o email está correto
- ✅ Verifique se a senha está correta
- ✅ Verifique se o email está confirmado

---

## 📝 Credenciais do Usuário de Teste

**Email**: `admin@dudufisio.com`  
**Senha**: `demo123456`  
**Role**: `Admin`

---

**✅ Pronto! Após criar o usuário, você pode fazer login e testar o sistema.**

