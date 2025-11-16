# AI Context - DuduFisio-AI

## 📌 Guia para LLMs e Assistentes de IA

Este documento fornece contexto essencial para Large Language Models (LLMs) e assistentes de IA que trabalham com o codebase do DuduFisio-AI.

---

## 🎯 Propósito do Projeto

**DuduFisio-AI** é um sistema de gestão para clínicas de fisioterapia que combina:
- Gestão de pacientes e agendamentos
- Documentação clínica (SOAP notes)
- Biblioteca de exercícios terapêuticos
- Integração com IA (Google Gemini) para laudos e sugestões
- Portal do paciente
- Gestão financeira e relatórios

---

## 🏗️ Arquitetura Simplificada

```
Frontend (React + Vite)
    ↓
Services (Business Logic)
    ↓
Supabase (PostgreSQL) + Gemini AI
```

### Tecnologias Core
- **Language:** TypeScript (strict mode)
- **Framework:** React 19
- **Bundler:** Vite 6
- **UI:** TailwindCSS + Shadcn/ui (Radix UI)
- **Forms:** React Hook Form + Zod
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Testing:** Vitest + Playwright

---

## 📁 Estrutura de Pastas (Essencial)

```
dudufisio-AI/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes base Shadcn/ui (Button, Input, etc.)
│   ├── agenda/         # Sistema de agendamento
│   ├── pacientes/      # Gestão de pacientes
│   ├── exercises/      # Biblioteca de exercícios
│   ├── protocols/      # Protocolos de tratamento
│   ├── dashboard/      # Dashboard administrativo
│   ├── financial/      # Gestão financeira
│   └── atendimento/    # Atendimento clínico (SOAP)
│
├── pages/              # Páginas (rotas) - lazy loaded
│   ├── DashboardPage.tsx
│   ├── AgendaPage.tsx
│   ├── PatientListPage.tsx
│   ├── ExercisesPage.tsx
│   └── [...]
│
├── contexts/           # Estado global (React Context)
│   ├── AuthContext.tsx       # Autenticação
│   ├── PatientContext.tsx    # Gestão de pacientes
│   ├── ExerciseContext.tsx   # Exercícios
│   └── ToastContext.tsx      # Notificações
│
├── services/           # Lógica de negócio
│   ├── patientService.ts     # CRUD de pacientes
│   ├── appointmentService.ts # Agendamentos
│   ├── geminiService.ts      # Integração IA
│   ├── auditService.ts       # Auditoria/logs
│   └── supabase/            # Cliente Supabase
│
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   └── useDebounce.ts
│
├── lib/                # Utilitários
│   ├── utils.ts              # Funções auxiliares
│   ├── validators/           # Validações centralizadas
│   ├── guards/              # Proteção de rotas
│   └── middleware/          # Middlewares
│
├── types.ts            # ⚠️ TYPES CENTRALIZADOS (IMPORTANTE)
├── supabase/          # Migrações e schema DB
└── tests/             # Testes (Vitest + Playwright)
```

---

## 🔑 Conceitos Chave

### 1. Types Centralizados (`types.ts`)

**IMPORTANTE:** Todos os types principais estão em `types.ts` na raiz do projeto.

```typescript
// Principais interfaces:
- Patient          // Paciente
- Appointment      // Agendamento
- Exercise         // Exercício terapêutico
- Protocol         // Protocolo de tratamento
- SoapNote         // Nota SOAP
- User             // Usuário do sistema
- AppointmentStatus // Enum: Scheduled, Confirmed, Completed, Canceled
```

### 2. Contextos (Estado Global)

Os contextos gerenciam estado compartilhado entre componentes:

```typescript
// AuthContext
- user: User | null
- login(email, password)
- logout()
- isAuthenticated: boolean

// PatientContext
- patients: Patient[]
- selectedPatient: Patient | null
- addPatient(patient)
- updatePatient(id, data)
- deletePatient(id)

// ExerciseContext
- exercises: Exercise[]
- addExercise(exercise)
- updateExercise(id, data)
- deleteExercise(id)
```

### 3. Services (Lógica de Negócio)

Services são módulos que encapsulam lógica de negócio e chamadas de API:

```typescript
// Padrão de Service:
export const patientService = {
  async getAll(): Promise<Patient[]> { },
  async getById(id: string): Promise<Patient> { },
  async create(data: PatientInput): Promise<Patient> { },
  async update(id: string, data: Partial<Patient>): Promise<Patient> { },
  async delete(id: string): Promise<void> { }
};
```

### 4. Validações (Zod)

Todas as validações usam Zod:

```typescript
// lib/validators/index.ts
export const patientSchema = z.object({
  name: z.string().min(3),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
});
```

