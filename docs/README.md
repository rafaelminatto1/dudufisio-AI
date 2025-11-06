# 🎨 Sistema de Cores MoocaFisio - Documentação

> **Status:** ✅ Implementado e Pronto para Uso  
> **Versão:** 1.0  
> **Data:** 5 de Novembro de 2025

---

## 🚀 Início Rápido

### Para Desenvolvedores
```tsx
// Usar a nova paleta
<button className="bg-primary hover:bg-primary-dark text-white">
  Salvar
</button>

<div className="bg-white border border-gray-100 shadow-sm">
  <h3 className="text-gray-900">Título</h3>
  <p className="text-gray-600">Descrição</p>
</div>
```

### Paleta Principal
- **Primária:** `#5B4FE8` (azul/roxo) → `bg-primary`, `text-primary`
- **Secundária:** `#6B7280` (cinza) → `bg-gray-*`, `text-gray-*`
- **Success:** `#10B981` → `bg-success`, `text-success`
- **Error:** `#EF4444` → `bg-error`, `text-error`
- **Warning:** `#F59E0B` → `bg-warning`, `text-warning`

---

## 📚 Documentação Completa

### 📖 Leia Primeiro
**[REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md)**  
Resumo executivo de tudo que foi implementado.  
⏱️ 10-15 minutos

### 🎨 Referência Diária
**[COLOR_SYSTEM.md](./COLOR_SYSTEM.md)**  
Sistema completo de cores com exemplos práticos.  
⏱️ 15-20 minutos

### 🔄 Migração de Código
**[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**  
Como migrar código antigo para o novo sistema.  
⏱️ 20-30 minutos

### 🚀 Comandos Práticos
**[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)**  
Scripts e comandos para migração rápida.  
⏱️ 10 minutos

### ♿ Acessibilidade
**[ACCESSIBILITY_REPORT.md](./ACCESSIBILITY_REPORT.md)**  
Testes de contraste e conformidade WCAG 2.1 AA.  
⏱️ 20-25 minutos

### 📋 Índice Completo
**[INDEX.md](./INDEX.md)**  
Navegação completa de toda a documentação.  
⏱️ 5 minutos

---

## 🎯 Perguntas Frequentes

### "Qual cor usar para X?"
→ Consulte [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) → Seção específica

### "Como migrar bg-blue-50?"
→ Consulte [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) → Tabela de migração

### "Quais componentes já foram atualizados?"
→ Consulte [REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md) → Componentes atualizados

### "Como executar migração em lote?"
→ Consulte [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) → Scripts prontos

---

## 💡 Exemplos Rápidos

### Botão Primário
```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
  Salvar
</button>
```

### Card Padrão
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-semibold text-gray-900">Título</h3>
  <p className="text-sm text-gray-600 mt-1">Descrição</p>
</div>
```

### Badge de Status
```tsx
<span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
  Ativo
</span>
```

### Menu Item Ativo
```tsx
<div className="bg-primary/10 text-primary border border-primary/20 p-2 rounded-lg">
  Dashboard
</div>
```

---

## ✅ Checklist Rápida

Ao criar novo componente:
- [ ] Uso classes do sistema definido
- [ ] Verifiquei contraste (WCAG AA)
- [ ] Testei visualmente
- [ ] Sem erros de linter

---

## 🔗 Links Rápidos

- **Configuração:** `../lib/colors.ts`, `../tailwind.config.ts`
- **Exemplos:** `../components/Sidebar.tsx`, `../components/dashboard/StatCard.tsx`
- **Documentação:** Veja arquivos nesta pasta

---

**Desenvolvido por:** Equipe MoocaFisio  
**Última atualização:** 5 de Novembro de 2025

Para navegação completa, veja [INDEX.md](./INDEX.md) 📚


