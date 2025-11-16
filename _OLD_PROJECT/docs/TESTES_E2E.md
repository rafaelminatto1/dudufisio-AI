# 🧪 Guia de Testes E2E - DuduFisio-AI

## Executar Testes

### Opção 1: Detecção Automática de Porta (Recomendado)
```bash
npm run test:e2e
```
Este comando detecta automaticamente qual porta o servidor está usando (5173, 5176, 5177...) e executa os testes nessa porta.

### Opção 2: Execução Direta (se o servidor já está rodando)
```bash
npm run test:e2e:direct
```

### Opção 3: Interface Visual
```bash
npm run test:e2e:ui
```

### Opção 4: Modo Headed (com navegador visível)
```bash
npm run test:e2e:headed
```

### Opção 5: Forçar Porta Específica
```bash
# Porta 5173
$env:PLAYWRIGHT_BASE_URL="http://localhost:5173"; npm run test:e2e:direct

# Porta 5176
$env:PLAYWRIGHT_BASE_URL="http://localhost:5176"; npm run test:e2e:direct

# Porta 5177
$env:PLAYWRIGHT_BASE_URL="http://localhost:5177"; npm run test:e2e:direct
```

## Como Funciona a Detecção de Porta

O sistema verifica automaticamente se o servidor está rodando nas seguintes portas, em ordem:
1. `5173` (porta padrão do Vite)
2. `5176` (porta alternativa comum)
3. `5177` (fallback)
4. `5178`, `5179`, `5180` (outras alternativas)

Se nenhum servidor for encontrado, o Playwright tentará iniciar um automaticamente na porta 5173.

## Configuração

### Variáveis de Ambiente

Você pode configurar manualmente via variáveis de ambiente:

```powershell
# Definir porta do servidor
$env:PLAYWRIGHT_SERVER_URL="http://localhost:5176"

# Definir baseURL para os testes
$env:PLAYWRIGHT_BASE_URL="http://localhost:5176"

# Executar testes
npm run test:e2e:direct
```

### Arquivo de Configuração

As configurações estão em `playwright.config.ts`:

```typescript
{
  webServer: {
    command: 'npm run dev:skip-check',
    url: process.env.PLAYWRIGHT_SERVER_URL || 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, // Reutiliza servidor existente
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
  }
}
```

## Servidor Já Rodando?

Se você já tem o servidor rodando manualmente:

1. **Opção A**: Use o script inteligente (detecta automaticamente)
   ```bash
   npm run test:e2e
   ```

2. **Opção B**: Especifique a porta manualmente
   ```bash
   $env:PLAYWRIGHT_BASE_URL="http://localhost:5176"
   npm run test:e2e:direct
   ```

3. **Opção C**: Deixe o Playwright iniciar um novo servidor
   ```bash
   # Não defina as variáveis de ambiente
   npm run test:e2e:direct
   ```

## Ver Relatório

Após executar os testes, veja o relatório HTML:

```bash
npx playwright show-report
```

## Troubleshooting

### Erro: "ERR_CONNECTION_REFUSED"
- **Causa**: Servidor não está rodando
- **Solução**: Execute `npm run test:e2e` (detecta e inicia automaticamente)

### Erro: "Port already in use"
- **Causa**: Porta já está ocupada
- **Solução**: Use `npm run kill:servers` e execute novamente

### Testes não encontram elementos
- **Causa**: Porta errada ou servidor em porta diferente
- **Solução**: Use `npm run test:e2e` para detecção automática

## Portas Comuns

| Porta | Quando é usada |
|-------|----------------|
| 5173 | Porta padrão (mais comum) |
| 5176 | Quando 5173 está ocupada |
| 5177 | Quando 5176 está ocupada |
| 5178+ | Fallbacks adicionais |

## Arquivos Relacionados

- **Configuração**: `playwright.config.ts`
- **Script Inteligente**: `scripts/run-e2e-tests-smart.ps1`
- **Testes**: `tests/e2e/appointment-flow.spec.ts`
- **Detecção de Porta**: `scripts/prepare-e2e.ps1`