### 5. Componentes Shadcn/ui

O projeto usa Shadcn/ui (Radix UI):

```typescript
// Componentes disponíveis em components/ui/
- Button
- Input
- Select
- Dialog
- Tabs
- Toast
- Form
- Table
- Card
// ... e mais
```

---

## 💡 Padrões e Convenções

### Naming Conventions

```typescript
// Arquivos
PatientCard.tsx         // Componentes: PascalCase
patientService.ts       // Services: camelCase
usePatients.ts          // Hooks: camelCase com "use"
types.ts                // Types: minúsculo

// Variáveis
const patientData = {}; // camelCase
const isLoading = true; // camelCase booleanos com "is", "has", "can"

// Constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // UPPER_SNAKE_CASE

// Funções
function fetchPatients() {}      // camelCase verbos
function createAppointment() {}  // camelCase verbos

// Tipos/Interfaces
interface Patient {}             // PascalCase
type ExerciseData = {};          // PascalCase
```

### Estrutura de Componente (Template)

```typescript
import React from 'react';
import { Button } from '@/components/ui/button';

// 1. Props Interface
interface PatientCardProps {
  patient: Patient;
  onEdit?: (id: string) => void;
  className?: string;
}

// 2. Componente
export function PatientCard({ patient, onEdit, className }: PatientCardProps) {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // 4. Handlers
  const handleEdit = () => {
    onEdit?.(patient.id);
  };
  
  // 5. Render
  return (
    <div className={className}>
      <h3>{patient.name}</h3>
      <Button onClick={handleEdit}>Editar</Button>
    </div>
  );
}
```

### Imports Organization

```typescript
// Ordem de imports (sempre):
// 1. React e libs externas
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

// 2. Componentes UI
import { Button } from '@/components/ui/button';

// 3. Componentes internos
import { PatientCard } from '@/components/pacientes/PatientCard';

// 4. Hooks
import { usePatients } from '@/hooks/usePatients';

// 5. Services
import { patientService } from '@/services/patientService';

// 6. Utils
import { cn, formatCPF } from '@/lib/utils';

// 7. Types
import type { Patient } from '@/types';
```

---

## ⚠️ Erros Comuns a Evitar

### 1. ❌ NÃO importar de Next.js

```typescript
// ❌ ERRADO - projeto é Vite, não Next.js
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

// ✅ CORRETO - usar React Router
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
```

### 2. ❌ NÃO misturar .jsx e .tsx

```typescript
// ❌ ERRADO
App.jsx + App.tsx  // duplicado

// ✅ CORRETO - manter apenas TypeScript
App.tsx
```

### 3. ❌ NÃO esquecer tratamento de erros

```typescript
// ❌ ERRADO
async function fetchPatient(id: string) {
  const patient = await patientService.getById(id);
  return patient;
}

// ✅ CORRETO
async function fetchPatient(id: string) {
  try {
    const patient = await patientService.getById(id);
    return patient;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    toast.error('Não foi possível carregar o paciente');
    return null;
  }
}
```

### 4. ❌ NÃO usar any sem necessidade

```typescript
// ❌ ERRADO
const handleSubmit = (data: any) => { };

// ✅ CORRETO
const handleSubmit = (data: PatientInput) => { };
```

### 5. ❌ NÃO esquecer validação

```typescript
// ❌ ERRADO - sem validação
const cpf = input.value;

// ✅ CORRETO - com validação Zod
const result = cpfSchema.safeParse(input.value);
if (result.success) {
  const cpf = result.data;
}
```

### 6. ❌ NÃO usar propriedades inexistentes

```typescript
// ❌ ERRADO - property não existe no type
appointment.therapistName  // ❌ não existe

// ✅ CORRETO - verificar types.ts primeiro
appointment.therapist_id   // ✅ existe
```

---

## 🔍 Como Navegar no Codebase

### Fluxo de Leitura Recomendado

1. **Comece com `types.ts`** - Entenda as entidades principais
2. **Depois veja `contexts/`** - Entenda o estado global
3. **Depois veja `services/`** - Entenda a lógica de negócio
4. **Depois veja `pages/`** - Entenda as rotas
5. **Por fim veja `components/`** - Entenda os componentes

### Como Encontrar Código

```typescript
// Procurando funcionalidade de pacientes?
1. types.ts → interface Patient
2. contexts/PatientContext.tsx → estado global
3. services/patientService.ts → lógica de negócio
4. pages/PatientListPage.tsx → página principal
5. components/pacientes/ → componentes relacionados

// Procurando validações?
1. lib/validators/index.ts → validações centralizadas

// Procurando utilitários?
1. lib/utils.ts → funções auxiliares (formatação, etc.)

// Procurando componentes UI?
1. components/ui/ → componentes base Shadcn
```

