# 🎯 Guia Rápido - App para Pacientes

## 🚀 Iniciar em 3 Passos

### 1. Aplicar Migration (MANUAL - UMA VEZ)

**A migration SQL já está no seu clipboard!** Basta:

1. Abrir: https://supabase.com/dashboard
2. SQL Editor
3. Ctrl+V (colar)
4. RUN

Ou cole o conteúdo destes 2 arquivos:
- `supabase/migrations/20251106011801_patient_app_system.sql`
- `supabase/migrations/20251106011802_storage_policies_patient.sql`

### 2. Popular Dados de Teste

```bash
npm run seed:patient
```

Isso irá:
- ✅ Criar paciente de teste
- ✅ Criar 3 vídeos de exercícios
- ✅ Prescrever exercícios
- ✅ Gerar código de acesso
- ✅ Salvar código em `CODIGO_ACESSO_TESTE.txt`

### 3. Iniciar Servidores

```bash
# Terminal 1
npm run dev:host

# Terminal 2  
npm run dev:patient
```

## ✨ Testar Agora!

### Como Fisioterapeuta:
1. Acesse: http://localhost:5173
2. Login: fisio@moocafisio.com.br
3. Vá em Pacientes > Clique em um paciente
4. Role até "Acesso ao App do Paciente"
5. Clique "Gerar Código de Acesso"
6. Copie o código

### Como Paciente:
1. Abra aba anônima
2. Acesse: http://localhost:5173/patient/login
3. Cole o código gerado
4. 🎉 Explore o app!

## 📱 Funcionalidades para Testar

### Dashboard
- ✅ Estatísticas (exercícios, sessões, sequência)
- ✅ Gráfico de progresso
- ✅ Próxima consulta
- ✅ Botão "Ver Meus Exercícios"

### Exercícios
- ✅ Lista de exercícios com cards
- ✅ Filtros: Todos / Pendentes / Concluídos
- ✅ Clicar em exercício abre modal
- ✅ Vídeo demonstrativo
- ✅ Instruções detalhadas
- ✅ Botão "Marcar como Concluído"

### Perfil
- ✅ Informações do paciente
- ✅ Ações rápidas
- ✅ Links de suporte
- ✅ Botão de logout

### Mobile
- ✅ Abra DevTools (F12)
- ✅ Toggle device toolbar (Ctrl+Shift+M)
- ✅ Selecione iPhone ou Android
- ✅ Veja bottom navigation funcionando

## 🎨 URLs de Teste

### Principais
- **Login Paciente**: http://localhost:5173/patient/login
- **Dashboard**: http://localhost:5173/patient/dashboard
- **Exercícios**: http://localhost:5173/patient/exercises
- **Perfil**: http://localhost:5173/patient/profile

### Fisioterapeuta
- **Login**: http://localhost:5173/auth/login
- **Pacientes**: http://localhost:5173/patients

## 🔧 Scripts Úteis

```bash
# Iniciar host
npm run dev:host

# Iniciar patient portal
npm run dev:patient

# Popular dados de teste
npm run seed:patient

# Rodar todos os servidores
npm run dev:host & npm run dev:patient

# Testes E2E
npm run test:e2e -- patient-app.spec.ts
```

## 🐛 Troubleshooting

### Erro "Migration não aplicada"
- Cole manualmente no Supabase Dashboard > SQL Editor

### Erro "Código inválido"
- Execute `npm run seed:patient` para gerar novo código
- Ou gere via interface do fisioterapeuta

### Porta 5177 ocupada
```bash
npx kill-port 5177
npm run dev:patient
```

### CORS Error
- Adicione `http://localhost:5177` nas configurações do Supabase

## ✅ Checklist de Teste

- [ ] ✅ Migration aplicada
- [ ] ✅ Dados de teste populados
- [ ] ✅ Código de acesso gerado
- [ ] ✅ Login funcionando
- [ ] ✅ Dashboard carregando
- [ ] ✅ Exercícios listando
- [ ] ✅ Modal abrindo
- [ ] ✅ Vídeo reproduzindo
- [ ] ✅ Marcar como concluído
- [ ] ✅ Estatísticas atualizando
- [ ] ✅ Navegação funcionando
- [ ] ✅ Mobile responsivo
- [ ] ✅ Logout funcionando

## 📊 Status do Sistema

```
Backend:      ✅ Migration pronta
APIs:         ✅ 5 endpoints criados
Frontend:     ✅ App completo
Integração:   ✅ Module Federation OK
Testes:       ✅ E2E escritos
Docs:         ✅ 4 guias criados
Dependências: ✅ Instaladas
Servidores:   ✅ Configurados
```

## 🎯 Próximo: Deploy em Produção

Quando testar localmente e estiver tudo OK:

1. Aplicar migrations em produção (Supabase)
2. Criar bucket em produção
3. Configurar env vars no Vercel:
   - `PATIENT_JWT_SECRET`
   - `VITE_API_URL=/api`
4. Deploy: `npm run vercel:deploy`

---

**Tudo pronto para testar! 🚀**

