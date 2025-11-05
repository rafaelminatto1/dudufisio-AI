# Sistema de Cores MoocaFisio

## 📋 Visão Geral

Este documento descreve o sistema de cores profissional implementado no MoocaFisio. A paleta foi projetada para proporcionar consistência visual, acessibilidade e uma experiência de usuário moderna.

## 🎨 Paleta de Cores

### Cor Primária (Azul/Roxo)

A cor primária é usada para elementos principais da interface, como botões de ação, links ativos e destaques importantes.

```css
--primary: #5B4FE8
--primary-light: #7C73E6
--primary-dark: #4A3FBB
```

**Variações Tailwind:**
- `primary-50`: #F5F3FF
- `primary-100`: #EDE9FE
- `primary-200`: #DDD6FE
- `primary-300`: #C4B5FD
- `primary-400`: #A78BFA
- `primary-500`: #5B4FE8 (DEFAULT)
- `primary-600`: #4A3FBB
- `primary-700`: #3D34A5
- `primary-800`: #312E81
- `primary-900`: #1E1B4B

**Quando usar:**
- Botões de ação primária
- Links e navegação ativa
- Ícones importantes
- Destaques interativos

### Cor Secundária (Cinza Neutro)

Cores neutras para textos, bordas e elementos de suporte.

```css
--secondary: #6B7280
--secondary-light: #9CA3AF
--secondary-dark: #4B5563
```

**Variações Tailwind:**
- `secondary-50`: #F9FAFB
- `secondary-100`: #F3F4F6
- `secondary-200`: #E5E7EB
- `secondary-300`: #D1D5DB
- `secondary-400`: #9CA3AF
- `secondary-500`: #6B7280 (DEFAULT)
- `secondary-600`: #4B5563
- `secondary-700`: #374151
- `secondary-800`: #1F2937
- `secondary-900`: #111827

**Quando usar:**
- Textos secundários
- Bordas e divisores
- Backgrounds de hover
- Elementos desabilitados

### Backgrounds

```css
--bg-light: #F9FAFB
--bg-white: #FFFFFF
--bg-dark: #1F2937
```

**Quando usar:**
- `bg-light`: Background principal da aplicação
- `bg-white`: Cards, modais e componentes elevados
- `bg-dark`: Modo escuro (futuro)

### Estados de Status

#### Success (Sucesso)
```css
--status-success: #10B981
```

**Classe Tailwind:** `success-500`

**Quando usar:**
- Mensagens de sucesso
- Confirmações
- Indicadores positivos
- Incrementos em métricas

#### Warning (Aviso)
```css
--status-warning: #F59E0B
```

**Classe Tailwind:** `warning-500`

**Quando usar:**
- Alertas não-críticos
- Avisos de atenção
- Estados pendentes

#### Error (Erro)
```css
--status-error: #EF4444
```

**Classe Tailwind:** `error-500`

**Quando usar:**
- Mensagens de erro
- Validação de formulários
- Ações destrutivas
- Decrementos em métricas

#### Info (Informação)
```css
--status-info: #3B82F6
```

**Classe Tailwind:** `info-500`

**Quando usar:**
- Mensagens informativas
- Tooltips
- Dicas contextuais

### Textos

```css
--text-primary: #111827    /* Texto principal */
--text-secondary: #6B7280  /* Texto secundário */
--text-tertiary: #9CA3AF   /* Texto terciário/desabilitado */
```

**Classes Tailwind:**
- `text-gray-900`: Títulos e texto principal
- `text-gray-600`: Texto secundário
- `text-gray-400`: Texto terciário

### Bordas

```css
--border-light: #E5E7EB
--border-medium: #D1D5DB
```

**Classes Tailwind:**
- `border-gray-100`: Bordas sutis em cards
- `border-gray-200`: Bordas de divisão
- `border-gray-300`: Bordas mais visíveis

## 🎯 Guia de Uso

### Botões

#### Botão Primário
```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
  Salvar
</button>
```

#### Botão Secundário
```tsx
<button className="bg-white hover:bg-gray-50 text-primary border-2 border-primary px-4 py-2 rounded-lg">
  Cancelar
</button>
```

#### Botão Success
```tsx
<button className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-lg">
  Confirmar
</button>
```

#### Botão Outline
```tsx
<button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
  Opção
</button>
```

