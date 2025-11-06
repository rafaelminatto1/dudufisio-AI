# 📊 Guia de Análise de Testes E2E - MoocaFisio

## 🎯 Objetivo

Este documento orienta a execução e análise dos 34 testes E2E implementados no projeto MoocaFisio.

---

## 🚀 Como Executar os Testes

### 1. Validar Ambiente

```bash
npm run test:e2e:validate
```

Este comando verifica:
- ✅ Servidor dev rodando na porta 5173
- ✅ Configuração do Supabase (.env.local)
- ✅ Browsers do Playwright instalados
- ✅ Arquivos de teste presentes
- ✅ Dependências instaladas

### 2. Executar Testes com Interface (RECOMENDADO)

```bash
npm run test:e2e:ui
```

**Vantagens:**
- Interface visual interativa
- Depuração passo a passo
- Visualização em tempo real
- Inspeção de seletores
- Re-execução fácil de testes específicos

### 3. Executar Todos os Testes

```bash
npm run test:e2e
```

### 4. Executar Teste Específico

```bash
npx playwright test appointment-scheduling
npx playwright test session-evolution
npx playwright test exercise-prescription
```

### 5. Ver Relatório HTML

```bash
npm run test:report
```

---

## 📋 Checklist de Pré-Execução

Antes de executar os testes, certifique-se:

