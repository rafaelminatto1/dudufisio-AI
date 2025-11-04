# 🧪 Como Executar os Testes E2E

## 📋 Pré-requisitos

### 1. Dependências Instaladas
```bash
# Verificar se @axe-core/playwright está instalado
npm list @axe-core/playwright

# Se não estiver, instalar:
npm install --save-dev @axe-core/playwright --legacy-peer-deps
```

### 2. Browsers Playwright
```bash
# Instalar todos os browsers
npx playwright install

# Ou específicos
npx playwright install chromium firefox webkit
```

### 3. Servidor de Desenvolvimento Rodando
```bash
# Em um terminal separado
npm run dev

# Aguardar até ver:
# ➜  Local:   http://localhost:5173/
```

---

## 🚀 Executar Testes

### Opção 1: Todos os Testes E2E
```bash
npm run test:e2e
```

### Opção 2: Testes Específicos

#### Apenas Agendamento
```bash
npx playwright test appointment-scheduling
```

#### Apenas Evolução de Sessão
```bash
npx playwright test session-evolution
```

#### Apenas Prescrição de Exercícios
```bash
npx playwright test exercise-prescription
```

### Opção 3: Com Interface Gráfica (Recomendado)
```bash
npm run test:e2e:ui
```

**Vantagens:**
- ✅ Visualiza execução em tempo real
- ✅ Debug mais fácil
- ✅ Pode pausar e inspecionar

### Opção 4: Em Modo Headed (Ver Browser)
```bash
npm run test:e2e:headed
```

**Ou:**
```bash
npx playwright test --headed
```

---

## 🐛 Debug de Testes

### Modo Debug Completo
```bash
npx playwright test --debug
```

**O que faz:**
- Abre Playwright Inspector
- Executa passo a passo
- Permite inspecionar elementos

### Executar Um Teste Específico
```bash
# Por nome do teste
npx playwright test -g "deve criar novo agendamento"

# Por arquivo e linha
npx playwright test appointment-scheduling.spec.ts:25
```

### Ver Trace de Falhas
```bash
npx playwright show-trace trace.zip
```

---

## 📊 Relatórios

### Gerar Relatório HTML
```bash
npm run test:report

# Ou
npx playwright show-report
```

**Abre navegador com:**
- Lista de todos os testes
- Status (passou/falhou)
- Screenshots de falhas
- Tempos de execução

---

## 🔧 Configurações Úteis

### Executar em Browser Específico
```bash
# Apenas Chromium
npx playwright test --project=chromium

# Apenas Firefox
npx playwright test --project=firefox

# Apenas WebKit (Safari)
npx playwright test --project=webkit
```

### Executar com Retries
```bash
# Até 3 tentativas
npx playwright test --retries=3
```

### Executar em Paralelo
```bash
# 4 workers simultâneos
npx playwright test --workers=4
```

### Executar com Timeout Maior
```bash
# 2 minutos por teste
npx playwright test --timeout=120000
```

---

## 📸 Screenshots e Vídeos

### Tirar Screenshot de Falhas (Já Configurado)
Os screenshots são salvos automaticamente em:
```
test-results/
├── appointment-scheduling-...
│   ├── test-failed-1.png
│   └── trace.zip
```

### Tirar Screenshots de Todos
```typescript
// No playwright.config.ts, mudar:
screenshot: 'on'  // ao invés de 'only-on-failure'
```

### Gravar Vídeos
```typescript
// No playwright.config.ts, mudar:
video: 'on'  // ao invés de 'retain-on-failure'
```

---

## ✅ Verificar Resultados

### Sucesso Total
```
Running 34 tests using 1 worker

✓ [chromium] › appointment-scheduling.spec.ts:11 - deve visualizar o calendário semanal (2.3s)
✓ [chromium] › appointment-scheduling.spec.ts:25 - deve criar novo agendamento (5.1s)
...

34 passed (1.2m)
```

### Com Falhas
```
Running 34 tests using 1 worker

✓ [chromium] › appointment-scheduling.spec.ts:11 - passou (2.3s)
✗ [chromium] › appointment-scheduling.spec.ts:25 - FALHOU (8.1s)

1) [chromium] › appointment-scheduling.spec.ts:25 - deve criar novo agendamento
   
   Error: Timeout 15000ms exceeded.
   waiting for locator('[role="dialog"]')
```

