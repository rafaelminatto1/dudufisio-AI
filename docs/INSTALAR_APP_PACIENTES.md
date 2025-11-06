# 🚀 Instalação do App para Pacientes - MoocaFisio

## ⚡ Passos Rápidos de Instalação

### 1️⃣ Aplicar Migration no Supabase

Acesse o **Supabase Dashboard** > **SQL Editor** e cole o conteúdo do arquivo:
```
supabase/migrations/20251106011801_patient_app_system.sql
```

Ou execute via CLI (se configurado):
```bash
npx supabase db push
```

### 2️⃣ Criar Storage Bucket para Vídeos

No Supabase Dashboard > **Storage** > Criar bucket:
- **Nome**: `exercise-videos`
- **Público**: ✅ Sim
- **Tamanho máximo**: 500MB

### 3️⃣ Configurar Variáveis de Ambiente

Adicione no arquivo `.env.local` (root do projeto):

```bash
# JWT para autenticação de pacientes
PATIENT_JWT_SECRET=moocafisio-patient-secret-change-in-production-2025

# Supabase (já deve estar configurado)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# API URL
VITE_API_URL=http://localhost:3000/api
```

### 4️⃣ Instalar Dependências

```bash
# Root (se ainda não fez)
npm install

# Patient Portal
cd packages/patient-portal
npm install
```

### 5️⃣ Iniciar o Sistema

**Terminal 1 - Host:**
```bash
npm run dev:host
```

**Terminal 2 - Patient Portal:**
```bash
cd packages/patient-portal
npm run dev
```

### 6️⃣ Acessar

- **Fisioterapeuta**: http://localhost:5173
- **App Paciente**: http://localhost:5173/patient/login

## ✅ Verificação Rápida

1. Faça login como fisioterapeuta
2. Acesse um paciente
3. Gere um código de acesso
4. Abra nova aba anônima
5. Acesse `/patient/login`
6. Use o código gerado
7. ✨ Pronto!

## 🐛 Troubleshooting

**Erro de Migration?**
- Verifique se todas as tabelas `patients`, `users` existem
- Execute a migration via Dashboard do Supabase

**Erro de CORS?**
- Adicione `http://localhost:5177` nas configurações de CORS do Supabase

**Erro de JWT?**
- Verifique se `PATIENT_JWT_SECRET` está configurado no `.env.local`

**Module Federation não carrega?**
- Certifique-se que os 5 micro-frontends estão rodando:
  - Host: 5173
  - Agenda: 5174
  - Tratamentos: 5175
  - Financeiro: 5176
  - Patient Portal: 5177

