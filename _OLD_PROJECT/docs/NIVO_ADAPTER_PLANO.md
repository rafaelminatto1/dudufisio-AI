# Plano de Adapter/Theme para Nivo

## Objetivo
Padronizar o uso da família `@nivo/*` em todos os módulos que estão migrando de Recharts, reduzindo a duplicação de configuração (tema, tooltips, cores) e facilitando a manutenção futura.

## Escopo
- Consolidar tema, paleta e helpers de tooltip utilizados em `components/patient/RatingChart.tsx`, `packages/patient-portal/src/components/ProgressChart.tsx` e `src/pages/EdgeFunctionsPerformanceDashboard.tsx`.
- Disponibilizar API simples para novos gráficos (line, bar, pie inicialmente) nos pacotes principais e satélites (`packages/*`).

## Proposta Técnica

### Estrutura
```
components/charts/nivo/
  ├── theme.ts           # tema compartilhado (cores, fonte, grid, tooltip)
  ├── palette.ts         # paletas nomeadas (core, success, warning, etc.)
  ├── tooltips.tsx       # helpers para tooltips padronizados (line/bar/pie)
  ├── adapters/
  │   ├── line.tsx       # wrapper para ResponsiveLine com props simplificadas
  │   ├── bar.tsx        # wrapper para ResponsiveBar
  │   └── pie.tsx        # wrapper para ResponsivePie
  └── index.ts           # export público
```

### Tema
- Fonte padrão: `Inter, system-ui, sans-serif`.
- Ticks e lines com tons `slate` (`#6b7280` textos, `#d1d5db` linhas).
- Tooltips com borda `#e2e8f0` e sombra consistente.
- Motion preset: `gentle` para transições suaves.

### Paleta sugerida
| Token | Hex | Uso |
|-------|-----|-----|
| `brand.primary` | `#3b82f6` | Séries principais (linhas) |
| `brand.secondary` | `#22c55e` | Série secundária/targets |
| `brand.tertiary` | `#a855f7` | Séries auxiliares |
| `status.success` | `#10b981` | Barras positivas/pie healthy |
| `status.warning` | `#f59e0b` | Estado de alerta |
| `status.danger`  | `#ef4444` | Estado crítico |

### API dos adapters
Cada adapter expõe props alinhadas com a interface atual dos componentes, por exemplo:

```ts
<NivoLineChart
  data={series}
  xLabelFormatter={(value) => format(new Date(value), 'dd/MM')}
  yLabelFormatter={(value) => `${value} ms`}
  highlightSlices
  areaOpacity={0.12}
/>
```

Recursos comuns:
- `withTheme` (opcional) para sobrescrever partes do tema.
- `withTooltip` para injetar tooltip customizado (fallback para padrão).
- `withLegend` com presets (horizontal inferior, vertical direita etc.).

### Rollout
1. Implementar módulo `components/charts/nivo/*` com tema + adapters.
2. Refatorar `RatingChart`, `ProgressChart` e `EdgeFunctionsPerformanceDashboard` para consumir os adapters (garantir API atende casos reais).
3. Criar guia de migração rápida (`docs/NIVO_MIGRATION_GUIDE.md`) contendo exemplos line/bar/pie.
4. Migrar dashboards mais acessados (`pages/AdvancedAnalyticsDashboard.tsx`, `pages/AnalyticsDashboardPage.tsx`) usando os adapters.
5. Após validação, atualizar wrappers existentes (`ChartsLazyOptimized`) para redirecionar gradualmente para Nivo ou sinalizar depreciação.

## Riscos / Mitigações
- **Risco**: perda de flexibilidade em casos especiais → expor escape hatches (`extraProps`).
- **Risco**: tema único não atender todos os contextos → permitir overrides por prop (`customTheme`).
- **Risco**: aumento temporário do bundle → consolidar imports de `@nivo/*` para evitar duplicação (adapters importam módulos específicos).

## Próximos Passos
- Implementar tema e adapters (Sprint atual). ✅
- Documentar convenções de tooltip e paleta no design system.
- Agendar migração dos dashboards listados como prioridade alta.

