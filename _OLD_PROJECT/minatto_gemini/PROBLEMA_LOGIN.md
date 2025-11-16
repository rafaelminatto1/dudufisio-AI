# 🔐 Problema: Login Não Está Funcionando

**Data**: 14 de novembro de 2025
**Status**: ✅ Diagnosticado

---

## 🚨 Sintoma Reportado

```
Console mostra:
Login attempt: {email: 'admin@dudufisio.com', password: 'DuduFisio2024!'}

Mas a tela não muda e o login não funciona.
```

---

## 🔍 Diagnóstico

### Causa Raiz Identificada

❌ **Credenciais incorretas!**

Você está tentando fazer login com:
- **Email**: `admin@dudufisio.com`
- **Senha**: `DuduFisio2024!`

**Problema**: Essas credenciais não existem no sistema!

---

## 📊 Como o Sistema de Autenticação Funciona

### Estrutura Atual

O sistema tem **3 níveis de autenticação**:

```
┌──────────────────────────────────────────────────┐
│ NÍVEL 1: Autenticação REAL (Supabase)           │
│ - admin@moocafisio.com.br (conta real)          │
│ - Requer que o usuário exista no banco Supabase │
└──────────────────────────────────────────────────┘
          ↓ (se falhar)
┌──────────────────────────────────────────────────┐
│ NÍVEL 2: Autenticação DEMO (Mock)                │
│ - therapist@moocafisio.com.br / demo123456       │
│ - patient@moocafisio.com.br / demo123456         │
│ - educator@moocafisio.com.br / demo123456        │
└──────────────────────────────────────────────────┘
          ↓ (se falhar)
┌──────────────────────────────────────────────────┐
│ NÍVEL 3: Força Mock (apenas dev)                 │
│ - admin@dudufisio.com / DuduFisio2024!           │
│ - Só funciona se VITE_FORCE_MOCK_AUTH=true       │
└──────────────────────────────────────────────────┘
```

### Análise do Código

**Arquivo**: `services/auth/supabaseAuthService.ts`

#### Linha 247-260: Função shouldUseMockAuth
```typescript
private shouldUseMockAuth(credentials: LoginCredentials): boolean {
  // 🔧 Força mock auth (APENAS SE VARIÁVEL DE AMBIENTE ESTIVER ATIVA)
  if (isForceMockAuth) {
    return credentials.email.toLowerCase() === 'admin@dudufisio.com'
        && credentials.password === 'DuduFisio2024!';
  }

  // ✅ Contas DEMO que funcionam
  const demoCredentials = [
    'therapist@moocafisio.com.br',
    'patient@moocafisio.com.br',
    'educator@moocafisio.com.br'
  ];
  return demoCredentials.includes(credentials.email)
      && credentials.password === 'demo123456';
}
```

#### Linha 269-270: Comentário Importante
```typescript
// ⚠️ IMPORTANTE: admin@moocafisio.com.br foi REMOVIDO daqui
// Agora usa autenticação REAL no Supabase
```

---

## ✅ SOLUÇÕES

### Opção 1: Usar Contas DEMO (Mais Rápido) ⭐

Essas contas funcionam IMEDIATAMENTE sem configuração:

#### 🏥 Fisioterapeuta
```
Email: therapist@moocafisio.com.br
Senha: demo123456
```

#### 🧑‍⚕️ Paciente
```
Email: patient@moocafisio.com.br
Senha: demo123456
```

#### 🏃 Educador Físico
```
Email: educator@moocafisio.com.br
Senha: demo123456
```

**Como usar**:
1. Abra `http://localhost:5173`
2. Clique em "Contas Demo" (se disponível)
3. Ou digite manualmente as credenciais acima
4. Login deve funcionar instantaneamente ✅

---

### Opção 2: Criar Usuário Admin no Supabase

Se você precisa de uma conta de **Administrador real**:

#### Passo 1: Acessar Supabase
1. Vá para https://supabase.com
2. Faça login no projeto MoocaFisio

#### Passo 2: Criar Usuário
1. No painel Supabase, vá em **Authentication** > **Users**
2. Clique em **Add User**
3. Preencha:
   ```
   Email: admin@moocafisio.com.br
   Password: [sua senha segura]
   ```
