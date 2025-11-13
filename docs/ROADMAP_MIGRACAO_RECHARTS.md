# Roadmap de Migração de Gráficos (Recharts → alternativas leves)

## Objetivo
Reduzir a dependência indireta de `lodash` eliminando o uso do `recharts` nas rotas principais, priorizando entregas incrementais com monitoramento de bundle a cada etapa.

## Fase 0 — Preparação (concluída)
- Análise de bundle (`npm run bundle:analyze:size`) para estabelecer linha de base.
- Inventário de componentes dependentes (`EdgeFunctionsPerformanceDashboard`, `RatingChart`, `ProgressChart`).
- Protótipos conceituais com `@nivo/*`, `@visx/xychart` e `react-chartjs-2`.
- Reforço de lint para bloquear importações de `lodash`/`lodash/*`.

## Fase 1 — Ações rápidas
1. **Substituir imports diretos pelo wrapper lazy** ✅ (2025-11-13)  
   - Atualizar `EdgeFunctionsPerformanceDashboard`, `RatingChart` e `ProgressChart` para consumir `@/components/charts/ChartsLazyOptimized`.  
   - Medir impacto (`npm run bundle:analyze:size`) e registrar em `docs/ANALISE_LODASH_BUNDLE.md`.
2. **Code splitting por rota**  
   - Garantir que o carregamento dos gráficos esteja atrasado via `React.lazy()` ou rotas dinâmicas (seção `vendor-charts` separada).  
   - Status: `ChartsLazyOptimized` agora encapsula todos os pontos críticos com `React.lazy`, mantendo `recharts` fora do bundle inicial.

## Fase 2 — Migração de componentes reutilizáveis
1. **Migrar `RatingChart` para `@nivo/line`**  
   - Garantir equivalência de tooltip customizado e escala discreta.  
   - Avaliar necessidade de polyfills para SSR.
2. **Migrar `ProgressChart` (portal do paciente)**  
   - Opção 1: `@nivo/line` (mesmo stack).  
   - Opção 2: `@visx/xychart` para máxima leveza caso bundle do app paciente exija.
3. **Criar camada de abstração**  
   - Introduzir `components/charts/LineChartAdapter.tsx` expondo interface comum (`data`, `series`, `tooltipRenderer`), facilitando troca futura.

## Fase 3 — Dashboards complexos
1. **EdgeFunctionsPerformanceDashboard**  
   - Migrar gradualmente: linha → barras → pizza.  
   - Reaproveitar componentes adapters da fase 2.  
   - Considerar dividir dashboard em tabs com carregamento adiado.
2. **Refino de UX**  
   - Validar animações, tooltips e acessibilidade nas novas libs.  
   - Ajustar tema (cores Tailwind) para manter consistência.

## Fase 4 — Revisão final e monitoramento
1. **Reexecutar análise de bundle** após cada migração relevante.  
2. **Atualizar documentação** (`docs/ANALISE_LODASH_BUNDLE.md`, `docs/PROTOTIPOS_GRAFICOS_ALTERNATIVOS.md`) com resultados.  
3. **Retirar dependências**  
   - Remover `recharts` e tipagens após último componente migrado.  
   - Verificar impacto em scripts de preload (`React19AssetLoader.tsx`).

## Métricas de sucesso
- `vendor-lodash` < 10 KB após remoção do `recharts`.
- Nenhum import direto de `recharts` remanescente.
- Bundle principal abaixo de 200 KB gzip para rotas críticas.

## Riscos / Mitigações
- **Risco**: regressão visual na troca de biblioteca.  
  **Mitigação**: criar stories/Playwright visual diff antes da troca definitiva.
- **Risco**: aumento de bundle devido ao `chart.js`.  
  **Mitigação**: preferir `@nivo`/`@visx`; se usar Chart.js, isolar em chunk e carregar sob demanda.