---

## 🚀 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor (http://localhost:5175)
npm run build            # Build produção
npm run start            # Preview build

# Qualidade
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente
npm run type-check       # Verificar TypeScript
npm run check            # Verificar tudo

# Testes
npm test                 # Executar todos os testes
npm run test:unit        # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:unit:coverage  # Cobertura
```

---

## 📊 Features Principais (28 features)

### Gestão
1. Patient Management - CRUD de pacientes
2. Appointment Scheduling - Agendamentos com calendário
3. Financial Management - Controle financeiro
4. Inventory Management - Gestão de estoque
5. Task Management (Kanban) - Tarefas da equipe

### Clínica
6. Clinical Documentation (SOAP) - Notas clínicas
7. Body Map Pain Assessment - Mapa corporal de dor
8. Exercise Library - Biblioteca de exercícios
9. Protocol Management - Protocolos de tratamento
10. Exercise Assignments - Atribuir exercícios a pacientes
11. Progress Tracking - Acompanhamento de progresso
12. Specialty Assessments - Avaliações especializadas
13. Clinical Materials Library - Materiais clínicos

### IA e Analytics
14. AI-Powered Features - IA com Gemini (laudos, sugestões)
15. Reports and Analytics - Relatórios completos
16. Dashboard and Metrics - Dashboard com KPIs

### Autenticação e Portais
17. Authentication and Authorization - Sistema multi-role
18. Patient Portal - Portal do paciente
19. Partner Portal - Portal de parceiros

### Integrações
20. WhatsApp Integration - Notificações WhatsApp
21. Notification System - Sistema de notificações
22. Audit and Logging - Auditoria LGPD

### Infraestrutura
23. Supabase Integration - Database, Auth, Storage
24. UI Component Library - Shadcn/ui components
25. Form Validation - Zod + React Hook Form
26. Utilities and Helpers - Hooks e utils
27. Subscription Management - Gestão de assinaturas
28. Mentoring System - Sistema de mentoria

---

## 🎨 UI Components (Shadcn/ui)

### Componentes Disponíveis

```typescript
// Navegação
<Button />
<DropdownMenu />
<Tabs />

// Formulários
<Input />
<Select />
<Checkbox />
<RadioGroup />
<Slider />
<Switch />
<Form />     // Wrapper para React Hook Form

// Feedback
<Toast />
<Alert />
<Progress />
<Dialog />
<AlertDialog />

// Layout
<Card />
<Separator />
<ScrollArea />
<Table />

// Outros
<Avatar />
<Label />
<Popover />
<Tooltip />
```

### Como Usar Shadcn Components

```typescript
// 1. Importar
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 2. Usar com variants
<Button variant="default">Salvar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Voltar</Button>
<Button variant="destructive">Excluir</Button>

// 3. Combinar com className (TailwindCSS)
<Button className="w-full mt-4">Enviar</Button>

// 4. Usar helper cn() para classes condicionais
import { cn } from '@/lib/utils';

<Button className={cn(
  "w-full",
  isLoading && "opacity-50 cursor-not-allowed"
)}>
  {isLoading ? 'Carregando...' : 'Enviar'}
</Button>
```

---

## 📋 Checklist para Tarefas

### Criar Novo Componente

- [ ] Criar arquivo em `components/[modulo]/NomeComponente.tsx`
- [ ] Definir interface de Props
- [ ] Adicionar TypeScript types
- [ ] Usar componentes Shadcn/ui quando possível
- [ ] Adicionar tratamento de erros
- [ ] Testar responsividade
- [ ] Adicionar testes unitários (opcional)

### Criar Nova Página

- [ ] Criar arquivo em `pages/NomePage.tsx`
- [ ] Adicionar rota em `AppRoutes.tsx` com lazy loading
- [ ] Definir layout e estrutura
- [ ] Conectar com contextos necessários
- [ ] Adicionar loading states
- [ ] Adicionar error boundaries
- [ ] Testar navegação

### Criar Novo Service

- [ ] Criar arquivo em `services/nomeService.ts`
- [ ] Definir interface com métodos CRUD
- [ ] Adicionar tratamento de erros
- [ ] Adicionar tipos para inputs e outputs
- [ ] Integrar com Supabase ou API externa
- [ ] Adicionar testes unitários
- [ ] Documentar métodos (JSDoc)

### Adicionar Nova Feature

- [ ] Atualizar `types.ts` com novos types
- [ ] Criar service
- [ ] Criar contexto (se necessário)
- [ ] Criar componentes
- [ ] Criar página
- [ ] Adicionar rotas
- [ ] Adicionar validações (Zod)
- [ ] Adicionar testes
- [ ] Atualizar documentação

---

## 🔐 Regras de Negócio (Resumo)

### Validações Principais

```typescript
// CPF
Formato: 000.000.000-00
Validação: Algoritmo de dígitos verificadores

