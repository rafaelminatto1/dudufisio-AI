# 🤝 Guia de Contribuição - MoocaFisio

Bem-vindo ao projeto MoocaFisio! Este guia ajudará você a contribuir de forma eficiente e consistente.

---

## 📋 Tabela de Conteúdos

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Regras de Arquitetura](#regras-de-arquitetura)
3. [Como Adicionar Componentes](#como-adicionar-componentes)
4. [Como Adicionar Features](#como-adicionar-features)
5. [Padrões de Código](#padrões-de-código)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)

---

## 🏗️ Estrutura do Projeto

```
dudufisio-AI/
├── packages/              # Microserviços
│   ├── host/             # Aplicação principal (5173)
│   ├── agenda-pacientes/ # Módulo de Agenda (5174)
│   ├── tratamentos/      # Módulo de Tratamentos (5175)
│   ├── financeiro/       # Módulo Financeiro (5176)
│   └── patient-portal/   # Portal do Paciente (5177)
├── shared/               # Código compartilhado
│   ├── components/       # Componentes UI
│   ├── contexts/         # React Contexts
│   ├── lib/             # Utilitários
│   ├── services/        # Serviços
│   └── types/           # TypeScript types
├── scripts/             # Scripts de automação
└── docs/                # Documentação
```

---

## 🎯 Regras de Arquitetura

### ✅ SEMPRE Fazer

1. **Componentes Genéricos em `shared/`**
   ```tsx
   // ✅ BOM - Component genérico em shared/
   shared/components/ui/Button.tsx
   
   // Usar em qualquer microserviço:
   import { Button } from '@/shared/components/ui/button';
   ```

2. **Usar Imports com Alias `@/`**
   ```tsx
   // ✅ BOM
   import { Button } from '@/shared/components/ui/button';
   import Section from '@/shared/components/layout/Section';
   
   // ❌ RUIM
   import { Button } from '../../../../shared/components/ui/button';
   ```

3. **Hooks/Contexts Específicos Localmente**
   ```tsx
   // ✅ BOM - Hook específico de Agenda
   packages/agenda-pacientes/src/hooks/useAppointments.ts
   
   // ❌ RUIM - Hook específico em shared/
   shared/hooks/useAppointments.ts
   ```

### ❌ NUNCA Fazer

1. **❌ Duplicar Componentes UI**
   ```tsx
   // ❌ RUIM - Duplicar Button em cada microserviço
   packages/agenda-pacientes/src/components/ui/Button.tsx
   packages/tratamentos/src/components/ui/Button.tsx
   
   // ✅ BOM - Um único Button em shared/
   shared/components/ui/Button.tsx
   ```

2. **❌ Imports Relativos Longos**
   ```tsx
   // ❌ RUIM
   import { cn } from '../../../../../shared/lib/utils';
   
   // ✅ BOM
   import { cn } from '@/shared/lib/utils';
   ```

3. **❌ Lógica de Negócio em Components UI**
   ```tsx
   // ❌ RUIM - Lógica de negócio em Button
   function Button() {
     const appointments = fetchAppointments(); // ❌
     return <button>...</button>;
   }
   
   // ✅ BOM - Button apenas renderiza
   function Button({ onClick, children }) {
     return <button onClick={onClick}>{children}</button>;
   }
   ```

---

## 🎨 Como Adicionar Componentes

### 1. Componente UI Genérico

**Localização**: `shared/components/ui/`

```tsx
// shared/components/ui/MyComponent.tsx
import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface MyComponentProps {
  /** Descrição da prop */
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

/**
 * MyComponent - Descrição curta
 * 
 * @example
 * ```tsx
 * <MyComponent variant="primary">
 *   Conteúdo
 * </MyComponent>
 * ```
 */
export default function MyComponent({ 
  variant = 'primary',
  children 
}: MyComponentProps) {
  return (
    <div className={cn('base-classes', variants[variant])}>
      {children}
    </div>
  );
}
```

**Checklist**:
- [ ] Criar em `shared/components/ui/`
- [ ] Adicionar JSDoc com descrição e exemplo
- [ ] Usar `cn()` para classes condicionais
- [ ] Adicionar TypeScript types completos
- [ ] Testar em 2+ microserviços
- [ ] Documentar em `shared/README.md` se for componente principal

### 2. Componente Específico de Microserviço

**Localização**: `packages/{microserviço}/src/components/`

```tsx
// packages/agenda-pacientes/src/components/AppointmentCard.tsx
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export function AppointmentCard({ appointment }) {
  return (
    <Card>
      <h3>{appointment.patientName}</h3>
      <Badge>{appointment.status}</Badge>
    </Card>
  );
}
```

---

## 🚀 Como Adicionar Features

### Passo a Passo

1. **Identificar Microserviço**
   - Feature é específica? → Adicionar no microserviço
   - Feature é genérica? → Adicionar em `shared/`

2. **Criar Branch**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

3. **Desenvolver**
   - Seguir padrões de código
   - Adicionar types TypeScript
   - Usar componentes de `shared/`

4. **Testar**
   ```bash
   npm run dev
   # Testar em todos microserviços afetados
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat(agenda): adiciona filtro de pacientes"
   ```

6. **Push e PR**
   ```bash
   git push origin feature/nome-da-feature
   # Criar Pull Request
   ```

---

## 💻 Padrões de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Hooks | camelCase + `use` | `useAuth.ts`, `useAppointments.ts` |
| Services | camelCase | `appointmentService.ts` |
| Types | PascalCase | `Patient`, `Appointment` |
| Funções | camelCase | `formatDate()`, `calculateTotal()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |

### TypeScript

```tsx
// ✅ BOM - Types explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ RUIM - any
function getUser(id: any): any {
  // ...
}
```

### React Patterns

```tsx
// ✅ BOM - Props interface separada
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  // ...
}

// ✅ BOM - Default exports para components
export default Button;

// ✅ BOM - Named exports para utilities
export { formatDate, formatCurrency };
```

---

## 🧪 Testing

### Antes de Commitar

```bash
# 1. Rodar todos microserviços
npm run dev

# 2. Testar em cada porta
# Host: http://localhost:5173
# Agenda: http://localhost:5174
# Tratamentos: http://localhost:5175
# Financeiro: http://localhost:5176
# Patient Portal: http://localhost:5177

# 3. Verificar console do navegador
# - Sem erros críticos
# - Avisos podem ser ok
```

### Checklist de Qualidade

- [ ] Sem erros no console
- [ ] Componente renderiza corretamente
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessível (keyboard navigation, screen readers)
- [ ] Performance (sem re-renders desnecessários)

---

## 🌳 Git Workflow

### Branches

- `main` - Produção (protegida)
- `develop` - Desenvolvimento
- `feature/*` - Novas features
- `fix/*` - Bug fixes
- `docs/*` - Documentação

### Commit Messages

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(agenda): adiciona filtro de data
fix(financeiro): corrige cálculo de total
docs(shared): atualiza README com novos components
style(ui): ajusta padding do Button
refactor(hooks): simplifica useAppointments
test(agenda): adiciona testes para AppointmentCard
```

### Pull Request Template

```markdown
## Descrição
Breve descrição da mudança

## Tipo de mudança
- [ ] Nova feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Code segue padrões do projeto
- [ ] Testado em todos microserviços afetados
- [ ] Sem erros no console
- [ ] Documentação atualizada
- [ ] Types TypeScript adicionados

## Screenshots (se aplicável)
```

---

## 📦 Scripts Úteis

### Desenvolvimento

```bash
# Rodar todos microserviços
npm run dev

# Rodar microserviço específico
npm run dev:host
npm run dev:agenda
npm run dev:tratamentos
npm run dev:financeiro
npm run dev:patient-portal
```

### Manutenção

```bash
# Gerar re-exports automaticamente
node scripts/generate-reexports.js

# Limpar re-exports órfãos
node scripts/cleanup-orphan-reexports.js

# Atualizar imports para @/shared/
node scripts/update-imports-to-shared.js

# Corrigir caminhos de re-exports
node scripts/fix-reexport-paths.js
```

---

## 🐛 Troubleshooting

### Erro: "Module not found: @/shared/..."

**Solução**: Verificar `vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '../../'),
  },
},
```

### Erro: "Failed to resolve import"

**Solução**: 
1. Verificar se arquivo existe em `shared/`
2. Usar script para gerar re-export: `node scripts/generate-reexports.js`

### Servidor não recarrega

**Solução**:
```bash
# Parar todos processos Node
Stop-Process -Name "node" -Force

# Reiniciar
npm run dev
```

---

## 📚 Recursos

- **Documentação Shared**: `shared/README.md`
- **Relatórios Técnicos**: `RELATORIO_FINAL_*.md`
- **Design System**: (em desenvolvimento)
- **Storybook**: (planejado)

---

## 🎓 Boas Práticas Resumidas

### DO ✅
- Componentes genéricos em `shared/`
- Imports com `@/shared/`
- Types TypeScript sempre
- JSDoc em components principais
- Testar em múltiplos microserviços

### DON'T ❌
- Duplicar components
- Imports relativos longos (`../../../../`)
- Lógica de negócio em UI components
- Usar `any` em TypeScript
- Commitar sem testar

---

## 💬 Suporte

- **Dúvidas**: Abrir issue no GitHub
- **Discussões**: GitHub Discussions
- **Chat**: Slack/Discord (se disponível)

---

**Obrigado por contribuir!** 🎉

Sua contribuição ajuda a melhorar o MoocaFisio para todos!

---

**Última atualização**: 16/11/2024  
**Versão**: 1.0.0

