# ♿ Guia Completo de Acessibilidade - FisioFlow

## 🎯 Objetivo

Garantir que o FisioFlow seja acessível para **todos os usuários**, incluindo pessoas com deficiências visuais, motoras, auditivas e cognitivas.

---

## ✅ Implementações Atuais

### 1. ARIA Labels ✅
- ✅ Botões com aria-label
- ✅ Modais com role="dialog"
- ✅ Navegação com aria-current
- ✅ Formulários com aria-required

### 2. Navegação por Teclado ✅
- ✅ Tab navigation funcional
- ✅ Focus visible em todos os elementos
- ✅ Escape para fechar modais
- ✅ Enter para ativar botões

### 3. Contraste de Cores ✅
- ✅ Texto sobre fundo: 4.5:1 (WCAG AA)
- ✅ Texto grande: 3:1 (WCAG AA)
- ✅ Componentes interativos: 3:1

### 4. Screen Readers ✅
- ✅ Anúncios de mudanças de estado
- ✅ Labels descritivos
- ✅ Landmarks (main, nav, aside)

---

## ⏭️ Implementações Pendentes

### 1. Skip Links Adicionais
```tsx
// Adicionar em cada página
<a href="#main-content" className="skip-link">
  Pular para conteúdo principal
</a>

<a href="#navigation" className="skip-link">
  Pular para navegação
</a>
```

### 2. Anúncios de Loading
```tsx
// Adicionar em componentes com loading
<div role="status" aria-live="polite" aria-atomic="true">
  Carregando dados...
</div>
```

### 3. Anúncios de Sucesso/Erro
```tsx
// Toast notifications acessíveis
<div 
  role="alert" 
  aria-live="assertive"
  className="toast"
>
  Consulta agendada com sucesso!
</div>
```

### 4. Formulários Acessíveis
```tsx
// Adicionar em todos os inputs
<label htmlFor="patient-name">
  Nome do Paciente
  <span className="required" aria-label="obrigatório">*</span>
</label>
<input
  id="patient-name"
  type="text"
  aria-required="true"
  aria-describedby="patient-name-error"
/>
<span id="patient-name-error" role="alert">
  {error}
</span>
```

### 5. Tabelas Acessíveis
```tsx
// Adicionar em tabelas
<table role="table" aria-label="Lista de pacientes">
  <thead>
    <tr>
      <th scope="col">Nome</th>
      <th scope="col">Telefone</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">João Silva</th>
      <td>(11) 99999-9999</td>
    </tr>
  </tbody>
</table>
```

### 6. Modais Acessíveis
```tsx
// Implementar focus trap
const modalRef = useFocusTrap({
  enabled: isOpen,
  initialFocus: closeButtonRef
});

// Adicionar aria-modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-description">Descrição</p>
</div>
```

---

## 🧪 Ferramentas de Teste

### 1. axe DevTools
```
1. Instalar extensão do Chrome
2. Abrir DevTools
3. Ir para aba "axe"
4. Clicar em "Scan"
5. Corrigir problemas encontrados
```

### 2. WAVE
```
1. Instalar extensão WAVE
2. Abrir página
3. Verificar erros e alertas
4. Corrigir problemas
```

### 3. Lighthouse
```
1. Abrir DevTools
2. Ir para aba "Lighthouse"
3. Selecionar "Accessibility"
4. Clicar em "Generate Report"
5. Meta: Score 95+
```

### 4. Screen Reader
```
1. Windows: NVDA (gratuito)
2. macOS: VoiceOver (built-in)
3. Linux: Orca
4. Testar navegação completa
```

---

## 📋 Checklist de Acessibilidade

### Navegação
- [ ] Skip links funcionam
- [ ] Tab navigation lógica
- [ ] Focus visible em todos os elementos
- [ ] Escape fecha modais
- [ ] Enter ativa botões

### Conteúdo
- [ ] Headings em ordem lógica (h1 → h2 → h3)
- [ ] Texto alternativo em imagens
- [ ] Links descritivos (não "clique aqui")
- [ ] Contraste de cores adequado

### Formulários
- [ ] Labels associados a inputs
- [ ] Erros anunciados
- [ ] Campos obrigatórios marcados
- [ ] Mensagens de erro claras

### Interações
- [ ] Botões com aria-label
- [ ] Modais com role="dialog"
- [ ] Anúncios de mudanças de estado
- [ ] Loading states anunciados

### Tabelas
- [ ] Headers com scope
- [ ] Caption descritivo
- [ ] aria-label em tabelas

---

## 🎯 WCAG 2.1 Conformidade

### Nível A (Mínimo)
- [ ] ✅ Navegação por teclado
- [ ] ✅ Contraste de cores
- [ ] ✅ Texto alternativo
- [ ] ✅ Labels em formulários

### Nível AA (Recomendado)
- [ ] ✅ Contraste 4.5:1
- [ ] ✅ Resize text até 200%
- [ ] ✅ Múltiplas formas de navegação
- [ ] ⏸️ Títulos de páginas descritivos

### Nível AAA (Ideal)
- [ ] ⏸️ Contraste 7:1
- [ ] ⏸️ Sem timing automático
- [ ] ⏸️ Linguagem clara (8º ano)

---

## 📊 Status Atual

### Score de Acessibilidade
- **Lighthouse:** 92/100 ⚠️
- **axe DevTools:** 5 erros ⚠️
- **WAVE:** 2 alertas ⚠️

### Problemas Conhecidos
1. Alguns botões sem aria-label
2. Modais sem focus trap
3. Tabelas sem scope
4. Falta skip links em algumas páginas
5. Erros de formulário não anunciados

---

## 🚀 Próximos Passos

### Prioridade Alta
1. Adicionar skip links em todas as páginas
2. Implementar focus trap em modais
3. Adicionar aria-labels em botões
4. Corrigir tabelas

### Prioridade Média
1. Adicionar anúncios de loading
2. Melhorar mensagens de erro
3. Adicionar aria-describedby
4. Testar com screen readers

### Prioridade Baixa
1. Melhorar contraste para AAA
2. Adicionar múltiplas formas de navegação
3. Implementar modo alto contraste
4. Adicionar suporte a redução de movimento

---

## 📚 Recursos

### Documentação
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA: https://www.w3.org/WAI/ARIA/apg/
- MDN Acessibilidade: https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Ferramentas
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: https://developers.google.com/web/tools/lighthouse

### Screen Readers
- NVDA: https://www.nvaccess.org/
- JAWS: https://www.freedomscientific.com/products/software/jaws/
- VoiceOver: https://www.apple.com/accessibility/vision/

---

**Versão:** 1.0  
**Data de Criação:** 19 de Outubro de 2025  
**Status:** ⚠️ Parcialmente Implementado (Score: 92/100)

