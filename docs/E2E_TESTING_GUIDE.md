# 🧪 Guia de Testes E2E - DuduFisio AI

**Versão**: 1.0  
**Data**: 24 de Outubro de 2025  
**Framework**: Playwright

---

## 📋 Visão Geral

Este guia explica como executar, criar e manter testes E2E (End-to-End) para o sistema DuduFisio AI.

---

## 🚀 Executando Testes

### Testes Específicos do Sistema de Evolução

#### Fluxo Completo de Evolução
```bash
npm run test:evolution
```

**Testa**:
- Abertura do modal de evolução
- Preenchimento de campos SOAP
- Métricas rápidas (dor, satisfação)
- Salvamento com Ctrl+S
- Salvamento e fechamento com Ctrl+Enter
- Persistência de dados

---

#### Templates de Conduta
```bash
npm run test:templates
```

**Testa**:
- Criação de templates
- Listagem de templates
- Aplicação em nova evolução
- Edição de templates
- Deleção de templates

---

#### Atalhos de Teclado
```bash
npm run test:keyboard
```

**Testa**:
- Ctrl+S (salvar)
- Ctrl+Enter (salvar e fechar)
- Esc (cancelar)
- Ctrl+Z (desfazer)
- Ctrl+Shift+Z (refazer)

---

#### Integração com Dados do Paciente
```bash
npm run test:patient-data
```

**Testa**:
- Carregamento de dados pessoais
- Listagem de cirurgias
- Listagem de patologias
- Histórico de sessões
- Métricas e progresso

---

### Todos os Testes Críticos

```bash
npm run test:critical
```

Executa: evolução + templates + atalhos

---

### Todos os Testes E2E

```bash
npm run test:e2e:complete
```

Executa todos os testes em `tests/e2e/`

---

## 🎯 Estrutura dos Testes

### Localização
```
tests/
├── e2e/
│   ├── session-evolution-complete.spec.ts   ← Novo
│   ├── conduct-templates.spec.ts            ← Novo
│   ├── keyboard-shortcuts.spec.ts           ← Novo
│   ├── patient-data-integration.spec.ts     ← Novo
│   ├── appointment-scheduling.spec.ts
│   └── ...outros testes...
```

### Padrões de Nomenclatura

**Arquivos**: `feature-name.spec.ts`  
**Describes**: `'Feature Name - Context'`  
**Tests**: `'número. Ação específica'`

**Exemplo**:
```typescript
test.describe('Sistema de Evolução - Fluxo Completo', () => {
  test('1. Abrir modal de evolução via agenda', async ({ page }) => {
    // ...
  });
});
```

---

## ✍️ Criando Novos Testes

### Template Básico

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nome da Funcionalidade', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login padrão
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const sidebar = page.locator('aside, nav');
    try {
      await sidebar.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      await page.fill('input[type="email"]', 'therapist@dudufisio.com');
      await page.fill('input[type="password"]', 'demo123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  });

  test('1. Descrição do teste', async ({ page }) => {
    // Navegação
    await page.goto('/rota');
    await page.waitForTimeout(1000);

    // Ação
    const element = page.locator('seletor');
    await element.click();

    // Verificação
    const result = await page.locator('resultado').isVisible();
    expect(result).toBeTruthy();

    // Screenshot
    await page.screenshot({
      path: 'test-results/screenshots/test-name.png',
      fullPage: true
    });
  });
});
```

---

## 🔍 Seletores Recomendados

### Ordem de Preferência

1. **Data Attributes** (melhor)
   ```typescript
   page.locator('[data-testid="appointment-card"]')
   ```

2. **Role Attributes**
   ```typescript
   page.locator('[role="dialog"]')
   page.getByRole('button', { name: 'Salvar' })
   ```

3. **Text Content**
   ```typescript
   page.locator('text=/salvar|save/i')
   page.locator('button').filter({ hasText: /salvar/i })
   ```

4. **Classes** (menos estável)
   ```typescript
   page.locator('[class*="appointment"]')
   ```

---

## 📸 Screenshots

### Quando Tirar
- Início do teste (estado inicial)
- Após ações importantes
- Ao final do teste (estado final)
- Quando teste falha (automático)

### Nomenclatura
```
test-results/screenshots/
├── feature-action.png
├── evolution-modal-opened.png
├── template-created.png
└── ...
```

---

## ⏱️ Timeouts e Esperas

### Recomendações

```typescript
// Espera curta (animações)
await page.waitForTimeout(500);

// Espera média (carregamento)
await page.waitForTimeout(1500);

// Espera longa (network)
await page.waitForTimeout(3000);

// Melhor: esperar por elemento
await element.waitFor({ state: 'visible', timeout: 5000 });

// Melhor: esperar por network
await page.waitForLoadState('networkidle');
```

### Evitar
❌ Timeouts muito longos (> 5s)  
❌ Timeouts fixos quando pode esperar por elemento  
❌ Não usar timeout algum

---

## 🎭 Testando Modais

### Padrão para Modais

```typescript
// Abrir modal
await page.click('button:has-text("Abrir")');
await page.waitForTimeout(500);

