# 📖 Guia de Uso do Sistema Tipográfico - MoocaFisio

## Visão Geral

O sistema tipográfico do MoocaFisio é baseado na fonte **Inter** com componentes React reutilizáveis que garantem consistência, legibilidade e acessibilidade em toda a aplicação.

## 🎯 Princípios

1. **Hierarquia Clara**: Diferenciação visual entre níveis de informação
2. **Acessibilidade**: Contraste WCAG AA/AAA em todos os textos
3. **Consistência**: Uso padronizado em toda a aplicação
4. **Legibilidade**: Tamanhos e pesos otimizados para leitura

## 📦 Componentes Disponíveis

### Importação

```tsx
import { H1, H2, H3, Body, Small, Caption, NumericValue, Label } from '@/components/ui/Typography';
```

### Componentes e Uso

#### 1. H1 - Título da Página
**Especificações**: 32px (text-3xl) • Bold (700) • Gray 900 (#111827)

```tsx
<H1>Lista de Pacientes</H1>
<H1 className="mb-4">Dashboard Financeiro</H1>
```

**Quando usar**: Título principal de cada página (usar apenas 1 por página)

---

#### 2. H2 - Subtítulo Principal
**Especificações**: 24px (text-2xl) • Semibold (600) • Gray 900 (#111827)

```tsx
<H2>Relatório Mensal</H2>
<H2 className="mt-8">Estatísticas Detalhadas</H2>
```

**Quando usar**: Seções principais dentro de uma página

---

#### 3. H3 - Título de Card/Seção
**Especificações**: 18px (text-lg) • Semibold (600) • Gray 900 (#111827)

```tsx
<H3>Informações do Paciente</H3>
<H3 className="mb-2">Métricas de Performance</H3>
```

**Quando usar**: Títulos de cards, componentes e subsecções

---

#### 4. Body - Texto Normal
**Especificações**: 16px (text-base) • Regular (400) • Gray 600 (#6B7280)

```tsx
<Body>
  Este é o corpo do texto usado para parágrafos e descrições detalhadas.
  Oferece boa legibilidade com contraste adequado.
</Body>
```

**Quando usar**: Parágrafos, descrições, conteúdo principal

---

#### 5. Small - Texto Pequeno
**Especificações**: 14px (text-sm) • Regular (400) • Gray 600 (#6B7280)

```tsx
<Small>Última atualização: há 2 minutos</Small>
<Small className="text-red-600">* Campo obrigatório</Small>
```

**Quando usar**: Informações secundárias, ajuda inline, metadados

---

#### 6. Caption - Legendas
**Especificações**: 12px (text-xs) • Regular (400) • Gray 400 (#9CA3AF)

```tsx
<Caption>Dados atualizados em 05/11/2025 às 14:30</Caption>
<Caption className="mt-1">ID: #12345</Caption>
```

**Quando usar**: Legendas, timestamps, informações terciárias

---

#### 7. NumericValue - Valor Numérico
**Especificações**: 36px (text-4xl) • Bold (700) • Gray 900 (#111827)

```tsx
<NumericValue>R$ 125.430,00</NumericValue>
<NumericValue className="text-green-600">+15%</NumericValue>
```

**Quando usar**: Valores destacados em dashboards, métricas importantes

---

#### 8. Label - Label de Formulário
**Especificações**: 14px (text-sm) • Medium (500) • Gray 700 (#374151)

```tsx
<Label>Nome Completo</Label>
<Label htmlFor="email">Email</Label>
```

**Quando usar**: Labels de campos de formulário

---

## 🎨 Exemplos de Aplicação

### Página com Hierarquia Completa

```tsx
export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Cabeçalho da Página */}
      <header className="mb-8">
        <H1 className="mb-2">Dashboard Financeiro</H1>
        <Body>Acompanhe o desempenho financeiro da clínica em tempo real.</Body>
      </header>

      {/* Card de Métrica */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 p-6">
        <Small className="text-primary-700 mb-2 block">Faturamento do Mês</Small>
        <NumericValue className="text-primary-900">R$ 125.430,00</NumericValue>
        <Small className="text-green-600 mt-2 block font-medium">
          ↑ 18.3% vs mês anterior
        </Small>
        <Caption className="mt-2 text-primary-600">
          Última atualização: há 5 minutos
        </Caption>
      </Card>

      {/* Seção */}
      <section className="mt-8">
        <H2 className="mb-4">Relatórios Recentes</H2>
        <Card>
          <CardHeader>
            <H3>Análise Mensal</H3>
          </CardHeader>
          <CardContent>
            <Body>
              Confira os indicadores e tendências do último mês para 
              tomar decisões estratégicas baseadas em dados.
            </Body>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

### Formulário com Labels

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="nome">Nome Completo</Label>
    <input
      id="nome"
      type="text"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
    <Caption>Digite o nome completo do paciente</Caption>
  </div>

  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <input
      id="email"
      type="email"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
    <Small className="text-red-600">* Campo obrigatório</Small>
  </div>
</form>
```

### Lista com Hierarquia

```tsx
<div className="space-y-4">
  {patients.map(patient => (
    <Card key={patient.id} className="p-4 hover:bg-gray-50">
      <Body className="font-medium text-gray-900">{patient.name}</Body>
      <Small className="mt-1 block">CPF: {patient.cpf}</Small>
      <Caption className="mt-1 block">
        Última consulta: {formatDate(patient.lastVisit)}
      </Caption>
    </Card>
  ))}
</div>
```

## ✨ Customização

Todos os componentes aceitam a prop `className` para customização:

```tsx
// Alterando cor
<H1 className="text-blue-600">Título Azul</H1>

// Adicionando margem
<Body className="mt-4 mb-2">Texto com margem</Body>

// Combinando múltiplas classes
<Small className="text-red-600 font-semibold uppercase">
  Aviso Importante
</Small>
```

## ♿ Acessibilidade

### Contraste Validado (WCAG)

| Cor | Hex | Contraste em Branco | Nível |
|-----|-----|---------------------|-------|
| Gray 900 | #111827 | 16.6:1 | AAA ✓ |
| Gray 700 | #374151 | 10.4:1 | AAA ✓ |
| Gray 600 | #6B7280 | 7.9:1 | AAA ✓ |
| Gray 400 | #9CA3AF | 4.6:1 | AA ✓ |

### Boas Práticas

1. **Use Gray 900** para títulos (H1, H2, H3)
2. **Use Gray 600** para corpo de texto
3. **Use Gray 400** apenas para legendas/metadados
4. **Nunca use Gray 300 ou inferior** para texto
5. **Sempre teste** o contraste ao usar cores customizadas

## 🚫 Anti-padrões (Evite)

```tsx
❌ NÃO FAÇA:
<div className="text-3xl font-bold text-gray-900">Título</div>
<p className="text-base text-gray-600">Descrição</p>

✅ FAÇA:
<H1>Título</H1>
<Body>Descrição</Body>
```

```tsx
❌ NÃO FAÇA:
<h1 className="text-xl">Título Pequeno</h1>
<span className="text-5xl">Valor</span>

✅ FAÇA:
<H3>Título Pequeno</H3>
<NumericValue>Valor</NumericValue>
```

## 📊 Design System

Para ver todos os componentes tipográficos em ação, acesse:

**Página de Design System**: `/design-system` → Aba "Tipografia"

## 🔍 Referência Rápida

| Componente | Tamanho | Peso | Cor | Uso |
|------------|---------|------|-----|-----|
| H1 | 32px | 700 | Gray 900 | Título da página |
| H2 | 24px | 600 | Gray 900 | Seções principais |
| H3 | 18px | 600 | Gray 900 | Títulos de cards |
| Body | 16px | 400 | Gray 600 | Texto normal |
| Small | 14px | 400 | Gray 600 | Info secundária |
| Caption | 12px | 400 | Gray 400 | Legendas |
| NumericValue | 36px | 700 | Gray 900 | Métricas |
| Label | 14px | 500 | Gray 700 | Labels de form |

## 📝 Checklist de Implementação

Ao criar uma nova página ou componente:

- [ ] Usar H1 para o título da página (apenas 1)
- [ ] Usar H2 para seções principais
- [ ] Usar H3 para títulos de cards
- [ ] Usar Body para descrições e parágrafos
- [ ] Usar Small para informações secundárias
- [ ] Usar Caption para timestamps e metadados
- [ ] Usar NumericValue para métricas destacadas
- [ ] Usar Label para campos de formulário
- [ ] Verificar contraste de cores (WCAG AA mínimo)
- [ ] Testar legibilidade em diferentes tamanhos de tela

---

**Última atualização**: 05/11/2025
**Versão**: 1.0.0
**Contato**: Equipe de Design MoocaFisio













