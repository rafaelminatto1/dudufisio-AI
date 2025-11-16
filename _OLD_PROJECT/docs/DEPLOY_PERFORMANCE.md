# Deploy Performance

Este documento registra métricas e otimizações para reduzir o tempo de deploy na Vercel.

## Métricas de Build

- Último build local: ~1m 01s (medido via `scripts/measure-build.cjs`)
- Registro automático: `reports/deploy-metrics.json` (append com data/hora, duração em ms)
- Alerta de lentidão: Slack (`SLACK_WEBHOOK_URL`) se `BUILD_WARN_THRESHOLD_MS` for excedido

## Otimizações Aplicadas

- `vercel.json`
  - `buildCommand`: `npm run build:optimized` (mede tempo, executa build otimizado)
  - `installCommand`: `npm ci --prefer-offline --no-audit --no-fund`
  - Cache headers agressivos para `assets/*.js`, `assets/*.css`, imagens, `index.html`
  - `rewrites` para SPA: todas as rotas → `index.html`
  - `crons`: limpeza de cache diária
  - `regions`: `iad1` (reduz latência de deploy/edge)

- `vite.config.ts`
  - Code splitting Fase 3 (chunks por funcionalidade: react-core, router, UI, charts, editor, pdf, etc.)
  - Tree shaking ultra-agressivo com `moduleSideEffects` custom
  - Build ultra-otimizado: sourcemaps desabilitados, `esbuild` para JS/CSS, nomes de arquivos com hash curto

- `package.json`
  - `build:optimized`: mede tempo de build e registra métricas
  - `build:optimized:core`: faz o build real e pós-build
  - `clean:cache`: limpeza nativa para Windows
  - `post-build:optimize`: otimiza CSS/HTML e gera manifest de cache

- Edge/Infra
  - `api/edge-cache.js`: função edge de cache para rotas estáticas (multi-região)

## Como Medir

1. Executar `npm run build:optimized`
2. Verificar `reports/deploy-metrics.json`
3. Validar alertas no Slack (se configurado)

## Próximos Passos

- Quebrar `comp-common` (>1.5MB) em subchunks por domínio (ui, features, forms)
- Adicionar `middleware.ts` (Edge Middleware, se usar Next) para headers dinâmicos
- Habilitar `ISR` onde houver páginas Next (`getStaticProps` + `revalidate`)
- Adicionar cache de dependências em CI (`actions/cache`)