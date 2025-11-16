# 📦 Pasta `/shared` - Componentes e Utilitários Compartilhados

Esta pasta contém todos os components, services, types e utilitários compartilhados entre os microserviços do projeto MoocaFisio.

---

## 📁 Estrutura de Diretórios

```
shared/
├── components/          # Componentes UI compartilhados
│   ├── ui/             # Componentes de interface (buttons, cards, etc)
│   └── layout/         # Componentes de layout (Section, etc)
├── contexts/           # React Contexts compartilhados
│   └── contexts/       # Subdire com contexts (AppContext, ToastContext, etc)
├── lib/                # Utilitários e funções auxiliares
│   └── utils.ts        # Funções utilitárias (cn, etc)
├── services/           # Serviços compartilhados
│   ├── supabaseClient.ts
│   ├── format.ts
│   └── ...
├── types/              # Types TypeScript compartilhados
│   └── index.ts
├── index.ts            # Barrel export principal
├── package.json        # Configuração do pacote shared
└── tsconfig.json       # Config TypeScript
```

---

## 🎨 Componentes UI (`/components/ui`)

### Componentes Principais

| Componente | Descrição | Exemplo |
|-----------|-----------|---------|
| `Badge` | Badges/tags para labels | `<Badge variant="success">Ativo</Badge>` |
| `Button` | Botões com variantes | `<Button variant="primary">Salvar</Button>` |
| `Card` | Cards para conteúdo | `<Card><CardHeader>...</CardHeader></Card>` |
| `Dialog` | Modals e diálogos | `<Dialog open={true}>...</Dialog>` |
| `Form` | Form fields e validação | `<Form>...</Form>` |
| `Input` | Inputs de texto | `<Input placeholder="Nome" />` |
| `Select` | Dropdowns de seleção | `<Select>...</Select>` |
| `Skeleton` | Loading skeletons | `<Skeleton className="h-12 w-12" />` |
| `Tabs` | Navegação em abas | `<Tabs><TabsList>...</TabsList></Tabs>` |
| `Textarea` | Áreas de texto | `<Textarea rows={4} />` |
| `Typography` | Componentes de texto | `<H1>Título</H1> <Body>Texto</Body>` |
| `StatsCard` | Cards de estatísticas/KPIs | `<StatsCard title="Total" value="R$ 1.234" icon={TrendingUp} />` |

### Typography Components

```tsx
import { H1, H2, H3, H4, Body, Small, Caption, NumericValue } from '@/shared/components/ui/Typography';

<H1>Título Principal</H1>
<H2>Subtítulo</H2>
<Body>Texto do corpo</Body>
<Small>Texto pequeno</Small>
<Caption>Legenda</Caption>
<NumericValue>R$ 1.234,56</NumericValue>
```

### StatsCard - Componente de Estatística

```tsx
import StatsCard from '@/shared/components/ui/StatsCard';
import { TrendingUp } from 'lucide-react';

<StatsCard
  title="Faturamento"
  value="R$ 125.430,00"
  icon={TrendingUp}
  variant="primary"
  comparison="↑ 18.3% vs mês anterior"
  comparisonType="positive"
  caption="Última atualização: há 2 minutos"
  hoverable
/>
```

**Variantes disponíveis**: `primary`, `secondary`, `success`, `warning`, `error`, `info`

---

## 📐 Componentes de Layout (`/components/layout`)

### Section - Container de Seção

Componente para seções de página com backgrounds alternados e conteúdo centralizado.

```tsx
import Section from '@/shared/components/layout/Section';

<Section variant="white" maxWidth="7xl" paddingY="4xl">
  <H2>Título da Seção</H2>
  <Body>Conteúdo...</Body>
</Section>

<Section variant="gray" maxWidth="4xl">
  <H2>Outra Seção</H2>
  <Body>Mais conteúdo...</Body>
</Section>
```

**Props**:
- `variant`: `'white'` | `'gray'` - Cor de fundo
- `maxWidth`: `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'` | `'4xl'` | `'7xl'` | `'full'`
- `paddingY`: `'none'` | `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'` | `'3xl'` | `'4xl'` | `'5xl'`
- `paddingX`: `'none'` | `'sm'` | `'md'` | `'lg'` | `'xl'`

---

## 🔌 Contexts (`/contexts/contexts`)

### Contexts Disponíveis

| Context | Descrição | Uso |
|---------|-----------|-----|
| `AppContext` | Estado global da aplicação | Configurações, preferências |
| `ToastContext` | Sistema de notificações | Exibir mensagens ao usuário |
| `PatientContext` | Dados do paciente atual | Informações do paciente selecionado |
| `ExerciseContext` | Contexto de exercícios | Gerenciamento de exercícios |
| `SupabaseAuthContext` | Autenticação Supabase | Login, logout, sessão |
| `OfflineContext` | Modo offline | Gerenciamento de dados offline |