---

## 🔍 Solução de Problemas Comuns

### Problema 1: "Timeout waiting for element"

**Causa:** Elemento não encontrado ou página não carregou

**Soluções:**
```bash
# 1. Aumentar timeout
npx playwright test --timeout=60000

# 2. Verificar se servidor está rodando
curl http://localhost:5173

# 3. Executar em modo headed para ver o que acontece
npx playwright test --headed
```

### Problema 2: "Cannot find chromium"

**Solução:**
```bash
npx playwright install chromium
```

### Problema 3: Testes instáveis (flaky)

**Soluções:**
```typescript
// No teste, adicionar:
test.describe.configure({ retries: 2 });

// Ou executar com:
npx playwright test --retries=2
```

### Problema 4: "Connection refused"

**Causa:** Servidor dev não está rodando

**Solução:**
```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Testes (aguardar servidor iniciar)
npm run test:e2e
```

### Problema 5: Credenciais de teste não funcionam

**Solução:**
```typescript
// Verificar credenciais em:
// tests/e2e/appointment-scheduling.spec.ts linha 8

// Criar usuário de teste no Supabase se necessário
```

---

## 🎯 Boas Práticas

### 1. Executar Testes Localmente Antes de Commit
```bash
npm run test:e2e
```

### 2. Usar UI Mode Para Desenvolvimento
```bash
npm run test:e2e:ui
```

### 3. Limpar Cache Se Necessário
```bash
# Limpar diretório de resultados
rm -rf test-results/

# Limpar cache do Playwright
npx playwright clean
```

### 4. Atualizar Browsers Periodicamente
```bash
npx playwright install --force
```

---

## 📈 Métricas de Qualidade

### Taxa de Sucesso Esperada
- **Primeira execução:** 70-80% (ajustes necessários)
- **Após ajustes:** 90-95%
- **Estável:** 95-98%

### Tempo de Execução Esperado
- **Agendamento:** ~3-5 min (11 testes)
- **Evolução:** ~4-6 min (11 testes)
- **Exercícios:** ~5-7 min (12 testes)
- **Total:** ~12-18 min (34 testes)

### Quando Considerar Teste Flaky
- Falha < 10% das vezes: Normal
- Falha 10-30%: Investigar
- Falha > 30%: Corrigir urgente

---

## 🔄 CI/CD (Próximo Passo)

### GitHub Actions (Exemplo)
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📝 Checklist de Execução

### Antes de Executar
- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Browsers instalados (`npx playwright install`)
- [ ] Dependências atualizadas (`npm install`)
- [ ] Banco de dados com dados de teste

### Durante Execução
- [ ] Observar saída do console
- [ ] Notar quais testes passam/falham
- [ ] Verificar mensagens de erro

### Após Execução
- [ ] Revisar relatório (`npm run test:report`)
- [ ] Analisar screenshots de falhas
- [ ] Ajustar seletores se necessário
- [ ] Executar novamente para confirmar

---

## 🎓 Recursos Adicionais

### Documentação Oficial
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

### Vídeos Úteis
- [Playwright in 100 Seconds](https://www.youtube.com/watch?v=Xz6lhEzgI5I)
- [Test Automation with Playwright](https://www.youtube.com/results?search_query=playwright+tutorial)

---

## 💡 Dicas Finais

### 1. Comece Pequeno
Execute um teste por vez para entender o comportamento:
```bash
npx playwright test -g "deve visualizar o calendário"
```

### 2. Use UI Mode
É a melhor ferramenta para debug:
```bash
npm run test:e2e:ui
```

### 3. Não Desanime com Falhas Iniciais
É normal precisar ajustar seletores na primeira execução.

### 4. Mantenha Dados de Teste Consistentes
Crie usuários e pacientes específicos para testes.

### 5. Execute em Diferentes Browsers
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

**Boa sorte com os testes! 🚀**

Se encontrar problemas, verifique:
1. Console do terminal
2. Screenshots em `test-results/`
3. Relatório HTML (`npm run test:report`)

