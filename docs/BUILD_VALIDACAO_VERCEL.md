## Validação local (`vercel build --prod`)

- Data/hora: 2025-11-11 23:43 BRT
- CLI: Vercel 48.9.0
- Resultados principais:
  - `npm ci` + `vite build` concluídos (6037 módulos transformados)
  - `.vercel/output` gerado: builds.json lista 29 funções + bundle estático
  - Tempo total local ~27min (limitado pelo empacotamento em Windows; em Vercel Linux é menor)
- Observações:
  - `cross-env` adicionado para suportar `NODE_OPTIONS` no Windows.
  - Sem erros de runtime após remover o bloco `functions` do `vercel.json` (Node 20 padrão).
  - Chunks >1000kB permanecem; ver plano de code-splitting se necessário.

Use este commit apenas com arquivos em `docs/` para validar o `ignoreCommand` da Vercel.
