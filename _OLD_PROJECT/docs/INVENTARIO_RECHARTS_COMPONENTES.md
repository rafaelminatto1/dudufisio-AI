# Inventário de Uso do Recharts

## Escopo
Levantamento realizado em 2025-11-13 após execução de `rg "from 'recharts'"` sobre os pacotes de produção. Foram excluídas referências em documentação, testes e wrappers genéricos.

## Componentes/Rotas identificados

- Não há mais importações diretas de `recharts` nos pacotes analisados.  
  > ℹ️ O consumo remanescente acontece exclusivamente via wrappers (`ChartsLazyOptimized` e derivados), utilizados por dashboards legados que ainda não foram migrados.

## Componentes migrados na Fase 2

- `components/patient/RatingChart.tsx`
  - Agora utiliza `@nivo/line` com tooltip customizado reproduzindo emojis e legendas condicionais.
  - Repositório de dados convertido para `ResponsiveLine`, mantendo escala 1-5 e rótulos formatados com `date-fns`.

- `packages/patient-portal/src/components/ProgressChart.tsx`
  - Migrado para `@nivo/line` com `sliceTooltip` personalizado e área preenchida.
  - Mantém exibição dos últimos 14 dias, com labels amigáveis e fallback para ausência de dados.

## Componentes migrados na Fase 3

- `src/pages/EdgeFunctionsPerformanceDashboard.tsx`
  - Gráficos de linha, barra e pizza reescritos com `@nivo/line`, `@nivo/bar` e `@nivo/pie`.
  - Tooltips customizados para preservar mensagens anteriores e paleta de cores original.
  - Removeu a dependência direta do wrapper `ChartsLazyOptimized` nesta rota.
- `pages/AnalyticsDashboardPage.tsx`
  - Área (duplo eixo), pizza e barras agrupadas convertidas para os adapters Nivo.
  - Implementada normalização interna para representar múltiplas escalas (consultas vs. receita) utilizando tooltips padronizados.

## Componentes migrados na Fase 4

- `pages/AdvancedAnalyticsDashboard.tsx`
  - Previsão de demanda reescrita com `NivoAreaLineChart`, preservando a combinação área + linha e tooltips contextuais.
  - Wrapper `ChartsLazyOptimized` removido da rota; os dados agora são transformados em séries Nivo com `sliceTooltip`.

## Utilização indireta / wrappers
- `components/charts/ChartsLazyOptimized.tsx` e `components/charts/ChartsLazy.tsx` encapsulam lazy loading completo do Recharts, expondo todos os componentes via `React.lazy`.
- Diversos pacotes (`packages/*/components/React19AssetLoader.tsx`) preparam o preload de `recharts.min.js`, sugerindo intenção de carregamento diferido.

### Principais consumidores restantes (via wrappers)

| Categoria | Exemplos | Observações |
|-----------|----------|-------------|
| **Dashboards core (app principal)** | `pages/ProgressDashboardPage.tsx`, `pages/PopulationHealthDashboardPage.tsx`, `pages/AdvancedReportsPage.tsx`, `pages/QualityAssuranceDashboardPage.tsx`, `pages/ExerciseAnalyticsPage.tsx`, `pages/ResponsiveDashboardPage.tsx` | Alto impacto: rotas completas ainda carregam múltiplos gráficos via wrapper; ideais para próxima migração. |
| **Widgets reutilizáveis** | `components/dashboard/*`, `components/monitoring/*`, `components/charts/*` | Utilizados em diversos painéis; conversão para Nivo com adapter compartilhado reduz duplicação. |
| **Portal Agenda/Tratamentos/Financeiro (packages)** | `packages/agenda-pacientes/src/components/**`, `packages/financeiro/src/components/**`, `packages/tratamentos/src/components/**` | Grande volume de gráficos; considerar migrar módulos mais acessados (ex.: dashboards de pacientes e financeiros) após consolidar adapter. |
| **Material clínico / relatórios** | `components/clinical-materials/MaterialAnalyticsDashboard.tsx`, `components/reports/**`, equivalentes em `packages/*` | Gráficos agregados para exportação/relatórios; revisar requisitos de impressão antes da migração. |

## Dependências relacionadas a lodash
- Recharts mantém dependências internas em `lodash`/`lodash-es`; portanto, cada ponto listado herda esse custo indiretamente.
- Não há utilidades de `lodash` importadas diretamente nesses componentes além da biblioteca de gráficos.

## Próximos passos recomendados
- Mapear dashboards e widgets que consomem `ChartsLazyOptimized` e definir prioridade de migração (foco em rotas mais acessadas).
- Remover `recharts` e suas tipagens após a migração total, eliminando também scripts de preload (`React19AssetLoader`) e wrappers legados.
- Criar um adapter compartilhado (tema + helpers) para `@nivo/*`, evitando duplicação de configurações entre gráficos migrados.