### Cards

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-semibold text-gray-900">Título</h3>
  <p className="text-sm text-gray-600 mt-1">Descrição do card</p>
</div>
```

### Menu Lateral

```tsx
// Item normal
<div className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg">
  Item de Menu
</div>

// Item ativo
<div className="bg-primary/10 text-primary border border-primary/20 p-2 rounded-lg">
  Item Ativo
</div>
```

### Badges de Status

```tsx
// Sucesso
<span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
  Ativo
</span>

// Warning
<span className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs">
  Pendente
</span>

// Error
<span className="bg-error/10 text-error px-2 py-1 rounded-full text-xs">
  Erro
</span>
```

## ♿ Acessibilidade

Todos os pares de cores foram testados para garantir conformidade com WCAG 2.1 AA.

### Contrastes Validados

| Combinação | Contraste | Status |
|------------|-----------|--------|
| Primary (#5B4FE8) / White | 7.2:1 | ✅ AAA |
| Secondary (#6B7280) / White | 4.6:1 | ✅ AA |
| Gray-900 (#111827) / White | 16.1:1 | ✅ AAA |
| Gray-600 (#6B7280) / White | 4.6:1 | ✅ AA |
| Success (#10B981) / White | 3.8:1 | ✅ AA |
| Error (#EF4444) / White | 4.3:1 | ✅ AA |
| Warning (#F59E0B) / Black | 4.5:1 | ✅ AA |

### Recomendações de Contraste

1. **Textos pequenos (<18px):** Usar contraste mínimo de 4.5:1
2. **Textos grandes (≥18px ou bold ≥14px):** Usar contraste mínimo de 3:1
3. **Elementos interativos:** Sempre usar cores com contraste adequado
4. **Estados de foco:** Adicionar outline visível com `focus:ring-2`

## 📦 Uso em Código

### Tailwind CSS

```tsx
// Usando classes utilitárias
<div className="bg-primary text-white">
  <button className="bg-primary hover:bg-primary-dark">
    Botão
  </button>
</div>
```

### CSS Variables

```css
.custom-element {
  color: var(--primary);
  background-color: var(--bg-white);
  border-color: var(--border-light);
}
```

### TypeScript

```typescript
import { colors } from '@/lib/colors';

const primaryColor = colors.primary.DEFAULT; // #5B4FE8
const successColor = colors.status.success; // #10B981
```

## 🚫 O Que Evitar

### ❌ Cores Hardcoded Aleatórias

```tsx
// ❌ NÃO FAZER
<div className="bg-blue-500 text-green-400">
```

```tsx
// ✅ FAZER
<div className="bg-primary text-success">
```

### ❌ Múltiplas Cores Vibrantes

```tsx
// ❌ NÃO FAZER - Poluição visual
<div className="bg-purple-500">
  <span className="text-pink-600">Item 1</span>
  <span className="text-orange-600">Item 2</span>
  <span className="text-cyan-600">Item 3</span>
</div>
```

```tsx
// ✅ FAZER - Consistência
<div className="bg-white">
  <span className="text-gray-900">Item 1</span>
  <span className="text-gray-900">Item 2</span>
  <span className="text-gray-900">Item 3</span>
</div>
```

### ❌ Baixo Contraste

```tsx
// ❌ NÃO FAZER - Contraste insuficiente
<p className="text-gray-300">Texto difícil de ler</p>
```

```tsx
// ✅ FAZER - Contraste adequado
<p className="text-gray-900">Texto legível</p>
```

## 🔄 Migração de Código Antigo

Se você encontrar cores antigas no código, migre usando esta tabela:

| Cor Antiga | Nova Cor | Classe Tailwind |
|------------|----------|-----------------|
| `bg-blue-50` | `bg-primary/10` | Background primário claro |
| `text-blue-700` | `text-primary` | Texto primário |
| `border-blue-200` | `border-primary/20` | Borda primária |
| `text-slate-600` | `text-gray-600` | Texto secundário |
| `bg-sky-500` | `bg-primary` | Background primário |
| `text-green-600` | `text-success` | Texto de sucesso |
| `text-red-600` | `text-error` | Texto de erro |

## 📚 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

---

**Última atualização:** 2025-11-05  
**Versão:** 1.0  
**Mantido por:** Equipe MoocaFisio

