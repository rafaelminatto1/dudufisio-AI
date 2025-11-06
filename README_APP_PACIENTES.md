# 🏥 App para Pacientes - MoocaFisio

Sistema completo de aplicativo para pacientes acessarem seus exercícios, acompanharem evolução e se comunicarem com fisioterapeutas.

## 🎯 Funcionalidades Implementadas

### ✅ Backend e Infraestrutura
- **Migration Supabase completa** com todas as tabelas necessárias
- **RLS Policies** para segurança dos dados
- **Storage bucket** para vídeos de exercícios
- **Functions** para gerar códigos e validar acesso
- **APIs serverless** no Vercel para autenticação, exercícios e estatísticas

### ✅ Autenticação
- Sistema de login com código de 6 dígitos
- JWT com expiração de 7 dias
- Middleware de proteção de rotas
- Logs de acesso para auditoria

### ✅ App do Paciente
- **Dashboard** com estatísticas e gráficos de progresso
- **Lista de exercícios** com filtros (todos, pendentes, concluídos)
- **Modal de exercício** com player de vídeo (YouTube, Vimeo, Storage)
- **Perfil do paciente** com informações pessoais
- **Layout responsivo** com bottom navigation (mobile) e sidebar (desktop)

### ✅ Painel do Fisioterapeuta
- **Componente de geração de código** integrado na página do paciente
- **Sistema de upload de vídeos** para Supabase Storage
- Suporte para URLs externas (YouTube, Vimeo)
- Gerenciamento de biblioteca de vídeos

### ✅ Module Federation
- Patient Portal como microfrontend independente
- Integração com sistema host via Module Federation
- Rotas configuradas: `/patient/login`, `/patient/dashboard`, `/patient/exercises`, `/patient/profile`

## 📂 Estrutura do Projeto

```
packages/patient-portal/          # App do Paciente
├── src/
│   ├── pages/                   # Páginas principais
│   │   ├── PatientLoginPage.tsx
│   │   ├── PatientDashboardPage.tsx
│   │   ├── PatientExercisesPage.tsx
│   │   └── PatientProfilePage.tsx
│   ├── components/              # Componentes reutilizáveis
│   │   ├── PatientLayout.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseModal.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── ui/                  # Componentes de UI base
│   ├── services/                # Serviços de API
│   │   ├── patientAuthService.ts
│   │   ├── patientExerciseService.ts
│   │   └── patientStatsService.ts
│   └── lib/                     # Utilitários
│       └── utils.ts
├── package.json
├── vite.config.ts
└── tailwind.config.ts

packages/agenda-pacientes/src/
└── components/
    ├── GeneratePatientAccessCode.tsx    # Gerar código para paciente
    └── exercise-videos/
        └── VideoUploadModal.tsx          # Upload de vídeos

api/patient/                     # APIs Serverless
├── _lib/
│   ├── jwt.ts                  # Utilitários JWT
│   ├── supabase.ts             # Cliente Supabase
│   └── middleware.ts           # Middlewares de autenticação
├── login.ts                    # POST - Login com código
├── exercises.ts                # GET - Listar exercícios
├── exercises/[id]/complete.ts  # POST - Marcar como concluído
├── stats.ts                    # GET - Estatísticas do paciente
└── generate-code.ts            # POST - Gerar código (fisioterapeuta)

supabase/migrations/
└── 20251106011801_patient_app_system.sql

tests/e2e/
└── patient-app.spec.ts         # Testes E2E completos
```

## 🚀 Como Usar

### 1. Aplicar Migration no Supabase

```bash
# Via Supabase CLI
supabase db push

# Ou via Dashboard do Supabase
# Cole o conteúdo de supabase/migrations/20251106011801_patient_app_system.sql
# no SQL Editor e execute
```

### 2. Configurar Variáveis de Ambiente

Adicione no `.env.local` ou nas variáveis do Vercel:

```bash
# JWT
PATIENT_JWT_SECRET=your-secret-key-change-in-production
JWT_SECRET=your-secret-key-change-in-production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
VITE_API_URL=https://moocafisio.com.br/api
```

### 3. Instalar Dependências

```bash
# Root
npm install

# Patient Portal
cd packages/patient-portal
npm install
```

### 4. Iniciar em Desenvolvimento

```bash
# Terminal 1: Host
npm run dev:host

# Terminal 2: Patient Portal
cd packages/patient-portal
npm run dev
```

### 5. Acessar o App

- **Fisioterapeuta**: http://localhost:5173
- **App do Paciente**: http://localhost:5173/patient/login

