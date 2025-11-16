# Bundle Audit - Pós Otimizações de Login

Data: 2025-10-30

Este relatório resume tamanhos de chunks relevantes após otimizações (lazy-load, prefetch/modulepreload, imports adiados, supabase dinâmico).

## Principais chunks
- index.html: ~2.88 kB (gzip ~1.11 kB)
- CSS principal: ~191.09 kB (gzip ~26.85 kB)
- Entry app `index-*.js`: ~255.81 kB (gzip ~74.77 kB)
- React vendor: ~176.61 kB (gzip ~58.32 kB)
- Supabase SDK: ~146.77 kB (gzip ~39.32 kB)
- LoginPage: ~11.70 kB (gzip ~3.82 kB)
- SocialLoginButtons (lazy): ~2.65 kB (gzip ~1.35 kB)

## Observações
- `LoginPage` mantém tamanho baixo e carrega rapidamente; botões sociais carregam sob demanda.
- `supabase` passou a ser importado dinamicamente, reduzindo pressão no entry inicial.
- Prefetch/modulepreload dos chunks de auth em idle acelera navegações subsequentes.
- Imports não-críticos (SW, monitoring, preloading avançado) foram adiados para pós-render/idle.

## Próximos passos sugeridos
- Avaliar split do `react-vendor` com `manualChunks` para separar `react-router` e libs menores.
- Desacoplar funcionalidades pesadas do dashboard (charts, tiptap) para carregar sob demanda por tela.
- Habilitar brotli e cache estático de longo prazo em produção.