### Exemplo de Uso

```tsx
import { useToast } from '@/shared/contexts/contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast({
      title: 'Sucesso!',
      description: 'Operação realizada com sucesso',
      variant: 'success'
    });
  };
  
  return <button onClick={handleSuccess}>Salvar</button>;
}
```

---

## 🛠️ Utilitários (`/lib`)

### utils.ts

```tsx
import { cn } from '@/shared/lib/utils';

// Combina classes CSS com Tailwind
<div className={cn('text-base', isActive && 'text-primary', className)} />
```

---

## 🔧 Services (`/services`)

### Services Disponíveis

| Service | Descrição | Arquivo |
|---------|-----------|---------|
| `supabaseClient` | Cliente Supabase configurado | `supabaseClient.ts` |
| `format` | Funções de formatação | `format.ts` |
| `cacheManager` | Gerenciamento de cache | `cacheManager.ts` |
| `performanceMonitor` | Monitoramento de performance | `performanceMonitor.ts` |

### Exemplo - Format Service

```tsx
import { formatCurrencyBR, formatDate, formatPhoneNumber } from '@/shared/services/format';

formatCurrencyBR(1234.56);  // "R$ 1.234,56"
formatDate(new Date());     // "16/11/2024"
formatPhoneNumber("11999999999"); // "(11) 99999-9999"
```

---

## 📘 Types (`/types`)

```tsx
import type { Patient, Appointment, User } from '@/shared/types';

const patient: Patient = {
  id: '123',
  name: 'João Silva',
  // ...
};
```

---

## 🚀 Como Importar nos Microserviços

### Opção 1: Import Direto com Alias `@/`

```tsx
// Recomendado - usa alias configurado no vite.config.ts
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/contexts/contexts/ToastContext';
import StatsCard from '@/shared/components/ui/StatsCard';
import Section from '@/shared/components/layout/Section';
```

### Opção 2: Import Relativo (quando necessário)

```tsx
// Para arquivos dentro de shared/
import { Button } from '../../components/ui/button';
```

---

## 📜 Convenções

### Nomenclatura
- **Componentes UI**: PascalCase (`Button.tsx`, `Card.tsx`)
- **Componentes compostos**: Com subcomponentes (`Card`, `CardHeader`, `CardContent`)
- **Hooks**: camelCase com prefixo `use` (`useToast`, `useAuth`)
- **Services**: camelCase (`supabaseClient`, `format`)
- **Types**: PascalCase (`Patient`, `Appointment`)

### Estrutura de Componentes

```tsx
import React from 'react';
import { cn } from '../../lib/utils';

export interface MyComponentProps {
  /** Descrição da prop */
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

/**
 * MyComponent - Descrição do componente
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

---

## ✅ Checklist para Adicionar Novos Components

- [ ] Criar arquivo em `/shared/components/ui/` ou `/shared/components/layout/`
- [ ] Adicionar JSDoc com descrição e exemplo
- [ ] Usar `cn()` para classes CSS condicionais
- [ ] Exportar com `export default` ou exports nomeados
- [ ] Adicionar tipos TypeScript completos
- [ ] Testar em pelo menos 2 microserviços
- [ ] Documentar no README se for componente principal

---

## 🎯 Boas Práticas

### ✅ Fazer
- Usar componentes de `shared/` em vez de duplicar código
- Sempre usar imports com alias `@/shared/...`
- Manter componentes small e reutilizáveis
- Adicionar JSDoc e exemplos de uso
- Usar TypeScript strict mode

### ❌ Evitar
- Duplicar componentes entre microserviços
- Criar dependências circulares
- Importar de microserviços específicos dentro de `shared/`
- Adicionar lógica de negócio específica em components UI
- Usar imports relativos complexos (`../../../../`)

---

## 🔄 Fluxo de Trabalho

1. **Identificar necessidade** de component compartilhado
2. **Verificar se já existe** em `shared/`
3. **Criar em `shared/`** se não existir
4. **Importar nos microserviços** usando `@/shared/...`
5. **Testar** em todos microserviços que usam
6. **Documentar** no README se necessário

---

## 📊 Estatísticas

- **Total de Components UI**: 90+
- **Total de Contexts**: 9
- **Total de Services**: 40+
- **Cobertura de Types**: ~100%

---

## 🆘 Problemas Comuns

### "Module not found: @/shared/..."

**Solução**: Verificar se `vite.config.ts` tem o alias configurado:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '../../'),
    '@moocafisio/shared': path.resolve(__dirname, '../../shared'),
  },
},
```

### "Cannot find module '../../lib/utils'"

**Solução**: Usar import absoluto:

```tsx
// ❌ Errado
import { cn } from '../../lib/utils';

// ✅ Correto  
import { cn } from '@/shared/lib/utils';
```

---

**Última atualização**: 16/11/2024  
**Mantenedor**: Equipe MoocaFisio

