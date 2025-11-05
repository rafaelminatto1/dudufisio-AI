# Guia de Migração - Sistema de Cores MoocaFisio

## 🎯 Resumo da Migração

Este guia ajuda desenvolvedores a migrar código existente para o novo sistema de cores profissional.

## 📋 Tabela de Migração Rápida

### Cores Primárias

| Antes | Depois | Uso |
|-------|--------|-----|
| `bg-blue-50` | `bg-primary/10` | Background claro primário |
| `bg-blue-100` | `bg-primary-100` | Background primário mais escuro |
| `text-blue-700` | `text-primary` | Texto primário |
| `text-blue-600` | `text-primary` | Texto primário |
| `border-blue-200` | `border-primary/20` | Borda primária sutil |
| `border-blue-300` | `border-primary` | Borda primária |
| `bg-sky-500` | `bg-primary` | Background primário sólido |
| `text-sky-500` | `text-primary` | Texto primário |

### Cores Neutras (Cinzas)

| Antes | Depois | Uso |
|-------|--------|-----|
| `bg-slate-50` | `bg-gray-50` ou `bg-secondary-50` | Background page |
| `bg-slate-100` | `bg-gray-100` | Background hover |
| `text-slate-600` | `text-gray-600` | Texto secundário |
| `text-slate-700` | `text-gray-700` | Texto secundário escuro |
| `text-slate-800` | `text-gray-800` | Texto quase preto |
| `text-slate-900` | `text-gray-900` | Texto preto |
| `border-slate-200` | `border-gray-200` | Bordas padrão |
| `border-slate-300` | `border-gray-300` | Bordas mais visíveis |

### Cores Antigas FisioFlow

| Antes | Depois | Uso |
|-------|--------|-----|
| `bg-fisio-neutral-50` | `bg-secondary-50` ou `bg-gray-50` | Background |
| `bg-fisio-neutral-100` | `bg-secondary-100` ou `bg-gray-100` | Background |
| `bg-fisio-neutral-200` | `bg-secondary-200` ou `bg-gray-200` | Background |
| `text-fisio-neutral-800` | `text-secondary-800` ou `text-gray-800` | Texto |
| `bg-fisio-primary-DEFAULT` | `bg-primary` | Primary color |
| `text-fisio-primary-500` | `text-primary` | Texto primário |
| `bg-fisio-error` | `bg-error` | Background erro |
| `text-fisio-success` | `text-success` | Texto sucesso |

### Estados de Status

| Antes | Depois | Uso |
|-------|--------|-----|
| `text-green-600` | `text-success` | Texto de sucesso |
| `bg-green-50` | `bg-success/10` | Background sucesso claro |
| `text-red-600` | `text-error` | Texto de erro |
| `bg-red-50` | `bg-error/10` | Background erro claro |
| `text-yellow-600` | `text-warning` | Texto de aviso |
| `bg-yellow-50` | `bg-warning/10` | Background aviso claro |

## 🔧 Padrões de Substituição

### Botões

**Antes:**
```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Salvar
</button>
```

**Depois:**
```tsx
<button className="bg-primary hover:bg-primary-dark text-white">
  Salvar
</button>
```

### Cards

**Antes:**
```tsx
<div className="bg-white border-2 border-blue-200 shadow-lg">
  <h3 className="text-slate-900">Título</h3>
  <p className="text-slate-600">Descrição</p>
</div>
```

**Depois:**
```tsx
<div className="bg-white border border-gray-100 shadow-sm">
  <h3 className="text-gray-900">Título</h3>
  <p className="text-gray-600">Descrição</p>
</div>
```

### Ícones

**Antes:**
```tsx
<Icon className="w-5 h-5 text-blue-600" />
```

**Depois:**
```tsx
<Icon className="w-5 h-5 text-primary" />
```

### Badges de Status

**Antes:**
```tsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Ativo
</span>
```

**Depois:**
```tsx
<span className="bg-success/10 text-success px-2 py-1 rounded">
  Ativo
</span>
```

### Loading States / Skeleton

**Antes:**
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
</div>
```

**Depois:**
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
</div>
```

## 🤖 Busca e Substituição Automatizada

### VS Code / Cursor

Use busca e substituição com regex ativado:

1. **Substituir `bg-blue-50` por `bg-primary/10`:**
   - Buscar: `bg-blue-50`
   - Substituir: `bg-primary/10`

2. **Substituir `text-blue-700` por `text-primary`:**
   - Buscar: `text-blue-(?:600|700)`
   - Substituir: `text-primary`

3. **Substituir `border-slate-` por `border-gray-`:**
   - Buscar: `border-slate-`
   - Substituir: `border-gray-`

4. **Substituir `text-slate-` por `text-gray-`:**
   - Buscar: `text-slate-`
   - Substituir: `text-gray-`

5. **Substituir `bg-slate-` por `bg-gray-`:**
   - Buscar: `bg-slate-`
   - Substituir: `bg-gray-`

