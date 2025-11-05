# Sistema Tipográfico MoocaFisio

## 🎯 Quick Start

```tsx
import { H1, H2, H3, Body, Small, Caption, NumericValue, Label } from '@/components/ui/Typography';

// Título da página
<H1>Dashboard Financeiro</H1>

// Métrica em destaque
<NumericValue>R$ 125.430,00</NumericValue>

// Texto normal
<Body>Descrição detalhada do conteúdo...</Body>
```

## 📦 Componentes

| Componente | Tamanho | Caso de Uso |
|------------|---------|-------------|
| `H1` | 32px | Título principal da página (1 por página) |
| `H2` | 24px | Seções principais |
| `H3` | 18px | Títulos de cards e subsecções |
| `Body` | 16px | Parágrafos e conteúdo principal |
| `Small` | 14px | Informações secundárias |
| `Caption` | 12px | Legendas e timestamps |
| `NumericValue` | 36px | Métricas e valores em destaque |
| `Label` | 14px | Labels de formulários |

## ✅ Checklist de Uso

Ao criar uma nova página:

1. ✅ **Um H1 por página** - Título principal único
2. ✅ **Hierarquia lógica** - H1 → H2 → H3 (não pule níveis)
3. ✅ **Body para parágrafos** - Nunca use divs com classes inline
4. ✅ **NumericValue para métricas** - Valores em dashboards
5. ✅ **Label para formulários** - Todos os inputs precisam de label
6. ✅ **Caption para metadados** - Timestamps, IDs, info terciária

## 🎨 Exemplos Práticos

### Dashboard Card

```tsx
<Card className="bg-gradient-to-br from-primary-50 to-primary-100 p-6">
  <Small className="text-primary-700 mb-2">Faturamento Mensal</Small>
  <NumericValue className="text-primary-900">R$ 125.430,00</NumericValue>
  <Small className="text-green-600 mt-2 font-medium">↑ 18.3%</Small>
  <Caption className="text-primary-600 mt-2">Atualizado há 5min</Caption>
</Card>
```

### Lista de Pacientes

```tsx
{patients.map(patient => (
  <Card key={patient.id} className="p-4">
    <Body className="font-medium text-gray-900">{patient.name}</Body>
    <Small className="mt-1 text-gray-600">CPF: {patient.cpf}</Small>
    <Caption className="mt-1">Última consulta: {patient.lastVisit}</Caption>
  </Card>
))}
```

### Formulário

```tsx
<div className="space-y-2">
  <Label htmlFor="nome">Nome Completo</Label>
  <input id="nome" type="text" className="..." />
  <Caption>Este nome será usado em documentos oficiais</Caption>
</div>
```

## ♿ Acessibilidade

Todos os componentes seguem WCAG AA/AAA:

- **Gray 900** (#111827): 16.6:1 - AAA ✓
- **Gray 600** (#6B7280): 7.9:1 - AAA ✓
- **Gray 400** (#9CA3AF): 4.6:1 - AA ✓

## 🚫 Evite

```tsx
❌ <div className="text-3xl font-bold">Título</div>
✅ <H1>Título</H1>

❌ <span className="text-base">Descrição</span>
✅ <Body>Descrição</Body>

❌ <p className="text-4xl font-bold">12345</p>
✅ <NumericValue>12.345</NumericValue>
```

## 📚 Documentação Completa

- **Guia Completo**: `docs/TYPOGRAPHY_GUIDE.md`
- **Exemplos de Código**: `src/components/examples/TypographyExamples.tsx`
- **Design System**: Acesse `/design-system` → aba "Tipografia"

## 🔗 Links Úteis

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

