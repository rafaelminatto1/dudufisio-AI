# Análise de Bundle focada em Lodash e Recharts

## Contexto
- Data da medição: 2025-11-13
- Script executado: `npm run bundle:analyze:size`
- Objetivo: quantificar a participação de `lodash` e módulos relacionados a gráficos no bundle final para orientar reduções de peso.

## Resultados principais
- Total de bundles gerados: 73
- Tamanho agregado: **8.75 MB**
- Maior bundle: `vendor-misc-0AWBqczz.js` com 2.14 MB (24.5% do total)
- `vendor-lodash-DTKKd5QR.js`: **49.16 KB** (~0.6% do total)
- Main bundle registrado pelo script: 864.85 KB (excede o budget interno de 200 KB em 664.85 KB)
- Nenhum page bundle identificado — sugere necessidade de revisar `manualChunks`/code splitting para páginas.

## Observações específicas
- A análise recomenda criar um chunk dedicado para gráficos (`vendor-charts`) — atualmente `recharts` parece agrupar-se nos bundles genéricos.
- O peso de `lodash` isolado é modesto, porém seu carregamento antecipado em vendor bundle aumenta o tempo de parse. Remover dependências indiretas via `recharts` pode permitir eliminação completa.
- A ausência de bundles de página indica que os gráficos podem estar sempre presentes no bundle principal; reforça o benefício de migração para bibliotecas carregadas sob demanda.

## Atualização pós-Fase 1 (2025-11-13)
- Script executado novamente após apontar todos os componentes críticos para `ChartsLazyOptimized`.
- Diferenças observadas:
  - Total de bundles caiu para 72 (antes: 73) devido à consolidação dos imports.
  - `vendor-lodash` permanece em ~45 KB, confirmando dependência indireta via Recharts.
  - `feature-charts-*` segue acima de 400 KB, reforçando necessidade de migrar gráficos para bibliotecas alternativas.
- Próximo passo: repetir a análise após cada migração de componente para validar redução efetiva de `vendor-lodash`.

## Atualização pós-Fase 2 (2025-11-13)
- Migrações entregues: `components/patient/RatingChart` e `packages/patient-portal/src/components/ProgressChart` agora utilizam `@nivo/line`.
- Resultados imediatos:
  - Total de bundles voltou a 73; o chunk `vendor-misc` cresceu (~+100 KB) devido às dependências do ecossistema Nivo.
  - `vendor-lodash` passou para ~48.8 KB, indicando que ainda há lodash transitivo trazido pelo `EdgeFunctionsPerformanceDashboard` (Recharts) e utilidades internas do Nivo.
  - `feature-charts-*` subiu para ~524 KB; a etapa seguinte (Fase 3) deve focar na migração do dashboard para reduzir significativamente esse chunk.
- A próxima medição deve acompanhar a remoção completa de `recharts` e verificar se `vendor-lodash` pode ser eliminado da build final.

## Atualização pós-Fase 3 (2025-11-13)
- Migração dos gráficos de `EdgeFunctionsPerformanceDashboard` para `@nivo/line`, `@nivo/bar` e `@nivo/pie`.
- Impacto observado:
  - Chunk `feature-charts-*` manteve-se em ~524 KB: os demais dashboards continuam usando o wrapper `ChartsLazyOptimized`, portanto ainda carregam Recharts.
  - `vendor-lodash` permaneceu em ~48.8 KB; a dependência agora se concentra exclusivamente nesses módulos legados e nas utilities internas do Nivo.
  - `vendor-misc` segue sendo o principal foco (2.08 MB) e deverá diminuir conforme Recharts for totalmente removido.
- Próximas medições devem ocorrer após a migração dos dashboards que ainda dependem de `ChartsLazyOptimized`.

## Atualização pós-migração do Analytics Dashboard (2025-11-13)
- `pages/AnalyticsDashboardPage.tsx` passou a consumir os adapters Nivo (line/bar/pie).
- Resultados mais recentes na época:
  - Bundle total: **8.76 MB** (↗ ~0.06 MB, devido à consolidação de Nivo e remoção do wrapper específico).
  - `vendor-lodash`: **~49.1 KB** (variação mínima; Recharts permanece presente em outros dashboards).
  - `vendor-misc`: **~2.14 MB** — concentra dependências compartilhadas (Nivo + bibliotecas auxiliares).
- O próximo salto esperado era a queda significativa de `vendor-lodash`/`feature-charts-*` após migrar os demais dashboards (`pages/AdvancedAnalyticsDashboard.tsx`, etc.) e remover o wrapper `ChartsLazyOptimized`.

## Atualização pós-migração do Advanced Analytics Dashboard (2025-11-13)
- `pages/AdvancedAnalyticsDashboard.tsx` deixou de usar `ChartsLazyOptimized` e agora consome o novo adapter `NivoAreaLineChart` (série com área + linha e `sliceTooltip` padronizado).
- Métricas da análise (`npm run bundle:analyze:size`):
  - Bundle total permanece em **8.75 MB**, reforçando a necessidade de novos cortes estruturais.
  - `vendor-lodash-DTKKd5QR.js`: **49.16 KB** — ainda presente por causa de dashboards não migrados.
  - `feature-charts-C0cX0Z7P.js`: **529.25 KB** (↗ leve em relação ao snapshot anterior; o wrapper legado ainda é carregado por outras rotas).
  - `vendor-misc-0AWBqczz.js`: **2.14 MB**, agora agrupando tanto utilitários legados quanto o ecossistema Nivo consolidado.
- Próxima meta: migrar dashboards restantes e descontinuar `ChartsLazyOptimized` para possibilitar a queda real de `vendor-lodash` e do chunk `feature-charts-*`.

## Próximas ações sugeridas
1. Revisar `vite.config.*` para garantir `manualChunks` separados (`vendor-charts`, `vendor-utils`) e habilitar code splitting por rota.
2. Mapear componentes que importam `recharts` e avaliar lazy loading por rota ou componente.
3. Avaliar troca de `recharts` por alternativas menores (p. ex. `visx`, `nivo`, `react-chartjs-2`) e/ou uso de `lodash-es` com imports nomeados.


