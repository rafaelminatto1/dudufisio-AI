# Guia de Acessibilidade - DuduFisio-AI

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Navegação por Teclado](#navegação-por-teclado)
3. [ARIA Labels](#aria-labels)
4. [Screen Readers](#screen-readers)
5. [Contraste de Cores](#contraste-de-cores)
6. [Focus Management](#focus-management)
7. [Checklist de Acessibilidade](#checklist-de-acessibilidade)

---

## 🎯 Visão Geral

Este documento descreve as práticas de acessibilidade implementadas no DuduFisio-AI, garantindo que o sistema seja utilizável por todos os usuários, incluindo aqueles com deficiências visuais, motoras ou cognitivas.

### Padrões Seguidos

- **WCAG 2.1** - Nível AA
- **Section 508** - Compliance
- **ARIA 1.2** - Especificações atuais

---

## ⌨️ Navegação por Teclado

### Atalhos Globais

| Atalho | Ação | Descrição |
|--------|------|-----------|
| `Tab` | Próximo elemento | Navegar entre elementos focáveis |
| `Shift + Tab` | Elemento anterior | Navegar para trás |
| `Enter` | Ativar elemento | Confirmar ação |
| `Esc` | Fechar modal | Cancelar/voltar |
| `Space` | Alternar estado | Checkbox, botões toggle |
| `Arrow Keys` | Navegar opções | Dropdowns, listas |

### Atalhos da Agenda

| Atalho | Ação | Descrição |
|--------|------|-----------|
| `N` ou `Ctrl+N` | Novo agendamento | Abrir formulário |
| `E` | Editar | Editar selecionado |
| `Del` | Deletar | Remover agendamento |
| `F` | Buscar | Focar campo de busca |
| `T` | Hoje | Ir para data atual |
| `←` | Período anterior | Navegar para trás |
| `→` | Próximo período | Navegar para frente |
| `1-4` | Visualizações | Alternar entre views |
| `W` | Lista de espera | Abrir waitlist |
| `B` | Bloqueios | Gerenciar bloqueios |
| `?` | Ajuda | Mostrar atalhos |
| `Ctrl+Z` | Undo | Desfazer ação |
| `Ctrl+Y` | Redo | Refazer ação |

### Indicadores Visuais de Foco

- **Outline**: `2px solid #3b82f6` (azul)
- **Offset**: `2px` do elemento
- **Border radius**: `4px`
- **Transição**: `0.2s ease-in-out`

### Exemplo de Implementação

```tsx
// Botão acessível
<button
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Criar novo agendamento"
  title="Criar novo agendamento (N)"
>
  Criar
</button>
```

---

## 🏷️ ARIA Labels

### Elementos Interativos

Todos os elementos interativos devem ter labels descritivos:

```tsx
// Botão com ícone
<button
  aria-label="Editar agendamento de João Silva"
  title="Editar (E)"
>
  <EditIcon />
</button>

// Input com label associado
<label htmlFor="patient-search">
  Buscar Paciente
</label>
<input
  id="patient-search"
  type="text"
  aria-describedby="patient-search-help"
  aria-required="true"
/>
<span id="patient-search-help" className="sr-only">
  Digite o nome, CPF ou telefone do paciente
</span>
```

### Estados e Propriedades

```tsx
// Botão com estado loading
<button
  aria-busy="true"
  aria-disabled="true"
  aria-label="Salvando agendamento..."
>
  Salvando...
</button>

// Modal com role e descrição
<Dialog
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">
    Novo Agendamento
  </DialogTitle>
  <DialogDescription id="dialog-description">
    Preencha os dados do agendamento
  </DialogDescription>
</Dialog>
```

### Landmarks

```tsx
// Estrutura semântica
<main role="main" aria-label="Agenda principal">
  <nav role="navigation" aria-label="Navegação da agenda">
    {/* Toolbar */}
  </nav>
  
  <section aria-labelledby="stats-title">
    <h2 id="stats-title">Estatísticas</h2>
    {/* Stats */}
  </section>
  
  <section aria-label="Calendário">
    {/* Calendar */}
  </section>
</main>
```

---

## 🔊 Screen Readers

### Anúncios Dinâmicos

```tsx
// Live region para anunciar mudanças
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  Agendamento criado com sucesso
</div>

// Alertas importantes
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  Erro ao salvar agendamento
</div>
```

### Textos Alternativos

```tsx
// Imagens decorativas
<img
  src="logo.svg"
  alt=""
  aria-hidden="true"
/>

// Ícones informativos
<svg
  aria-label="Conflito detectado"
  role="img"
>
  <title>Conflito detectado</title>
  {/* SVG content */}
</svg>

// Badges
<span
  role="status"
  aria-label={`${count} notificações não lidas`}
>
  {count}
</span>
```

### Tabelas Acessíveis

```tsx
<table role="table" aria-label="Agendamentos do dia">
  <caption className="sr-only">
    Lista de agendamentos para 20 de Janeiro de 2025
  </caption>
  <thead>
    <tr>
      <th scope="col">Horário</th>
      <th scope="col">Paciente</th>
      <th scope="col">Tipo</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">10:00</th>
      <td>João Silva</td>
      <td>Consulta</td>
      <td>
        <span role="status" aria-label="Agendado">
          Agendado
        </span>
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 Contraste de Cores

### Ratios Mínimos (WCAG AA)

- **Texto normal**: 4.5:1
- **Texto grande**: 3:1
- **Componentes UI**: 3:1

### Paleta de Cores Acessível

```css
/* Cores primárias */
--color-primary: #3b82f6; /* Azul - 4.5:1 */
--color-primary-dark: #2563eb; /* Azul escuro - 7:1 */

/* Estados */
--color-success: #10b981; /* Verde - 4.5:1 */
--color-warning: #f59e0b; /* Amarelo - 4.5:1 */
--color-error: #ef4444; /* Vermelho - 4.5:1 */

/* Texto */
--color-text: #1e293b; /* Slate - 16:1 */
--color-text-secondary: #64748b; /* Slate - 7:1 */

/* Background */
--color-bg: #ffffff; /* Branco - 21:1 */
--color-bg-secondary: #f8fafc; /* Slate - 19:1 */
```

### Indicadores Não-Visuais

```tsx
// Não confiar apenas em cores
<span className="flex items-center gap-2">
  <span className="text-red-600" aria-label="Conflito">●</span>
  <span>Conflito</span>
</span>

// Adicionar ícones
<div className="flex items-center gap-2">
  <AlertCircleIcon aria-hidden="true" />
  <span>Alerta importante</span>
</div>
```

---

## 🎯 Focus Management

### Focus Trap em Modais

```tsx
// Manter foco dentro do modal
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
};
```

### Restaurar Foco

```tsx
// Salvar elemento ativo antes de abrir modal
const [previousActiveElement, setPreviousActiveElement] = useState<HTMLElement | null>(null);

const openModal = () => {
  setPreviousActiveElement(document.activeElement as HTMLElement);
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  // Restaurar foco
  previousActiveElement?.focus();
};
```

### Skip Links

```tsx
// Link para pular navegação
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
  Pular para conteúdo principal
</a>

<main id="main-content">
  {/* Conteúdo principal */}
</main>
```

---

## ✅ Checklist de Acessibilidade

### Navegação
- [ ] Todos os elementos interativos são focáveis
- [ ] Indicadores de foco visíveis
- [ ] Navegação lógica (Tab order)
- [ ] Atalhos de teclado documentados
- [ ] Skip links implementados

### ARIA
- [ ] Labels descritivos em todos os botões
- [ ] Roles apropriados
- [ ] Estados anunciados (aria-busy, aria-disabled)
- [ ] Relacionamentos (aria-labelledby, aria-describedby)
- [ ] Live regions para mudanças dinâmicas

### Contraste
- [ ] Texto normal: 4.5:1
- [ ] Texto grande: 3:1
- [ ] Componentes UI: 3:1
- [ ] Indicadores não dependem apenas de cor

### Screen Readers
- [ ] Textos alternativos em imagens
- [ ] Anúncios de mudanças importantes
- [ ] Estrutura semântica (headings, landmarks)
- [ ] Tabelas com captions e headers

### Modais
- [ ] Focus trap implementado
- [ ] Foco restaurado ao fechar
- [ ] Esc fecha o modal
- [ ] Labels e descrições claras

### Formulários
- [ ] Labels associados a inputs
- [ ] Mensagens de erro claras
- [ ] Validação em tempo real
- [ ] Campos obrigatórios marcados

### Performance
- [ ] Animações respeitam prefers-reduced-motion
- [ ] Carregamento progressivo
- [ ] Fallbacks para conteúdo assíncrono

---

## 🔧 Utilitários CSS

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Focus Visible

```css
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

## 🧪 Ferramentas de Teste

### Ferramentas Recomendadas

1. **axe DevTools** - Extensão do Chrome
2. **WAVE** - Avaliação de acessibilidade
3. **NVDA** - Screen reader para Windows
4. **VoiceOver** - Screen reader para macOS
5. **Lighthouse** - Auditoria de acessibilidade

### Comandos de Teste

```bash
# Instalar dependências de teste
npm install --save-dev @axe-core/react @testing-library/jest-dom

# Executar testes de acessibilidade
npm run test:a11y

# Auditoria com Lighthouse
npm run lighthouse -- --view
```

---

**Última atualização:** 17 de Janeiro de 2025

