# Guia do Desenvolvedor - DuduFisio-AI

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Padrões de Código](#padrões-de-código)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Testes](#testes)
- [Build e Deploy](#build-e-deploy)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **DuduFisio-AI** é um sistema completo de gestão para clínicas de fisioterapia, combinando funcionalidades tradicionais de gestão clínica com assistência de Inteligência Artificial (Google Gemini).

### Principais Características
- **28 Features Principais** catalogadas e organizadas
- **Frontend:** React 19 + TypeScript + Vite
- **UI:** TailwindCSS + Shadcn/ui (Radix UI)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** Google Gemini API para laudos e sugestões clínicas
- **Testing:** Vitest + Playwright + TestSprite (25 casos de teste)

---

## Arquitetura do Projeto

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite)                       │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │
│  │   Pages    │  │ Components │  │     Contexts          │ │
│  │  (Routes)  │──│   (UI)     │──│  (Global State)       │ │
│  └────────────┘  └────────────┘  └───────────────────────┘ │
│         │              │                    │                │
│         └──────────────┴────────────────────┘                │
│                        │                                     │
│              ┌─────────┴─────────┐                          │
│              │     Services      │                          │
│              │  (Business Logic) │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┼──────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Supabase│    │ Gemini  │    │WhatsApp │
    │  (DB)   │    │   AI    │    │   API   │
    └─────────┘    └─────────┘    └─────────┘
```

### Camadas da Aplicação

#### 1. **Presentation Layer** (Components & Pages)
- **Responsabilidade:** Interface do usuário, renderização, interações
- **Tecnologias:** React 19, Shadcn/ui, TailwindCSS
- **Localização:** `components/`, `pages/`

#### 2. **State Management Layer** (Contexts)
- **Responsabilidade:** Gerenciamento de estado global
- **Tecnologias:** React Context API
- **Localização:** `contexts/`
- **Principais Contextos:**
  - `AuthContext` - Autenticação e sessões
  - `PatientContext` - Gestão de pacientes
  - `ExerciseContext` - Biblioteca de exercícios
  - `ToastContext` - Notificações

#### 3. **Business Logic Layer** (Services)
- **Responsabilidade:** Lógica de negócio, chamadas de API
- **Localização:** `services/`
- **Principais Services:**
  - `patientService` - CRUD de pacientes
  - `appointmentService` - Agendamentos
  - `geminiService` - Integração IA
  - `supabaseClient` - Cliente Supabase
  - `auditService` - Auditoria e logs

#### 4. **Data Layer** (Supabase)
- **Responsabilidade:** Persistência de dados
- **Tecnologias:** PostgreSQL via Supabase
- **Localização:** `supabase/migrations/`

---

## Stack Tecnológico

### Core
```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.7",
  "framework": "React 19",
  "bundler": "Vite 6.3",
  "router": "React Router DOM 7"
}
```

### UI & Styling
```json
{
  "css": "TailwindCSS 3.4",
  "components": "Shadcn/ui (@radix-ui)",
  "icons": "Lucide React 0.545",
  "animations": "Framer Motion 11.11"
}
```

### State & Forms
```json
{
  "state": "React Context API",
  "forms": "React Hook Form 7.64",
  "validation": "Zod 3.25"
}
```

### Backend & Database
```json
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime"
}
```

### AI & Integrations
```json
{
  "ai": "Google Gemini API 0.21",
  "whatsapp": "WhatsApp Business API",
  "charts": "Recharts 2.15",
  "pdf": "jsPDF 3.0 + html2pdf 0.10"
}
```

### Testing
```json
{
  "unit": "Vitest 3.2",
  "e2e": "Playwright 1.55",
  "testing-library": "@testing-library/react 16.3"
}
```

---

## Estrutura de Pastas

```
dudufisio-AI/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes base (Shadcn/ui)
│   ├── agenda/         # Componentes de agendamento
│   ├── dashboard/      # Componentes de dashboard
│   ├── analytics/      # Componentes de analytics
│   ├── exercises/      # Componentes de exercícios
│   ├── protocols/      # Componentes de protocolos
│   ├── pacientes/      # Componentes de pacientes
│   ├── atendimento/    # Componentes de atendimento
│   ├── financial/      # Componentes financeiros
│   └── ...             # Outros módulos
│
├── pages/              # Páginas da aplicação (rotas)
│   ├── DashboardPage.tsx
│   ├── AgendaPage.tsx
│   ├── PatientListPage.tsx
│   ├── ExercisesPage.tsx
│   └── ...
│
├── contexts/           # Contextos React (estado global)
│   ├── AuthContext.tsx
│   ├── PatientContext.tsx
│   ├── ExerciseContext.tsx
│   └── ToastContext.tsx
│
├── services/           # Lógica de negócio e APIs
│   ├── ai/            # Serviços de IA
│   ├── supabase/      # Cliente Supabase
│   ├── database/      # Serviços de banco
│   ├── patientService.ts
│   ├── appointmentService.ts
│   ├── geminiService.ts
│   └── auditService.ts
│
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   ├── useDebounce.ts
│   └── ...
│
├── lib/                # Bibliotecas e utilitários
│   ├── utils.ts       # Funções auxiliares
│   ├── validators/    # Validações centralizadas
│   ├── guards/        # Proteção de rotas
│   └── middleware/    # Middlewares
│
├── types/              # Definições TypeScript
│   └── index.ts       # Types principais (centralizados)
│
├── data/               # Mock data e dados estáticos
│   ├── mockData.ts
│   ├── mockExerciseLibrary.ts
│   └── mockProtocolsData.ts
│
├── supabase/           # Configuração Supabase
│   ├── migrations/    # Migrações SQL
│   └── config.toml    # Configuração local
│
├── tests/              # Testes automatizados
│   ├── unit/          # Testes unitários
│   ├── integration/   # Testes de integração
│   └── e2e/           # Testes end-to-end
│
├── scripts/            # Scripts de automação
│   ├── seed-database.ts
│   └── validate-project.sh
│
├── public/             # Assets estáticos
├── dist/               # Build de produção
└── docs/               # Documentação adicional
```

---

## Padrões de Código

### Naming Conventions

#### Arquivos
```typescript
// Componentes: PascalCase
PatientForm.tsx
ExerciseCard.tsx
DashboardMetrics.tsx

