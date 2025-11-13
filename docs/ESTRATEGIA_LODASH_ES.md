# Estratégia para uso de lodash-es

## Situação atual (2025-11-13)
- Não há importações diretas de `lodash` ou `lodash-es` nos pacotes do aplicativo (checagem via `rg "lodash"`).
- O bundle ainda contém um chunk `vendor-lodash` (~45 KB) proveniente de dependências de terceiros, com destaque para `recharts`.
- `vite.config.ts` já define `manualChunks` para isolar `vendor-lodash`, facilitando o monitoramento do tamanho.

## Ações implementadas
- Atualização do lint de otimização (`.eslintrc-bundle-optimization.json`) para bloquear importações do pacote CommonJS (`lodash` e `lodash/*`), incentivando o uso de:
  - utilidades próprias em `lib/utils`, `lib/performance`, etc.;
  - importações pontuais de `lodash-es` quando estritamente necessário (`import debounce from 'lodash-es/debounce'`).

## Recomendações práticas
1. Ao precisar de nova função utilitária, priorize implementação própria (vários helpers já existem em `lib/performance.ts`, `lib/memoization.ts`, `utils/debounce.ts`).
2. Caso seja indispensável usar APIs do lodash:
   - adicione `lodash-es` como dependência;
   - importe apenas o módulo necessário (`import isEqual from 'lodash-es/isEqual'`);
   - evite reexportar tudo em arquivos de índice para preservar tree-shaking.
3. Reavaliar bibliotecas que trazem lodash por padrão (ex.: `recharts`) e migrar para alternativas mais leves conforme plano de gráficos.

## Próximos passos
- Monitorar `vendor-lodash` após cada migração de gráfico.
- Avaliar se utilidades de terceiros que ainda dependem de lodash podem ser substituídas ou removidas.

