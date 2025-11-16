# Plano de Migração — `pages/AnalyticsDashboardPage.tsx`

> Status (2025-11-13): ✅ Implementado com adapters Nivo.

## Objetivo
Remover o wrapper `ChartsLazyOptimized` do dashboard principal de analytics, migrando todos os gráficos (área, pizza, barras) para os adapters Nivo propostos em `docs/NIVO_ADAPTER_PLANO.md`.

## Diagnóstico atual
- **Gráficos renderizados**:
  1. `AreaChart` com duas métricas (`consultas`, `receita`) e dois eixos (`left/right`).
  2. `PieChart` com distribuição por tipo (`typeData`).
  3. `BarChart` com duas métricas (`consultas`, `receita`) compartilhando eixo X e dois eixos Y.
- **Dependências**: `ChartsLazyOptimized` (Recharts), estilos inline (cores Tailwind), tooltips/legendas padrão do Recharts.
- **Requisitos visuais**:
  - Paleta consistente (azul `#3b82f6`, verde `#10b981`, etc.).
  - Legendas automáticas/internas.
  - Tooltips com labels localizados (Português).

## Estratégia de migração

1. **Preparar adapters Nivo**
   - Garantir que `NivoLineChart`, `NivoBarChart`, `NivoPieChart` ofereçam props para:
     - Configurar múltiplas séries e eixos (line/area com `axisLeft`/`axisRight`).
     - Customizar tooltips e legenda.
     - Definir paletas pré-configuradas (`brand.primary`, `brand.success`, etc.).
   - Expor helpers de formatação (`formatCurrencyBR`, `format` de datas) via callbacks (`yFormatter`, `xFormatter`, `tooltipFormatter`).

2. **Migrar gráfico de tendência (`TabsContent: trend`)**
   - Converter `chartData.last30Days` para duas séries do adapter line (`consultas`, `receita`).
   - Ativar `enableArea` para ambas séries (similar ao fill do Recharts).
   - Configurar eixo esquerdo para contagem (inteiro) e direito para valores monetários (`formatter` com `formatCurrencyBR`).
   - Tooltip: mostrar data, consultas, receita formatada.

3. **Migrar gráfico de distribuição por tipo**
   - Usar `NivoPieChart` com `chartData.typeData`.
   - Mapear cores usando `palette` (fallback: `COLORS` array).
   - Exibir labels percentuais e tooltip com quantidade absoluta.
   - Garantir responsividade com altura fixa (300px) e labels formatados para português.

4. **Migrar gráfico por terapeuta**
   - Transformar `chartData.byTherapist` em duas séries de barras (`consultas`, `receita`) com `indexBy="name"`.
   - Manter eixos duplos via `axisLeft` (contagem) e `axisRight` (R$).
   - Tooltip customizado mostrando ambos valores alinhados com as cores.

5. **Limpeza**
   - Remover importações de `ChartsLazyOptimized`.
   - Se adapters cobrirem casos, importar apenas `Nivo*` wrappers.
   - Revisar `COLORS` constante (poderá migrar para `palette.ts` do adapter).
   - Atualizar testes/Storybook (se existirem) para refletir nova dependência.

## Considerações técnicas
- **Eixos duplos em Nivo**: `ResponsiveLine`/`ResponsiveBar` permitem customização de `axisRight`. Definir manualmente `yFormat` para exibir R$.
- **Performance**: dados pequenos; Nivo deve lidar bem. Habilitar `motionConfig="gentle"` para transições suaves.
- **Acessibilidade**: garantir contraste de cores (paleta Tailwind).
- **Bundle**: com adapters centralizados, os imports adicionais de `@nivo/*` serão compartilhados entre páginas.

## Plano de entrega
1. Implementar adapters (tarefa compartilhada com fase anterior).
2. Criar branch de migração para `AnalyticsDashboardPage`.
3. Ajustar gráficos seguindo passos 2-4 (commit dedicado).
4. Rodar `npm run build:fast` + `npm run bundle:analyze:size` para verificar impacto (`vendor-lodash` deve reduzir após remoção total de Recharts neste dashboard).
5. Atualizar documentação (`ANALISE_LODASH_BUNDLE`, `INVENTARIO_RECHARTS_COMPONENTES`).

## Riscos / Mitigações
- **Complexidade dos eixos duplos**: validar rapidamente com POC antes de refatorar todo componente.
- **Diferença visual**: ajustar opacidades e legendas manualmente para replicar experiência anterior.
- **Dependências cruzadas**: garantir que nenhum componente filho dependa de props específicas do Recharts (ex.: `payload`).

