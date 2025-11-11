# 🎨 Monday.com Inspired Design System

Sistema de design moderno, vibrante e profissional implementado no MoocaFisio, inspirado nas melhores práticas do Monday.com.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Cores](#sistema-de-cores)
3. [Tipografia](#tipografia)
4. [Espaçamento](#espaçamento)
5. [Componentes](#componentes)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Migração](#migração)

---

## 🎯 Visão Geral

Este design system foi implementado para modernizar a interface do MoocaFisio, trazendo:

- ✅ Paleta de cores vibrante e harmoniosa
- ✅ Sistema de espaçamento baseado em 8px
- ✅ Tipografia clara e hierárquica
- ✅ Cards modernos com shadows suaves
- ✅ Botões destacados e interativos
- ✅ Layout limpo e respirável

### Arquivos Principais

```
src/
├── styles/
│   └── tokens/
│       └── colors.ts          # Sistema de cores Monday.com
├── components/
│   ├── ui/
│   │   ├── Button.tsx         # Botões modernos
│   │   ├── Card.tsx           # Cards com hover effects
│   │   └── Typography.tsx     # Componentes tipográficos
│   └── layout/
│       └── Section.tsx        # Layout sections
└── tailwind.config.ts         # Configuração completa
```

---

## 🎨 Sistema de Cores

### Cores Principais

#### Primary (Roxo/Azul Vibrante)
```tsx
// Uso em código
<div className="bg-primary text-white">
<Button variant="primary">Ação Principal</Button>
```

| Variante | Hex | Uso |
|----------|-----|-----|
| `primary` | `#5034FF` | Cor principal do sistema |
| `primary-hover` | `#4028E0` | Estado hover |
| `primary-light` | `#E8E4FF` | Backgrounds claros |

#### Secondary (Verde)
```tsx
<div className="bg-secondary text-white">
<Button variant="secondary">Sucesso</Button>
```

| Variante | Hex | Uso |
|----------|-----|-----|
| `secondary` | `#00CA72` | Sucesso, ações positivas |
| `secondary-hover` | `#00B366` | Estado hover |
| `secondary-light` | `#E6F9F2` | Backgrounds claros |

### Cores de Acento

```tsx
// Laranja - Destaque
<div className="bg-accent-orange">

// Rosa - Criatividade
<div className="bg-accent-pink">

// Azul claro - Informação
<div className="bg-accent-blue">

// Roxo - Exclusividade
<div className="bg-accent-purple">
```

### Cores Neutras

```tsx
// Backgrounds
<div className="bg-neutral-bg">       // Branco puro
<div className="bg-neutral-bgAlt">    // Cinza muito claro
<div className="bg-neutral-bgDark">   // Cinza para hover

// Textos
<p className="text-neutral-text">           // Preto suave
<p className="text-neutral-textSecondary">  // Cinza médio
<p className="text-neutral-textTertiary">   // Cinza claro

// Bordas
<div className="border-neutral-border">       // Borda padrão
<div className="border-neutral-borderHover">  // Borda hover
```

### Cores de Status

```tsx
// Sucesso
<div className="bg-success text-white">
<div className="bg-success-light text-success-dark">

// Aviso
<div className="bg-warning text-neutral-text">
<div className="bg-warning-light text-warning-dark">

// Erro
<div className="bg-error text-white">
<div className="bg-error-light text-error-dark">

// Informação
<div className="bg-info text-white">
<div className="bg-info-light text-info-dark">
```

---

## ✍️ Tipografia

### Componentes Disponíveis

#### H1 - Título Principal
```tsx
import { H1 } from '@/components/ui/Typography';

<H1>Título Principal da Página</H1>
// 48px, Bold (700), Neutral Text
```

#### H2 - Subtítulo Principal
```tsx
import { H2 } from '@/components/ui/Typography';

<H2>Subtítulo Principal</H2>
// 36px, Bold (700), Neutral Text
```

#### H3 - Título de Seção
```tsx
import { H3 } from '@/components/ui/Typography';

<H3>Título de Seção</H3>
// 28px, Semibold (600), Neutral Text
```

#### H4 - Subtítulo Menor
```tsx
import { H4 } from '@/components/ui/Typography';

<H4>Subtítulo Menor</H4>
// 20px, Semibold (600), Neutral Text
```

#### Body - Texto Normal
```tsx
import { Body } from '@/components/ui/Typography';

<Body>Corpo de texto, parágrafos, descrições.</Body>
// 16px, Regular (400), Neutral Text Secondary
```

#### Small - Texto Pequeno
```tsx
import { Small } from '@/components/ui/Typography';

<Small>Informações secundárias</Small>
// 14px, Regular (400), Neutral Text Secondary
```

#### Caption - Legendas
```tsx
import { Caption } from '@/components/ui/Typography';

<Caption>Legendas e metadados</Caption>
// 12px, Regular (400), Neutral Text Tertiary
```

#### NumericValue - Valores em Destaque
```tsx
import { NumericValue } from '@/components/ui/Typography';

<NumericValue>R$ 125.430,00</NumericValue>
// 36px, Bold (700), Neutral Text
```

#### Label - Labels de Formulário
```tsx
import { Label } from '@/components/ui/Typography';

<Label>Nome Completo</Label>
// 14px, Medium (500), Neutral Text
```

### Classes Tailwind Diretas

```tsx
// Se preferir usar classes diretamente
<h1 className="text-h1 text-neutral-text">Título</h1>
<h2 className="text-h2 text-neutral-text">Subtítulo</h2>
<h3 className="text-h3 text-neutral-text">Seção</h3>
<h4 className="text-h4 text-neutral-text">Subsecção</h4>
<p className="text-body text-neutral-textSecondary">Corpo</p>
<p className="text-small text-neutral-textSecondary">Pequeno</p>
```

---

## 📏 Espaçamento

Sistema baseado em múltiplos de **8px** para consistência visual.

```tsx
// Padding
<div className="p-xs">    // 4px
<div className="p-sm">    // 8px
<div className="p-md">    // 16px
<div className="p-lg">    // 24px
<div className="p-xl">    // 32px
<div className="p-2xl">   // 48px
<div className="p-3xl">   // 64px
<div className="p-4xl">   // 80px
<div className="p-5xl">   // 120px

// Margin (mesmas variantes)
<div className="m-lg">    // 24px

// Gap (para flex/grid)
<div className="flex gap-md">    // 16px entre itens
<div className="grid gap-lg">    // 24px entre itens

// Padding vertical/horizontal
<section className="py-4xl">     // 80px top/bottom
<section className="px-md">      // 16px left/right
```

### Recomendações de Uso

| Uso | Classe | Valor |
|-----|--------|-------|
| Padding interno de cards | `p-lg` ou `p-xl` | 24px ou 32px |
| Espaçamento entre seções | `py-4xl` ou `py-5xl` | 80px ou 120px |
| Espaçamento entre elementos | `gap-md` ou `gap-lg` | 16px ou 24px |
| Margem de botões | `m-sm` ou `m-md` | 8px ou 16px |

---

## 🎴 Componentes

### Button

```tsx
import Button from '@/components/ui/Button';

// Variantes
<Button variant="primary">Primary (Roxo)</Button>
<Button variant="secondary">Secondary (Verde)</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Com ícone
import { ArrowRight } from 'lucide-react';
<Button icon={<ArrowRight size={20} />} iconPosition="right">
  Continuar
</Button>

// Estados
<Button loading>Carregando...</Button>
<Button disabled>Desabilitado</Button>
```

### Card

```tsx
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

// Card básico
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo do card
  </CardContent>
</Card>

// Variantes
<Card variant="default">Card padrão</Card>
<Card variant="elevated">Card elevado (shadow maior)</Card>
<Card variant="outlined">Card com borda</Card>

// Tamanhos de padding
<Card padding="sm">Padding pequeno (16px)</Card>
<Card padding="md">Padding médio (24px)</Card>
<Card padding="lg">Padding grande (32px)</Card>

// Card interativo (com hover effect)
<Card hoverable onClick={() => {}}>
  Card clicável com animação
</Card>
```

### Section

```tsx
import Section from '@/components/layout/Section';

// Seções alternadas (padrão Monday.com)
<>
  <Section variant="white">
    <H2>Seção 1</H2>
    <Body>Conteúdo...</Body>
  </Section>

  <Section variant="gray">
    <H2>Seção 2</H2>
    <Body>Conteúdo...</Body>
  </Section>

  <Section variant="white">
    <H2>Seção 3</H2>
    <Body>Conteúdo...</Body>
  </Section>
</>

// Configuração de largura máxima
<Section maxWidth="7xl">   // 1280px - padrão para conteúdo geral
<Section maxWidth="4xl">   // 896px - ideal para texto
<Section maxWidth="full">  // 100% - sem limite

// Configuração de padding
<Section paddingY="5xl">   // 120px vertical
<Section paddingX="md">    // 16px horizontal
```

---

## 💡 Exemplos de Uso

### Dashboard Card

```tsx
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { NumericValue, Small, Caption } from '@/components/ui/Typography';
import { TrendingUp } from 'lucide-react';

<Card hoverable>
  <CardHeader>
    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-md">
      <TrendingUp className="text-primary" size={24} />
    </div>
    <CardTitle>Faturamento do Mês</CardTitle>
    <CardDescription>Receita total em Janeiro 2025</CardDescription>
  </CardHeader>
  <CardContent>
    <NumericValue>R$ 125.430,00</NumericValue>
    <Small className="text-success mt-sm block">↑ 18.3% vs mês anterior</Small>
    <Caption className="mt-sm block">Última atualização: há 2 minutos</Caption>
  </CardContent>
</Card>
```

### Hero Section

```tsx
import Section from '@/components/layout/Section';
import { H1, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

<Section variant="white" paddingY="5xl">
  <div className="text-center space-y-lg">
    <H1>Bem-vindo ao MoocaFisio</H1>
    <Body className="max-w-2xl mx-auto">
      Sistema completo de gestão para clínicas de fisioterapia.
      Agende pacientes, controle financeiro e muito mais.
    </Body>
    <div className="flex gap-md justify-center pt-lg">
      <Button variant="primary" icon={<ArrowRight size={20} />}>
        Começar Agora
      </Button>
      <Button variant="outline">
        Saber Mais
      </Button>
    </div>
  </div>
</Section>
```

### Lista de Features

```tsx
import Section from '@/components/layout/Section';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { H2, Body } from '@/components/ui/Typography';
import { Calendar, DollarSign, Users, BarChart } from 'lucide-react';

<Section variant="gray" paddingY="4xl">
  <div className="space-y-xl">
    <div className="text-center space-y-md">
      <H2>Funcionalidades</H2>
      <Body>Tudo que você precisa em um só lugar</Body>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
      <Card hoverable>
        <CardHeader>
          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-md">
            <Calendar className="text-primary" size={24} />
          </div>
          <CardTitle>Agenda</CardTitle>
          <CardDescription>
            Gerencie consultas e horários facilmente
          </CardDescription>
        </CardHeader>
      </Card>

      <Card hoverable>
        <CardHeader>
          <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-md">
            <DollarSign className="text-secondary" size={24} />
          </div>
          <CardTitle>Financeiro</CardTitle>
          <CardDescription>
            Controle completo de receitas e despesas
          </CardDescription>
        </CardHeader>
      </Card>

      <Card hoverable>
        <CardHeader>
          <div className="w-12 h-12 bg-accent-blue-light rounded-lg flex items-center justify-center mb-md">
            <Users className="text-accent-blue" size={24} />
          </div>
          <CardTitle>Pacientes</CardTitle>
          <CardDescription>
            Cadastro e histórico completo
          </CardDescription>
        </CardHeader>
      </Card>

      <Card hoverable>
        <CardHeader>
          <div className="w-12 h-12 bg-accent-orange-light rounded-lg flex items-center justify-center mb-md">
            <BarChart className="text-accent-orange" size={24} />
          </div>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>
            Análises e métricas em tempo real
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</Section>
```

---

## 🔄 Migração

### Substituir Cores Antigas

```tsx
// ANTES (cores antigas)
<div className="bg-blue-500">
<Button className="bg-purple-600">

// DEPOIS (Monday.com colors)
<div className="bg-primary">
<Button variant="primary">
```

### Substituir Tipografia Antiga

```tsx
// ANTES
<h1 className="text-3xl font-bold text-gray-900">

// DEPOIS
import { H1 } from '@/components/ui/Typography';
<H1>Título</H1>

// OU
<h1 className="text-h1 text-neutral-text">Título</h1>
```

### Substituir Espaçamento Antigo

```tsx
// ANTES
<div className="p-6">        // 24px
<div className="py-20">      // 80px

// DEPOIS
<div className="p-lg">       // 24px (mais semântico)
<div className="py-4xl">     // 80px (consistente com sistema 8px)
```

### Substituir Cards Antigos

```tsx
// ANTES
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold">Título</h3>
  <p>Conteúdo</p>
</div>

// DEPOIS
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <Body>Conteúdo</Body>
  </CardContent>
</Card>
```

---

## ✅ Checklist de Implementação

Ao criar uma nova página ou funcionalidade:

- [ ] Usar `Section` para layout principal com variants alternados (white/gray)
- [ ] Usar componentes de tipografia (`H1`, `H2`, `Body`, etc.)
- [ ] Usar `Card` para containers de conteúdo
- [ ] Usar `Button` com variants apropriadas
- [ ] Aplicar espaçamento consistente do sistema 8px
- [ ] Usar cores do sistema Monday.com (`primary`, `secondary`, `accent-*`)
- [ ] Adicionar `hoverable` em cards clicáveis
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Verificar acessibilidade (contraste, foco)

---

## 📚 Recursos Adicionais

- **Tokens de Cores**: `src/styles/tokens/colors.ts`
- **Tailwind Config**: `tailwind.config.ts`
- **Componentes UI**: `src/components/ui/`
- **Componentes Layout**: `src/components/layout/`
- **Exemplo Completo**: `src/components/examples/MondayDesignShowcase.tsx`

---

## 🎯 Resultado Final

Após implementar este design system, o MoocaFisio possui:

✅ Design moderno e profissional
✅ Paleta de cores vibrante e harmoniosa
✅ Espaçamento generoso e respirável
✅ Tipografia clara e hierárquica
✅ Cards modernos com hover effects
✅ Botões destacados e convidativos
✅ Layout limpo e organizado

**= Visual no nível do Monday.com** 🎨