// Verificar modal abriu
const modal = page.locator('[role="dialog"]');
await expect(modal).toBeVisible();

// Interagir com modal
await page.fill('input', 'valor');

// Fechar modal
await page.keyboard.press('Escape');

// Verificar modal fechou
await expect(modal).not.toBeVisible();
```

---

## ⌨️ Testando Atalhos de Teclado

### Padrões

```typescript
// Salvar (Ctrl+S)
await page.keyboard.press('Control+S');

// Salvar e fechar (Ctrl+Enter)
await page.keyboard.press('Control+Enter');

// Cancelar (Esc)
await page.keyboard.press('Escape');

// Desfazer (Ctrl+Z)
await page.keyboard.press('Control+Z');

// Refazer (Ctrl+Shift+Z)
await page.keyboard.press('Control+Shift+Z');

// Múltiplas teclas
await page.keyboard.press('Control+Alt+Delete');
```

---

## 🐛 Troubleshooting

### Teste Falhando Intermitentemente

**Causa comum**: Race conditions

**Solução**:
```typescript
// Adicionar esperas apropriadas
await page.waitForLoadState('networkidle');

// Ou esperar por elemento específico
await page.locator('elemento').waitFor({ state: 'visible' });

// Aumentar timeout se necessário
await element.click({ timeout: 10000 });
```

---

### Elemento Não Encontrado

**Debug**:
```typescript
// Ver estrutura da página
console.log(await page.content());

// Listar elementos
const elements = await page.locator('selector').all();
console.log('Encontrados:', elements.length);

// Screenshot para debug
await page.screenshot({ path: 'debug.png', fullPage: true });
```

---

### Login Não Funciona

**Verificar**:
1. URL correta
2. Credenciais corretas
3. Seletores corretos
4. Aguardar redirect

**Exemplo robusto**:
```typescript
await page.goto('/');
await page.fill('input[type="email"]', 'user@email.com');
await page.fill('input[type="password"]', 'password');
await page.click('button[type="submit"]');

// Aguardar redirect
await page.waitForURL(/dashboard|home/, { timeout: 10000 });

// Ou aguardar elemento do dashboard
await page.locator('aside').waitFor({ state: 'visible' });
```

---

## 📊 Executando em CI/CD

### GitHub Actions

Os testes E2E executam automaticamente em:

1. **Pull Requests** → `test:critical`
2. **Push para main** → `test:critical`
3. **Após deploy** → Todos os testes críticos

### Visualizar Resultados

```bash
# Localmente, ver relatório HTML
npm run test:report

# No GitHub
# Actions → Workflow → Artifacts → e2e-test-results
```

---

## 🎯 Boas Práticas

### DO ✅

- ✅ Usar seletores estáveis (data-testid, role)
- ✅ Esperar por elementos antes de interagir
- ✅ Tirar screenshots em pontos-chave
- ✅ Usar `continue-on-error: true` para testes exploratórios
- ✅ Agrupar testes relacionados em describe
- ✅ Nomear testes descritivamente

### DON'T ❌

- ❌ Usar seletores CSS muito específicos
- ❌ Depender de timings fixos
- ❌ Escrever testes interdependentes
- ❌ Ignorar falhas intermitentes
- ❌ Deixar console.log em produção
- ❌ Testes muito longos (> 1 min cada)

---

## 📝 Exemplos Práticos

### Testar Formulário Completo

```typescript
test('Preencher formulário SOAP', async ({ page }) => {
  // Abrir modal
  await page.click('[data-testid="open-evolution"]');
  
  // Preencher campos
  await page.fill('[data-testid="soap-subjective"]', 'Dor no joelho');
  await page.fill('[data-testid="soap-objective"]', 'ROM limitada');
  await page.fill('[data-testid="soap-assessment"]', 'Evolução positiva');
  await page.fill('[data-testid="soap-plan"]', 'Continuar tratamento');
  
  // Salvar
  await page.click('[data-testid="save-button"]');
  
  // Verificar sucesso
  await expect(page.locator('text=/salvo|success/i')).toBeVisible();
});
```

### Testar Lista com Dados Dinâmicos

```typescript
test('Verificar lista de sessões', async ({ page }) => {
  await page.goto('/sessions');
  
  // Aguardar carregar
  await page.waitForSelector('[data-testid="session-item"]', { timeout: 5000 });
  
  // Contar itens
  const items = await page.locator('[data-testid="session-item"]').count();
  expect(items).toBeGreaterThan(0);
  
  // Verificar primeiro item
  const firstItem = page.locator('[data-testid="session-item"]').first();
  await expect(firstItem).toBeVisible();
});
```

---

## 🔗 Recursos Adicionais

### Playwright
- Documentação: https://playwright.dev
- Seletores: https://playwright.dev/docs/selectors
- Best Practices: https://playwright.dev/docs/best-practices

### Projeto
- Testes existentes: `tests/e2e/`
- Configuração: `playwright.config.ts`
- Helpers: `tests/e2e/__helpers__/`

---

*Guia mantido pela equipe de desenvolvimento*