- [ ] Servidor dev está rodando (`npm run dev`)
- [ ] Porta 5173 está acessível (http://localhost:5173)
- [ ] Usuário de teste existe no Supabase:
  - Email: admin@dudufisio.com
  - Senha: DuduFisio2024!
- [ ] Browsers instalados (`npx playwright install`)
- [ ] Dados de teste existem no Supabase (pacientes, agendamentos)

---

## 🧪 Testes Implementados (34 Total)

### 📅 Appointment Scheduling (11 testes)

| # | Teste | Descrição | Prioridade |
|---|-------|-----------|------------|
| 1 | Visualizar calendário semanal | Carrega e exibe semana atual | ⭐⭐⭐ |
| 2 | Criar novo agendamento | Fluxo completo de criação | ⭐⭐⭐ |
| 3 | Impedir conflito de horário | Validação de conflitos | ⭐⭐⭐ |
| 4 | Editar agendamento existente | Modificar dados | ⭐⭐ |
| 5 | Cancelar agendamento | Remover agendamento | ⭐⭐ |
| 6 | Recorrência semanal | Criar múltiplos agendamentos | ⭐⭐ |
| 7 | Buscar por paciente | Filtrar por nome | ⭐⭐ |
| 8 | Filtrar por terapeuta | Visualização por profissional | ⭐⭐ |
| 9 | Visualizar detalhes | Modal de informações | ⭐ |
| 10 | Navegar entre semanas | Setas de navegação | ⭐⭐ |
| 11 | Validar campos obrigatórios | Mensagens de erro | ⭐⭐⭐ |

### 🩺 Session Evolution (11 testes)

| # | Teste | Descrição | Prioridade |
|---|-------|-----------|------------|
| 1 | Abrir sessão agendada | Navegar para evolução | ⭐⭐⭐ |
| 2 | Preencher SOAP completo | S-O-A-P todos campos | ⭐⭐⭐ |
| 3 | Auto-save de rascunhos | Salvar automaticamente | ⭐⭐ |
| 4 | Múltiplas condutas | Adicionar várias condutas | ⭐⭐ |
| 5 | Adicionar anexos | Upload de arquivos | ⭐ |
| 6 | Finalizar e assinar | Completar sessão | ⭐⭐⭐ |
| 7 | Visualizar histórico | Lista de evoluções | ⭐⭐ |
| 8 | Editar evolução recente | Modificar 24h | ⭐⭐ |
| 9 | Gerar PDF | Exportar evolução | ⭐⭐ |
| 10 | Validar campos obrigatórios | Mensagens de erro | ⭐⭐⭐ |
| 11 | Cronômetro de sessão | Timer funcional | ⭐ |

### 💪 Exercise Prescription (12 testes)

| # | Teste | Descrição | Prioridade |
|---|-------|-----------|------------|
| 1 | Navegar biblioteca | Visualizar exercícios | ⭐⭐⭐ |
| 2 | Buscar por nome | Campo de busca | ⭐⭐ |
| 3 | Filtrar por categoria | Dropdown de categorias | ⭐⭐ |
| 4 | Visualizar detalhes/vídeo | Modal de exercício | ⭐⭐ |
| 5 | Criar novo protocolo | Fluxo completo | ⭐⭐⭐ |
| 6 | Adicionar 5 exercícios | Múltiplas seleções | ⭐⭐ |
| 7 | Configurar séries/reps | Personalização | ⭐⭐⭐ |
| 8 | Atribuir a paciente | Vincular protocolo | ⭐⭐⭐ |
| 9 | Paciente visualiza portal | Área do paciente | ⭐⭐ |
| 10 | Paciente marca concluído | Interação | ⭐⭐ |
| 11 | Terapeuta vê progresso | Dashboard de adesão | ⭐⭐ |
| 12 | Editar protocolo | Modificar existente | ⭐⭐ |

---

## 📊 Métricas de Sucesso

### Taxa de Sucesso Esperada (Primeira Execução)

| Categoria | Meta | Ótimo | Aceitável | Problemático |
|-----------|------|-------|-----------|--------------|
| Primeira execução | 70-80% | >85% | 65-70% | <65% |
| Após ajustes | 85-95% | >95% | 80-85% | <80% |
| Produção (CI/CD) | >95% | 100% | 90-95% | <90% |

### Principais Causas de Falha (e Soluções)

| Causa | Frequência | Solução |
|-------|------------|---------|
| Timeouts | Alta | Aumentar timeout, otimizar carregamento |
| Seletores inválidos | Alta | Adicionar data-testid, corrigir seletores |
| Dados inexistentes | Média | Executar seed, criar dados de teste |
| Assincronismo | Média | Adicionar waitFor, melhorar expects |
| Conflitos de estado | Baixa | Limpar dados entre testes |

---

## 🔍 Análise de Resultados

### 1. Relatório HTML do Playwright

**Localização:** `playwright-report/index.html`

**O que verificar:**
- ✅ Taxa de sucesso por navegador (Chrome, Firefox, Safari)
- ✅ Tempo de execução de cada teste
- ✅ Screenshots de falhas
- ✅ Traces de execução
- ✅ Vídeos (se habilitados)

### 2. Screenshots de Falhas

**Localização:** `test-results/[teste-falho]/screenshots/`

**Análise:**
- Elemento esperado está presente na tela?
- Selector está correto?
- Página carregou completamente?
- Modal/Dialog está aberto/fechado?
- Dados estão visíveis?

### 3. Traces de Execução

**Como abrir:**
```bash
npx playwright show-trace test-results/[teste-falho]/trace.zip
```

**O que analisar:**
- Passo a passo da execução
- Network requests
- Console logs
- DOM snapshots
- Timing de cada ação

---

## 📝 Documentação de Ajustes

### Template de Análise de Falha

```markdown
### Teste: [Nome do Teste]
**Status:** ❌ Falhou
**Navegador:** Chrome/Firefox/Safari
**Erro:** [Mensagem de erro]

**Causa Raiz:**
- [ ] Timeout
- [ ] Selector inválido
- [ ] Dados inexistentes
- [ ] Assincronismo
- [ ] Outro: ___________

**Solução Aplicada:**
1. [Ação tomada]
2. [Mudança no código]

**Resultado:**
- [ ] ✅ Teste passou após ajuste
- [ ] ❌ Ainda falhando (nova iteração necessária)
```

---

## 🔧 Ajustes Comuns

### 1. Aumentar Timeouts

```typescript
// playwright.config.ts
timeout: 60000, // 60s
expect: { timeout: 10000 }, // 10s
```

### 2. Adicionar Data-testid

```tsx
// Componente React
<button data-testid="create-appointment-btn">
  Criar Agendamento
</button>

// Teste
await page.getByTestId('create-appointment-btn').click();
```

### 3. Melhorar Seletores

```typescript
// ❌ Frágil
await page.click('button.btn-primary');

// ✅ Robusto
await page.getByRole('button', { name: 'Salvar' }).click();
await page.getByTestId('save-button').click();
```

### 4. Aguardar Carregamento

```typescript
// Aguardar elemento
await page.waitForSelector('[data-testid="calendar"]');

// Aguardar estado da rede
await page.waitForLoadState('networkidle');

// Aguardar visibilidade
await expect(page.getByText('Carregando...')).not.toBeVisible();
```

---

## 📈 Próximos Passos Após Análise

### Se Taxa de Sucesso > 80%
1. ✅ Marcar como sucesso parcial
2. 🔧 Ajustar testes que falharam
3. ♻️  Re-executar testes ajustados
4. 📝 Documentar padrões de sucesso

### Se Taxa de Sucesso 65-80%
1. 🔍 Analisar causas principais
2. 🗄️  Criar dados de teste consistentes (seed)
3. 🏷️  Adicionar mais data-testids
4. ⏱️  Ajustar timeouts
5. ♻️  Re-executar todos os testes

### Se Taxa de Sucesso < 65%
1. 🚨 Revisar infraestrutura de testes
2. 🗄️  Executar seed obrigatoriamente
3. 🔍 Verificar configuração do Supabase
4. 🏷️  Adicionar data-testids em massa
5. 🐛 Debug individual de cada teste
6. ♻️  Re-executar em partes (categoria por categoria)

---

## 🎯 Checklist Final

### Após Execução dos Testes
- [ ] Relatório HTML gerado e revisado
- [ ] Taxa de sucesso calculada
- [ ] Screenshots de falhas analisadas
- [ ] Causas raiz identificadas
- [ ] Ajustes planejados e documentados
- [ ] Seletores frágeis identificados
- [ ] Data-testids necessários listados
- [ ] Timeouts avaliados
- [ ] Dados de teste verificados

### Antes de Prosseguir para Próxima Fase
- [ ] Taxa de sucesso > 70%
- [ ] Testes críticos (prioridade ⭐⭐⭐) passando
- [ ] Relatório de ajustes documentado
- [ ] Plano de melhorias definido
- [ ] Seed de dados criado (se necessário)

---

## 📚 Referências

- **Playwright Docs:** https://playwright.dev/
- **Testes Implementados:** `tests/e2e/`
- **Configuração:** `playwright.config.ts`
- **Script de Validação:** `scripts/validate-e2e-environment.ts`

---

**Última atualização:** 04 de Novembro de 2025  
**Versão:** 1.0.0