## 📱 Fluxo de Uso

### Para o Fisioterapeuta:

1. Faça login no sistema
2. Acesse a página de detalhes do paciente
3. Clique em "Gerar Código de Acesso"
4. Compartilhe o código de 6 dígitos com o paciente

### Para o Paciente:

1. Acesse `https://moocafisio.com.br/patient/login`
2. Digite o código de 6 dígitos fornecido pelo fisioterapeuta
3. Acesse o dashboard e visualize suas estatísticas
4. Vá para "Exercícios" e veja os exercícios prescritos
5. Clique em um exercício para ver vídeo e instruções
6. Marque como concluído após realizar

## 🎨 Design e UX

- **Mobile-first**: Todo o design prioriza dispositivos móveis
- **Bottom Navigation**: Navegação intuitiva no mobile
- **Responsivo**: Adapta-se perfeitamente a tablets e desktops
- **Feedback visual**: Loading states, animações suaves
- **Acessibilidade**: Componentes acessíveis e semânticos

## 🔒 Segurança

- **RLS Policies**: Paciente só acessa seus próprios dados
- **JWT**: Tokens com expiração de 7 dias
- **Códigos únicos**: Códigos de 6 caracteres únicos e com expiração
- **Logs**: Auditoria completa de acessos
- **Middleware**: Proteção de rotas e validação de tokens

## 🧪 Testes

Execute os testes E2E:

```bash
npm run test:e2e -- patient-app.spec.ts
```

Testes cobrem:
- Geração de código pelo fisioterapeuta
- Login do paciente
- Visualização do dashboard
- Lista e filtros de exercícios
- Abertura de modal e conclusão de exercício
- Navegação e logout
- Responsividade mobile

## 📊 APIs Disponíveis

### POST /api/patient/login
Autentica paciente com código de acesso.

**Body:**
```json
{
  "accessCode": "ABC123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "patient": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### GET /api/patient/exercises
Lista exercícios do paciente autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query:**
- `filter`: all | pending | completed

**Response:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "name": "Alongamento de quadríceps",
      "sets": 3,
      "reps": 10,
      "completed": false,
      "video": {
        "url": "https://...",
        "thumbnailUrl": "https://..."
      }
    }
  ],
  "total": 5
}
```

### POST /api/patient/exercises/:id/complete
Marca exercício como concluído.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (opcional):**
```json
{
  "difficultyLevel": 3,
  "painLevel": 2,
  "notes": "Senti um pouco de dor..."
}
```

### GET /api/patient/stats
Retorna estatísticas do paciente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "exercisesTotal": 10,
    "exercisesCompleted": 7,
    "completionRate": 70,
    "currentStreak": 5
  },
  "progressData": [...],
  "nextSession": {
    "date": "2025-11-15",
    "time": "14:00"
  }
}
```

### POST /api/patient/generate-code
Gera código de acesso (apenas fisioterapeutas).

**Headers:**
```
Authorization: Bearer <therapist-token>
```

**Body:**
```json
{
  "patientId": "uuid",
  "expiresInDays": 30
}
```

**Response:**
```json
{
  "code": "ABC123",
  "expiresAt": "2025-12-06T00:00:00Z"
}
```

## 🎯 Próximos Passos (Opcionais)

- [ ] Chat em tempo real com fisioterapeuta
- [ ] Notificações push para lembretes
- [ ] Gamificação e conquistas
- [ ] Integração com wearables
- [ ] Modo offline (PWA)
- [ ] Histórico detalhado de dor
- [ ] Feedback de vídeo do paciente executando

## 🏆 Diferenciais vs Vedius

✅ **Paridade alcançada:**
- Visualização de exercícios com vídeos
- Registro de execução
- Histórico de evolução
- Interface moderna e intuitiva

✨ **Diferenciais adicionais:**
- Integração nativa com sistema MoocaFisio
- Gráficos de progresso avançados
- Dashboard com estatísticas completas
- Sistema de código de acesso simples
- Upload de vídeos para storage próprio
- Suporte para YouTube e Vimeo

## 📝 Notas Importantes

1. **Branding**: Sempre use MoocaFisio (não DuduFisio)
2. **Email**: noreply@moocafisio.com.br
3. **Domínio**: moocafisio.com.br
4. **JWT Secret**: Mude em produção para uma chave forte
5. **Storage**: Configure bucket público no Supabase para vídeos

---

**Desenvolvido com ❤️ para MoocaFisio**

