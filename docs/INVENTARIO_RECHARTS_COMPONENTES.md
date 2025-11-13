# Inventário de Uso do Recharts

## Escopo
Levantamento realizado em 2025-11-13 após execução de `rg "from 'recharts'"` sobre os pacotes de produção. Foram excluídas referências em documentação, testes e wrappers genéricos.

## Componentes/Rotas identificados

1. `src/pages/EdgeFunctionsPerformanceDashboard.tsx`
   - **Uso atual**: importa diretamente `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `BarChart`, `Bar`, `PieChart`, `Cell`, `Pie` do pacote raiz.
   - **Recursos críticos**:
     - Gráfico de linha para séries horárias (`LineChart`, `Line`).
     - Gráfico de barras (`BarChart`, `Bar`).
     - Gráfico de pizza com múltiplas cores (`PieChart`, `Pie`, `Cell`).
     - `ResponsiveContainer` para ajuste automático de largura/altura.
     - `Tooltip` customizado via `contentStyle`.
   - **Observações**:
     - Página de dashboard com múltiplos gráficos renderizados simultaneamente.
     - Uso de dados mockados; possível migração gradual por gráfico.

2. `components/patient/RatingChart.tsx`
   - **Uso atual**: importa `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer` e tipagem `TooltipProps`.
   - **Recursos críticos**:
     - Tooltip customizado com payload tipado (`TooltipProps`).
     - Formatação de ticks de eixo com `renderYAxisTick`.
     - Legend configurável (`Legend`).
   - **Observações**:
     - Componente reutilizado (versão mini).
     - Excelente candidato à migração para wrapper lazy (`ChartsLazyOptimized`) ou biblioteca alternativa com suporte a tooltips customizados.

3. `packages/patient-portal/src/components/ProgressChart.tsx`
   - **Uso atual**: importa `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`.
   - **Recursos críticos**:
     - Exibição de tendência temporal simples (últimos 14 dias).
     - Tooltip padrão com customização básica de rótulo (`formatter`).
   - **Observações**:
     - Cenário simples; pode ser migrado rapidamente para biblioteca mais enxuta ou componente customizado.

## Utilização indireta / wrappers
- `components/charts/ChartsLazyOptimized.tsx` e `components/charts/ChartsLazy.tsx` encapsulam lazy loading completo do Recharts, expondo todos os componentes via `React.lazy`.
- Diversos pacotes (`packages/*/components/React19AssetLoader.tsx`) preparam o preload de `recharts.min.js`, sugerindo intenção de carregamento diferido.

## Dependências relacionadas a lodash
- Recharts mantém dependências internas em `lodash`/`lodash-es`; portanto, cada ponto listado herda esse custo indiretamente.
- Não há utilidades de `lodash` importadas diretamente nesses componentes além da biblioteca de gráficos.

## Próximos passos recomendados
- Substituir imports diretos por `@/components/charts/ChartsLazyOptimized` para validar redução imediata.
- Priorizar migração da página `EdgeFunctionsPerformanceDashboard` (maior concentração de gráficos).
- Selecionar uma biblioteca alternativa (ex.: `visx`, `nivo`, `react-chartjs-2`) e prototipar equivalentes para cada necessidade listada acima.

