# 🧪 Testes Automatizados com Playwright

## 📋 Funcionalidades Testadas

### Módulo de Evolução Avançada (6 funcionalidades):

1. **⏱️ Timer de Sessão** - Verifica se timer inicia automaticamente
2. **📊 Sessão Anterior** - Testa exibição de dados da última sessão
3. **💪 Prescrição de Exercícios** - Valida modal de seleção de exercícios
4. **📸 Upload de Fotos** - Confirma presença de campo de upload
5. **📝 Templates** - Testa abertura de modal de templates
6. **📄 Exportação PDF** - Verifica existência do botão de PDF
7. **🔄 Salvar como Template** - Testa dialog de criar template
8. **✅ Integração** - Verifica ausência de erros no console
9. **📱 Layout Responsivo** - Valida presença da sidebar
10. **📝 Formulário SOAP** - Confirma todos campos principais

### Testes de Performance:
- Carregamento da página de evolução (< 5s)

---

## 🚀 Como Executar os Testes

### 1. Instalar Playwright (primeira vez)

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O servidor deve estar rodando em `http://localhost:5173`

### 3. Executar os testes

**Todos os testes:**
```bash
npx playwright test
```

**Apenas testes de evolução:**
```bash
npx playwright test evolution-advanced-features
```

**Com interface gráfica:**
```bash
npx playwright test --ui
```

**Modo debug:**
```bash
npx playwright test --debug
```

**Executar teste específico:**
```bash
npx playwright test -g "Timer de Sessão"
```

---

## 📊 Relatórios

Após executar os testes, visualize o relatório HTML:

```bash
npx playwright show-report testsprite_tests/reports/html
```

Os relatórios incluem:
- ✅ Testes que passaram
- ❌ Testes que falharam
- 📸 Screenshots de falhas
- 🎥 Vídeos de testes que falharam
- 📈 Métricas de performance

---

## ⚙️ Configuração

**Arquivo:** `playwright.config.ts`

Configurações principais:
- **baseURL:** http://localhost:5173
- **timeout:** 30 segundos por teste
- **workers:** 1 (testes em sequência)
- **retries:** 0 em dev, 2 em CI
- **screenshots:** Apenas em falhas
- **videos:** Apenas em falhas

---

## 🔧 Customização

### Adicionar Novo Teste

Edite `testsprite_tests/evolution-advanced-features.spec.ts`:

```typescript
test('Meu novo teste', async ({ page }) => {
  // Seu código aqui
  await page.click('text=Meu Botão');
  expect(await page.locator('.resultado').count()).toBeGreaterThan(0);
});
```

### Alterar Credenciais de Teste

No arquivo `evolution-advanced-features.spec.ts`, linha 16:

```typescript
const TEST_USER = {
  email: 'seu-email@moocafisio.com.br',
  password: 'sua-senha'
};
```

---

## 📝 Estrutura dos Testes

```
testsprite_tests/
├── evolution-advanced-features.spec.ts  # Testes principais
├── reports/                             # Relatórios gerados
│   ├── html/                           # Relatório HTML
│   └── results.json                    # Resultados em JSON
└── README.md                           # Esta documentação
```

---

## 🎯 CI/CD

Para integrar com GitHub Actions:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: testsprite_tests/reports/
        retention-days: 30
```

---

## 🐛 Troubleshooting

### Erro: "Browser not found"

```bash
npx playwright install
```

### Erro: "Timeout waiting for page"

- Verifique se o servidor dev está rodando
- Aumente o timeout em `playwright.config.ts`

### Erro: "Element not found"

- Os seletores podem ter mudado
- Verifique a estrutura HTML da página
- Use `--debug` para inspecionar

### Testes falhando no CI

- Adicione mais retries em `playwright.config.ts`
- Use `waitForLoadState('networkidle')`
- Adicione `await page.waitForTimeout(1000)` se necessário

---

## 📚 Recursos

- [Documentação Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Seletores](https://playwright.dev/docs/selectors)

---

## ✅ Checklist de Validação

Antes de fazer push:

- [ ] Todos testes passando localmente
- [ ] Screenshots de falhas revisadas
- [ ] Relatório HTML gerado e revisado
- [ ] Credenciais de teste corretas
- [ ] Servidor dev rodando na porta correta
- [ ] Timeout adequado para testes lentos

---

**🎉 Testes prontos para garantir qualidade das funcionalidades avançadas! 🎉**