// Services: camelCase
patientService.ts
appointmentService.ts
geminiService.ts

// Hooks: camelCase com prefixo "use"
useAuth.ts
usePatients.ts
useDebounce.ts

// Utilitários: camelCase
validators.ts
errorHandler.ts
formatters.ts

// Tipos: PascalCase ou camelCase.types.ts
types.ts
patient.types.ts
appointment.types.ts
```

#### Variáveis e Funções
```typescript
// Variáveis: camelCase
const patientData = {...};
const isLoading = false;

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880; // 5MB
const API_BASE_URL = 'https://api.example.com';

// Funções: camelCase (verbos)
function fetchPatients() {}
function createAppointment() {}
function validateCPF() {}

// Componentes: PascalCase
function PatientCard() {}
function ExerciseList() {}

// Interfaces/Types: PascalCase com prefixo I (opcional)
interface Patient {}
interface IAppointment {} // opcional
type ExerciseData = {};
```

### Estrutura de Componentes

```typescript
// ✅ Padrão recomendado
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 1. Types e Interfaces
interface PatientCardProps {
  patient: Patient;
  onEdit?: (id: string) => void;
  className?: string;
}

// 2. Componente Principal
export function PatientCard({ patient, onEdit, className }: PatientCardProps) {
  // 3. Hooks no topo
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // 4. Handlers
  const handleEdit = () => {
    onEdit?.(patient.id);
  };
  
  // 5. Render
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h3>{patient.name}</h3>
      <Button onClick={handleEdit}>Editar</Button>
    </div>
  );
}

// 6. Sub-componentes (se necessário)
PatientCard.Header = function PatientCardHeader({ children }: { children: React.ReactNode }) {
  return <div className="font-semibold">{children}</div>;
};
```

### Tratamento de Erros

```typescript
// ✅ Sempre use try-catch em operações assíncronas
async function fetchPatient(id: string): Promise<Patient | null> {
  try {
    const response = await patientService.getById(id);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    toast.error('Não foi possível carregar o paciente');
    return null;
  }
}

// ✅ Use Result types para funções críticas
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

async function createPatient(data: PatientInput): Promise<Result<Patient>> {
  try {
    const patient = await patientService.create(data);
    return { success: true, data: patient };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
```

### Validação com Zod

```typescript
import { z } from 'zod';

// ✅ Defina schemas Zod para todas as entidades
const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  birthDate: z.date().max(new Date(), 'Data não pode ser futura'),
});

// ✅ Use com React Hook Form
const form = useForm<PatientInput>({
  resolver: zodResolver(patientSchema),
  defaultValues: {...},
});
```

### Imports Organizados

```typescript
// ✅ Ordem de imports
// 1. React e bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 2. Componentes de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3. Componentes internos
import { PatientCard } from '@/components/pacientes/PatientCard';

// 4. Hooks customizados
import { usePatients } from '@/hooks/usePatients';

// 5. Services e utilitários
import { patientService } from '@/services/patientService';
import { cn, formatCPF } from '@/lib/utils';

// 6. Types
import type { Patient } from '@/types';

// 7. Estilos (se houver)
import './styles.css';
```

---

## Configuração do Ambiente

### Pré-requisitos
```bash
# Node.js 18+ e npm
node --version  # v18.0.0 ou superior
npm --version   # 9.0.0 ou superior

# Git
git --version
```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/dudufisio-AI.git
cd dudufisio-AI

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# Edite .env.local e adicione:
# VITE_SUPABASE_URL=sua_url_supabase
# VITE_SUPABASE_ANON_KEY=sua_chave_supabase
# VITE_GEMINI_API_KEY=sua_chave_gemini

# 4. Inicie o servidor de desenvolvimento
npm run dev

# Aplicação rodará em http://localhost:5175
```

### Variáveis de Ambiente

```bash
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_GEMINI_API_KEY=sua_chave_gemini_api
VITE_WHATSAPP_API_URL=https://api.whatsapp.com
VITE_WHATSAPP_API_KEY=sua_chave_whatsapp
```