6. **Substituir cores fisio:**
   - Buscar: `fisio-neutral-`
   - Substituir: `secondary-` ou `gray-`

### Script PowerShell (Windows)

```powershell
# Navegar até o diretório do projeto
cd C:\caminho\para\projeto

# Substituir cores antigas
Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace 'bg-blue-50', 'bg-primary/10' `
        -replace 'text-blue-700', 'text-primary' `
        -replace 'text-blue-600', 'text-primary' `
        -replace 'border-blue-200', 'border-primary/20' `
        -replace 'bg-sky-500', 'bg-primary' `
        -replace 'text-sky-500', 'text-primary' `
        -replace 'text-slate-', 'text-gray-' `
        -replace 'bg-slate-', 'bg-gray-' `
        -replace 'border-slate-', 'border-gray-' `
        -replace 'fisio-neutral-', 'gray-' `
        | Set-Content $_.FullName
}
```

### Script Bash (Linux/Mac)

```bash
#!/bin/bash
# Substituir cores antigas em arquivos TSX/TS

find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
    -e 's/bg-blue-50/bg-primary\/10/g' \
    -e 's/text-blue-700/text-primary/g' \
    -e 's/text-blue-600/text-primary/g' \
    -e 's/border-blue-200/border-primary\/20/g' \
    -e 's/bg-sky-500/bg-primary/g' \
    -e 's/text-sky-500/text-primary/g' \
    -e 's/text-slate-/text-gray-/g' \
    -e 's/bg-slate-/bg-gray-/g' \
    -e 's/border-slate-/border-gray-/g' \
    -e 's/fisio-neutral-/gray-/g' \
    {} \;
```

## 🎨 Componentes UI Atualizados

Os seguintes componentes já foram atualizados para o novo sistema:

- ✅ `components/Sidebar.tsx` - Menu lateral
- ✅ `components/dashboard/StatCard.tsx` - Cards do dashboard
- ✅ `src/components/ui/Button.tsx` - Botões
- ✅ `src/components/ui/Card.tsx` - Cards
- ✅ `pages/DashboardPage.tsx` - Dashboard principal
- ✅ `pages/PatientListPage.tsx` - Lista de pacientes
- ✅ `components/Layout.tsx` - Layout principal
- ✅ `index.css` - Variáveis CSS root

## ⚠️ Pontos de Atenção

### 1. Opacidade com Barra

Ao usar opacidade com classes Tailwind, use barra `/`:

```tsx
// ✅ Correto
className="bg-primary/10 text-primary/80"

// ❌ Incorreto
className="bg-primary-10 text-primary-80"
```

### 2. Cores de Status

Para cores de estado (success, warning, error), use sempre as classes definidas:

```tsx
// ✅ Correto
className="text-success bg-success/10"

// ❌ Incorreto - não usar cores genéricas
className="text-green-600 bg-green-50"
```

### 3. Acessibilidade

Sempre verificar contraste ao mudar cores:

- Texto normal: contraste ≥ 4.5:1
- Texto grande (≥18px): contraste ≥ 3:1

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) para validar.

### 4. Componentes de Terceiros

Componentes de bibliotecas externas (shadcn/ui, radix) podem usar variáveis CSS:

```tsx
// Estes componentes usam variáveis HSL automaticamente
<Dialog.Root>
  <Dialog.Trigger className="bg-primary">
    Abrir
  </Dialog.Trigger>
</Dialog.Root>
```

## 📝 Checklist de Migração

Ao migrar um arquivo, verifique:

- [ ] Substituiu todas as cores `bg-blue-*`, `text-blue-*`, `border-blue-*`
- [ ] Substituiu todas as cores `bg-slate-*`, `text-slate-*`, `border-slate-*`
- [ ] Substituiu todas as cores `bg-sky-*`, `text-sky-*`
- [ ] Substituiu todas as cores `fisio-*`
- [ ] Substituiu cores de status por `success`, `warning`, `error`
- [ ] Testou visualmente o componente
- [ ] Verificou contraste de cores (acessibilidade)
- [ ] Removeu cores inline/hardcoded
- [ ] Usou opacidade com `/` quando necessário

## 🆘 Problemas Comuns

### Cor não aparece após migração

**Problema:** A nova classe não funciona.

**Solução:** Verifique se a classe existe no `tailwind.config.ts`. Cores customizadas podem precisar de configuração adicional.

### Contraste insuficiente

**Problema:** Texto difícil de ler após migração.

**Solução:** Use cores mais escuras. Ex: `text-gray-600` → `text-gray-700` ou `text-gray-900`.

### Opacidade não funciona

**Problema:** `bg-primary-10` não aplica opacidade.

**Solução:** Use barra: `bg-primary/10`.

## 📚 Recursos

- [Documentação do Sistema de Cores](./COLOR_SYSTEM.md)
- [Relatório de Acessibilidade](./ACCESSIBILITY_REPORT.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última atualização:** 5 de Novembro de 2025  
**Versão:** 1.0  
**Dúvidas?** Consulte a equipe de desenvolvimento

