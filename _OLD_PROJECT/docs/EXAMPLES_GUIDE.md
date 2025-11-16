# 📚 Guia de Exemplos - Monday.com Design

Documentação completa dos exemplos de páginas e componentes criados usando o novo design system Monday.com.

---

## 📋 Índice

1. [Componentes Auxiliares](#componentes-auxiliares)
2. [Páginas de Exemplo](#páginas-de-exemplo)
3. [Como Usar](#como-usar)
4. [Customização](#customização)
5. [Melhores Práticas](#melhores-práticas)

---

## 🎨 Componentes Auxiliares

### StatsCard

Card moderno para exibir métricas e KPIs com visual atraente.

**Localização**: `src/components/ui/StatsCard.tsx`

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| title | string | - | Título do card (obrigatório) |
| value | string \| number | - | Valor principal (obrigatório) |
| icon | LucideIcon | - | Ícone do card (obrigatório) |
| variant | string | 'primary' | Cor do tema: 'primary', 'secondary', 'success', 'warning', 'error', 'info' |
| comparison | string | - | Texto de comparação (ex: "↑ 12%") |
| comparisonType | string | 'neutral' | Tipo: 'positive', 'negative', 'neutral' |
| caption | string | - | Legenda/descrição adicional |
| hoverable | boolean | false | Se deve ter hover effect |
| onClick | function | - | Callback ao clicar |

#### Exemplo de Uso

```tsx
import StatsCard from '@/components/ui/StatsCard';
import { TrendingUp } from 'lucide-react';

<StatsCard
  title="Faturamento do Mês"
  value="R$ 125.430,00"
  icon={TrendingUp}
  variant="primary"
  comparison="↑ 18.3% vs mês anterior"
  comparisonType="positive"
  caption="Última atualização: há 2 minutos"
  hoverable
/>
```

#### Variantes de Cores

```tsx
// Primary (Roxo) - Métricas principais
<StatsCard variant="primary" {...props} />

// Secondary (Verde) - Sucesso, crescimento
<StatsCard variant="secondary" {...props} />

// Success - Objetivos alcançados
<StatsCard variant="success" {...props} />

// Warning - Atenção necessária
<StatsCard variant="warning" {...props} />

// Error - Problemas críticos
<StatsCard variant="error" {...props} />

// Info - Informações gerais
<StatsCard variant="info" {...props} />
```

---

### FeatureCard

Card moderno para destacar funcionalidades e recursos do sistema.

**Localização**: `src/components/ui/FeatureCard.tsx`

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| title | string | - | Título da feature (obrigatório) |
| description | string | - | Descrição (obrigatório) |
| icon | LucideIcon | - | Ícone (obrigatório) |
| variant | string | 'primary' | Cor: 'primary', 'secondary', 'accent-orange', 'accent-pink', 'accent-blue', 'accent-purple' |
| actionLabel | string | - | Texto do botão de ação |
| onAction | function | - | Callback do botão |
| features | string[] | - | Lista de recursos |
| hoverable | boolean | true | Hover effect |

#### Exemplo de Uso

```tsx
import FeatureCard from '@/components/ui/FeatureCard';
import { Calendar } from 'lucide-react';

<FeatureCard
  title="Agenda Inteligente"
  description="Gerencie consultas e horários com IA"
  icon={Calendar}
  variant="primary"
  actionLabel="Explorar Agenda"
  onAction={() => navigate('/agenda')}
  features={[
    'Agendamento automático',
    'Notificações por SMS/WhatsApp',
    'Sincronização com Google Calendar',
    'Confirmação de presença automática'
  ]}
  hoverable
/>
```

#### Variantes de Cores

```tsx
// Primary (Roxo) - Features principais
<FeatureCard variant="primary" {...props} />

// Secondary (Verde) - Features de sucesso
<FeatureCard variant="secondary" {...props} />

// Accent Orange - Features de destaque
<FeatureCard variant="accent-orange" {...props} />

// Accent Pink - Features criativas
<FeatureCard variant="accent-pink" {...props} />

// Accent Blue - Features informativas
<FeatureCard variant="accent-blue" {...props} />

// Accent Purple - Features premium
<FeatureCard variant="accent-purple" {...props} />
```

---

## 📄 Páginas de Exemplo

### Landing Page Example

Página de apresentação moderna com hero section, estatísticas, features e CTA.

**Localização**: `src/pages/LandingPageExample.tsx`

#### Seções Incluídas

1. **Hero Section**
   - Título impactante
   - Descrição clara do valor
   - CTAs primário e secundário
   - Texto de confiança

2. **Stats Section**
   - 4 StatsCards com métricas principais
   - Layout responsivo (1-2-4 columns)
   - Cores variadas para diferenciação

3. **Features Section**
   - 6 FeatureCards em grade
   - Descrição de cada funcionalidade
   - Lista de recursos
   - Botões de ação

4. **Testimonials Section**
   - 3 depoimentos de clientes
   - Rating visual com estrelas
   - Cards com hover effect

5. **CTA Section**
   - Background gradiente vibrante
   - Chamada para ação forte
   - Múltiplos botões de conversão

6. **Footer**
   - Informações de copyright
   - Créditos

#### Como Usar

```tsx
import LandingPageExample from '@/pages/LandingPageExample';

// Em seu router
<Route path="/exemplo-landing" element={<LandingPageExample />} />
```

#### Personalização

```tsx
// Modificar hero title
<H1 className="leading-tight">
  Seu Título Personalizado Aqui
</H1>

// Modificar stats
<StatsCard
  title="Sua Métrica"
  value="Seu Valor"
  icon={SeuIcone}
  variant="primary"
/>

// Adicionar mais features
<FeatureCard
  title="Nova Feature"
  description="Descrição da nova feature"
  icon={NovoIcone}
  variant="accent-orange"
  features={['Item 1', 'Item 2', 'Item 3']}
/>
```

---

### Dashboard Example

Dashboard moderno com estatísticas, agenda do dia e atividades recentes.

**Localização**: `src/pages/DashboardExample.tsx`

#### Seções Incluídas

1. **Header**
   - Título da página
   - Mensagem de boas-vindas
   - Botões de ação rápida (Filtros, Nova Consulta)

2. **Stats Overview**
   - 4 StatsCards com métricas do dia
   - Comparações vs período anterior
   - Legendas contextuais

3. **Today's Appointments**
   - Lista de consultas do dia
   - Status visual (Confirmado/Pendente)
   - Informações do paciente
   - Layout em cards

4. **Quick Actions**
   - Sidebar com ações rápidas
   - Botões para funções principais
   - Ícones para identificação visual

5. **Recent Activity**
   - Feed de atividades recentes
   - Timestamps relativos
   - Separadores visuais

6. **Weekly Overview**
   - Resumo dos últimos 7 dias
   - 4 métricas principais
   - Comparação vs semana anterior

#### Como Usar

```tsx
import DashboardExample from '@/pages/DashboardExample';

// Em seu router
<Route path="/dashboard" element={<DashboardExample />} />
```

#### Integração com Dados Reais

```tsx
// Substituir mock data por dados reais
const { data: stats } = useQuery('stats', fetchStats);
const { data: appointments } = useQuery('appointments', fetchTodayAppointments);

<StatsCard
  title="Faturamento Hoje"
  value={stats.revenue}
  icon={DollarSign}
  variant="primary"
  comparison={`↑ ${stats.revenueGrowth}% vs ontem`}
  comparisonType="positive"
/>
```

---

## 🚀 Como Usar

### Instalação dos Exemplos

Os exemplos já estão prontos para uso. Basta importar e utilizar:

```tsx
// 1. Importar componentes
import StatsCard from '@/components/ui/StatsCard';
import FeatureCard from '@/components/ui/FeatureCard';

// 2. Importar páginas de exemplo
import LandingPageExample from '@/pages/LandingPageExample';
import DashboardExample from '@/pages/DashboardExample';

// 3. Usar em seu projeto
function MinhaPage() {
  return (
    <Section variant="white" paddingY="4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <StatsCard
          title="Vendas"
          value="R$ 10.500"
          icon={DollarSign}
          variant="primary"
        />
        {/* Mais cards... */}
      </div>
    </Section>
  );
}
```

### Criando Novas Páginas

Use os exemplos como base:

```tsx
// 1. Copie a estrutura
import Section from '@/components/layout/Section';
import { H1, H2, Body } from '@/components/ui/Typography';

export default function MinhaNovaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <Section variant="white" paddingY="5xl">
        <H1>Meu Título</H1>
        <Body>Minha descrição</Body>
      </Section>

      {/* Content */}
      <Section variant="gray" paddingY="4xl">
        {/* Seu conteúdo aqui */}
      </Section>
    </div>
  );
}
```

---

## 🎨 Customização

### Modificar Cores

```tsx
// StatsCard - Mudar variant
<StatsCard variant="success" {...props} />  // Verde
<StatsCard variant="warning" {...props} />  // Laranja
<StatsCard variant="error" {...props} />    // Vermelho

// FeatureCard - Mudar variant
<FeatureCard variant="accent-pink" {...props} />    // Rosa
<FeatureCard variant="accent-blue" {...props} />    // Azul
<FeatureCard variant="accent-purple" {...props} />  // Roxo
```

### Modificar Tamanhos

```tsx
// Padding das Sections
<Section paddingY="2xl">  // Menor (48px)
<Section paddingY="4xl">  // Médio (80px)
<Section paddingY="5xl">  // Maior (120px)

// Cards
<Card padding="sm">  // 16px
<Card padding="md">  // 24px
<Card padding="lg">  // 32px
```

### Adicionar Animações

```tsx
// Hover effect
<StatsCard hoverable onClick={() => {}} />

// Classes Tailwind
<div className="transition-all duration-300 hover:scale-105">
  {/* Conteúdo */}
</div>
```

---

## 💡 Melhores Práticas

### Uso de StatsCards

```tsx
// ✅ BOM - Métricas claras e comparações relevantes
<StatsCard
  title="Faturamento do Mês"
  value="R$ 125.430,00"
  comparison="↑ 18.3% vs mês anterior"
  comparisonType="positive"
  caption="6 consultas realizadas hoje"
/>

// ❌ EVITAR - Sem contexto ou comparação
<StatsCard
  title="Valor"
  value="125430"
/>
```

### Uso de FeatureCards

```tsx
// ✅ BOM - Feature clara com lista de benefícios
<FeatureCard
  title="Agenda Inteligente"
  description="Gerencie consultas facilmente"
  features={[
    'Agendamento automático',
    'Notificações SMS',
    'Sincronização calendário'
  ]}
  actionLabel="Explorar"
/>

// ❌ EVITAR - Descrição vaga sem detalhes
<FeatureCard
  title="Agenda"
  description="Agende coisas"
/>
```

### Layout de Páginas

```tsx
// ✅ BOM - Seções alternadas (white/gray)
<>
  <Section variant="white" paddingY="5xl">
    {/* Hero */}
  </Section>
  <Section variant="gray" paddingY="4xl">
    {/* Stats */}
  </Section>
  <Section variant="white" paddingY="4xl">
    {/* Features */}
  </Section>
</>

// ❌ EVITAR - Todas seções com mesmo background
<>
  <Section variant="white">...</Section>
  <Section variant="white">...</Section>
  <Section variant="white">...</Section>
</>
```

### Responsividade

```tsx
// ✅ BOM - Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
  {stats.map(stat => <StatsCard key={stat.id} {...stat} />)}
</div>

// ✅ BOM - Flex responsivo
<div className="flex flex-col sm:flex-row gap-md">
  <Button variant="primary">Principal</Button>
  <Button variant="outline">Secundário</Button>
</div>
```

---

## 📊 Comparação Antes/Depois

### Antes (Design Antigo)
```tsx
// Cards simples sem hover
<div className="bg-white rounded shadow p-4">
  <h3 className="text-lg font-bold">Faturamento</h3>
  <p className="text-2xl">R$ 10.000</p>
</div>
```

### Depois (Monday.com Inspired)
```tsx
// StatsCard com hover, ícone e comparação
<StatsCard
  title="Faturamento do Mês"
  value="R$ 125.430,00"
  icon={DollarSign}
  variant="primary"
  comparison="↑ 18.3% vs mês anterior"
  comparisonType="positive"
  caption="Última atualização: há 2 minutos"
  hoverable
/>
```

---

## 🎯 Checklist de Implementação

Ao criar uma nova página:

- [ ] Usar `Section` para layout com variants alternados
- [ ] Usar componentes de tipografia (`H1`, `H2`, `Body`)
- [ ] Usar `StatsCard` para métricas
- [ ] Usar `FeatureCard` para funcionalidades
- [ ] Adicionar `hoverable` em elementos interativos
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Verificar acessibilidade (contraste, foco)
- [ ] Documentar componentes customizados

---

## 📚 Recursos Adicionais

- **Design System**: `docs/MONDAY_DESIGN_SYSTEM.md`
- **Changelog**: `docs/REDESIGN_CHANGELOG.md`
- **Componentes Base**: `src/components/ui/`
- **Tokens de Cores**: `src/styles/tokens/colors.ts`

---

**Status**: ✅ Documentação Completa

Todos os exemplos estão prontos para uso e podem ser customizados conforme necessário!
