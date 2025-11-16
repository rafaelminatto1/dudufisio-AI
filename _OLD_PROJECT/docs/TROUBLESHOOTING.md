# Troubleshooting de Ambiente

## Passos para configurar
- Copie `.env.example` para `.env.local`.
- Preencha obrigatórias: `VITE_SUPABASE_URL` (inclui `supabase.co`), `VITE_SUPABASE_ANON_KEY` (inicia com `eyJ`).
- Opcional: `VITE_GEMINI_API_KEY`, `VITE_SENTRY_DSN`, `VITE_APP_URL`.
- Não exponha segredos server-side com `VITE_`.

## Verificação
- Execute `node scripts/check-env.js` para validar e obter sugestões.

## Erros comuns
- Usar `NEXT_PUBLIC_*` em projeto Vite: troque por `VITE_*`.
- URLs inválidas: garanta protocolo e host válidos.
- Segredos no client: mova para variáveis sem `VITE_` e use no server.

## Referências
- `scripts/check-env.js`
- `types/env.d.ts`
- `vite.config.ts`