---

## Fluxo de Desenvolvimento

### 1. Criar uma Nova Feature

```bash
# 1. Crie uma branch a partir da main
git checkout main
git pull origin main
git checkout -b feature/nome-da-feature

# 2. Desenvolva a feature
# - Crie componentes em components/
# - Crie páginas em pages/
# - Adicione services se necessário
# - Adicione testes

# 3. Execute testes localmente
npm run test:unit
npm run lint
npm run type-check

# 4. Commit suas alterações
git add .
git commit -m "feat: adiciona funcionalidade X"

# 5. Push e crie Pull Request
git push origin feature/nome-da-feature
```

### 2. Convenção de Commits (Conventional Commits)

```bash
# Tipos de commit
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Mudanças na documentação
style:    # Formatação de código
refactor: # Refatoração de código
test:     # Adicionar ou modificar testes
chore:    # Mudanças em configurações

# Exemplos
git commit -m "feat: adiciona página de exercícios"
git commit -m "fix: corrige validação de CPF"
git commit -m "docs: atualiza guia de contribuição"
git commit -m "refactor: melhora performance do dashboard"
```

### 3. Code Review Checklist

Antes de criar um Pull Request, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam (`npm test`)
- [ ] Não há erros de lint (`npm run lint`)
- [ ] Não há erros de TypeScript (`npm run type-check`)
- [ ] Componentes têm tipos definidos
- [ ] Funções têm tratamento de erros
- [ ] Código está documentado (JSDoc se necessário)
- [ ] Não há console.logs desnecessários
- [ ] Performance foi considerada
- [ ] Responsividade foi testada

---

## Testes

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── patient.test.ts
│   ├── auth.test.ts
│   └── validators.test.ts
│
├── integration/       # Testes de integração
│   ├── patient-flow.test.ts
│   └── appointment-flow.test.ts
│
└── e2e/              # Testes end-to-end (Playwright)
    ├── login.spec.ts
    └── patient-crud.spec.ts
```

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes unitários em watch mode
npm run test:unit:watch

# Testes com cobertura
npm run test:unit:coverage

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui
```

### Exemplo de Teste Unitário

```typescript
import { describe, it, expect } from 'vitest';
import { validateCPF } from '@/lib/validators';

describe('validateCPF', () => {
  it('deve validar CPF correto', () => {
    expect(validateCPF('123.456.789-09')).toBe(true);
  });

  it('deve rejeitar CPF inválido', () => {
    expect(validateCPF('000.000.000-00')).toBe(false);
  });

  it('deve rejeitar CPF com formato incorreto', () => {
    expect(validateCPF('12345678909')).toBe(false);
  });
});
```

---

## Build e Deploy

### Build Local

```bash
# Build para produção
npm run build

# Preview do build
npm run start

# Analisar tamanho do bundle
npm run build:analyze
```

### Deploy (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### Otimizações de Build

O projeto já está configurado com:
- ✅ Code splitting por rota
- ✅ Tree shaking agressivo
- ✅ Minificação com Terser
- ✅ CSS code splitting
- ✅ Lazy loading de componentes
- ✅ Chunk optimization manual

---

## Troubleshooting

### Problema: Erros de Type no TypeScript

```bash
# Solução 1: Limpar cache do TypeScript
rm -rf node_modules/.cache
npm run type-check

# Solução 2: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Problema: Hot Reload não funciona

```bash
# Solução: Limpar cache do Vite
rm -rf node_modules/.vite
npm run dev
```

### Problema: Erro "Module not found"

```bash
# Solução: Verificar path aliases em tsconfig.json e vite.config.ts
# Certifique-se de que os paths estão consistentes
```

### Problema: Build falha por falta de memória

```bash
# Solução: Aumentar limite de memória do Node
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Problema: Supabase não conecta

```bash
# Solução: Verificar variáveis de ambiente
# 1. Confirme que .env.local existe e está populado
# 2. Reinicie o servidor de desenvolvimento
# 3. Verifique as credenciais no painel Supabase
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Preview do build

# Qualidade de Código
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas automaticamente
npm run type-check       # Verifica tipos TypeScript
npm run check            # type-check + lint + test

# Testes
npm test                 # Executa todos os testes
npm run test:unit        # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:unit:coverage  # Cobertura de testes

# Database
npm run seed             # Popula banco com dados de teste
npm run activity:migrate # Executa migrações Supabase

# Manutenção
npm run security         # Verifica vulnerabilidades
npm run deps:check       # Verifica dependências desatualizadas
npm run deps:update      # Atualiza dependências
```

---

## Recursos Adicionais

### Documentação Interna
- [Business Rules](./BUSINESS_RULES.md) - Regras de negócio
- [AI Context](./AI_CONTEXT.md) - Guia para LLMs
- [API Documentation](./API_DOCUMENTATION.md) - Documentação de APIs

### Documentação Externa
- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

### Suporte
- **Issues:** https://github.com/seu-usuario/dudufisio-AI/issues
- **Discussions:** https://github.com/seu-usuario/dudufisio-AI/discussions

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0


