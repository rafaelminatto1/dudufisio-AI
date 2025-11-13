# Análise de Bundle focada em Lodash e Recharts

## Contexto
- Data da medição: 2025-11-13
- Script executado: `npm run bundle:analyze:size`
- Objetivo: quantificar a participação de `lodash` e módulos relacionados a gráficos no bundle final para orientar reduções de peso.

## Resultados principais
- Total de bundles gerados: 73
- Tamanho agregado: **8.48 MB**
- Maior bundle: `vendor-pdf-BQ02uGI8.js` com 1.78 MB (21% do total)
- `vendor-lodash-CXkwkXjU.js`: **44.99 KB** (~0.5% do total)
- `vendor-misc-CD1RzRBp.js`: 210.43 KB (possível concentração de utilitários diversos)
- Main bundle registrado pelo script: 868.47 KB (excede o budget interno de 200 KB em 668.47 KB)
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

## Próximas ações sugeridas
1. Revisar `vite.config.*` para garantir `manualChunks` separados (`vendor-charts`, `vendor-utils`) e habilitar code splitting por rota.
2. Mapear componentes que importam `recharts` e avaliar lazy loading por rota ou componente.
3. Avaliar troca de `recharts` por alternativas menores (p. ex. `visx`, `nivo`, `react-chartjs-2`) e/ou uso de `lodash-es` com imports nomeados.