// Telefone
Formato: (00) 00000-0000 ou (00) 0000-0000
Regex: /^\(\d{2}\) \d{4,5}-\d{4}$/

// Email
Validação: Zod email validator

// Horários de Agendamento
- Não pode haver sobreposição
- Mínimo 30 minutos de duração
- Horário comercial: 07:00 - 20:00
```

### Permissões (RBAC)

```typescript
// Roles
Admin:        // Acesso total
Therapist:    // Gestão de pacientes e atendimentos
Educator:     // Visualização limitada
Patient:      // Portal do paciente apenas
```

### LGPD

```typescript
// Dados sensíveis devem:
- Ser criptografados (Supabase RLS)
- Ter logs de auditoria (auditService)
- Permitir exportação (relatórios)
- Permitir exclusão (CRUD)
```

---

## 🆘 Troubleshooting Rápido

### Erro: "Module not found"

```bash
# Solução: Verificar path aliases
# tsconfig.json e vite.config.ts devem ter paths consistentes
```

### Erro: "Type X is not assignable to type Y"

```bash
# Solução: Verificar types.ts
# Garantir que interfaces estão atualizadas
```

### Erro: "Cannot read property of undefined"

```bash
# Solução: Adicionar optional chaining
patient?.name        # ✅
patient.name         # ❌ pode dar erro
```

### Build falha

```bash
# Solução 1: Limpar cache
rm -rf node_modules/.vite dist
npm run build

# Solução 2: Verificar erros TypeScript
npm run type-check
```

---

## 📚 Referências Rápidas

### Path Aliases

```typescript
@/                    // raiz do projeto
@/components/*        // components/
@/pages/*             // pages/
@/services/*          // services/
@/hooks/*             // hooks/
@/contexts/*          // contexts/
@/lib/*               // lib/
@/types               // types.ts
```

### Componentes Frequentes

```typescript
// Botão primário
<Button>Salvar</Button>

// Input de texto
<Input placeholder="Digite aqui" />

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opção 1</SelectItem>
  </SelectContent>
</Select>

// Dialog/Modal
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* conteúdo */}
  </DialogContent>
</Dialog>

// Toast notification
import { toast } from '@/hooks/use-toast';
toast({
  title: "Sucesso",
  description: "Operação realizada",
});
```

---

## 🎓 Para Novos Colaboradores (Humanos ou IAs)

### 1. Primeira Leitura

1. Leia este arquivo (`AI_CONTEXT.md`)
2. Leia `DEVELOPER_GUIDE.md` para detalhes técnicos
3. Leia `BUSINESS_RULES.md` para regras de negócio
4. Explore `types.ts` para entender as entidades

### 2. Setup Local

```bash
git clone [repo]
cd dudufisio-AI
npm install
cp .env.example .env.local
# Adicionar credenciais Supabase e Gemini
npm run dev
```

### 3. Primeiro Código

- Comece com algo simples (ex: novo componente UI)
- Siga os padrões estabelecidos
- Peça review antes de fazer PR grande

### 4. Recursos

- **Documentação:** `docs/` folder
- **Exemplos:** Veja código existente antes de criar novo
- **Dúvidas:** Abra issue no GitHub

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe DuduFisio-AI

---

## 💬 Prompts Úteis para LLMs

### Criando Novo Componente

```
Crie um componente React TypeScript seguindo os padrões do DuduFisio-AI:
- Nome: [NomeComponente]
- Localização: components/[modulo]/
- Funcionalidade: [descrição]
- Props: [lista de props]
- Usar Shadcn/ui components
- Adicionar validação com Zod se necessário
```

### Debugando Erro

```
Ajude-me a debugar este erro no DuduFisio-AI:
[Código com erro]

Contexto:
- Projeto usa React 19 + TypeScript + Vite
- Types centralizados em types.ts
- Componentes UI são Shadcn/ui (Radix UI)
- Projeto NÃO usa Next.js (não sugerir next/*)
```

### Refatorando Código

```
Refatore este código seguindo os padrões do DuduFisio-AI:
[Código atual]

Melhorias esperadas:
- TypeScript strict
- Tratamento de erros
- Validação Zod
- Performance
- Padrões do projeto
```

---

Este documento é vivo e deve ser atualizado conforme o projeto evolui. Se você (humano ou IA) encontrar informações desatualizadas, por favor abra um PR com correções.