4. Confirmar email automaticamente (checkbox)

#### Passo 3: Configurar Perfil
1. Vá em **Table Editor** > **profiles**
2. Encontre o usuário recém-criado
3. Edite os campos:
   ```json
   {
     "id": "[uuid do auth.users]",
     "email": "admin@moocafisio.com.br",
     "full_name": "Administrador",
     "role": "admin",
     "avatar_url": "",
     "phone": "+55 11 99999-0000"
   }
   ```

#### Passo 4: Testar Login
```
Email: admin@moocafisio.com.br
Senha: [a senha que você definiu]
```

---

### Opção 3: Ativar Modo de Desenvolvimento Mock

Se você quer usar `admin@dudufisio.com` temporariamente:

#### Passo 1: Criar arquivo .env.local
```bash
# Criar arquivo na raiz do projeto
touch .env.local

# Ou no Windows PowerShell
New-Item -Path ".env.local" -ItemType File
```

#### Passo 2: Adicionar variável
Abra `.env.local` e adicione:
```env
VITE_FORCE_MOCK_AUTH=true
```

#### Passo 3: Reiniciar servidor
```bash
# Fechar servidor (Ctrl + C)
# Reiniciar
npm run dev
```

#### Passo 4: Fazer login
```
Email: admin@dudufisio.com
Senha: DuduFisio2024!
```

⚠️ **AVISO**: Este modo é apenas para desenvolvimento. NÃO use em produção!

---

## 🎯 Recomendação

**Use a Opção 1** (Contas DEMO) para testar rapidamente:

```
Email: therapist@moocafisio.com.br
Senha: demo123456
```

Esta conta tem acesso a todas as funcionalidades principais do sistema.

---

## 🔧 Debug Adicional

Se mesmo com as credenciais corretas o login não funcionar:

### 1. Verificar Console do Navegador

Abra DevTools (F12) > Console e procure por:

```javascript
// Login bem-sucedido mostra:
✅ Login via Supabase bem-sucedido

// Ou login demo:
📋 Usando autenticação mock para credenciais demo

// Erro mostra:
❌ Login Supabase falhou
```

### 2. Verificar Network Tab

1. Abra DevTools (F12) > Network
2. Tente fazer login
3. Procure por requisições para:
   - `supabase.co/auth/v1/token?grant_type=password`
   - Status deve ser `200 OK`

### 3. Verificar Variáveis de Ambiente

Execute no terminal:
```bash
# Ver variáveis carregadas
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Ou no Windows PowerShell
$env:VITE_SUPABASE_URL
$env:VITE_SUPABASE_ANON_KEY
```

Se não aparecer nada, significa que o arquivo `.env` ou `.env.local` não está sendo carregado.

### 4. Verificar arquivo .env

Deve ter no mínimo:
```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-anonima]
```

---

## 📝 Checklist de Solução Rápida

- [ ] Usar credencial demo: `therapist@moocafisio.com.br` / `demo123456`
- [ ] Limpar cache do navegador (Ctrl + Shift + Del)
- [ ] Hard refresh (Ctrl + F5)
- [ ] Verificar se todos os 5 servidores estão rodando (`npm run dev`)
- [ ] Verificar console por erros adicionais
- [ ] Verificar Network tab por requisições falhadas

---

## 🎓 Credenciais Válidas - Resumo

### ✅ Funcionam AGORA (Demo)
```
therapist@moocafisio.com.br / demo123456
patient@moocafisio.com.br / demo123456
educator@moocafisio.com.br / demo123456
```

### ❓ Podem Funcionar (Requer Supabase)
```
admin@moocafisio.com.br / [precisa criar no Supabase]
```

### ❌ NÃO Funcionam (Exceto com VITE_FORCE_MOCK_AUTH=true)
```
admin@dudufisio.com / DuduFisio2024!
```

---

## 📚 Arquivos Relacionados

- `pages/auth/LoginPage.tsx` - Interface de login
- `services/auth/supabaseAuthService.ts` - Lógica de autenticação
- `contexts/SupabaseAuthContext.tsx` - Contexto de autenticação
- `.env` ou `.env.local` - Variáveis de ambiente

---

**Autor**: Claude Code
**Última atualização**: 2025-11-14
**Versão**: 1.0
