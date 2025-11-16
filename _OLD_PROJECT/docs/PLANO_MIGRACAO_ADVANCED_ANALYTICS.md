# Plano de Migração — `pages/AdvancedAnalyticsDashboard.tsx`

> Situação atual: **Pendente** (2025-11-13) — utiliza `ChartsLazyOptimized` para múltiplos gráficos de linha/área/barras.

## Motivação
- Dashboard central com diversos gráficos combinados (forecast de demanda, distribuição por terapeuta, evolução de faturamento).
- Carrega grande quantidade de componentes do Recharts, impactando diretamente `feature-charts-*` e `vendor-lodash`.
- Migração libera terreno para remover `ChartsLazyOptimized` do núcleo do app.

## Inventário de gráficos
1. **Previsão de demanda (`forecastChartData`)**
   - `AreaChart` com duas séries (`previsto`, `confiança`).
   - Tooltip rico com valores absolutos e percentuais.
2. **Capacidade × Demanda (`capacityMetrics`)**
   - `BarChart`/`LineChart` combinados (barra + linha).
   - Escalas distintas para capacidade e demanda.
3. **Produtividade por terapeuta (`productivityData`)**
   - `BarChart` agrupado (turnos vs. consultas).
4. **Indicadores adicionais**
   - Pequenos `LineChart`/`AreaChart` auxiliares (dependendo de tabs).

## Estratégia
### 1. Preparar adapters
- Estender `components/charts/nivo/adapters` para:
  - **Line/Area** com suporte a `yScale` customizado e `enableArea`.
  - **Bar combinado**: criar wrapper (`NivoCombinedChart` ou composição com `@nivo/line` + `@nivo/bar`) usando layout `stacked`/`grouped`.
  - Helpers para tooltips com múltiplas séries (`TooltipCard` já atende com ajustes).

### 2. Migração incremental
1. Migrar `forecastChartData` para `NivoLineChart` com `enableArea` e duas séries.
   - Usar `areaOpacity` ajustada para simular Recharts.
   - Tooltip: mostrar previsto/confiança com `formatCurrencyBR` se necessário.
2. Substituir gráfico de capacidade x demanda por abordagem híbrida:
   - Opção A: `@nivo/line` com duas séries e escalas normalizadas (similar ao Analytics dashboard).
   - Opção B: `@nivo/bar` (`capacity`) + `@nivo/line` (`demand`) usando sobreposição (menor prioridade se exigir layout complexo).
3. Migrar gráfico de produtividade (barras duplas) com `NivoBarChart`.
4. Ajustar dashboards secundários/tabs para usar adapters (reaproveitando tema/paleta).

### 3. Limpeza e validação
- Remover importações de `ChartsLazyOptimized`.
- Garantir que animações (`framer-motion`) continuem compatíveis (wrapper Nivo dentro de cartões animados).
- Rodar `npm run build:fast` + `npm run bundle:analyze:size`.
- Atualizar docs (`ANALISE_LODASH_BUNDLE`, `INVENTARIO_RECHARTS_COMPONENTES`, `ROADMAP_MIGRACAO_RECHARTS`).

## Considerações de UX
- Manter cores originais (`COLORS` locais → migrar para paleta do adapter).
- Preservar tooltips com traduções e percentuais.
- Incluir legendas, eixos com labels e formatação (datas `dd/MM`, valores monetários).

## Riscos / Mitigações
- **Overlay de barras + linhas**: se ficar complexo, substituir por barras agrupadas + anotação textual.
- **Performance em datasets maiores**: Nivo performa bem; monitorar se animações precisam ser desativadas em dados massivos.
- **Diferenças visuais**: validar com screenshots antes/depois; ajustar `areaOpacity` e `borderRadius` para proximidade com design atual.

## Próximas ações
1. Estender adapters (suporte area/combinação) — pode ser feito em paralelo.
2. Migrar `AdvancedAnalyticsDashboard` seguindo passos 2.1–2.3.
3. Atualizar documentação e rodar análise de bundle.

